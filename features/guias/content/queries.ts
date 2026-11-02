import { GUIDE_META } from "@/features/guias/content/meta";
import type { GuideSlug } from "@/features/guias/content/slugs";
import type { GuideGroupId, GuideMeta } from "@/features/guias/types";

/**
 * Pure queries over the lean registry. Lean on purpose: the navbar reaches
 * this module, so it may import only `meta`, `slugs`, `groups` and types
 * (plan D-2; guarded by nav-weight.test.ts).
 */

export function guideMeta(slug: GuideSlug): GuideMeta {
  const meta = GUIDE_META.find((m) => m.slug === slug);
  if (!meta) throw new Error(`Unknown guide slug "${slug}"`);
  return meta;
}

export function guideHref(slug: GuideSlug): string {
  return `/guias/${slug}`;
}

/** The group's guides, in menu order. */
export function groupGuides(group: GuideGroupId): GuideMeta[] {
  return GUIDE_META.filter((m) => m.group === group);
}

/** The other guides of the slug's group, in menu order ("Más de <grupo>"). */
export function othersInGroup(slug: GuideSlug): GuideMeta[] {
  const { group } = guideMeta(slug);
  return groupGuides(group).filter((m) => m.slug !== slug);
}

/** The next guide in global menu order; none after the last (A-14). */
export function nextGuide(slug: GuideSlug): GuideMeta | undefined {
  const index = GUIDE_META.findIndex((m) => m.slug === slug);
  return GUIDE_META[index + 1];
}
