import { render, screen, within } from "@testing-library/react";
import { Blocks } from "@/features/guias/components/blocks";
import type { Block } from "@/features/guias/types";

/** Spec § Page Structure › Block rendering; AC 15, 40. */
describe("Blocks renderer", () => {
  it("renders a paragraph with its inline bold and italic", () => {
    const blocks: Block[] = [
      { type: "p", text: ["Cuesta ", { b: "USD 3" }, " en ", { i: "Lover" }] },
    ];
    const { container } = render(<Blocks blocks={blocks} />);
    expect(container.querySelector("p")).toHaveTextContent(
      "Cuesta USD 3 en Lover",
    );
    expect(screen.getByText("USD 3").tagName).toBe("STRONG");
  });

  it("renders an h3 sub-label as a level-3 heading", () => {
    render(<Blocks blocks={[{ type: "h3", text: "Cómo funciona" }]} />);
    expect(
      screen.getByRole("heading", { level: 3, name: "Cómo funciona" }),
    ).toBeInTheDocument();
  });

  it("renders a ul with the yellow-square marker class and bold lead-ins kept", () => {
    render(
      <Blocks
        blocks={[
          { type: "ul", items: [[{ b: "Costo:" }, " USD 3"], ["Otro"]] },
        ]}
      />,
    );
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("UL");
    expect(list).toHaveClass("guide-list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Costo:").tagName).toBe("STRONG");
  });

  it("renders an ol with native visible numbers and never the marker", () => {
    render(
      <Blocks blocks={[{ type: "ol", items: [["Uno"], ["Dos"], ["Tres"]] }]} />,
    );
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(list).not.toHaveClass("guide-list");
    expect(list.className).toContain("list-decimal");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  });

  it("renders a tip as a callout labelled 'Mi pique' that is neither a heading nor a landmark", () => {
    const { container } = render(
      <Blocks blocks={[{ type: "tip", text: ["Yo uso Apple Pay."] }]} />,
    );
    expect(screen.getByText("Mi pique")).toBeInTheDocument();
    expect(container).toHaveTextContent("Yo uso Apple Pay.");
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.queryByRole("complementary")).toBeNull();
    expect(screen.queryByRole("region")).toBeNull();
    expect(container.firstElementChild?.className).toContain("bg-surface-1");
    expect(container.firstElementChild?.className).toContain("rounded-lg");
  });

  it("renders small print in the muted ink and a smaller size", () => {
    const { container } = render(
      <Blocks
        blocks={[{ type: "fine", text: ["Los precios son aproximados."] }]}
      />,
    );
    const fine = container.querySelector("p");
    expect(fine).toHaveTextContent("Los precios son aproximados.");
    expect(fine?.className).toContain("text-ink-muted");
    expect(fine?.className).toContain("body-sm");
  });
});
