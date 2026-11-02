import { render, screen, within } from "@testing-library/react";
import { KeyFacts } from "@/features/guias/components/key-facts";
import type { KeyFact } from "@/features/guias/types";

const FACTS: KeyFact[] = [
  { value: "USD 3", label: "por viaje, en subte o bus local", source: "USD 3" },
  {
    value: "USD 35",
    label: "tope en 7 días: después, gratis",
    source: "USD 35",
  },
  { value: "24 h", label: "funciona todos los días", source: "24 horas" },
];

describe("KeyFacts (spec § Key Facts box; AC 16)", () => {
  it("renders a labelled list of 3 items, each reading figure and label together", () => {
    render(<KeyFacts facts={FACTS} />);
    const list = screen.getByRole("list", { name: "Datos clave" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("USD 3 por viaje, en subte o bus local");
    expect(items[2]).toHaveTextContent("24 h funciona todos los días");
  });

  it("uses the guide's accessible-name override", () => {
    render(<KeyFacts facts={FACTS} label="Datos clave, precios aproximados" />);
    expect(
      screen.getByRole("list", { name: "Datos clave, precios aproximados" }),
    ).toBeInTheDocument();
  });

  it("renders nothing, not even an empty element, without facts", () => {
    const { container } = render(<KeyFacts facts={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("is one column below the facts container width and three at and above it", () => {
    render(<KeyFacts facts={FACTS} />);
    const list = screen.getByRole("list");
    expect(list.className).toContain("grid-cols-1");
    expect(list.className).toContain("@guide-facts:grid-cols-3");
  });

  it("sets the figure in Courier with tabular numerals", () => {
    render(<KeyFacts facts={FACTS} />);
    const figure = screen.getByText("USD 35");
    expect(figure.className).toContain("tabular-nums");
  });
});
