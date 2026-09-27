import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import type { ClosingContent } from "@/features/sobre-mi/types";
import { sm } from "@/features/sobre-mi/motion/attributes";

/**
 * Slot 05 (spec § Shared Page Structure): one headline sentence and one
 * primary (yellow) action, optionally a secondary (outline) one, between two
 * 2px ink rules, with an optional paragraph under the headline. Wraps to headline-above-buttons on narrow widths.
 */
export function ClosingRow({
  headline,
  text,
  primary,
  secondary,
}: ClosingContent): JSX.Element {
  return (
    <div {...sm("closing")} className="mt-14">
      <div className="border-ink flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-y-2 py-7">
        <div className="max-w-prose">
          {/* arbitrary: 26ch headline measure (spec slot 05); no measure token */}
          <h2
            {...sm("closingItem")}
            className="headline text-ink max-w-[26ch] text-balance"
          >
            {headline}
          </h2>
          {text ? (
            <p {...sm("closingItem")} className="body-base text-ink-muted mt-2">
              {text}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2.5">
          <span {...sm("closingItem")} className="inline-flex">
            <Button href={primary.href}>{primary.label}</Button>
          </span>
          {secondary ? (
            <span {...sm("closingItem")} className="inline-flex">
              <Button href={secondary.href} variant="secondary">
                {secondary.label}
              </Button>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
