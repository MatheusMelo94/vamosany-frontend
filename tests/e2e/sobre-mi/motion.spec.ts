import { test, expect, type Page } from "@playwright/test";
import {
  gsapPending,
  nextFrames,
  sampleFrames,
  waitForGsapIdle,
  waitForMotionController,
} from "../support/motion";

/**
 * Motion on the Sobre mí pages (DDR-0004; plan § 0.2–0.3; TDD § 4).
 * Default context = motion on (`.gsap`); `reducedMotion: "reduce"` and
 * `javaScriptEnabled: false` = static and fully visible (ADR-0002).
 */

const PAGES = [
  ["/sobre-mi", "sobre-mi"],
  ["/colaboraciones", "colaboraciones"],
  ["/trabaja-conmigo", "trabaja-conmigo"],
  ["/contacto", "contacto"],
  ["/preguntas-frecuentes", "faq"],
] as const;

/** Everything app/globals.css hides or parks while a scene is mounted. */
const OPACITY_TARGETS = [
  "[data-sm-heading]",
  "[data-sm-reveal]",
  "[data-sm-notes] > *",
  "[data-sm-closing] [data-sm-closing-item]",
  "[data-sm-form] [data-sm-field]",
  "[data-sm-timeline] li",
  "[data-sm-partner]",
  "[data-sm-row-body] > *",
  "[data-sm-channels] li",
  "[data-sm-faq-group] details",
  "[data-sm-audience] > li > :not([data-sm-rule])",
].map((s) => `main ${s}`);

type FinalState = {
  hidden: string[];
  transformed: string[];
  trains: string[];
  clipped: string[];
};

/** Targets not in their final, visible state. */
async function notFinal(page: Page): Promise<FinalState> {
  return page.evaluate((opacityTargets) => {
    const describe = (el: Element) =>
      `${el.tagName.toLowerCase()}${[...el.attributes]
        .filter((a) => a.name.startsWith("data-sm-"))
        .map((a) => `[${a.name}]`)
        .join("")} "${(el.textContent ?? "").trim().slice(0, 24)}"`;
    const all = (sel: string) => [...document.querySelectorAll(sel)];
    const visible = (el: Element) => el.getClientRects().length > 0;
    return {
      hidden: opacityTargets
        .flatMap(all)
        .filter(visible)
        .filter((el) => getComputedStyle(el).opacity !== "1")
        .map(describe),
      transformed: all("main [data-sm-rail], main [data-sm-rule]")
        .filter((el) => {
          const t = getComputedStyle(el).transform;
          return t !== "none" && t !== "matrix(1, 0, 0, 1, 0, 0)";
        })
        .map(describe),
      trains: all("main [data-sm-train], main [data-sm-sweep]")
        .filter(
          (el) =>
            getComputedStyle(el).getPropertyValue("--train").trim() !== "0%",
        )
        .map(describe),
      clipped: all("main [data-sm-signature]")
        .filter((el) => {
          const c = getComputedStyle(el).clipPath;
          return c !== "none" && !/^inset\(0(%|px)?( 0(%|px)?)*\)$/.test(c);
        })
        .map(describe),
    };
  }, OPACITY_TARGETS);
}

const ALL_FINAL: FinalState = {
  hidden: [],
  transformed: [],
  trains: [],
  clipped: [],
};

/**
 * Scrolls the whole page in steps so every once-trigger fires (two frames
 * per step: ScrollTrigger reads the scroll on its next tick), then waits
 * for GSAP to settle.
 */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const frame = () => new Promise((r) => requestAnimationFrame(r));
    const step = window.innerHeight / 2;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await frame();
      await frame();
    }
  });
  await waitForGsapIdle(page);
}

/**
 * The live ScrollTrigger class, from the page's webpack runtime (test-only;
 * GSAP isn't exposed on window). Only GSAP's own module factory is required.
 */
async function scrollTriggerTargets(page: Page) {
  return page.evaluate(() => {
    type Req = ((id: string) => Record<string, unknown>) & {
      m: Record<string, { toString(): string }>;
    };
    let req: Req | undefined;
    (
      window as unknown as { webpackChunk_N_E: unknown[] }
    ).webpackChunk_N_E.push([
      [Symbol("scrolltrigger-probe")],
      {},
      (r: Req) => {
        req = r;
      },
    ]);
    if (!req) return null;
    for (const id of Object.keys(req.m)) {
      const source = req.m[id]?.toString() ?? "";
      if (!source.includes("ScrollTrigger") || !source.includes("getAll"))
        continue;
      for (const value of Object.values(req(id) ?? {})) {
        const st = value as {
          getAll?: () => Array<{ trigger?: Element }>;
        };
        if (typeof st?.getAll === "function") {
          return st
            .getAll()
            .map((t) => (t.trigger ? t.trigger.isConnected : true));
        }
      }
    }
    return null;
  });
}

