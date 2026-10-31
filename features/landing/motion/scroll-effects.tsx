"use client";

import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { getEases, SplitText } from "@/lib/gsap-text";
import { MOTION } from "@/lib/motion";
import { motionEnabled, sel } from "./attributes";
import { LAYOUT_CHANGE_EVENT } from "./events";

/**
 * Scroll motion for the landing page.
 *
 * Timing and easing live in lib/motion.ts (the design system's motion section:
 * subtle fade-and-translate reveals, no heavy parallax). Mounts nothing — it
 * only wires ScrollTriggers to elements marked up with the data attributes in
 * ./attributes.ts, so every section stays a server component. Bails out
 * entirely under `prefers-reduced-motion` (the `.gsap` gate).
 */
export function ScrollEffects(): null {
  useGSAP((_context, contextSafe) => {
    if (!motionEnabled()) return;

    const { ds: ease, arrive } = getEases();

    /* --- 1. Reveals: fade + short rise, once, on enter --------------- */
    gsap.utils.toArray<HTMLElement>(sel("reveal")).forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: MOTION.reveal.y },
        {
          opacity: 1,
          y: 0,
          duration: MOTION.reveal.duration,
          ease,
          scrollTrigger: {
            trigger: el,
            start: MOTION.trigger.reveal,
            once: true,
          },
        },
      );
    });

    /* --- 2. Grids stagger their own children ------------------------- */
    gsap.utils.toArray<HTMLElement>(sel("revealGroup")).forEach((group) => {
      const items = Array.from(group.children) as HTMLElement[];
      if (!items.length) return;

      gsap.fromTo(
        items,
        { opacity: 0, y: MOTION.revealGroup.y },
        {
          opacity: 1,
          y: 0,
          duration: MOTION.revealGroup.duration,
          ease,
          stagger: MOTION.revealGroup.stagger,
          scrollTrigger: {
            trigger: group,
            start: MOTION.trigger.group,
            once: true,
          },
        },
      );
    });

    /* --- 4. Stats count up once ------------------------------------- */
    gsap.utils.toArray<HTMLElement>(sel("count")).forEach((el) => {
      const end = Number(el.dataset.count);
      if (!Number.isFinite(end)) return;

      const prefix = el.dataset.prefix ?? "";
      const suffix = el.dataset.suffix ?? "";
      const counter = { value: 0 };
      const render = (v: number) =>
        `${prefix}${Math.round(v).toLocaleString("es")}${suffix}`;

      el.textContent = render(0);

      gsap.to(counter, {
        value: end,
        duration: MOTION.count.duration,
        ease,
        scrollTrigger: { trigger: el, start: MOTION.trigger.count, once: true },
        onUpdate: () => {
          el.textContent = render(counter.value);
        },
        onComplete: () => {
          el.textContent = render(end);
        },
      });
    });

    /* --- 5. Marquee takes its speed from scroll velocity ------------- */
    const track = document.querySelector<HTMLElement>(sel("marquee"));
    if (track) {
      track.classList.add("is-gsap");

      const loop = gsap.to(track, {
        xPercent: -50,
        duration: MOTION.marquee.duration,
        ease: "none",
        repeat: -1,
      });

      ScrollTrigger.create({
        trigger: track,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const boost = gsap.utils.clamp(
            1,
            MOTION.marquee.boostMax,
            1 + Math.abs(self.getVelocity()) / MOTION.marquee.boostDivisor,
          );
          gsap.to(loop, {
            timeScale: boost,
            duration: MOTION.marquee.boostIn,
            overwrite: true,
            onComplete: () => {
              gsap.to(loop, {
                timeScale: 1,
                duration: MOTION.marquee.boostOut,
              });
            },
          });
        },
      });
    }

    /* --- 6. Nav gains a surface once you leave the hero -------------- */
    const nav = document.querySelector<HTMLElement>(sel("nav"));
    if (nav) {
      ScrollTrigger.create({
        start: MOTION.nav.start,
        end: 99999,
        onToggle: (self) => nav.classList.toggle("is-scrolled", self.isActive),
      });
    }

    /* --- 7. The marker highlight draws in ---------------------------- */
    gsap.utils
      .toArray<HTMLElement>(sel("sweep"))
      .filter((el) => !el.closest(`${sel("heroCopy")}, ${sel("headingBlock")}`))
      .forEach((el) => {
        gsap.to(el, {
          "--train": "0%",
          duration: MOTION.sweep.duration,
          delay: MOTION.sweep.delay,
          ease: arrive,
          scrollTrigger: {
            trigger: el,
            start: MOTION.trigger.sweep,
            once: true,
          },
        });
      });

    /* --- 9. The wide bridge band pans as it passes ------------------- */
    const band = document.querySelector<HTMLElement>(sel("panBand"));
    if (band) {
      gsap.fromTo(
        band,
        { xPercent: 0 },
        {
          xPercent: MOTION.panBand.xPercent,
          ease: "none",
          scrollTrigger: {
            trigger: band.closest("section"),
            start: "top bottom",
            end: "bottom top",
            scrub: MOTION.panBand.scrub,
          },
        },
      );
    }

    /* --- 10. Hero entrance: the headline rises line by line ----------
       SplitText wraps each line in an overflow-hidden mask, so the type
       slides up from behind its own edge rather than just fading. The
       marker sweep and the copy below are chained off the same timeline
       so the whole block reads as one move. `autoSplit` re-runs it when
       the font loads or the line count changes on resize. The first split
       waits for `document.fonts.ready` so it measures final metrics. ---- */
    let cancelled = false;
    const splitHeadings = () => {
      if (cancelled) return;

      const heroCopy = document.querySelector<HTMLElement>(sel("heroCopy"));
      if (heroCopy) {
        const heading = heroCopy.querySelector<HTMLElement>("h1");
        const reveal = () => gsap.set(heroCopy, { opacity: 1 });
        const H = MOTION.hero;

        try {
          SplitText.create(heading, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) => {
              reveal();
              if (!self.lines.length) return;
              const tl = gsap.timeline({ defaults: { ease } });
              return tl
                .fromTo(
                  self.lines,
                  { yPercent: H.lines.yPercent },
                  {
                    yPercent: 0,
                    duration: H.lines.duration,
                    stagger: H.lines.stagger,
                  },
                )
                .fromTo(
                  heading?.querySelectorAll(sel("sweep")) ?? [],
                  { "--train": "100%" },
                  /* one train per line; the second pulls in just behind the first */
                  {
                    "--train": "0%",
                    duration: H.sweep.duration,
                    ease: arrive,
                    stagger: H.sweep.stagger,
                  },
                  H.sweep.offset,
                )
                .fromTo(
                  heroCopy.querySelector(sel("heroQuote")),
                  { opacity: 0, y: H.quote.y },
                  { opacity: 1, y: 0, duration: H.quote.duration },
                  H.quote.offset,
                )
                .fromTo(
                  heroCopy.querySelector(sel("heroActions"))?.children ?? [],
                  { opacity: 0, y: H.actions.y },
                  {
                    opacity: 1,
                    y: 0,
                    duration: H.actions.duration,
                    stagger: H.actions.stagger,
                  },
                  H.actions.offset,
                );
            },
          });
        } catch {
          /* If splitting fails for any reason, never leave the hero blank. */
          reveal();
        }
      }

      /* --- 11. Section headings reveal line by line -----------------
         Same masked-line treatment as the hero, but triggered on scroll and
         chained with the eyebrow, the marker sweep and the standfirst so
         each heading block reads as one move. ------------------------- */
      gsap.utils.toArray<HTMLElement>(sel("headingBlock")).forEach((block) => {
        const heading = block.querySelector<HTMLElement>(sel("splitLines"));
        const show = () => gsap.set(block, { opacity: 1 });
        const S = MOTION.heading;

        if (!heading) {
          show();
          return;
        }

        try {
          SplitText.create(heading, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) => {
              show();
              if (!self.lines.length) return;

              const tl = gsap.timeline({
                defaults: { ease },
                scrollTrigger: {
                  trigger: block,
                  start: MOTION.trigger.heading,
                  once: true,
                },
              });

              /* The eyebrow is optional (the CTA block has none). Without
                 one, an empty spacer keeps its slot so the lines start on
                 the same beat either way. */
              const eyebrow = block.querySelectorAll(sel("headingEyebrow"));
              if (eyebrow.length) {
                tl.fromTo(
                  eyebrow,
                  { opacity: 0, y: S.eyebrow.y },
                  { opacity: 1, y: 0, duration: S.eyebrow.duration },
                );
              } else {
                tl.to({}, { duration: S.eyebrow.duration });
              }

              tl.fromTo(
                self.lines,
                { yPercent: S.lines.yPercent },
                {
                  yPercent: 0,
                  duration: S.lines.duration,
                  stagger: S.lines.stagger,
                },
                S.lines.offset,
              );

              const sweep = heading.querySelectorAll(sel("sweep"));
              if (sweep.length) {
                tl.fromTo(
                  sweep,
                  { "--train": "100%" },
                  {
                    "--train": "0%",
                    duration: S.sweep.duration,
                    ease: arrive,
                    stagger: S.sweep.stagger,
                  },
                  S.sweep.offset,
                );
              }

              const lede = block.querySelectorAll(sel("headingLede"));
              if (lede.length) {
                tl.fromTo(
                  lede,
                  { opacity: 0, y: S.lede.y },
                  { opacity: 1, y: 0, duration: S.lede.duration },
                  S.lede.offset,
                );
              }

              const actions = block.querySelectorAll(sel("headingActions"));
              if (actions.length) {
                tl.fromTo(
                  actions,
                  { opacity: 0, y: S.actions.y },
                  {
                    opacity: 1,
                    y: 0,
                    duration: S.actions.duration,
                    stagger: S.actions.stagger,
                  },
                  S.actions.offset,
                );
              }

              return tl;
            },
          });
        } catch {
          /* A split failure must never leave a heading invisible. */
          show();
        }
      });
    };

    /* contextSafe keeps the deferred splits and tweens inside this hook's
       context, so they revert with it; `cancelled` stops a split that
       resolves after an unmount (Strict Mode mounts twice in dev). */
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    fontsReady.then(contextSafe ? contextSafe(splitHeadings) : splitHeadings);

    /* Fonts change metrics, which moves every trigger. */
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    /* A section that changes height after load (tabs) moves every trigger
       below it; measure again (PR #36 review). */
    const onLayoutChange = () => ScrollTrigger.refresh();
    window.addEventListener(LAYOUT_CHANGE_EVENT, onLayoutChange);

    return () => {
      cancelled = true;
      window.removeEventListener(LAYOUT_CHANGE_EVENT, onLayoutChange);
    };
  }, []);

  return null;
}
