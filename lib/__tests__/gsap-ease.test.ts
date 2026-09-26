import { CustomEase as EaseFromEaseModule, getEases } from "@/lib/gsap-ease";
import * as gsapText from "@/lib/gsap-text";
import { motionEnabled } from "@/lib/gsap";
import { motionEnabled as landingMotionEnabled } from "@/features/landing/motion/attributes";

describe("getEases", () => {
  it("creates the ds and arrive eases once and returns the same instances", () => {
    const first = getEases();
    const second = getEases();
    expect(typeof first.ds).toBe("function");
    expect(typeof first.arrive).toBe("function");
    expect(second.ds).toBe(first.ds);
    expect(second.arrive).toBe(first.arrive);
  });

  it("maps the ends of the curve to 0 and 1", () => {
    const { ds, arrive } = getEases();
    expect(ds(0)).toBeCloseTo(0);
    expect(ds(1)).toBeCloseTo(1);
    expect(arrive(0)).toBeCloseTo(0);
    expect(arrive(1)).toBeCloseTo(1);
  });
});

describe("lib/gsap-text keeps its public surface for the landing", () => {
  it("still exports SplitText, CustomEase and the same getEases", () => {
    expect(gsapText.SplitText).toBeDefined();
    expect(gsapText.CustomEase).toBe(EaseFromEaseModule);
    expect(gsapText.getEases).toBe(getEases);
  });
});

describe("motionEnabled (ADR-0002 gate)", () => {
  afterEach(() => {
    document.documentElement.classList.remove("gsap");
  });

  it("is false without the .gsap class on <html>", () => {
    expect(motionEnabled()).toBe(false);
  });

  it("is true when the inline script added .gsap to <html>", () => {
    document.documentElement.classList.add("gsap");
    expect(motionEnabled()).toBe(true);
  });

  it("is the same function the landing imports from its attributes module", () => {
    expect(landingMotionEnabled).toBe(motionEnabled);
  });
});
