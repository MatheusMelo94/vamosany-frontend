"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Stacked "overscroll": each section pins when its bottom reaches the
 * viewport bottom, and the next one slides over it (native scroll) while
 * the pinned one shrinks and fades beneath. Sections taller than the
 * viewport first fake-scroll their overflow so nothing is skipped.
 *
 * Applies to every direct <section> of <main> except the last; header and
 * footer are untouched. Skipped entirely under reduced motion / no JS.
 */
export function Overscroll() {
  useEffect(() => {
    if (!document.documentElement.classList.contains("gsap")) return;
    gsap.registerPlugin(ScrollTrigger);

    const all = gsap.utils.toArray<HTMLElement>("main > section");
    /* The last section isn't pinned, but it still slides over the one before
       it, so it needs the same opaque background and a top z-index. */
    all.forEach((sec, i) => {
      sec.style.backgroundColor = "var(--color-canvas)";
      sec.style.position = "relative";
      sec.style.zIndex = String(i + 1);
    });
    const panels = all.slice(0, -1);
    let ctx: gsap.Context | undefined;

    const setup = () => {
      ctx = gsap.context(() => {
        panels.forEach((panel, i) => {
          /* Later sections paint over earlier, pinned ones, and every
             pinned panel is opaque so the one beneath never bleeds through. */
          /* Scale from the top so the receding panel never peeks out from
             under the section sliding over it; the fade carries the depth. */
          panel.style.transformOrigin = "50% 0%";

          const panelHeight = panel.offsetHeight;
          const windowHeight = window.innerHeight;

          /* Two cases scroll normally instead of stacking:
             - a section that does not fill the viewport is pinned the moment
               it appears and covered before it can be read;
             - a section whose successor is short can never be covered by it,
               so pinning it leaves it exposed beneath the successor. */
          const next = all[i + 1];
          if (panelHeight < windowHeight * 0.85) return;
          if (next && next.offsetHeight < windowHeight * 0.85) return;
          /* A section much taller than the viewport would fake-scroll for its
             whole overflow before the next one arrives — hundreds of pixels of
             apparent blank space. Those scroll normally instead. */
          if (panelHeight > windowHeight * 1.25) return;

          const overflow = Math.max(0, panelHeight - windowHeight);

          /* While the panel is pinned it is out of the document flow, so the
             next section arrives `overflow` px early. Reserve that space. */
          if (overflow) panel.style.marginBottom = overflow + "px";

          /* The panel stays pinned and fully readable while the next section
             slides up over it; it only recedes once mostly covered. Without
             this hold, content faded the moment the next section touched
             the bottom of the viewport and could not be read to the end. */
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: panel,
              start: "bottom bottom",
              /* fake-scroll the overflow, then one viewport of exit */
              end: () => `+=${overflow + windowHeight}`,
              pin: true,
              pinSpacing: false,
              scrub: true,
              invalidateOnRefresh: true,
            },
          });

          if (overflow) {
            tl.to(panel, { y: -overflow, duration: overflow / windowHeight, ease: "none" });
          }
          tl.to(panel, { duration: 0.6 }) /* hold: the successor covers 60% of the viewport */
            .to(panel, { scale: 0.96, opacity: 0, duration: 0.4, ease: "none" });
        });
      });
    };

    let cancelled = false;
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setup();
      });
    });

    return () => {
      cancelled = true;
      ctx?.revert();
      all.forEach((p) => {
        p.style.marginBottom = "";
        p.style.zIndex = "";
        p.style.position = "";
        p.style.backgroundColor = "";
        p.style.transformOrigin = "";
      });
    };
  }, []);

  return null;
}
