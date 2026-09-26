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
