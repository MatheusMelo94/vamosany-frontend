import { render, screen, within } from "@testing-library/react";
import { Breadcrumb } from "@/features/guias/components/breadcrumb";
import { GuideHeading } from "@/features/guias/components/guide-heading";
import { GROUPS } from "@/features/guias/content/groups";
import { smSel } from "@/features/sobre-mi/motion/attributes";

describe("GuideHeading (plan D-11, § 10)", () => {
  it("renders one H1 whose accessible name is the title (AC 3, 40)", () => {
    render(
      <GuideHeading
        eyebrow="Moverte por la ciudad"
        title="El subte, explicado"
        dek="Leé el mapa como una local."
        align="start"
      />,
    );
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveAccessibleName("El subte, explicado");
  });

  it("orders eyebrow, H1 and dek inside the motion heading block", () => {
    const { container } = render(
      <GuideHeading
        eyebrow="Barrios"
        title="West Village"
        dek="Calles arboladas."
        align="start"
      />,
    );
    const block = container.querySelector(smSel("heading"));
    expect(block).not.toBeNull();
    const text = block?.textContent ?? "";
    expect(text.indexOf("Barrios")).toBeLessThan(text.indexOf("West Village"));
    expect(text.indexOf("West Village")).toBeLessThan(text.indexOf("Calles"));
    expect(block?.querySelector("[data-sm-label]")).toHaveTextContent(
      "Barrios",
    );
    expect(block?.querySelector("[data-sm-dek]")).toHaveTextContent(
      "Calles arboladas.",
    );
  });

  it("marks the whole title on a guide (AC 9)", () => {
    const { container } = render(
      <GuideHeading
        eyebrow="Barrios"
        title="West Village"
        dek="x"
        align="start"
      />,
    );
    const marked = container.querySelector(".highlight-heading");
    expect(marked).toHaveTextContent("West Village");
  });

  it("marks only the given words on the home (AC 9)", () => {
    const { container } = render(
      <GuideHeading
        eyebrow="Guías"
        title="Todo lo que necesitás para moverte por New York"
        marked="Todo lo que necesitás"
        dek="Intro."
        align="center"
      />,
    );
    expect(container.querySelector(".highlight-heading")?.textContent).toBe(
      "Todo lo que necesitás",
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      "Todo lo que necesitás para moverte por New York",
    );
    // the visual copy is one split target carrying the whole title, hidden from assistive tech
    const visual = container.querySelector("[data-sm-split]");
    expect(visual).toHaveAttribute("aria-hidden", "true");
    expect(visual?.textContent).toBe(
      "Todo lo que necesitás para moverte por New York",
    );
  });

  it("lets the marker follow the split target's train (static state: 0%)", () => {
    const { container } = render(
      <GuideHeading eyebrow="a" title="b" dek="c" align="start" />,
    );
    const visual = container.querySelector<HTMLElement>("[data-sm-split]");
    expect(visual).toHaveAttribute("data-sm-train");
    expect(visual?.className).toContain("[--train:0%]");
    expect(
      container
        .querySelector<HTMLElement>(".highlight-heading")
        ?.style.getPropertyValue("--train"),
    ).toBe("inherit");
  });

  it("centers the home head and left-aligns the guide head", () => {
    const { container, rerender } = render(
      <GuideHeading eyebrow="a" title="b" dek="c" align="center" />,
    );
    expect(container.querySelector(smSel("heading"))?.className).toContain(
      "text-center",
    );
    rerender(<GuideHeading eyebrow="a" title="b" dek="c" align="start" />);
    expect(container.querySelector(smSel("heading"))?.className).not.toContain(
      "text-center",
    );
  });
});

describe("Breadcrumb (AC 13, A-6)", () => {
  const group = GROUPS[1]!;

  it("is the 'Ruta' navigation: Guías, then the group, both links", () => {
    render(<Breadcrumb group={group} />);
    const nav = screen.getByRole("navigation", { name: "Ruta" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["Guías", "/guias"],
      ["Barrios", "/guias#barrios"],
    ]);
  });

  it("is not inside the motion heading block (it must stay visible and focusable)", () => {
    const { container } = render(<Breadcrumb group={group} />);
    expect(container.querySelector(smSel("heading"))).toBeNull();
    expect(container.closest(smSel("heading"))).toBeNull();
  });
});
