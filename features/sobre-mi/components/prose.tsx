import type { JSX } from "react";
import type { ProseBlock } from "@/features/sobre-mi/types";
import { sm } from "@/features/sobre-mi/motion/attributes";
import { PhotoFigure } from "@/features/sobre-mi/components/photo-figure";
import { PullLine } from "@/features/sobre-mi/components/pull-line";
import { Signature } from "@/features/sobre-mi/components/signature";

type Props = { blocks: readonly ProseBlock[] };

/**
 * Main-column prose (spec § Shared Page Structure: max 760px, 17px / 1.7).
 * Paragraphs, figures and the headline line reveal on scroll (M2); pull lines
 * and the signature have their own scenes and are not reveal targets.
 */
export function Prose({ blocks }: Props): JSX.Element {
  return (
    <div className="grid max-w-190 gap-4.5">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "p":
            return (
              <p key={i} {...sm("reveal")} className="body-prose text-ink">
                {block.text}
              </p>
            );
          case "pull":
            return <PullLine key={i} text={block.text} lang={block.lang} />;
          case "headline":
            return (
              <p key={i} {...sm("reveal")} className="headline text-ink">
                {block.text}
              </p>
            );
          case "photo":
            return (
              <PhotoFigure
                key={i}
                src={block.src}
                alt={block.alt}
                caption={block.caption}
              />
            );
          case "signature":
            return <Signature key={i} text={block.text} />;
        }
      })}
    </div>
  );
}
