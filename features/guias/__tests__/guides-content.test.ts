import { getGuide } from "@/features/guias/content/guides";
import { nextGuide } from "@/features/guias/content/queries";
import { tocItems } from "@/features/guias/content/toc";
import type { Block, Guide, Inline } from "@/features/guias/types";
import { plainText } from "./support/plain-text";

/**
 * Per-guide structure the spec fixes beyond the text itself (key facts,
 * callouts, links, lists). The text is checked by guides-fidelity.test.ts;
 * the whole-registry counts by guides-completeness.test.ts (GU-17).
 */
function guide(slug: string): Guide {
  const found = getGuide(slug);
  if (!found) throw new Error(`guide "${slug}" is not registered`);
  return found;
}

function allBlocks(g: Guide): Block[] {
  return [
    ...g.intro,
    ...g.sections.flatMap((s) => s.blocks),
    ...(g.afterCta ?? []),
  ];
}

const count = (g: Guide, type: Block["type"]) =>
  allBlocks(g).filter((b) => b.type === type).length;

describe("El subte, explicado (GU-05)", () => {
  const g = () => guide("el-subte-explicado");

  it("has exactly 2 'Mi pique' callouts (AC 15)", () => {
    expect(count(g(), "tip")).toBe(2);
  });

  it("in 'Cómo se paga' the two payment methods are one list followed by the callout (A-8, AC 28)", () => {
    const section = g().sections.find((s) => s.id === "como-se-paga");
    expect(section?.blocks.map((b) => b.type)).toEqual(["p", "ul", "tip"]);
    const list = section?.blocks[1];
    expect(list?.type === "ul" && list.items).toHaveLength(2);
  });

  it("has the 3 key facts with their sources (AC 16, 17)", () => {
    expect(g().keyFacts?.map((f) => f.source)).toEqual([
      "USD 3",
      "USD 35",
      "24 horas",
    ]);
    expect(g().keyFacts?.map((f) => f.value)).toEqual([
      "USD 3",
      "USD 35",
      "24 h",
    ]);
  });

  it("gives the fare-cap section the id 'tope' and the index label 'El tope semanal' (AC 26)", () => {
    const section = g().sections.find(
      (s) => s.title === "El tope semanal (fare cap)",
    );
    expect(section).toMatchObject({ id: "tope", tocLabel: "El tope semanal" });
  });

  it("turns 'Cómo funciona:' into an H3 (D2)", () => {
    const blocks = g().sections.find((s) => s.id === "tope")?.blocks ?? [];
    expect(blocks).toContainEqual({ type: "h3", text: "Cómo funciona" });
  });

  it("ends with the band's lead and label", () => {
    expect(g().cta).toEqual({
      lead: "¿Querés que te arme el recorrido día a día, con las líneas que te convienen?",
      label: "Quiero mi itinerario",
    });
  });
});

/** The inline nodes of every paragraph, list item and callout of a guide. */
function inlines(g: Guide): Inline[] {
  return allBlocks(g).flatMap((block) => {
    switch (block.type) {
      case "p":
      case "tip":
      case "fine":
        return block.text;
      case "ul":
      case "ol":
        return block.items.flat();
      case "h3":
        return [];
    }
  });
}

const factSources = (g: Guide) => g.keyFacts?.map((f) => f.source);

describe("Desde el aeropuerto (GU-06)", () => {
  const g = () => guide("desde-el-aeropuerto");

  it("has a two-paragraph intro: the opening and 'Dato clave antes de arrancar'", () => {
    expect(g().intro.map((b) => b.type)).toEqual(["p", "p"]);
    const second = g().intro[1];
    expect(second?.type === "p" && second.text[0]).toEqual({
      b: "Dato clave antes de arrancar:",
    });
  });

  it("has the 3 key facts with their sources (AC 16, 17)", () => {
    expect(factSources(g())).toEqual([
      "USD 8,75",
      "tarifa fija de USD 70",
      "Bus Q70 + subte (gratis + USD 3)",
    ]);
  });

  it("links to 'El subte, explicado' without brackets (D3, AC 20)", () => {
    expect(inlines(g())).toContainEqual({ guide: "el-subte-explicado" });
    expect(plainText(g())).not.toMatch(/[[\]]/);
  });

  it("turns the bold own-line labels into H3 (D1)", () => {
    const labels = g()
      .sections.flatMap((s) => s.blocks)
      .filter((b) => b.type === "h3")
      .map((b) => b.type === "h3" && b.text);
    expect(labels).toContain("AirTrain + subte (la opción más económica)");
    expect(labels).toContain("Bus Q70 + subte (gratis + USD 3)");
  });
});

