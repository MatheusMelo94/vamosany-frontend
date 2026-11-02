import { BODIES } from "@/features/guias/content/guides/index";
import { GUIDE_META } from "@/features/guias/content/meta";
import type { GuideSlug } from "@/features/guias/content/slugs";
import type { GuideBody } from "@/features/guias/types";
import {
  DOC_EXCEPTIONS,
  diffUnits,
  docUnits,
  expectedUnits,
  type DocException,
} from "./support/fidelity";
import { sourceSection } from "./support/guide-source";
import { bodyUnits, plainText } from "./support/plain-text";

/**
 * Spec AC 27, 28: the rendered text of each guide equals its section of
 * docs/content/guias.md after D1-D7 only. Parametrized over all 12 bodies.
 */
const present = GUIDE_META.map((m) => [m.slug, m.title] as const);

function compare(slug: GuideSlug, title: string, body: GuideBody) {
  const { units, unused } = expectedUnits(slug, sourceSection(title));
  return { diffs: diffUnits(bodyUnits(body), units), unused };
}

describe.each(present)("fidelity: %s", (slug, title) => {
  const body: GuideBody = BODIES[slug];

  it("renders the Doc's text block by block (D1-D7 only)", () => {
    expect(compare(slug, title, body).diffs).toEqual([]);
  });

  it("consumes every exception that targets this guide (no dead exception)", () => {
    expect(compare(slug, title, body).unused).toEqual([]);
  });
});

describe("the fidelity harness (it proves it can fail)", () => {
  const section = sourceSection("West Village");
  const sample: GuideBody = {
    intro: [{ type: "p", text: ["Si hay un barrio."] }],
    sections: [],
    cta: { lead: "¿Querés?", label: "Quiero mi itinerario" },
  };

  it("reads the Doc into tagged units (D1, D4, D5, D7)", () => {
    const units = docUnits(section);
    expect(units[0]).toMatch(/^P\|Si hay un barrio de New York/);
    expect(units).toContain("H2|Por qué lo amo");
    expect(units).toContain(
      "LI|**Bleecker Street:** la calle principal del barrio, con tiendas, cafés y pastelerías.",
    );
    expect(units.slice(-2)).toEqual([
      "CTA|¿Querés recorrer el West Village en tu viaje?",
      "BTN|Quiero mi itinerario",
    ]);
  });

  it("turns bold own-line labels into H3 and drops export noise", () => {
    const units = docUnits(sourceSection("Desde el aeropuerto"));
    expect(units).toContain("H3|AirTrain + subte (la opción más económica)");
    expect(units).toContain(
      "P|El AirTrain conecta todas las terminales con las estaciones Jamaica y Howard Beach, donde tomás el subte. Desde Jamaica, la línea E te lleva directo a Midtown; desde Howard Beach, la línea A va a Lower Manhattan y al West Side.",
    );
    expect(units.join("\n")).not.toContain("****");
  });

  it("turns 'Mi pique:' paragraphs into TIP units without the label (D4)", () => {
    const tips = docUnits(sourceSection("El subte, explicado")).filter((u) =>
      u.startsWith("TIP|"),
    );
    expect(tips).toHaveLength(2);
    expect(tips[0]).toMatch(/^TIP\|yo uso Apple Pay\./);
  });

  it("flags a deliberately altered guide with a diff", () => {
    const expected = docUnits(section);
    const diffs = diffUnits(bodyUnits(sample), expected);
    expect(diffs.length).toBeGreaterThan(0);
  });

  it("fails on a single changed word, a dropped '¿', 'x' for '×' and '8.75' for '8,75'", () => {
    const base = ["P|¿Cuánto cuesta? USD 8,75 y una foto de 5×5 cm."];
    const probe = (text: string) =>
      diffUnits(
        bodyUnits({
          ...sample,
          intro: [{ type: "p", text: [text] }],
          cta: sample.cta,
        }).slice(0, 1),
        base,
      );
    expect(probe("¿Cuánto cuesta? USD 8,75 y una foto de 5×5 cm.")).toEqual([]);
    expect(probe("¿Cuánto cuesta? USD 8,75 y una foto de 5x5 cm.")).not.toEqual(
      [],
    );
    expect(probe("Cuánto cuesta? USD 8,75 y una foto de 5×5 cm.")).not.toEqual(
      [],
    );
    expect(probe("¿Cuánto cuesta? USD 8.75 y una foto de 5×5 cm.")).not.toEqual(
      [],
    );
    expect(probe("¿Cuánto cuesta? USD 9,75 y una foto de 5×5 cm.")).not.toEqual(
      [],
    );
  });

  it("reports a dead exception", () => {
    const dead: DocException = {
      id: "never matches",
      slug: "west-village",
      reason: "test",
      apply: () => null,
    };
    expect(expectedUnits("west-village", section, [dead]).unused).toEqual([
      "never matches",
    ]);
  });

  it("documents each exception with its spec reason", () => {
    expect(DOC_EXCEPTIONS.length).toBeGreaterThanOrEqual(4);
    for (const exception of DOC_EXCEPTIONS) {
      expect(exception.reason).toMatch(/Spec §/);
    }
  });

  it("plainText drops the tags and keeps one line per block", () => {
    expect(plainText(sample)).toBe(
      "Si hay un barrio.\n¿Querés?\nQuiero mi itinerario",
    );
  });
});

