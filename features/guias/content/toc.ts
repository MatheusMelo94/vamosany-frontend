import type { GuideBody } from "@/features/guias/types";

export type TocItem = { id: string; label: string };

/**
 * The "En esta guía" entries of a guide: one per H2, labelled with the H2
 * text (or its `tocLabel`, spec § Content Model rule 3). On Visa the
 * "Te ayudo con tu visa" section renders as the closing band but keeps its
 * id and stays in the index (rule 4). Plain, serializable data: it is what
 * the client index components receive as props.
 */
export function tocItems(body: GuideBody): TocItem[] {
  const items = body.sections.map((section) => ({
    id: section.id,
    label: section.tocLabel ?? section.title,
  }));
  if ("heading" in body.cta) {
    items.push({ id: body.cta.id, label: body.cta.heading });
  }
  return items;
}
