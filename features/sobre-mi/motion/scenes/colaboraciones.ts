import { gsap } from "@/lib/gsap";
import { MOTION } from "@/lib/motion";
import { smSel } from "@/features/sobre-mi/motion/attributes";
import type { Scene } from "@/features/sobre-mi/motion/scenes/types";

/**
 * M4, /colaboraciones (spec M4; mockup `SCENES.colaboraciones`), scoped to
 * `[data-sm-scene="colaboraciones"]`:
 * - a departure board: each row's 4-digit year ticks from the previous
 *   row's (the first from MOTION.colaboraciones.yearTick.firstFrom) when the
 *   row enters; a non-numeric year fades in; a repeated year doesn't tick.
 *   Only the aria-hidden twin changes, so assistive tech reads the final
 *   year from the sr-only copy (AC 29);
 * - the partner line slides in and the row body rises (opacity, not
 *   autoAlpha: T034);
 * - the reading bar (AC 30): created here, not in the navbar (plan § 0.3
 *   item 3). A pill-shaped clip layer is appended to the navbar capsule
 *   (the capsule itself can't be edited to clip) with the 3px brand bar
 *   inside; the bar's scaleX is scrubbed through the ledger. Removed on
 *   revert, so no other page ever has it. Under reduced motion or without
 *   JS this scene never runs.
 */
export const colaboraciones: Scene = ({ root, eases }) => {
  if (root.getAttribute("data-sm-scene") !== "colaboraciones") return;
  const C = MOTION.colaboraciones;

  const rows = [...root.querySelectorAll(smSel("rowBody"))]
    .map((body) => body.closest("li"))
    .filter((li): li is HTMLLIElement => li !== null);

  let previous: number = C.yearTick.firstFrom;
  for (const row of rows) {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: row, start: C.yearTick.start, once: true },
    });
    const year = row.querySelector<HTMLElement>(smSel("year"));
    const text = year?.textContent?.trim() ?? "";
    if (year && /^\d{4}$/.test(text)) {
      const to = Number(text);
      if (to !== previous) {
        const value = { n: previous };
        year.textContent = String(previous);
        tl.to(
          value,
          {
            n: to,
            duration: C.yearTick.duration,
            ease: eases.arrive,
            onUpdate: () => {
              year.textContent = String(Math.round(value.n));
            },
            onComplete: () => {
              year.textContent = text;
            },
          },
          0,
        );
      }
      previous = to;
    } else if (year) {
      tl.fromTo(
        year,
        { opacity: 0 },
        { opacity: 1, duration: C.yearFade.duration },
        0,
      );
    }
    const partner = row.querySelector(smSel("partner"));
    if (partner) {
      tl.fromTo(
        partner,
        { opacity: 0, x: C.partner.x },
        {
          opacity: 1,
          x: 0,
          duration: C.partner.duration,
          ease: eases.ds,
          clearProps: "transform",
        },
        C.partner.at,
      );
    }
    const body = row.querySelector(smSel("rowBody"));
    if (body?.children.length) {
      tl.fromTo(
        [...body.children],
        { opacity: 0, y: C.body.y },
        {
          opacity: 1,
          y: 0,
          clearProps: "transform",
          duration: C.body.duration,
          stagger: C.body.stagger,
          ease: eases.ds,
        },
        C.body.at,
      );
    }
  }

  const capsule = document.querySelector<HTMLElement>(
    "[data-nav] .nav-capsule",
  );
  const ledger = rows[0]?.parentElement;
  if (!capsule || !ledger) return;
  const clip = document.createElement("span");
  clip.setAttribute("aria-hidden", "true");
  clip.className =
    "pointer-events-none absolute inset-0 overflow-hidden rounded-full";
  const bar = document.createElement("span");
  bar.setAttribute("aria-hidden", "true");
  bar.setAttribute("data-reading-bar", "");
  bar.className = "bg-brand absolute inset-x-0 bottom-0 h-0.75 origin-left";
  clip.append(bar);
  capsule.append(clip);

  gsap.fromTo(
    bar,
    { scaleX: 0 },
    {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ledger,
        start: C.readingBar.start,
        end: C.readingBar.end,
        scrub: C.readingBar.scrub,
      },
    },
  );

  return () => clip.remove();
};
