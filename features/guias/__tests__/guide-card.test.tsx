import { render, screen } from "@testing-library/react";
import { GuideCard } from "@/features/guias/components/guide-card";
import { guideMeta } from "@/features/guias/content/queries";

describe("GuideCard (plan D-7, § 8; AC 10, 11, 12)", () => {
  it("is one link to the guide whose accessible name is the card text", () => {
    render(<GuideCard meta={guideMeta("el-subte-explicado")} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/guias/el-subte-explicado");
    expect(links[0]).toHaveAccessibleName(
      "El subte, explicado Leé el mapa como una local. Leer la guía",
    );
  });

  it("has the title as a level-3 heading inside the link, and a decorative arrow", () => {
    const { container } = render(
      <GuideCard meta={guideMeta("west-village")} />,
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "West Village" }),
    ).toBeInTheDocument();
    const arrow = container.querySelector("[aria-hidden]");
    expect(arrow).toHaveTextContent("→");
  });

  it("uses the menu title for Visa, never the long page title (AC 3)", () => {
    render(<GuideCard meta={guideMeta("visa-a-estados-unidos")} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Visa a Estados Unidos",
    );
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/guias/visa-a-estados-unidos",
    );
  });

  it("shows a decorative 3:2 thumbnail (alt empty, spec A-4) with the card sizes", () => {
    const { container } = render(<GuideCard meta={guideMeta("murray-hill")} />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute(
      "sizes",
      "(min-width: 62.5625rem) 280px, (min-width: 35.0625rem) 50vw, 100vw",
    );
    const box = img?.parentElement;
    expect(box?.className).toContain("aspect-3/2");
    expect(box?.className).toContain("bg-surface-1");
    expect(img?.style.objectPosition).toBe("50% 40%");
  });

  it("loads lazily by default and eagerly with priority (first row)", () => {
    const { container, rerender } = render(
      <GuideCard meta={guideMeta("murray-hill")} />,
    );
    expect(container.querySelector("img")).toHaveAttribute("loading", "lazy");
    rerender(<GuideCard meta={guideMeta("murray-hill")} priority />);
    expect(container.querySelector("img")).not.toHaveAttribute(
      "loading",
      "lazy",
    );
  });

  it("lifts on hover where hover exists, and reduced motion removes the lift but keeps the border", () => {
    render(<GuideCard meta={guideMeta("murray-hill")} />);
    const link = screen.getByRole("link");
    expect(link.className).toContain("hover:-translate-y-0.5");
    expect(link.className).toContain("motion-reduce:hover:translate-y-0");
    expect(link.className).toContain("border-2");
    expect(link.className).toContain("border-ink");
    expect(link.className).toContain("rounded-lg");
  });

  it("lets a long title wrap without overflowing the card", () => {
    render(<GuideCard meta={guideMeta("cuanto-cuesta-un-dia-en-new-york")} />);
    const title = screen.getByRole("heading", { level: 3 });
    expect(title.className).toContain("min-w-0");
    expect(title.className).toContain("wrap-anywhere");
  });
});
