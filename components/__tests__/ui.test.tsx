import { render, screen } from "@testing-library/react";
import { Button, SectionHeading } from "@/components/ui";

describe("Button", () => {
  it("renders a <button> by default", () => {
    render(<Button>Buy an itinerary</Button>);
    expect(
      screen.getByRole("button", { name: "Buy an itinerary" }),
    ).toBeInTheDocument();
  });

  it("renders a link when href is given", () => {
    render(<Button href="/#services">See services</Button>);
    const link = screen.getByRole("link", { name: "See services" });
    expect(link).toHaveAttribute("href", "/#services");
  });

  it("applies the pill radius only when asked", () => {
    const { rerender } = render(<Button>A</Button>);
    expect(screen.getByRole("button")).toHaveClass("rounded-md");
    rerender(<Button pill>A</Button>);
    expect(screen.getByRole("button")).toHaveClass("rounded-full");
  });
});

describe("SectionHeading", () => {
  it("renders eyebrow, title and description", () => {
    render(
      <SectionHeading
        eyebrow="How it works"
        title="Three steps"
        description="Plain and quick."
      />,
    );
    expect(screen.getByText("How it works")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Three steps" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Plain and quick.")).toBeInTheDocument();
  });

  it("wraps the title in the highlight sweep only when highlight is set", () => {
    const { container, rerender } = render(<SectionHeading title="T" />);
    expect(container.querySelector("[data-sweep]")).toBeNull();
    rerender(<SectionHeading title="T" highlight />);
    expect(container.querySelector("[data-sweep]")).not.toBeNull();
  });

  it("centers when align is center", () => {
    const { container } = render(<SectionHeading title="T" align="center" />);
    expect(container.querySelector("[data-heading-block]")).toHaveClass(
      "text-center",
    );
  });
});
