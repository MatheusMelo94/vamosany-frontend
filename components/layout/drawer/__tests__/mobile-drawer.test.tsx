import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { gsap } from "@/lib/gsap";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { focusables, wrapTab } from "../modal";
import { MobileDrawer } from "../mobile-drawer";
import { fakeViewport } from "@/tests/support/viewport";
import { useRef } from "react";

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

const LABELS = ["Itineraries", "Guides", "Blog", "Services", "Sobre mí"];
const SOBRE_MI_PATHS = [
  "/sobre-mi",
  "/colaboraciones",
  "/trabaja-conmigo",
  "/contacto",
  "/preguntas-frecuentes",
];

/** The five group headers, in DOM order. */
const headers = (panel: HTMLElement) =>
  within(panel)
    .getAllByRole("heading", { level: 2 })
    .map((h) => within(h).getByRole("button"));

const expandedLabels = (panel: HTMLElement) =>
  headers(panel)
    .filter((b) => b.getAttribute("aria-expanded") === "true")
    .map(
      (b) =>
        document.getElementById(b.getAttribute("aria-labelledby") ?? "")
          ?.textContent,
    );

describe("MobileDrawer index (AC 6, 11, 13, 14, 20, 23, 24, 32, 35)", () => {
  afterEach(() => {
    vi.mocked(usePathname).mockReturnValue("/");
  });

  it("shows five closed h2 headers in desktop order and no item link on /", async () => {
    const { panel } = await openDrawer();
    const hs = headers(panel);
    expect(hs.map((b) => b.getAttribute("aria-expanded"))).toEqual(
      Array(5).fill("false"),
    );
    for (const [i, label] of LABELS.entries()) {
      expect(hs[i]).toHaveAccessibleName(label);
    }
    // Only the footer's links are exposed while every group is closed.
    expect(
      within(panel)
        .getAllByRole("link")
        .map((a) => a.textContent)
        .sort(),
    ).toEqual(["Log in", "Sign up"]);
  });

  it("focuses the Itineraries header on open", async () => {
    const { panel } = await openDrawer();
    expect(
      within(panel).getByRole("button", { name: "Itineraries" }),
    ).toHaveFocus();
  });

  it("keeps one group open at a time; tapping the open header closes it", async () => {
    const { user, panel } = await openDrawer();
    await user.click(
      within(panel).getByRole("button", { name: "Itineraries" }),
    );
    expect(expandedLabels(panel)).toEqual(["Itineraries"]);
    expect(
      within(panel).getByRole("link", { name: "Weekend Escape" }),
    ).toBeVisible();
    await user.click(within(panel).getByRole("button", { name: "Guides" }));
    expect(expandedLabels(panel)).toEqual(["Guides"]);
    expect(
      within(panel).queryByRole("link", { name: "Weekend Escape" }),
    ).toBeNull();
    await user.click(within(panel).getByRole("button", { name: "Guides" }));
    expect(expandedLabels(panel)).toEqual([]);
  });

  it("toggles a header with Enter and Space, focus staying on it", async () => {
    const { user, panel } = await openDrawer();
    const blog = within(panel).getByRole("button", { name: "Blog" });
    blog.focus();
    await user.keyboard("{Enter}");
    expect(blog).toHaveAttribute("aria-expanded", "true");
    await user.keyboard(" ");
    expect(blog).toHaveAttribute("aria-expanded", "false");
    expect(blog).toHaveFocus();
  });

  it("shows no header dot and no aria-current on /", async () => {
    const { panel } = await openDrawer();
    expect(panel.querySelector("[data-header-dot]")).toBeNull();
    expect(panel.querySelector("[aria-current]")).toBeNull();
  });

  it.each(SOBRE_MI_PATHS)(
    "on %s opens with Sobre mí expanded, Services closed, and the header dot",
    async (path) => {
      vi.mocked(usePathname).mockReturnValue(path);
      const { panel } = await openDrawer();
      expect(expandedLabels(panel)).toEqual(["Sobre mí"]);
      const sobreMi = within(panel).getByRole("button", { name: "Sobre mí" });
      expect(sobreMi.querySelector("[data-header-dot]")).not.toBeNull();
      expect(
        within(panel).getByRole("button", { name: "Services" }),
      ).toHaveAttribute("aria-expanded", "false");
    },
  );

  it("keeps the Sobre mí dot after collapsing it or opening another group (S4)", async () => {
    vi.mocked(usePathname).mockReturnValue("/contacto");
    const { user, panel } = await openDrawer();
    const sobreMi = within(panel).getByRole("button", { name: "Sobre mí" });
    await user.click(sobreMi);
    expect(sobreMi).toHaveAttribute("aria-expanded", "false");
    expect(sobreMi.querySelector("[data-header-dot]")).not.toBeNull();
    await user.click(within(panel).getByRole("button", { name: "Blog" }));
    expect(sobreMi.querySelector("[data-header-dot]")).not.toBeNull();
    expect(panel.querySelectorAll("[data-header-dot]")).toHaveLength(1);
  });

  it("restores the default state on reopen: nothing remembered, list at the top", async () => {
    vi.mocked(usePathname).mockReturnValue("/sobre-mi");
    const { user, panel, burger } = await openDrawer();
    await user.click(within(panel).getByRole("button", { name: "Guides" }));
    const list = panel.querySelector("[data-drawer-list]");
    if (list) list.scrollTop = 120;
    await user.click(burger);
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    const again = await screen.findByRole("navigation", { name: "Menú" });
    expect(expandedLabels(again)).toEqual(["Sobre mí"]);
    expect(again.querySelector("[data-drawer-list]")?.scrollTop).toBe(0);
  });
});

