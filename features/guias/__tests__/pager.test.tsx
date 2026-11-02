import { render, screen, within } from "@testing-library/react";
import { MoreInGroup } from "@/features/guias/components/more-in-group";
import { Pager } from "@/features/guias/components/pager";

describe("Pager (AC 19, 3)", () => {
  it("links back to all guides and on to the next in menu order", () => {
    render(<Pager slug="el-subte-explicado" />);
    const nav = screen.getByRole("navigation", { name: "Más guías" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["← Volver aTodas las guías", "/guias"],
      ["Siguiente guía →Desde el aeropuerto", "/guias/desde-el-aeropuerto"],
    ]);
  });

  it("has one cell on the last guide (no 'Siguiente')", () => {
    render(<Pager slug="entradas-para-broadway" />);
    const nav = screen.getByRole("navigation", { name: "Más guías" });
    expect(within(nav).getAllByRole("link")).toHaveLength(1);
    expect(within(nav).queryByText(/Siguiente guía/)).toBeNull();
  });

  it("crosses groups: Williamsburg -> Visa, shown by its menu title", () => {
    render(<Pager slug="williamsburg" />);
    const next = screen.getByRole("link", { name: /Siguiente guía/ });
    expect(next).toHaveAttribute("href", "/guias/visa-a-estados-unidos");
    expect(next).toHaveTextContent("Visa a Estados Unidos");
  });

  it("gives the cells a coarse-pointer hit area and a lift that reduced motion removes", () => {
    render(<Pager slug="el-subte-explicado" />);
    for (const link of screen.getAllByRole("link")) {
      expect(link.className).toContain("tap-target");
      expect(link.className).toContain("motion-reduce:hover:translate-y-0");
    }
  });

  it("is one column below the facts container width and two at and above it", () => {
    render(<Pager slug="el-subte-explicado" />);
    const nav = screen.getByRole("navigation", { name: "Más guías" });
    expect(nav.className).toContain("@guide-facts:grid-cols-2");
  });
});

describe("MoreInGroup (AC 21, 40, 43)", () => {
  it("lists the other three guides of the group in menu order, with their blurbs", () => {
    render(<MoreInGroup slug="murray-hill" />);
    const nav = screen.getByRole("navigation", { name: "Más de Barrios" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/guias/west-village",
      "/guias/financial-district",
      "/guias/williamsburg",
    ]);
    expect(links[0]).toHaveTextContent(
      "Calles arboladas, brownstones y cafés con encanto.",
    );
    expect(links[2]).toHaveTextContent(
      "El Brooklyn creativo, con el skyline de frente.",
    );
  });

  it("names the list 'Más de <grupo>' as text, not as a heading", () => {
    const { container } = render(<MoreInGroup slug="el-subte-explicado" />);
    expect(
      screen.getByText("Más de Moverte por la ciudad"),
    ).toBeInTheDocument();
    expect(container.querySelector("h1,h2,h3,h4,h5,h6")).toBeNull();
  });

  it("uses the Visa menu title in 'Más de Antes de viajar'", () => {
    render(<MoreInGroup slug="entradas-para-broadway" />);
    expect(
      screen.getByRole("link", { name: /Visa a Estados Unidos/ }),
    ).toBeInTheDocument();
  });

  it("gives the rows a coarse-pointer hit area", () => {
    render(<MoreInGroup slug="williamsburg" />);
    for (const link of screen.getAllByRole("link")) {
      expect(link.className).toContain("tap-target");
    }
  });
});
