import { test, expect, type Page } from "@playwright/test";

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

/** Scrolls the whole page in steps so every once-trigger fires, then waits. */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
  });
  await page.waitForTimeout(2500);
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
    await page.waitForTimeout(1500);
    const connected = await scrollTriggerTargets(page);
    expect(connected).not.toBeNull();
    expect(connected?.length).toBeGreaterThan(0);
    expect(connected?.every(Boolean)).toBe(true);
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
      if (performance.now() - t0 < 8000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
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
    await expect
      .poll(async () => (await frames(page)).at(-1)?.train, { timeout: 8000 })
      .toBe("0%");
    await page.waitForTimeout(600);
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
    for (let i = 0; i < 25; i++) {
      await expect(h1).toHaveCount(1);
      await page.waitForTimeout(100);
    }
  });

  test("the '20' counts up from 0 during the entrance; assistive tech reads only 20 (AC 21)", async ({
    page,
  }) => {
    await recordHeader(page);
    await page.goto("/sobre-mi");
    const label = page.locator("[data-sm-label]");
    for (let i = 0; i < 10; i++) {
      expect(await label.ariaSnapshot()).toMatch(/\+20 visitas|\+ 20 visitas/);
      await page.waitForTimeout(150);
    }
    await expect
      .poll(async () => (await frames(page)).at(-1)?.count)
      .toBe("20");
    // Only what's on screen: the server HTML holds the final "20" (for
    // reduced motion / no JS) while the heading is still hidden.
    const counts = (await frames(page))
      .filter((x) => x.label > 0)
      .map((x) => Number(x.count));
    expect(counts[0]).toBe(0);
    expect(counts.some((n) => n > 0 && n < 20)).toBe(true);
    const shown = counts.filter((n, i) => i === 0 || n !== counts[i - 1]);
    expect([...shown].sort((a, b) => a - b)).toEqual(shown);
  });

  test("other pages run the same entrance without a counter", async ({
    page,
  }) => {
    await recordHeader(page);
    await page.goto("/preguntas-frecuentes");
    await expect
      .poll(async () => (await frames(page)).at(-1)?.train, { timeout: 8000 })
      .toBe("0%");
    const f = await frames(page);
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
      expect(await state(page, selector, index)).toMatchObject({ opacity: 0 });
      await scrollToEl(page, selector, index);
      await expect
        .poll(() => state(page, selector, index))
        .toEqual({ opacity: 1, y: 0 });
      // Up and back down: it stays revealed, no replay.
      await toTop(page);
      await page.waitForTimeout(300);
      await scrollToEl(page, selector, index);
      for (let i = 0; i < 5; i++) {
        expect(await state(page, selector, index)).toEqual({
          opacity: 1,
          y: 0,
        });
        await page.waitForTimeout(60);
      }
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
    await page.waitForTimeout(600);
    const a = {
      box: await geometry(page, box),
      img: await geometry(page, img),
    };
    await page.evaluate(() =>
      window.scrollBy({ top: 250, behavior: "instant" }),
    );
    await page.waitForTimeout(800);
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
      .poll(clip, { timeout: 4000 })
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
      await page.waitForTimeout(900);
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
