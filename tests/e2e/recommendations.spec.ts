import { test, expect, type Page } from "@playwright/test";
import { waitForGsapIdle, waitForLandingMotion } from "./support/motion";

/**
 * Effective opacity of every card in the visible tab panel: the card times
 * its ancestors up to the panel, so a hidden <li> wrapper counts (RV-0033).
 */
function cardOpacities(page: Page): Promise<number[]> {
  return page
    .locator("#recomendados [role=tabpanel] article")
    .evaluateAll((els) =>
      els.map((el) => {
        let o = 1;
        for (
          let n: Element | null = el;
          n && n.getAttribute("role") !== "tabpanel";
          n = n.parentElement
        ) {
          o *= Number(getComputedStyle(n).opacity);
        }
        return o;
      }),
    );
}

/** Effective opacity of an element, multiplying its ancestors' opacity. */
function panelOpacity(page: Page): Promise<number> {
  return page.locator("#recomendados [role=tabpanel]").evaluate((el) => {
    let o = 1;
    for (let n: Element | null = el; n; n = n.parentElement) {
      o *= Number(getComputedStyle(n).opacity);
    }
    return o;
  });
}

test.describe("Mis recomendados tabs @feature-landing (DDR-0008, RV-0024)", () => {
  test("cards stay visible after switching tabs with motion on", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForLandingMotion(page);
    const section = page.locator("#recomendados");
    await section.scrollIntoViewIfNeeded();
    await waitForGsapIdle(page);
    expect(await panelOpacity(page)).toBe(1);

    for (const [name, cards] of [
      ["Broadway", 2],
      ["Internet", 1],
      ["Pases y atracciones", 3],
    ] as const) {
      await section.getByRole("tab", { name }).click();
      await expect(section.getByRole("tabpanel")).toHaveAccessibleName(name);
      await waitForGsapIdle(page);
      expect(await cardOpacities(page)).toEqual(Array(cards).fill(1));
      expect(await panelOpacity(page)).toBe(1);
    }
  });

  test("after a tab makes the section shorter, the stats below still count up", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForLandingMotion(page);
    const section = page.locator("#recomendados");
    await section.scrollIntoViewIfNeeded();
    await waitForGsapIdle(page);
    // Three stacked cards on a phone become one: the section shrinks.
    await section.getByRole("tab", { name: "Internet" }).click();
    await waitForGsapIdle(page);

    const stats = page.locator("[data-count]");
    await stats.first().scrollIntoViewIfNeeded();
    await waitForGsapIdle(page);
    await expect(stats).toHaveText(["+200", "+20", "+1000 km"]);
  });

  test("every tab fits on screen without horizontal scrolling", async ({
    page,
  }) => {
    await page.goto("/");
    const width = page.viewportSize()?.width ?? 0;
    for (const tab of await page.locator("#recomendados [role=tab]").all()) {
      const box = await tab.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    }
  });
});
