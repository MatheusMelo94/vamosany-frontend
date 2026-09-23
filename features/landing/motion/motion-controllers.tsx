"use client";

import type { JSX } from "react";
import dynamic from "next/dynamic";

/**
 * Os controladores de motion nao renderizam nada e so fazem sentido com JS. Carrega-los
 * com `ssr: false` fora do bundle inicial tira SplitText/CustomEase do First Load JS
 * (T-19b). O gate `.gsap` ja esconde os alvos dos reveals antes do primeiro paint, entao
 * o chunk atrasado so posterga o inicio das timelines, nunca mostra um estado
 * intermediario. `ssr: false` exige um Client Component, por isso este wrapper.
 */
const ScrollEffects = dynamic(
  () => import("./scroll-effects").then((m) => m.ScrollEffects),
  {
    ssr: false,
  },
);
const Overscroll = dynamic(
  () => import("./overscroll").then((m) => m.Overscroll),
  {
    ssr: false,
  },
);

export function MotionControllers(): JSX.Element {
  return (
    <>
      <ScrollEffects />
      <Overscroll />
    </>
  );
}
