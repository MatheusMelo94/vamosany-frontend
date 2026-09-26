import { gsap } from "@/lib/gsap";
import type { Scene } from "@/features/sobre-mi/motion/scenes/types";

/**
 * Final state for every target that app/globals.css hides under
 * `.gsap [data-sm-scene]` and that no scene animates yet. It keeps the page
 * fully visible while the M4 scenes land one by one; each scene task removes
 * its selectors from here.
 */
const OPACITY = [
  "[data-sm-partner]",
  "[data-sm-row-body] > *",
  "[data-sm-channels] li",
  "[data-sm-faq-group] details",
];
const TRAINS: string[] = [];
const SCALED = ["[data-sm-rule]"];
const CLIPPED: string[] = [];

export const settle: Scene = ({ root }) => {
  // gsap.set on an empty list warns "GSAP target not found": skip those.
  const set = (selectors: string[], vars: gsap.TweenVars) => {
    const targets = selectors.length
      ? [...root.querySelectorAll(selectors.join(", "))]
      : [];
    if (targets.length) gsap.set(targets, vars);
  };
  set(OPACITY, { opacity: 1 });
  set(TRAINS, { "--train": "0%" });
  set(SCALED, { scaleX: 1, scaleY: 1 });
  set(CLIPPED, { clipPath: "inset(0% 0% 0% 0%)" });
};
