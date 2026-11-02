import type { GuideSlug } from "@/features/guias/content/slugs";
import type { GuidePhoto, Photo } from "@/features/guias/types";

/**
 * Every photo the Guías use, declared once (spec § Photos, plan D-7). To
 * replace a photo, edit its entry here and nothing else. The Wikimedia
 * subject, author and license are the strings the footer's "Créditos de
 * fotografía" list shows (photos.test.tsx enforces it, plan D-8); the
 * footer itself is frozen (ADR-0006). `public/img/CREDITS.json` is read by
 * that test only, never at runtime.
 */
export const PHOTOS = {
  "how-subway": {
    file: "how-subway.webp",
    subject: "Subte de Union Square",
    author: "TLK in 3",
    license: "CC BY-SA 3.0",
    kind: "wikimedia",
  },
  "quote-street": {
    file: "quote-street.webp",
    subject: "Taxi amarillo después de la nieve",
    author: "Corentin Villemeur",
    license: "CC BY-SA 4.0",
    kind: "wikimedia",
  },
  "trip-high-line": {
    file: "trip-high-line.webp",
    subject: "The High Line",
    author: "King of Hearts",
    license: "CC BY-SA 4.0",
    kind: "wikimedia",
  },
  "post-dumbo": {
    file: "post-dumbo.webp",
    subject: "Puente de Brooklyn al atardecer",
    author: "MusikAnimal",
    license: "CC BY-SA 4.0",
    kind: "wikimedia",
  },
  "trip-soho": {
    file: "trip-soho.webp",
    subject: "451 Broome Street, SoHo",
    author: "Axel Tschentscher",
    license: "CC BY-SA 4.0",
    kind: "wikimedia",
  },
  "trip-grand-central": {
    file: "trip-grand-central.webp",
    subject: "Grand Central Terminal",
    author: "Diliff",
    license: "CC BY 2.5",
    kind: "wikimedia",
  },
  "band-bridges": {
    file: "band-bridges.webp",
    subject: "Puentes de Brooklyn, Manhattan y Williamsburg",
    author: "Axel Tschentscher",
    license: "CC BY-SA 4.0",
    kind: "wikimedia",
  },
  "trip-chinatown": {
    file: "trip-chinatown.webp",
    subject: "Chinatown, Manhattan",
    author: "Derek Jensen",
    license: "Dominio público",
    kind: "wikimedia",
  },
  "trip-central-park": {
    file: "trip-central-park.webp",
    subject: "Central Park en otoño",
    author: "Ed Yourdon",
    license: "CC BY-SA 2.0",
    kind: "wikimedia",
  },
  "ring-vamosany3": {
    file: "ring/vamosany3.webp",
    subject: "Vamos a NY",
    author: "Vamos a NY",
    license: "",
    kind: "brand",
  },
  "ring-vamosany6": {
    file: "ring/vamosany6.webp",
    subject: "Vamos a NY",
    author: "Vamos a NY",
    license: "",
    kind: "brand",
  },
} as const satisfies Record<string, Photo>;

export type PhotoId = keyof typeof PHOTOS;

/** The photo each guide uses (spec § Photos): which one, its alt, its focal point. */
export const GUIDE_PHOTOS: Record<GuideSlug, GuidePhoto & { photo: PhotoId }> =
  {
    "el-subte-explicado": {
      photo: "how-subway",
      focal: "50% 45%",
      alt: "Andén de la estación 14th Street del subte, con un tren de la línea L detenido y un cartel que anuncia el próximo tren a Brooklyn en 5 minutos.",
    },
    "desde-el-aeropuerto": {
      photo: "quote-street",
      focal: "50% 45%",
      alt: "Vista desde lo alto de una calle nevada de Manhattan, con un taxi amarillo cruzando entre los edificios.",
    },
    "caminar-por-new-york": {
      photo: "trip-high-line",
      focal: "50% 55%",
      alt: "Calle de Manhattan vista desde el High Line al atardecer, con edificios de ladrillo, un bus articulado y un taxi amarillo.",
    },
    "como-moverte-por-new-york": {
      photo: "post-dumbo",
      focal: "50% 60%",
      alt: "Una lancha azul y blanca de la policía de New York navega frente al puente de Brooklyn al atardecer.",
    },
    "west-village": {
      photo: "trip-soho",
      focal: "50% 40%",
      alt: "Edificios de fundición con escaleras de incendio en una esquina de SoHo, bajo un farol y un cartel de Greene Street.",
    },
    "murray-hill": {
      photo: "trip-grand-central",
      focal: "50% 40%",
      alt: "El gran salón de Grand Central Terminal, con ventanales altos, una bandera de Estados Unidos y gente caminando.",
    },
    "financial-district": {
      photo: "band-bridges",
      focal: "85% 50%",
      alt: "El puente de Brooklyn, con su torre de piedra, y detrás el de Manhattan, sobre el East River con el cielo despejado.",
    },
    williamsburg: {
      photo: "band-bridges",
      focal: "45% 50%",
      alt: "Los puentes de Brooklyn y de Manhattan sobre el East River y, al fondo, el de Williamsburg, con los edificios de la orilla.",
    },
    "visa-a-estados-unidos": {
      photo: "ring-vamosany6",
      focal: "50% 55%",
      alt: "Un grupo de mujeres sonríe detrás de las letras gigantes «Chau» en un aeropuerto, frente a un mural que dice «Buen viaje».",
    },
    "cuanto-cuesta-un-dia-en-new-york": {
      photo: "trip-chinatown",
      focal: "50% 55%",
      alt: "Una calle comercial de Chinatown, en Manhattan, con carteles, faroles rojos y gente caminando por la vereda.",
    },
    "que-llevar-segun-la-temporada": {
      photo: "trip-central-park",
      focal: "50% 50%",
      alt: "Árboles de hojas amarillas y verdes en Central Park, junto a un lago, con edificios de Manhattan detrás.",
    },
    "entradas-para-broadway": {
      photo: "ring-vamosany3",
      focal: "50% 50%",
      alt: "Un grupo de mujeres abrigadas posa de noche frente a las pantallas luminosas de Times Square.",
    },
  };

/** The visible credit under a hero: "Foto: <Subject> — <Author>, <License>" or "Foto: Vamos a NY" (AC 14). */
export function creditLine(slug: GuideSlug): string {
  const photo: Photo = PHOTOS[GUIDE_PHOTOS[slug].photo];
  if (photo.kind === "brand") return "Foto: Vamos a NY";
  return `Foto: ${photo.subject} — ${photo.author}, ${photo.license}`;
}
