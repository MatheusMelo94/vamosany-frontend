"use client";

import { motionEnabled, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getEases } from "@/lib/gsap-ease";
import { smSel } from "@/features/sobre-mi/motion/attributes";
import { colaboraciones } from "@/features/sobre-mi/motion/scenes/colaboraciones";
import { contacto } from "@/features/sobre-mi/motion/scenes/contacto";
import { entrance } from "@/features/sobre-mi/motion/scenes/entrance";
import { navScrolled } from "@/features/sobre-mi/motion/scenes/nav-scrolled";
import { reveals } from "@/features/sobre-mi/motion/scenes/reveals";
import { settle } from "@/features/sobre-mi/motion/scenes/settle";
import { sobreMi } from "@/features/sobre-mi/motion/scenes/sobre-mi";
import { sweeps } from "@/features/sobre-mi/motion/scenes/sweeps";
import { trabajaConmigo } from "@/features/sobre-mi/motion/scenes/trabaja-conmigo";
import type { Scene } from "@/features/sobre-mi/motion/scenes/types";

/** Scenes, in order. Page-specific scenes read `data-sm-scene` themselves. */
const SCENES: readonly Scene[] = [
  navScrolled,
  entrance,
  reveals,
  sweeps,
  sobreMi,
  colaboraciones,
  trabajaConmigo,
  contacto,
  settle,
];

/**
 * Headless motion controller of the Sobre mí pages (ADR-0003 pattern; TDD
 * § 4.1). Mounted per page by CuadernoMotion (next/dynamic, ssr: false), so
 * a client navigation between these pages reverts it and mounts a fresh one.
 * Reads only the attribute contract; renders nothing. Under reduced motion
 * or without JS there is no `.gsap` and it returns at once (ADR-0002), which
 * leaves every target in its static CSS state.
 */
export function CuadernoScrollEffects(): null {
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
