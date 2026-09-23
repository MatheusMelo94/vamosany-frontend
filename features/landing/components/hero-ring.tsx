"use client";

import type { JSX } from "react";
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
 * Deal `count` slots from `n` images so no two neighbours share a photo —
 * including slot count-1 next to slot 0, where the ring closes. A plain
 * cycle fails there whenever count % n === 0 or 1; walking the images with
 * a stride coprime to n never repeats a neighbour, and the seam is fixed
 * by swapping the last slot with its predecessor when needed.
 */
function dealSlots(count: number, n: number): number[] {
  if (n < 2) return Array.from({ length: count }, () => 0);
  const stride = [1, 2, 3, 4, 5].find((k) => k < n && gcd(k, n) === 1) ?? 1;
  const slots = Array.from({ length: count }, (_, i) => (i * stride) % n);
  if (count > 2 && slots[count - 1] === slots[0]) {
    const alt = slots.findIndex(
      (v, i) =>
        i > 0 &&
        i < count - 2 &&
        v !== slots[0] &&
        v !== slots[count - 2] &&
        slots[i - 1] !== slots[count - 1] &&
        slots[i + 1] !== slots[count - 1],
    );
    if (alt > 0)
      [slots[count - 1], slots[alt]] = [slots[alt], slots[count - 1]];
  }
  return slots;
}
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

/**
 * A horizontal cylinder of photo cards seen from the front. Each card is
 * rotated into place on the ring and pushed out to the radius; back-facing
 * cards hide via backface-visibility. GSAP spins the ring, slows it on hover,
 * pauses it off-screen and nudges it with scroll velocity. Decorative only.
 */
export function HeroRing({
  images,
  count = 16,
  radius = 560,
  speed = 36,
}: Props): JSX.Element {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    const stage = ring?.parentElement;
    if (!ring || !stage) return;
    /* Reduced motion: no tween, no handlers — the ring simply stands still,
       but the far hemisphere still has to be hidden once. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const n = ring.children.length;
      Array.from(ring.children).forEach((card, i) => {
        const facing = Math.cos(((i * 360) / n) * (Math.PI / 180));
        (card as HTMLElement).style.setProperty(
          "--vis",
          facing <= 0 ? "0" : String(Math.min(1, facing / 0.26)),
        );
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* Cards on the far hemisphere are hidden per frame: a card is "near" when
       its angle plus the ring's rotation faces the camera (cos > 0). */
    const cards = Array.from(ring.querySelectorAll<HTMLElement>(".ringCard"));
    const n = cards.length;
    const cull = () => {
      const ringDeg = Number(gsap.getProperty(ring, "rotateY")) || 0;
      cards.forEach((card, i) => {
        const deg = ((i * 360) / n + ringDeg) * (Math.PI / 180);
        const facing = Math.cos(deg);
        /* fade over the last 15° before the edge so cards do not pop */
        const vis = facing <= 0 ? 0 : Math.min(1, facing / 0.26);
        card.style.setProperty("--vis", vis.toFixed(3));
      });
    };
    cull();

    /* 1. spin — one full turn every `speed` seconds, linear, forever */
    const spin = gsap.to(ring, {
      rotateY: -360,
      duration: speed,
      ease: "none",
      repeat: -1,
      onUpdate: cull,
    });

    /* 2. hover — ease down to quarter speed, back up on leave */
    const slow = () =>
      gsap.to(spin, { timeScale: 0.25, duration: 0.6, overwrite: true });
    const normal = () =>
      gsap.to(spin, { timeScale: 1, duration: 0.6, overwrite: true });
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

  const slots = dealSlots(count, images.length);
  const seen = new Map<number, number>();
  const cards = slots.map((idx) => {
    const img = images[idx];
    const lap = seen.get(idx) ?? 0;
    seen.set(idx, lap + 1);
    return {
      src: img.src,
      position:
        lap === 0
          ? (img.position ?? "50% 50%")
          : LAP_POSITIONS[(lap - 1) % LAP_POSITIONS.length],
    };
  });

  return (
    <div
      className="ringStage"
      aria-hidden="true"
      data-speed={speed}
      style={{ "--radius-desktop": `${radius}px` } as CSSProperties}
    >
      <div
        className="ring"
        data-ring
        ref={ringRef}
        style={{ "--count": count } as CSSProperties}
      >
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
              />
            </picture>
          </div>
        ))}
      </div>
    </div>
  );
}
