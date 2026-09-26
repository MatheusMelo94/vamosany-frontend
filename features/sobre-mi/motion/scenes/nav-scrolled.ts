import { ScrollTrigger } from "@/lib/gsap";
import { MOTION } from "@/lib/motion";
import type { Scene } from "@/features/sobre-mi/motion/scenes/types";

/**
 * Navbar surface once the page leaves the top — parity with the landing's
 * controller (`MOTION.nav.start`), which isn't mounted on these pages. The
 * class is removed on revert, so the next page starts clean.
 */
export const navScrolled: Scene = () => {
  const nav = document.querySelector<HTMLElement>("[data-nav]");
  if (!nav) return;
  ScrollTrigger.create({
    start: MOTION.nav.start,
    end: 99999,
    onToggle: (self) => nav.classList.toggle("is-scrolled", self.isActive),
    // The controller loads lazily, so the visitor may already be past the
    // start, and onToggle doesn't fire for a state that holds from the first
    // refresh. After each refresh, compare the real scroll with the measured
    // start (`isActive` isn't settled yet inside onRefresh).
    onRefresh: (self) =>
      nav.classList.toggle("is-scrolled", self.scroll() > self.start),
  });
  return () => nav.classList.remove("is-scrolled");
};
