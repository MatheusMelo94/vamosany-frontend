import { elSubteExplicado } from "@/features/guias/content/guides/el-subte-explicado";
import type { GuideSlug } from "@/features/guias/content/slugs";
import type { GuideBody } from "@/features/guias/types";

/**
 * Guide bodies by slug, one module each (plan D-2). Partial while the guides
 * land one task at a time; GU-17 tightens it to `Record<GuideSlug,
 * GuideBody>` so a missing guide is a compile error.
 */
export const BODIES: Partial<Record<GuideSlug, GuideBody>> = {
  "el-subte-explicado": elSubteExplicado,
};
