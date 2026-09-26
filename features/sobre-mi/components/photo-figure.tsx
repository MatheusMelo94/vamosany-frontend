import type { JSX } from "react";
import Image from "next/image";
import { sm } from "@/features/sobre-mi/motion/attributes";

type Props = { src: string; alt: string; caption: string };

/**
 * A 3:2 photo in a fixed `surface-2` box (loading and partial states: the box
 * holds its size and fill, so nothing shifts and a failed image leaves the
 * box, spec § States Matrix) with a mono caption under a hairline. The image
 * is `fill` inside the box, so the M3 parallax can move it without moving
 * the box.
 */
export function PhotoFigure({ src, alt, caption }: Props): JSX.Element {
  return (
    <figure {...sm("reveal")} className="grid gap-2">
      <div
        {...sm("parallax")}
        className="bg-surface-2 relative aspect-3/2 overflow-hidden rounded-lg"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1280px) 760px, 100vw"
          className="object-cover"
        />
      </div>
      <figcaption className="border-hairline text-label-sm text-ink-muted border-t pt-2 font-mono">
        {caption}
      </figcaption>
    </figure>
  );
}