describe("emphasis fidelity (AC 27: bold and italic are preserved)", () => {
  const section = sourceSection("El subte, explicado");
  const bodyOf = (text: GuideBody["intro"][number]): GuideBody => ({
    intro: [text],
    sections: [],
    cta: { lead: "x", label: "y" },
  });

  it("carries the Doc's bold into the units, without the export noise", () => {
    const units = docUnits(section);
    expect(units).toContain(
      "P|Cada viaje en subte o bus local cuesta **USD 3**, y tenés dos formas de pagarlo.",
    );
    expect(units.join("\n")).not.toContain("****");
    const airport = docUnits(sourceSection("Desde el aeropuerto")).join("\n");
    expect(airport).toContain("el taxi tiene **tarifa fija de USD 70**, más");
    // The stray opening "**" that follows a sub-label line break is dropped.
    expect(airport).toContain("\nP|El AirTrain conecta todas");
  });

  it("renders the guide's {b} and {i} runs with the same markers", () => {
    const units = bodyUnits(
      bodyOf({
        type: "p",
        text: ["Cuesta ", { b: "USD 3" }, " y ", { i: "Lover" }],
      }),
    );
    expect(units[0]).toBe("P|Cuesta **USD 3** y *Lover*");
  });

  it("fails when a guide drops one bold run the Doc has", () => {
    const expected = ["P|Cada viaje cuesta **USD 3**, y tenés dos formas."];
    const same = bodyOf({
      type: "p",
      text: ["Cada viaje cuesta ", { b: "USD 3" }, ", y tenés dos formas."],
    });
    const dropped = bodyOf({
      type: "p",
      text: ["Cada viaje cuesta USD 3, y tenés dos formas."],
    });
    expect(diffUnits(bodyUnits(same).slice(0, 1), expected)).toEqual([]);
    expect(diffUnits(bodyUnits(dropped).slice(0, 1), expected)).not.toEqual([]);
  });

  it("fails when italic turns into plain text", () => {
    const expected = ["P|Una *Lover* con vista."];
    const plain = bodyOf({ type: "p", text: ["Una Lover con vista."] });
    expect(diffUnits(bodyUnits(plain).slice(0, 1), expected)).not.toEqual([]);
  });

  it("keeps plainText free of markers", () => {
    expect(
      plainText(
        bodyOf({ type: "p", text: ["a ", { b: "b" }, " ", { i: "c" }] }),
      ),
    ).toBe("a b c\nx\ny");
  });
});