function gsapWarnings(page: Page): string[] {
  const messages: string[] = [];
  page.on("console", (msg) => {
    if (msg.text().includes("GSAP target")) messages.push(msg.text());
  });
  return messages;
}

test.describe("Sobre mí motion: gate and controller (T032) @feature-sobre-mi", () => {
  for (const [path, scene] of PAGES) {
    test(`${path}: the scene mounts with its controller and every target ends visible`, async ({
      page,
    }) => {
      const warnings = gsapWarnings(page);
      await page.goto(path);
      await expect(page.locator("html")).toHaveClass(/gsap/);
      await expect(page.locator(`main [data-sm-scene="${scene}"]`)).toHaveCount(
        1,
      );
      await scrollThrough(page);
      await expect
        .poll(() => notFinal(page), { timeout: 8000 })
        .toEqual(ALL_FINAL);
      expect(warnings).toEqual([]);
    });
  }

  test("the navbar gains its scrolled surface after 80px, as on the landing", async ({
    page,
  }) => {
    await page.goto("/sobre-mi");
    const nav = page.locator("[data-nav]");
    // The controller has mounted once the scene's heading is shown.
    await expect(page.locator("main [data-sm-heading]")).toHaveCSS(
      "opacity",
      "1",
    );
    await expect(nav).not.toHaveClass(/is-scrolled/);
    // Instant scrolls: html has scroll-behavior: smooth, and a smooth scroll
    // can be cut short by a ScrollTrigger refresh.
    const scrollTo = (top: number) =>
      page.evaluate(
        (y) => window.scrollTo({ top: y, behavior: "instant" }),
        top,
      );
    await scrollTo(200);
    await expect(nav).toHaveClass(/is-scrolled/);
    await scrollTo(0);
    await expect(nav).not.toHaveClass(/is-scrolled/);
  });

  test("a visitor already scrolled when the controller loads still gets the surface", async ({
    page,
  }) => {
    await page.goto("/sobre-mi", { waitUntil: "commit" });
    await page.waitForFunction(() => document.body !== null);
    await page.evaluate(() =>
      window.scrollTo({ top: 400, behavior: "instant" }),
    );
    await expect(page.locator("main [data-sm-heading]")).toHaveCSS(
      "opacity",
      "1",
    );
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(80);
    await expect(page.locator("[data-nav]")).toHaveClass(/is-scrolled/);
  });

  test("client navigation leaves no ScrollTrigger on detached nodes", async ({
    page,
  }) => {
    test.skip(
      (page.viewportSize()?.width ?? 0) < 1024,
      "uses the desktop menu",
    );
    await page.goto("/sobre-mi");
    await scrollThrough(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page
      .locator("[data-nav]")
      .getByRole("button", { name: "Sobre mí", exact: true })
      .hover();
    await page
      .locator("[data-nav]")
      .getByRole("link", { name: /^Colaboraciones / })
      .click();
    await expect(page).toHaveURL(/\/colaboraciones$/);
    await expect(
      page.locator('main [data-sm-scene="colaboraciones"]'),
    ).toHaveCount(1);
    await waitForMotionController(page);
    // The old controller reverts and the new one registers: every trigger
    // ends on a connected node (detached ones would never become connected).
    await expect
      .poll(async () => {
        const connected = await scrollTriggerTargets(page);
        return connected !== null && connected.length > 0
          ? connected.every(Boolean)
          : null;
      })
      .toBe(true);
  });

  for (const [label, options] of [
    ["reduced motion", { reducedMotion: "reduce" as const }],
    ["JavaScript disabled", { javaScriptEnabled: false }],
  ] as const) {
    test.describe(label, () => {
      test.use(options);

      for (const [path] of PAGES) {
        test(`${path}: static, visible, no reading bar (AC 16)`, async ({
          page,
        }) => {
          await page.goto(path);
          await expect(page.locator("html")).not.toHaveClass(/gsap/);
          expect(await notFinal(page)).toEqual(ALL_FINAL);
          await expect(page.locator("[data-reading-bar]")).toHaveCount(0);
          const form = page.locator("main [data-sm-form]");
          if (await form.count()) {
            const js = !("javaScriptEnabled" in options);
            await expect(form).toBeVisible({ visible: js });
            await expect(
              page
                .locator("main")
                .getByText(/^Para escribirme, mandame un mail/),
            ).toBeVisible({ visible: !js });
          }
        });
      }
    });
  }
});

/* ---- M1 heading entrance (T033) ------------------------------------- */

type Frame = {
  t: number;
  label: number;
  dek: number;
  train: string;
  /** Largest vertical offset of the split words (0 when none or landed). */
  wordsOffset: number;
  count: string;
  split: number;
};

/** Records the header's state every animation frame from the first paint. */
async function recordHeader(page: Page) {
  await page.addInitScript(() => {
    const frames: unknown[] = [];
    (window as unknown as { __frames: unknown[] }).__frames = frames;
    const t0 = performance.now();
    const tick = () => {
      const label = document.querySelector("[data-sm-label]");
      const dek = document.querySelector("[data-sm-dek]");
      const train = document.querySelector("[data-sm-train]");
      const heading = document.querySelector("[data-sm-heading]");
      if (label && dek && train && heading) {
        const visible = getComputedStyle(heading).opacity !== "0";
        const words = [...train.querySelectorAll("*")];
        frames.push({
          t: Math.round(performance.now() - t0),
          label: visible ? Number(getComputedStyle(label).opacity) : 0,
          dek: visible ? Number(getComputedStyle(dek).opacity) : 0,
          train: getComputedStyle(train).getPropertyValue("--train").trim(),
          wordsOffset: Math.max(
            0,
            ...words.map((w) => {
              const t = getComputedStyle(w).transform;
              return t === "none" ? 0 : Math.abs(new DOMMatrixReadOnly(t).m42);
            }),
          ),
          count:
            document.querySelector("[data-sm-count]")?.textContent?.trim() ??
            "",
          split: words.length,
        });
      }
      if (performance.now() - t0 < 30_000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // Every value the controller writes into the "20" (not only the ones a
    // sampled frame happens to catch).
    const writes: string[] = [];
    (window as unknown as { __countWrites: string[] }).__countWrites = writes;
    document.addEventListener("DOMContentLoaded", () => {
      const counter = document.querySelector("[data-sm-count]");
      if (!counter) return;
      new MutationObserver(() =>
        writes.push(counter.textContent?.trim() ?? ""),
      ).observe(counter, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    });
  });
}

const frames = (page: Page) =>
  page.evaluate(() => (window as unknown as { __frames: Frame[] }).__frames);

test.describe("M1 heading entrance (T033) @feature-sobre-mi", () => {
  test("label, then words, then train, then dek — the dek lands while the train still moves (AC 15)", async ({
    page,
  }) => {
    await recordHeader(page);
    await page.goto("/sobre-mi");
    await waitForMotionController(page);
    await waitForGsapIdle(page);
    const f = await frames(page);
    const first = (pred: (x: Frame) => boolean) => f.find(pred)?.t ?? Infinity;
    const labelStart = first((x) => x.label > 0);
    // The words start rising on the first frame their offset shrinks.
    const wordsStart =
      f.find((x, i) => i > 0 && x.wordsOffset < (f[i - 1]?.wordsOffset ?? 0))
        ?.t ?? Infinity;
    const trainStart = first((x) => x.train !== "100%" && x.train !== "0%");
    const dekStart = first((x) => x.dek > 0);
    const trainEnd = first((x) => x.train === "0%" && x.t > trainStart);
    // Under load, frames get sparse and neighbouring starts can share a
    // sampled frame; sharing one isn't out of order. The dek-before-the-
    // train-stops check (≈1 s apart) stays strict: it is AC 15's point.
    expect(labelStart).toBeLessThanOrEqual(wordsStart);
    expect(wordsStart).toBeLessThanOrEqual(trainStart);
    expect(trainStart).toBeLessThanOrEqual(dekStart);
    expect(dekStart).toBeLessThan(trainEnd);
    // Ends as one text run: no split wrappers, marker home, fully visible.
    const end = f.at(-1);
    expect(end).toMatchObject({ split: 0, train: "0%", label: 1, dek: 1 });
    await expect(page.locator("[data-sm-train]")).toHaveText("Sobre mí");
  });

  test("the H1's accessible name is the title at every moment (AC 14)", async ({
    page,
  }) => {
    await page.goto("/sobre-mi");
    const h1 = page.getByRole("heading", {
      level: 1,
      name: "Sobre mí",
      exact: true,
    });
    // Sampled from load until the entrance has settled.
    let samples = 0;
    do {
      expect(await h1.count()).toBe(1);
      samples++;
    } while (samples < 3 || (await gsapPending(page)) !== 0);
    expect(await h1.count()).toBe(1);
  });

  test("the '20' counts up from 0 during the entrance; assistive tech reads only 20 (AC 21)", async ({
    page,
  }) => {
    await recordHeader(page);
    await page.goto("/sobre-mi");
    const label = page.locator("[data-sm-label]");
    // Sampled from load until the entrance has settled.
    let samples = 0;
    do {
      expect(await label.ariaSnapshot()).toMatch(/\+20 visitas|\+ 20 visitas/);
      samples++;
    } while (samples < 3 || (await gsapPending(page)) !== 0);
    await expect
      .poll(async () => (await frames(page)).at(-1)?.count)
      .toBe("20");
    // Every value the controller wrote: reset to 0 (the server HTML holds
    // the final "20" for reduced motion / no JS), then up to 20, never down.
    const writes = (
      await page.evaluate(
        () => (window as unknown as { __countWrites: string[] }).__countWrites,
      )
    ).map(Number);
    expect(writes[0]).toBe(0);
    expect(writes.at(-1)).toBe(20);
    expect(writes.some((n) => n > 0 && n < 20)).toBe(true);
    expect([...writes].sort((a, b) => a - b)).toEqual(writes);
    // And the count-up happens on screen: the label's first visible frame
    // doesn't already show the final number.
    const firstVisible = (await frames(page)).find((x) => x.label > 0);
    expect(Number(firstVisible?.count)).toBeLessThan(20);
  });

  test("other pages run the same entrance without a counter", async ({
    page,
  }) => {
    await recordHeader(page);
    await page.goto("/preguntas-frecuentes");
    await waitForMotionController(page);
    await waitForGsapIdle(page);
    const f = await frames(page);
    expect(f.at(-1)?.train).toBe("0%");
    expect(f.some((x) => x.wordsOffset > 0)).toBe(true);
    expect(f.some((x) => x.label > 0 && x.label < 1)).toBe(true);
  });
});

/* ---- M2 shared reveals (T034) --------------------------------------- */

const state = (page: Page, selector: string, index = 0) =>
  page
    .locator(selector)
    .nth(index)
    .evaluate((el) => {
      const t = getComputedStyle(el).transform;
      return {
        opacity: Number(getComputedStyle(el).opacity),
        y: t === "none" ? 0 : Math.round(new DOMMatrixReadOnly(t).m42),
      };
    });

/** Scrolls an element to mid-viewport instantly (html is smooth by default). */
const scrollToEl = (page: Page, selector: string, index = 0) =>
  page
    .locator(selector)
    .nth(index)
    .evaluate((el) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: top - window.innerHeight / 2,
        behavior: "instant",
      });
    });

const toTop = (page: Page) =>
  page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));

