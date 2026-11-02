import { HOME_INTRO } from "@/features/guias/content/home";
import { guideMetadata, homeMetadata } from "@/features/guias/content/metadata";
import { GUIDE_SLUGS } from "@/features/guias/content/slugs";
import { GUIDE_PHOTOS, PHOTOS } from "@/features/guias/content/photos";
import { GUIDE_META } from "@/features/guias/content/meta";

/** Spec § SEO metadata per page; AC 33. */
describe("homeMetadata", () => {
  it("uses the title, the intro as description and the /guias canonical", () => {
    expect(homeMetadata).toMatchObject({
      title: "Guías — Vamos a NY",
      description: HOME_INTRO,
      alternates: { canonical: "/guias" },
    });
    expect(HOME_INTRO).toBe(
      "Lo que aprendí en más de 20 visitas, ordenado para que lo encuentres rápido: cómo moverte, en qué barrio quedarte y qué resolver antes de viajar.",
    );
  });

  it("is a website in Spanish for Open Graph", () => {
    expect(homeMetadata.openGraph).toMatchObject({
      type: "website",
      locale: "es",
    });
  });
});

describe("guideMetadata", () => {
  it.each(GUIDE_META.map((m) => [m.slug, m] as const))(
    "%s: title, bajada, canonical and article Open Graph with the hero",
    (slug, meta) => {
      const metadata = guideMetadata(slug);
      expect(metadata).toMatchObject({
        title: `${meta.title} — Vamos a NY`,
        description: meta.bajada,
        alternates: { canonical: `/guias/${slug}` },
        openGraph: {
          type: "article",
          locale: "es",
          title: `${meta.title} — Vamos a NY`,
          description: meta.bajada,
        },
      });
      const file = PHOTOS[GUIDE_PHOTOS[slug].photo].file;
      expect(metadata.openGraph?.images).toEqual([`/img/${file}`]);
    },
  );

  it("Visa's <title> uses the long page title (spec § SEO notes)", () => {
    expect(guideMetadata("visa-a-estados-unidos").title).toBe(
      "Visa o ESTA: qué necesitás para viajar a Estados Unidos — Vamos a NY",
    );
  });

  it("returns an empty object for an unknown slug, without throwing (the page 404s)", () => {
    expect(guideMetadata("nope")).toEqual({});
  });

  it("covers every slug", () => {
    for (const slug of GUIDE_SLUGS) {
      expect(guideMetadata(slug).title).toBeDefined();
    }
  });
});
