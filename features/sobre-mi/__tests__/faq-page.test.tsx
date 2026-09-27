import { render, screen, within } from "@testing-library/react";
import { FaqPage } from "@/features/sobre-mi/components/faq-page";
import { FAQ } from "@/features/sobre-mi/content/faq";
import { smSel } from "@/features/sobre-mi/motion/attributes";
import { slugify } from "@/lib/utils";
import { isVerbatim } from "./verbatim";

describe("FAQ content (spec § Page 5)", () => {
  it("takes every question and answer verbatim, in md order (AC 12, 46)", () => {
    const md = [
      FAQ.header.label[0] as string,
      FAQ.header.title,
      ...FAQ.groups.flatMap((g) =>
        g.questions.flatMap((q) => [
          q.question,
          ...(typeof q.answer === "string" ? [q.answer] : q.answer),
        ]),
      ),
    ];
    for (const text of md) {
      expect({ text, verbatim: isVerbatim(text) }).toEqual({
        text,
        verbatim: true,
      });
    }
  });

  it("groups the 14 questions 8 / 5 / 1", () => {
    expect(FAQ.groups.map((g) => [g.name, g.questions.length])).toEqual([
      ["Itinerarios y consultorías", 8],
      ["Viajes grupales", 5],
      ["Productos", 1],
    ]);
  });
});

describe("FaqPage", () => {
  it("labels the page with 14 questions", () => {
    const { container } = render(<FaqPage />);
    expect(container.querySelector(smSel("label"))).toHaveTextContent(
      "Preguntas frecuentes14 preguntas",
    );
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Lo que más me preguntan antes de viajar",
      }),
    ).toBeInTheDocument();
  });

  it("renders each group as an h2 with its count, and an anchor (AC 46, 48)", () => {
    const { container } = render(<FaqPage />);
    for (const [name, count] of [
      ["Itinerarios y consultorías", "8 preguntas"],
      ["Viajes grupales", "5 preguntas"],
      ["Productos", "1 pregunta"],
    ]) {
      const h2 = screen.getByRole("heading", { level: 2, name });
      const group = container.querySelector(`[id="${slugify(name)}"]`);
      expect(group).toContainElement(h2);
      expect(group).toHaveAttribute("data-sm-anchor");
      expect(group).toHaveTextContent(count);
    }
    expect(container.querySelector("#viajes-grupales")).not.toBeNull();
  });

  it("renders 14 native disclosures, all closed, with slug anchors (AC 47, 48)", () => {
    const { container } = render(<FaqPage />);
    const details = Array.from(container.querySelectorAll("details"));
    expect(details).toHaveLength(14);
    const questions = FAQ.groups.flatMap((g) => g.questions);
    details.forEach((d, i) => {
      expect(d.open).toBe(false);
      expect(d.id).toBe(slugify(questions[i]?.question ?? ""));
      expect(d).toHaveAttribute("data-sm-anchor");
      const summary = d.querySelector("summary") as HTMLElement;
      expect(summary).toHaveTextContent(questions[i]?.question ?? "");
      const glyph = summary.querySelector('[aria-hidden="true"]');
      expect(glyph).toHaveTextContent("+");
    });
    expect(details[0]?.id).toBe("que-es-un-itinerario-personalizado");
  });

  it("lists the second answer as five bullet items", () => {
    const { container } = render(<FaqPage />);
    const second = container.querySelectorAll("details")[1] as HTMLElement;
    const items = within(second).getAllByRole("listitem");
    expect(items.map((li) => li.textContent)).toEqual([
      "Reunión virtual para conocernos y hablar de tus gustos y objetivos de viaje",
      "Itinerario para cada día con actividades, tips y recomendaciones",
      "Recomendaciones para comer según cada día y zona",
      "Guía virtual con el itinerario de cada día",
      "Asistencia para comprar entradas y opciones para reservar hotel y traslados",
    ]);
  });

  it("marks the groups and answers for the M7 scene", () => {
    const { container } = render(<FaqPage />);
    expect(container.querySelectorAll(smSel("faqGroup"))).toHaveLength(3);
    expect(container.querySelectorAll(smSel("faqAnswer"))).toHaveLength(14);
  });

  it("closes with 'Escribime' to Contacto (AC 50)", () => {
    const { container } = render(<FaqPage />);
    const closing = within(
      container.querySelector(smSel("closing")) as HTMLElement,
    );
    expect(
      closing.getByRole("heading", {
        level: 2,
        name: "¿No está tu pregunta? Escribime y te respondo yo.",
      }),
    ).toBeInTheDocument();
    expect(closing.getByRole("link", { name: "Escribime" })).toHaveAttribute(
      "href",
      "/contacto",
    );
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
    ).toEqual([
      "Itinerarios y consultorías",
      "Viajes grupales",
      "Productos",
      "¿No está tu pregunta? Escribime y te respondo yo.",
    ]);
  });
});
