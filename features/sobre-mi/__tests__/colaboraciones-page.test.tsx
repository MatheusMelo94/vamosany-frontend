import { render, screen, within } from "@testing-library/react";
import { ColaboracionesPage } from "@/features/sobre-mi/components/colaboraciones-page";
import { ClosingRow } from "@/features/sobre-mi/components/closing-row";
import { COLABORACIONES } from "@/features/sobre-mi/content/colaboraciones";
import { plainText } from "@/features/sobre-mi/content/rich-text";
import { smSel } from "@/features/sobre-mi/motion/attributes";
import { isVerbatim } from "./verbatim";

const TITLES = [
  "El cuaderno que empezó todo",
  "Agenda Vamos a New York 2023",
  "Cápsula con Mona Cases",
  "Cuadernos 2023",
  "Agenda Vamos a New York 2024",
  "Tote bags con Efe Hus",
  "Agenda Vamos a New York 2026",
];

describe("Colaboraciones content (spec § Page 2)", () => {
  it("takes every [md] string verbatim (AC 12)", () => {
    const md = [
      COLABORACIONES.header.dek,
      ...COLABORACIONES.rows.flatMap((row) => [
        row.title,
        ...row.story.map((block) =>
          block.kind === "quote" ? block.text : plainText(block.text),
        ),
      ]),
      COLABORACIONES.closing.headline,
      plainText(COLABORACIONES.closing.text),
    ];
    for (const text of md) {
      expect({ text, verbatim: isVerbatim(text) }).toEqual({
        text,
        verbatim: true,
      });
    }
  });

  it("has the seven products in md order, with the mock years and partner lines", () => {
    expect(COLABORACIONES.rows.map((r) => r.title)).toEqual(TITLES);
    expect(COLABORACIONES.rows.map((r) => r.year)).toEqual([
      "2022",
      "2023",
      "2023",
      "2023",
      "2024",
      "2024–25",
      "2026",
    ]);
    expect(COLABORACIONES.rows.map((r) => r.partner.text)).toEqual([
      "Estudio Ulbia",
      "Con Lu, Estudio Ulbia",
      "Mona Cases · mayo 2023",
      "Colección propia",
      "Segunda edición",
      "Efe Hus · Flor",
      "Tercera edición",
    ]);
  });
});

describe("ColaboracionesPage", () => {
  it("renders the header and seven ledger rows with an h2 title each (AC 27)", () => {
    const { container } = render(<ColaboracionesPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Colaboraciones" }),
    ).toBeInTheDocument();
    const ledger = container.querySelector("ol");
    const rows = within(ledger as HTMLElement).getAllByRole("listitem");
    expect(rows).toHaveLength(7);
    rows.forEach((row, i) => {
      expect(
        within(row).getByRole("heading", { level: 2, name: TITLES[i] }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
    ).toEqual([...TITLES, "¿Querés crear algo juntos?"]);
  });

  it("shows each year as a visual twin with the final year for assistive tech (AC 29)", () => {
    const { container } = render(<ColaboracionesPage />);
    const years = Array.from(container.querySelectorAll(smSel("year")));
    expect(years.map((y) => y.textContent)).toEqual([
      "2022",
      "2023",
      "2023",
      "2023",
      "2024",
      "2024–25",
      "2026",
    ]);
    for (const year of years) {
      expect(year).toHaveAttribute("aria-hidden", "true");
      expect(year.nextElementSibling).toHaveClass("sr-only");
      expect(year.nextElementSibling).toHaveTextContent(year.textContent ?? "");
    }
  });

  it("links partners in a new tab from the partner line and the story (AC 28)", () => {
    render(<ColaboracionesPage />);
    for (const [name, href, count] of [
      ["Estudio Ulbia", "https://estudioulbia.com/", 2],
      ["Mona Cases", "https://monacases.com.uy/", 2],
      ["Efe Hus", "https://efehus.com/", 2],
    ] as const) {
      const links = screen
        .getAllByRole("link", { name: /\(se abre en otra pestaña\)$/ })
        .filter((l) => l.getAttribute("href") === href);
      expect(links.map((l) => l.textContent?.includes(name))).toEqual(
        Array(count).fill(true),
      );
      for (const link of links) {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      }
    }
  });

  it("gives the Efe Hus row three paragraphs around the English quote with its own marker (AC 27)", () => {
    const { container } = render(<ColaboracionesPage />);
    const row = screen
      .getByRole("heading", { level: 2, name: "Tote bags con Efe Hus" })
      .closest("li") as HTMLElement;
    const body = row.querySelector(smSel("rowBody"));
    const blocks = Array.from(body?.children ?? []).slice(1);
    expect(blocks.map((b) => b.tagName)).toEqual(["P", "P", "P", "P"]);
    const quote = blocks[2];
    expect(quote).toHaveAttribute("lang", "en");
    expect(quote?.querySelector(smSel("sweep"))).toHaveTextContent(
      "“I think about New York more than a normal person should.”",
    );
    expect(container.querySelectorAll('[lang="en"]')).toHaveLength(1);
  });

  it("marks the partner line and the row body for the M4 row timeline", () => {
    const { container } = render(<ColaboracionesPage />);
    expect(container.querySelectorAll(smSel("partner"))).toHaveLength(7);
    expect(container.querySelectorAll(smSel("rowBody"))).toHaveLength(7);
  });

  it("closes with the md heading and paragraph, email and Trabajá conmigo (AC 31)", () => {
    const { container } = render(<ColaboracionesPage />);
    const closing = within(
      container.querySelector(smSel("closing")) as HTMLElement,
    );
    expect(
      closing.getByRole("heading", {
        level: 2,
        name: "¿Querés crear algo juntos?",
      }),
    ).toBeInTheDocument();
    expect(
      closing.getByRole("link", { name: "hola@vamosany.com" }),
    ).toHaveAttribute("href", "mailto:hola@vamosany.com");
    expect(closing.getByRole("link", { name: "Escribime" })).toHaveAttribute(
      "href",
      "mailto:hola@vamosany.com",
    );
    expect(
      closing.getByRole("link", { name: "Trabajá conmigo" }),
    ).toHaveAttribute("href", "/trabaja-conmigo");
  });
});

describe("ClosingRow text slot", () => {
  it("renders an optional paragraph under the headline", () => {
    render(
      <ClosingRow
        headline="¿Querés crear algo juntos?"
        text="Me encanta crear cosas."
        primary={{ label: "Escribime", href: "mailto:hola@vamosany.com" }}
      />,
    );
    const h2 = screen.getByRole("heading", { level: 2 });
    expect(h2.nextElementSibling).toHaveTextContent("Me encanta crear cosas.");
  });
});
