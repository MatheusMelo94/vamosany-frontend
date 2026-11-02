import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { GuideToc } from "@/features/guias/components/guide-toc";

const ITEMS = [
  { id: "como-se-paga", label: "Cómo se paga" },
  { id: "tope", label: "El tope semanal" },
  { id: "otros-datos", label: "Otros datos" },
];

/** Viewport-relative tops the mocked headings report; tests move them to "scroll". */
let currentTops: Record<string, number> = {};

/** Headings in the document with mocked geometry. Returns the cleanup. */
function mountHeadings(tops: Record<string, number>) {
  currentTops = tops;
  const els = ITEMS.map(({ id }) => {
    const h2 = document.createElement("h2");
    h2.id = id;
    h2.tabIndex = -1;
    h2.textContent = id;
    h2.getBoundingClientRect = () =>
      ({
        top: currentTops[id] ?? 0,
        bottom: (currentTops[id] ?? 0) + 30,
      }) as DOMRect;
    document.body.append(h2);
    return h2;
  });
  return () => els.forEach((el) => el.remove());
}

function scrollTo(tops: Record<string, number>, atBottom = false) {
  currentTops = tops;
  Object.defineProperty(window, "scrollY", {
    value: atBottom ? 900 : 0,
    configurable: true,
  });
  act(() => {
    window.dispatchEvent(new Event("scroll"));
    // one rAF-throttled update per frame
    frames.splice(0).forEach((cb) => cb(0));
  });
}
const frames: FrameRequestCallback[] = [];

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    frames.push(cb);
    return frames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  Object.defineProperty(window, "innerHeight", {
    value: 800,
    configurable: true,
  });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: 1700,
    configurable: true,
  });
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
});
afterEach(() => vi.unstubAllGlobals());

