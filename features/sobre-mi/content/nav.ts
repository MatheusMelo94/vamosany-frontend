import type { NavGroup } from "@/components/layout/nav-config";

/**
 * The navbar's "Sobre mí" group (DDR-0002; spec § Menu IA). Copy is the
 * spec's, verbatim. Consumed by components/layout/nav-config.ts, the single
 * source for the mega-menu and the drawer.
 */
export const SOBRE_MI_NAV: NavGroup = {
  label: "Sobre mí",
  columns: [
    {
      heading: "Vamos a New York",
      items: [
        {
          title: "Sobre mí",
          blurb: "Quién soy y por qué New York.",
          href: "/sobre-mi",
        },
        {
          title: "Colaboraciones",
          blurb: "Cuadernos, agendas, cases y totes.",
          href: "/colaboraciones",
        },
        {
          title: "Trabajá conmigo",
          blurb: "Marcas, guías, empresas y agencias.",
          href: "/trabaja-conmigo",
        },
      ],
    },
    {
      heading: "Ayuda",
      items: [
        { title: "Contacto", blurb: "Te respondo yo.", href: "/contacto" },
        {
          title: "FAQ",
          blurb: "Antes de viajar.",
          href: "/preguntas-frecuentes",
        },
      ],
    },
  ],
};
