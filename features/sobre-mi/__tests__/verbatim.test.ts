import {
  DOCUMENTED_EXCEPTIONS,
  isVerbatim,
  normalizeSource,
  normalizeText,
  SOURCE,
} from "./verbatim";

describe("normalizeSource", () => {
  it("drops bold/italic markers, backslash escapes and link syntax, and collapses whitespace", () => {
    expect(
      normalizeSource(
        '**Título**  \nHola *"cita"* \\[x\\] ¡Sí\\! [Estudio Ulbia](https://estudioulbia.com/)\n\n  fin',
      ),
    ).toBe('Título Hola "cita" [x] ¡Sí! Estudio Ulbia fin');
  });
});

describe("the committed content source (docs/content/sobre-mi-source.md)", () => {
  it("is the Sobre mí content file", () => {
    expect(SOURCE).toContain("PÁGINA: SOBRE MI");
    expect(SOURCE).toContain("PÁGINA: TRABAJÁ CONMIGO");
  });

  it.each([
    "Soy Belén, comunicadora, estratega digital y, sobre todo, una persona profundamente enamorada de New York.",
    "A principios de 2022 le escribí a Lu, de Estudio Ulbia, con un pedido muy simple: quería un cuaderno de New York para mí.",
    "¡Sí, claro! Si querés compartir habitación, nosotros nos encargamos de buscarte compañero o compañera de cuarto.",
    "¿Nos tomamos un cafecito?",
  ])("finds a known sentence verbatim: %s", (sentence) => {
    expect(isVerbatim(sentence)).toBe(true);
  });

  it("rejects a sentence with a single accent changed", () => {
    expect(
      isVerbatim(
        "Soy Belen, comunicadora, estratega digital y, sobre todo, una persona profundamente enamorada de New York.",
      ),
    ).toBe(false);
  });

  it("rejects a sentence with an opening ¿ dropped", () => {
    expect(isVerbatim("Nos tomamos un cafecito?")).toBe(false);
  });

  it("compares strings with their whitespace collapsed", () => {
    expect(normalizeText("  Sobre   mí \n")).toBe("Sobre mí");
  });
});

describe("DOCUMENTED_EXCEPTIONS (spec-sanctioned edits only)", () => {
  it("lists exactly the four edits the spec and plan allow", () => {
    expect(DOCUMENTED_EXCEPTIONS.map((e) => e.text)).toEqual([
      "¿Estás planificando tu viaje a New York, tenés una duda sobre algún servicio o querés proponerme una colaboración? Contame lo que necesites. Cada mensaje lo leo y lo respondo yo, así que puede que tarde un par de días en contestarte, pero siempre respondo.",
      "Cápsula con Mona Cases",
      "Tote bags con Efe Hus",
      "“I think about New York more than a normal person should.”",
    ]);
  });

  it("names, for each, the source text it replaces, and that source is in the file", () => {
    for (const exception of DOCUMENTED_EXCEPTIONS) {
      expect(normalizeSource(SOURCE)).toContain(exception.source);
      expect(exception.reason.length).toBeGreaterThan(0);
    }
  });

  it("accepts the exceptions and nothing that merely resembles them", () => {
    for (const exception of DOCUMENTED_EXCEPTIONS) {
      expect(isVerbatim(exception.text)).toBe(true);
    }
    expect(
      isVerbatim("“I think about New York more than a normal person should!”"),
    ).toBe(false);
  });
});
