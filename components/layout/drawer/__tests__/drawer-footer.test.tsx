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
});

describe("DrawerFooter account buttons (AC 10, 28)", () => {
  it("puts Log in left of Sign up", () => {
    renderFooter();
    const links = screen.getAllByRole("link");
    expect(links.map((a) => a.textContent)).toEqual(["Log in", "Sign up"]);
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "#login",
      "#signup",
    ]);
  });

  it("closes the drawer through onNavigate", async () => {
    const user = userEvent.setup();
    const { onNavigate } = renderFooter();
    await user.click(screen.getByRole("link", { name: "Sign up" }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});
