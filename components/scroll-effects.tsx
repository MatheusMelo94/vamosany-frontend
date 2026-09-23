"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * Scroll motion for the landing page.
 *
 * Timing and easing come from the design system's motion section: 180ms /
 * 300ms on cubic-bezier(.2,.8,.2,1), subtle fade-and-translate reveals, and
 * no heavy parallax. Mounts nothing — it only wires ScrollTriggers to
 * elements marked up with data attributes, so every section stays a server
 * component. Bails out entirely under `prefers-reduced-motion`.
 */
export function ScrollEffects() {
  useEffect(() => {
    if (!document.documentElement.classList.contains("gsap")) return;

    gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);

    /* --ease-default from the design system */
    const ease = CustomEase.create("ds", "0.2, 0.8, 0.2, 1");

    /* A subway pulling in: flat out through the tunnel, a long brake into
       the platform, ~2% past the mark, then the settle back as it stops. */
    const arrive = CustomEase.create(
      "arrive",
      "M0,0 C0.06,0.42 0.14,0.82 0.4,0.965 0.55,1.02 0.66,1.022 0.76,1.006 0.86,0.995 0.93,1 1,1",
    );

    const ctx = gsap.context(() => {
      /* --- 1. Reveals: fade + short rise, once, on enter --------------- */
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      });

      /* --- 2. Grids stagger their own children ------------------------- */
      gsap.utils
        .toArray<HTMLElement>("[data-reveal-group]")
        .forEach((group) => {
          const items = Array.from(group.children) as HTMLElement[];
          if (!items.length) return;

          gsap.fromTo(
            items,
            { opacity: 0, y: 22 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease,
              stagger: 0.06,
              scrollTrigger: { trigger: group, start: "top 85%", once: true },
            },
          );
        });

      /* --- 4. Stats count up once ------------------------------------- */
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const end = Number(el.dataset.count);
        if (!Number.isFinite(end)) return;

        const prefix = el.dataset.prefix ?? "";
        const suffix = el.dataset.suffix ?? "";
        const counter = { value: 0 };
        const render = (v: number) =>
          `${prefix}${Math.round(v).toLocaleString("en-US")}${suffix}`;

        el.textContent = render(0);

        gsap.to(counter, {
          value: end,
          duration: 1.2,
          ease,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => {
            el.textContent = render(counter.value);
          },
          onComplete: () => {
            el.textContent = render(end);
          },
        });
      });

      /* --- 5. Marquee takes its speed from scroll velocity ------------- */
      const track = document.querySelector<HTMLElement>("[data-marquee]");
      if (track) {
        track.classList.add("is-gsap");

        const loop = gsap.to(track, {
          xPercent: -50,
          duration: 44,
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
              4,
              1 + Math.abs(self.getVelocity()) / 600,
            );
            gsap.to(loop, {
              timeScale: boost,
              duration: 0.18,
              overwrite: true,
              onComplete: () => {
                gsap.to(loop, { timeScale: 1, duration: 0.6 });
              },
            });
          },
        });
      }

      /* --- 6. Nav gains a surface once you leave the hero -------------- */
      const nav = document.querySelector<HTMLElement>("[data-nav]");
      if (nav) {
        ScrollTrigger.create({
          start: "top -80",
          end: 99999,
          onToggle: (self) =>
            nav.classList.toggle("is-scrolled", self.isActive),
        });
      }
      /* --- 7. The marker highlight draws in ---------------------------- */
      gsap.utils
        .toArray<HTMLElement>("[data-sweep]")
        .filter((el) => !el.closest("[data-hero-copy], [data-heading-block]"))
        .forEach((el) => {
          gsap.to(el, {
            "--train": "0%",
            duration: 1.0,
            delay: 0.12,
            ease: arrive,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });

      /* --- 9. The wide bridge band pans as it passes ------------------- */
      const band = document.querySelector<HTMLElement>("[data-pan-band]");
      if (band) {
        gsap.fromTo(
          band,
          { xPercent: 0 },
          {
            xPercent: -22,
            ease: "none",
            scrollTrigger: {
              trigger: band.closest("section"),
              start: "top bottom",
              end: "bottom top",
              scrub: 0.4,
            },
          },
        );
      }
      /* --- 10. Hero entrance: the headline rises line by line ----------
         SplitText wraps each line in an overflow-hidden mask, so the type
         slides up from behind its own edge rather than just fading. The
         marker sweep and the copy below are chained off the same timeline
         so the whole block reads as one move. `autoSplit` re-runs it when
         the font loads or the line count changes on resize. --------------- */
      const heroCopy = document.querySelector<HTMLElement>("[data-hero-copy]");
      if (heroCopy) {
        const heading = heroCopy.querySelector<HTMLElement>("h1");
        const reveal = () => gsap.set(heroCopy, { opacity: 1 });

        try {
          SplitText.create(heading, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) => {
              const tl = gsap.timeline({ defaults: { ease } });
              reveal();
              return tl
                .fromTo(
                  self.lines,
                  { yPercent: 115 },
                  { yPercent: 0, duration: 0.8, stagger: 0.09 },
                )
                .fromTo(
                  heading?.querySelectorAll("[data-sweep]") ?? [],
                  { "--train": "100%" },
                  /* one train per line; the second pulls in just behind the first */
                  {
                    "--train": "0%",
                    duration: 1.15,
                    ease: arrive,
                    stagger: 0.16,
                  },
                  "-=0.25",
                )
                .fromTo(
                  heroCopy.querySelector("[data-hero-quote]"),
                  { opacity: 0, y: 12 },
                  { opacity: 1, y: 0, duration: 0.5 },
                  "-=0.4",
                )
                .fromTo(
                  heroCopy.querySelector("[data-hero-actions]")?.children ?? [],
                  { opacity: 0, y: 14 },
                  { opacity: 1, y: 0, duration: 0.45, stagger: 0.08 },
                  "-=0.34",
                );
            },
          });
        } catch {
          /* If splitting fails for any reason, never leave the hero blank. */
          reveal();
        }
      }
      /* --- 11. Section headings reveal line by line -------------------
         Same masked-line treatment as the hero, but triggered on scroll and
         chained with the eyebrow, the marker sweep and the standfirst so
         each heading block reads as one move. --------------------------- */
      gsap.utils
        .toArray<HTMLElement>("[data-heading-block]")
        .forEach((block) => {
          const heading =
            block.querySelector<HTMLElement>("[data-split-lines]");
          const show = () => gsap.set(block, { opacity: 1 });

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
                const tl = gsap.timeline({
                  defaults: { ease },
                  scrollTrigger: {
                    trigger: block,
                    start: "top 85%",
                    once: true,
                  },
                });

                show();

                tl.fromTo(
                  block.querySelectorAll("[data-heading-eyebrow]"),
                  { opacity: 0, y: 8 },
                  { opacity: 1, y: 0, duration: 0.35 },
                ).fromTo(
                  self.lines,
                  { yPercent: 115 },
                  { yPercent: 0, duration: 0.7, stagger: 0.08 },
                  "-=0.15",
                );

                const sweep = heading.querySelectorAll("[data-sweep]");
                if (sweep.length) {
                  tl.fromTo(
                    sweep,
                    { "--train": "100%" },
                    {
                      "--train": "0%",
                      duration: 1.0,
                      ease: arrive,
                      stagger: 0.14,
                    },
                    "-=0.3",
                  );
                }

                const lede = block.querySelectorAll("[data-heading-lede]");
                if (lede.length) {
                  tl.fromTo(
                    lede,
                    { opacity: 0, y: 12 },
                    { opacity: 1, y: 0, duration: 0.45 },
                    "-=0.42",
                  );
                }

                const actions = block.querySelectorAll(
                  "[data-heading-actions]",
                );
                if (actions.length) {
                  tl.fromTo(
                    actions,
                    { opacity: 0, y: 12 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 },
                    "-=0.3",
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
    });

    /* Fonts change metrics, which moves every trigger. */
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, []);

  return null;
}
