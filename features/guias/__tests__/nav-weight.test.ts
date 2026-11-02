import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Plan D-2, § 13: the navbar is a client component in First Load JS, so what
 * it imports must stay lean. The menu data may reach the lean registry
 * (meta, queries, groups, slugs, types) but never the guide bodies or the
 * photo registry (≈60 kB of text and strings).
 */
const ROOT = path.resolve(__dirname, "../../..");

function importsOf(file: string): string[] {
  const source = readFileSync(path.join(ROOT, file), "utf8");
  return [...source.matchAll(/^import[^"']*from\s+["']([^"']+)["']/gm)].map(
    (m) => m[1] as string,
  );
}

function resolve(specifier: string): string | null {
  if (!specifier.startsWith("@/")) return null;
  return specifier.slice(2) + ".ts";
}

/** Every `features/guias` module reachable from `entry`, following value and type imports. */
function reachable(entry: string): Set<string> {
  const seen = new Set<string>();
  const visit = (file: string) => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const specifier of importsOf(file)) {
      const next = resolve(specifier);
      if (next?.startsWith("features/guias/")) visit(next);
    }
  };
  visit(entry);
  return seen;
}

describe("the Guías menu data stays lean (plan D-2)", () => {
  const graph = reachable("features/guias/content/nav.ts");

  it("reaches only nav, meta, queries, groups, slugs and types", () => {
    expect([...graph].sort()).toEqual(
      [
        "features/guias/content/groups.ts",
        "features/guias/content/meta.ts",
        "features/guias/content/nav.ts",
        "features/guias/content/queries.ts",
        "features/guias/content/slugs.ts",
        "features/guias/types.ts",
      ].sort(),
    );
  });

  it("never reaches the guide bodies, the join or the photo registry", () => {
    for (const file of graph) {
      expect(file).not.toMatch(/guides|photos|metadata|toc/);
    }
  });

  it("is what nav-config imports, with the old literal gone", () => {
    const config = readFileSync(
      path.join(ROOT, "components/layout/nav-config.ts"),
      "utf8",
    );
    expect(config).toContain('from "@/features/guias/content/nav"');
    expect(config).not.toContain("Taxi, Uber o subte");
    expect(config).not.toContain("@/features/guias/content/guides");
    expect(config).not.toContain("@/features/guias/content/photos");
  });
});
