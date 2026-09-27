import type { JSX } from "react";
import { cn } from "@/lib/utils";
import { sm } from "@/features/sobre-mi/motion/attributes";

type Props = { rows: readonly { title: string; text: string }[] };

/**
 * "Five doors" (spec § Page 3): one row per audience, H2 beside its text
 * once the page (the layout's `screen` container) reaches the
 * `--container-rows` breakpoint (760px), stacked below it — so 768 is
 * side by side (AC 32) although the list itself is narrower than 760px. Each row
 * opens with a rule (first 2px ink, the rest a hairline) that M5 draws in;
 * the rule is decorative and in place without motion.
 */
export function AudienceRows({ rows }: Props): JSX.Element {
  return (
    <ul {...sm("audience")} className="mt-9">
      {rows.map((row, i) => (
        <li
          key={row.title}
          // arbitrary: 1fr / 1.6fr split of the audience row (mockup .aud)
          className="@rows/screen:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] @rows/screen:items-baseline @rows/screen:gap-8 relative grid gap-1.5 py-5"
        >
          <span
            aria-hidden
            {...sm("rule")}
            className={cn(
              "absolute inset-x-0 top-0 origin-left",
              i === 0 ? "bg-ink h-0.5" : "bg-hairline h-px",
            )}
          />
          <h2 className="card-title text-ink">{row.title}</h2>
          <p className="body-base text-ink-muted">{row.text}</p>
        </li>
      ))}
    </ul>
  );
}
