"use client";

import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { activeSectionId } from "@/features/guias/lib/active-section";
import { settleAtMargin } from "@/features/guias/lib/settle-scroll";
import { useAlignToHash } from "@/features/guias/hooks/use-align-to-hash";
import type { TocItem } from "@/features/guias/content/toc";
import { cn } from "@/lib/utils";

/** Where a heading counts as "passed" (spec § Motion Intent). */
const LINE = 120;

/**
 * The index is `display: none` below the aside container width
 * (`--container-guide-aside`, 60.0625rem in app/globals.css); the container is
 * never wider than the viewport, so a viewport under this width means the index
 * is certainly hidden and its scroll work is waste (RV-0046). In rem, like the
 * container query, so the two agree at any browser default font size (RV-0048).
 */
const INDEX_VISIBLE = "(min-width: 60.0625rem)";

/**
 * The aside's "En esta guía" index (≥961px): real anchors, the section being
 * read marked `aria-current="location"` with a yellow fill and bold weight (a
 * non-colour cue), and focus moved to the target H2 on click.
 *
 * Client leaf with serializable props only (plan § 2). The page is complete
 * without it: the server HTML and the first client render mark nothing
 * active, which is the no-JS state. The scroll listener only reads DOM
 * geometry (it fetches nothing), one passive handler throttled to a frame.
 */
export function GuideToc({ items }: { items: TocItem[] }): JSX.Element {
  const [active, setActive] = useState<string | null>(null);
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  useAlignToHash(ids);
  const cancelSettle = useRef<(() => void) | null>(null);
  useEffect(() => () => cancelSettle.current?.(), []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const tops = items.flatMap(({ id }) => {
        const heading = document.getElementById(id);
        return heading
          ? [{ id, top: heading.getBoundingClientRect().top }]
          : [];
      });
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      setActive(activeSectionId({ tops, line: LINE, atBottom }));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    let listening = false;
    const start = () => {
      if (listening) return;
      listening = true;
      // Once on showing: covers a hash jump the browser already made.
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
    };
    const stop = () => {
      if (!listening) return;
      listening = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    const media = window.matchMedia(INDEX_VISIBLE);
    const sync = () => (media.matches ? start() : stop());
    sync();
    media.addEventListener("change", sync);
    return () => {
      media.removeEventListener("change", sync);
      stop();
    };
  }, [items]);

  return (
    <nav
      aria-label="En esta guía"
      className="border-hairline @guide-aside:block hidden rounded-lg border px-5 py-4.5"
    >
      <span className="eyebrow">En esta guía</span>
      <ol className="mt-3 flex flex-col gap-2">
        {items.map(({ id, label }) => {
          const current = active === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={current ? "location" : undefined}
                // Not preventDefault: the browser scrolls (smoothly, or at once
                // under reduced motion) and sets the hash; focus follows (AC 23).
                // A layout refresh can cancel that scroll, so settleAtMargin
                // re-aligns the heading if it ends short (RV-0049).
                onClick={() => {
                  const heading = document.getElementById(id);
                  if (!heading) return;
                  heading.focus({ preventScroll: true });
                  cancelSettle.current?.();
                  cancelSettle.current = settleAtMargin(heading);
                }}
                className={cn(
                  "tap-target body-sm block rounded-xl px-2.5 py-1.5 transition-colors",
                  current
                    ? "bg-brand text-on-brand font-bold"
                    : "text-ink-muted hover:bg-surface-1 hover:text-ink",
                )}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
