import { test, expect } from "@playwright/test";

/** Responsive layout of the Sobre mí pages (spec § Responsive Behavior). */
test.describe("Sobre mí pages: responsive layout @feature-sobre-mi", () => {
  test("audience rows: H2 beside its text at 768 and 1280, stacked at 360 (AC 32)", async ({
    page,
  }) => {
    await page.goto("/trabaja-conmigo");
    const rows = page.locator("[data-sm-audience] > li");
    await expect(rows).toHaveCount(5);
    const width = page.viewportSize()?.width ?? 0;
    for (let i = 0; i < 5; i++) {
      const h2 = await rows.nth(i).locator("h2").boundingBox();
      const text = await rows.nth(i).locator("p").boundingBox();
      if (!h2 || !text) throw new Error("row has no box");
      const sideBySide = text.x >= h2.x + h2.width && text.y < h2.y + h2.height;
      expect({ width, row: i, sideBySide }).toEqual({
        width,
        row: i,
        sideBySide: width >= 768,
      });
    }
  });
});
