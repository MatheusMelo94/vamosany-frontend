import { CustomEase } from "@/lib/gsap";

/**
 * Fonte unica de duracoes, staggers, distancias e eases do GSAP (T-17, ADR-0006).
 * Os valores sao os que estavam espalhados pelos modulos, copiados 1:1 — o design e o
 * motion em producao estao congelados; mudar qualquer numero aqui exige DDR.
 * Os tokens CSS (--duration-*, --ease-default em globals.css) cobrem as transicoes CSS;
 * `EASE.ds` e o mesmo cubic-bezier de --ease-default.
 */
export const EASE = {
  /** --ease-default do design system */
  ds: "0.2, 0.8, 0.2, 1",
  /** A subway pulling in: flat out through the tunnel, a long brake into
      the platform, ~2% past the mark, then the settle back as it stops. */
  arrive:
    "M0,0 C0.06,0.42 0.14,0.82 0.4,0.965 0.55,1.02 0.66,1.022 0.76,1.006 0.86,0.995 0.93,1 1,1",
} as const;

let eases: { ds: gsap.EaseFunction; arrive: gsap.EaseFunction } | undefined;
/** Cria as CustomEases uma vez, no cliente, quando o primeiro modulo precisa delas. */
export function getEases(): {
  ds: gsap.EaseFunction;
  arrive: gsap.EaseFunction;
} {
  eases ??= {
    ds: CustomEase.create("ds", EASE.ds),
    arrive: CustomEase.create("arrive", EASE.arrive),
  };
  return eases;
}

export const MOTION = {
  /** ScrollTrigger start positions */
  trigger: {
    reveal: "top 88%",
    group: "top 85%",
    sweep: "top 85%",
    heading: "top 85%",
    count: "top 88%",
  },
  reveal: { y: 18, duration: 0.45 },
  revealGroup: { y: 22, duration: 0.4, stagger: 0.06 },
  count: { duration: 1.2 },
  marquee: {
    duration: 44,
    boostMax: 4,
    boostDivisor: 600,
    boostIn: 0.18,
    boostOut: 0.6,
  },
  nav: { start: "top -80" },
  sweep: { duration: 1.0, delay: 0.12 },
  panBand: { xPercent: -22, scrub: 0.4 },
  hero: {
    lines: { yPercent: 115, duration: 0.8, stagger: 0.09 },
    sweep: { duration: 1.15, stagger: 0.16, offset: "-=0.25" },
    quote: { y: 12, duration: 0.5, offset: "-=0.4" },
    actions: { y: 14, duration: 0.45, stagger: 0.08, offset: "-=0.34" },
  },
  heading: {
    eyebrow: { y: 8, duration: 0.35 },
    lines: { yPercent: 115, duration: 0.7, stagger: 0.08, offset: "-=0.15" },
    sweep: { duration: 1.0, stagger: 0.14, offset: "-=0.3" },
    lede: { y: 12, duration: 0.45, offset: "-=0.42" },
    actions: { y: 12, duration: 0.4, stagger: 0.08, offset: "-=0.3" },
  },
  overscroll: {
    /** sections shorter than this fraction of the viewport scroll normally */
    minHeightRatio: 0.85,
    /** sections taller than this fraction scroll normally */
    maxHeightRatio: 1.25,
    hold: 0.6,
    exit: { scale: 0.96, duration: 0.4 },
  },
  ring: {
    /** seconds per revolution (default prop) */
    speed: 36,
    /** cards fade over the last 15 degrees before the edge */
    cullFade: 0.26,
    hover: { timeScale: 0.25, duration: 0.6 },
    nudge: {
      min: 0.5,
      max: 3,
      divisor: 2000,
      duration: 0.3,
      settleDuration: 0.8,
      settleDelayMs: 150,
    },
  },
} as const;