describe("Caminar por New York (GU-07)", () => {
  const g = () => guide("caminar-por-new-york");

  it("has the 3 key facts with their sources (AC 16, 17)", () => {
    expect(factSources(g())).toEqual([
      "se camina en un minuto",
      "tres o cuatro minutos",
      "entre 15 y 20 mil pasos por día",
    ]);
  });

  it("turns the favourite walks' labels into H3, e.g. 'High Line' (D1)", () => {
    const labels = g()
      .sections.flatMap((s) => s.blocks)
      .filter((b) => b.type === "h3")
      .map((b) => b.type === "h3" && b.text);
    expect(labels).toEqual(["High Line", "Brooklyn Bridge", "Central Park"]);
  });
});

describe("Cómo moverte por New York (GU-08)", () => {
  const g = () => guide("como-moverte-por-new-york");

  it("has the 3 key facts with their sources (AC 16, 17)", () => {
    expect(factSources(g())).toEqual([
      "USD 3 por viaje",
      "Staten Island Ferry (gratis)",
      "dentro de las dos horas",
    ]);
  });

  it("links to 'El subte, explicado' without brackets (D3, AC 20)", () => {
    expect(inlines(g())).toContainEqual({ guide: "el-subte-explicado" });
    expect(plainText(g())).not.toMatch(/[[\]]/);
  });

  it("keeps the ferry labels as H3 (D1)", () => {
    const labels = g()
      .sections.flatMap((s) => s.blocks)
      .filter((b) => b.type === "h3")
      .map((b) => b.type === "h3" && b.text);
    expect(labels).toEqual(["Staten Island Ferry (gratis)", "NYC Ferry"]);
  });
});

describe("West Village (GU-09)", () => {
  it("has no key-facts box: nothing is invented to fill one (AC 16)", () => {
    expect(guide("west-village").keyFacts).toBeUndefined();
  });

  it("ends with the standard band: a lead and 'Quiero mi itinerario' (AC 18)", () => {
    const { cta } = guide("west-village");
    expect("lead" in cta && cta.lead.startsWith("¿Querés")).toBe(true);
    expect(cta.label).toBe("Quiero mi itinerario");
  });
});

describe("Murray Hill (GU-10)", () => {
  it("has no key-facts box: nothing is invented to fill one (AC 16)", () => {
    expect(guide("murray-hill").keyFacts).toBeUndefined();
  });

  it("ends with the standard band: a lead and 'Quiero mi itinerario' (AC 18)", () => {
    const { cta } = guide("murray-hill");
    expect("lead" in cta && cta.lead.startsWith("¿Querés")).toBe(true);
    expect(cta.label).toBe("Quiero mi itinerario");
  });
});

describe("Financial District (GU-11)", () => {
  it("has no key-facts box: nothing is invented to fill one (AC 16)", () => {
    expect(guide("financial-district").keyFacts).toBeUndefined();
  });

  it("ends with the standard band: a lead and 'Quiero mi itinerario' (AC 18)", () => {
    const { cta } = guide("financial-district");
    expect("lead" in cta && cta.lead.startsWith("¿Querés")).toBe(true);
    expect(cta.label).toBe("Quiero mi itinerario");
  });
});

describe("Williamsburg (GU-12)", () => {
  it("has no key-facts box: nothing is invented to fill one (AC 16)", () => {
    expect(guide("williamsburg").keyFacts).toBeUndefined();
  });

  it("ends with the standard band: a lead and 'Quiero mi itinerario' (AC 18)", () => {
    const { cta } = guide("williamsburg");
    expect("lead" in cta && cta.lead.startsWith("¿Querés")).toBe(true);
    expect(cta.label).toBe("Quiero mi itinerario");
  });
});

