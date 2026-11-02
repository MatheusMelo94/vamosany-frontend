export type SectionTop = {
  id: string;
  /** Viewport-relative top of the section's heading, in px. */
  top: number;
};

type Input = {
  tops: readonly SectionTop[];
  /** Distance from the viewport top where a heading counts as "passed" (120px). */
  line: number;
  atBottom: boolean;
};

/**
 * Which "En esta guía" item is active (spec § Motion Intent; plan § 7): the
 * last section whose heading has reached the line; the first one above the
 * first H2; the last one at the bottom of the page, even when its heading
 * never reaches the line (a short last section). Pure and geometry-only: the
 * URL hash is irrelevant, because after a hash jump the browser has already
 * scrolled and the same computation applies.
 */
export function activeSectionId({
  tops,
  line,
  atBottom,
}: Input): string | null {
  const first = tops[0];
  if (!first) return null;
  if (atBottom) return tops[tops.length - 1]?.id ?? null;
  let active = first.id;
  for (const section of tops) {
    if (section.top <= line) active = section.id;
  }
  return active;
}
