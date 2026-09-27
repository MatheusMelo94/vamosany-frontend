import { afterEach, describe, expect, it } from "vitest";
import { gsap } from "@/lib/gsap";
import { focusReveal } from "@/features/sobre-mi/motion/scenes/focus-reveal";
import type { SceneContext } from "@/features/sobre-mi/motion/scenes/types";

/**
 * ADR-0008 condition 2: a reveal target (or its ancestor) that takes focus
 * while still hidden is completed at once, so focus never sits on an
 * invisible element. Synthetic markup only.
 */

function mount(html: string): SceneContext & { cleanup: () => void } {
  const root = document.createElement("div");
  root.setAttribute("data-sm-scene", "contacto");
  root.innerHTML = html;
  document.body.append(root);
  const context: SceneContext = {
    root,
    eases: { ds: (t: number) => t, arrive: (t: number) => t },
    contextSafe: (fn) => fn,
  };
  const cleanup = focusReveal(context) ?? (() => {});
  return { ...context, cleanup };
}

const q = <T extends HTMLElement>(root: HTMLElement, sel: string) =>
  root.querySelector<T>(sel)!;

afterEach(() => {
  gsap.globalTimeline.clear();
  document.body.innerHTML = "";
});

describe("focusReveal", () => {
  it("completes a paused reveal of the focused control's wrapper", () => {
    const { root, cleanup } = mount(
      `<div data-sm-field><input id="f-last" /></div>`,
    );
    const wrapper = q(root, "[data-sm-field]");
    const tween = gsap.fromTo(
      wrapper,
      { opacity: 0 },
      { opacity: 1, duration: 1, paused: true },
    );

    q(root, "#f-last").focus();

    expect(tween.progress()).toBe(1);
    expect(wrapper.style.opacity).toBe("1");
    cleanup();
  });

  it("completes the whole timeline when the reveal is nested in one", () => {
    const { root, cleanup } = mount(
      `<ul><li><span data-rule></span><p><a href="#x">link</a></p></li></ul>`,
    );
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(
      q(root, "[data-rule]"),
      { scaleX: 0 },
      { scaleX: 1, duration: 1 },
    );
    tl.fromTo(q(root, "p"), { opacity: 0 }, { opacity: 1, duration: 1 });

    q(root, "a").focus();

    expect(tl.progress()).toBe(1);
    expect(q(root, "p").style.opacity).toBe("1");
    cleanup();
  });

  it("leaves tweens that don't hide the element alone (the M8 shake)", () => {
    const { root, cleanup } = mount(
      `<div data-sm-field><input id="f-shake" /></div>`,
    );
    const shake = gsap.to(q(root, "[data-sm-field]"), {
      x: 10,
      duration: 1,
      paused: true,
    });

    q(root, "#f-shake").focus();

    expect(shake.progress()).toBe(0);
    cleanup();
  });

  it("ignores focus outside its scene and stops listening on cleanup", () => {
    const { root, cleanup } = mount(
      `<div data-sm-field><input id="f-in" /></div>`,
    );
    const outside = document.createElement("div");
    outside.innerHTML = `<input id="f-out" />`;
    document.body.append(outside);
    const outsideTween = gsap.fromTo(
      outside,
      { opacity: 0 },
      { opacity: 1, duration: 1, paused: true },
    );
    const inside = gsap.fromTo(
      q(root, "[data-sm-field]"),
      { opacity: 0 },
      { opacity: 1, duration: 1, paused: true },
    );

    q(outside, "#f-out").focus();
    expect(outsideTween.progress()).toBe(0);

    cleanup();
    q(root, "#f-in").focus();
    expect(inside.progress()).toBe(0);
  });
});