describe("Visa o ESTA (GU-13)", () => {
  const g = () => guide("visa-a-estados-unidos");

  it("has exactly one numbered list with the five steps (AC 15)", () => {
    const lists = allBlocks(g()).filter((b) => b.type === "ol");
    expect(lists).toHaveLength(1);
    const list = lists[0];
    expect(list?.type === "ol" && list.items).toHaveLength(5);
  });

  it("has the two official external links, both https (AC 20)", () => {
    const external = inlines(g()).filter(
      (i): i is Extract<Inline, { href: string }> =>
        typeof i === "object" && "href" in i,
    );
    expect(external.map((i) => i.href)).toEqual([
      "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html",
      "https://esta.cbp.dhs.gov/",
    ]);
  });

  it("uses the explicit short section ids (spec rule 2)", () => {
    expect(g().sections.map((s) => s.id)).toEqual([
      "visa",
      "esta",
      "la-diferencia-en-resumen",
      "no-sabes-cual-te-corresponde",
    ]);
  });

  it("makes 'Te ayudo con tu visa' the band, keeping its id in the index (AC 18)", () => {
    expect(g().cta).toEqual({
      id: "te-ayudo-con-tu-visa",
      heading: "Te ayudo con tu visa",
      body: "Si sos de Uruguay y tenés que sacar la visa, me encargo de todo el proceso con vos: el formulario DS-160, la cita en la Embajada, buscar una fecha más cercana y prepararte para la entrevista.",
      label: "Quiero gestionar mi visa",
    });
    expect(tocItems(g()).map((i) => i.id)).toEqual([
      "visa",
      "esta",
      "la-diferencia-en-resumen",
      "no-sabes-cual-te-corresponde",
      "te-ayudo-con-tu-visa",
    ]);
  });

  it("closes with the italic disclaimer as small print after the band", () => {
    const after = g().afterCta;
    expect(after).toHaveLength(1);
    expect(after?.[0]?.type).toBe("fine");
  });

  it("has the 3 key facts with their sources (AC 16, 17)", () => {
    expect(factSources(g())).toEqual([
      "USD 185",
      "foto de 5×5 cm",
      "hasta 90 días",
    ]);
  });
});

describe("tocItems (index data)", () => {
  it("uses the H2 text, or tocLabel when the section has one (spec rule 3)", () => {
    const items = tocItems(guide("el-subte-explicado"));
    expect(items.map((i) => i.label)).toContain("El tope semanal");
    expect(items.map((i) => i.label)).toContain("Cómo se paga");
    expect(items.find((i) => i.label === "El tope semanal")?.id).toBe("tope");
  });
});

describe("Cuánto cuesta un día en New York (GU-14)", () => {
  const g = () => guide("cuanto-cuesta-un-dia-en-new-york");

  it("has the 3 key facts with their sources (AC 16, 17)", () => {
    expect(factSources(g())).toEqual([
      "entre USD 50 y 70",
      "entre USD 120 y 160",
      "más de USD 200",
    ]);
  });

  it("names the box as approximate prices (spec § Content & Copy)", () => {
    expect(g().keyFactsLabel).toBe("Datos clave, precios aproximados");
  });

  it("keeps the Doc's italic line as small print inside its section", () => {
    const fines = g().sections.flatMap((s) =>
      s.blocks.filter((b) => b.type === "fine"),
    );
    expect(fines).toHaveLength(1);
    expect(plainText(g())).toContain(
      "Los precios son aproximados y pueden variar según la zona y la época del año.",
    );
  });
});

describe("Qué llevar según la temporada (GU-15)", () => {
  const g = () => guide("que-llevar-segun-la-temporada");

  it("has no 'Mi pique' callout: 'Mi pique de valija' is an H2 section (A-7, AC 15)", () => {
    expect(count(g(), "tip")).toBe(0);
    const section = g().sections.find((s) => s.title === "Mi pique de valija");
    expect(section?.id).toBe("mi-pique-de-valija");
  });

  it("has the 3 key facts with their sources (AC 16, 17)", () => {
    expect(factSources(g())).toEqual(["3 o 5 °C", "pasan los 28 °C", "110 V"]);
  });
});

describe("Entradas para Broadway (GU-16)", () => {
  const g = () => guide("entradas-para-broadway");

  it("has the 3 key facts with their sources (AC 16, 17)", () => {
    expect(factSources(g())).toEqual([
      "dos entradas por el precio de una",
      "hasta 50% de descuento",
      "cargo de USD 8 por entrada",
    ]);
    expect(g().keyFacts?.map((f) => f.value)).toEqual([
      "2×1",
      "Hasta 50%",
      "USD 8",
    ]);
  });

  it("is the last guide, so it has no next (AC 19)", () => {
    expect(nextGuide(g().slug)).toBeUndefined();
  });
});
