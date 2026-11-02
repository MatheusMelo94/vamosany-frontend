import { readFileSync } from "node:fs";
import path from "node:path";
import { render } from "@testing-library/react";
import { GuidePage } from "@/features/guias/components/guide-page";
import { GuiasHomePage } from "@/features/guias/components/guias-home-page";
import { getGuide } from "@/features/guias/content/guides";

const read = (file: string) =>
  readFileSync(path.resolve(__dirname, "../../..", file), "utf8");

/**
 * Plan D-5: the Guías reuse M1 through their own headless controller and do
 * not mount `CuadernoScrollEffects`, so no other Sobre mí scene leaks into
 * their bundle (ADR-0003).
 */
describe("the Guías motion controller (plan D-5, § 9)", () => {
  const source = read("features/guias/motion/guias-scroll-effects.tsx");
  const sobreMiImports = [
    ...source.matchAll(/from "(@\/features\/sobre-mi\/[^"]+)"/g),
  ].map((m) => m[1]);

  it("imports only the three M1 scenes, their types and the attribute contract from Sobre mí", () => {
    expect(sobreMiImports.sort()).toEqual(
      [
        "@/features/sobre-mi/motion/attributes",
        "@/features/sobre-mi/motion/scenes/entrance",
        "@/features/sobre-mi/motion/scenes/focus-reveal",
        "@/features/sobre-mi/motion/scenes/nav-scrolled",
        "@/features/sobre-mi/motion/scenes/types",
      ].sort(),
    );
  });

  it("never imports the Sobre mí controller or its other scenes", () => {
    expect(source).not.toContain("cuaderno-scroll-effects");
    expect(source).not.toMatch(
      /scenes\/(reveals|sweeps|sobre-mi|faq|contacto)/,
    );
  });

  it("runs inside useGSAP behind the motion gate", () => {
    expect(source).toContain("useGSAP(");
    expect(source).toContain("motionEnabled()");
  });

  it("is loaded lazily, client-side only (next/dynamic, ssr: false)", () => {
    const wrapper = read("features/guias/motion/guias-motion.tsx");
    expect(wrapper).toContain('"use client"');
    expect(wrapper).toContain("next/dynamic");
    expect(wrapper).toContain("ssr: false");
  });
});

describe("page roots carry the motion scene", () => {
  it("marks the home root data-sm-scene='guias'", () => {
    const { container } = render(<GuiasHomePage />);
    expect(container.querySelector('[data-sm-scene="guias"]')).not.toBeNull();
  });

  it("marks the guide root data-sm-scene='guias', around the heading", () => {
    const guide = getGuide("west-village");
    if (!guide) throw new Error("missing guide");
    const { container } = render(<GuidePage guide={guide} />);
    const root = container.querySelector('[data-sm-scene="guias"]');
    expect(root).not.toBeNull();
    expect(root?.querySelector("[data-sm-heading]")).not.toBeNull();
  });
});
