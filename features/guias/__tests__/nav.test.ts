import { GUIAS_NAV } from "@/features/guias/content/nav";
import { GUIDE_META } from "@/features/guias/content/meta";

/** Spec § Routes and § Menu changes (DDR-0012 § 2); AC 4, 5. */
describe("GUIAS_NAV", () => {
  it("is the 'Guías' group with the three columns of the home", () => {
    expect(GUIAS_NAV.label).toBe("Guías");
    expect(GUIAS_NAV.columns.map((c) => c.heading)).toEqual([
      "Moverte por la ciudad",
      "Barrios",
      "Antes de viajar",
    ]);
    for (const column of GUIAS_NAV.columns)
      expect(column.items).toHaveLength(4);
  });

  it("lists the 12 items with the menu title, the bajada and a real href (AC 4)", () => {
    const items = GUIAS_NAV.columns.flatMap((c) => c.items);
    expect(items).toHaveLength(12);
    expect(items.map((i) => [i.title, i.blurb, i.href])).toEqual(
      GUIDE_META.map((m) => [m.menuTitle, m.bajada, `/guias/${m.slug}`]),
    );
  });

  it("swaps item 3 of 'Moverte por la ciudad' and updates item 4's blurb (AC 5)", () => {
    const column = GUIAS_NAV.columns[0];
    expect(column?.items[2]).toEqual({
      title: "Caminar por New York",
      blurb: "Cómo entender la ciudad y recorrerla a pie.",
      href: "/guias/caminar-por-new-york",
    });
    expect(column?.items[3]).toEqual({
      title: "Cómo moverte por New York",
      blurb: "Subte, Uber, bus o a pie: cuándo conviene cada uno.",
      href: "/guias/como-moverte-por-new-york",
    });
  });

  it("shows the Visa guide by its menu title, not the long page title (AC 3)", () => {
    const titles = GUIAS_NAV.columns.flatMap((c) =>
      c.items.map((i) => i.title),
    );
    expect(titles).toContain("Visa a Estados Unidos");
    expect(titles.join("|")).not.toContain("Visa o ESTA");
  });

  it('ends with the "Todas las guías" row to /guias (DDR-0013)', () => {
    expect(GUIAS_NAV.footerLink).toEqual({
      label: "Todas las guías",
      href: "/guias",
    });
  });
});
