import { gsap } from "@/lib/gsap";
import { MOTION } from "@/lib/motion";
import { smSel } from "@/features/sobre-mi/motion/attributes";
import type { Scene } from "@/features/sobre-mi/motion/scenes/types";

/**
 * M5, /trabaja-conmigo (spec M5; mockup `SCENES['trabaja-conmigo']`): each
 * audience row draws its top rule left to right, then its H2 and text rise,
 * when the row reaches MOTION.trabajaConmigo.rule.start (AC 32).
 */
export const trabajaConmigo: Scene = ({ root, eases }) => {
  if (root.getAttribute("data-sm-scene") !== "trabaja-conmigo") return;
  const T = MOTION.trabajaConmigo;
  root.querySelectorAll(`${smSel("audience")} > li`).forEach((row) => {
    const rule = row.querySelector(smSel("rule"));
    const text = [...row.children].filter((c) => c !== rule);
    const tl = gsap.timeline({
      defaults: { ease: eases.ds },
      scrollTrigger: { trigger: row, start: T.rule.start, once: true },
    });
    if (rule) {
      tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: T.rule.duration });
    }
    if (text.length) {
      tl.fromTo(
        text,
        { opacity: 0, y: T.text.y },
        {
          opacity: 1,
          y: 0,
          duration: T.text.duration,
          stagger: T.text.stagger,
        },
        rule ? T.text.offset : 0,
      );
    }
  });
};
