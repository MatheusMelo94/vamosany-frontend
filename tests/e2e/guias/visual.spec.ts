import { test, expect, type Page } from "@playwright/test";
import {
  waitForMotionController,
  waitForMotionToSettle,
} from "../support/motion";

/**
 * Visual baselines of the two Guías templates, at 360, 768 and 1280 (the
 * projects of record), after the heading entrance has settled. The PNGs are
 * generated in CI only (playwright.config.ts `ignoreSnapshots` locally; CLAUDE.md:
 * baselines come from the `update-snapshots` workflow), so on a dev machine
 * these captures are no-ops and nothing is committed from here.
 *
 * Expected CI diff when this lands (ADR-0006; plan § 15):
 *  - new PNGs: guias-home-*, guia-subte-* (top screen and full page, per project);
 *  - changed, by design: `navbar-panel-guides-*` (item 3, item 4's blurb and the
 *    "Todas las guías →" row, DDR-0012/0013) and the drawer captures that include
 *    the Guías group (`drawer-last-group-*`), if the CI run reports a diff;
 *  - changed, by the user's footer decision of 2026-11-02: the landing's
 *    full-page captures that include the footer (`full-reduced-motion-*`):
 *    "Taxi, Uber o subte" became "Caminar por New York";
 *  - anything else in the diff is a bug, not a baseline update.
 */
async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  // With motion on, wait for the lazy controller and for the entrance to land.
  const gsap = await page.evaluate(() =>
    document.documentElement.classList.contains("gsap"),
  );
  if (gsap) {
    await waitForMotionController(page);
    await waitForMotionToSettle(page);
  }
}

const TEMPLATES = [
  ["guias-home", "/guias"],
  ["guia-subte", "/guias/el-subte-explicado"],
] as const;

test.describe("visual baselines @feature-guias", () => {
  for (const [name, path] of TEMPLATES) {
    test(`${name}: top screen`, async ({ page }) => {
      await page.goto(path);
      await settle(page);
      await expect(page).toHaveScreenshot(`${name}-top.png`, {
        animations: "disabled",
      });
    });

    test(`${name}: full page`, async ({ page }) => {
      await page.goto(path);
      await settle(page);
      await expect(page).toHaveScreenshot(`${name}-full.png`, {
        fullPage: true,
        animations: "disabled",
      });
    });
  }
});
