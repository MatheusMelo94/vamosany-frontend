import { cn, slugify } from "@/lib/utils";

describe("cn", () => {
  it("joins and drops falsy values", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });

  it("lets the last conflicting Tailwind class win", () => {
    expect(cn("bg-brand border-ink", "bg-transparent border-white")).toBe(
      "bg-transparent border-white",
    );
  });
});

describe("slugify", () => {
  it("turns a Spanish question into a stable anchor", () => {
    expect(slugify("¿Qué es un itinerario personalizado?")).toBe(
      "que-es-un-itinerario-personalizado",
    );
  });

  it("slugs a group name", () => {
    expect(slugify("Viajes grupales")).toBe("viajes-grupales");
    expect(slugify("Itinerarios y consultorías")).toBe(
      "itinerarios-y-consultorias",
    );
  });

  it("strips accents, ñ, ¿ ¡ and punctuation, and lowercases", () => {
    expect(slugify("¡Sí, claro! Año, compañía: ÚLTIMO.")).toBe(
      "si-claro-ano-compania-ultimo",
    );
  });

  it("collapses separators and trims them at the ends", () => {
    expect(slugify("  ¿Cómo  se pagan — los viajes?  ")).toBe(
      "como-se-pagan-los-viajes",
    );
  });

  it("is stable: slugging a slug returns it unchanged", () => {
    const once = slugify(
      "¿Dónde puedo comprar los productos de Vamos a New York?",
    );
    expect(slugify(once)).toBe(once);
  });
});
