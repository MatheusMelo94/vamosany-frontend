import type { JSX } from "react";
import { Inline } from "@/features/guias/components/inline";
import { TipCallout } from "@/features/guias/components/tip-callout";
import type { Block } from "@/features/guias/types";

/**
 * Renders the guide blocks the spec allows, and only those (spec § Page
 * Structure › Block rendering). The reading size and measure come from the
 * article wrapper; this adds the vertical rhythm. H2 sections are rendered
 * by the page, which owns their ids.
 */
export function Blocks({ blocks }: { blocks: Block[] }): JSX.Element {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return (
              <p key={i} className="mb-4.5">
                <Inline nodes={block.text} />
              </p>
            );
          case "h3":
            return (
              // arbitrary: 1.15rem sub-label size, spec § Page Structure; between body-lg and headline
              <h3
                key={i}
                className="font-display mt-6.5 mb-2 text-[1.15rem] leading-[1.15] font-bold"
              >
                {block.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="guide-list mb-4.5 flex flex-col gap-2.5">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Inline nodes={item} />
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol
                key={i}
                className="mb-4.5 flex list-decimal flex-col gap-2.5 pl-6"
              >
                {block.items.map((item, j) => (
                  <li key={j} className="pl-1">
                    <Inline nodes={item} />
                  </li>
                ))}
              </ol>
            );
          case "tip":
            return <TipCallout key={i} text={block.text} />;
          case "fine":
            return (
              <p key={i} className="body-sm text-ink-muted mb-4.5">
                <Inline nodes={block.text} />
              </p>
            );
        }
      })}
    </>
  );
}
