import { GUIDE_META } from "@/features/guias/content/meta";
import { GUIDE_SLUGS } from "@/features/guias/content/slugs";
import { sourceSection, sourceSections } from "./support/guide-source";

/** Spec § Routes: slug, group, menu title, page title. */
const ROUTES = [
  [
    "el-subte-explicado",
    "moverte-por-la-ciudad",
    "El subte, explicado",
    "El subte, explicado",
  ],
  [
    "desde-el-aeropuerto",
    "moverte-por-la-ciudad",
    "Desde el aeropuerto",
    "Desde el aeropuerto",
  ],
  [
    "caminar-por-new-york",
    "moverte-por-la-ciudad",
    "Caminar por New York",
    "Caminar por New York",
  ],
  [
    "como-moverte-por-new-york",
    "moverte-por-la-ciudad",
    "Cómo moverte por New York",
    "Cómo moverte por New York",
  ],
  ["west-village", "barrios", "West Village", "West Village"],
  ["murray-hill", "barrios", "Murray Hill", "Murray Hill"],
  ["financial-district", "barrios", "Financial District", "Financial District"],
  ["williamsburg", "barrios", "Williamsburg", "Williamsburg"],
  [
    "visa-a-estados-unidos",
    "antes-de-viajar",
    "Visa a Estados Unidos",
    "Visa o ESTA: qué necesitás para viajar a Estados Unidos",
  ],
  [
    "cuanto-cuesta-un-dia-en-new-york",
    "antes-de-viajar",
    "Cuánto cuesta un día en New York",
    "Cuánto cuesta un día en New York",
  ],
  [
    "que-llevar-segun-la-temporada",
    "antes-de-viajar",
    "Qué llevar según la temporada",
    "Qué llevar según la temporada",
  ],
  [
    "entradas-para-broadway",
    "antes-de-viajar",
    "Entradas para Broadway",
    "Entradas para Broadway",
  ],
] as const;

describe("GUIDE_META (spec § Routes)", () => {
  it("is in menu order, one entry per slug", () => {
    expect(GUIDE_META.map((m) => m.slug)).toEqual([...GUIDE_SLUGS]);
  });

  it.each(ROUTES)(
    "%s: group, menu title and page title",
    (slug, group, menuTitle, title) => {
      const meta = GUIDE_META.find((m) => m.slug === slug);
      expect(meta).toMatchObject({ group, menuTitle, title });
    },
  );

  it("Visa: the H1 differs from the menu title (AC 3)", () => {
    const visa = GUIDE_META.find((m) => m.slug === "visa-a-estados-unidos");
    expect(visa?.title).toBe(
      "Visa o ESTA: qué necesitás para viajar a Estados Unidos",
    );
    expect(visa?.menuTitle).toBe("Visa a Estados Unidos");
  });

  it("every other guide has the same menu title and page title", () => {
    for (const meta of GUIDE_META) {
      if (meta.slug === "visa-a-estados-unidos") continue;
      expect(meta.title).toBe(meta.menuTitle);
    }
  });

  it("each bajada equals the Doc's **Bajada:** line (AC 2, 5)", () => {
    for (const meta of GUIDE_META) {
      expect(meta.bajada, meta.slug).toBe(sourceSection(meta.title).bajada);
    }
  });

  it("the two changed menu blurbs are the Doc's bajadas (AC 5)", () => {
    const by = (slug: string) =>
      GUIDE_META.find((m) => m.slug === slug)?.bajada;
    expect(by("caminar-por-new-york")).toBe(
      "Cómo entender la ciudad y recorrerla a pie.",
    );
    expect(by("como-moverte-por-new-york")).toBe(
      "Subte, Uber, bus o a pie: cuándo conviene cada uno.",
    );
  });

  it("covers every guide section of the Doc, and only those", () => {
    expect(
      sourceSections()
        .map((s) => s.title)
        .sort(),
    ).toEqual(GUIDE_META.map((m) => m.title).sort());
  });
});
