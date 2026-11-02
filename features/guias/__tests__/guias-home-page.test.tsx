import { render, screen, within } from "@testing-library/react";
import { GuiasHomePage } from "@/features/guias/components/guias-home-page";
import { GUIDE_SLUGS } from "@/features/guias/content/slugs";

/** Spec § Page Structure › Guías home; AC 9, 10, 13, 40. */
describe("GuiasHomePage", () => {
  it("has one H1 with the approved title and the marker only on 'Todo lo que necesitás' (AC 9)", () => {
    const { container } = render(<GuiasHomePage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      "Todo lo que necesitás para moverte por New York",
    );
    expect(container.querySelector(".highlight-heading")?.textContent).toBe(
      "Todo lo que necesitás",
    );
  });

  it("shows the eyebrow 'Guías' and the approved intro", () => {
    render(<GuiasHomePage />);
    expect(screen.getByText("Guías", { selector: "p" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Lo que aprendí en más de 20 visitas, ordenado para que lo encuentres rápido: cómo moverte, en qué barrio quedarte y qué resolver antes de viajar.",
      ),
    ).toBeInTheDocument();
  });

  it("has three numbered group sections with their H2, count and 4 cards each", () => {
    render(<GuiasHomePage />);
    const sections = screen.getAllByRole("region");
    expect(sections).toHaveLength(3);
    const expected = [
      ["01", "Moverte por la ciudad"],
      ["02", "Barrios"],
      ["03", "Antes de viajar"],
    ] as const;
    sections.forEach((section, i) => {
      const [eyebrow, title] = expected[i] as readonly [string, string];
      expect(within(section).getByText(eyebrow)).toBeInTheDocument();
      expect(
        within(section).getByRole("heading", { level: 2, name: title }),
      ).toBeInTheDocument();
      expect(within(section).getByText("4 guías")).toBeInTheDocument();
      expect(within(section).getAllByRole("link")).toHaveLength(4);
    });
  });

  it("lists the 12 cards in menu order", () => {
    render(<GuiasHomePage />);
    const hrefs = screen
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(GUIDE_SLUGS.map((slug) => `/guias/${slug}`));
  });

  it("outlines H1, three H2 and twelve H3 without skipping a level (AC 40)", () => {
    const { container } = render(<GuiasHomePage />);
    const levels = [...container.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(
      (h) => Number(h.tagName[1]),
    );
    expect(levels.filter((l) => l === 1)).toHaveLength(1);
    expect(levels.filter((l) => l === 2)).toHaveLength(3);
    expect(levels.filter((l) => l === 3)).toHaveLength(12);
    expect(levels[0]).toBe(1);
  });

  it("gives each stripe the group's anchor id, for the guide breadcrumb (AC 13)", () => {
    const { container } = render(<GuiasHomePage />);
    for (const id of ["moverte-por-la-ciudad", "barrios", "antes-de-viajar"]) {
      expect(container.querySelector(`section#${id}`)).not.toBeNull();
    }
  });

  it("alternates white, cream, white stripes (AC 9)", () => {
    render(<GuiasHomePage />);
    const [a, b, c] = screen.getAllByRole("region");
    expect(a?.className).toContain("bg-canvas");
    expect(b?.className).toContain("bg-surface-1");
    expect(c?.className).toContain("bg-canvas");
  });

  it("lays the cards out in 1, 2 and 4 columns by container width (AC 11)", () => {
    const { container } = render(<GuiasHomePage />);
    const grid = container.querySelector("section ul");
    expect(grid?.className).toContain("grid-cols-1");
    expect(grid?.className).toContain("@guide-facts:grid-cols-2");
    expect(grid?.className).toContain("@guide-cards:grid-cols-4");
  });

  it("loads the first stripe's photos eagerly and the rest lazily", () => {
    const { container } = render(<GuiasHomePage />);
    const imgs = [...container.querySelectorAll("img")];
    expect(imgs).toHaveLength(12);
    imgs.forEach((img, i) => {
      if (i < 4) expect(img).not.toHaveAttribute("loading", "lazy");
      else expect(img).toHaveAttribute("loading", "lazy");
    });
  });
});
