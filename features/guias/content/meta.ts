import type { GuideMeta } from "@/features/guias/types";

/**
 * The lean registry: every string that lists share (menu, cards, "Más de",
 * pager, dek, `<meta description>`). Imported by the navbar through
 * content/nav.ts, so it must stay free of the guide bodies (plan D-2). The
 * `bajada` lives only here; it is Belén's `**Bajada:**` line, verbatim.
 * Menu order; nothing sorts it.
 */
export const GUIDE_META: readonly GuideMeta[] = [
  {
    slug: "el-subte-explicado",
    group: "moverte-por-la-ciudad",
    menuTitle: "El subte, explicado",
    title: "El subte, explicado",
    bajada: "Leé el mapa como una local.",
  },
  {
    slug: "desde-el-aeropuerto",
    group: "moverte-por-la-ciudad",
    menuTitle: "Desde el aeropuerto",
    title: "Desde el aeropuerto",
    bajada: "JFK, Newark y LaGuardia comparados.",
  },
  {
    slug: "caminar-por-new-york",
    group: "moverte-por-la-ciudad",
    menuTitle: "Caminar por New York",
    title: "Caminar por New York",
    bajada: "Cómo entender la ciudad y recorrerla a pie.",
  },
  {
    slug: "como-moverte-por-new-york",
    group: "moverte-por-la-ciudad",
    menuTitle: "Cómo moverte por New York",
    title: "Cómo moverte por New York",
    bajada: "Subte, Uber, bus o a pie: cuándo conviene cada uno.",
  },
  {
    slug: "west-village",
    group: "barrios",
    menuTitle: "West Village",
    title: "West Village",
    bajada: "Calles arboladas, brownstones y cafés con encanto.",
  },
  {
    slug: "murray-hill",
    group: "barrios",
    menuTitle: "Murray Hill",
    title: "Murray Hill",
    bajada: "Tranquilo, céntrico y una gran base para alojarte.",
  },
  {
    slug: "financial-district",
    group: "barrios",
    menuTitle: "Financial District",
    title: "Financial District",
    bajada: "Wall Street, el Oculus y el Memorial del 11S.",
  },
  {
    slug: "williamsburg",
    group: "barrios",
    menuTitle: "Williamsburg",
    title: "Williamsburg",
    bajada: "El Brooklyn creativo, con el skyline de frente.",
  },
  {
    slug: "visa-a-estados-unidos",
    group: "antes-de-viajar",
    menuTitle: "Visa a Estados Unidos",
    title: "Visa o ESTA: qué necesitás para viajar a Estados Unidos",
    bajada: "El trámite, sin vueltas.",
  },
  {
    slug: "cuanto-cuesta-un-dia-en-new-york",
    group: "antes-de-viajar",
    menuTitle: "Cuánto cuesta un día en New York",
    title: "Cuánto cuesta un día en New York",
    bajada: "Para armar tu presupuesto.",
  },
  {
    slug: "que-llevar-segun-la-temporada",
    group: "antes-de-viajar",
    menuTitle: "Qué llevar según la temporada",
    title: "Qué llevar según la temporada",
    bajada: "Siempre hace más frío (o más calor) de lo que pensás.",
  },
  {
    slug: "entradas-para-broadway",
    group: "antes-de-viajar",
    menuTitle: "Entradas para Broadway",
    title: "Entradas para Broadway",
    bajada: "Dónde y cómo conseguirlas.",
  },
];
