import { render, screen, within } from "@testing-library/react";
import { GuidePage } from "@/features/guias/components/guide-page";
import { getGuide } from "@/features/guias/content/guides";
import { smSel } from "@/features/sobre-mi/motion/attributes";

function page(slug: string) {
  const guide = getGuide(slug);
  if (!guide) throw new Error(slug);
  return render(<GuidePage guide={guide} />);
}

/** Structure of the composed guide page (spec § Page Structure; AC 13-16, 18, 19, 24, 40). */
describe("GuidePage", () => {
  it("has one H1 equal to the page title and an H2 per section with its id", () => {
    page("el-subte-explicado");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      "El subte, explicado",
    );
    const tope = screen.getByRole("heading", {
      level: 2,
      name: "El tope semanal (fare cap)",
    });
    expect(tope).toHaveAttribute("id", "tope");
    expect(tope).toHaveAttribute("tabindex", "-1");
    expect(tope.className).toContain("scroll-mt-28");
  });

  it("orders breadcrumb, eyebrow, H1, dek, hero, article and aside (AC 13)", () => {
    const { container } = page("west-village");
    const order = [
      container.querySelector('nav[aria-label="Ruta"]'),
      container.querySelector("[data-sm-label]"),
      container.querySelector("h1"),
      container.querySelector("[data-sm-dek]"),
      container.querySelector("figure"),
      container.querySelector("article"),
      container.querySelector("aside"),
    ];
    order.forEach((el) => expect(el).not.toBeNull());
    for (let i = 1; i < order.length; i++) {
      const before = order[i - 1] as Element;
      const after = order[i] as Element;
      expect(
        before.compareDocumentPosition(after) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  it("keeps the breadcrumb outside the motion heading block (plan D-11)", () => {
    const { container } = page("west-village");
    const crumb = container.querySelector('nav[aria-label="Ruta"]');
    expect(crumb?.closest(smSel("heading"))).toBeNull();
    expect(container.querySelector(smSel("heading"))).not.toBeNull();
  });

  it("shows the key-facts box after the intro and before the first H2, only where the guide has facts (AC 16)", () => {
    const { container } = page("el-subte-explicado");
    const facts = screen.getByRole("list", { name: "Datos clave" });
    const firstH2 = container.querySelector("article h2") as Element;
    expect(
      facts.compareDocumentPosition(firstH2) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders no key-facts element on a Barrios guide", () => {
    page("murray-hill");
    expect(screen.queryByRole("list", { name: /Datos clave/ })).toBeNull();
  });

  it("names the Cuánto cuesta box as approximate prices", () => {
    page("cuanto-cuesta-un-dia-en-new-york");
    expect(
      screen.getByRole("list", { name: "Datos clave, precios aproximados" }),
    ).toBeInTheDocument();
  });

  it("closes with the band to /#services, then the pager (AC 18, 19)", () => {
    page("el-subte-explicado");
    const cta = screen.getByRole("link", { name: "Quiero mi itinerario" });
    expect(cta).toHaveAttribute("href", "/#services");
    const pager = screen.getByRole("navigation", { name: "Más guías" });
    expect(
      cta.compareDocumentPosition(pager) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("Visa: the band is the 'Te ayudo con tu visa' H2, followed by the disclaimer", () => {
    const { container } = page("visa-a-estados-unidos");
    const h2 = screen.getByRole("heading", {
      level: 2,
      name: "Te ayudo con tu visa",
    });
    expect(h2).toHaveAttribute("id", "te-ayudo-con-tu-visa");
    const button = screen.getByRole("link", {
      name: "Quiero gestionar mi visa",
    });
    const disclaimer = screen.getByText(/Esta guía es informativa/);
    expect(
      button.compareDocumentPosition(disclaimer) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    // the Visa H1 is the long title
    expect(container.querySelector("h1")).toHaveTextContent(
      "Visa o ESTA: qué necesitás para viajar a Estados Unidos",
    );
  });

  it("exposes the index twice in the markup (aside nav and details) for CSS to pick one", () => {
    const { container } = page("el-subte-explicado");
    expect(container.querySelector("details summary")).toHaveTextContent(
      "En esta guía",
    );
    expect(
      screen.getByRole("navigation", { name: "En esta guía" }),
    ).toBeInTheDocument();
  });

  it("puts 'Más de <grupo>' in the aside, which follows the article", () => {
    const { container } = page("el-subte-explicado");
    const aside = container.querySelector("aside") as HTMLElement;
    expect(aside).toHaveAttribute("aria-label", "Más sobre esta guía");
    expect(
      within(aside).getByRole("navigation", {
        name: "Más de Moverte por la ciudad",
      }),
    ).toBeInTheDocument();
  });

  it("makes the aside sticky only at the aside width on tall viewports (AC 21, 25)", () => {
    const { container } = page("el-subte-explicado");
    const aside = container.querySelector("aside") as HTMLElement;
    expect(aside.className).toContain("@guide-aside:tall:sticky");
    expect(aside.className).toContain("@guide-aside:tall:top-28");
    expect(aside.className).not.toMatch(/(^|\s)sticky/);
  });

  it("has exactly one level-1 and never skips a heading level", () => {
    const { container } = page("desde-el-aeropuerto");
    const levels = [...container.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(
      (h) => Number(h.tagName[1]),
    );
    expect(levels.filter((l) => l === 1)).toHaveLength(1);
    for (let i = 1; i < levels.length; i++) {
      expect(
        (levels[i] as number) - (levels[i - 1] as number),
      ).toBeLessThanOrEqual(1);
    }
  });
});
