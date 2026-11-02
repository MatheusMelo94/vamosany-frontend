import type { Metadata } from "next";
import { HOME_INTRO } from "@/features/guias/content/home";
import { GUIDE_META } from "@/features/guias/content/meta";
import { GUIDE_PHOTOS, PHOTOS } from "@/features/guias/content/photos";

/** `<title>` suffix, as on the Sobre mí pages. */
const SUFFIX = "Vamos a NY";

/** `/guias` (spec § SEO metadata per page). */
export const homeMetadata: Metadata = {
  title: `Guías — ${SUFFIX}`,
  description: HOME_INTRO,
  alternates: { canonical: "/guias" },
  openGraph: {
    type: "website",
    locale: "es",
    title: `Guías — ${SUFFIX}`,
    description: HOME_INTRO,
  },
};

/**
 * `/guias/<slug>`: title, bajada as description, canonical, and Open Graph
 * `article` with the hero photo. The image path is relative; Next resolves it
 * against `metadataBase`. An unknown slug returns `{}` (the page 404s).
 */
export function guideMetadata(slug: string): Metadata {
  const meta = GUIDE_META.find((m) => m.slug === slug);
  if (!meta) return {};
  const title = `${meta.title} — ${SUFFIX}`;
  const photo = PHOTOS[GUIDE_PHOTOS[meta.slug].photo];
  return {
    title,
    description: meta.bajada,
    alternates: { canonical: `/guias/${meta.slug}` },
    openGraph: {
      type: "article",
      locale: "es",
      title,
      description: meta.bajada,
      images: [`/img/${photo.file}`],
    },
  };
}
