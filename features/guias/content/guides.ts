import { BODIES } from "@/features/guias/content/guides/index";
import { GUIDE_META } from "@/features/guias/content/meta";
import { GUIDE_PHOTOS } from "@/features/guias/content/photos";
import type { GuideSlug } from "@/features/guias/content/slugs";
import type { Guide } from "@/features/guias/types";

/**
 * Metadata ⨝ body ⨝ photo, in menu order (plan D-2). Server pages only: the
 * navbar must import `meta.ts`, never this module (it pulls every body).
 */
export const GUIDES: readonly Guide[] = GUIDE_META.map((meta) => ({
  ...meta,
  ...BODIES[meta.slug],
  photo: GUIDE_PHOTOS[meta.slug],
}));

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === (slug as GuideSlug));
}
