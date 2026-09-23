import { test, expect } from "@playwright/test";

test("unknown routes render the 404 page in the design system", async ({
  page,
}) => {
  const response = await page.goto("/nao-existe");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 2, name: /not on the map/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /back to the start/i }),
  ).toHaveAttribute("href", "/");
});
