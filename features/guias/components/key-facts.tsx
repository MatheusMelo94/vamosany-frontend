import type { JSX } from "react";
import type { KeyFact } from "@/features/guias/types";

type Props = {
  facts: KeyFact[] | undefined;
  /** Accessible name of the box; "Datos clave" by default. */
  label?: string;
};

/**
 * The 3-cell key-facts box (spec § Key Facts): figure in Courier with tabular
 * numerals, label in ink-muted. One column below the facts container width,
 * three at and above it. A `role="list"` of `listitem`s, each read as "figure,
 * label". Renders nothing when the guide has no facts (no empty placeholder).
 */
export function KeyFacts({
  facts,
  label = "Datos clave",
}: Props): JSX.Element | null {
  if (!facts) return null;
  return (
    <div
      role="list"
      aria-label={label}
      className="border-ink @guide-facts:grid-cols-3 mt-1.5 mb-6.5 grid grid-cols-1 overflow-hidden rounded-lg border-2"
    >
      {facts.map((fact) => (
        <div
          key={fact.value}
          role="listitem"
          className="border-hairline @guide-facts:border-t-0 @guide-facts:border-l @guide-facts:first:border-l-0 flex flex-col gap-1 border-t p-4.5 first:border-t-0"
        >
          <strong className="headline text-ink tabular-nums">
            {fact.value}
          </strong>{" "}
          <span className="body-sm text-ink-muted">{fact.label}</span>
        </div>
      ))}
    </div>
  );
}
