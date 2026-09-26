import { test, expect, type Page } from "@playwright/test";

test.describe("FAQ @feature-sobre-mi", () => {
  test("loads with all 14 questions closed (AC 47)", async ({ page }) => {
    await page.goto("/preguntas-frecuentes");
    const details = page.locator("main details");
    await expect(details).toHaveCount(14);
    expect(
      await details.evaluateAll(
        (els) => els.filter((el) => (el as HTMLDetailsElement).open).length,
      ),
    ).toBe(0);
  });

  test("anchors scroll clear of the sticky navbar", async ({ page }) => {
    await page.goto("/preguntas-frecuentes");
    const margin = await page
      .locator("#viajes-grupales")
      .evaluate((el) => parseFloat(getComputedStyle(el).scrollMarginTop));
    const navBottom = await page
      .locator("header[data-nav]")
      .evaluate((el) => el.getBoundingClientRect().bottom);
    expect(margin).toBeGreaterThan(navBottom);
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("a question opens and closes on click (AC 49)", async ({ page }) => {
      await page.goto("/preguntas-frecuentes");
      const item = page.locator("#que-es-un-itinerario-personalizado");
      const answer = item.getByText(/^Es un plan de viaje armado/);
      await expect(answer).toBeHidden();
      await item.locator("summary").click();
      await expect(item).toHaveJSProperty("open", true);
      await expect(answer).toBeVisible();
      await item.locator("summary").click();
      await expect(item).toHaveJSProperty("open", false);
      await expect(answer).toBeHidden();
    });
  });

  test.describe("deep links (AC 48)", () => {
    const navBottom = (page: Page) =>
      page
        .locator("header[data-nav]")
        .evaluate((el) => el.getBoundingClientRect().bottom);
    const top = (page: Page, selector: string) =>
      page.locator(selector).evaluate((el) => el.getBoundingClientRect().top);

    test("a question hash opens that question below the navbar", async ({
      page,
    }) => {
      await page.goto(
        "/preguntas-frecuentes#que-es-un-itinerario-personalizado",
      );
      const item = page.locator("#que-es-un-itinerario-personalizado");
      await expect(item).toHaveJSProperty("open", true);
      await expect(page.locator("main details[open]")).toHaveCount(1);
      await expect
        .poll(
          async () =>
            (await top(page, "#que-es-un-itinerario-personalizado")) >=
            (await navBottom(page)),
        )
        .toBe(true);
    });

    test("a group hash scrolls the group below the navbar, nothing opens", async ({
      page,
    }) => {
      await page.goto("/preguntas-frecuentes#viajes-grupales");
      await expect
        .poll(async () => {
          const t = await top(page, "#viajes-grupales");
          return t >= (await navBottom(page)) && t < 400;
        })
        .toBe(true);
      await expect(page.locator("main details[open]")).toHaveCount(0);
    });

    test("an unknown hash leaves everything closed at the top", async ({
      page,
    }) => {
      await page.goto("/preguntas-frecuentes#no-existe");
      await page.waitForLoadState("networkidle");
      await expect(page.locator("main details[open]")).toHaveCount(0);
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });

    test("'Viajes grupales' on /sobre-mi lands on that group (AC 26)", async ({
      page,
    }) => {
      await page.goto("/sobre-mi");
      await page
        .locator("[data-sm-closing]")
        .getByRole("link", { name: "Viajes grupales" })
        .click();
      await expect(page).toHaveURL(/\/preguntas-frecuentes#viajes-grupales$/);
      await expect
        .poll(async () => {
          const t = await top(page, "#viajes-grupales");
          return t >= (await navBottom(page)) && t < 400;
        })
        .toBe(true);
    });
  });
});

/* ---- M7 FAQ motion (T038; ADR-0007) --------------------------------- */

type AnswerState = {
  open: boolean;
  height: number;
  inline: string;
  glyph: number;
  content: number;
};

/** One question's disclosure state: open, answer height, glyph angle, content opacity. */
const answer = (page: Page, id: string) =>
  page.locator(`#${id}`).evaluate((d): AnswerState => {
    const wrap = d.querySelector("[data-sm-faq-answer]") as HTMLElement;
    const glyph = d.querySelector(
      "summary [aria-hidden='true']",
    ) as HTMLElement;
    // Tailwind 4's rotate-45 sets the individual `rotate` property.
    const r = getComputedStyle(glyph).rotate;
    const first = wrap.firstElementChild as HTMLElement | null;
    return {
      open: (d as HTMLDetailsElement).open,
      height: Math.round(wrap.getBoundingClientRect().height),
      inline: wrap.style.height,
      glyph: r === "none" ? 0 : Math.round(parseFloat(r)),
      content: first ? Number(getComputedStyle(first).opacity) : 0,
    };
  });

async function sampleAnswer(page: Page, id: string, ms: number) {
  const out: AnswerState[] = [];
  const end = Date.now() + ms;
  while (Date.now() < end) {
    out.push(await answer(page, id));
    await page.waitForTimeout(20);
  }
  return out;
}

const Q1 = "que-es-un-itinerario-personalizado";
const Q2 = "que-es-la-consultoria-de-viaje";

test.describe("FAQ motion (T038) @feature-sobre-mi", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/preguntas-frecuentes");
    await expect(page.locator("main [data-sm-heading]")).toHaveCSS(
      "opacity",
      "1",
    );
  });

  test("question rows rise group by group when reached (AC 47)", async ({
    page,
  }) => {
    const last = page
      .locator("main [data-sm-faq-group]")
      .last()
      .locator("details");
    await expect(last).toHaveCSS("opacity", "0");
    await last.evaluate((el) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: top - window.innerHeight / 2,
        behavior: "instant",
      });
    });
    await expect(last).toHaveCSS("opacity", "1");
  });

  test("a click slides the answer open, fades it up and turns + into × (AC 47)", async ({
    page,
  }) => {
    const summary = page.locator(`#${Q1} summary`);
    await summary.scrollIntoViewIfNeeded();
    await expect(page.locator(`#${Q1}`)).toHaveCSS("opacity", "1");
    await summary.click();
    const frames = await sampleAnswer(page, Q1, 700);
    const final = await answer(page, Q1);
    expect(final.open).toBe(true);
    expect(final.inline).toBe(""); // clearProps: no height left behind
    expect(final.height).toBeGreaterThan(20);
    expect(final.glyph).toBe(45);
    expect(final.content).toBe(1);
    // Mid-way: taller than 0, shorter than the final answer, content fading.
    expect(frames.some((f) => f.height > 0 && f.height < final.height)).toBe(
      true,
    );
    expect(frames.some((f) => f.content > 0 && f.content < 1)).toBe(true);
    await expect(summary).toBeFocused();
  });

  test("several can be open; closing slides to 0, then the disclosure closes (AC 47)", async ({
    page,
  }) => {
    for (const id of [Q1, Q2]) {
      await page.locator(`#${id} summary`).scrollIntoViewIfNeeded();
      await expect(page.locator(`#${id}`)).toHaveCSS("opacity", "1");
      await page.locator(`#${id} summary`).click();
    }
    await expect.poll(async () => (await answer(page, Q1)).inline).toBe("");
    await expect.poll(async () => (await answer(page, Q2)).inline).toBe("");
    expect((await answer(page, Q1)).open).toBe(true);
    expect((await answer(page, Q2)).open).toBe(true);
    const open = await answer(page, Q1);
    await page.locator(`#${Q1} summary`).click();
    const frames = await sampleAnswer(page, Q1, 500);
    // Still open while the height shrinks, and the glyph already turning
    // back to + (a 300 ms CSS transition, as long as the close itself).
    expect(
      frames.some(
        (f) => f.open && f.height > 0 && f.height < open.height && f.glyph < 45,
      ),
    ).toBe(true);
    await expect.poll(async () => (await answer(page, Q1)).open).toBe(false);
    expect((await answer(page, Q1)).inline).toBe("");
    expect((await answer(page, Q2)).open).toBe(true);
  });

  test("a click mid-animation retargets and never gets stuck (AC 47)", async ({
    page,
  }) => {
    const summary = page.locator(`#${Q1} summary`);
    await summary.scrollIntoViewIfNeeded();
    await expect(page.locator(`#${Q1}`)).toHaveCSS("opacity", "1");
    await summary.click();
    await page.waitForTimeout(120);
    await summary.click();
    await expect.poll(async () => (await answer(page, Q1)).open).toBe(false);
    expect((await answer(page, Q1)).inline).toBe("");
    await summary.click();
    await expect
      .poll(async () => answer(page, Q1))
      .toMatchObject({
        open: true,
        inline: "",
        glyph: 45,
      });
  });

  test("Enter and Space toggle it, and focus stays on the question (AC 47)", async ({
    page,
  }) => {
    const summary = page.locator(`#${Q1} summary`);
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect
      .poll(async () => answer(page, Q1))
      .toMatchObject({
        open: true,
        inline: "",
      });
    await page.keyboard.press("Space");
    await expect.poll(async () => (await answer(page, Q1)).open).toBe(false);
    await expect(summary).toBeFocused();
  });

  test("a deep link still opens its question at once, with no animation (AC 48)", async ({
    page,
  }) => {
    await page.goto(`/preguntas-frecuentes#${Q1}`);
    const frames = await sampleAnswer(page, Q1, 400);
    const full = frames.at(-1)!;
    expect(full.open).toBe(true);
    expect(
      frames.filter((f) => f.open).every((f) => f.height === full.height),
    ).toBe(true);
  });
});

test.describe("FAQ motion, reduced (T038) @feature-sobre-mi", () => {
  test.use({ reducedMotion: "reduce" });

  test("open and close are instant (native) (AC 47)", async ({ page }) => {
    await page.goto("/preguntas-frecuentes");
    const summary = page.locator(`#${Q1} summary`);
    await summary.click();
    const opened = await sampleAnswer(page, Q1, 300);
    expect(opened.every((f) => f.open && f.height === opened[0]!.height)).toBe(
      true,
    );
    await summary.click();
    expect((await answer(page, Q1)).open).toBe(false);
  });
});
