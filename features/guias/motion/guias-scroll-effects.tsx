"use client";

import { motionEnabled, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getEases } from "@/lib/gsap-ease";
import { smSel } from "@/features/sobre-mi/motion/attributes";
import { entrance } from "@/features/sobre-mi/motion/scenes/entrance";
import { focusReveal } from "@/features/sobre-mi/motion/scenes/focus-reveal";
import { navScrolled } from "@/features/sobre-mi/motion/scenes/nav-scrolled";
import type { Scene } from "@/features/sobre-mi/motion/scenes/types";

/**
 * The Guías get exactly one expressive moment, the M1 heading entrance (DDR-0012
 * § 5); no scroll reveals, parallax or reading bar. `navScrolled` is the
 * navbar's scrolled surface the landing controller provides and these pages
 * don't mount; `focusReveal` is last so focus never sits on a hidden heading
 * (ADR-0008 condition 2).
 */
const SCENES: readonly Scene[] = [navScrolled, entrance, focusReveal];

/**
 * Headless motion controller of the Guías pages (ADR-0003 pattern; plan D-5).
 * Mounted per page by GuiasMotion (next/dynamic, ssr: false), so a client
 * navigation reverts it and mounts a fresh one. Reads only the attribute
 * contract and renders nothing. Under reduced motion or without JS there is
 * no `.gsap`: it returns at once (ADR-0002) and the heading stays in its
 * static, visible CSS state.
 */
export function GuiasScrollEffects(): null {
  useGSAP(
    (_context, contextSafe) => {
      if (!motionEnabled() || !contextSafe) return;
      const root = document.querySelector<HTMLElement>(smSel("scene"));
      if (!root) return;

      const context = {
        root,
        eases: getEases(),
        contextSafe: contextSafe as <T extends (...args: never[]) => unknown>(
          fn: T,
        ) => T,
      };
      const cleanups = SCENES.map((scene) => scene(context)).filter(
        (c): c is () => void => typeof c === "function",
      );

      // Fonts change metrics, which moves every trigger.
      let active = true;
      void document.fonts?.ready.then(() => {
        if (active) ScrollTrigger.refresh();
      });

      return () => {
        active = false;
        cleanups.forEach((cleanup) => cleanup());
      };
    },
    { dependencies: [] },
  );
  return null;
}
