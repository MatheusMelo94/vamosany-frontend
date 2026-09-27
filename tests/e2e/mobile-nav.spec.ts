import { test, expect, type Locator, type Page } from "@playwright/test";
import { waitForLandingMotion } from "./support/motion";

/**
 * Behavioral checks of the phone menu "Índice" (mobile-navigation spec;
 * plan § 8, § 12). Characterization screenshots live in navbar.spec.ts,
 * where the committed baselines are resolved.
 */

const isDesktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;
const header = (page: Page) => page.locator("header[data-nav]");
const burger = (page: Page) =>
  header(page).getByRole("button", { name: /^(Abrir|Cerrar) menú$/ });
const panel = (page: Page) =>
  header(page).getByRole("navigation", { name: "Menú" });

async function openLanding(page: Page) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await waitForLandingMotion(page);
}

async function openDrawer(page: Page): Promise<Locator> {
  await burger(page).click();
  await expect(panel(page)).toBeVisible();
  return panel(page);
}

/**
 * [role, name] of every node Chromium exposes to assistive tech. Read from
 * the browser's own tree (CDP), because Playwright's ariaSnapshot() doesn't
 * honour `inert`.
 */
async function exposed(page: Page): Promise<Array<[string, string]>> {
  const cdp = await page.context().newCDPSession(page);
  const { nodes } = await cdp.send("Accessibility.getFullAXTree");
  await cdp.detach();
  return nodes
    .filter((n) => !n.ignored)
    .map((n) => [String(n.role?.value ?? ""), String(n.name?.value ?? "")]);
}

/** True when a programmatic focus() lands on the element. */
function takesFocus(locator: Locator): Promise<boolean> {
  return locator.evaluate((el) => {
    (el as HTMLElement).focus();
    return document.activeElement === el;
  });
}

test.describe("drawer modality (AC 30, 31, 34) @feature-mobile-nav", () => {
  test.beforeEach(({ page }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
  });

  test("while open, the page behind is inert; after close it is restored", async ({
    page,
  }) => {
    await openLanding(page);
    const logo = header(page).getByRole("link", { name: "Vamos a NY — home" });
    const mainLink = page.locator("main a").first();
    const footerLink = page.locator("footer a").first();

    await openDrawer(page);
    for (const target of [logo, mainLink, footerLink]) {
      expect(await takesFocus(target)).toBe(false);
    }
    const tree = await exposed(page);
    expect(tree).not.toContainEqual(["link", "Vamos a NY — home"]);
    expect(tree.map(([role]) => role)).not.toContain("main");
    expect(tree.map(([role]) => role)).not.toContain("contentinfo");
    expect(tree).toContainEqual(["navigation", "Menú"]);

    await burger(page).click();
    await expect(panel(page)).toHaveCount(0);
    await expect(page.locator("[inert]")).toHaveCount(0);
    for (const target of [logo, mainLink, footerLink]) {
      expect(await takesFocus(target)).toBe(true);
    }
  });

  test("while open, scrolling over the page or past the list's end doesn't move the page", async ({
    page,
  }) => {
    await openLanding(page);
    const drawer = await openDrawer(page);
    const before = await page.evaluate(() => window.scrollY);
    const b = await drawer.boundingBox();
    if (!b) throw new Error("no panel box");

    // Over the veil (the 16px strip left of the panel), then over the list,
    // far past its end.
    await page.mouse.move(b.x / 2, b.y + b.height / 2);
    await page.mouse.wheel(0, 800);
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    for (let i = 0; i < 6; i++) await page.mouse.wheel(0, 1500);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBe(before);

    if (test.info().project.name === "phone-360") {
      const cdp = await page.context().newCDPSession(page);
      for (const x of [b.x / 2, b.x + b.width / 2]) {
        await cdp.send("Input.synthesizeScrollGesture", {
          x,
          y: b.y + b.height / 2,
          yDistance: -1500,
          gestureSourceType: "touch",
          repeatCount: 2,
        });
      }
      expect(await page.evaluate(() => window.scrollY)).toBe(before);
    }

    await burger(page).click();
    await expect(panel(page)).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => document.body.style.overflow))
      .toBe("");
    await page.mouse.wheel(0, 600);
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(before);
  });

  test("the veil is pointer-only: not exposed to assistive tech, a tap closes", async ({
    page,
  }) => {
    await openLanding(page);
    const drawer = await openDrawer(page);
    const tree = await exposed(page);
    expect(tree.map(([, name]) => name)).not.toContain("Close menu");
    const b = await drawer.boundingBox();
    if (!b) throw new Error("no panel box");
    await page.mouse.click(b.x / 2, b.y + b.height / 2);
    await expect(panel(page)).toHaveCount(0);
    await expect(burger(page)).toHaveAttribute("aria-expanded", "false");
  });
});
