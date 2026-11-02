import type { JSX } from "react";
import Link from "next/link";
import { GROUPS } from "@/features/guias/content/groups";
import {
  guideHref,
  guideMeta,
  othersInGroup,
} from "@/features/guias/content/queries";
import type { GuideSlug } from "@/features/guias/content/slugs";

/**
 * "Más de <grupo>": the other three guides of the group, each with its blurb
 * (the bajada). Named by its text and its nav label, not by a heading (AC 40).
 */
export function MoreInGroup({ slug }: { slug: GuideSlug }): JSX.Element {
  const group = GROUPS.find((g) => g.id === guideMeta(slug).group);
  const title = `Más de ${group?.title ?? ""}`;
  return (
    <nav
      aria-label={title}
      className="border-hairline rounded-lg border px-5 py-4.5"
    >
      <span className="eyebrow">{title}</span>
      <ul className="mt-3 flex flex-col">
        {othersInGroup(slug).map((other) => (
          <li
            key={other.slug}
            className="border-hairline border-t first:border-t-0"
          >
            <Link
              href={guideHref(other.slug)}
              className="tap-target hover:bg-surface-1 -mx-2 block rounded-lg px-2 py-2.5 transition-colors"
            >
              <span className="body-sm text-ink block font-semibold">
                {other.menuTitle}
              </span>
              <span className="text-label-sm text-ink-muted block">
                {other.bajada}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
