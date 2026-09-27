import { gsap, motionEnabled } from "@/lib/gsap";
import { getEases } from "@/lib/gsap-ease";
import { EASE, MOTION } from "@/lib/motion";

/**
 * The phone drawer's motion builders (mobile-navigation plan § 7; spec
 * § Motion Intent M1–M9; DDR-0006). Part of the lazy drawer chunk only: the
 * Navbar imports no GSAP. MobileDrawer runs them inside `useGSAP`.
 *
 * - Every builder checks the gate when it is called (plan § 7.1), so
 *   removing `.gsap` at runtime also gives the instant path (AC 46).
 * - Reveals of focusable content use `opacity`, never `autoAlpha` (ADR-0008);
 *   `clip-path: inset()` is animated per ADR-0010 and cleared at the end.
 * - Everything ends with `clearProps`: the settled drawer is its plain CSS
 *   state, pixel-equal to the drawer baselines.
 */

export type DrawerTargets = {
  veil: HTMLElement;
  panel: HTMLElement;
  /** The burger's <svg>, outside the drawer's scope (element ref, M2). */
  icon: Element | null;
  groups: HTMLElement[];
  footer: HTMLElement | null;
  /** The current group's header dot, if the current page is in the index. */
  dot: HTMLElement | null;
};

const O = MOTION.drawer.open;
const C = MOTION.drawer.close;
const REVEALED = "[data-drawer-group], [data-drawer-footer]";

/**
 * The motion gate (ADR-0002), read at call time. Reduced motion never gets
 * `.gsap`; the `gsap.matchMedia()` branch states it here too (A§ Animation).
 */
export function animates(): boolean {
  if (!motionEnabled()) return false;
  let reduced = false;
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: reduce)", () => {
    reduced = true;
  });
  mm.revert();
  return !reduced;
}

/** `inset()` with the panel's radius token (--radius-3xl = rounded-3xl). */
function clip(bottom: "0%" | "100%"): string {
  const radius = getComputedStyle(document.documentElement)
    .getPropertyValue("--radius-3xl")
    .trim();
  const from = O.panel.clipFrom;
  const shape = radius ? from.replace("24px", radius) : from;
  return bottom === "100%" ? shape : shape.replace("100%", "0%");
}

/**
 * Removes the panel's inline transform without `clearProps`. GSAP re-parses
 * a cleared transform, and for a fixed box with an identity matrix (its
 * offsetParent is null) it sets `display: block` to read it: the list's flex
 * height collapses and its scrollTop is lost. The cache already holds the
 * identity, so the next tween needs no parse either.
 */
function dropTransform(el: HTMLElement) {
  for (const p of ["transform", "translate", "rotate", "scale"])
    el.style.removeProperty(p);
}

/** Clears the icon's motion styles: the X is upright, the swap is clean (M9). */
function settleIcon(icon: Element | null) {
  if (icon) gsap.set(icon, { clearProps: "transform,opacity" });
}

/** M1–M6, the "unfold". `null` (and no tween) when motion is off. */
export function playOpen(t: DrawerTargets): gsap.core.Timeline | null {
  if (!animates()) return null;
  const { arrive } = getEases();
  const tl = gsap.timeline();
  tl.fromTo(
    t.veil,
    { opacity: 0 },
    {
      opacity: 1,
      duration: O.veil.duration,
      ease: O.veil.ease,
      clearProps: "opacity",
    },
    0,
  );
  if (t.icon)
    tl.from(
      t.icon,
      {
        rotate: O.icon.rotate,
        scale: O.icon.scale,
        opacity: 0,
        duration: O.icon.duration,
        ease: arrive,
        clearProps: "transform,opacity",
      },
      0,
    );
  tl.fromTo(
    t.panel,
    { clipPath: clip("100%"), y: O.panel.y },
    {
      clipPath: clip("0%"),
      y: 0,
      duration: O.panel.duration,
      ease: arrive,
      clearProps: "clipPath",
      onComplete: () => dropTransform(t.panel),
    },
    0,
  );
  // One tween per group (not a stagger), so the focus safeguard can
  // complete exactly the group that received focus.
  t.groups.forEach((group, i) =>
    tl.from(
      group,
      {
        y: O.rows.y,
        opacity: 0,
        duration: O.rows.duration,
        ease: O.rows.ease,
        clearProps: "transform,opacity",
      },
      O.rows.at + i * O.rows.stagger,
    ),
  );
  if (t.footer)
    tl.from(
      t.footer,
      {
        y: O.footer.y,
        opacity: 0,
        duration: O.footer.duration,
        ease: arrive,
        clearProps: "transform,opacity",
      },
      O.footer.at,
    );
  if (t.dot)
    tl.from(
      t.dot,
      {
        scale: 0,
        duration: O.dot.duration,
        ease: EASE.pop,
        clearProps: "transform",
      },
      O.dot.at,
    );
  return tl;
}

