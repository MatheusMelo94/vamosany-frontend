import { GUIDE_SLUGS } from "@/features/guias/content/slugs";
import { GROUPS } from "@/features/guias/content/groups";

describe("GUIDE_SLUGS (menu order, spec § Routes)", () => {
  it("lists the 12 guides in menu order", () => {
    expect([...GUIDE_SLUGS]).toEqual([
      "el-subte-explicado",
      "desde-el-aeropuerto",
      "caminar-por-new-york",
      "como-moverte-por-new-york",
      "west-village",
      "murray-hill",
      "financial-district",
      "williamsburg",
      "visa-a-estados-unidos",
      "cuanto-cuesta-un-dia-en-new-york",
      "que-llevar-segun-la-temporada",
      "entradas-para-broadway",
    ]);
  });

  it("uses accent-free lowercase hyphenated slugs, all unique", () => {
    for (const slug of GUIDE_SLUGS) expect(slug).toMatch(/^[a-z0-9-]+$/);
    expect(new Set(GUIDE_SLUGS).size).toBe(GUIDE_SLUGS.length);
  });
});

describe("GROUPS (spec § Page Structure, AC 9, 13)", () => {
  it("has the three groups, in menu order, with numbered eyebrows", () => {
    expect(
      GROUPS.map(({ id, title, anchor, eyebrow }) => ({
        id,
        title,
        anchor,
        eyebrow,
      })),
    ).toEqual([
      {
        id: "moverte-por-la-ciudad",
        title: "Moverte por la ciudad",
        anchor: "moverte-por-la-ciudad",
        eyebrow: "01",
      },
      { id: "barrios", title: "Barrios", anchor: "barrios", eyebrow: "02" },
      {
        id: "antes-de-viajar",
        title: "Antes de viajar",
        anchor: "antes-de-viajar",
        eyebrow: "03",
      },
    ]);
  });
});
