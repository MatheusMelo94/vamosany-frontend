import { test, expect, type Locator, type Page } from "@playwright/test";
import { waitForMotionToSettle } from "../support/motion";

/**
 * Touch targets on coarse pointers (spec § Accessibility Acceptance:
 * "contact links ≥ 44×44 px on coarse pointers"; RV-0001, QA-0003,
 * QA-0004). The targets are extended invisibly (a `::before` hit area under
 * `(pointer: coarse)`), so what is measured is hit-testing — the region
 * that resolves to the link is ≥ 44 px tall and wide — not the element's
 * own box, which keeps the mockup's visuals.
 */

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 500;

/**
 * Size of the target's hit region, measured through the link's centre:
 * how far up/down and left/right points still resolve to the link. That is
 * what "target size" means for an invisibly extended target (its own box
 * stays the size of its text).
 */
async function hitExtent(target: Locator) {
  await target.scrollIntoViewIfNeeded();
  return target.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const hits = (x: number, y: number) =>
      document.elementFromPoint(x, y)?.closest("a, button") === el;
    const reach = (dx: number, dy: number) => {
      let n = 0;
      while (n < 80 && hits(cx + dx * (n + 1), cy + dy * (n + 1))) n++;
      return n;
    };
    return {
      height: reach(0, -1) + reach(0, 1) + 1,
      width: reach(-1, 0) + reach(1, 0) + 1,
    };
  });
}

const atLeast44 = (e: { height: number; width: number }) => ({
  height: e.height >= 44,
  width: e.width >= 44,
});

test.describe("coarse-pointer tap targets (RV-0001, QA-0003) @feature-sobre-mi", () => {
  test("/contacto channel links take taps across 44×44 px", async ({
    page,
  }) => {
    test.skip(!isPhone(page), "coarse pointer (phone project)");
    await page.goto("/contacto");
    await waitForMotionToSettle(page);
    const links = page.locator("main [data-sm-channels] a");
    await expect(links).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      const extent = await hitExtent(links.nth(i));
      expect(
        atLeast44(extent),
        `channel ${i}: ${JSON.stringify(extent)}`,
      ).toEqual({
        height: true,
        width: true,
      });
    }
  });

  test("/colaboraciones partner-line links take taps across 44×44 px", async ({
    page,
  }) => {
    test.skip(!isPhone(page), "coarse pointer (phone project)");
    await page.goto("/colaboraciones");
    const links = page.locator("main [data-sm-partner] a");
    await expect(links).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await links.nth(i).scrollIntoViewIfNeeded();
      await waitForMotionToSettle(page);
      const extent = await hitExtent(links.nth(i));
      expect(
        atLeast44(extent),
        `partner ${i}: ${JSON.stringify(extent)}`,
      ).toEqual({
        height: true,
        width: true,
      });
    }
  });

  test("fine pointers get no hit-area extension (visuals and layout unchanged)", async ({
    page,
  }) => {
    test.skip(isPhone(page), "fine pointer projects");
    for (const [path, selector] of [
      ["/contacto", "main [data-sm-channels] a"],
      ["/colaboraciones", "main [data-sm-partner] a"],
    ] as const) {
      await page.goto(path);
      const pseudo = await page
        .locator(selector)
        .first()
        .evaluate((el) => getComputedStyle(el, "::before").content);
      expect(pseudo).toBe("none");
    }
  });
});

test.describe("phone navbar hit areas (QA-0004, RV-0006) @feature-sobre-mi", () => {
  test("the logo link and the burger take taps across ≥ 44 × 44 px", async ({
    page,
  }) => {
    test.skip(!isPhone(page), "coarse pointer (phone project)");
    await page.goto("/sobre-mi");
    const header = page.locator("header[data-nav]");
    for (const target of [
      header.getByRole("link", { name: "Vamos a NY — home" }),
      header.getByRole("button", { name: "Toggle menu" }),
    ]) {
      const extent = await hitExtent(target);
      expect(atLeast44(extent), JSON.stringify(extent)).toEqual({
        height: true,
        width: true,
      });
    }
  });

  test("each drawer item owns its whole slot: no dead gaps between items", async ({
    page,
  }) => {
    test.skip(!isPhone(page), "coarse pointer (phone project)");
    await page.goto("/sobre-mi");
    await page
      .locator("header[data-nav]")
      .getByRole("button", { name: "Toggle menu" })
      .click();
    const column = page
      .locator("header[data-nav]")
      .getByRole("navigation", { name: "Menu" })
      .locator("ul ul")
      .last();
    const items = column.locator("a");
    await expect(items.first()).toBeVisible();
    const count = await items.count();
    expect(count).toBeGreaterThan(1);
    // Hit regions measured through each item's centre: [top, bottom] in px.
    const regions: Array<[number, number]> = [];
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      await item.scrollIntoViewIfNeeded();
      regions.push(
        await item.evaluate((el) => {
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const hits = (y: number) =>
            document.elementFromPoint(cx, y)?.closest("a") === el;
          let up = 0;
          while (up < 60 && hits(cy - up - 1)) up++;
          let down = 0;
          while (down < 60 && hits(cy + down + 1)) down++;
          return [Math.round(cy - up), Math.round(cy + down)];
        }),
      );
    }
    for (let i = 0; i < count; i++) {
      const [top, bottom] = regions[i]!;
      // The text is 22px; its slot on the 30px pitch is the target.
      expect(bottom - top, `item ${i}`).toBeGreaterThanOrEqual(29);
      if (i > 0) {
        expect(
          Math.abs(top - regions[i - 1]![1]),
          `gap before item ${i}`,
        ).toBeLessThanOrEqual(1);
      }
    }
  });
});
