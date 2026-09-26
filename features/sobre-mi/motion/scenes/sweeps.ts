import { gsap } from "@/lib/gsap";
import { MOTION } from "@/lib/motion";
import { smSel } from "@/features/sobre-mi/motion/attributes";
import type { Scene } from "@/features/sobre-mi/motion/scenes/types";

/**
 * Pull-line trains (spec M3, M4; mockup `sweepOnScroll`): each
 * `[data-sm-sweep]` marker pulls in once it reaches MOTION.trigger.sweep —
 * the Sobre mí question and the Efe Hus quote. Only a custom property moves;
 * the text is never touched.
 */
export const sweeps: Scene = ({ root, eases }) => {
  root.querySelectorAll(smSel("sweep")).forEach((el) => {
    gsap.fromTo(
      el,
      { "--train": "100%" },
      {
        "--train": "0%",
        duration: MOTION.sweep.duration,
        delay: MOTION.sweep.delay,
        ease: eases.arrive,
        scrollTrigger: { trigger: el, start: MOTION.trigger.sweep, once: true },
      },
    );
  });
};
