import { test, expect } from "@playwright/test";

/** Responsive layout of the Sobre mí pages (spec § Responsive Behavior). */
test.describe("Sobre mí pages: responsive layout @feature-sobre-mi", () => {
  test("audience rows: H2 beside its text at 768 and 1280, stacked at 360 (AC 32)", async ({
    page,
  }) => {
    await page.goto("/trabaja-conmigo");
    const rows = page.locator("[data-sm-audience] > li");
    await expect(rows).toHaveCount(5);
    const width = page.viewportSize()?.width ?? 0;
    for (let i = 0; i < 5; i++) {
      const h2 = await rows.nth(i).locator("h2").boundingBox();
      const text = await rows.nth(i).locator("p").boundingBox();
      if (!h2 || !text) throw new Error("row has no box");
      const sideBySide = text.x >= h2.x + h2.width && text.y < h2.y + h2.height;
      expect({ width, row: i, sideBySide }).toEqual({
        width,
        row: i,
        sideBySide: width >= 768,
      });
    }
  });

  /** The email value's text split into the lines it renders on. */
  const emailLines = (page: import("@playwright/test").Page) =>
    page.locator("[data-sm-channels] a[href^='mailto:']").evaluate((link) => {
      const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
      const lines: Array<{ top: number; text: string }> = [];
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const text = n.textContent ?? "";
        for (let i = 0; i < text.length; i++) {
          const range = document.createRange();
          range.setStart(n, i);
          range.setEnd(n, i + 1);
          const top = Math.round(range.getBoundingClientRect().top);
          const line = lines.find((l) => Math.abs(l.top - top) < 4);
          if (line) line.text += text[i];
          else lines.push({ top, text: text[i] ?? "" });
        }
      }
      return lines.map((l) => l.text);
    });

  for (const width of [1280, 860]) {
    test(`Contacto: the email renders on one line at ${width} (AC 35)`, async ({
      page,
    }) => {
      test.skip(
        (page.viewportSize()?.width ?? 0) !== 1280,
        "one run per width is enough",
      );
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/contacto");
      await page.evaluate(() => document.fonts.ready);
      expect(await emailLines(page)).toEqual(["hola@vamosany.com"]);
    });
  }

  test("Contacto: at 1280 each channel stacks its name over its value (spec v1.1)", async ({
    page,
  }) => {
    test.skip((page.viewportSize()?.width ?? 0) !== 1280, "desktop layout");
    await page.goto("/contacto");
    const rows = page.locator("[data-sm-channels] > li");
    await expect(rows).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      const [name, value] = await rows
        .nth(i)
        .locator("> span")
        .evaluateAll((els) => els.map((el) => el.getBoundingClientRect()));
      expect(value!.top).toBeGreaterThanOrEqual(name!.bottom - 1);
    }
  });

  test("Contacto: a too-narrow column breaks the email only after @", async ({
    page,
  }) => {
    test.skip((page.viewportSize()?.width ?? 0) !== 1280, "one run is enough");
    await page.goto("/contacto");
    await page.evaluate(() => document.fonts.ready);
    // Simulates 200% zoom in the 200px column: half the room.
    await page
      .locator("[data-sm-channels]")
      .evaluate((el) => ((el as HTMLElement).style.width = "120px"));
    expect(await emailLines(page)).toEqual(["hola@", "vamosany.com"]);
    const overflow = await page
      .locator("[data-sm-channels] a[href^='mailto:']")
      .evaluate((el) => el.getBoundingClientRect().right);
    const box = await page
      .locator("[data-sm-channels]")
      .evaluate((el) => el.getBoundingClientRect().right);
    expect(overflow).toBeLessThanOrEqual(box + 0.5);
  });
});
