import { EASE, MOTION } from "@/lib/motion";

/** Keys added for the Sobre mí pages (plan § 8.4); everything else is frozen by ADR-0006. */
const NEW_KEYS = [
  "page",
  "menuMarker",
  "sobreMi",
  "colaboraciones",
  "trabajaConmigo",
  "contacto",
  "faq",
  "form",
  /* Mobile drawer "Índice" (mobile-navigation plan § 7.1, DDR-0006) */
  "drawer",
] as const;

/** EASE keys added after the freeze; every other key is pinned below. */
const NEW_EASE_KEYS = ["pop"] as const;

function without(
  record: Record<string, unknown>,
  keys: readonly string[],
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => !keys.includes(key)),
  );
}

const withoutNewKeys = (motion: Record<string, unknown>) =>
  without(motion, NEW_KEYS);

describe("lib/motion.ts existing values (frozen by ADR-0006)", () => {
  it("keeps every EASE key and value", () => {
    expect(without(EASE, NEW_EASE_KEYS)).toMatchInlineSnapshot(`
      {
        "arrive": "M0,0 C0.06,0.42 0.14,0.82 0.4,0.965 0.55,1.02 0.66,1.022 0.76,1.006 0.86,0.995 0.93,1 1,1",
        "ds": "0.2, 0.8, 0.2, 1",
      }
    `);
  });

  it("keeps every existing MOTION key and value", () => {
    expect(withoutNewKeys(MOTION)).toMatchInlineSnapshot(`
      {
        "count": {
          "duration": 1.2,
        },
        "heading": {
          "actions": {
            "duration": 0.4,
            "offset": "-=0.3",
            "stagger": 0.08,
            "y": 12,
          },
          "eyebrow": {
            "duration": 0.35,
            "y": 8,
          },
          "lede": {
            "duration": 0.45,
            "offset": "-=0.42",
            "y": 12,
          },
          "lines": {
            "duration": 0.7,
            "offset": "-=0.15",
            "stagger": 0.08,
            "yPercent": 115,
          },
          "sweep": {
            "duration": 1,
            "offset": "-=0.3",
            "stagger": 0.14,
          },
        },
        "hero": {
          "actions": {
            "duration": 0.45,
            "offset": "-=0.34",
            "stagger": 0.08,
            "y": 14,
          },
          "lines": {
            "duration": 0.8,
            "stagger": 0.09,
            "yPercent": 115,
          },
          "quote": {
            "duration": 0.5,
            "offset": "-=0.4",
            "y": 12,
          },
          "sweep": {
            "duration": 1.15,
            "offset": "-=0.25",
            "stagger": 0.16,
          },
        },
        "marquee": {
          "boostDivisor": 600,
          "boostIn": 0.18,
          "boostMax": 4,
          "boostOut": 0.6,
          "duration": 44,
        },
        "nav": {
          "start": "top -80",
        },
        "overscroll": {
          "exit": {
            "duration": 0.4,
            "scale": 0.96,
          },
          "hold": 0.6,
          "maxHeightRatio": 1.25,
          "minHeightRatio": 0.85,
        },
        "panBand": {
          "scrub": 0.4,
          "xPercent": -22,
        },
        "reveal": {
          "duration": 0.45,
          "y": 18,
        },
        "revealGroup": {
          "duration": 0.4,
          "stagger": 0.06,
          "y": 22,
        },
        "ring": {
          "cullFade": 0.26,
          "hover": {
            "duration": 0.6,
            "timeScale": 0.25,
          },
          "nudge": {
            "divisor": 2000,
            "duration": 0.3,
            "max": 3,
            "min": 0.5,
            "settleDelayMs": 150,
            "settleDuration": 0.8,
          },
          "speed": 36,
        },
        "sweep": {
          "delay": 0.12,
          "duration": 1,
        },
        "trigger": {
          "count": "top 88%",
          "group": "top 85%",
          "heading": "top 85%",
          "reveal": "top 88%",
          "sweep": "top 85%",
        },
      }
    `);
  });
});

