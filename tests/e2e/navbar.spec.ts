import { test, expect, type Locator, type Page } from "@playwright/test";

/**
 * Characterization of the navbar (ADR-0006 § 2 oracle; plan § 12). Written on
 * unchanged app code, before any navbar change, so later tasks diff the navbar
 * at header level instead of the page-level 1% tolerance.
 *
 * Captures isolate the navbar: `main` and `footer` are removed before the
 * screenshot so the landing's looping hero ring and timelines can't leak into
 * the clip. Clips are the union of `header[data-nav]` and the open overlay
 * (mega-menu panel, language menu), or the viewport for the drawer.
 */

// `display: none`, not `visibility: hidden`: the hero ring's preserve-3d cards
// keep painting as composited layers under `visibility: hidden`. The header is
// in flow at the top and the overlays are absolute/fixed, so removing <main>
// and <footer> does not move the navbar.
const ISOLATE = "main, footer { display: none !important; }";

/**
 * Applied before capture (not via toHaveScreenshot's `style`, which is injected
 * on the capture frame itself and still shows the ring's old compositor layer).
 */
async function isolate(page: Page) {
  await page.addStyleTag({ content: ISOLATE });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

/** Trigger label → snapshot slug. "About" became "Sobre mí" (DDR-0002; plan § 12 item 5). */
const PANELS = [
  ["Itineraries", "itineraries"],
  ["Guides", "guides"],
  ["Blog", "blog"],
  ["Services", "services"],
  ["Sobre mí", "sobre-mi"],
] as const;

/** spec § Menu IA (DDR-0002). */
const SOBRE_MI_ITEMS = [
  ["Sobre mí", "/sobre-mi"],
  ["Colaboraciones", "/colaboraciones"],
  ["Trabajá conmigo", "/trabaja-conmigo"],
  ["Contacto", "/contacto"],
  ["FAQ", "/preguntas-frecuentes"],
] as const;

type Box = { x: number; y: number; width: number; height: number };

function union(a: Box, b: Box): Box {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y,
  };
}

async function box(locator: Locator): Promise<Box> {
  const b = await locator.boundingBox();
  if (!b) throw new Error("element has no bounding box");
  return b;
}

async function open(page: Page) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  // The hero timeline runs on load; the navbar itself does not animate, but
  // let the page settle so layout is final.
  await page.waitForTimeout(1500);
}

const header = (page: Page) => page.locator("header[data-nav]");

/** The open desktop mega-menu panel: the only rounded-3xl block inside the capsule. */
const megaPanel = (page: Page) =>
  header(page).locator(".nav-capsule div.rounded-3xl");

const isDesktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;

test.describe("navbar characterization @feature-sobre-mi", () => {
  test("closed navbar", async ({ page }) => {
    await open(page);
    await isolate(page);
    await expect(page).toHaveScreenshot("navbar-closed.png", {
      clip: await box(header(page)),
      animations: "disabled",
    });
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("closed navbar, reduced motion", async ({ page }) => {
      await open(page);
      await expect(page.locator("html")).not.toHaveClass(/gsap/);
      await isolate(page);
      await expect(page).toHaveScreenshot("navbar-closed-reduced.png", {
        clip: await box(header(page)),
        animations: "disabled",
      });
    });
  });

  for (const [label, slug] of PANELS) {
    test(`mega-menu panel: ${label}`, async ({ page }) => {
      test.skip(!isDesktop(page), "mega-menu exists at >= 1024 only");
      await open(page);
      const trigger = header(page).getByRole("button", {
        name: label,
        exact: true,
      });
      // A real click fires mouseenter (open) then click (toggle closed), so the
      // open-with-pointer-on-trigger state is reached by hovering the trigger.
      await trigger.hover();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      const panel = megaPanel(page);
      await expect(panel).toBeVisible();
      await isolate(page);
      await expect(page).toHaveScreenshot(`navbar-panel-${slug}.png`, {
        clip: union(await box(header(page)), await box(panel)),
        animations: "disabled",
      });
    });
  }

  test("language menu", async ({ page }) => {
    test.skip(!isDesktop(page), "language dropdown exists at >= 1024 only");
    await open(page);
    await header(page).getByRole("button", { name: "Change language" }).click();
    const menu = header(page).getByRole("listbox", { name: "Language" });
    await expect(menu).toBeVisible();
    await isolate(page);
    await expect(page).toHaveScreenshot("language-menu.png", {
      clip: union(await box(header(page)), await box(menu)),
      animations: "disabled",
    });
  });

  test("drawer: top and last group", async ({ page }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
    await open(page);
    await header(page).getByRole("button", { name: "Toggle menu" }).click();
    const drawer = header(page).locator("> div.overflow-y-auto");
    await expect(drawer).toBeVisible();
    await isolate(page);
    await expect(page).toHaveScreenshot("drawer-top.png", {
      animations: "disabled",
    });
    await drawer.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await expect(page).toHaveScreenshot("drawer-last-group.png", {
      animations: "disabled",
    });
  });
});

test.describe("navbar Sobre mí group (DDR-0002) @feature-sobre-mi", () => {
  test("desktop panel links each item to its route (AC 1)", async ({
    page,
  }) => {
    test.skip(!isDesktop(page), "mega-menu exists at >= 1024 only");
    await open(page);
    const trigger = header(page).getByRole("button", {
      name: "Sobre mí",
      exact: true,
    });
    await trigger.hover();
    const panel = megaPanel(page);
    await expect(panel).toBeVisible();
    await expect(panel.getByText("Vamos a New York")).toBeVisible();
    await expect(panel.getByText("Ayuda")).toBeVisible();
    for (const [title, href] of SOBRE_MI_ITEMS) {
      await expect(
        panel.getByRole("link", { name: new RegExp(`^${title} `) }),
      ).toHaveAttribute("href", href);
    }
  });

  test("drawer: tapping an item navigates and closes the drawer (AC 3)", async ({
    page,
  }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
    await open(page);
    const toggle = header(page).getByRole("button", { name: "Toggle menu" });
    await toggle.click();
    const drawer = header(page).locator("> div.overflow-y-auto");
    for (const [title, href] of SOBRE_MI_ITEMS) {
      await expect(
        drawer.getByRole("link", { name: title, exact: true }),
      ).toHaveAttribute("href", href);
    }
    await drawer
      .getByRole("link", { name: "Colaboraciones", exact: true })
      .click();
    await expect(page).toHaveURL(/\/colaboraciones$/);
    await expect(drawer).toHaveCount(0);
  });
});
