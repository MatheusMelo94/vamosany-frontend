import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Test-only reader of the committed copy of Belén's Doc
 * (docs/content/guias.md). Splits the file into one raw-markdown section per
 * guide, keyed by the guide's page title (the `## **Title**` heading).
 */
export const GUIDES_SOURCE: string = readFileSync(
  path.resolve(__dirname, "../../../../docs/content/guias.md"),
  "utf8",
);

export type SourceSection = {
  /** The `## **…**` heading text. */
  title: string;
  /** The `**Bajada:**` text, label dropped (D6). */
  bajada: string;
  /** Every raw line after the Bajada line, up to the next guide heading. */
  lines: string[];
};

const HEADING = /^## \*\*(.+)\*\*\s*$/;
const BAJADA = /^\*\*Bajada:\*\*\s*(.+?)\s*$/;

export function sourceSections(
  markdown: string = GUIDES_SOURCE,
): SourceSection[] {
  const out: SourceSection[] = [];
  let current: { title: string; bajada: string; lines: string[] } | undefined;
  for (const line of markdown.split("\n")) {
    const heading = HEADING.exec(line);
    if (heading) {
      current = { title: heading[1] ?? "", bajada: "", lines: [] };
      out.push(current);
      continue;
    }
    if (!current) continue;
    const bajada = BAJADA.exec(line);
    if (bajada && current.bajada === "") {
      current.bajada = bajada[1] ?? "";
      continue;
    }
    current.lines.push(line);
  }
  return out;
}

/** The section whose heading is `title`, or a thrown error (a typo must not pass silently). */
export function sourceSection(title: string): SourceSection {
  const section = sourceSections().find((s) => s.title === title);
  if (!section)
    throw new Error(`No section "${title}" in docs/content/guias.md`);
  return section;
}
