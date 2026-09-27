import type { JSX, ReactNode } from "react";
import type { HttpsUrl } from "@/features/sobre-mi/types";
import { cn } from "@/lib/utils";

type Props = {
  /** https: only — partner sites and social profiles (mailto: stays a plain <a>). */
  href: HttpsUrl;
  children: ReactNode;
  className?: string;
};

/**
 * A link to another site, in a new tab (spec § Accessibility: external links).
 * `rel="noopener noreferrer"` keeps the opener and referrer from leaking; the
 * accessible name says it opens a new tab; the "↗" is visual only.
 */
export function ExternalLink({
  href,
  children,
  className,
}: Props): JSX.Element {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("underline underline-offset-3", className)}
    >
      {children} <span className="sr-only">(se abre en otra pestaña)</span>
      <span aria-hidden>↗</span>
    </a>
  );
}
