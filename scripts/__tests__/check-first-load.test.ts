import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";
import {
  BUDGET_BYTES,
  checkFirstLoad,
  firstLoadBytes,
  firstLoadFiles,
  readLimits,
} from "../check-first-load.mjs";

/** A minimal `.next` with the three manifests the script reads. */
function fixture(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "first-load-"));
  const write = (file: string, content: string) => {
    mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    writeFileSync(path.join(dir, file), content);
  };
  write(
    "build-manifest.json",
    JSON.stringify({ rootMainFiles: ["static/chunks/main.js"] }),
  );
  write(
    "app-build-manifest.json",
    JSON.stringify({
      pages: {
        "/layout": ["static/chunks/main.js", "static/chunks/layout.js"],
        "/(marketing)/page": [
          "static/chunks/main.js",
          "static/chunks/page.js",
          "static/css/x.css",
        ],
        "/(marketing)/(cuaderno)/layout": ["static/chunks/cuaderno.js"],
        "/(marketing)/(cuaderno)/sobre-mi/page": ["static/chunks/sm.js"],
      },
    }),
  );
  write(
    "server/app-paths-manifest.json",
    JSON.stringify({
      "/(marketing)/page": "app/(marketing)/page.js",
      "/(marketing)/(cuaderno)/sobre-mi/page":
        "app/(marketing)/(cuaderno)/sobre-mi/page.js",
    }),
  );
  for (const [name, body] of [
    ["main", "a".repeat(500)],
    ["layout", "layout();"],
    ["page", "page(" + "x".repeat(300) + ");"],
    ["cuaderno", "cuaderno();"],
    ["sm", "sm();"],
  ]) {
    write(`static/chunks/${name}.js`, body as string);
  }
  write("static/css/x.css", "body{}");
  return dir;
}

const gz = (s: string) => gzipSync(s, { level: 9 }).length;

describe("firstLoadFiles", () => {
  it("unions root main files, every enclosing layout and the page, JS only, deduped", () => {
    const dir = fixture();
    expect(firstLoadFiles(dir, "/").sort()).toEqual(
      [
        "static/chunks/layout.js",
        "static/chunks/main.js",
        "static/chunks/page.js",
      ].sort(),
    );
    expect(firstLoadFiles(dir, "/sobre-mi").sort()).toEqual(
      [
        "static/chunks/cuaderno.js",
        "static/chunks/layout.js",
        "static/chunks/main.js",
        "static/chunks/sm.js",
      ].sort(),
    );
  });

  it("throws for a route the build doesn't have", () => {
    expect(() => firstLoadFiles(fixture(), "/nope")).toThrow(/\/nope/);
  });
});

describe("firstLoadBytes", () => {
  it("sums the gzip (level 9) size of each file once", () => {
    const expected =
      gz("a".repeat(500)) +
      gz("layout();") +
      gz("page(" + "x".repeat(300) + ");");
    expect(firstLoadBytes(fixture(), "/")).toBe(expected);
  });
});

describe("checkFirstLoad (plan § 0.3 item 6: runtime allowance)", () => {
  it("uses Next's decimal kB: the 180 kB budget is 180,000 bytes", () => {
    expect(BUDGET_BYTES).toBe(180_000);
  });

  it("passes at the baseline and reports the growth against the allowance", () => {
    const result = checkFirstLoad({
      bytes: 1000,
      baseline: 1000,
      allowance: 100,
    });
    expect(result.ok).toBe(true);
    expect(result.message).toMatch(/\+0 B of the 100 B runtime allowance/);
  });

  it("passes growth within the allowance, and says how much of it is used", () => {
    const result = checkFirstLoad({
      bytes: 1100,
      baseline: 1000,
      allowance: 100,
    });
    expect(result.ok).toBe(true);
    expect(result.message).toMatch(/\+100 B of the 100 B runtime allowance/);
  });

  it("fails one byte past the allowance", () => {
    const result = checkFirstLoad({
      bytes: 1101,
      baseline: 1000,
      allowance: 100,
    });
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/\+101 B.*over the 100 B runtime allowance/);
  });

  it("with no allowance, fails on a single byte of growth", () => {
    const result = checkFirstLoad({ bytes: 1001, baseline: 1000 });
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/\+1 B/);
  });

  it("fails above the 180 kB budget even within the allowance", () => {
    const result = checkFirstLoad({
      bytes: 180_001,
      baseline: 179_900,
      allowance: 1000,
    });
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/180/);
  });
});

describe("readLimits (perf/first-load.json)", () => {
  it("reads a route's baseline and its named runtime allowance", () => {
    expect(
      readLimits(
        { "/": { baseline: 178492, runtimeAllowanceBytes: 1000 } },
        "/",
      ),
    ).toEqual({ baseline: 178492, allowance: 1000 });
  });

  it("defaults the allowance to 0 and rejects a route without a baseline", () => {
    expect(readLimits({ "/x": { baseline: 5 } }, "/x")).toEqual({
      baseline: 5,
      allowance: 0,
    });
    expect(() => readLimits({}, "/")).toThrow(/No baseline for \//);
  });

  it("matches the committed file: baseline 178492, allowance 1000", async () => {
    const { readFileSync } = await import("node:fs");
    const file = JSON.parse(
      readFileSync(
        path.resolve(__dirname, "../../perf/first-load.json"),
        "utf8",
      ),
    );
    expect(readLimits(file, "/")).toEqual({
      baseline: 178492,
      allowance: 1000,
    });
  });
});
