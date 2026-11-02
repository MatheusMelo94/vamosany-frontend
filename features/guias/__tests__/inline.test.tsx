import { render, screen } from "@testing-library/react";
import { Inline } from "@/features/guias/components/inline";

describe("Inline renderer (plan D-3; AC 20)", () => {
  it("renders plain strings verbatim", () => {
    const { container } = render(<Inline nodes={["Hola ", "mundo."]} />);
    expect(container.textContent).toBe("Hola mundo.");
  });

  it("maps bold to <strong> and italic to <em>", () => {
    render(<Inline nodes={["a ", { b: "negrita" }, " y ", { i: "Lover" }]} />);
    expect(screen.getByText("negrita").tagName).toBe("STRONG");
    expect(screen.getByText("Lover").tagName).toBe("EM");
  });

  it("renders a guide reference as a link to the guide, labelled with its menu title, no brackets", () => {
    const { container } = render(
      <Inline
        nodes={["la guía ", { guide: "el-subte-explicado" }, ", te sirve."]}
      />,
    );
    const link = screen.getByRole("link", { name: "El subte, explicado" });
    expect(link).toHaveAttribute("href", "/guias/el-subte-explicado");
    expect(container.textContent).toBe(
      "la guía El subte, explicado, te sirve.",
    );
  });

  it("uses the menu title (not the page title) for the Visa guide", () => {
    render(<Inline nodes={[{ guide: "visa-a-estados-unidos" }]} />);
    expect(screen.getByRole("link")).toHaveTextContent("Visa a Estados Unidos");
  });

  it("renders an external link in a new tab with the hidden notice", () => {
    render(
      <Inline
        nodes={[
          { href: "https://esta.cbp.dhs.gov/", text: "web oficial del ESTA" },
        ]}
      />,
    );
    const link = screen.getByRole("link", {
      name: /web oficial del ESTA \(se abre en otra pestaña\)/,
    });
    expect(link).toHaveAttribute("href", "https://esta.cbp.dhs.gov/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
