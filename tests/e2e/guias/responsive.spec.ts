import { test, expect, type Page } from "@playwright/test";

/**
 * Layout robustness across the cross-cutting conditions of spec § States
 * Matrix: width down to 320px, 200% text and zoom, no JavaScript, reduced
 * motion (AC 11, 12, 35, 36, 41; plan D-9). These checks do not depend on the
 * project's own viewport, so the width loops run once, on desktop.
 */
const PAGES = [
  "/guias",
  "/guias/el-subte-explicado",
  "/guias/visa-a-estados-unidos",
  "/guias/west-village",
];

const overflow = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );

/**
 * How far the page's own content (everything inside <main>) pokes out of the
 * viewport, in px. The floating navbar is measured apart: its desktop link row
 * is wider than the window at 200% text on any page of the site (ADR-0006).
 */
const mainOverflow = (page: Page) =>
  page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return Math.max(
      0,
      ...[...document.querySelectorAll("main, main *")].map((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 ? Math.round(r.right - width) : 0;
      }),
    );
  });

/** Direct children of `parent` that overlap vertically with the next one. */
const overlaps = (page: Page, parent: string) =>
  page.evaluate((selector) => {
    const root = document.querySelector(selector);
    const rects = [...(root?.children ?? [])]
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.height > 0);
    const bad: string[] = [];
    for (let i = 1; i < rects.length; i++) {
      const prev = rects[i - 1]!.r;
      const cur = rects[i]!.r;
      if (cur.top < prev.bottom - 1) {
        bad.push(
          `${rects[i]!.el.tagName} overlaps ${rects[i - 1]!.el.tagName}`,
        );
      }
    }
    return bad;
  }, parent);

test.describe("widths and text size @feature-guias", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-1280",
      "viewport loops run once",
    );
  });

  for (const path of PAGES) {
    test(`${path}: no horizontal scroll at 320, 360, 768 and 1280 (AC 11, 41)`, async ({
      page,
    }) => {
      for (const width of [320, 360, 768, 1280]) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(path);
        expect(
          await overflow(page),
          `${path} at ${width}px`,
        ).toBeLessThanOrEqual(0);
      }
    });
  }

  for (const path of PAGES) {
    test(`${path}: 200% text-only on a 1280 window keeps everything readable (AC 41)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(path);
      await page.addStyleTag({ content: "html { font-size: 200%; }" });
      expect(await mainOverflow(page)).toBeLessThanOrEqual(0);
      // the head blocks and the reading column do not overlap
      expect(await overlaps(page, "main > div > header")).toEqual([]);
      expect(await overlaps(page, "main article")).toEqual([]);
      // the closing button stays inside the viewport
      const cta = page.getByRole("link", {
        name: /^Quiero (mi itinerario|gestionar mi visa)$/,
      });
      if (await cta.count()) {
        const box = await cta.first().boundingBox();
        expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(1280);
      }
    });
  }

  test("200% text-only: a wide window keeps two columns with the aside in rem (AC 41)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 2400, height: 1000 });
    await page.goto("/guias/el-subte-explicado");
    await page.addStyleTag({ content: "html { font-size: 200%; }" });
    const layout = await page.evaluate(() => {
      const article = document
        .querySelector("main article")!
        .getBoundingClientRect();
      const aside = document
        .querySelector("main aside")!
        .getBoundingClientRect();
      return {
        sideBySide: aside.left >= article.right,
        asideWidth: Math.round(aside.width),
      };
    });
    expect(layout.sideBySide).toBe(true);
    // 18.75rem at 32px
    expect(layout.asideWidth).toBe(600);
    expect(await mainOverflow(page)).toBeLessThanOrEqual(0);
  });

  test("200% text-only on a 1280 window falls back to one column with the details index (AC 41)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/guias/el-subte-explicado");
    await page.addStyleTag({ content: "html { font-size: 200%; }" });
    await expect(
      page.locator("details > summary", { hasText: "En esta guía" }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "En esta guía" }),
    ).toBeHidden();
  });

  test("200% browser zoom (a 640px window) lands in the single-column layout (AC 41)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 640, height: 400 });
    await page.goto("/guias/el-subte-explicado");
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    await expect(
      page.locator("details > summary", { hasText: "En esta guía" }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "En esta guía" }),
    ).toBeHidden();
  });
});

test.describe("without JavaScript (AC 36) @feature-guias", () => {
  test.use({ javaScriptEnabled: false });

  test("a guide is complete: text, hero and credit, index anchors, details, CTA and pager, nothing active or hidden", async ({
    page,
    viewport,
  }) => {
    await page.goto("/guias/el-subte-explicado");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      "El subte, explicado",
    );
    await expect(page.locator("main [data-sm-dek]")).toBeVisible();
    await expect(page.getByRole("figure").getByRole("img")).toBeVisible();
    await expect(page.locator("figcaption")).toHaveText(
      /^Foto: Subte de Union Square/,
    );
    await expect(page.getByRole("list", { name: "Datos clave" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Quiero mi itinerario" }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Más guías" }),
    ).toBeVisible();

    // the index is a list of plain anchors; none is marked
    if ((viewport?.width ?? 0) >= 961) {
      const index = page.getByRole("navigation", { name: "En esta guía" });
      await expect(index.getByRole("link")).toHaveCount(8);
      await expect(index.locator("[aria-current]")).toHaveCount(0);
    } else {
      // the native <details> opens without scripting
      const details = page.locator("details", { hasText: "En esta guía" });
      await details.locator("summary").click();
      await expect(details).toHaveAttribute("open", "");
      await expect(details.getByRole("link")).toHaveCount(8);
    }
  });

  test("the home is complete: head, three stripes and twelve cards", async ({
    page,
  }) => {
    await page.goto("/guias");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3 })).toHaveCount(12);
    await expect(page.locator("main [data-sm-heading]")).toHaveCSS(
      "opacity",
      "1",
    );
  });
});

test.describe("reduced motion: no hover lift (AC 12, 35) @feature-guias", () => {
  test.use({ reducedMotion: "reduce" });

  test.beforeEach(({}, testInfo) => {
    test.skip(
      !testInfo.project.name.includes("desktop"),
      "hover needs a fine pointer",
    );
  });

  // Tailwind 4 lifts with the individual `translate` property, not `transform`.
  const liftOf = (locator: ReturnType<Page["locator"]>) =>
    locator.evaluate((el) => {
      const cs = getComputedStyle(el);
      return `${cs.translate} | ${cs.transform}`;
    });

  test("cards, the closing button and the pager cells stay still on hover", async ({
    page,
  }) => {
    await page.goto("/guias");
    const card = page.getByRole("link", { name: /West Village/ });
    await card.hover();
    expect(await liftOf(card)).not.toContain("-2px");

    await page.goto("/guias/el-subte-explicado");
    const cta = page.getByRole("link", { name: "Quiero mi itinerario" });
    await cta.hover();
    expect(await liftOf(cta)).not.toContain("-2px");
    const next = page.getByRole("link", { name: /Siguiente guía/ });
    await next.hover();
    expect(await liftOf(next)).not.toContain("-2px");
  });
});

test.describe("motion on: the lift exists where hover does (AC 12) @feature-guias", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      !testInfo.project.name.includes("desktop"),
      "hover needs a fine pointer",
    );
  });

  test("a card lifts 2px on hover", async ({ page }) => {
    await page.goto("/guias");
    const card = page.getByRole("link", { name: /West Village/ });
    await card.hover();
    await expect
      .poll(() => card.evaluate((el) => getComputedStyle(el).translate))
      .toBe("0px -2px");
  });
});