describe("GuideToc (plan § 7, § 10; AC 22, 23, 36)", () => {
  it("marks no item active in the server HTML (the no-JS state)", () => {
    const html = renderToString(<GuideToc items={ITEMS} />);
    expect(html).not.toContain("aria-current");
    expect(html).toContain('href="#tope"');
  });

  it("is the 'En esta guía' navigation with one real anchor per section", () => {
    const cleanup = mountHeadings({
      "como-se-paga": 500,
      tope: 900,
      "otros-datos": 1400,
    });
    render(<GuideToc items={ITEMS} />);
    const nav = screen.getByRole("navigation", { name: "En esta guía" });
    expect(nav).toBeInTheDocument();
    expect(
      screen.getAllByRole("link").map((a) => a.getAttribute("href")),
    ).toEqual(["#como-se-paga", "#tope", "#otros-datos"]);
    cleanup();
  });

  it("marks the first item at the top of the page, once mounted", () => {
    const cleanup = mountHeadings({
      "como-se-paga": 500,
      tope: 900,
      "otros-datos": 1400,
    });
    render(<GuideToc items={ITEMS} />);
    const current = screen
      .getAllByRole("link")
      .filter((a) => a.getAttribute("aria-current"));
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent("Cómo se paga");
    expect(current[0]).toHaveAttribute("aria-current", "location");
    cleanup();
  });

  it("moves the single active item as the page scrolls, and to the last at the bottom", () => {
    const cleanup = mountHeadings({
      "como-se-paga": -600,
      tope: 100,
      "otros-datos": 700,
    });
    render(<GuideToc items={ITEMS} />);
    scrollTo({ "como-se-paga": -600, tope: 100, "otros-datos": 700 });
    const names = () =>
      screen
        .getAllByRole("link")
        .filter((a) => a.getAttribute("aria-current") === "location")
        .map((a) => a.textContent);
    expect(names()).toEqual(["El tope semanal"]);
    scrollTo({ "como-se-paga": -1200, tope: -500, "otros-datos": 90 }, true);
    expect(names()).toEqual(["Otros datos"]);
    cleanup();
  });

  it("gives the active item a non-colour cue: bold weight and the yellow fill", () => {
    const cleanup = mountHeadings({
      "como-se-paga": 10,
      tope: 900,
      "otros-datos": 1400,
    });
    render(<GuideToc items={ITEMS} />);
    const active = screen.getByRole("link", { current: "location" });
    expect(active.className).toContain("font-bold");
    expect(active.className).toContain("bg-brand");
    cleanup();
  });

  it("moves focus to the section heading on click, without preventing the browser's own jump", () => {
    const cleanup = mountHeadings({
      "como-se-paga": 500,
      tope: 900,
      "otros-datos": 1400,
    });
    render(<GuideToc items={ITEMS} />);
    const link = screen.getByRole("link", { name: "El tope semanal" });
    const notPrevented = fireEvent.click(link);
    expect(notPrevented).toBe(true);
    expect(document.activeElement).toBe(document.getElementById("tope"));
    expect(document.activeElement).toHaveAttribute("tabindex", "-1");
    cleanup();
  });

  it("removes its listeners on unmount", () => {
    const cleanup = mountHeadings({
      "como-se-paga": 500,
      tope: 900,
      "otros-datos": 1400,
    });
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<GuideToc items={ITEMS} />);
    const added = add.mock.calls.filter(
      ([type]) => type === "scroll" || type === "resize",
    );
    expect(added.length).toBe(2);
    unmount();
    for (const [type, handler] of added) {
      expect(remove).toHaveBeenCalledWith(type, handler);
    }
    add.mockRestore();
    remove.mockRestore();
    cleanup();
  });

  it("listens passively", () => {
    const cleanup = mountHeadings({
      "como-se-paga": 500,
      tope: 900,
      "otros-datos": 1400,
    });
    const add = vi.spyOn(window, "addEventListener");
    render(<GuideToc items={ITEMS} />);
    const scroll = add.mock.calls.find(([type]) => type === "scroll");
    expect(scroll?.[2]).toMatchObject({ passive: true });
    add.mockRestore();
    cleanup();
  });

  it("hides the list below the aside container width and gives rows a coarse-pointer hit area", () => {
    const cleanup = mountHeadings({
      "como-se-paga": 500,
      tope: 900,
      "otros-datos": 1400,
    });
    render(<GuideToc items={ITEMS} />);
    const nav = screen.getByRole("navigation", { name: "En esta guía" });
    expect(nav.className).toContain("hidden");
    expect(nav.className).toContain("@guide-aside:block");
    for (const link of screen.getAllByRole("link")) {
      expect(link.className).toContain("tap-target");
    }
    cleanup();
  });

  describe("a #hash on load (AC 26)", () => {
    const scrollIntoView = vi.fn();
    beforeEach(() => {
      scrollIntoView.mockClear();
      Element.prototype.scrollIntoView = scrollIntoView;
    });
    afterEach(() => {
      window.history.replaceState(null, "", "/");
    });

    it("aligns the named section instantly, so the scroll margin keeps it clear of the navbar", () => {
      const cleanup = mountHeadings({
        "como-se-paga": 500,
        tope: 900,
        "otros-datos": 1400,
      });
      window.history.replaceState(null, "", "/#tope");
      render(<GuideToc items={ITEMS} />);
      expect(scrollIntoView).toHaveBeenCalledWith({
        block: "start",
        behavior: "instant",
      });
      expect(scrollIntoView.mock.contexts[0]).toBe(
        document.getElementById("tope"),
      );
      cleanup();
    });

    it("lets go of the focus the browser put on the heading, so no ring shows on load", () => {
      const cleanup = mountHeadings({
        "como-se-paga": 500,
        tope: 900,
        "otros-datos": 1400,
      });
      window.history.replaceState(null, "", "/#tope");
      document.getElementById("tope")?.focus();
      expect(document.activeElement).toBe(document.getElementById("tope"));
      render(<GuideToc items={ITEMS} />);
      expect(document.activeElement).toBe(document.body);
      cleanup();
    });

    it("keeps the focus a visitor moved to the heading by clicking the index", () => {
      const cleanup = mountHeadings({
        "como-se-paga": 500,
        tope: 900,
        "otros-datos": 1400,
      });
      window.history.replaceState(null, "", "/#tope");
      render(<GuideToc items={ITEMS} />);
      fireEvent.pointerDown(screen.getByRole("link", { name: "Otros datos" }));
      fireEvent.click(screen.getByRole("link", { name: "Otros datos" }));
      window.dispatchEvent(new Event("scrollend"));
      expect(document.activeElement).toBe(
        document.getElementById("otros-datos"),
      );
      cleanup();
    });

    it("aligns again once the browser's own scroll ends (it may have been cut short by the page's layout)", () => {
      const cleanup = mountHeadings({
        "como-se-paga": 500,
        tope: 900,
        "otros-datos": 1400,
      });
      window.history.replaceState(null, "", "/#tope");
      render(<GuideToc items={ITEMS} />);
      scrollIntoView.mockClear();
      window.dispatchEvent(new Event("scrollend"));
      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      cleanup();
    });

    it("stops re-aligning once the visitor scrolls or types", () => {
      const cleanup = mountHeadings({
        "como-se-paga": 500,
        tope: 900,
        "otros-datos": 1400,
      });
      window.history.replaceState(null, "", "/#tope");
      render(<GuideToc items={ITEMS} />);
      scrollIntoView.mockClear();
      window.dispatchEvent(new Event("wheel"));
      window.dispatchEvent(new Event("scrollend"));
      expect(scrollIntoView).not.toHaveBeenCalled();
      cleanup();
    });

    it("ignores a hash that names no section of the guide", () => {
      const cleanup = mountHeadings({
        "como-se-paga": 500,
        tope: 900,
        "otros-datos": 1400,
      });
      window.history.replaceState(null, "", "/#no-existe");
      render(<GuideToc items={ITEMS} />);
      window.dispatchEvent(new Event("scrollend"));
      expect(scrollIntoView).not.toHaveBeenCalled();
      cleanup();
    });

    it("never aligns without a hash, and never throws on a malformed one", () => {
      const cleanup = mountHeadings({
        "como-se-paga": 500,
        tope: 900,
        "otros-datos": 1400,
      });
      render(<GuideToc items={ITEMS} />);
      expect(scrollIntoView).not.toHaveBeenCalled();
      window.history.replaceState(null, "", "/#%E0%A4%A");
      expect(() => render(<GuideToc items={ITEMS} />)).not.toThrow();
      expect(scrollIntoView).not.toHaveBeenCalled();
      cleanup();
    });

    it("ignores an oversized hash (5 KB) without scrolling or throwing", () => {
      // A section whose id is itself 5 KB: only the length cap can reject it,
      // the allowlist alone would match (security finding 0018).
      const longId = "a".repeat(5 * 1024);
      const el = document.createElement("h2");
      el.id = longId;
      document.body.append(el);
      window.history.replaceState(null, "", `/#${longId}`);
      expect(() =>
        render(<GuideToc items={[{ id: longId, label: "Larga" }]} />),
      ).not.toThrow();
      window.dispatchEvent(new Event("scrollend"));
      expect(scrollIntoView).not.toHaveBeenCalled();
      el.remove();
    });

    it("ignores a valid id with markup appended", () => {
      const cleanup = mountHeadings({
        "como-se-paga": 500,
        tope: 900,
        "otros-datos": 1400,
      });
      window.history.replaceState(null, "", "/#tope%3Cimg%20src=x%3E");
      expect(() => render(<GuideToc items={ITEMS} />)).not.toThrow();
      window.dispatchEvent(new Event("scrollend"));
      expect(scrollIntoView).not.toHaveBeenCalled();
      expect(document.querySelector("img")).toBeNull();
      cleanup();
    });
  });
});
