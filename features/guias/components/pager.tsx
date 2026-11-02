import type { JSX } from "react";
import Link from "next/link";
import { guideHref, nextGuide } from "@/features/guias/content/queries";
import type { GuideSlug } from "@/features/guias/content/slugs";
import { cn } from "@/lib/utils";

/** Same 2px lift as buttons and cards; `hover:` only applies where hover exists, reduced motion removes it. */
const CELL =
  "tap-target border-hairline hover:border-ink flex flex-col gap-1 rounded-xl border p-4 transition-[border-color,transform] duration-150 ease-(--ease-default) hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

/**
 * End-of-guide navigation: back to all guides, and on to the next guide in
 * global menu order (A-14). The last guide has one cell.
 */
export function Pager({ slug }: { slug: GuideSlug }): JSX.Element {
  const next = nextGuide(slug);
  return (
    <nav
      aria-label="Más guías"
      className="@guide-facts:grid-cols-2 mt-8 grid grid-cols-1 gap-4"
    >
      <Link href="/guias" className={CELL}>
        <span className="body-sm text-ink-muted">
          <span aria-hidden>←</span> Volver a
        </span>
        <span className="font-bold">Todas las guías</span>
      </Link>
      {next ? (
        <Link
          href={guideHref(next.slug)}
          className={cn(CELL, "@guide-facts:text-right")}
        >
          <span className="body-sm text-ink-muted">
            Siguiente guía <span aria-hidden>→</span>
          </span>
          <span className="font-bold">{next.menuTitle}</span>
        </Link>
      ) : null}
    </nav>
  );
}
