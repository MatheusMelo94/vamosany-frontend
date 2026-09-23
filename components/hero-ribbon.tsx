"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";

/* Four New York photographs, dealt into two walls in different orders so
   the same picture is never opposite itself. */
const PHOTOS = [
  ["/img/hero-nyc.webp", "New York City street"],
  ["/img/hero-aerial.webp", "Manhattan skyline from the air"],
  ["/img/hero-manhattan.webp", "Manhattan"],
  ["/img/hero-view.webp", "A view over New York City"],
] as const;

const LEFT = [0, 1, 2, 3, 0, 1, 2, 3];
const RIGHT = [2, 3, 0, 1, 2, 3, 0, 1];

function Wall({ side, order }: { side: "left" | "right"; order: number[] }) {
  return (
    <div className={`ribbon-wall ribbon-wall-${side}`} aria-hidden>
      <div className="ribbon-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="ribbon-set">
            {order.map((i) => (
              <figure key={`${copy}-${i}`} className="ribbon-card">
                <Image
                  src={PHOTOS[i][0]}
                  alt={copy === 0 ? PHOTOS[i][1] : ""}
                  width={560}
                  height={700}
                  sizes="400px"
                  className="h-full w-full object-cover"
                  priority={copy === 0}
                />
              </figure>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Melius-style perspective corridor. Each wall is a long strip rotated
 * almost edge-on to the camera, so the photographs shrink toward the
 * vanishing point at the centre and grow until the viewport clips them.
 * GSAP slides each strip along its own axis on an endless loop; the strip
 * holds two identical sets, so wrapping at -50% is seamless.
 */
export function HeroRibbon() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !document.documentElement.classList.contains("gsap")) return;

    const ctx = gsap.context(() => {
      const left = el.querySelector(".ribbon-wall-left .ribbon-track");
      const right = el.querySelector(".ribbon-wall-right .ribbon-track");
      /* Left wall's far end is on the right, so cards travel to -x;
         the right wall mirrors it. Same speed, opposite directions. */
      gsap.fromTo(
        left,
        { xPercent: 0 },
        { xPercent: -50, duration: 46, ease: "none", repeat: -1 },
      );
      gsap.fromTo(
        right,
        { xPercent: -50 },
        { xPercent: 0, duration: 46, ease: "none", repeat: -1 },
      );
      gsap.fromTo(
        el,
        { opacity: 0 },
        { opacity: 1, duration: 1.4, ease: "power2.out", delay: 0.2 },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="hero-ribbon" aria-hidden>
      <Wall side="left" order={LEFT} />
      <Wall side="right" order={RIGHT} />
    </div>
  );
}
