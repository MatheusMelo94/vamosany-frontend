"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type RingImage = { src: string; alt?: string; position?: string };

type Props = {
  images: RingImage[];
  /** cards on the ring; images cycle to fill it */
  count?: number;
  /** cylinder radius in px */
  radius?: number;
  /** seconds per revolution (used by the spin, step 2) */
  speed?: number;
};

/* When the images cycle to fill the ring, each lap gets its own crop so
   the same photo never reads as a duplicate next to itself. */
const LAP_POSITIONS = ["55% 35%", "45% 70%", "60% 25%", "40% 50%"];

/**
 * A horizontal cylinder of photo cards seen from the front. Each card is
 * rotated into place on the ring and pushed out to the radius; back-facing
 * cards hide via backface-visibility. GSAP spins the ring, slows it on hover,
 * pauses it off-screen and nudges it with scroll velocity. Decorative only.
 */
export function HeroRing({ images, count = 16, radius = 560, speed = 36 }: Props) {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    const stage = ring?.parentElement;
    if (!ring || !stage) return;
    /* Reduced motion: no tween, no handlers — the ring simply stands still. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    /* 1. spin — one full turn every `speed` seconds, linear, forever */
    const spin = gsap.to(ring, { rotateY: -360, duration: speed, ease: "none", repeat: -1 });

    /* 2. hover — ease down to quarter speed, back up on leave */
    const slow = () => gsap.to(spin, { timeScale: 0.25, duration: 0.6, overwrite: true });
    const normal = () => gsap.to(spin, { timeScale: 1, duration: 0.6, overwrite: true });
    stage.addEventListener("mouseenter", slow);
    stage.addEventListener("mouseleave", normal);

    /* 3. off-screen — pause the tween so nothing composites unseen */
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) spin.play();
      else spin.pause();
    });
    io.observe(stage);

    /* 4. scroll nudge — faster with scroll velocity, settle back once it stops */
    let hovering = false;
    stage.addEventListener("mouseenter", () => (hovering = true));
    stage.addEventListener("mouseleave", () => (hovering = false));
    let settle: number | undefined;
    const trigger = ScrollTrigger.create({
      onUpdate: (self) => {
        if (hovering) return;
        const scale = gsap.utils.clamp(0.5, 3, 1 + self.getVelocity() / 2000);
        gsap.to(spin, { timeScale: scale, duration: 0.3, overwrite: true });
        window.clearTimeout(settle);
        settle = window.setTimeout(() => {
          gsap.to(spin, { timeScale: 1, duration: 0.8, overwrite: true });
        }, 150);
      },
    });

    return () => {
      window.clearTimeout(settle);
      trigger.kill();
      io.disconnect();
      stage.removeEventListener("mouseenter", slow);
      stage.removeEventListener("mouseleave", normal);
      spin.kill();
    };
  }, [speed]);

  const cards = Array.from({ length: count }, (_, i) => {
    const img = images[i % images.length];
    const lap = Math.floor(i / images.length);
    return {
      src: img.src,
      position: lap === 0 ? (img.position ?? "50% 50%") : LAP_POSITIONS[(lap - 1) % LAP_POSITIONS.length],
    };
  });

  return (
    <div
      className="ringStage"
      aria-hidden="true"
      data-speed={speed}
      style={{ "--radius-desktop": `${radius}px` } as CSSProperties}
    >
      <div className="ring" data-ring ref={ringRef} style={{ "--count": count } as CSSProperties}>
        {cards.map((c, i) => (
          <div
            key={i}
            className="ringCard"
            style={{ "--i": i, "--pos": c.position } as CSSProperties}
          >
            {/* real <img> so lazy loading applies; WebP with JPEG fallback */}
            <picture>
              <source srcSet={`${c.src}.webp`} type="image/webp" />
              <img
                src={`${c.src}.jpg`}
                alt=""
                width={700}
                height={1000}
                loading={i < 3 ? "eager" : "lazy"}
                decoding="async"
                style={{ objectPosition: c.position }}
              />
            </picture>
          </div>
        ))}
      </div>
    </div>
  );
}
