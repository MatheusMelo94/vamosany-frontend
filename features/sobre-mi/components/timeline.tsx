import type { JSX } from "react";
import type { TimelineRow } from "@/features/sobre-mi/types";
import { sm } from "@/features/sobre-mi/motion/attributes";

type Props = { rows: readonly TimelineRow[] };

/* arbitrary: 15px timetable text (mockup .tt); between body-sm and body-base */
const ROW_TEXT = "text-[0.9375rem]";

/**
 * "En el camino": a timetable with a yellow rail down its left edge
 * (spec § Page 1 04b). Three columns (time | title + line | tag) from the
 * `--container-timeline-sm` breakpoint (520px); below it the tag moves under
 * the line. The rail is full without motion; M3 draws it with scroll.
 */
export function Timeline({ rows }: Props): JSX.Element {
  return (
    <div className="@container relative pl-4.5">
      {/* static track + the rail M3 scrubs; both decorative */}
      <span
        aria-hidden
        className="bg-hairline absolute inset-y-0 left-0.75 w-0.5"
      />
      <span
        aria-hidden
        {...sm("rail")}
        className="bg-brand absolute inset-y-0 left-0.5 w-1 origin-top rounded-xs"
      />
      <ul {...sm("timeline")}>
        {rows.map((row) => (
          <li
            key={row.time}
            // arbitrary: time column 72px / 96px (--spacing(18) / --spacing(24)), mockup .tt.wide
            className="border-hairline @timeline-sm:grid-cols-[--spacing(24)_minmax(0,1fr)_auto] grid grid-cols-[--spacing(18)_minmax(0,1fr)] items-baseline gap-3 border-b py-3.5 first:border-t"
          >
            <span className={`text-ink-muted font-mono ${ROW_TEXT}`}>
              {row.time}
            </span>
            <span className={ROW_TEXT}>
              <b className="block font-semibold">{row.title}</b>
              {row.line}
            </span>
            {row.tag ? (
              <span className="caption text-ink-muted @timeline-sm:col-start-auto @timeline-sm:text-right col-start-2">
                {row.tag}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
