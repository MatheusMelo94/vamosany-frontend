import type { JSX } from "react";
import type { PageHeaderContent } from "@/features/sobre-mi/types";
import { sm } from "@/features/sobre-mi/motion/attributes";

/**
 * Slots 01–03 of the "Cuaderno de campo" page (spec § Shared Page Structure):
 * label line, H1 with the train marker, dek.
 *
 * The H1's accessible name is the sr-only copy; the visual copy is
 * aria-hidden, so splitting it into words for the entrance (M1) never changes
 * what assistive tech reads (AC 14). Without motion the marker sits in place
 * (`--train: 0%`).
 */
export function PageHeader({
  label,
  title,
  dek,
}: PageHeaderContent): JSX.Element {
  return (
    <header {...sm("heading")} className="pt-12 pb-8 md:pt-18 md:pb-10">
      <p
        {...sm("label")}
        className="text-label-sm text-ink-muted mb-3.5 flex flex-wrap gap-x-3.5 gap-y-1.5 font-mono"
      >
        {label.map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </p>
      {/* arbitrary: 18ch keeps the title to ~2 balanced lines (spec slot 02); no measure token */}
      <h1 className="display-xl text-ink max-w-[18ch] text-balance">
        <span className="sr-only">{title}</span>
        <span
          aria-hidden
          {...sm("split")}
          {...sm("train")}
          className="highlight-heading"
        >
          {title}
        </span>
      </h1>
      {/* arbitrary: 52ch dek measure (spec slot 03); --container-prose is 65ch */}
      <p
        {...sm("dek")}
        className="body-lg text-ink-muted mt-4.5 max-w-[52ch] text-pretty"
      >
        {dek}
      </p>
    </header>
  );
}
