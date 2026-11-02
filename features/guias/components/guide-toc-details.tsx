"use client";

import { useRef, type JSX } from "react";
import type { TocItem } from "@/features/guias/content/toc";

/**
 * Mobile "En esta guía" (≤960px): a native <details>. Without JS it is a plain
 * disclosure that stays open once opened and still works; with JS, choosing a
 * link closes it and moves focus to the section heading (the closing list
 * would otherwise take the focus with it). Opening never moves focus.
 * Hidden with `display: none` from the aside container width up, so only one
 * "En esta guía" is ever in the accessibility tree (plan § 2).
 */
export function GuideTocDetails({ items }: { items: TocItem[] }): JSX.Element {
  const ref = useRef<HTMLDetailsElement>(null);

  return (
    <details
      ref={ref}
      className="border-hairline @guide-aside:hidden mb-6 rounded-xl border px-4.5"
    >
      <summary className="tap-target flex min-h-11 cursor-pointer items-center font-bold">
        En esta guía
      </summary>
      <ol className="flex flex-col gap-1 pb-3.5 pl-5">
        {items.map(({ id, label }) => (
          <li key={id} className="list-decimal">
            <a
              href={`#${id}`}
              onClick={() => {
                ref.current?.removeAttribute("open");
                document.getElementById(id)?.focus({ preventScroll: true });
              }}
              className="tap-target body-sm hover:bg-surface-1 -ml-1 block rounded-lg px-1 py-3"
            >
              {label}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}