test.describe("M2 shared reveals (T034) @feature-sobre-mi", () => {
  for (const [path, selector, index] of [
    ["/sobre-mi", "main [data-sm-reveal]", 8],
    ["/sobre-mi", "main figure[data-sm-reveal]", 0],
    ["/sobre-mi", "main [data-sm-closing] [data-sm-closing-item]", 0],
    ["/trabaja-conmigo", "main [data-sm-notes] > *", 5],
    ["/trabaja-conmigo", "main [data-sm-form] [data-sm-field]", 0],
  ] as const) {
    test(`${path} ${selector} #${index}: hidden below the fold, revealed once when reached (AC 17)`, async ({
      page,
    }) => {
      await page.goto(path);
      // The controller has mounted once it has shown the heading block.
      await expect(page.locator("main [data-sm-heading]")).toHaveCSS(
        "opacity",
        "1",
      );
      // Whether the target starts below the reveal line depends on font
      // metrics (CI renders real Arial, shorter than the fallback), so the
      // premise is measured, not assumed. Reveal start is "top 88%".
      const startRatio = await page
        .locator(selector)
        .nth(index)
        .evaluate((el) => el.getBoundingClientRect().top / window.innerHeight);
      test.skip(
        startRatio < 0.95,
        `target starts at ${Math.round(startRatio * 100)}% of the viewport, not below the fold at this size`,
      );
      expect(await state(page, selector, index)).toMatchObject({ opacity: 0 });
      await scrollToEl(page, selector, index);
      await expect
        .poll(() => state(page, selector, index))
        .toEqual({ opacity: 1, y: 0 });
      // Up and back down: it stays revealed, no replay (every frame).
      await toTop(page);
      await waitForGsapIdle(page);
      const sampler = await sampleFrames(
        page,
        ([sel, i]) => {
          const el = document.querySelectorAll(sel)[i] as Element;
          const t = getComputedStyle(el).transform;
          return {
            opacity: Number(getComputedStyle(el).opacity),
            y: t === "none" ? 0 : Math.round(new DOMMatrixReadOnly(t).m42),
          };
        },
        [selector, index] as const,
      );
      await scrollToEl(page, selector, index);
      await nextFrames(page, 6);
      await waitForGsapIdle(page);
      const seen = await sampler.stop();
      expect(seen.length).toBeGreaterThan(6);
      expect(new Set(seen.map((x) => JSON.stringify(x)))).toEqual(
        new Set([JSON.stringify({ opacity: 1, y: 0 })]),
      );
    });
  }

  test("pull lines and the signature are not prose reveals", async ({
    page,
  }) => {
    await page.goto("/sobre-mi");
    await expect(
      page.locator("main [data-sm-sweep]").first(),
    ).not.toHaveAttribute("data-sm-reveal");
    const pull = page.locator("main p:has(> [data-sm-sweep])").first();
    await expect(pull).not.toHaveAttribute("data-sm-reveal");
    await expect(page.locator("main [data-sm-signature]")).not.toHaveAttribute(
      "data-sm-reveal",
    );
  });

  test("the no-JS block is never animated, and the button row is a form reveal target", async ({
    page,
  }) => {
    await page.goto("/contacto");
    const fields = page.locator("main [data-sm-form] [data-sm-field]");
    await expect(fields).toHaveCount(6);
    await expect(fields.last().getByRole("button")).toHaveText(
      "Enviar mensaje",
    );
    await expect(
      page.locator("main [data-sm-field]:not([data-sm-form] [data-sm-field])"),
    ).toHaveCount(0);
  });
});

