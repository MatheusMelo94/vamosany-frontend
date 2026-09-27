import { render, screen, within } from "@testing-library/react";
import { PageHeader } from "@/features/sobre-mi/components/page-header";
import { NotesLayout } from "@/features/sobre-mi/components/notes-layout";
import { ClosingRow } from "@/features/sobre-mi/components/closing-row";
import { SM_ATTR, sm, smSel } from "@/features/sobre-mi/motion/attributes";

describe("SM_ATTR contract (ADR-0003 condition 3)", () => {
  it("spreads a typed data attribute and selects it with the same name", () => {
    expect(sm("heading")).toEqual({ "data-sm-heading": "" });
    expect(sm("scene", "sobre-mi")).toEqual({ "data-sm-scene": "sobre-mi" });
    expect(smSel("notes")).toBe("[data-sm-notes]");
    expect(Object.values(SM_ATTR).every((a) => a.startsWith("data-sm-"))).toBe(
      true,
    );
  });
});

describe("PageHeader (slots 01–03)", () => {
  const header = {
    label: ["Sobre mí", "Montevideo → New York", "+20 visitas"],
    title: "Sobre mí",
    dek: "Soy Belén, comunicadora.",
  };

  it("renders label, then one h1, then the dek, in that order (AC 11)", () => {
    const { container } = render(<PageHeader {...header} />);
    const label = container.querySelector(smSel("label"));
    const h1 = screen.getByRole("heading", { level: 1 });
    const dek = screen.getByText("Soy Belén, comunicadora.");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(label?.compareDocumentPosition(h1)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(h1.compareDocumentPosition(dek)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("renders 1–3 label items separated by spacing, never by a middle dot", () => {
    const { container } = render(<PageHeader {...header} />);
    const label = container.querySelector(smSel("label"));
    expect(label?.children).toHaveLength(3);
    expect(label?.textContent).not.toContain("·");
  });

  it("keeps the h1's accessible name equal to the title (AC 14)", () => {
    const { container } = render(<PageHeader {...header} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Sobre mí" }),
    ).toBeInTheDocument();
    const visual = container.querySelector(smSel("train"));
    expect(visual).toHaveAttribute("aria-hidden", "true");
    expect(visual).toHaveAttribute(SM_ATTR.split);
    expect(visual).toHaveTextContent("Sobre mí");
  });

  it("marks the heading block for the entrance timeline", () => {
    const { container } = render(<PageHeader {...header} />);
    const block = container.querySelector(smSel("heading"));
    expect(block).not.toBeNull();
    expect(block?.querySelector(smSel("dek"))).not.toBeNull();
  });
});

describe("NotesLayout (slot 04)", () => {
  it("puts the notes column before the main column (AC 18; widths in e2e structure.spec)", () => {
    const { container } = render(
      <NotesLayout notes={["Belén", "Lic. en Comunicación"]}>
        <p>Main column</p>
      </NotesLayout>,
    );
    const notes = container.querySelector(smSel("notes"));
    const main = screen.getByText("Main column");
    expect(notes?.compareDocumentPosition(main)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("renders the first note as an h2 when it names the section", () => {
    render(
      <NotesLayout heading notes={["En el camino", "20 años → hoy"]}>
        <p>Main</p>
      </NotesLayout>,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "En el camino" }),
    ).toBeInTheDocument();
  });
});

describe("ClosingRow (slot 05)", () => {
  it("renders an h2 headline and a primary action between two 2px ink rules (AC 11)", () => {
    const { container } = render(
      <ClosingRow
        headline="¿Armamos tu viaje juntos?"
        primary={{ label: "Ver itinerarios", href: "/#services" }}
        secondary={{
          label: "Viajes grupales",
          href: "/preguntas-frecuentes#viajes-grupales",
        }}
      />,
    );
    const row = container.querySelector(smSel("closing"));
    const scope = within(row as HTMLElement);
    expect(
      scope.getByRole("heading", {
        level: 2,
        name: "¿Armamos tu viaje juntos?",
      }),
    ).toBeInTheDocument();
    expect(
      scope.getByRole("link", { name: "Ver itinerarios" }),
    ).toHaveAttribute("href", "/#services");
    expect(
      scope.getByRole("link", { name: "Viajes grupales" }),
    ).toHaveAttribute("href", "/preguntas-frecuentes#viajes-grupales");
    expect(row?.querySelectorAll(smSel("closingItem"))).toHaveLength(3);
  });

  it("renders without a secondary action", () => {
    render(
      <ClosingRow
        headline="¿No está tu pregunta? Escribime y te respondo yo."
        primary={{ label: "Escribime", href: "/contacto" }}
      />,
    );
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});
