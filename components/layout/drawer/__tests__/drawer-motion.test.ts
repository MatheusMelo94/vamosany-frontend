import { gsap } from "@/lib/gsap";
import { getEases } from "@/lib/gsap-ease";
import { EASE, MOTION } from "@/lib/motion";
import {
  playClose,
  playOpen,
  playReopen,
  revealFocused,
  type DrawerTargets,
} from "../drawer-motion";

const O = MOTION.drawer.open;
const C = MOTION.drawer.close;

/** The drawer's animated nodes, as MobileDrawer passes them. */
function targets(withDot = true): DrawerTargets {
  document.body.innerHTML = `
    <button id="burger"><svg id="icon"></svg></button>
    <div id="veil"></div>
    <nav id="panel">
      <div data-drawer-list>
        ${[0, 1, 2, 3, 4]
          .map(
            (i) =>
              `<div data-drawer-group id="g${i}"><h2><button>H${i}</button></h2></div>`,
          )
          .join("")}
      </div>
      <div data-drawer-footer id="footer"><button>ES</button></div>
    </nav>
    ${withDot ? '<span data-header-dot id="dot"></span>' : ""}`;
  const $ = (id: string) => document.getElementById(id) as HTMLElement;
  return {
    veil: $("veil"),
    panel: $("panel"),
    icon: document.getElementById("icon"),
    groups: [0, 1, 2, 3, 4].map((i) => $(`g${i}`)),
    footer: $("footer"),
    dot: withDot ? $("dot") : null,
  };
}

type Tween = gsap.core.Tween;
const tweens = (tl: gsap.core.Timeline) =>
  tl.getChildren(true, true, false) as Tween[];
const tweenOf = (tl: gsap.core.Timeline, el: Element | null) => {
  const t = tweens(tl).find((tw) => tw.targets()[0] === el);
  if (!t) throw new Error("no tween for target");
  return t;
};

const html = document.documentElement;
beforeEach(() => html.classList.add("gsap"));
afterEach(() => {
  html.classList.remove("gsap");
  gsap.globalTimeline.clear();
});

describe("playOpen, the unfold (M1–M6)", () => {
  it("fades the veil in from 0 at t = 0 (M1)", () => {
    const t = targets();
    const tl = playOpen(t)!.pause();
    const veil = tweenOf(tl, t.veil);
    expect(veil.startTime()).toBe(0);
    expect(veil.duration()).toBe(O.veil.duration);
    expect(veil.vars.ease).toBe(O.veil.ease);
    expect(Number(gsap.getProperty(t.veil, "opacity"))).toBe(0);
  });

  it("turns the X in from −90° at 0.6 scale, with the arrive ease (M2)", () => {
    const t = targets();
    const tl = playOpen(t)!.pause();
    const icon = tweenOf(tl, t.icon);
    expect(icon.startTime()).toBe(0);
    expect(icon.duration()).toBe(O.icon.duration);
    expect(icon.vars.ease).toBe(getEases().arrive);
    expect(gsap.getProperty(t.icon!, "rotate")).toBe(O.icon.rotate);
    expect(gsap.getProperty(t.icon!, "scale")).toBe(O.icon.scale);
  });

  it("unfolds the panel from a full bottom clip and y −10, then clears it (M3)", () => {
    const t = targets();
    const tl = playOpen(t)!.pause();
    const panel = tweenOf(tl, t.panel);
    expect(panel.startTime()).toBe(0);
    expect(panel.duration()).toBe(O.panel.duration);
    expect(panel.vars.ease).toBe(getEases().arrive);
    expect(t.panel.style.clipPath).toBe(O.panel.clipFrom);
    expect(gsap.getProperty(t.panel, "y")).toBe(O.panel.y);
    tl.progress(1);
    expect(t.panel.style.clipPath).toBe("");
    expect(t.panel.style.transform).toBe("");
  });

  // GSAP re-parses a cleared transform, and for a fixed box with an identity
  // matrix (offsetParent null) it sets display:block to read it: the list's
  // flex height collapses and its scrollTop is lost (found in T011's e2e).
  it("never toggles the panel's display, at the end of the unfold or in the close", () => {
    const t = targets();
    const writes: string[] = [];
    const style = t.panel.style;
    const set = style.setProperty.bind(style);
    Object.defineProperty(style, "display", {
      configurable: true,
      get: () => style.getPropertyValue("display"),
      set: (v: string) => {
        writes.push(v);
        set("display", v);
      },
    });
    const tl = playOpen(t)!.pause();
    writes.length = 0;
    tl.progress(1);
    playClose(t, vi.fn())!.pause().progress(0.5);
    expect(writes).toEqual([]);
  });

  it("raises the five groups with opacity (not autoAlpha), staggered from 0.15s (M4)", () => {
    const t = targets();
    const tl = playOpen(t)!.pause();
    t.groups.forEach((group, i) => {
      const tw = tweenOf(tl, group);
      expect(tw.startTime()).toBeCloseTo(O.rows.at + i * O.rows.stagger);
      expect(tw.duration()).toBe(O.rows.duration);
      expect(tw.vars.ease).toBe(O.rows.ease);
      expect(group.style.opacity).toBe("0");
      expect(group.style.visibility).toBe("");
      expect(gsap.getProperty(group, "y")).toBe(O.rows.y);
    });
  });

  it("raises the footer at 0.3s with the arrive ease (M5)", () => {
    const t = targets();
    const tl = playOpen(t)!.pause();
    const footer = tweenOf(tl, t.footer);
    expect(footer.startTime()).toBeCloseTo(O.footer.at);
    expect(footer.duration()).toBe(O.footer.duration);
    expect(footer.vars.ease).toBe(getEases().arrive);
    expect(gsap.getProperty(t.footer!, "y")).toBe(O.footer.y);
  });

  it("pops the header dot from scale 0 at 0.45s with EASE.pop (M6)", () => {
    const t = targets();
    const tl = playOpen(t)!.pause();
    const dot = tweenOf(tl, t.dot);
    expect(dot.startTime()).toBeCloseTo(O.dot.at);
    expect(dot.duration()).toBe(O.dot.duration);
    expect(dot.vars.ease).toBe(EASE.pop);
    expect(gsap.getProperty(t.dot!, "scale")).toBe(0);
  });

  it("builds no dot tween where no group holds the current page", () => {
    const t = targets(false);
    const tl = playOpen(t)!.pause();
    expect(tweens(tl)).toHaveLength(1 + 1 + 1 + 5 + 1);
  });

  it("settles by 0.85s and leaves no inline motion styles behind", () => {
    const t = targets();
    const tl = playOpen(t)!.pause();
    expect(tl.duration()).toBeCloseTo(O.dot.at + O.dot.duration);
    tl.progress(1);
    for (const el of [t.veil, t.icon!, t.panel, ...t.groups, t.footer!, t.dot!])
      expect((el as HTMLElement).getAttribute("style") ?? "").toBe("");
  });

  it("creates no tween without the .gsap gate, checked when called", () => {
    const t = targets();
    html.classList.remove("gsap");
    expect(playOpen(t)).toBeNull();
    expect(gsap.getTweensOf([t.veil, t.panel, t.icon, ...t.groups])).toEqual(
      [],
    );
    expect(t.panel.getAttribute("style")).toBeNull();
  });
});

