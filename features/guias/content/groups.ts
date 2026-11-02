import type { GuideGroup } from "@/features/guias/types";

/**
 * The three groups of the Guías home, in menu order. The anchor is the id of
 * the home stripe, so the guide breadcrumb can link to `/guias#<anchor>`.
 */
export const GROUPS: readonly GuideGroup[] = [
  {
    id: "moverte-por-la-ciudad",
    title: "Moverte por la ciudad",
    anchor: "moverte-por-la-ciudad",
    eyebrow: "01",
  },
  { id: "barrios", title: "Barrios", anchor: "barrios", eyebrow: "02" },
  {
    id: "antes-de-viajar",
    title: "Antes de viajar",
    anchor: "antes-de-viajar",
    eyebrow: "03",
  },
];
