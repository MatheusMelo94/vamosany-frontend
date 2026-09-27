import { gsap } from "@/lib/gsap";
import { MOTION } from "@/lib/motion";
import { smSel } from "@/features/sobre-mi/motion/attributes";
import type { Scene } from "@/features/sobre-mi/motion/scenes/types";

/**
 * M6, /contacto (spec M6; mockup `SCENES.contacto`): the three contact
 * channels slide in after the title sequence, on a delay rather than on
 * scroll — they are above the fold, so a Visitor who doesn't want the form
 * sees the email first (AC 35). Opacity, not autoAlpha (the links stay
 * focusable, T034).
 */
export const contacto: Scene = ({ root, eases }) => {
  if (root.getAttribute("data-sm-scene") !== "contacto") return;
  const C = MOTION.contacto.channels;
  const items = [...root.querySelectorAll(`${smSel("channels")} > li`)];
  if (!items.length) return;
  gsap.fromTo(
    items,
    { opacity: 0, x: C.x },
    {
      opacity: 1,
      x: 0,
      clearProps: "transform",
      duration: C.duration,
      stagger: C.stagger,
      delay: C.delay,
      ease: eases.ds,
    },
  );
};
