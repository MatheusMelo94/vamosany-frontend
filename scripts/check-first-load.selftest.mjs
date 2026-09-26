#!/usr/bin/env node
/**
 * Self-test for scripts/check-first-load.mjs (tasks T043): proves the guard
 * passes on a clean build and fails when ONE byte is added to a module that
 * `/` ships. It appends a character to a string `/` renders in
 * components/layout/nav-config.ts, rebuilds, expects the check to fail, and
 * always restores the file (then rebuilds and expects a pass again).
 * Slow (three production builds); run on demand, not in the unit suite.
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
const expect = (label, result, code) => {
  const pass = result.code === code;
  failed ||= !pass;
  console.log(
    `${pass ? "PASS" : "FAIL"} ${label}: exit ${result.code} — ${result.out.trim()}`,
  );
};

build();
expect("clean build", check(), 0);
try {
  writeFileSync(
    target,
    original.replace(needle, '"The greatest hits, walkable.x"'),
  );
  build();
  expect("+1 character in nav-config.ts", check(), 1);
} finally {
  writeFileSync(target, original);
}
build();
expect("reverted build", check(), 0);
process.exit(failed ? 1 : 0);
