import { gsap } from "@/lib/gsap";
import { SplitText } from "@/lib/gsap-text";
import { MOTION } from "@/lib/motion";
import { smSel } from "@/features/sobre-mi/motion/attributes";
import type { Scene } from "@/features/sobre-mi/motion/scenes/types";

/**
 * M1 heading entrance (spec M1; mockup `entrance()`): label fades up → the
 * H1's words rise in their masks → the train pulls in → the dek lands while
 * the train is still braking; on /sobre-mi the "20" counts up from 0.
 *
 * SplitText runs only on the H1's aria-hidden visual copy (static
 * first-party text, R-06); the sr-only copy keeps the accessible name
 * (AC 14). The split is reverted when the words land, so the marker runs as
 * one band (AC 15). The split waits for the webfonts, like the landing's.
 */
export const entrance: Scene = ({ root, eases, contextSafe }) => {
  const heading = root.querySelector<HTMLElement>(smSel("heading"));
  if (!heading) return;
  const label = heading.querySelector<HTMLElement>(smSel("label"));
  const visual = heading.querySelector<HTMLElement>(smSel("split"));
  const dek = heading.querySelector<HTMLElement>(smSel("dek"));
  const counter = heading.querySelector<HTMLElement>(smSel("count"));
  const H = MOTION.heading;

  let cancelled = false;
  const run = contextSafe(() => {
    if (cancelled) return;
    gsap.set(heading, { opacity: 1 });
    if (!visual) return;

    let split: SplitText | undefined;
    try {
      split = SplitText.create(visual, {
        type: "words",
        mask: "words",
        aria: "none",
      });
    } catch {
      // A split failure must never leave the heading hidden or parked.
      gsap.set(visual, { "--train": "0%" });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: eases.ds } });
    if (label) {
      tl.fromTo(
        label,
        { autoAlpha: 0, y: H.eyebrow.y },
        { autoAlpha: 1, y: 0, duration: H.eyebrow.duration },
      );
    }
    tl.fromTo(
      split.words,
      { yPercent: H.lines.yPercent },
      {
        yPercent: 0,
        duration: H.lines.duration,
        stagger: H.lines.stagger,
        // Back to one text run as soon as the words have landed.
        onComplete: () => split?.revert(),
      },
      label ? H.lines.offset : 0,
    ).fromTo(
      visual,
      { "--train": "100%" },
      { "--train": "0%", duration: H.sweep.duration, ease: eases.arrive },
      H.sweep.offset,
    );
    if (dek) {
      tl.fromTo(
        dek,
        { autoAlpha: 0, y: H.lede.y },
        { autoAlpha: 1, y: 0, duration: H.lede.duration },
        MOTION.page.dekOffset,
      );
    }
    if (counter) {
      const end = Number(counter.textContent);
      if (Number.isFinite(end)) {
        const value = { n: 0 };
        counter.textContent = "0";
        tl.to(
          value,
          {
            n: end,
            duration: MOTION.count.duration,
            ease: MOTION.page.count.ease,
            onUpdate: () => {
              counter.textContent = String(Math.round(value.n));
            },
            onComplete: () => {
              counter.textContent = String(end);
            },
          },
          MOTION.page.count.at,
        );
      }
    }
  });

  void (document.fonts?.ready ?? Promise.resolve()).then(run);
  return () => {
    cancelled = true;
  };
};
