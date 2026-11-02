/**
 * The 12 guides in menu order (spec § Routes). Menu order is the order of
 * every list and of the pager's "next guide"; nothing sorts it. Slugs are
 * Spanish, accent-free, lowercase and hyphenated (DDR-0012 § 1).
 */
export const GUIDE_SLUGS = [
  "el-subte-explicado",
  "desde-el-aeropuerto",
  "caminar-por-new-york",
  "como-moverte-por-new-york",
  "west-village",
  "murray-hill",
  "financial-district",
  "williamsburg",
  "visa-a-estados-unidos",
  "cuanto-cuesta-un-dia-en-new-york",
  "que-llevar-segun-la-temporada",
  "entradas-para-broadway",
] as const;

export type GuideSlug = (typeof GUIDE_SLUGS)[number];