describe("MobileDrawer language and keyboard cycle (AC 2, 27, 33)", () => {
  it("starts on ES, keeps a choice across close and reopen, and leaves the desktop EN", async () => {
    const { user, panel, burger } = await openDrawer();
    const idioma = within(panel).getByRole("group", { name: "Idioma" });
    expect(within(idioma).getByRole("button", { name: "ES" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(within(idioma).getByRole("button", { name: "PT" }));
    expect(screen.getByRole("navigation", { name: "Menú" })).toBe(panel);
    await user.click(burger);
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    const again = await screen.findByRole("navigation", { name: "Menú" });
    const pressed = within(again)
      .getAllByRole("button", { pressed: true })
      .map((b) => b.textContent);
    expect(pressed).toEqual(["PT"]);
    expect(
      screen.getByRole("button", { name: "Change language" }),
    ).toHaveTextContent("EN");
  });

  it("tabs from Itineraries through the index, the footer and the X, and back", async () => {
    const { user } = await openDrawer();
    const order = [
      "Guides",
      "Blog",
      "Services",
      "Sobre mí",
      "ES",
      "PT",
      "EN",
      "Log in",
      "Sign up",
      "Cerrar menú",
      "Itineraries",
    ];
    const name = () =>
      (document.activeElement as HTMLElement | null)?.getAttribute(
        "aria-label",
      ) ??
      document.getElementById(
        document.activeElement?.getAttribute("aria-labelledby") ?? "",
      )?.textContent ??
      document.activeElement?.textContent;
    const seen: Array<string | null | undefined> = [];
    for (let i = 0; i < order.length; i++) {
      await user.tab();
      seen.push(name());
    }
    expect(seen).toEqual(order);
    const back: Array<string | null | undefined> = [];
    for (let i = 0; i < order.length; i++) {
      await user.tab({ shift: true });
      back.push(name());
    }
    expect(back).toEqual([...order].reverse().slice(1).concat("Itineraries"));
  });
});

describe("MobileDrawer motion (AC 41–43, 46; plan § 7)", () => {
  const html = document.documentElement;
  /** Runs every GSAP animation to its end (jsdom has no reliable ticker). */
  const finishMotion = () =>
    act(() => {
      for (const a of gsap.globalTimeline.getChildren(false, true, true))
        a.progress(1);
    });

  // Time stands still: GSAP's ticker is re-woken on a fake rAF that never
  // fires, so only finishMotion() moves an animation.
  const restartTicker = () => {
    gsap.ticker.sleep();
    gsap.ticker.wake();
  };
  beforeEach(() => {
    html.classList.add("gsap");
    vi.useFakeTimers({
      toFake: ["requestAnimationFrame", "cancelAnimationFrame"],
    });
    restartTicker();
  });
  afterEach(() => {
    html.classList.remove("gsap");
    gsap.globalTimeline.clear();
    vi.useRealTimers();
    restartTicker();
    vi.mocked(usePathname).mockReturnValue("/");
  });

  it("starts the unfold on open: the panel is clipped and the groups are transparent", async () => {
    const { panel } = await openDrawer();
    expect(panel.style.clipPath).toContain("inset(");
    const groups = panel.querySelectorAll<HTMLElement>("[data-drawer-group]");
    expect(groups[1]?.style.opacity).toBe("0");
    finishMotion();
    expect(panel.getAttribute("style") ?? "").toBe("");
    expect(groups[1]?.getAttribute("style") ?? "").toBe("");
  });

  it("keeps the panel mounted and inert while it rolls up, then unmounts it", async () => {
    const { user, panel, burger } = await openDrawer();
    finishMotion();
    await user.click(burger);
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveAttribute("inert");
    expect(burger).toHaveAccessibleName("Abrir menú");
    expect(burger).toHaveFocus();
    finishMotion();
    expect(screen.queryByRole("navigation", { name: "Menú" })).toBeNull();
    expect(burger.querySelector("svg")?.getAttribute("style") ?? "").toBe("");
  });

  // Focused directly: in jsdom GSAP re-parents a box-less element to read
  // its transform, which drops focus; the Tab path is in mobile-nav.spec.ts.
  it("completes a group's reveal when focus reaches it mid-unfold", async () => {
    const { panel } = await openDrawer();
    const guides = panel.querySelectorAll<HTMLElement>(
      "[data-drawer-group]",
    )[1];
    expect(guides?.style.opacity).toBe("0");
    within(panel).getByRole("button", { name: "Guides" }).focus();
    expect(guides?.style.opacity).toBe("");
  });

  it("a reopen during the close restores the default group, the list's top and the panel", async () => {
    vi.mocked(usePathname).mockReturnValue("/sobre-mi");
    const { user, panel, burger } = await openDrawer();
    finishMotion();
    await user.click(within(panel).getByRole("button", { name: "Guides" }));
    const list = panel.querySelector("[data-drawer-list]");
    if (list) list.scrollTop = 120;
    await user.click(burger);
    expect(panel).toBeInTheDocument();
    await user.click(burger);
    expect(screen.getByRole("navigation", { name: "Menú" })).toBe(panel);
    expect(panel).not.toHaveAttribute("inert");
    expect(expandedLabels(panel)).toEqual(["Sobre mí"]);
    expect(list?.scrollTop).toBe(0);
    finishMotion();
    expect(screen.getByRole("navigation", { name: "Menú" })).toBe(panel);
    expect(panel.getAttribute("style") ?? "").toBe("");
  });

  const bodyOf = (panel: HTMLElement, label: string) =>
    within(panel)
      .getByRole("button", { name: label })
      .closest("[data-drawer-group]")
      ?.querySelector("[data-drawer-body]") as HTMLElement;

  it("a collapsing body stays painted and inert until its collapse ends (M12)", async () => {
    const { user, panel } = await openDrawer();
    finishMotion();
    await user.click(
      within(panel).getByRole("button", { name: "Itineraries" }),
    );
    finishMotion();
    await user.click(within(panel).getByRole("button", { name: "Guides" }));
    const it = bodyOf(panel, "Itineraries");
    expect(expandedLabels(panel)).toEqual(["Guides"]);
    expect(it).not.toHaveAttribute("hidden");
    expect(it).toHaveAttribute("inert");
    expect(focusables(panel).some((el) => it.contains(el))).toBe(false);
    expect(bodyOf(panel, "Guides").style.height).toBe("0px");
    finishMotion();
    expect(it).toHaveAttribute("hidden");
    expect(bodyOf(panel, "Guides").getAttribute("style") ?? "").toBe("");
  });

  it("a double tap on a header leaves it collapsed, with nothing left running (AC 44)", async () => {
    const { user, panel } = await openDrawer();
    finishMotion();
    const guides = within(panel).getByRole("button", { name: "Guides" });
    await user.click(guides);
    await user.click(guides);
    expect(guides).toHaveAttribute("aria-expanded", "false");
    finishMotion();
    expect(bodyOf(panel, "Guides")).toHaveAttribute("hidden");
    expect(
      gsap.globalTimeline
        .getChildren(true, true, false)
        .filter((t) => t.progress() < 1),
    ).toEqual([]);
  });

  it("a reopen during the close drops any collapsing body at once", async () => {
    const { user, panel, burger } = await openDrawer();
    finishMotion();
    await user.click(
      within(panel).getByRole("button", { name: "Itineraries" }),
    );
    finishMotion();
    await user.click(within(panel).getByRole("button", { name: "Guides" }));
    await user.click(burger);
    await user.click(burger);
    expect(expandedLabels(panel)).toEqual([]);
    for (const label of LABELS) {
      expect(bodyOf(panel, label)).toHaveAttribute("hidden");
      expect(bodyOf(panel, label).getAttribute("style") ?? "").toBe("");
    }
  });

  it("closes at once when the gate is removed while open (checked at call time)", async () => {
    const { user, burger } = await openDrawer();
    html.classList.remove("gsap");
    await user.click(burger);
    expect(screen.queryByRole("navigation", { name: "Menú" })).toBeNull();
  });
});

describe("MobileDrawer breakpoint on mount (RV-0024, AC 30)", () => {
  it("closes silently (onClose, onExited) when it mounts at 1024 or wider", () => {
    const viewport = fakeViewport(1280);
    const onClose = vi.fn();
    const onExited = vi.fn();
    function Host() {
      const burgerRef = useRef<HTMLButtonElement>(null);
      return (
        <>
          <button ref={burgerRef} type="button">
            Cerrar menú
          </button>
          <MobileDrawer
            open
            drawerId="drawer"
            burgerRef={burgerRef}
            lang="ES"
            onLang={() => undefined}
            onClose={onClose}
            onExited={onExited}
          />
        </>
      );
    }
    try {
      render(<Host />);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onExited).toHaveBeenCalledTimes(1);
    } finally {
      viewport.restore();
    }
  });
});
