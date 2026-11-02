import { getGuide } from "@/features/guias/content/guides";
import type { Block, Guide } from "@/features/guias/types";

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
