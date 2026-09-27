import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import {
  classify,
  noise,
  noiseLengthFor,
  overAllowanceWindow,
  parseBytes,
} from "../first-load-selftest-lib.mjs";

/**
 * RV-0004: the self-test is calibrated against the clean build it measures,
 * never against the committed baseline (§ Performance Budgets).
 */

const limits = { baseline: 178_492, allowance: 1_000, budget: 180_000 };

describe("parseBytes", () => {
  it("reads the byte count from an OK or FAIL line", () => {
    expect(
      parseBytes(
        "First Load JS /: OK: 178492 B (178.49 kB), +0 B vs baseline 178492 B",
      ),
    ).toBe(178_492);
    expect(
      parseBytes(
        "First Load JS /: FAIL: 179700 B (179.70 kB) grew +1208 B vs baseline",
      ),
    ).toBe(179_700);
  });

  it("returns NaN when there is no byte count", () => {
    expect(parseBytes("build failed")).toBeNaN();
  });
});

describe("classify", () => {
  it("tells a pass, an allowance failure and a budget failure apart", () => {
    expect(classify("First Load JS /: OK: 178492 B (178.49 kB), +0 B")).toBe(
      "ok",
    );
    expect(
      classify(
        "First Load JS /: FAIL: 179700 B (179.70 kB) grew +1208 B vs baseline 178492 B, over the 1000 B runtime allowance",
      ),
    ).toBe("allowance");
    expect(
      classify(
        "First Load JS /: FAIL: 180400 B (180.40 kB) is over the 180.00 kB budget (+1908 B vs baseline 178492 B)",
      ),
    ).toBe("budget");
  });
});

describe("overAllowanceWindow", () => {
  it("at the current baseline: grow 1,001..1,508 B, aim at the middle", () => {
    expect(overAllowanceWindow({ ...limits, clean: 178_492 })).toEqual({
      min: 1_001,
      max: 1_508,
      target: 1_254,
    });
  });

  it("is relative to the measured clean build, not the baseline", () => {
    // The Engineer's layout measured +206 B, the Reviewer's −109 B.
    expect(overAllowanceWindow({ ...limits, clean: 178_698 })).toEqual({
      min: 795,
      max: 1_302,
      target: 1_048,
    });
    expect(overAllowanceWindow({ ...limits, clean: 178_383 })).toEqual({
      min: 1_110,
      max: 1_617,
      target: 1_363,
    });
  });

  it("refuses when no growth can fail the allowance without failing the budget", () => {
    expect(() =>
      overAllowanceWindow({ ...limits, budget: 179_400, clean: 178_492 }),
    ).toThrow(/no room/);
  });
});

describe("noiseLengthFor", () => {
  it("sizes incompressible filler to a gzipped growth within a few bytes", () => {
    for (const target of [800, 1_254, 1_500]) {
      const n = noiseLengthFor(target);
      const size = gzipSync(noise(n), { level: 9 }).length;
      expect(Math.abs(size - target)).toBeLessThanOrEqual(8);
    }
  });
});
