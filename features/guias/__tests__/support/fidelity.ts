import type { GuideSlug } from "@/features/guias/content/slugs";
import { normalizeText } from "./plain-text";
import type { SourceSection } from "./guide-source";

/**
 * Doc section -> tagged units, applying the structural deviations D1-D7 of
 * spec § Content Fidelity as parse rules:
 *  - D1: a bold own-line label ("**Label****") is an H3;
 *  - D4: "**Mi pique:** text" is a TIP whose body is the text after the label;
 *  - D5: export noise (stray "**", "****", markdown links, "\[" escapes) is
 *    dropped, keeping bold/italic as plain text;
 *  - D7: the bold question before "Botón: X" is the band's lead (CTA), X is
 *    the button label (BTN), and an italic closing line is small print (FINE).
 * (D6, the Bajada label, is dropped when the section is read.)
 * Everything else is verbatim; the case-by-case departures live in
 * DOC_EXCEPTIONS below.
 */
function clean(text: string): string {
  return normalizeText(
    text
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\*+/g, "")
      .replace(/\\(.)/g, "$1"),
  );
}

export function docUnits(section: SourceSection): string[] {
  const lines = section.lines.map((l) => l.trim()).filter((l) => l !== "");
  const units: string[] = [];
  lines.forEach((line, index) => {
    const next = lines[index + 1] ?? "";
    let match: RegExpExecArray | null;
    if ((match = /^### \*\*(.+)\*\*$/.exec(line))) {
      units.push(`H2|${clean(match[1] ?? "")}`);
    } else if ((match = /^- (.+)$/.exec(line))) {
      units.push(`LI|${clean(match[1] ?? "")}`);
    } else if ((match = /^\d+\.\s+(.+)$/.exec(line))) {
      units.push(`OL|${clean(match[1] ?? "")}`);
    } else if ((match = /^\*\*([^*]+)\*\*\*\*$/.exec(line))) {
      units.push(
        /^\*\*Botón:/.test(next)
          ? `CTA|${clean(match[1] ?? "")}`
          : `H3|${clean(match[1] ?? "")}`,
      );
    } else if ((match = /^\*{0,2}Botón:\s*(.+?)\*{0,2}$/.exec(line))) {
      units.push(`BTN|${clean(match[1] ?? "")}`);
    } else if ((match = /^\*\*Mi pique:\*\*\s*(.+)$/.exec(line))) {
      units.push(`TIP|${clean(match[1] ?? "")}`);
    } else if ((match = /^\*([^*].*[^*])\*$/.exec(line))) {
      units.push(`FINE|${clean(match[1] ?? "")}`);
    } else {
      units.push(`P|${clean(line)}`);
    }
  });
  return units;
}

export type DocException = {
  id: string;
  slug: GuideSlug;
  /** Where the spec sanctions it. */
  reason: string;
  /** The rewritten units, or null when the exception does not apply (dead). */
  apply(units: string[]): string[] | null;
};

const drop = (unit: string): string => unit.slice(unit.indexOf("|") + 1);

/** `[El subte, explicado]` -> `El subte, explicado` (D3, the link has no brackets). */
function bracketException(slug: GuideSlug): DocException {
  return {
    id: `D3 guide link without brackets (${slug})`,
    slug,
    reason: "Spec § Content Fidelity D3; AC 20",
    apply(units) {
      const index = units.findIndex((u) => u.includes("[El subte, explicado]"));
      if (index < 0) return null;
      return units.map((u, i) =>
        i === index
          ? u.replace("[El subte, explicado]", "El subte, explicado")
          : u,
      );
    },
  };
}

/**
 * The only case-by-case departures from the Doc. Each one must be consumed
 * by its guide's comparison: a dead exception fails the suite.
 */
export const DOC_EXCEPTIONS: readonly DocException[] = [
  bracketException("desde-el-aeropuerto"),
  bracketException("como-moverte-por-new-york"),
  {
    id: "D2 'Cómo funciona:' becomes the H3 'Cómo funciona'",
    slug: "el-subte-explicado",
    reason: "Spec § Content Fidelity D2",
    apply(units) {
      const index = units.indexOf("P|Cómo funciona:");
      if (index < 0) return null;
      return units.map((u, i) => (i === index ? "H3|Cómo funciona" : u));
    },
  },
  {
    id: "A-8 / D4 'Cómo se paga': two methods as one list, then the callout",
    slug: "el-subte-explicado",
    reason: "Spec § Open Assumptions A-8, § Content Fidelity D4; AC 28",
    apply(units) {
      const i = units.findIndex((u) =>
        u.startsWith("P|Con tu tarjeta o tu celular:"),
      );
      const first = units[i];
      const tip = units[i + 1];
      const second = units[i + 2];
      if (
        i < 0 ||
        first === undefined ||
        !tip?.startsWith("TIP|") ||
        !second?.startsWith("P|Con la tarjeta OMNY:")
      )
        return null;
      return [
        ...units.slice(0, i),
        `LI|${drop(first)}`,
        `LI|${drop(second)}`,
        tip,
        ...units.slice(i + 3),
      ];
    },
  },
];

/** Doc units for a guide with its exceptions applied, and the exceptions that did not apply. */
export function expectedUnits(
  slug: GuideSlug,
  section: SourceSection,
  exceptions: readonly DocException[] = DOC_EXCEPTIONS,
): { units: string[]; unused: string[] } {
  let units = docUnits(section);
  const unused: string[] = [];
  for (const exception of exceptions.filter((e) => e.slug === slug)) {
    const next = exception.apply(units);
    if (next) units = next;
    else unused.push(exception.id);
  }
  return { units, unused };
}

/** Human-readable differences between the rendered units and the Doc's; empty when equal. */
export function diffUnits(actual: string[], expected: string[]): string[] {
  const diffs: string[] = [];
  const length = Math.max(actual.length, expected.length);
  for (let i = 0; i < length; i++) {
    if (actual[i] !== expected[i]) {
      diffs.push(
        `#${i}\n  guide: ${actual[i] ?? "(missing)"}\n  doc:   ${expected[i] ?? "(missing)"}`,
      );
    }
  }
  return diffs;
}
