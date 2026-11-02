import { fireEvent, render, screen } from "@testing-library/react";
import { GuideTocDetails } from "@/features/guias/components/guide-toc-details";
import { tocItems } from "@/features/guias/content/toc";
import { BODIES } from "@/features/guias/content/guides/index";

const ITEMS = tocItems(BODIES["el-subte-explicado"]);

describe("GuideTocDetails (mobile index; AC 24)", () => {
  it("is a native details with the summary 'En esta guía'", () => {
    const { container } = render(<GuideTocDetails items={ITEMS} />);
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    expect(details).not.toHaveAttribute("open");
    expect(details?.querySelector("summary")).toHaveTextContent("En esta guía");
  });

  it("lists one link per section with the spec's labels ('El tope semanal' via tocLabel)", () => {
    render(<GuideTocDetails items={ITEMS} />);
    const links = screen.getAllByRole("link", { hidden: true });
    expect(links).toHaveLength(ITEMS.length);
    expect(links.map((a) => a.getAttribute("href"))).toContain("#tope");
    expect(links.map((a) => a.textContent)).toContain("El tope semanal");
    expect(links.map((a) => a.textContent)).not.toContain(
      "El tope semanal (fare cap)",
    );
  });

  it("closes when a link is chosen, and moves focus to the section heading", () => {
    const heading = document.createElement("h2");
    heading.id = "tope";
    heading.tabIndex = -1;
    document.body.append(heading);
    const { container } = render(<GuideTocDetails items={ITEMS} />);
    const details = container.querySelector("details") as HTMLDetailsElement;
    details.setAttribute("open", "");
    const notPrevented = fireEvent.click(
      screen.getByRole("link", { name: "El tope semanal", hidden: true }),
    );
    expect(notPrevented).toBe(true);
    expect(details).not.toHaveAttribute("open");
    expect(document.activeElement).toBe(heading);
    heading.remove();
  });

  it("opening it does not move focus", () => {
    const { container } = render(<GuideTocDetails items={ITEMS} />);
    const summary = container.querySelector("summary") as HTMLElement;
    summary.focus();
    (container.querySelector("details") as HTMLDetailsElement).setAttribute(
      "open",
      "",
    );
    expect(document.activeElement).toBe(summary);
  });

  it("is hidden from the aside container width up, with a 44px summary", () => {
    const { container } = render(<GuideTocDetails items={ITEMS} />);
    expect(container.querySelector("details")?.className).toContain(
      "@guide-aside:hidden",
    );
    expect(container.querySelector("summary")?.className).toContain("min-h-11");
  });
});
