import { BODIES } from "@/features/guias/content/guides/index";
import { GUIDES, getGuide } from "@/features/guias/content/guides";
import { GUIDE_SLUGS } from "@/features/guias/content/slugs";
import type { Block, Guide } from "@/features/guias/types";

/** Whole-registry assertions (GU-17; plan § 4, § 14; spec AC 15, 16, 18). */
const blocks = (g: Guide): Block[] => [
  ...g.intro,
  ...g.sections.flatMap((s) => s.blocks),
  ...(g.afterCta ?? []),
];
const slugsWith = (type: Block["type"]) =>
  GUIDES.filter((g) => blocks(g).some((b) => b.type === type)).map(
    (g) => g.slug,
  );
const total = (type: Block["type"]) =>
  GUIDES.reduce(
    (n, g) => n + blocks(g).filter((b) => b.type === type).length,
    0,
  );

describe("the guide registry", () => {
  it("has a body for every slug, checked at compile time (no optional access)", () => {
    // `BODIES[slug]` is non-optional once the record is complete: tsc fails otherwise.
    for (const slug of GUIDE_SLUGS) expect(BODIES[slug].sections).toBeDefined();
  });

  it("joins the 12 guides in menu order", () => {
    expect(GUIDES.map((g) => g.slug)).toEqual([...GUIDE_SLUGS]);
  });

  it("has a key-facts box on exactly 8 guides, 3 facts each, and none on the 4 Barrios (AC 16)", () => {
    const withFacts = GUIDES.filter((g) => g.keyFacts);
    expect(withFacts).toHaveLength(8);
    for (const g of withFacts) expect(g.keyFacts).toHaveLength(3);
    expect(GUIDES.filter((g) => !g.keyFacts).map((g) => g.slug)).toEqual([
      "west-village",
      "murray-hill",
      "financial-district",
      "williamsburg",
    ]);
  });

  it("has 2 callouts in total, both in the subte guide (AC 15)", () => {
    expect(total("tip")).toBe(2);
    expect(slugsWith("tip")).toEqual(["el-subte-explicado"]);
  });

  it("has a numbered list only in Visa (AC 15)", () => {
    expect(slugsWith("ol")).toEqual(["visa-a-estados-unidos"]);
  });

  it("has 2 small-print lines: Cuánto cuesta and Visa (AC 15)", () => {
    expect(total("fine")).toBe(2);
    expect(slugsWith("fine")).toEqual([
      "visa-a-estados-unidos",
      "cuanto-cuesta-un-dia-en-new-york",
    ]);
  });

  it("has afterCta only on Visa", () => {
    expect(GUIDES.filter((g) => g.afterCta).map((g) => g.slug)).toEqual([
      "visa-a-estados-unidos",
    ]);
  });

  it("has 11 'Quiero mi itinerario' bands and the Visa band (AC 15, 18)", () => {
    const standard = GUIDES.filter((g) => "lead" in g.cta);
    expect(standard).toHaveLength(11);
    for (const g of standard) expect(g.cta.label).toBe("Quiero mi itinerario");
    const visa = getGuide("visa-a-estados-unidos");
    expect(visa && "heading" in visa.cta && visa.cta.label).toBe(
      "Quiero gestionar mi visa",
    );
  });

  it("returns undefined for an unknown slug", () => {
    expect(getGuide("nope")).toBeUndefined();
  });
});
