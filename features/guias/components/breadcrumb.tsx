import type { JSX } from "react";
import Link from "next/link";
import type { GuideGroup } from "@/features/guias/types";

/** Yellow 3px underline on hover, as the inline guide links (spec § Content Model rule 6). */
const LINK =
  "underline-offset-4 hover:underline hover:decoration-brand hover:decoration-3";

/**
 * "Guías / <grupo>": the way back from a guide reached directly (journey 1b).
 * The group crumb links to its stripe on the home (A-6). Deliberately outside
 * the M1 heading block (plan D-11).
 */
export function Breadcrumb({ group }: { group: GuideGroup }): JSX.Element {
  return (
    <nav
      aria-label="Ruta"
      className="body-sm text-ink-muted flex flex-wrap gap-x-1.5 gap-y-1"
    >
      <Link href="/guias" className={LINK}>
        Guías
      </Link>
      <span aria-hidden>/</span>
      <Link href={`/guias#${group.anchor}`} className={LINK}>
        {group.title}
      </Link>
    </nav>
  );
}
