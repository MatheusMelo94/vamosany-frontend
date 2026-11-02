import type { JSX } from "react";
import { Inline } from "@/features/guias/components/inline";
import type { Inline as InlineNode } from "@/features/guias/types";

/**
 * "Mi pique" callout (spec § Page Structure): a cream box with the label as
 * text. Not a heading and not a landmark (AC 40): a plain block, so the
 * outline stays clean and screen readers read the label inline.
 */
export function TipCallout({ text }: { text: InlineNode[] }): JSX.Element {
  return (
    <div className="bg-surface-1 mb-5.5 grid gap-1.5 rounded-lg px-5.5 py-5">
      <span className="eyebrow text-ink">Mi pique</span>
      <p>
        <Inline nodes={text} />
      </p>
    </div>
  );
}
