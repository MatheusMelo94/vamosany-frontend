import { DRAWER_EASE, DRAWER_MOTION } from "../motion-values";

describe("drawer motion values (plan § 7.1, DDR-0006; moved from lib/motion.ts by RV-0018)", () => {
  it("adds the pop ease for the header dot (M6)", () => {
    expect(DRAWER_EASE.pop).toBe("back.out(3)");
  });

  it("adds the open unfold values (M1–M6)", () => {
    expect(DRAWER_MOTION.open).toEqual({
      veil: { duration: 0.25, ease: "power1.out" },
      icon: { rotate: -90, scale: 0.6, duration: 0.35 },
      panel: {
        /** clip-path: inset(0% 0% bottom% 0% round radius); 24px = --radius-3xl fallback */
        clip: { bottomFrom: 100, bottomTo: 0, radiusFallback: "24px" },
        y: -10,
        duration: 0.55,
      },
      rows: {
        y: 14,
        duration: 0.35,
        stagger: 0.05,
        at: 0.15,
        ease: "power2.out",
      },
      footer: { y: 24, duration: 0.4, at: 0.3 },
      dot: { duration: 0.4, at: 0.45 },
    });
  });

  it("adds the close roll-up values (M7–M8)", () => {
    expect(DRAWER_MOTION.close).toEqual({
      panel: { y: -6, duration: 0.25, ease: "power2.in" },
      veil: { duration: 0.2, at: 0.05 },
    });
  });

  it("adds the accordion values (M10–M13)", () => {
    expect(DRAWER_MOTION.accordion).toEqual({
      expand: { duration: 0.3, ease: "power2.out" },
      collapse: { duration: 0.18, ease: "power2.in" },
      rows: { y: 6, duration: 0.18, stagger: 0.03, at: 0.05, maxStart: 0.25 },
      chevron: 0.2,
    });
  });

  it("keeps the accordion's worst-case swap within 500ms (AC 44)", () => {
    const { expand, collapse, rows } = DRAWER_MOTION.accordion;
    const worst = Math.max(
      expand.duration,
      rows.at + rows.maxStart + rows.duration,
      collapse.duration,
    );
    expect(worst).toBeLessThanOrEqual(0.5);
  });
});
