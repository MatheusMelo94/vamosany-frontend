import { Fragment, type JSX } from "react";
import Link from "next/link";
import { guideHref, guideMeta } from "@/features/guias/content/queries";
import type { Inline as InlineNode } from "@/features/guias/types";
import { ExternalLink } from "@/features/sobre-mi/components/external-link";

/** Underlined always (a link inside text must not rely on colour); yellow 3px on hover, as the breadcrumb. */
const GUIDE_LINK =
  "underline underline-offset-4 hover:decoration-brand hover:decoration-3";

/**
 * Renders a run of `Inline` content (spec § Content Model). Text is React
 * children, never HTML: there is no dangerouslySetInnerHTML anywhere in the
 * Guías (plan § 4). A `{ guide }` node is a `next/link` to that guide whose
 * text is its menu title, so a renamed guide renames every mention.
 */
export function Inline({ nodes }: { nodes: InlineNode[] }): JSX.Element {
  return (
    <>
      {nodes.map((node, i) => {
        if (typeof node === "string")
          return <Fragment key={i}>{node}</Fragment>;
        if ("b" in node) return <strong key={i}>{node.b}</strong>;
        if ("i" in node) return <em key={i}>{node.i}</em>;
        if ("guide" in node) {
          return (
            <Link key={i} href={guideHref(node.guide)} className={GUIDE_LINK}>
              {guideMeta(node.guide).menuTitle}
            </Link>
          );
        }
        return (
          <ExternalLink key={i} href={node.href}>
            {node.text}
          </ExternalLink>
        );
      })}
    </>
  );
}
