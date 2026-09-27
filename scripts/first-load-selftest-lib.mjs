/**
 * Pure helpers of scripts/check-first-load.selftest.mjs (RV-0004). The self-
 * test is calibrated against the clean build it measures, never against the
 * committed baseline: the same commit measures differently across install
 * layouts (+206 B / −109 B were seen), so "clean = baseline" is not a fact
 * the proof may rest on (frontend-architecture-conventions § Performance
 * Budgets).
 */
import { gzipSync } from "node:zlib";

/** Byte count from a check-first-load line ("OK: 178492 B …" / "FAIL: 179700 B …"). */
export function parseBytes(out) {
  const match = /(?:OK|FAIL): (\d+) B/.exec(out);
  return match ? Number(match[1]) : Number.NaN;
}

/** Which path a check-first-load line took: "ok", "allowance", "budget" or "unknown". */
export function classify(out) {
  if (/OK: \d+ B/.test(out)) return "ok";
  if (/over the [\d.]+ kB budget/.test(out)) return "budget";
  if (/over the \d+ B runtime allowance/.test(out)) return "allowance";
  return "unknown";
}

/**
 * Growth over the clean build that fails the runtime allowance while staying
 * within the budget: bytes in (baseline + allowance, budget]. Throws when
 * that window is empty (the clean build has no such headroom).
 */
export function overAllowanceWindow({ clean, baseline, allowance, budget }) {
  const min = baseline + allowance - clean + 1;
  const max = budget - clean;
  if (min > max) {
    throw new Error(
      `no room: clean ${clean} B leaves no growth over the ${allowance} B allowance within the ${budget} B budget`,
    );
  }
  return { min, max, target: Math.floor((min + max) / 2) };
}

/** Deterministic, incompressible filler (xorshift over [a-z0-9]). */
export function noise(length) {
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

/** Filler length whose gzipped size is closest to `targetBytes`. */
export function noiseLengthFor(targetBytes) {
  const size = (n) => gzipSync(noise(n), { level: 9 }).length;
  let lo = 0;
  let hi = Math.max(64, targetBytes * 4);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (size(mid) < targetBytes) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
