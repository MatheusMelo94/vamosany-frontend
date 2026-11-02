import { settleAtMargin } from "@/features/guias/lib/settle-scroll";

/** A heading whose viewport top the test controls; scrollIntoView is spied. */
function heading(top: { value: number }, margin = "112px") {
  const el = document.createElement("h2");
  el.getBoundingClientRect = () => ({ top: top.value }) as DOMRect;
  el.style.scrollMarginTop = margin;
  document.body.append(el);
  el.scrollIntoView = vi.fn();
  return el;
}

beforeEach(() => {
  vi.useFakeTimers();
  Object.defineProperty(window, "innerHeight", {
    value: 800,
    configurable: true,
  });
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: 5000,
    configurable: true,
  });
});
afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("settleAtMargin (RV-0049)", () => {
  it("re-aligns the heading when the scroll ends short of its scroll margin", () => {
    const top = { value: 1893 };
    const el = heading(top);
    settleAtMargin(el);
    window.dispatchEvent(new Event("scrollend"));
    expect(el.scrollIntoView).toHaveBeenCalledWith({
      block: "start",
      behavior: "auto",
    });
  });

  it("does nothing when the heading is already at the margin", () => {
    const top = { value: 112.4 };
    const el = heading(top);
    settleAtMargin(el);
    window.dispatchEvent(new Event("scrollend"));
    expect(el.scrollIntoView).not.toHaveBeenCalled();
  });

  it("falls back to a quiet timeout where scrollend does not exist, or the scroll never started", () => {
    const top = { value: 900 };
    const el = heading(top);
    settleAtMargin(el);
    vi.advanceTimersByTime(249);
    expect(el.scrollIntoView).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(el.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("waits while scroll events keep coming", () => {
    const top = { value: 900 };
    const el = heading(top);
    settleAtMargin(el);
    for (let i = 0; i < 10; i++) {
      vi.advanceTimersByTime(100);
      window.dispatchEvent(new Event("scroll"));
    }
    expect(el.scrollIntoView).not.toHaveBeenCalled();
  });

  it("checks again after a correction and stops once aligned", () => {
    const top = { value: 900 };
    const el = heading(top);
    settleAtMargin(el);
    window.dispatchEvent(new Event("scrollend"));
    top.value = 112;
    window.dispatchEvent(new Event("scrollend"));
    window.dispatchEvent(new Event("scrollend"));
    expect(el.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("gives up after three corrections", () => {
    const top = { value: 900 };
    const el = heading(top);
    settleAtMargin(el);
    for (let i = 0; i < 8; i++) window.dispatchEvent(new Event("scrollend"));
    expect(el.scrollIntoView).toHaveBeenCalledTimes(3);
  });

  it("does not chase a heading the page is too short to bring up (scrolled to the bottom)", () => {
    Object.defineProperty(window, "scrollY", {
      value: 4200,
      configurable: true,
    });
    const top = { value: 400 };
    const el = heading(top);
    settleAtMargin(el);
    window.dispatchEvent(new Event("scrollend"));
    expect(el.scrollIntoView).not.toHaveBeenCalled();
  });

  it("yields to the visitor: a wheel, touch, key or pointer takes over", () => {
    for (const type of ["wheel", "touchstart", "keydown", "pointerdown"]) {
      const top = { value: 900 };
      const el = heading(top);
      settleAtMargin(el);
      window.dispatchEvent(new Event(type));
      window.dispatchEvent(new Event("scrollend"));
      vi.advanceTimersByTime(1000);
      expect(el.scrollIntoView).not.toHaveBeenCalled();
    }
  });

  it("stops when cancelled (unmount)", () => {
    const top = { value: 900 };
    const el = heading(top);
    const cancel = settleAtMargin(el);
    cancel();
    window.dispatchEvent(new Event("scrollend"));
    vi.advanceTimersByTime(1000);
    expect(el.scrollIntoView).not.toHaveBeenCalled();
  });
});
