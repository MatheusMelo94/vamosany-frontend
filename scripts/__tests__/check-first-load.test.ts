import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";
import {
  BUDGET_BYTES,
  checkFirstLoad,
  firstLoadBytes,
  firstLoadFiles,
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

describe("checkFirstLoad", () => {
  it("uses Next's decimal kB: the 180 kB budget is 180,000 bytes", () => {
    expect(BUDGET_BYTES).toBe(180_000);
  });

  it("passes at or below the baseline", () => {
    expect(checkFirstLoad({ bytes: 1000, baseline: 1000 }).ok).toBe(true);
    expect(checkFirstLoad({ bytes: 999, baseline: 1000 }).ok).toBe(true);
  });

  it("fails on a single byte of growth, and says by how much", () => {
    const result = checkFirstLoad({ bytes: 1001, baseline: 1000 });
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/\+1 B/);
  });

  it("fails above the 180 kB budget even without a baseline change", () => {
    const result = checkFirstLoad({ bytes: 180_001, baseline: 190_000 });
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/180/);
  });
});
