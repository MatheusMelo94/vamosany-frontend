import { test, expect } from "@playwright/test";

/**
 * Route-level structure of the Sobre mí pages (spec § Shared Page Structure,
 * § Page metadata, § Accessibility Acceptance). The pages are async-free
 * Server Components, but metadata, landmarks and the layout's <main lang>
 * only exist at route level.
 */

type Route = { path: string; title: string; description: string; h1: string };

const ROUTES: Route[] = [
  {
    path: "/sobre-mi",
    title: "Sobre mí — Vamos a NY",
    description:
      "Soy Belén, comunicadora, estratega digital y, sobre todo, una persona profundamente enamorada de New York.",
    h1: "Sobre mí",
  },
];

test.describe("Sobre mí pages: route structure @feature-sobre-mi", () => {
  for (const route of ROUTES) {
    test(`${route.path}: 200, title and meta description (AC 13)`, async ({
      page,
    }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(route.title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        route.description,
      );
    });

    test(`${route.path}: Spanish main, one h1, landmarks (AC 14)`, async ({
      page,
    }) => {
      await page.goto(route.path);
      await expect(page.locator('main[lang="es"]')).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(
        page.getByRole("heading", { level: 1, name: route.h1 }),
      ).toBeAttached();
      await expect(page.getByRole("banner")).toHaveCount(1);
      await expect(page.getByRole("navigation")).toHaveCount(1);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("contentinfo")).toHaveCount(1);
    });
  }
});
