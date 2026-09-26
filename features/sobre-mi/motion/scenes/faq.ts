import { gsap } from "@/lib/gsap";
import { MOTION } from "@/lib/motion";
import { smSel } from "@/features/sobre-mi/motion/attributes";
import type { Scene } from "@/features/sobre-mi/motion/scenes/types";

/**
 * M7, /preguntas-frecuentes (spec M7; mockup `SCENES.faq`, `toggleDetails`):
 * - question rows rise group by group when each group is reached;
 * - ADR-0007: a click (or Enter/Space, which fire click) on a question
 *   animates the answer wrapper's height — user action only, never on load
 *   (deep links open natively via FaqDeepLink). Opening: `open` first, then
 *   height 0 → auto and the content fades up. Closing: `data-closing` (the
 *   glyph turns back to "+"), height → 0, then `open = false`. A click
 *   mid-animation retargets from the current height; heights are always
 *   cleared at the end, so `details.open` stays the truth. Focus is never
 *   moved. This scene only runs under `.gsap`; otherwise the native
 *   disclosure toggles instantly.
 */
export const faq: Scene = ({ root, eases, contextSafe }) => {
  if (root.getAttribute("data-sm-scene") !== "faq") return;
  const F = MOTION.faq;

  root.querySelectorAll(smSel("faqGroup")).forEach((group) => {
    const rows = [...group.querySelectorAll("details")];
    if (!rows.length) return;
    gsap.fromTo(
      rows,
      { opacity: 0, y: F.rows.y },
      {
        opacity: 1,
        y: 0,
        duration: F.rows.duration,
        clearProps: "transform",
        stagger: F.rows.stagger,
        ease: eases.ds,
        scrollTrigger: {
          trigger: group,
          start: MOTION.trigger.reveal,
          once: true,
        },
      },
    );
  });

  const toggle = contextSafe((details: HTMLDetailsElement) => {
    const answer = details.querySelector<HTMLElement>(smSel("faqAnswer"));
    if (!answer) return;
    const closing = details.hasAttribute("data-closing");
    gsap.killTweensOf(answer);
    gsap.killTweensOf([...answer.children]);

    if (details.open && !closing) {
      details.setAttribute("data-closing", "");
      gsap.fromTo(
        answer,
        { height: answer.getBoundingClientRect().height },
        {
          height: 0,
          duration: F.close.duration,
          ease: F.close.ease,
          onComplete: () => {
            details.open = false;
            details.removeAttribute("data-closing");
            gsap.set(answer, { clearProps: "height" });
          },
        },
      );
      return;
    }

    const from = closing ? answer.getBoundingClientRect().height : 0;
    details.removeAttribute("data-closing");
    details.open = true;
    gsap.fromTo(
      answer,
      { height: from },
      {
        height: "auto",
        duration: F.open.duration,
        ease: eases.ds,
        onComplete: () => {
          gsap.set(answer, { clearProps: "height" });
        },
      },
    );
    if (!closing) {
      gsap.fromTo(
        [...answer.children],
        { opacity: 0, y: F.open.content.y },
        {
          opacity: 1,
          y: 0,
          duration: F.open.content.duration,
          delay: F.open.content.delay,
          ease: eases.ds,
          clearProps: "opacity,transform",
        },
      );
    }
  });

  const onClick = (event: Event) => {
    const summary =
      event.target instanceof Element ? event.target.closest("summary") : null;
    const details = summary?.parentElement;
    if (!(details instanceof HTMLDetailsElement)) return;
    if (!details.closest(smSel("faqGroup"))) return;
    event.preventDefault();
    toggle(details);
  };

  root.addEventListener("click", onClick);
  return () => root.removeEventListener("click", onClick);
};
