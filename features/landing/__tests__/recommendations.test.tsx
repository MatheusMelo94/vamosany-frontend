import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Recommendations } from "@/features/landing/components/recommendations";

function setup() {
  const user = userEvent.setup();
  render(<Recommendations />);
  const tab = (name: string) => screen.getByRole("tab", { name });
  const panel = () => screen.getByRole("tabpanel");
  return { user, tab, panel };
}

describe("Recommendations (DDR-0008)", () => {
  it("opens on Pases y atracciones with its three picks", () => {
    const { tab, panel } = setup();
    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual([
      "Pases y atracciones",
      "Broadway",
      "Internet",
    ]);
    expect(tab("Pases y atracciones")).toHaveAttribute("aria-selected", "true");
    expect(panel()).toHaveAccessibleName("Pases y atracciones");
    expect(within(panel()).getAllByRole("article")).toHaveLength(3);
  });

  it("keeps a single tab stop: only the selected tab is focusable", () => {
    const { tab } = setup();
    expect(tab("Pases y atracciones")).toHaveAttribute("tabindex", "0");
    expect(tab("Broadway")).toHaveAttribute("tabindex", "-1");
    expect(tab("Internet")).toHaveAttribute("tabindex", "-1");
  });

  it("switches the panel on click", async () => {
    const { user, tab, panel } = setup();
    await user.click(tab("Internet"));
    expect(tab("Internet")).toHaveAttribute("aria-selected", "true");
    expect(tab("Pases y atracciones")).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(panel()).toHaveAccessibleName("Internet");
    expect(
      within(panel()).getByRole("heading", { name: "Holafly" }),
    ).toBeVisible();
    expect(within(panel()).getByText("Mi código")).toBeVisible();
  });

  it("moves and wraps with the arrow keys, Home and End", async () => {
    const { user, tab } = setup();
    tab("Pases y atracciones").focus();

    await user.keyboard("{ArrowRight}");
    expect(tab("Broadway")).toHaveFocus();
    expect(tab("Broadway")).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{End}");
    expect(tab("Internet")).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(tab("Pases y atracciones")).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(tab("Internet")).toHaveFocus();

    await user.keyboard("{Home}");
    expect(tab("Pases y atracciones")).toHaveFocus();
    expect(tab("Pases y atracciones")).toHaveAttribute("aria-selected", "true");
  });

  it("shows the affiliate note and the contact email", () => {
    setup();
    expect(screen.getByText(/links son de afiliados/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "hola@vamosany.com" }),
    ).toHaveAttribute("href", "mailto:hola@vamosany.com");
  });
});
