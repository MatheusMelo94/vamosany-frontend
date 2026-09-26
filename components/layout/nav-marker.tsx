"use client";

import type { JSX } from "react";
import { useRef } from "react";
import { gsap, motionEnabled, useGSAP } from "@/lib/gsap";
import { getEases } from "@/lib/gsap-ease";
import { MOTION } from "@/lib/motion";

const ITEM = "[data-nav-item]";

/** Seconds from a CSS duration token ("120ms"); 0 when the token is unavailable. */
function tokenSeconds(value: string): number {
  const ms = Number.parseFloat(value);
  return Number.isFinite(ms) ? ms / 1000 : 0;
}

/**
 * The moving "you are pointing here" marker of one open mega-menu panel
 * (DDR-0003; plan § 8.7). Loaded with next/dynamic (ssr: false) and mounted
 * as the panel's first child, so it only exists while a desktop panel is open.
 *
 * - One grey highlight: a panel-sized `surface-1` layer whose `clip-path:
 *   inset(… round var(--radius-xl))` is tweened onto the target item (no
 *   width/height tweens, § Animation).
 * - One yellow dot: moved with x/y, stretched along the way.
 * - Follows pointer and keyboard focus over `[data-nav-item]`; returns to the
 *   `aria-current` item when the pointer leaves the items; retargets mid-flight.
 * - Motion off (no `.gsap`, ADR-0002): every move is an instant `set`.
 * - Marks the panel `data-marker-ready`, which turns off the per-item hover
 *   background it replaces (without JS the items keep today's hover).
 */
export function NavMarker(): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const root = rootRef.current;
      const layer = layerRef.current;
      const dot = dotRef.current;
      const panel = root?.parentElement;
      if (!root || !layer || !dot || !panel || !contextSafe) return;

      const animate = motionEnabled();
      const { arrive } = getEases();
      const { pill, stretchMax, stretchDivisor, squash, stretchEase } =
        MOTION.menuMarker;
      const tokens = getComputedStyle(document.documentElement);
      const radius = tokens.getPropertyValue("--radius-xl").trim();
      const fade = tokenSeconds(tokens.getPropertyValue("--duration-fast"));

      const current = panel.querySelector<HTMLElement>(
        `${ITEM}[aria-current="page"]`,
      );
      let target: HTMLElement | null = null;

      const geometry = (item: HTMLElement) => {
        const box = root.getBoundingClientRect();
        const r = item.getBoundingClientRect();
        const top = r.top - box.top;
        const left = r.left - box.left;
        const right = box.width - (left + r.width);
        const bottom = box.height - (top + r.height);
        return {
          clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px${radius ? ` round ${radius}` : ""})`,
          x: left + r.width - MOTION.menuMarker.dotOffset.right,
          y: top + MOTION.menuMarker.dotOffset.top,
        };
      };

      const place = (item: HTMLElement) => {
        const { clipPath, x, y } = geometry(item);
        gsap.set(layer, { clipPath });
        gsap.set(dot, { x, y, scaleX: 1, scaleY: 1 });
      };

      const moveTo = contextSafe((item: HTMLElement) => {
        if (item === target) return;
        const first = target === null;
        target = item;

        if (first || !animate) {
          gsap.killTweensOf([layer, dot]);
          place(item);
          if (first && animate && item !== current) {
            gsap.fromTo(
              [layer, dot],
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: fade },
            );
          } else {
            gsap.set([layer, dot], { autoAlpha: 1 });
          }
          return;
        }

        const { clipPath, x, y } = geometry(item);
        const distance =
          Math.abs(x - Number(gsap.getProperty(dot, "x"))) +
          Math.abs(y - Number(gsap.getProperty(dot, "y")));
        gsap.to(layer, {
          clipPath,
          duration: pill,
          ease: arrive,
          overwrite: "auto",
        });
        gsap.to(dot, {
          x,
          y,
          duration: MOTION.menuMarker.dot,
          ease: arrive,
          overwrite: "auto",
        });
        gsap.to(dot, {
          keyframes: {
            scaleX: [1, Math.min(stretchMax, 1 + distance / stretchDivisor), 1],
            scaleY: [1, squash, 1],
          },
          duration: MOTION.menuMarker.dot,
          ease: stretchEase,
          overwrite: "auto",
        });
      });

      const itemOf = (node: EventTarget | null): HTMLElement | null =>
        node instanceof Element ? node.closest<HTMLElement>(ITEM) : null;

      const onOver = (e: Event) => {
        const item = itemOf(e.target);
        if (item && panel.contains(item)) moveTo(item);
      };
      const onOut = (e: Event) => {
        const to = (e as PointerEvent).relatedTarget;
        if (itemOf(to)) return;
        if (current) moveTo(current);
      };
      const onResize = contextSafe(() => {
        if (target) place(target);
      });

      if (current) moveTo(current);

      panel.setAttribute("data-marker-ready", "");
      panel.addEventListener("pointerover", onOver);
      panel.addEventListener("focusin", onOver);
      panel.addEventListener("pointerout", onOut);
      window.addEventListener("resize", onResize);

      return () => {
        panel.removeAttribute("data-marker-ready");
        panel.removeEventListener("pointerover", onOver);
        panel.removeEventListener("focusin", onOver);
        panel.removeEventListener("pointerout", onOut);
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      data-nav-marker
      aria-hidden
      className="pointer-events-none absolute inset-0"
    >
      <span
        ref={layerRef}
        data-marker-layer
        className="bg-surface-1 invisible absolute inset-0 opacity-0"
      />
      <span
        ref={dotRef}
        data-marker-dot
        className="bg-brand ring-ink invisible absolute top-0 left-0 size-2.5 rounded-full opacity-0 ring-2"
      />
    </div>
  );
}
