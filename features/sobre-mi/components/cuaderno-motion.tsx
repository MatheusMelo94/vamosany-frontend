"use client";

import type { JSX } from "react";
import dynamic from "next/dynamic";

/**
 * Loads the Sobre mí motion controller after hydration, outside the page's
 * First Load JS (ssr: false needs a client component, hence this wrapper;
 * same pattern as the landing's MotionControllers). Imported only by the five
 * Sobre mí page components, never by `/` (plan § 0.3).
 */
const CuadernoScrollEffects = dynamic(
  () =>
    import("@/features/sobre-mi/motion/cuaderno-scroll-effects").then(
      (m) => m.CuadernoScrollEffects,
    ),
  { ssr: false },
);

export function CuadernoMotion(): JSX.Element {
  return <CuadernoScrollEffects />;
}
