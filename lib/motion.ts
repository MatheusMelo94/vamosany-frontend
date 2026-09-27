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
  /** The drawer's header-dot pop (mobile-navigation M6, DDR-0006). Addition only. */
  pop: "back.out(3)",
} as const;

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

  /* ---- Sobre mí pages (plan § 8.4; DDR-0003, DDR-0004). Additions only. ---- */

  /** Shared page template: heading dek offset, "20" count-up, notes/closing/form reveals */
  page: {
    /** dek lands while the train is still braking (MOTION.heading.lede.offset is -=0.42) */
    dekOffset: "-=0.85",
    count: { at: 0.1, ease: "power2.out" },
    notes: { y: 12, duration: 0.4, stagger: 0.06 },
    closing: { y: 14, duration: 0.4, stagger: 0.08 },
    formFields: { y: 16, duration: 0.4, stagger: 0.07 },
  },
  /** Navbar mega-menu moving marker (DDR-0003) */
  menuMarker: {
    pill: 0.55,
    dot: 0.75,
    /** dot scaleX = min(stretchMax, 1 + distance / stretchDivisor) */
    stretchMax: 2.6,
    stretchDivisor: 160,
    squash: 0.8,
    stretchEase: "power1.inOut",
    /** px from the item's right edge / top edge */
    dotOffset: { right: 24, top: 15 },
  },
  sobreMi: {
    parallax: { scaleFrom: 1.18, scaleTo: 1.04, yPercent: 6, scrub: 0.4 },
    signature: { duration: 1.2, start: "top 92%", ease: "power2.inOut" },
    rail: { start: "top 80%", end: "bottom 55%", scrub: 0.4 },
    timelineRows: { x: -14, duration: 0.4, stagger: 0.1 },
  },
  colaboraciones: {
    readingBar: { start: "top 70%", end: "bottom 60%", scrub: 0.3 },
    yearTick: { duration: 0.6, start: "top 82%", firstFrom: 2021 },
    yearFade: { duration: 0.3 },
    partner: { x: -10, duration: 0.4, at: 0.1 },
    body: { y: 18, duration: 0.45, stagger: 0.06, at: 0.05 },
  },
  trabajaConmigo: {
    rule: { duration: 0.6, start: "top 90%" },
    text: { y: 14, duration: 0.4, stagger: 0.08, offset: "-=0.35" },
  },
  contacto: {
    channels: { x: -14, duration: 0.4, stagger: 0.09, delay: 0.9 },
  },
  faq: {
    rows: { y: 12, duration: 0.35, stagger: 0.05 },
    open: { duration: 0.4, content: { y: 8, duration: 0.35, delay: 0.08 } },
    close: { duration: 0.3, ease: "power2.inOut" },
  },
  form: {
    shake: { x: [0, -7, 7, -4, 4, 0], duration: 0.4 },
    banner: { y: -8, duration: 0.35 },
    success: {
      sweepDelay: 0.1,
      lines: { y: 12, duration: 0.4, stagger: 0.08, delay: 0.25 },
    },
  },

  /* ---- Mobile drawer "Índice" (mobile-navigation plan § 7.1; DDR-0006). Additions only. ---- */

  /**
   * Eases not named here: icon, panel and footer use `arrive`
   * (getEases().arrive); the header dot uses EASE.pop.
   */
  drawer: {
    /** The "unfold" (M1–M6); `at` is seconds from the tap. */
    open: {
      veil: { duration: 0.25, ease: "power1.out" },
      icon: { rotate: -90, scale: 0.6, duration: 0.35 },
      /** 24px = --radius-3xl (the panel's rounded-3xl); the builder reads the token, the literal is the jsdom fallback */
      panel: {
        clipFrom: "inset(0% 0% 100% 0% round 24px)",
        y: -10,
        duration: 0.55,
      },
      rows: {
        y: 14,
        duration: 0.35,
        stagger: 0.05,
        at: 0.15,
        ease: "power2.out",
      },
      footer: { y: 24, duration: 0.4, at: 0.3 },
      dot: { duration: 0.4, at: 0.45 },
    },
    /** The roll-up (M7–M8), built from current values. */
    close: {
      panel: { y: -6, duration: 0.25, ease: "power2.in" },
      veil: { duration: 0.2, at: 0.05 },
    },
    /** M10–M13. A swap ends at max(expand, rows.at + rows.maxStart + rows.duration, collapse) ≤ 0.5s (AC 44). */
    accordion: {
      expand: { duration: 0.3, ease: "power2.out" },
      collapse: { duration: 0.18, ease: "power2.in" },
      /** the stagger is capped so the last row starts ≤ maxStart after the expand begins */
      rows: { y: 6, duration: 0.18, stagger: 0.03, at: 0.05, maxStart: 0.25 },
      chevron: 0.2,
    },
  },
} as const;
