import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Verbatim oracle for spec AC 12: every [md] string on the Sobre mí pages must
 * match the content file character for character (accents, "¿", "¡",
 * punctuation). Test-only helper; the source is the committed copy of Belén's
 * file (docs/content/sobre-mi-source.md, T013).
 */
export const SOURCE: string = readFileSync(
  path.resolve(__dirname, "../../../docs/content/sobre-mi-source.md"),
  "utf8",
);

/** Collapses whitespace runs to one space and trims. */
export function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Markdown → plain text for comparison: `[text](url)` → `text`, `**` and `*`
 * dropped, backslash escapes (`\[`, `\!`, `\)`) unescaped, whitespace collapsed.
 */
export function normalizeSource(markdown: string): string {
  return normalizeText(
    markdown
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\*+/g, "")
      .replace(/\\(.)/g, "$1"),
  );
}

type Exception = {
  /** The string as it renders on the page. */
  text: string;
  /** The (normalized) source text it replaces. */
  source: string;
  /** Where the spec sanctions the edit. */
  reason: string;
};

/** The only spec-sanctioned departures from the content file. */
export const DOCUMENTED_EXCEPTIONS: readonly Exception[] = [
  {
    text: "¿Estás planificando tu viaje a New York, tenés una duda sobre algún servicio o querés proponerme una colaboración? Contame lo que necesites. Cada mensaje lo leo y lo respondo yo, así que puede que tarde un par de días en contestarte, pero siempre respondo.",
    source:
      "¿Estás planificando tu viaje a New York, tenés una duda sobre algún servicio o querés proponerme una colaboración? Contame lo que necesites. Cada mensaje lo leo y lo respondo yo, así que puede que tarde [un par de días] en contestarte, pero siempre respondo.",
    reason:
      "Contacto dek: brackets dropped, wording kept (spec § Resolved Clarifications 1; AC 34).",
  },
  {
    text: "Cápsula con Mona Cases",
    source: "Cápsula con Mona Cases (2023)",
    reason:
      "Colaboraciones H2: the year moved to the ledger's year column (spec § Page 2).",
  },
  {
    text: "Tote bags con Efe Hus",
    source: "Tote bags con Efe Hus (2024 y 2025)",
    reason:
      "Colaboraciones H2: the years moved to the ledger's year column (spec § Page 2).",
  },
  {
    text: "“I think about New York more than a normal person should.”",
    source: '"I think about New York more than a normal person should."',
    reason:
      "Efe Hus quote: curly quotes as in the spec text (plan § 14 Q1 default).",
  },
];

const NORMALIZED_SOURCE = normalizeSource(SOURCE);

/**
 * A match must be a whole run of the source: bounded by the start/end, a space,
 * or the content file's list delimiters "(", ")" and "/". Plain substring
 * matching would accept a fragment with a dropped "¿" or a cut-off word.
 */
const BOUNDARY = /[\s()/]/;

function occursWhole(haystack: string, needle: string): boolean {
  if (!needle) return false;
  for (
    let at = haystack.indexOf(needle);
    at !== -1;
    at = haystack.indexOf(needle, at + 1)
  ) {
    const before = haystack[at - 1];
    const after = haystack[at + needle.length];
    if (
      (before === undefined || BOUNDARY.test(before)) &&
      (after === undefined || BOUNDARY.test(after))
    ) {
      return true;
    }
  }
  return false;
}

/** True when `text` appears whole in the content file, or is a documented exception. */
export function isVerbatim(text: string): boolean {
  const needle = normalizeText(text);
  return (
    occursWhole(NORMALIZED_SOURCE, needle) ||
    DOCUMENTED_EXCEPTIONS.some((e) => normalizeText(e.text) === needle)
  );
}
