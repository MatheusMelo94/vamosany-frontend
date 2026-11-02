"use client";

import { useEffect, useMemo, useState, type JSX } from "react";
import { activeSectionId } from "@/features/guias/lib/active-section";
import { useAlignToHash } from "@/features/guias/lib/use-align-to-hash";
import type { TocItem } from "@/features/guias/content/toc";
import { cn } from "@/lib/utils";

/** Where a heading counts as "passed" (spec § Motion Intent). */
const LINE = 120;

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
    // Once after hydration: covers a hash jump the browser already made.
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
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
                onClick={() =>
                  document.getElementById(id)?.focus({ preventScroll: true })
                }
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
