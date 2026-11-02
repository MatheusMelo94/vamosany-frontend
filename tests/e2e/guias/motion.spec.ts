import { test, expect, type Page } from "@playwright/test";
import { waitForGsapIdle, waitForMotionController } from "../support/motion";

/**
 * Motion on the Guías pages (DDR-0012 § 5; plan D-5, § 9; spec AC 34, 35, 37):
 * the M1 heading entrance and nothing else. Default context = motion on
 * (`.gsap`); `reducedMotion: "reduce"` and `javaScriptEnabled: false` = static
 * and fully visible (ADR-0002).
 */
const PAGES = ["/guias", "/guias/el-subte-explicado", "/guias/west-village"];

/** What the heading looks like once the entrance has landed. */
async function headingState(page: Page) {
  return page.evaluate(() => {
    const heading = document.querySelector<HTMLElement>(
      "main [data-sm-heading]",
    );
    const visual = heading?.querySelector<HTMLElement>("[data-sm-split]");
    const dek = heading?.querySelector<HTMLElement>("[data-sm-dek]");
    const label = heading?.querySelector<HTMLElement>("[data-sm-label]");
    return {
      heading: heading ? getComputedStyle(heading).opacity : null,
      dek: dek ? getComputedStyle(dek).opacity : null,
      label: label ? getComputedStyle(label).opacity : null,
      train: visual
        ? getComputedStyle(visual).getPropertyValue("--train").trim()
        : null,
      // one text run: only the marker span is left inside the split target
      children: visual
        ? [...visual.children].map((c) => c.tagName + "." + c.className)
        : null,
      leaked: visual ? /(^|\s)(word|mask)/i.test(visual.innerHTML) : null,
    };
  });
}

/** Elements outside the heading and the navbar that script gave inline opacity or transform. */
async function animatedElsewhere(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("main *")]
      .filter((el) => !el.closest("[data-sm-heading]"))
      .filter((el) =>
        /opacity|transform|translate/.test(el.getAttribute("style") ?? ""),
      )
      // the photos carry a static object-position style, never opacity/transform
      .map((el) => `${el.tagName.toLowerCase()} ${el.getAttribute("style")}`),
  );
}

test.describe("Guías motion: M1 only @feature-guias", () => {
  for (const path of PAGES) {
    test(`${path}: the heading enters and ends as one text run, and nothing else animates (AC 34)`, async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page.locator("html")).toHaveClass(/gsap/);
      await expect(page.locator('main [data-sm-scene="guias"]')).toHaveCount(1);
      await waitForMotionController(page);
      await waitForGsapIdle(page);
      await expect
        .poll(() => headingState(page))
        .toEqual({
          heading: "1",
          dek: "1",
          label: "1",
          train: "0%",
          children: ["SPAN.highlight-heading"],
          leaked: false,
        });
      expect(await animatedElsewhere(page)).toEqual([]);
    });
  }

  test("the H1's accessible name never changes while it animates (AC 3)", async ({
    page,
  }) => {
    await page.goto("/guias/el-subte-explicado");
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      "El subte, explicado",
    );
    await waitForMotionController(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      "El subte, explicado",
    );
  });

  test("the navbar gains its scrolled surface after 80px, as on the landing", async ({
    page,
  }) => {
    await page.goto("/guias/el-subte-explicado");
    const nav = page.locator("[data-nav]");
    await waitForMotionController(page);
    await expect(nav).not.toHaveClass(/is-scrolled/);
    await page.evaluate(() =>
      window.scrollTo({ top: 300, behavior: "instant" }),
    );
    await expect(nav).toHaveClass(/is-scrolled/);
  });

  test("a client navigation between two guides mounts a fresh controller", async ({
    page,
  }) => {
    await page.goto("/guias/el-subte-explicado");
    await waitForMotionController(page);
    await page
      .getByRole("navigation", { name: "Más guías" })
      .getByRole("link", { name: /Siguiente guía/ })
      .click();
    await expect(page).toHaveURL(/\/guias\/desde-el-aeropuerto$/);
    await expect
      .poll(() => headingState(page), { timeout: 15_000 })
      .toMatchObject({ heading: "1", dek: "1", train: "0%" });
  });

  test.describe("reduced motion (AC 35)", () => {
    test.use({ reducedMotion: "reduce" });

    for (const path of PAGES) {
      test(`${path}: eyebrow, H1 and dek are visible at once, with no transforms; anchors jump`, async ({
        page,
      }) => {
        await page.goto(path);
        await expect(page.locator("html")).not.toHaveClass(/gsap/);
        expect(await headingState(page)).toMatchObject({
          heading: "1",
          dek: "1",
          label: "1",
          train: "0%",
        });
        expect(await animatedElsewhere(page)).toEqual([]);
        expect(
          await page.evaluate(() =>
            document
              .querySelector("main [data-sm-heading]")
              ?.getAttribute("style"),
          ),
        ).toBeNull();
        expect(
          await page.evaluate(
            () => getComputedStyle(document.documentElement).scrollBehavior,
          ),
        ).toBe("auto");
      });
    }
  });

  test.describe("JavaScript disabled", () => {
    test.use({ javaScriptEnabled: false });

    for (const path of PAGES) {
      test(`${path}: the heading is visible and in place`, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator("main h1")).toBeVisible();
        expect(await headingState(page)).toMatchObject({
          heading: "1",
          dek: "1",
          train: "0%",
        });
      });
    }
  });
});
