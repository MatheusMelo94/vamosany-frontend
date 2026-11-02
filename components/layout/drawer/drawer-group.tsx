import type { JSX } from "react";
import { Fragment, useId, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NavGroup } from "@/components/layout/nav-config";
import { isCurrentHref, itemHref, scentLine } from "./nav-model";

type Props = {
  group: NavGroup;
  /** Logical state: drives aria-expanded, and the body's inertness. */
  expanded: boolean;
  /** The body is painted: expanded, or still collapsing (plan § 7.4). */
  painted?: boolean;
  /** The group holds the current page: the header carries the dot (S4, S5). */
  hasCurrent: boolean;
  pathname: string;
  onToggle: () => void;
  /** An item was tapped: the drawer closes and navigation proceeds. */
  onNavigate: () => void;
};

/**
 * The 2px ink ring every drawer control shows from the keyboard (AC 38).
 * The color is set unfocused too: `transition-colors` also transitions
 * outline-color, and on an ink-filled control the ring would otherwise fade
 * in from its white currentColor.
 */
export const FOCUS_RING =
  "outline-ink focus-visible:outline-2 focus-visible:outline-offset-2";

/**
 * One accordion group of the drawer "Índice" (plan § 1, § 8): an h2 header
 * button named by the label and described by the scent line, and its body.
 */
export function DrawerGroup({
  group,
  expanded,
  painted = expanded,
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
      {/* The wrapper's height is animated (ADR-0009), so it has no padding;
          a collapsing body stays painted but inert: its links leave the tab
          order and the accessibility tree at once (plan § 7.4). */}
      <div
        id={bodyId}
        data-drawer-body
        hidden={!painted}
        inert={painted && !expanded}
      >
        <div className="flow-root pb-3">
          {group.columns.map((column) => (
            <Fragment key={column.heading}>
              <h3 className="eyebrow text-ink-muted mt-3 mb-1">
                {column.heading}
              </h3>
              <ul>
                {column.items.map((item) => (
                  <li key={item.title}>
                    <DrawerRow
                      href={itemHref(item)}
                      title={item.title}
                      tag={item.tag}
                      price={item.price}
                      current={isCurrentHref(item.href, pathname)}
                      onNavigate={onNavigate}
                    />
                  </li>
                ))}
              </ul>
            </Fragment>
          ))}
          {group.footerLink ? (
            <div className="mt-3">
              <DrawerRow
                href={group.footerLink.href}
                title={
                  <>
                    {group.footerLink.label} <span aria-hidden>→</span>
                  </>
                }
                current={isCurrentHref(group.footerLink.href, pathname)}
                onNavigate={onNavigate}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type RowProps = {
  href: string;
  title: ReactNode;
  tag?: string;
  price?: string;
  current: boolean;
  onNavigate: () => void;
};

/** One row of a group body: the title, an optional tag and price, and the
 *  current-page dot (DDR-0003). Items and the group's footer link share it. */
function DrawerRow({
  href,
  title,
  tag,
  price,
  current,
  onNavigate,
}: RowProps): JSX.Element {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "group/row border-surface-1 flex min-h-11 flex-wrap items-center gap-2 border-b py-1",
        FOCUS_RING,
      )}
    >
      {/* The row wraps only when even the title's narrowest
        form can't sit beside the tag and price (200% text,
        QA-0007): the line break uses its min-content basis,
        and it grows back to its natural width otherwise.
        Arbitrary value: a sizing keyword, no token exists. */}
      <span
        data-row-title
        className="body-sm text-ink max-w-max min-w-0 grow basis-[min-content] font-semibold underline-offset-4 group-hover/row:underline"
      >
        {title}
      </span>
      {tag ? (
        <span
          data-row-tag
          className="caption bg-brand text-ink max-w-full shrink-0 rounded-full px-2 py-0.5 font-semibold"
        >
          {tag}
        </span>
      ) : null}
      {/* Price, then the dot, at the row's end: the dot never
        overlaps the title, tag or price (DDR-0003). */}
      {price || current ? (
        <span className="ml-auto flex max-w-full shrink-0 items-center gap-2">
          {price ? (
            <span
              data-row-price
              className="body-sm text-ink min-w-0 text-right font-mono font-bold"
            >
              {price}
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
  );
}
