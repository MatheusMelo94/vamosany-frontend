import type { JSX } from "react";
import { useId } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NavGroup } from "@/components/layout/nav-config";
import { isCurrentHref, itemHref, scentLine } from "./nav-model";

type Props = {
  group: NavGroup;
  /** Logical state: drives aria-expanded and the body's visibility. */
  expanded: boolean;
  /** The group holds the current page: the header carries the dot (S4, S5). */
  hasCurrent: boolean;
  pathname: string;
  onToggle: () => void;
  /** An item was tapped: the drawer closes and navigation proceeds. */
  onNavigate: () => void;
};

/** The 2px ink ring every drawer control shows from the keyboard (AC 38). */
export const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

/**
 * One accordion group of the drawer "Índice" (plan § 1, § 8): an h2 header
 * button named by the label and described by the scent line, and its body.
 */
export function DrawerGroup({
  group,
  expanded,
  hasCurrent,
  pathname,
  onToggle,
  onNavigate,
}: Props): JSX.Element {
  const id = useId();
  const labelId = `${id}-label`;
  const scentId = `${id}-scent`;
  const bodyId = `${id}-body`;

  return (
    <div data-drawer-group className="border-hairline border-b">
      <h2>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={bodyId}
          aria-labelledby={labelId}
          aria-describedby={scentId}
          onClick={onToggle}
          className={cn(
            "group flex min-h-14 w-full items-center gap-2 py-2.5 text-left",
            FOCUS_RING,
          )}
        >
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex items-center gap-2">
              <span id={labelId} className="body-lg text-ink font-bold">
                {group.label}
              </span>
              {/* Static "you are here" dot, 8px after the label (DDR-0003, S4). */}
              {hasCurrent ? (
                <span
                  data-header-dot
                  aria-hidden
                  className="bg-brand size-1.5 shrink-0 rounded-full"
                />
              ) : null}
            </span>
            <span id={scentId} className="eyebrow text-ink-muted">
              {scentLine(group)}
            </span>
          </span>
          {/* The desktop trigger's chevron. It rotates through the `rotate`
              property; the transition exists only under .gsap (globals.css). */}
          <svg
            data-drawer-chevron
            viewBox="0 0 12 12"
            aria-hidden
            className="text-ink size-3 shrink-0 group-aria-expanded:rotate-180"
          >
            <path
              d="m3 4.5 3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </h2>
      <div id={bodyId} data-drawer-body hidden={!expanded} className="pb-3">
        {group.columns.map((column) => (
          <div key={column.heading} className="mt-4 first:mt-0">
            <p className="eyebrow">{column.heading}</p>
            <ul className="mt-2 space-y-2">
              {column.items.map((item) => {
                const current = isCurrentHref(item.href, pathname);
                return (
                  <li key={item.title}>
                    <Link
                      href={itemHref(item)}
                      aria-current={current ? "page" : undefined}
                      onClick={onNavigate}
                      className={cn(
                        "body-sm text-ink-subtle flex items-center justify-between gap-3",
                        // Coarse pointers: the hit area fills the item's slot (QA-0004);
                        // replaced by 44px rows in T008.
                        "pointer-coarse:relative pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:-inset-y-1",
                      )}
                    >
                      {item.title}
                      {item.price ? (
                        <span className="caption text-ink font-semibold">
                          {item.price}
                        </span>
                      ) : null}
                      {current ? (
                        <span
                          data-current-dot
                          aria-hidden
                          className="bg-brand size-1.5 rounded-full"
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
