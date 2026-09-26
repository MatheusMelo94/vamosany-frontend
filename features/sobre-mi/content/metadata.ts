import type { Metadata } from "next";

/** `<title>` and meta description per route (spec § Page metadata, [new]). */
export const PAGE_METADATA = {
  sobreMi: {
    title: "Sobre mí — Vamos a NY",
    description:
      "Soy Belén, comunicadora, estratega digital y, sobre todo, una persona profundamente enamorada de New York.",
  },
  colaboraciones: {
    title: "Colaboraciones — Vamos a NY",
    description:
      "Además de itinerarios y consultorías, con los años fui creando productos para quienes aman New York tanto como yo.",
  },
  trabajaConmigo: {
    title: "Trabajá conmigo — Vamos a NY",
    description:
      "Si tenés una marca, un proyecto o un servicio relacionado con New York, me encantaría conocerte.",
  },
  contacto: {
    title: "Contacto — Vamos a NY",
    description:
      "¿Estás planificando tu viaje a New York, tenés una duda sobre algún servicio o querés proponerme una colaboración? Contame lo que necesites.",
  },
  faq: {
    title: "Preguntas frecuentes — Vamos a NY",
    description:
      "Itinerarios, consultorías, viajes grupales y productos: lo que más me preguntan antes de viajar a New York.",
  },
} as const satisfies Record<string, Metadata>;
