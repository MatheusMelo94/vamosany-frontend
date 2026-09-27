#!/usr/bin/env node
/**
 * Zero-growth guard for First Load JS (plan § 0.3; tasks T043).
 *
 * After `next build`, computes the gzip First Load JS of a route from the
 * build manifests — the root main files, every enclosing layout and the
 * page, JS only, each file once, gzip level 9 — and compares it with the
 * committed limits in perf/first-load.json and the 180 kB budget
 * (frontend-architecture-conventions § Performance Budgets). Next reports kB
 * as 1000 bytes, so the budget is 180,000 bytes.
 *
 * perf/first-load.json: { "<route>": { "baseline": <bytes>,
 * "runtimeAllowanceBytes": <bytes> } }. The allowance (plan § 0.3 item 6) is
 * the most `/` may grow over the committed baseline from webpack's shared
 * runtime (its chunk map) when lazy chunks are added elsewhere; it is not
 * room for application code.
 *
 * Usage: node scripts/check-first-load.mjs [route]   (default "/")
 * Exit 0 = within baseline and budget; 1 = growth or over budget.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

export const BUDGET_BYTES = 180_000;

/** @param {string} file */
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));

/**
 * "/(marketing)/(cuaderno)/sobre-mi/page" → "/sobre-mi"; "/(marketing)/page" → "/".
 * @param {string} key
 */
function routeOf(key) {
  const segments = key
    .replace(/\/page$/, "")
    .split("/")
    .filter((s) => s && !/^\(.*\)$/.test(s));
  return "/" + segments.join("/");
}

/**
 * JS files a first visit to `route` downloads, per the build manifests.
 * @param {string} nextDir path to `.next`
 * @param {string} route e.g. "/"
 * @returns {string[]}
 */
export function firstLoadFiles(nextDir, route) {
  const appPaths = readJson(
    path.join(nextDir, "server/app-paths-manifest.json"),
  );
  const pageKey = Object.keys(appPaths).find(
    (k) => k.endsWith("/page") && routeOf(k) === route,
  );
  if (!pageKey) throw new Error(`No page for route ${route} in this build`);

  const { pages } = readJson(path.join(nextDir, "app-build-manifest.json"));
  const { rootMainFiles = [] } = readJson(
    path.join(nextDir, "build-manifest.json"),
  );

  const parts = pageKey.split("/").slice(1, -1);
  const layoutKeys = ["/layout"];
  for (let i = 1; i <= parts.length; i++) {
    layoutKeys.push("/" + parts.slice(0, i).join("/") + "/layout");
  }

  const files = new Set(rootMainFiles);
  for (const key of [...layoutKeys, pageKey]) {
    for (const file of pages[key] ?? []) files.add(file);
  }
  return [...files].filter((f) => f.endsWith(".js"));
}

/**
 * @param {string} nextDir
 * @param {string} route
 * @returns {number} gzip bytes
 */
export function firstLoadBytes(nextDir, route) {
  return firstLoadFiles(nextDir, route).reduce(
    (sum, file) =>
      sum +
      gzipSync(readFileSync(path.join(nextDir, file)), { level: 9 }).length,
    0,
  );
}

/**
 * @param {Record<string, { baseline?: number, runtimeAllowanceBytes?: number }>} limits
 * @param {string} route
 * @returns {{ baseline: number, allowance: number }}
 */
export function readLimits(limits, route) {
  const entry = limits[route];
  if (!entry || typeof entry.baseline !== "number") {
    throw new Error(`No baseline for ${route} in perf/first-load.json`);
  }
  return {
    baseline: entry.baseline,
    allowance: entry.runtimeAllowanceBytes ?? 0,
  };
}

/**
 * @param {{ bytes: number, baseline: number, allowance?: number, budget?: number }} input
 * @returns {{ ok: boolean, message: string }}
 */
export function checkFirstLoad({
  bytes,
  baseline,
  allowance = 0,
  budget = BUDGET_BYTES,
}) {
  const kB = (/** @type {number} */ b) => `${(b / 1000).toFixed(2)} kB`;
  const growth = bytes - baseline;
  const growthText = `${growth >= 0 ? "+" : ""}${growth} B`;
  const vs = `vs baseline ${baseline} B`;
  if (bytes > budget) {
    return {
      ok: false,
      message: `FAIL: ${bytes} B (${kB(bytes)}) is over the ${kB(budget)} budget (${growthText} ${vs})`,
    };
  }
  if (growth > allowance) {
    return {
      ok: false,
      message: `FAIL: ${bytes} B (${kB(bytes)}) grew ${growthText} ${vs}, over the ${allowance} B runtime allowance`,
    };
  }
  return {
    ok: true,
    message: `OK: ${bytes} B (${kB(bytes)}), ${growthText} ${vs}: ${growthText} of the ${allowance} B runtime allowance, budget ${kB(budget)}`,
  };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const route = process.argv[2] ?? "/";
  let limits;
  try {
    limits = readLimits(
      readJson(path.join(root, "perf/first-load.json")),
      route,
    );
  } catch (error) {
    console.error(String(error instanceof Error ? error.message : error));
    process.exit(1);
  }
  const bytes = firstLoadBytes(path.join(root, ".next"), route);
  const result = checkFirstLoad({ bytes, ...limits });
  console.log(`First Load JS ${route}: ${result.message}`);
  process.exit(result.ok ? 0 : 1);
}