/**
 * The focus safeguard (ADR-0008 condition 2): Tab reached a control whose
 * group or footer is still rising, so its reveal completes at once.
 */
export function revealFocused(tl: gsap.core.Timeline, el: Element): void {
  const revealed = el.closest(REVEALED);
  if (!revealed) return;
  for (const tween of tl.getChildren(true, true, false)) {
    if ((tween as gsap.core.Tween).targets()[0] !== revealed) continue;
    tl.remove(tween);
    tween.progress(1);
  }
}

/**
 * M7–M8, the roll-up, from the current values (`to`, never `fromTo`), so a
 * close during the unfold starts wherever the panel is. `onDone` unmounts
 * (M9); without motion it runs synchronously.
 */
export function playClose(
  t: DrawerTargets,
  onDone: () => void,
): gsap.core.Timeline | null {
  if (!animates()) {
    settleIcon(t.icon);
    onDone();
    return null;
  }
  // A settled panel has no clip: give it the full one to roll up from.
  if (!t.panel.style.clipPath) gsap.set(t.panel, { clipPath: clip("0%") });
  const tl = gsap.timeline({
    onComplete: () => {
      settleIcon(t.icon);
      onDone();
    },
  });
  tl.to(
    t.panel,
    {
      clipPath: clip("100%"),
      y: C.panel.y,
      duration: C.panel.duration,
      ease: C.panel.ease,
    },
    0,
  );
  tl.to(t.veil, { opacity: 0, duration: C.veil.duration }, C.veil.at);
  return tl;
}

/**
 * A reopen during the close (plan § 7.3): everything goes to its settled
 * values, from where it is, with the open durations. Instant without motion.
 */
export function playReopen(t: DrawerTargets): gsap.core.Timeline | null {
  const rest = [...t.groups, t.footer, t.dot].filter(
    (el): el is HTMLElement => el !== null,
  );
  if (!animates()) {
    gsap.set([t.veil, ...rest], { clearProps: "opacity,transform" });
    gsap.set(t.panel, { clearProps: "clipPath" });
    dropTransform(t.panel);
    settleIcon(t.icon);
    return null;
  }
  const { arrive } = getEases();
  const tl = gsap.timeline();
  tl.to(
    t.veil,
    {
      opacity: 1,
      duration: O.veil.duration,
      ease: O.veil.ease,
      clearProps: "opacity",
    },
    0,
  );
  tl.to(
    t.panel,
    {
      clipPath: clip("0%"),
      y: 0,
      duration: O.panel.duration,
      ease: arrive,
      clearProps: "clipPath",
      onComplete: () => dropTransform(t.panel),
    },
    0,
  );
  const settled = { y: 0, scale: 1, rotate: 0, opacity: 1 };
  if (t.icon)
    tl.to(
      t.icon,
      {
        ...settled,
        duration: O.icon.duration,
        ease: arrive,
        clearProps: "transform,opacity",
      },
      0,
    );
  if (rest.length)
    tl.to(
      rest,
      {
        ...settled,
        duration: O.rows.duration,
        ease: O.rows.ease,
        clearProps: "transform,opacity",
      },
      0,
    );
  return tl;
}
