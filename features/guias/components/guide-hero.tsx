import type { JSX } from "react";
import Image from "next/image";
import {
  GUIDE_PHOTOS,
  PHOTOS,
  creditLine,
} from "@/features/guias/content/photos";
import type { GuideSlug } from "@/features/guias/content/slugs";

/**
 * The guide's hero: a reserved 3:2 `surface-1` box holding the photo, and the
 * visible credit line as a mono caption (spec § Photos). The box holds its
 * size and fill while the image loads and if it fails, so there is no layout
 * shift (AC 32) and the credit never disappears. The photo is the LCP element
 * of a guide page, hence `priority`; `sizes` matches the 760px head (AC 31).
 */
export function GuideHero({ slug }: { slug: GuideSlug }): JSX.Element {
  const use = GUIDE_PHOTOS[slug];
  const photo = PHOTOS[use.photo];
  return (
    // arbitrary: 47.5rem (760px) matches the head measure, spec § Page Structure G3
    <figure className="max-w-[47.5rem]">
      <div className="bg-surface-1 relative aspect-3/2 overflow-hidden rounded-lg">
        <Image
          src={`/img/${photo.file}`}
          alt={use.alt}
          fill
          priority
          sizes="(min-width: 48rem) 760px, 100vw"
          className="object-cover"
          style={{ objectPosition: use.focal }}
        />
      </div>
      <figcaption className="text-label-sm text-ink-muted mt-2 font-mono">
        {creditLine(slug)}
      </figcaption>
    </figure>
  );
}
