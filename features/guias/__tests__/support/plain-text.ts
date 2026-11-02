import { guideMeta } from "@/features/guias/content/queries";
import type { Block, GuideBody, Inline } from "@/features/guias/types";

/**
 * Plain-text projection of a guide, used by the fidelity and integrity
 * tests. Each block becomes one tagged "unit" (`TAG|text`), so a comparison
 * fails on a changed word and also on a block of the wrong kind:
 * H2, H3, P, LI (bulleted item), OL (numbered item), TIP, FINE, CTA (the
 * band's lead) and BTN (the button label).
 */

/** Collapses whitespace runs to one space and trims. */
export function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * With `emphasis`, `{ b }` renders as `**x**` and `{ i }` as `*x*`, the
 * canonical form the Doc's emphasis is reduced to (AC 27); without it, the
 * text a visitor reads, marker-free.
 */
export function inlineText(inlines: Inline[], emphasis = false): string {
  return inlines
    .map((node) => {
      if (typeof node === "string") return node;
      if ("b" in node) return emphasis ? `**${node.b}**` : node.b;
      if ("i" in node) return emphasis ? `*${node.i}*` : node.i;
      if ("guide" in node) return guideMeta(node.guide).menuTitle;
      return node.text;
    })
    .join("");
}

export function blockUnits(block: Block, emphasis = true): string[] {
  const text = (inlines: Inline[]) =>
    normalizeText(inlineText(inlines, emphasis));
  switch (block.type) {
    case "p":
      return [`P|${text(block.text)}`];
    case "h3":
      return [`H3|${normalizeText(block.text)}`];
    case "ul":
      return block.items.map((item) => `LI|${text(item)}`);
    case "ol":
      return block.items.map((item) => `OL|${text(item)}`);
    case "tip":
      return [`TIP|${text(block.text)}`];
    case "fine":
      return [`FINE|${text(block.text)}`];
  }
}

/** The guide body as the page renders it, in reading order. */
export function bodyUnits(body: GuideBody, emphasis = true): string[] {
  const blocks = (list: Block[]) =>
    list.flatMap((block) => blockUnits(block, emphasis));
  const units = blocks(body.intro);
  for (const section of body.sections) {
    units.push(`H2|${normalizeText(section.title)}`);
    units.push(...blocks(section.blocks));
  }
  if ("lead" in body.cta) {
    units.push(`CTA|${normalizeText(body.cta.lead)}`);
  } else {
    units.push(`H2|${normalizeText(body.cta.heading)}`);
    units.push(`P|${normalizeText(body.cta.body)}`);
  }
  units.push(`BTN|${normalizeText(body.cta.label)}`);
  units.push(...blocks(body.afterCta ?? []));
  return units;
}

/** The text a visitor reads, one line per block, tags dropped. */
export function plainText(body: GuideBody): string {
  return bodyUnits(body, false)
    .map((unit) => unit.slice(unit.indexOf("|") + 1))
    .join("\n");
}
