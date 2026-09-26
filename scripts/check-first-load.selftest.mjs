#!/usr/bin/env node
/**
 * Self-test for scripts/check-first-load.mjs (tasks T043; plan § 0.3 item 6).
 * Edits a string `/` renders in components/layout/nav-config.ts and rebuilds:
 * - clean build → pass, +0 B;
 * - one extra character → still within the runtime allowance, so it passes,
 *   but the growth must be reported to the byte (+1 B);
 * - ~2,000 incompressible characters (> the 1,000 B allowance once gzipped,
 *   < the 180 kB budget, so the allowance path is the one that fails)
 *   → must fail;
 * - the file is always restored (finally), then a rebuild must pass at +0 B.
 * Slow (four production builds); run on demand, not in the unit suite.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "components/layout/nav-config.ts");
const needle = '"The greatest hits, walkable."';

const run = (cmd) => {
  try {
    const out = execSync(cmd, { cwd: root, stdio: "pipe" }).toString();
    return { code: 0, out };
  } catch (error) {
    return { code: error.status ?? 1, out: String(error.stdout ?? "") };
  }
};
const build = () => {
  const { code, out } = run("npm run build");
  if (code !== 0) throw new Error(`build failed:\n${out}`);
};
const check = () => run("node scripts/check-first-load.mjs /");

const original = readFileSync(target, "utf8");
if (!original.includes(needle))
  throw new Error(`${needle} not found in ${target}`);

let failed = false;
/** Deterministic, incompressible filler (xorshift over [a-z0-9]). */
function noise(length) {
  let x = 2463534242;
  let out = "";
  for (let i = 0; i < length; i++) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    out += "abcdefghijklmnopqrstuvwxyz0123456789"[(x >>> 0) % 36];
  }
  return out;
}

const expect = (label, result, code, pattern) => {
  const pass = result.code === code && (!pattern || pattern.test(result.out));
  failed ||= !pass;
  console.log(
    `${pass ? "PASS" : "FAIL"} ${label}: exit ${result.code} — ${result.out.trim()}`,
  );
};

build();
expect("clean build", check(), 0, /\+0 B of the/);
try {
  writeFileSync(
    target,
    original.replace(needle, '"The greatest hits, walkable.x"'),
  );
  build();
  expect(
    "+1 character (within the allowance, reported)",
    check(),
    0,
    /\+1 B of the/,
  );
  writeFileSync(
    target,
    original.replace(needle, `"The greatest hits, walkable.${noise(2000)}"`),
  );
  build();
  expect(
    "+2,000 incompressible characters (over the allowance)",
    check(),
    1,
    /over the \d+ B runtime allowance/,
  );
} finally {
  writeFileSync(target, original);
}
build();
expect("reverted build", check(), 0, /\+0 B of the/);
process.exit(failed ? 1 : 0);
