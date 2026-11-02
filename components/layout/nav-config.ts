/**
 * Navbar information architecture: the single source for the desktop
 * mega-menu and the mobile drawer (one concern per file, split out of
 * navbar.tsx in T007).
 */
import { GUIAS_NAV } from "@/features/guias/content/nav";
import { SOBRE_MI_NAV } from "@/features/sobre-mi/content/nav";

export type NavItem = {
  title: string;
  blurb: string;
  tag?: string;
  price?: string;
  href?: string;
};

export type NavColumn = { heading: string; items: NavItem[] };

export type NavGroup = {
  label: string;
  columns: NavColumn[];
  /** Desktop panel shows each item as a bordered box of equal size with
   *  "Ver detalles" at its foot (Servicios, DDR-0010). */
  cards?: boolean;
};

/** Language menu options, shared by the desktop menu and the drawer. */
export const LANGUAGES = [
  { code: "ES", label: "Español" },
  { code: "PT", label: "Português" },
  { code: "EN", label: "English" },
] as const;

export type Lang = (typeof LANGUAGES)[number]["code"];

export const NAV: NavGroup[] = [
  GUIAS_NAV,
  {
    label: "Blog",
    columns: [
      {
        heading: "Categorías",
        items: [
          { title: "Dónde comer", blurb: "Lugares a los que vuelvo." },
          { title: "Cine y series", blurb: "La ciudad de la pantalla." },
          { title: "Tips prácticos", blurb: "Para aprovechar cada día." },
          { title: "Barrios", blurb: "Rincones de cada zona." },
        ],
      },
    ],
  },
  {
    label: "Servicios",
    // Same pieces in every box, short enough for one line each, so the four
    // boxes match in size at every desktop width (DDR-0010). Prices and the
    // "El más completo" tag live on the landing's cards only.
    cards: true,
    columns: [
      {
        heading: "Asesoramiento",
        items: [
          {
            title: "Consultoría",
            blurb: "1 hora por videollamada.",
            href: "/#services",
          },
        ],
      },
      {
        heading: "A medida",
        items: [
          {
            title: "Itinerario",
            blurb: "Tu viaje, día a día.",
            href: "/#services",
          },
        ],
      },
      {
        heading: "En grupo",
        items: [
          {
            title: "Viaje grupal",
            blurb: "New York conmigo.",
            href: "/#services",
          },
        ],
      },
      {
        heading: "Trámites",
        items: [
          {
            title: "Visa EE.\u00a0UU.",
            blurb: "El trámite, paso a paso.",
            href: "/#services",
          },
        ],
      },
    ],
  },
  SOBRE_MI_NAV,
];
