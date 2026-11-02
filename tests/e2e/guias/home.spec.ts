import { test, expect } from "@playwright/test";

/** The Guías home at route level (spec AC 9-13, 33, 40). */
test.describe("guías home @feature-guias", () => {
  test("renders the head, three stripes and twelve cards (AC 9, 10)", async ({
    page,
  }) => {
    const response = await page.goto("/guias");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle("Guías — Vamos a NY");
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      "Todo lo que necesitás para moverte por New York",
    );
    for (const group of [
      "Moverte por la ciudad",
      "Barrios",
      "Antes de viajar",
    ]) {
      await expect(
        page.getByRole("heading", { level: 2, name: group }),
      ).toBeVisible();
    }
    await expect(page.getByText("4 guías")).toHaveCount(3);
    await expect(page.getByRole("heading", { level: 3 })).toHaveCount(12);
    const west = page.getByRole("link", { name: /West Village/ });
    await expect(west).toHaveAttribute("href", "/guias/west-village");
  });

  test("lays the cards out in 4, 2 or 1 columns by width (AC 11)", async ({
    page,
    viewport,
  }) => {
    await page.goto("/guias");
    const columns = await page.evaluate(() => {
      const list = document.querySelector("main section ul") as HTMLElement;
      return getComputedStyle(list).gridTemplateColumns.split(" ").length;
    });
    const width = viewport?.width ?? 0;
    expect(columns).toBe(width >= 1001 ? 4 : width >= 561 ? 2 : 1);
  });

  test("has no horizontal scroll down to 320px (AC 11)", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto("/guias");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("the group anchors exist and the guide breadcrumb reaches them (AC 13)", async ({
    page,
  }) => {
    await page.goto("/guias/west-village");
    const crumb = page
      .getByRole("navigation", { name: "Ruta" })
      .getByRole("link", { name: "Barrios" });
    await expect(crumb).toHaveAttribute("href", "/guias#barrios");
    await crumb.click();
    await expect(page).toHaveURL(/\/guias#barrios$/);
    const heading = page.getByRole("heading", { level: 2, name: "Barrios" });
    await expect(heading).toBeInViewport();
    // clear of the floating navbar
    const box = await heading.boundingBox();
    expect(box?.y ?? 0).toBeGreaterThan(72);
  });

  test("keeps one H1 and the outline H1, H2, H3 (AC 40)", async ({ page }) => {
    await page.goto("/guias");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(
      page
        .getByRole("heading", { level: 2 })
        .filter({ hasText: /^(Moverte|Barrios|Antes)/ }),
    ).toHaveCount(3);
  });
});
