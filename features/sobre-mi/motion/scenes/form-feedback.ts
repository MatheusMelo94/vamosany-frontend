import { gsap } from "@/lib/gsap";
import { MOTION } from "@/lib/motion";
import { smSel } from "@/features/sobre-mi/motion/attributes";
import type { Scene } from "@/features/sobre-mi/motion/scenes/types";

/**
 * M8 form feedback in the controller (spec M8 v1.1; plan § 0.1 F8), for the
 * UI-only forms: the form leaves import no GSAP; they dispatch
 * `sm:field-errors` (detail.fields = invalid control ids) and `sm:banner` on
 * their `[data-sm-form]` root, and this scene answers:
 * - field errors: each invalid field's `[data-sm-field]` wrapper shakes once
 *   (MOTION.form.shake). Only submits dispatch the event, so typing never
 *   shakes;
 * - banner: the not-configured banner enters from above
 *   (MOTION.form.banner), on the next frame, once React has committed the
 *   (re-keyed) banner — so a repeat valid submit replays it.
 * Tweens target wrappers only, never field contents (R-06); the handlers
 * read ids from the event and nothing else. No `.gsap` → no listener: the
 * errors and banner appear statically, with the same focus behaviour.
 * `MOTION.form.success` stays unused in this release.
 */
export const formFeedback: Scene = ({ root, eases, contextSafe }) => {
  const forms = [...root.querySelectorAll<HTMLElement>(smSel("form"))];
  if (!forms.length) return;
  const { shake, banner } = MOTION.form;

  const onFieldErrors = contextSafe((event: Event) => {
    const detail = (event as CustomEvent<{ fields?: unknown }>).detail;
    const ids = Array.isArray(detail?.fields) ? detail.fields : [];
    for (const id of ids) {
      if (typeof id !== "string") continue;
      const wrapper = document.getElementById(id)?.closest(smSel("field"));
      if (!wrapper) continue;
      gsap.killTweensOf(wrapper, "x");
      gsap.to(wrapper, {
        keyframes: { x: [...shake.x] },
        duration: shake.duration,
        ease: "none",
      });
    }
  });

  const onBanner = contextSafe((event: Event) => {
    const form = event.currentTarget as HTMLElement;
    requestAnimationFrame(
      contextSafe(() => {
        const node = form.querySelector(smSel("banner"));
        if (!node) return;
        gsap.fromTo(
          node,
          { y: banner.y, opacity: 0 },
          { y: 0, opacity: 1, duration: banner.duration, ease: eases.ds },
        );
      }),
    );
  });

  for (const form of forms) {
    form.addEventListener("sm:field-errors", onFieldErrors);
    form.addEventListener("sm:banner", onBanner);
  }
  return () => {
    for (const form of forms) {
      form.removeEventListener("sm:field-errors", onFieldErrors);
      form.removeEventListener("sm:banner", onBanner);
    }
  };
};
