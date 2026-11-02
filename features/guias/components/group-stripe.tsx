import type { JSX } from "react";
import { GuideCard } from "@/features/guias/components/guide-card";
import { groupGuides } from "@/features/guias/content/queries";
import type { GuideGroup } from "@/features/guias/types";
import { cn } from "@/lib/utils";

type Props = {
  group: GuideGroup;
  /** Position in menu order: even stripes are white, odd ones cream. */
  index: number;
};

/**
 * One group of the Guías home: eyebrow "01"…"03", the group H2, the count and
 * its 4 cards. The section id is the group anchor (`/guias#barrios`), and the
 * first stripe's photos load eagerly because it is the first screen.
 */
export function GroupStripe({ group, index }: Props): JSX.Element {
  const guides = groupGuides(group.id);
  const titleId = `${group.anchor}-title`;
  return (
    <section
      id={group.anchor}
      aria-labelledby={titleId}
      className={cn(
        "scroll-mt-16 py-10 md:py-16",
        index % 2 === 0 ? "bg-canvas" : "bg-surface-1",
      )}
    >
      <div className="container-ds">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="eyebrow">{group.eyebrow}</span>
            <h2 id={titleId} className="display-md text-ink mt-2">
              {group.title}
            </h2>
          </div>
          <span className="body-sm text-ink-muted">{guides.length} guías</span>
        </div>
        <ul className="@guide-facts:grid-cols-2 @guide-cards:grid-cols-4 mt-7 grid grid-cols-1 gap-4">
          {guides.map((meta) => (
            <li key={meta.slug} className="min-w-0">
              <GuideCard meta={meta} priority={index === 0} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
