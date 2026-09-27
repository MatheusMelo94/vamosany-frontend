/**
 * Contrato entre as secoes (server components, que so escrevem atributos) e os
 * controladores de motion (client, que so leem). Uma secao opta por um efeito
 * colocando o atributo; nenhum controlador conhece a secao (T-16, ADR-0003).
 */
export const MOTION_ATTR = {
  reveal: "data-reveal",
  revealGroup: "data-reveal-group",
  count: "data-count",
  marquee: "data-marquee",
  nav: "data-nav",
  sweep: "data-sweep",
  panBand: "data-pan-band",
  heroCopy: "data-hero-copy",
  heroQuote: "data-hero-quote",
  heroActions: "data-hero-actions",
  headingBlock: "data-heading-block",
  splitLines: "data-split-lines",
  headingEyebrow: "data-heading-eyebrow",
  headingLede: "data-heading-lede",
  headingActions: "data-heading-actions",
  ring: "data-ring",
} as const;

export type MotionAttr = keyof typeof MOTION_ATTR;

/** Seletor CSS para um atributo do contrato. */
export const sel = (key: MotionAttr): string => `[${MOTION_ATTR[key]}]`;

/** Gate global (ADR-0002); mora em lib/gsap.ts, re-exportado para os imports da landing nao mudarem. */
export { motionEnabled } from "@/lib/gsap";
