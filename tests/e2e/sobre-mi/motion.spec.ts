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
