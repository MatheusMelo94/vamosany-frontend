import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * CSS contract for the Sobre mí pages in app/globals.css (T006, plan § 7).
 * Vitest runs with `css: false`, so the stylesheet is checked as text.
 */
const css = readFileSync(
  path.resolve(__dirname, "../../../app/globals.css"),
  "utf8",
);

/** Top-level rules as [selector, body] pairs (no nesting needed for these checks). */
function rules(source: string): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  for (const m of source.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(re)) {
    out.push([(m[1] ?? "").trim(), (m[2] ?? "").trim()]);
  }
  return out;
}

describe("approved token additions (plan § 7, approved 2026-09-26)", () => {
  it.each([
    ["--container-gutter", "53.75rem"],
    ["--container-rows", "47.5rem"],
    ["--container-fields", "35rem"],
    ["--container-timeline-sm", "32.5rem"],
  ])("declares %s: %s in @theme", (token, value) => {
    const theme = css.slice(css.indexOf("@theme"), css.indexOf("@keyframes"));
    expect(theme).toContain(`${token}: ${value};`);
  });

  it("adds the body-prose utility at 17px / 1.7 in the body family", () => {
    const block = css.match(/@utility body-prose \{([^}]*)\}/)?.[1] ?? "";
    expect(block).toContain("font-family: var(--font-sans);");
    expect(block).toContain("font-size: 1.0625rem;");
    expect(block).toContain("line-height: 1.7;");
  });

  it("adds the display-pull utility for pull lines", () => {
    const block = css.match(/@utility display-pull \{([^}]*)\}/)?.[1] ?? "";
    expect(block).toContain("font-family: var(--font-display);");
    expect(block).toContain("font-weight: 700;");
    expect(block).toContain("font-size: clamp(1.375rem, 3.4cqi, 2rem);");
    expect(block).toContain("line-height: 1.2;");
    expect(block).toContain("letter-spacing: 0.02em;");
    expect(block).toContain("text-transform: uppercase;");
  });
});

describe("initial-state rules for [data-sm-*] (ADR-0002 condition 3)", () => {
  const smRules = rules(css).filter(([sel]) => sel.includes("[data-sm-"));

  const HIDING =
    /opacity:\s*0\b|--train:\s*100%|clip-path:\s*inset\(0 100% 0 0\)|scale[XY]\(0\)/;

  it("hides targets only under .gsap, scoped to a mounted motion scene", () => {
    const hiding = smRules.filter(([, body]) => HIDING.test(body));
    expect(hiding.length).toBeGreaterThan(0);
    for (const [selector] of hiding) {
      for (const part of selector.split(",")) {
        expect(part.trim()).toMatch(/^\.gsap \[data-sm-scene\] /);
      }
    }
  });

  it("parks the heading and sweep trains in the tunnel under motion", () => {
    const train = smRules.find(([, body]) => /--train:\s*100%/.test(body));
    expect(train?.[0]).toContain("[data-sm-train]");
    expect(train?.[0]).toContain("[data-sm-sweep]");
  });

  it("keeps the reading bar out of the layout unless motion is on", () => {
    const all = rules(css);
    const base = all.find(([sel]) => sel === "[data-reading-bar]");
    const gated = all.find(([sel]) => sel === ".gsap [data-reading-bar]");
    expect(base?.[1]).toContain("display: none");
    expect(gated?.[1]).toContain("display: block");
    expect(gated?.[1]).toContain("transform: scaleX(0)");
  });

  it("gives anchors a scroll margin that clears the sticky navbar", () => {
    const anchor = smRules.find(([sel]) => sel === "[data-sm-anchor]");
    expect(anchor?.[1]).toContain(
      "scroll-margin-top: calc(var(--spacing) * 24)",
    );
  });
});

describe("audience rows (T037, M5)", () => {
  it("hides each row's H2 and text under a mounted scene, so they can rise after the rule", () => {
    const hidden = rules(css).find(
      ([sel, body]) =>
        sel.includes("[data-sm-audience] > li > :not([data-sm-rule])") &&
        /opacity:\s*0/.test(body),
    );
    expect(hidden?.[0]).toContain(
      ".gsap [data-sm-scene] [data-sm-audience] > li > :not([data-sm-rule])",
    );
  });
});
