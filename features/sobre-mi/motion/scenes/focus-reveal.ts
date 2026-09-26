import { gsap } from "@/lib/gsap";
import type { Scene } from "@/features/sobre-mi/motion/scenes/types";

type Animation = gsap.core.Animation;

/** The outermost animation a tween belongs to (a scene timeline, or itself). */
function topLevel(tween: Animation): Animation {
  let anim = tween;
  while (anim.parent && anim.parent !== gsap.globalTimeline) {
    anim = anim.parent;
  }
  return anim;
}

/**
 * ADR-0008 condition 2 (frontend-architecture-conventions § Animation):
 * reveals use `opacity`, so a not-yet-revealed field, button or link stays
 * focusable at opacity 0, and focusing it does not always cross its
 * ScrollTrigger start. On `focusin` inside the scene, every unfinished,
 * non-scrubbed animation that fades the focused element or one of its
 * ancestors is completed at once (its whole timeline, so a later play()
 * can't re-render the start state), and focus never sits on an invisible
 * element. Tweens that don't touch opacity (the M8 shake) and scrubbed
 * ones (parallax, rails, the reading bar) are left alone.
 */
export const focusReveal: Scene = ({ root, contextSafe }) => {
  const onFocusIn = contextSafe((event: Event) => {
    const pending = new Set<Animation>();
    for (
      let el = event.target instanceof Element ? event.target : null;
      el && root.contains(el);
      el = el.parentElement
    ) {
      for (const tween of gsap.getTweensOf(el)) {
        if (!("opacity" in tween.vars)) continue;
        const anim = topLevel(tween);
        if (anim.scrollTrigger?.vars.scrub) continue;
        if (anim.progress() < 1) pending.add(anim);
      }
    }
    pending.forEach((anim) => anim.progress(1));
  });

  root.addEventListener("focusin", onFocusIn);
  return () => root.removeEventListener("focusin", onFocusIn);
};
