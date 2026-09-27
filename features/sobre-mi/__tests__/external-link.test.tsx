import { render, screen } from "@testing-library/react";
import { ExternalLink } from "@/features/sobre-mi/components/external-link";

describe("ExternalLink (AC 28)", () => {
  it("opens in a new tab without leaking the opener", () => {
    render(
      <ExternalLink href="https://estudioulbia.com/">
        Estudio Ulbia
      </ExternalLink>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://estudioulbia.com/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("says it opens in another tab, in its accessible name", () => {
    render(<ExternalLink href="https://efehus.com/">Efe Hus</ExternalLink>);
    expect(
      screen.getByRole("link", {
        name: "Efe Hus (se abre en otra pestaña)",
      }),
    ).toBeInTheDocument();
  });

  it("shows the ↗ glyph to sighted users only", () => {
    render(
      <ExternalLink href="https://monacases.com.uy/">Mona Cases</ExternalLink>,
    );
    const arrow = screen.getByText("↗", { exact: false });
    expect(arrow).toHaveAttribute("aria-hidden", "true");
  });

  it("accepts https: URLs only (type level)", () => {
    // @ts-expect-error — only https: URLs are allowed
    render(<ExternalLink href="http://example.com/">Insecure</ExternalLink>);
    // @ts-expect-error — mailto: is a plain <a>, not an external new-tab link
    render(<ExternalLink href="mailto:hola@vamosany.com">Email</ExternalLink>);
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });
});
