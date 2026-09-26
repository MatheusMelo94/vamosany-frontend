import { render, screen, within } from "@testing-library/react";
import { SobreMiPage } from "@/features/sobre-mi/components/sobre-mi-page";
import { SOBRE_MI } from "@/features/sobre-mi/content/sobre-mi";
import { SM_ATTR, smSel } from "@/features/sobre-mi/motion/attributes";
import { isVerbatim } from "./verbatim";

describe("Sobre mí content (spec § Page 1)", () => {
  it("takes every [md] string verbatim from the content file (AC 12)", () => {
    const md = [
      SOBRE_MI.header.dek,
      ...SOBRE_MI.body.flatMap((block) =>
        block.kind === "photo" || block.kind === "signature"
          ? []
          : [block.text],
      ),
    ];
    // dek + 12 paragraphs + pull line + headline line
    expect(md).toHaveLength(15);
    for (const text of md) {
      expect({ text, verbatim: isVerbatim(text) }).toEqual({
        text,
        verbatim: true,
      });
    }
  });

  it("keeps the md order: pull line second, photo after the first visit, headline line before the community", () => {
    const kinds = SOBRE_MI.body.map((b) => b.kind);
    expect(kinds).toEqual([
      "p",
      "pull",
      "p",
      "p",
      "photo",
      "p",
      "p",
      "headline",
      "p",
      "p",
      "p",
      "p",
      "p",
      "p",
      "p",
      "signature",
    ]);
  });
});

describe("SobreMiPage", () => {
  it("renders the label with the '20' as a visual twin and a final value for assistive tech (AC 21)", () => {
    const { container } = render(<SobreMiPage />);
    const label = container.querySelector(smSel("label"));
    const twin = label?.querySelector(smSel("count"));
    expect(twin).toHaveAttribute("aria-hidden", "true");
    expect(twin).toHaveTextContent("20");
    expect(twin?.nextElementSibling).toHaveClass("sr-only");
    expect(twin?.nextElementSibling).toHaveTextContent("20");
    expect(label).toHaveTextContent(/^Sobre mí.*Montevideo → New York.*\+/);
    expect(label?.textContent).toContain("visitas");
  });

  it("renders every body paragraph, the pull line and the headline line", () => {
    render(<SobreMiPage />);
    for (const block of SOBRE_MI.body) {
      if (block.kind === "photo" || block.kind === "signature") continue;
      expect(screen.getByText(block.text)).toBeInTheDocument();
    }
  });

  it("gives the pull line its own train marker, and the signature its write-on hook (AC 22, 24)", () => {
    const { container } = render(<SobreMiPage />);
    const sweep = container.querySelector(smSel("sweep"));
    expect(sweep).toHaveTextContent("¿Se pueden amar lugares con locura?");
    expect(sweep).toHaveClass("highlight-heading");
    expect(container.querySelector(smSel("signature"))).toHaveTextContent(
      "Belén",
    );
  });

  it("shows the subway photo in a reserved 3:2 surface-2 box with its alt and caption (AC 23)", () => {
    const { container } = render(<SobreMiPage />);
    const img = screen.getByRole("img", {
      name: "Salida de una estación de subte en Union Square, New York",
    });
    expect(img.getAttribute("src")).toContain("how-subway.webp");
    const box = container.querySelector(smSel("parallax"));
    expect(box).toContainElement(img);
    expect(box).toHaveClass("aspect-3/2", "bg-surface-2", "overflow-hidden");
    expect(screen.getByText("Union Square, New York.")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("a reemplazar");
  });

  it("renders the 'En el camino' timeline: five rows and a rail (AC 25)", () => {
    const { container } = render(<SobreMiPage />);
    expect(
      screen.getByRole("heading", { level: 2, name: "En el camino" }),
    ).toBeInTheDocument();
    const list = container.querySelector(smSel("timeline"));
    const rows = within(list as HTMLElement).getAllByRole("listitem");
    expect(rows.map((r) => r.textContent)).toEqual([
      "20 añosLa primera vezSubí las escaleras del subte y algo hizo clic.New York",
      "2020IndependienteComunicación y estrategia digital, por mi cuenta.",
      "2021Nace Vamos a New YorkMi profesión y la ciudad, juntas.",
      "2024Primer viaje grupalDesde entonces, seis viajes.6 grupos",
      "Hoy+20 visitasY sigo volviendo.",
    ]);
    expect(container.querySelector(smSel("rail"))).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("closes with the row to itineraries and group trips (AC 26)", () => {
    const { container } = render(<SobreMiPage />);
    const closing = within(
      container.querySelector(smSel("closing")) as HTMLElement,
    );
    expect(
      closing.getByRole("heading", {
        level: 2,
        name: "¿Armamos tu viaje juntos?",
      }),
    ).toBeInTheDocument();
    expect(
      closing.getByRole("link", { name: "Ver itinerarios" }),
    ).toHaveAttribute("href", "/#services");
    expect(
      closing.getByRole("link", { name: "Viajes grupales" }),
    ).toHaveAttribute("href", "/preguntas-frecuentes#viajes-grupales");
  });

  it("orders the slots label → h1 → dek → body → closing, with only the listed h2s (AC 11, 14)", () => {
    const { container } = render(<SobreMiPage />);
    const order = [
      smSel("label"),
      "h1",
      smSel("dek"),
      smSel("notes"),
      smSel("closing"),
    ].map((s) => container.querySelector(s));
    for (let i = 1; i < order.length; i++) {
      expect(order[i - 1]?.compareDocumentPosition(order[i] as Node)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    }
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
    ).toEqual(["En el camino", "¿Armamos tu viaje juntos?"]);
    expect(SM_ATTR.reveal).toBe("data-sm-reveal");
    expect(container.querySelectorAll(smSel("reveal")).length).toBeGreaterThan(
      10,
    );
  });
});