test.describe("M2 reveals keep content reachable (T034) @feature-sobre-mi", () => {
  test("Tab reaches the not-yet-revealed form fields, which reveal on focus", async ({
    page,
  }) => {
    await page.goto("/trabaja-conmigo");
    await expect(page.locator("main [data-sm-heading]")).toHaveCSS(
      "opacity",
      "1",
    );
    const name = page.locator("#collab-name");
    const wrapper = page.locator("main [data-sm-form] [data-sm-field]").first();
    await expect(wrapper).toHaveCSS("opacity", "0");
    await expect(wrapper).toHaveCSS("visibility", "visible");
    await name.focus();
    await expect(name).toBeFocused();
    await expect(wrapper).toHaveCSS("opacity", "1");
  });
});

test.describe("Focus never sits on an invisible reveal (ADR-0008 cond. 2) @feature-sobre-mi", () => {
  for (const path of ["/trabaja-conmigo", "/contacto"]) {
    test(`${path}: tabbing from the top to the last field finds every stop fully opaque at once`, async ({
      page,
    }) => {
      await page.goto(path);
      await waitForMotionController(page);
      const lastId = await page
        .locator("main [data-sm-form] form")
        .locator("input, textarea, select")
        .last()
        .getAttribute("id");
      expect(lastId).toBeTruthy();
      expect(await page.evaluate(() => window.scrollY)).toBe(0);

      const failures: string[] = [];
      for (let i = 0; i < 120; i++) {
        await page.keyboard.press("Tab");
        // Read in the same task as the focus lands: no waiting for a reveal.
        const stop = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || !el.closest("main")) return null;
          let effective = 1;
          for (let n: Element | null = el; n; n = n.parentElement) {
            effective *= Number(getComputedStyle(n).opacity);
          }
          const wrapper = el.closest("[data-sm-field]");
          return {
            name: `${el.tagName.toLowerCase()}#${el.id}`,
            id: el.id,
            effective,
            wrapper: wrapper ? getComputedStyle(wrapper).opacity : "1",
          };
        });
        if (!stop) continue;
        if (stop.effective !== 1 || stop.wrapper !== "1") {
          failures.push(
            `${stop.name}: effective ${stop.effective}, wrapper ${stop.wrapper}`,
          );
        }
        if (stop.id === lastId) break;
      }
      await expect(page.locator(`#${lastId}`)).toBeFocused();
      expect(failures).toEqual([]);
    });
  }
});

