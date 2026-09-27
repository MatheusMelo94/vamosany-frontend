import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Lang } from "@/components/layout/nav-config";
import { DrawerFooter } from "../drawer-footer";

function renderFooter(lang: Lang = "ES") {
  const onLang = vi.fn();
  const onNavigate = vi.fn();
  render(<DrawerFooter lang={lang} onLang={onLang} onNavigate={onNavigate} />);
  return { onLang, onNavigate };
}

describe("DrawerFooter language control (AC 10, 27, 39)", () => {
  it("is a group named Idioma with ES, PT, EN toggles, only the current one pressed", () => {
    renderFooter("PT");
    const group = screen.getByRole("group", { name: "Idioma" });
    const buttons = within(group).getAllByRole("button");
    expect(buttons.map((b) => b.textContent)).toEqual(["ES", "PT", "EN"]);
    expect(buttons.map((b) => b.getAttribute("aria-pressed"))).toEqual([
      "false",
      "true",
      "false",
    ]);
  });

  it("drops the visible word and hides the globe", () => {
    renderFooter();
    expect(screen.queryByText("Language")).toBeNull();
    const globe = screen
      .getByRole("group", { name: "Idioma" })
      .parentElement?.querySelector("svg");
    expect(globe).toHaveAttribute("aria-hidden", "true");
  });

  it("reports a tap through onLang and navigates nowhere", async () => {
    const user = userEvent.setup();
    const { onLang, onNavigate } = renderFooter();
    await user.click(screen.getByRole("button", { name: "EN" }));
    expect(onLang).toHaveBeenCalledWith("EN");
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("renders segments in Montserrat semibold that fill a 48px track", () => {
    renderFooter();
    const group = screen.getByRole("group", { name: "Idioma" });
    expect(group).toHaveClass("min-h-12", "border-2", "rounded-full");
    for (const b of within(group).getAllByRole("button")) {
      expect(b).toHaveClass("body-sm", "font-semibold", "rounded-full");
      expect(b).not.toHaveClass("label-button");
    }
    expect(screen.getByRole("button", { name: "ES" })).toHaveClass(
      "bg-ink",
      "text-inverse-ink",
    );
  });
});

describe("DrawerFooter account buttons (AC 10, 28)", () => {
  it("puts Log in left of Sign up, 48px pills in body-sm semibold", () => {
    renderFooter();
    const links = screen.getAllByRole("link");
    expect(links.map((a) => a.textContent)).toEqual(["Log in", "Sign up"]);
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "#login",
      "#signup",
    ]);
    for (const a of links) {
      expect(a).toHaveClass(
        "min-h-12",
        "rounded-full",
        "body-sm",
        "font-semibold",
      );
    }
    expect(links[1]).toHaveClass("bg-ink", "text-inverse-ink");
  });

  it("closes the drawer through onNavigate", async () => {
    const user = userEvent.setup();
    const { onNavigate } = renderFooter();
    await user.click(screen.getByRole("link", { name: "Sign up" }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});
