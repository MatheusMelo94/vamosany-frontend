import type { JSX, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { sm } from "@/features/sobre-mi/motion/attributes";

type Props = {
  /** Notes column items; the first one is set in bold ink. */
  notes: readonly ReactNode[];
  /** The first note names the section: render it as an h2. */
  heading?: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * Slot 04 (spec § Shared Page Structure): a 200px notes column (mono 13px,
 * ink-muted) beside the main column once the container reaches the
 * `--container-gutter` breakpoint (860px); stacked below it, notes first
 * (they come first in DOM order, so reading order matches at every width).
 */
export function NotesLayout({
  notes,
  heading = false,
  children,
  className,
}: Props): JSX.Element {
  return (
    <div className={cn("@container", className)}>
      <div className="@gutter:flex-row @gutter:gap-10 flex flex-col gap-3">
        <div
          {...sm("notes")}
          className="text-label-sm text-ink-muted @gutter:w-50 @gutter:shrink-0 grid content-start gap-1 font-mono"
        >
          {notes.map((note, i) =>
            i === 0 && heading ? (
              <h2 key={i} className="text-ink font-bold">
                {note}
              </h2>
            ) : (
              <div key={i} className={cn(i === 0 && "text-ink font-bold")}>
                {note}
              </div>
            ),
          )}
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
