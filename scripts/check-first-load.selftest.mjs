#!/usr/bin/env node
/**
 * Self-test for scripts/check-first-load.mjs (tasks T043; plan § 0.3 item 6;
 * RV-0004). Edits a string `/` renders in components/layout/nav-config.ts and
 * rebuilds. Every case is asserted against the clean build measured here,
 * never against the committed baseline (install layouts measure the same
 * commit differently):
 * - clean build → passes; its byte count is the reference C;
 * - one extra character (small growth) → passes within the runtime
 *   allowance, and the growth is reported (C < bytes ≤ C + 8; gzip turns
 *   one character into 1–2 bytes);
 * - incompressible filler sized so the build lands in
 *   (baseline + allowance, budget] → fails, on the allowance, not the budget.
 *   The size is estimated from standalone gzip, then corrected from the
 *   measured growth (up to 3 builds), since the chunk compresses it
 *   differently;
 * - the file is always restored (finally), then a rebuild passes at C.
 * Slow (four to six production builds); run on demand, not in the unit suite.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BUDGET_BYTES, readLimits } from "./check-first-load.mjs";
import {
  classify,
  noise,
  noiseLengthFor,
  overAllowanceWindow,
  parseBytes,
} from "./first-load-selftest-lib.mjs";

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
const { baseline, allowance } = readLimits(
  JSON.parse(readFileSync(path.join(root, "perf/first-load.json"), "utf8")),
  "/",
);

let failed = false;
/** One case: exit code, which path the guard took, and the bytes it reported. */
const expect = (label, result, { code, path: kind, bytes }) => {
  const got = parseBytes(result.out);
  const pass =
    result.code === code &&
    classify(result.out) === kind &&
    (bytes === undefined || bytes(got));
  failed ||= !pass;
  console.log(
    `${pass ? "PASS" : "FAIL"} ${label}: exit ${result.code} — ${result.out.trim()}`,
  );
  return got;
};

build();
const clean = expect("clean build (reference)", check(), {
  code: 0,
  path: "ok",
  bytes: Number.isFinite,
});
console.log(
  `  clean = ${clean} B (${clean - baseline >= 0 ? "+" : ""}${clean - baseline} B vs committed baseline ${baseline} B)`,
);
const room = overAllowanceWindow({
  clean,
  baseline,
  allowance,
  budget: BUDGET_BYTES,
});
const SMALL_GROWTH_MAX = 8;
try {
  writeFileSync(
    target,
    original.replace(needle, '"The greatest hits, walkable.x"'),
  );
  build();
  expect("+1 character (small growth, within the allowance)", check(), {
    code: 0,
    path: "ok",
    bytes: (b) => b > clean && b - clean <= SMALL_GROWTH_MAX,
  });
  let filler = noiseLengthFor(room.target);
  let result;
  for (let attempt = 1; attempt <= 3; attempt++) {
    writeFileSync(
      target,
      original.replace(
        needle,
        `"The greatest hits, walkable.${noise(filler)}"`,
      ),
    );
    build();
    result = check();
    const grew = parseBytes(result.out) - clean;
    if (grew >= room.min && grew <= room.max) break;
    console.log(
      `  calibrating: ${filler} characters grew +${grew} B, outside +${room.min}..+${room.max} B`,
    );
    filler = Math.max(
      1,
      Math.round((filler * room.target) / Math.max(1, grew)),
    );
  }
  expect(
    `+${filler} incompressible characters (over the allowance, within the budget: +${room.min}..+${room.max} B)`,
    result,
    {
      code: 1,
      path: "allowance",
      bytes: (b) => b - clean >= room.min && b - clean <= room.max,
    },
  );
} finally {
  writeFileSync(target, original);
}
build();
expect("reverted build", check(), {
  code: 0,
  path: "ok",
  bytes: (b) => b === clean,
});
process.exit(failed ? 1 : 0);
