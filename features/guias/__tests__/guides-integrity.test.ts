import { GUIDES } from "@/features/guias/content/guides";
import { GUIDE_SLUGS } from "@/features/guias/content/slugs";
import { guideHref } from "@/features/guias/content/queries";
import type { Block, GuideBody, Inline } from "@/features/guias/types";
import { slugify } from "@/lib/utils";
import { plainText } from "./support/plain-text";

/** Visa's H2s are long, so its ids are short and explicit (spec § Content Model rule 2). */
const VISA_IDS = [
  "visa",
  "esta",
  "la-diferencia-en-resumen",
  "no-sabes-cual-te-corresponde",
  "te-ayudo-con-tu-visa",
];

/** Explicit ids that are not slugify(h2): the fare-cap section is `#tope` (spec AC 26). */
const EXPLICIT_IDS: Record<string, string[]> = {
  "visa-a-estados-unidos": VISA_IDS,
  "el-subte-explicado": ["tope"],
};

function allInlines(body: GuideBody): Inline[] {
  const blocks: Block[] = [
    ...body.intro,
    ...body.sections.flatMap((s) => s.blocks),
    ...(body.afterCta ?? []),
  ];
  return blocks.flatMap((block) => {
    switch (block.type) {
      case "p":
      case "tip":
      case "fine":
        return block.text;
      case "ul":
      case "ol":
        return block.items.flat();
      case "h3":
        return [];
    }
  });
}

describe.each(GUIDES.map((g) => [g.slug, g] as const))(
  "integrity: %s",
  (_slug, guide) => {
    it("has unique section ids", () => {
      const ids = guide.sections.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("derives each id from the H2 text (slugify), except the explicit ids", () => {
      const explicit = EXPLICIT_IDS[guide.slug] ?? [];
      for (const section of guide.sections) {
        if (explicit.includes(section.id)) continue;
        expect(section.id).toBe(slugify(section.title));
      }
    });

    it("uses tocLabel only on 'El tope semanal (fare cap)'", () => {
      for (const section of guide.sections) {
        if (section.tocLabel !== undefined) {
          expect(section.title).toBe("El tope semanal (fare cap)");
          expect(section.tocLabel).toBe("El tope semanal");
        }
      }
    });

    it("each key fact's source occurs in the guide's text (AC 17)", () => {
      const text = plainText(guide);
      for (const fact of guide.keyFacts ?? []) {
        expect(text, fact.source).toContain(fact.source);
      }
    });

    it("every { guide } link resolves, and every href is https: or /guias/<slug> (G2)", () => {
      for (const inline of allInlines(guide)) {
        if (typeof inline === "string") continue;
        if ("guide" in inline) {
          expect(GUIDE_SLUGS).toContain(inline.guide);
          expect(guideHref(inline.guide)).toMatch(/^\/guias\/[a-z0-9-]+$/);
        }
        if ("href" in inline) expect(inline.href).toMatch(/^https:\/\/[^\s]+$/);
      }
    });
  },
);

describe("the href allowlist itself", () => {
  const ALLOWED = /^(https:\/\/[^\s]+|\/guias\/[a-z0-9-]+)$/;
  it("rejects dangerous or ambiguous schemes", () => {
    for (const bad of [
      "javascript:alert(1)",
      "http://example.com",
      "data:text/html,x",
      "//evil.example",
    ]) {
      expect(bad).not.toMatch(ALLOWED);
    }
  });
});
