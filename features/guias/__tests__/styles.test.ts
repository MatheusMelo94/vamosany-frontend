import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * CSS contract for the Guías pages in app/globals.css (plan D-9, accepted
 * 2026-11-02). Vitest runs with `css: false`, so the stylesheet is read as text.
 */
const css = readFileSync(
  path.resolve(__dirname, "../../../app/globals.css"),
  "utf8",
);

describe("structural widths for the Guías templates (plan D-9)", () => {
  const theme = css.slice(css.indexOf("@theme"), css.indexOf("@keyframes"));

  it.each([
    ["--container-guide-facts", "35.0625rem"],
    ["--container-guide-aside", "60.0625rem"],
    ["--container-guide-cards", "62.5625rem"],
  ])("declares %s: %s in @theme", (token, value) => {
    expect(theme).toContain(`${token}: ${value};`);
  });

  it("keeps the four Sobre mí widths untouched", () => {
    for (const declaration of [
      "--container-gutter: 53.75rem;",
      "--container-rows: 47.5rem;",
      "--container-fields: 35rem;",
      "--container-timeline-sm: 32.5rem;",
    ]) {
      expect(theme).toContain(declaration);
    }
  });
});

describe("the tall variant (sticky aside only on viewports >= 720px)", () => {
  it("is a min-height 45rem media query", () => {
    expect(css).toMatch(
      /@custom-variant tall \(@media \(min-height: 45rem\)\);/,
    );
  });
});

describe("the guide-list utility (yellow square marker)", () => {
  const block = /@utility guide-list \{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "";

  it("draws a 10px brand-yellow square with a 1.5px ink border from tokens", () => {
    expect(block).toContain("width: 0.625rem;");
    expect(block).toContain("height: 0.625rem;");
    expect(block).toContain("border: 1.5px solid var(--color-ink);");
    expect(block).toContain("background: var(--color-brand);");
  });

  it("removes the native marker", () => {
    expect(block).toContain("list-style: none;");
  });
});

describe("focus never lands under the floating navbar (WCAG 2.4.11; AC 39)", () => {
  const rule =
    /\[data-sm-scene="guias"\] :is\(a, button, summary\) \{([\s\S]*?)\}/.exec(
      css,
    )?.[1] ?? "";

  it("gives the Guías page's links, buttons and summaries a 7rem scroll margin", () => {
    expect(rule).toContain("scroll-margin-top: calc(var(--spacing) * 28);");
  });
});

describe("hover transitions use the motion token (RV-0044)", () => {
  it.each(["guide-card.tsx", "pager.tsx"])(
    "%s takes its duration from --duration-fast, not a magic number",
    (file) => {
      const source = readFileSync(
        path.resolve(__dirname, "../components", file),
        "utf8",
      );
      expect(source).toContain("duration-(--duration-fast)");
      expect(source).not.toMatch(/\bduration-\d+\b/);
    },
  );
});
