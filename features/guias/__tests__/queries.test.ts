import {
  groupGuides,
  guideHref,
  guideMeta,
  nextGuide,
  othersInGroup,
} from "@/features/guias/content/queries";

describe("guide queries (pure, menu order)", () => {
  it("guideMeta returns the entry for a slug", () => {
    expect(guideMeta("west-village").menuTitle).toBe("West Village");
  });

  it("guideHref builds the route", () => {
    expect(guideHref("el-subte-explicado")).toBe("/guias/el-subte-explicado");
  });

  it("each group owns 4 guides (GU-01 AC)", () => {
    for (const id of [
      "moverte-por-la-ciudad",
      "barrios",
      "antes-de-viajar",
    ] as const) {
      expect(groupGuides(id)).toHaveLength(4);
    }
    expect(groupGuides("barrios").map((m) => m.slug)).toEqual([
      "west-village",
      "murray-hill",
      "financial-district",
      "williamsburg",
    ]);
  });

  describe("nextGuide is global menu order (AC 19, A-14)", () => {
    it.each([
      ["el-subte-explicado", "desde-el-aeropuerto"],
      ["williamsburg", "visa-a-estados-unidos"],
      ["que-llevar-segun-la-temporada", "entradas-para-broadway"],
    ] as const)("%s -> %s", (from, to) => {
      expect(nextGuide(from)?.slug).toBe(to);
    });

    it("the last guide has no next", () => {
      expect(nextGuide("entradas-para-broadway")).toBeUndefined();
    });
  });

  it("othersInGroup returns the 3 others in menu order (AC 21)", () => {
    expect(othersInGroup("murray-hill").map((m) => m.slug)).toEqual([
      "west-village",
      "financial-district",
      "williamsburg",
    ]);
    expect(othersInGroup("el-subte-explicado")).toHaveLength(3);
  });
});
