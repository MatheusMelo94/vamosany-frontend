"use client";

import type { JSX } from "react";
import dynamic from "next/dynamic";

/**
 * Loads the Guías motion controller after hydration, outside the page's First
 * Load JS (ssr: false needs a client component, hence this wrapper; same
 * pattern as CuadernoMotion). Imported only by the two Guías page components.
 */
const GuiasScrollEffects = dynamic(
  () =>
    import("@/features/guias/motion/guias-scroll-effects").then(
      (m) => m.GuiasScrollEffects,
    ),
  { ssr: false },
);

export function GuiasMotion(): JSX.Element {
  return <GuiasScrollEffects />;
}