/* ---- M3 Sobre mí scenes (T035) -------------------------------------- */

const trainOf = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => getComputedStyle(el).getPropertyValue("--train").trim());

const scrollToY = (page: Page, y: number) =>
  page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);

/** Document-relative top of an element, and its scale/translate. */
const geometry = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      const t = getComputedStyle(el).transform;
      return {
        top: Math.round(r.top + window.scrollY),
        transform: t,
      };
    });

test.describe("M3 Sobre mí scenes (T035) @feature-sobre-mi", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sobre-mi");
    await expect(page.locator("main [data-sm-heading]")).toHaveCSS(
      "opacity",
      "1",
    );
  });

  test("the pull line's train pulls in when it enters view (AC 22)", async ({
    page,
  }) => {
    const sweep = "main [data-sm-sweep]";
    await scrollToY(page, 0);
    const before = await trainOf(page, sweep);
    await scrollToEl(page, sweep);
    await expect.poll(() => trainOf(page, sweep)).toBe("0%");
    // It was parked (or already travelling) before it was reached.
    expect(before).not.toBe("0%");
  });

  test("the photo drifts inside a box that never moves (AC 23)", async ({
    page,
  }) => {
    const box = "main [data-sm-parallax]";
    const img = "main [data-sm-parallax] img";
    await scrollToEl(page, box);
    await waitForGsapIdle(page);
    const a = {
      box: await geometry(page, box),
      img: await geometry(page, img),
    };
    await page.evaluate(() =>
      window.scrollBy({ top: 250, behavior: "instant" }),
    );
    await waitForGsapIdle(page);
    const b = {
      box: await geometry(page, box),
      img: await geometry(page, img),
    };
    expect(b.box.top).toBe(a.box.top);
    expect(a.img.transform).not.toBe("none");
    expect(b.img.transform).not.toBe(a.img.transform);
  });

  test("the signature is written in, left to right, when reached (AC 24)", async ({
    page,
  }) => {
    const sig = "main [data-sm-signature]";
    const clip = () =>
      page.locator(sig).evaluate((el) => getComputedStyle(el).clipPath);
    expect(await clip()).toMatch(/inset\(0(%|px)? 100%/);
    await scrollToEl(page, sig);
    await expect
      .poll(clip, { timeout: 15_000 })
      .toMatch(/^(none|inset\(0(%|px)?( 0(%|px)?)*\))$/);
  });

  test("the timeline rail fills with scroll and the rows slide in (AC 25)", async ({
    page,
  }) => {
    const list = page.locator("main [data-sm-timeline]");
    const scaleY = () =>
      page.locator("main [data-sm-rail]").evaluate((el) => {
        const t = getComputedStyle(el).transform;
        return t === "none" ? 1 : new DOMMatrixReadOnly(t).d;
      });
    const top = await list.evaluate(
      (el) => el.getBoundingClientRect().top + window.scrollY,
    );
    const height = await list.evaluate(
      (el) => el.getBoundingClientRect().height,
    );
    const vh = page.viewportSize()?.height ?? 800;
    const samples: number[] = [];
    // From "list top at 80%" to "list bottom at 55%" of the viewport.
    const start = top - vh * 0.8;
    const end = top + height - vh * 0.55;
    for (const f of [0.15, 0.5, 0.85]) {
      await scrollToY(page, Math.round(start + (end - start) * f));
      await waitForGsapIdle(page);
      samples.push(await scaleY());
    }
    expect(samples[0]).toBeGreaterThan(0);
    expect(samples[0]).toBeLessThan(samples[1] ?? 0);
    expect(samples[1]).toBeLessThan(samples[2] ?? 0);
    await scrollToY(page, Math.round(end + 200));
    await expect.poll(scaleY).toBeCloseTo(1, 2);
    const rows = page.locator("main [data-sm-timeline] li");
    await expect
      .poll(() =>
        rows.evaluateAll((els) =>
          els.every((el) => {
            const t = getComputedStyle(el).transform;
            const x = t === "none" ? 0 : new DOMMatrixReadOnly(t).m41;
            return getComputedStyle(el).opacity === "1" && x === 0;
          }),
        ),
      )
      .toBe(true);
  });

  test("no animation shifts the layout, from load through a full scroll (AC 19)", async ({
    page,
  }) => {
    await page.evaluate(() => {
      const w = window as unknown as { __shifts: string[] };
      w.__shifts = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as Array<{
          value: number;
          sources?: Array<{ node?: Node }>;
        }>) {
          for (const source of entry.sources ?? []) {
            const el =
              source.node instanceof Element
                ? source.node
                : source.node?.parentElement;
            if (el?.closest("main"))
              w.__shifts.push(`${el.tagName}:${entry.value}`);
          }
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await scrollThrough(page);
    const shifts = await page.evaluate(
      () => (window as unknown as { __shifts: string[] }).__shifts,
    );
    expect(shifts).toEqual([]);
  });

  test("at 360 the timeline tag sits under its line", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) !== 360, "phone layout");
    const row = page.locator("main [data-sm-timeline] li").first();
    const line = await row.locator("span").nth(1).boundingBox();
    const tag = await row.locator("span").nth(2).boundingBox();
    expect(tag!.y).toBeGreaterThanOrEqual(line!.y + line!.height - 1);
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("rail full, rows in place, photo still (AC 23, 25)", async ({
      page,
    }) => {
      await scrollThrough(page);
      await expect(page.locator("main [data-sm-parallax] img")).toHaveCSS(
        "transform",
        "none",
      );
      expect(await notFinal(page)).toEqual(ALL_FINAL);
    });
  });
});

