import type { NavGroup } from "@/components/layout/nav-config";
import { GROUPS } from "@/features/guias/content/groups";
import { guideHref, groupGuides } from "@/features/guias/content/queries";

/**
 * The navbar's "Guías" group (DDR-0012 § 2): three columns of four, built from
 * the lean registry so a title or bajada changes the menu, the cards, "Más
 * de" and the dek at once (spec AC 2). Consumed by components/layout/
 * nav-config.ts, the single source for the mega-menu and the drawer.
 *
 * Keep the imports lean (plan D-2): the navbar is in First Load JS, so this
 * module may reach `meta`, `queries`, `groups`, `slugs` and types only
 * (guarded by nav-weight.test.ts).
 */
export const GUIAS_NAV: NavGroup = {
  label: "Guías",
  columns: GROUPS.map((group) => ({
    heading: group.title,
    items: groupGuides(group.id).map((meta) => ({
      title: meta.menuTitle,
      blurb: meta.bajada,
      href: guideHref(meta.slug),
    })),
  })),
  // DDR-0013: the front door of /guias, at the foot of the panel and the drawer group.
  footerLink: { label: "Todas las guías", href: "/guias" },
};
