import type { JSX } from "react";
import { Fragment, useId } from "react";
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
          <Fragment key={column.heading}>
            <h3 className="eyebrow text-ink-muted mt-3 mb-1">
              {column.heading}
            </h3>
            <ul>
              {column.items.map((item) => {
                const current = isCurrentHref(item.href, pathname);
                return (
                  <li key={item.title}>
                    <Link
                      href={itemHref(item)}
                      aria-current={current ? "page" : undefined}
                      onClick={onNavigate}
                      className={cn(
                        "group/row border-surface-1 flex min-h-11 items-center gap-2 border-b py-1",
                        FOCUS_RING,
                      )}
                    >
                      <span
                        data-row-title
                        className="body-sm text-ink min-w-0 font-semibold underline-offset-4 group-hover/row:underline"
                      >
                        {item.title}
                      </span>
                      {item.tag ? (
                        <span
                          data-row-tag
                          className="caption bg-brand text-ink shrink-0 rounded-full px-2 py-0.5 font-semibold whitespace-nowrap"
                        >
                          {item.tag}
                        </span>
                      ) : null}
                      {/* Price, then the dot, at the row's end: the dot never
                          overlaps the title, tag or price (DDR-0003). */}
                      {item.price || current ? (
                        <span className="ml-auto flex shrink-0 items-center gap-2">
                          {item.price ? (
                            <span
                              data-row-price
                              className="body-sm text-ink font-mono font-bold whitespace-nowrap"
                            >
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
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
