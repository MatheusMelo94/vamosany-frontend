import { render, screen } from "@testing-library/react";
import { CtaBand } from "@/features/guias/components/cta-band";

describe("CtaBand (spec § Content Model rules 4-5; AC 18, 43)", () => {
  it("standard: the lead is a paragraph, not a heading, and the button goes to /#services", () => {
    const { container } = render(
      <CtaBand
        cta={{
          lead: "¿Querés que te arme el recorrido día a día?",
          label: "Quiero mi itinerario",
        }}
      />,
    );
    expect(container.querySelector("p")).toHaveTextContent(
      "¿Querés que te arme el recorrido día a día?",
    );
    expect(screen.queryByRole("heading")).toBeNull();
    const link = screen.getByRole("link", { name: "Quiero mi itinerario" });
    expect(link).toHaveAttribute("href", "/#services");
  });

  it("visa: the band holds the H2 with its id, the paragraph and the button", () => {
    render(
      <CtaBand
        cta={{
          id: "te-ayudo-con-tu-visa",
          heading: "Te ayudo con tu visa",
          body: "Me encargo de todo el proceso con vos.",
          label: "Quiero gestionar mi visa",
        }}
      />,
    );
    const heading = screen.getByRole("heading", {
      level: 2,
      name: "Te ayudo con tu visa",
    });
    expect(heading).toHaveAttribute("id", "te-ayudo-con-tu-visa");
    expect(heading).toHaveAttribute("tabindex", "-1");
    expect(
      screen.getByText("Me encargo de todo el proceso con vos."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Quiero gestionar mi visa" }),
    ).toHaveAttribute("href", "/#services");
  });

  it("is a black band with a 20px radius and a yellow-bordered pill button at least 48px tall", () => {
    const { container } = render(
      <CtaBand cta={{ lead: "¿Querés?", label: "Quiero mi itinerario" }} />,
    );
    const band = container.firstElementChild;
    expect(band?.className).toContain("bg-inverse-canvas");
    expect(band?.className).toContain("text-inverse-ink");
    expect(band?.className).toContain("rounded-lg");
    const link = screen.getByRole("link");
    expect(link.className).toContain("min-h-12");
    expect(link.className).toContain("rounded-full");
    expect(link.className).toContain("border-brand");
  });
});
