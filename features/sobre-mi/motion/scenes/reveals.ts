import { gsap } from "@/lib/gsap";
import { MOTION } from "@/lib/motion";
import { smSel } from "@/features/sobre-mi/motion/attributes";
import type { Scene } from "@/features/sobre-mi/motion/scenes/types";

/**
 * M2 shared reveals (spec M2; mockup `reveals()`): each notes column's items,
 * each prose paragraph / figure / headline line, the closing row (headline,
 * then buttons) and the JS form's fields and button row rise once when they
 * reach `MOTION.trigger.reveal`. Pull lines and the signature are not
 * `[data-sm-reveal]` targets (they have their own scenes); the no-JS block is
 * outside `[data-sm-form]`, so it is never animated.
 *
 * The transform is cleared when a reveal ends, so the settled page keeps no
 * inline transforms: they would create stacking contexts that trap the
 * links' coarse-pointer hit areas under later siblings (RV-0001).
 *
 * Opacity, not autoAlpha: autoAlpha's `visibility: hidden` would take the
 * not-yet-revealed fields, buttons and links out of the tab order and the
 * accessibility tree (a keyboard user tabbing down would skip the form).
 * At opacity 0 they stay focusable; focusing one scrolls it into view,
 * which fires its reveal. Same choice as the landing's reveals.
 */
export const reveals: Scene = ({ root, eases }) => {
  const rise = (
    targets: Element[],
    trigger: Element,
    {
      y,
      duration,
      stagger = 0,
    }: { y: number; duration: number; stagger?: number },
  ) => {
    if (!targets.length) return;
    gsap.fromTo(
      targets,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        clearProps: "transform",
        duration,
        stagger,
        ease: eases.ds,
        scrollTrigger: { trigger, start: MOTION.trigger.reveal, once: true },
      },
    );
  };

  root
    .querySelectorAll(smSel("notes"))
    .forEach((notes) => rise([...notes.children], notes, MOTION.page.notes));
  root
    .querySelectorAll(smSel("reveal"))
    .forEach((el) => rise([el], el, MOTION.reveal));
  root
    .querySelectorAll(smSel("closing"))
    .forEach((closing) =>
      rise(
        [...closing.querySelectorAll(smSel("closingItem"))],
        closing,
        MOTION.page.closing,
      ),
    );
  root
    .querySelectorAll(smSel("form"))
    .forEach((form) =>
      rise(
        [...form.querySelectorAll(smSel("field"))],
        form,
        MOTION.page.formFields,
      ),
    );
};
