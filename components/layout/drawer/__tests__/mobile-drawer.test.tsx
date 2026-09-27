import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "@/components/layout/navbar";
import { focusables, wrapTab } from "../modal";

vi.mock("next/navigation", () => ({ usePathname: vi.fn(() => "/") }));

/** Opens the drawer from the burger and waits for the lazy chunk. */
async function openDrawer() {
  const user = userEvent.setup();
  render(<Navbar />);
  await user.click(screen.getByRole("button", { name: "Abrir menú" }));
  const panel = await screen.findByRole("navigation", { name: "Menú" });
  const burger = screen.getByRole("button", { name: "Cerrar menú" });
  return { user, panel, burger, items: focusables(panel) };
}

describe("focusables", () => {
  it("lists links and buttons in DOM order, skipping hidden and inert ones", () => {
    document.body.innerHTML = `
      <div id="root">
        <a href="/a">a</a>
        <div hidden><a href="/b">b</a></div>
        <div inert><button>c</button></div>
        <button disabled>d</button>
        <button>e</button>
      </div>`;
    const root = document.getElementById("root") as HTMLElement;
    expect(focusables(root).map((el) => el.textContent)).toEqual(["a", "e"]);
  });
});

describe("wrapTab", () => {
  function setup() {
    document.body.innerHTML = `<button id="first">1</button><button id="mid">2</button><button id="last">3</button>`;
    const [first, mid, last] = ["first", "mid", "last"].map(
      (id) => document.getElementById(id) as HTMLElement,
    ) as [HTMLElement, HTMLElement, HTMLElement];
    return { first, mid, last };
  }
  const tab = (shiftKey = false) =>
    new KeyboardEvent("keydown", { key: "Tab", shiftKey, cancelable: true });

  it("moves Tab from the last element to the first", () => {
    const { first, last } = setup();
    last.focus();
    const e = tab();
    wrapTab(e, first, last);
    expect(e.defaultPrevented).toBe(true);
    expect(first).toHaveFocus();
  });

  it("moves Shift+Tab from the first element to the last", () => {
    const { first, last } = setup();
    first.focus();
    const e = tab(true);
    wrapTab(e, first, last);
    expect(e.defaultPrevented).toBe(true);
    expect(last).toHaveFocus();
  });

  it("leaves every other Tab to the browser", () => {
    const { first, mid, last } = setup();
    mid.focus();
    const e = tab();
    wrapTab(e, first, last);
    expect(e.defaultPrevented).toBe(false);
    expect(mid).toHaveFocus();
  });
});

describe("MobileDrawer focus (AC 29, 32, 33)", () => {
  it("moves focus to the panel's first focusable on open", async () => {
    const { items } = await openDrawer();
    expect(items.length).toBeGreaterThan(1);
    expect(items[0]).toHaveFocus();
  });

  it("wraps Tab between the last panel control and the burger, both ways", async () => {
    const { user, burger, items } = await openDrawer();
    const first = items[0];
    const last = items.at(-1);
    last?.focus();
    await user.tab();
    expect(burger).toHaveFocus();
    await user.tab();
    expect(first).toHaveFocus();
    await user.tab({ shift: true });
    expect(burger).toHaveFocus();
    await user.tab({ shift: true });
    expect(last).toHaveFocus();
  });

  it("closes on Escape from a panel control and returns focus to the burger", async () => {
    const { user, items } = await openDrawer();
    items[3]?.focus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("navigation", { name: "Menú" })).toBeNull();
    expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveFocus();
  });

  it("closes on a veil click and returns focus to the burger", async () => {
    const { panel } = await openDrawer();
    const veil = panel.previousElementSibling;
    expect(veil).toHaveAttribute("aria-hidden", "true");
    if (veil) fireEvent.click(veil);
    expect(screen.queryByRole("navigation", { name: "Menú" })).toBeNull();
    expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveFocus();
  });

  it("closes from the X and leaves focus on the burger", async () => {
    const { user, burger } = await openDrawer();
    await user.click(burger);
    expect(screen.queryByRole("navigation", { name: "Menú" })).toBeNull();
    expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveFocus();
  });
});
