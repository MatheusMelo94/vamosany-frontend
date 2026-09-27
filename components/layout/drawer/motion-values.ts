/**
 * The phone drawer's motion values (mobile-navigation plan § 7.1; spec
 * § Motion Intent M1–M13; DDR-0006), as approved. Kept out of lib/motion.ts
 * on purpose: that object is imported by First Load code and can't be
 * tree-shaken per chunk, and only the lazy drawer chunk reads these (RV-0018).
 */

export const DRAWER_EASE = {
  /** The header-dot pop (M6). */
  pop: "back.out(3)",
} as const;

/**
 * Eases not named here: icon, panel and footer use `arrive`
 * (getEases().arrive); the header dot uses DRAWER_EASE.pop.
 */
export const DRAWER_MOTION = {
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
} as const;
