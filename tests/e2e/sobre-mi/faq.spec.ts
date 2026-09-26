import { test, expect } from "@playwright/test";

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
});
