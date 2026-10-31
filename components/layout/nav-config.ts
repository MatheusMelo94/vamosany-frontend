/**
 * Navbar information architecture: the single source for the desktop
 * mega-menu and the mobile drawer (one concern per file, split out of
 * navbar.tsx in T007).
 */
import { SOBRE_MI_NAV } from "@/features/sobre-mi/content/nav";

export type NavItem = {
  title: string;
  blurb: string;
  tag?: string;
  price?: string;
  href?: string;
};

export type NavColumn = { heading: string; items: NavItem[] };

export type NavGroup = { label: string; columns: NavColumn[] };

/** Language menu options, shared by the desktop menu and the drawer. */
export const LANGUAGES = [
  { code: "ES", label: "Español" },
  { code: "PT", label: "Português" },
  { code: "EN", label: "English" },
] as const;

export type Lang = (typeof LANGUAGES)[number]["code"];

export const NAV: NavGroup[] = [
  {
    label: "Guías",
    columns: [
      {
        heading: "Moverte por la ciudad",
        items: [
          {
            title: "El subte, explicado",
            blurb: "Leé el mapa como una local.",
          },
          {
            title: "Desde el aeropuerto",
            blurb: "JFK, Newark y LaGuardia comparados.",
          },
          { title: "Taxi, Uber o subte", blurb: "Cuándo conviene cada uno." },
          {
            title: "Cómo moverte por New York",
            blurb: "A pie, en subte, bus o ferry.",
          },
        ],
      },
      {
        heading: "Barrios",
        items: [
          {
            title: "West Village",
            blurb: "Calles arboladas, brownstones y cafés con encanto.",
          },
          {
            title: "Murray Hill",
            blurb: "Tranquilo, céntrico y una gran base para alojarte.",
          },
          {
            title: "Financial District",
            blurb: "Wall Street, el Oculus y el Memorial del 11S.",
          },
          {
            title: "Williamsburg",
            blurb: "El Brooklyn creativo, con el skyline de frente.",
          },
        ],
      },
      {
        heading: "Antes de viajar",
        items: [
          { title: "Visa a Estados Unidos", blurb: "El trámite, sin vueltas." },
          {
            title: "Cuánto cuesta un día en New York",
            blurb: "Para armar tu presupuesto.",
          },
          {
            title: "Qué llevar según la temporada",
            blurb: "Siempre hace más frío (o más calor) de lo que pensás.",
          },
          {
            title: "Entradas para Broadway",
            blurb: "Dónde y cómo conseguirlas.",
          },
        ],
      },
    ],
  },
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
    columns: [
      {
        heading: "Asesoramiento",
        items: [
          {
            title: "Consultoría de viaje",
            blurb: "Una hora por videollamada para darle forma a tu viaje.",
            price: "USD 150",
            href: "/#services",
          },
        ],
      },
      {
        heading: "A medida",
        items: [
          {
            title: "Itinerario personalizado",
            blurb:
              "Me contás cómo querés vivir New York y armo tu viaje día a día.",
            price: "Desde USD 160",
            tag: "El más completo",
            href: "/#services",
          },
        ],
      },
      {
        heading: "En grupo",
        items: [
          {
            title: "Viajes grupales",
            blurb:
              "Viajes temáticos con todo organizado y conmigo acompañándote.",
            price: "Reservá con USD 300",
            href: "/#services",
          },
        ],
      },
      {
        heading: "Trámites",
        items: [
          {
            title: "Visa de Estados Unidos",
            blurb: "Te acompaño en todo el trámite. Servicio para uruguayos.",
            price: "USD 70",
            href: "/#services",
          },
        ],
      },
    ],
  },
  SOBRE_MI_NAV,
];