describe("lib/motion.ts Sobre mí additions (plan § 8.4, DDR-0003, DDR-0004)", () => {
  it("adds the page template values", () => {
    expect(MOTION).toHaveProperty("page", {
      dekOffset: "-=0.85",
      count: { at: 0.1, ease: "power2.out" },
      notes: { y: 12, duration: 0.4, stagger: 0.06 },
      closing: { y: 14, duration: 0.4, stagger: 0.08 },
      formFields: { y: 16, duration: 0.4, stagger: 0.07 },
    });
  });

  it("adds the navbar marker values", () => {
    expect(MOTION).toHaveProperty("menuMarker", {
      pill: 0.55,
      dot: 0.75,
      stretchMax: 2.6,
      stretchDivisor: 160,
      squash: 0.8,
      stretchEase: "power1.inOut",
      dotOffset: { right: 24, top: 15 },
    });
  });

  it("adds the Sobre mí scene values", () => {
    expect(MOTION).toHaveProperty("sobreMi", {
      parallax: { scaleFrom: 1.18, scaleTo: 1.04, yPercent: 6, scrub: 0.4 },
      signature: { duration: 1.2, start: "top 92%", ease: "power2.inOut" },
      rail: { start: "top 80%", end: "bottom 55%", scrub: 0.4 },
      timelineRows: { x: -14, duration: 0.4, stagger: 0.1 },
    });
  });

  it("adds the Colaboraciones scene values", () => {
    expect(MOTION).toHaveProperty("colaboraciones", {
      readingBar: { start: "top 70%", end: "bottom 60%", scrub: 0.3 },
      yearTick: { duration: 0.6, start: "top 82%", firstFrom: 2021 },
      yearFade: { duration: 0.3 },
      partner: { x: -10, duration: 0.4, at: 0.1 },
      body: { y: 18, duration: 0.45, stagger: 0.06, at: 0.05 },
    });
  });

  it("adds the Trabajá conmigo and Contacto scene values", () => {
    expect(MOTION).toHaveProperty("trabajaConmigo", {
      rule: { duration: 0.6, start: "top 90%" },
      text: { y: 14, duration: 0.4, stagger: 0.08, offset: "-=0.35" },
    });
    expect(MOTION).toHaveProperty("contacto", {
      channels: { x: -14, duration: 0.4, stagger: 0.09, delay: 0.9 },
    });
  });

  it("adds the FAQ and form feedback values", () => {
    expect(MOTION).toHaveProperty("faq", {
      rows: { y: 12, duration: 0.35, stagger: 0.05 },
      open: { duration: 0.4, content: { y: 8, duration: 0.35, delay: 0.08 } },
      close: { duration: 0.3, ease: "power2.inOut" },
    });
    expect(MOTION).toHaveProperty("form", {
      shake: { x: [0, -7, 7, -4, 4, 0], duration: 0.4 },
      banner: { y: -8, duration: 0.35 },
      success: {
        sweepDelay: 0.1,
        lines: { y: 12, duration: 0.4, stagger: 0.08, delay: 0.25 },
      },
    });
  });
});

describe("lib/motion.ts mobile drawer additions (plan § 7.1, DDR-0006)", () => {
  it("adds the pop ease for the header dot (M6)", () => {
    expect(EASE.pop).toBe("back.out(3)");
  });

  it("adds the open unfold values (M1–M6)", () => {
    expect(MOTION.drawer.open).toEqual({
      veil: { duration: 0.25, ease: "power1.out" },
      icon: { rotate: -90, scale: 0.6, duration: 0.35 },
      panel: {
        clipFrom: "inset(0% 0% 100% 0% round 24px)",
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
    expect(MOTION.drawer.close).toEqual({
      panel: { y: -6, duration: 0.25, ease: "power2.in" },
      veil: { duration: 0.2, at: 0.05 },
    });
  });

  it("adds the accordion values (M10–M13)", () => {
    expect(MOTION.drawer.accordion).toEqual({
      expand: { duration: 0.3, ease: "power2.out" },
      collapse: { duration: 0.18, ease: "power2.in" },
      rows: { y: 6, duration: 0.18, stagger: 0.03, at: 0.05, maxStart: 0.25 },
      chevron: 0.2,
    });
  });

  it("keeps the accordion's worst-case swap within 500ms (AC 44)", () => {
    const { expand, collapse, rows } = MOTION.drawer.accordion;
    const worst = Math.max(
      expand.duration,
      rows.at + rows.maxStart + rows.duration,
      collapse.duration,
    );
    expect(worst).toBeLessThanOrEqual(0.5);
  });
});