/* ---- M4 Colaboraciones (T036) --------------------------------------- */

const yearAt = (page: Page, row: number) =>
  page
    .locator("main [data-sm-year]")
    .nth(row)
    .evaluate((el) => ({
      text: el.textContent,
      opacity: Number(getComputedStyle(el).opacity),
    }));

const barScale = (page: Page) =>
  page.locator("[data-nav] [data-reading-bar]").evaluate((el) => {
    const t = getComputedStyle(el).transform;
    return t === "none" ? 1 : new DOMMatrixReadOnly(t).a;
  });

test.describe("M4 Colaboraciones (T036) @feature-sobre-mi", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/colaboraciones");
    await expect(page.locator("main [data-sm-heading]")).toHaveCSS(
      "opacity",
      "1",
    );
  });

  test("each 4-digit year ticks up from the previous row's; '2024–25' fades in (AC 29)", async ({
    page,
  }) => {
    const years = page.locator("main [data-sm-year]");
    // Row 5 (2024) is below the fold at every viewport: until reached it
    // shows the previous row's year, then ticks to its own. (Row 1 may
    // already be past its trigger on load at 1280 and tick at once.)
    expect((await yearAt(page, 4)).text).toBe("2023");
    // 2023 → 2023: no tick, the year never changes.
    expect((await yearAt(page, 2)).text).toBe("2023");
    expect((await yearAt(page, 5)).opacity).toBe(0);
    // Every value the tick writes, not only the frames a sample catches.
    await page.evaluate(() => {
      const year = document.querySelectorAll("main [data-sm-year]")[4]!;
      const writes: string[] = [];
      (window as unknown as { __yearWrites: string[] }).__yearWrites = writes;
      new MutationObserver(() =>
        writes.push(year.textContent?.trim() ?? ""),
      ).observe(year, { childList: true, characterData: true, subtree: true });
    });
    await scrollToEl(page, "main [data-sm-year]", 4);
    await expect.poll(async () => (await yearAt(page, 4)).text).toBe("2024");
    await waitForGsapIdle(page);
    // From the previous row's 2023 up to 2024: nothing outside, never down.
    const writes = (
      await page.evaluate(
        () => (window as unknown as { __yearWrites: string[] }).__yearWrites,
      )
    ).map(Number);
    expect(writes.at(-1)).toBe(2024);
    expect(writes.every((n) => n >= 2023 && n <= 2024)).toBe(true);
    expect([...writes].sort((a, b) => a - b)).toEqual(writes);
    await scrollToEl(page, "main [data-sm-year]", 5);
    await expect.poll(async () => (await yearAt(page, 5)).opacity).toBe(1);
    await scrollThrough(page);
    expect(await years.allTextContents()).toEqual([
      "2022",
      "2023",
      "2023",
      "2023",
      "2024",
      "2024–25",
      "2026",
    ]);
  });

  test("assistive tech reads only the final year, even mid-tick (AC 29)", async ({
    page,
  }) => {
    const row = page.locator("main ol > li").first();
    // Sampled from before the row is reached until its tick has settled.
    let samples = 0;
    do {
      const snapshot = await row.ariaSnapshot();
      expect(snapshot).toContain("2022");
      expect(snapshot).not.toContain("2021");
      if (samples === 0) await scrollToEl(page, "main ol > li");
      samples++;
    } while (samples < 3 || (await gsapPending(page)) !== 0);
  });

  test("the reading bar lives in the navbar capsule and fills through the ledger (AC 30)", async ({
    page,
  }) => {
    const bar = page.locator("[data-nav] .nav-capsule [data-reading-bar]");
    await expect(bar).toHaveCount(1);
    await expect(
      page.locator(
        "[data-nav] .nav-capsule > [aria-hidden='true']:has([data-reading-bar])",
      ),
    ).toHaveCount(1);
    await expect(bar).toHaveCSS("height", "3px");
    const ledger = page.locator("main ol");
    const box = await ledger.evaluate((el) => ({
      top: el.getBoundingClientRect().top + window.scrollY,
      height: el.getBoundingClientRect().height,
    }));
    const vh = page.viewportSize()?.height ?? 800;
    // Scrubbed from "ledger top at 70%" to "ledger bottom at 60%".
    const from = box.top - vh * 0.7;
    const to = box.top + box.height - vh * 0.6;
    const expected = (y: number) =>
      Math.min(1, Math.max(0, (y - from) / (to - from)));
    for (const y of [0, Math.round((from + to) / 2), Math.round(to + 200)]) {
      await scrollToY(page, Math.max(0, y));
      await waitForGsapIdle(page);
      const actual = await barScale(page);
      expect(Math.abs(actual - expected(Math.max(0, y)))).toBeLessThan(0.05);
    }
    // Empty before the ledger, where that point is reachable at this width.
    if (from > 0) {
      await scrollToY(page, 0);
      await waitForGsapIdle(page);
      expect(await barScale(page)).toBe(0);
    }
    await scrollToY(page, Math.round(to + 200));
    await expect.poll(() => barScale(page)).toBeCloseTo(1, 2);
  });

  test("the reading bar is removed when leaving the page, and never on other pages", async ({
    page,
  }) => {
    await expect(page.locator("[data-reading-bar]")).toHaveCount(1);
    await page
      .locator("main [data-sm-closing]")
      .getByRole("link", { name: "Trabajá conmigo" })
      .click();
    await expect(page).toHaveURL(/\/trabaja-conmigo$/);
    await expect(
      page.locator("main [data-sm-scene='trabaja-conmigo']"),
    ).toHaveCount(1);
    await expect(page.locator("[data-reading-bar]")).toHaveCount(0);
    await page.goto("/sobre-mi");
    await expect(page.locator("main [data-sm-heading]")).toHaveCSS(
      "opacity",
      "1",
    );
    await expect(page.locator("[data-reading-bar]")).toHaveCount(0);
  });

  test("the Efe Hus quote's train sweeps in (AC 27)", async ({ page }) => {
    const quote = "main p[lang='en'] [data-sm-sweep]";
    expect(await trainOf(page, quote)).not.toBe("0%");
    await scrollToEl(page, quote);
    await expect.poll(() => trainOf(page, quote)).toBe("0%");
  });
});

