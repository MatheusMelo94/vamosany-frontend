import type { JSX } from "react";
import type { LedgerRow } from "@/features/sobre-mi/types";
import { sm } from "@/features/sobre-mi/motion/attributes";
import { ExternalLink } from "@/features/sobre-mi/components/external-link";
import { PullLine } from "@/features/sobre-mi/components/pull-line";
import { RichText } from "@/features/sobre-mi/components/rich-text";

type Props = { rows: readonly LedgerRow[] };

/**
 * The Colaboraciones ledger (spec § Page 2): one row per product, the year
 * and partner line in a 200px column beside the title and story from the
 * `--container-gutter` breakpoint, stacked above them below it. The first
 * row opens with a 2px ink rule, the rest with a hairline.
 *
 * The year is an aria-hidden twin (M4 ticks it) next to an sr-only final
 * value, so assistive tech only ever reads the final year (AC 29).
 */
export function ProductLedger({ rows }: Props): JSX.Element {
  return (
    <ol className="@container">
      {rows.map((row) => (
        <li
          key={row.title}
          className="border-hairline first:border-ink @gutter:flex-row @gutter:gap-10 flex flex-col gap-2.5 border-t py-7 first:border-t-2"
        >
          <div className="@gutter:w-50 @gutter:shrink-0">
            <span className="font-display text-ink block text-2xl leading-none font-bold">
              <span aria-hidden {...sm("year")}>
                {row.year}
              </span>
              <span className="sr-only">{row.year}</span>
            </span>
            <span
              {...sm("partner")}
              className="text-label-sm text-ink-muted mt-1.5 block font-mono"
            >
              {row.partner.href ? (
                <ExternalLink
                  href={row.partner.href}
                  // standalone link: ≥ 44×44 px tap area on coarse pointers
                  className="tap-target text-ink"
                >
                  {row.partner.text}
                </ExternalLink>
              ) : (
                row.partner.text
              )}
            </span>
          </div>
          <div
            {...sm("rowBody")}
            className="grid max-w-170 min-w-0 flex-1 gap-2.5"
          >
            <h2 className="headline text-ink">{row.title}</h2>
            {row.story.map((block, i) =>
              block.kind === "quote" ? (
                <PullLine key={i} text={block.text} lang={block.lang} />
              ) : (
                <p key={i} className="body-base text-ink-muted">
                  <RichText text={block.text} />
                </p>
              ),
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