describe("revealFocused, the focus safeguard (ADR-0008)", () => {
  it("completes the reveal of the group that received focus, not the others", () => {
    const t = targets();
    const tl = playOpen(t)!.pause();
    revealFocused(tl, t.groups[2]!.querySelector("button")!);
    expect(t.groups[2]!.style.opacity).toBe("");
    expect(t.groups[3]!.style.opacity).toBe("0");
    tl.progress(0.1);
    expect(t.groups[2]!.style.opacity).toBe("");
  });

  it("completes the footer's reveal when a footer control gets focus", () => {
    const t = targets();
    const tl = playOpen(t)!.pause();
    revealFocused(tl, t.footer!.querySelector("button")!);
    expect(t.footer!.style.opacity).toBe("");
  });
});

describe("playClose, the roll-up (M7–M9)", () => {
  it("clips the panel back up to y −6 and fades the veil from 0.05s", () => {
    const t = targets();
    const onDone = vi.fn();
    const tl = playClose(t, onDone)!.pause();
    const panel = tweenOf(tl, t.panel);
    expect(panel.startTime()).toBe(0);
    expect(panel.duration()).toBe(C.panel.duration);
    expect(panel.vars.ease).toBe(C.panel.ease);
    expect(panel.vars.clipPath).toBe(O.panel.clipFrom);
    expect(panel.vars.y).toBe(C.panel.y);
    const veil = tweenOf(tl, t.veil);
    expect(veil.startTime()).toBeCloseTo(C.veil.at);
    expect(veil.duration()).toBe(C.veil.duration);
    expect(veil.vars.opacity).toBe(0);
    expect(onDone).not.toHaveBeenCalled();
    tl.progress(1);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("rolls up from the current state when the unfold is mid-way (to, never fromTo)", () => {
    const t = targets();
    playOpen(t)!.pause().progress(0.2).kill();
    const clipNow = t.panel.style.clipPath;
    const tl = playClose(t, vi.fn())!.pause();
    tl.progress(0.001);
    expect(t.panel.style.clipPath).not.toBe(O.panel.clipFrom);
    expect(clipNow).not.toBe("");
  });

  it("puts the icon back upright when it ends, so the burger swaps clean", () => {
    const t = targets();
    playOpen(t)!.pause().progress(0.1).kill();
    const tl = playClose(t, vi.fn())!.pause();
    tl.progress(1);
    expect(t.icon!.getAttribute("style") ?? "").toBe("");
  });

  it("without the gate, finishes synchronously and creates no tween", () => {
    const t = targets();
    playOpen(t)!.pause().progress(0.1).kill();
    html.classList.remove("gsap");
    const onDone = vi.fn();
    expect(playClose(t, onDone)).toBeNull();
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(t.icon!.getAttribute("style") ?? "").toBe("");
  });
});

describe("playReopen, a reopen during the close", () => {
  it("tweens everything to the settled values with the open durations", () => {
    const t = targets();
    playClose(t, vi.fn())!.pause().progress(0.5).kill();
    const tl = playReopen(t)!.pause();
    expect(tweenOf(tl, t.panel).duration()).toBe(O.panel.duration);
    expect(tweenOf(tl, t.veil).duration()).toBe(O.veil.duration);
    tl.progress(1);
    expect(t.panel.getAttribute("style") ?? "").toBe("");
    expect(t.veil.getAttribute("style") ?? "").toBe("");
  });

  it("is instant without the gate", () => {
    const t = targets();
    playClose(t, vi.fn())!.pause().progress(0.5).kill();
    html.classList.remove("gsap");
    expect(playReopen(t)).toBeNull();
    expect(t.panel.getAttribute("style") ?? "").toBe("");
  });
});
