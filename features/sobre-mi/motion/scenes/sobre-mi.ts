import { gsap } from "@/lib/gsap";
import { MOTION } from "@/lib/motion";
import { smSel } from "@/features/sobre-mi/motion/attributes";
import type { Scene } from "@/features/sobre-mi/motion/scenes/types";

/**
 * M3, /sobre-mi's own scenes (spec M3; mockup `SCENES['sobre-mi']`), scoped
 * to `[data-sm-scene="sobre-mi"]`:
 * - the photo drifts inside its fixed 3:2 box (image scale + yPercent,
 *   scrubbed); the box itself never moves, so nothing shifts (AC 19, 23);
 * - the signature is written in with clip-path (AC 24);
 * - the timeline rail fills with scroll (scaleY, scrubbed) and the rows
 *   slide in (AC 25). Opacity, not autoAlpha (T034: stays in the a11y tree).
 */
export const sobreMi: Scene = ({ root, eases }) => {
  if (root.getAttribute("data-sm-scene") !== "sobre-mi") return;
  const S = MOTION.sobreMi;

  root.querySelectorAll<HTMLElement>(smSel("parallax")).forEach((box) => {
    const img = box.querySelector("img");
    if (!img) return;
    gsap.fromTo(
      img,
      { scale: S.parallax.scaleFrom, yPercent: -S.parallax.yPercent },
      {
        scale: S.parallax.scaleTo,
        yPercent: S.parallax.yPercent,
        ease: "none",
        scrollTrigger: {
          trigger: box,
          start: "top bottom",
          end: "bottom top",
          scrub: S.parallax.scrub,
        },
      },
    );
  });

  root.querySelectorAll(smSel("signature")).forEach((sig) => {
    gsap.fromTo(
      sig,
      { clipPath: "inset(0% 100% 0% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: S.signature.duration,
        ease: S.signature.ease,
        scrollTrigger: { trigger: sig, start: S.signature.start, once: true },
      },
    );
  });

  root.querySelectorAll<HTMLElement>(smSel("timeline")).forEach((list) => {
    const wrap = list.parentElement ?? list;
    const rail = wrap.querySelector(smSel("rail"));
    if (rail) {
      gsap.fromTo(
        rail,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: S.rail.start,
            end: S.rail.end,
            scrub: S.rail.scrub,
          },
        },
      );
    }
    const rows = [...list.children];
    if (rows.length) {
      gsap.fromTo(
        rows,
        { opacity: 0, x: S.timelineRows.x },
        {
          opacity: 1,
          x: 0,
          clearProps: "transform",
          duration: S.timelineRows.duration,
          stagger: S.timelineRows.stagger,
          ease: eases.ds,
          scrollTrigger: {
            trigger: wrap,
            start: MOTION.trigger.reveal,
            once: true,
          },
        },
      );
    }
  });
};
