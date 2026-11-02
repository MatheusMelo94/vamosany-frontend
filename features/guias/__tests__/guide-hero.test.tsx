import { render, screen } from "@testing-library/react";
import { GuideHero } from "@/features/guias/components/guide-hero";
import { GUIDE_PHOTOS, creditLine } from "@/features/guias/content/photos";

describe("GuideHero (plan D-7; AC 14, 31, 32)", () => {
  it("shows the registry alt, never empty, and is not lazy (priority: preloaded, eager)", () => {
    render(<GuideHero slug="el-subte-explicado" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", GUIDE_PHOTOS["el-subte-explicado"].alt);
    expect(img.getAttribute("alt")).not.toBe("");
    expect(img).not.toHaveAttribute("loading", "lazy");
  });

  it("declares the hero sizes (AC 31)", () => {
    render(<GuideHero slug="west-village" />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "sizes",
      "(min-width: 48rem) 760px, 100vw",
    );
  });

  it("applies the guide's focal point as object-position", () => {
    render(<GuideHero slug="financial-district" />);
    expect(screen.getByRole("img").style.objectPosition).toBe("85% 50%");
  });

  it("puts the credit line as real text directly after the photo box (AC 14)", () => {
    const { container } = render(
      <GuideHero slug="cuanto-cuesta-un-dia-en-new-york" />,
    );
    const caption = container.querySelector("figcaption");
    expect(caption?.textContent).toBe(
      creditLine("cuanto-cuesta-un-dia-en-new-york"),
    );
    expect(caption?.previousElementSibling).toBe(
      container.querySelector("img")?.parentElement,
    );
  });

  it("reserves a 3:2 box with the surface fill, so a failed photo keeps size and credit (AC 32)", () => {
    const { container } = render(<GuideHero slug="entradas-para-broadway" />);
    const box = container.querySelector("img")?.parentElement;
    expect(box?.className).toContain("aspect-3/2");
    expect(box?.className).toContain("bg-surface-1");
    expect(container.querySelector("figcaption")?.textContent).toBe(
      "Foto: Vamos a NY",
    );
  });

  it("is a figure", () => {
    render(<GuideHero slug="murray-hill" />);
    expect(screen.getByRole("figure")).toBeInTheDocument();
  });
});
