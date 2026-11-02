import { test, expect } from "@playwright/test";

/**
 * Unknown guide slug (spec § States Matrix, AC 1; plan D-6). With
 * `dynamicParams = false` Next 15.5 renders the root `app/not-found.tsx` (the
 * `/_not-found` route), not a segment boundary, so a `guias/not-found.tsx` is
 * never used; the spec accepts the root 404 alone (no second button).
 */
test.describe("unknown guide slug @feature-guias", () => {
  test("is an HTTP 404 with noindex and the existing 404 page", async ({
    page,
  }) => {
    const response = await page.goto("/guias/nope");
    expect(response?.status()).toBe(404);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    await expect(
      page.getByRole("heading", { name: "Esta cuadra no está en el mapa." }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Volver al inicio" }),
    ).toHaveAttribute("href", "/");
    await expect(page.locator("main")).toHaveCount(1);
  });

  test("a known slug with another case is also a 404 (framework default, no redirects)", async ({
    page,
  }) => {
    const response = await page.goto("/guias/West-Village");
    expect(response?.status()).toBe(404);
  });
});
