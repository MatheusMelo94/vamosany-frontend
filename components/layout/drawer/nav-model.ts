/**
 * Pure helpers the mobile drawer derives from `NAV` and the pathname
 * (plan § 1, § 3). No React, no DOM: everything here is derived, never a
 * second copy of the config (A§ State Management, "derive, don't copy").
 */
import type { NavGroup, NavItem } from "@/components/layout/nav-config";

/** Where an item without its own href points (the Services section). */
const FALLBACK_HREF = "/#services";

/** The header's scent line: the column headings joined with " · " (spec § Content & Copy). */
export function scentLine(group: NavGroup): string {
  return group.columns.map((column) => column.heading).join(" · ");
}

/**
 * An href marks the current page only when it equals the pathname
 * (DDR-0002/0003). A pathname never carries a fragment, so an in-page href
 * such as Services' `/#services` is never current (spec S5).
 */
export function isCurrentHref(
  href: string | undefined,
  pathname: string,
): boolean {
  return href !== undefined && !href.includes("#") && href === pathname;
}

/** True when one of the group's items is the current page. Never true for Services (`/#services`). */
export function groupHasCurrent(group: NavGroup, pathname: string): boolean {
  return group.columns.some((column) =>
    column.items.some((item) => isCurrentHref(item.href, pathname)),
  );
}

/** The group open on arrival: the one holding the current page (S5), else none (S2). */
export function defaultOpenGroup(
  nav: readonly NavGroup[],
  pathname: string,
): string | null {
  return nav.find((group) => groupHasCurrent(group, pathname))?.label ?? null;
}

export function itemHref(item: NavItem): string {
  return item.href ?? FALLBACK_HREF;
}

/**
 * Config invariant (spec § States Matrix › Empty): every group has ≥1 column
 * and every column ≥1 item. An empty group isn't a supported runtime state.
 */
export function assertNavConfig(nav: readonly NavGroup[]): void {
  for (const group of nav) {
    if (group.columns.length === 0)
      throw new Error(`Nav group "${group.label}" has no columns`);
    for (const column of group.columns) {
      if (column.items.length === 0)
        throw new Error(
          `Nav group "${group.label}" column "${column.heading}" has no items`,
        );
    }
  }
}