/* ---- M5 audience rules, M6 contact channels (T037) ------------------ */

test.describe("M5 audience rules and M6 channels (T037) @feature-sobre-mi", () => {
  test("each audience rule draws first, then its H2 and text rise, when reached (AC 32)", async ({
    page,
  }) => {
    await page.goto("/trabaja-conmigo");
    await expect(page.locator("main [data-sm-heading]")).toHaveCSS(
      "opacity",
      "1",
    );
    const row = page.locator("main [data-sm-audience] > li").nth(4);
    const read = () =>
      row.evaluate((li) => {
        const rule = li.querySelector("[data-sm-rule]") as Element;
        const t = getComputedStyle(rule).transform;
        const text = [...li.children].filter((c) => c !== rule);
        return {
          rule: t === "none" ? 1 : new DOMMatrixReadOnly(t).a,
          text: text.map((c) => Number(getComputedStyle(c).opacity)),
        };
      });
    expect(await read()).toEqual({ rule: 0, text: [0, 0] });
    const sampler = await sampleFrames(
      page,
      (index) => {
        const li = document.querySelectorAll("main [data-sm-audience] > li")[
          index
        ] as Element;
        const rule = li.querySelector("[data-sm-rule]") as Element;
        const t = getComputedStyle(rule).transform;
        const text = [...li.children].filter((c) => c !== rule);
        return {
          rule: t === "none" ? 1 : new DOMMatrixReadOnly(t).a,
          text: text.map((c) => Number(getComputedStyle(c).opacity)),
        };
      },
      4,
    );
    await row.evaluate((el) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: top - window.innerHeight / 2,
        behavior: "instant",
      });
    });
    await expect.poll(read, { timeout: 15_000 }).toEqual({
      rule: 1,
      text: [1, 1],
    });
    const samples = await sampler.stop();
    // The rule is drawing while the text hasn't started.
    expect(
      samples.some((x) => x.rule > 0 && x.rule < 1 && x.text[0] === 0),
    ).toBe(true);
    await expect.poll(read).toEqual({ rule: 1, text: [1, 1] });
  });

  test("the contact channels slide in after the title, without scrolling (AC 35)", async ({
    page,
  }) => {
    await page.goto("/contacto");
    const sampler = await sampleFrames(
      page,
      () =>
        [...document.querySelectorAll("main [data-sm-channels] li")].some(
          (el) => {
            const t = getComputedStyle(el).transform;
            const x = t === "none" ? 0 : new DOMMatrixReadOnly(t).m41;
            return x < 0 && Number(getComputedStyle(el).opacity) > 0;
          },
        ),
      null,
    );
    const items = page.locator("main [data-sm-channels] li");
    const read = () =>
      items.evaluateAll((els) =>
        els.map((el) => {
          const t = getComputedStyle(el).transform;
          return {
            opacity: Number(getComputedStyle(el).opacity),
            x: t === "none" ? 0 : Math.round(new DOMMatrixReadOnly(t).m41),
          };
        }),
      );
    await expect(page.locator("main [data-sm-heading]")).toHaveCSS(
      "opacity",
      "1",
    );
    const early = await read();
    expect(early.every((x) => x.opacity < 1)).toBe(true);
    await expect.poll(read, { timeout: 15_000 }).toEqual([
      { opacity: 1, x: 0 },
      { opacity: 1, x: 0 },
      { opacity: 1, x: 0 },
    ]);
    // Seen mid-slide on some frame: moved left and partly visible.
    expect((await sampler.stop()).some(Boolean)).toBe(true);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
});
