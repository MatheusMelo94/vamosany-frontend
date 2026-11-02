import type { JSX } from "react";
import Image from "next/image";
import Link from "next/link";
import { GUIDE_PHOTOS, PHOTOS } from "@/features/guias/content/photos";
import { guideHref } from "@/features/guias/content/queries";
import type { GuideMeta } from "@/features/guias/types";

type Props = {
  meta: GuideMeta;
  /** The first row loads eagerly; the rest are lazy (spec § Photo states). */
  priority?: boolean;
};

/**
 * A home card: one link for the whole card (the title is a heading inside it).
 * The thumbnail is decorative (`alt=""`, spec A-4): the card's link name is
 * its text, and the descriptive alt lives on the hero. The 3:2 box is reserved
 * with the surface fill so nothing shifts and a failed photo leaves the box
 * (AC 32). Hover lifts 2px where hover exists; reduced motion removes the lift.
 */
export function GuideCard({ meta, priority = false }: Props): JSX.Element {
  const use = GUIDE_PHOTOS[meta.slug];
  const photo = PHOTOS[use.photo];
  return (
    <Link
      href={guideHref(meta.slug)}
      className="group border-ink bg-canvas flex h-full min-w-0 flex-col overflow-hidden rounded-lg border-2 transition-transform duration-150 ease-(--ease-default) hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="bg-surface-1 relative aspect-3/2">
        <Image
          src={`/img/${photo.file}`}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 62.5625rem) 280px, (min-width: 35.0625rem) 50vw, 100vw"
          className="object-cover"
          style={{ objectPosition: use.focal }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5.5">
        <h3 className="card-title text-ink group-hover:decoration-brand min-w-0 wrap-anywhere group-hover:underline group-hover:decoration-3 group-hover:underline-offset-4">
          {meta.menuTitle}
        </h3>
        <p className="body-sm text-ink-muted">{meta.bajada}</p>
        <span className="body-sm text-ink mt-auto pt-2.5 font-bold">
          Leer la guía <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
