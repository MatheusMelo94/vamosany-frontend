import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Locator, type Page } from "@playwright/test";
import { waitForMotionToSettle } from "../support/motion";

/**
 * Accessibility of the Guías templates (spec § Accessibility Acceptance;
 * AC 38, 40, 42, 43). Runs on the three projects: 360 (touch), 768 and 1280.
 */

const PAGES = [
  ["home", "/guias"],
  ["subte", "/guias/el-subte-explicado"],
  ["Visa", "/guias/visa-a-estados-unidos"],
  ["West Village", "/guias/west-village"],
] as const;

/**
 * Zero axe violations, except the documented footer `color-contrast`
 * (Sobre mí AC 20; landing.spec.ts KNOWN_A11Y; ADR-0006): the frozen footer's
 * text-white/45 captions are 4.48:1 on bg-ink. Anything in main or the navbar
 * fails, at any impact.
 */
async function expectNoViolations(page: Page, impacts?: string[]) {
  const results = await new AxeBuilder({ page }).analyze();
  const inFooter = (target: string) =>
    page.evaluate(
      (sel) => Boolean(document.querySelector(sel)?.closest("footer")),
      target,
    );
  const found: string[] = [];
  for (const violation of results.violations) {
    if (impacts && !impacts.includes(String(violation.impact))) continue;
    for (const node of violation.nodes) {
      const target = String(node.target[0]);
      if (violation.id === "color-contrast" && (await inFooter(target)))
        continue;
      found.push(`${violation.id} (${violation.impact}): ${target}`);
    }
  }
  expect(found).toEqual([]);
}

test.describe("axe @feature-guias", () => {
  for (const [name, path] of PAGES) {
    test(`${name}: no violations (AC 38, 42)`, async ({ page }) => {
      await page.goto(path);
      await waitForMotionToSettle(page);
      await expectNoViolations(page);
    });
  }

  test("the 404 has no serious or critical violations (AC 38)", async ({
    page,
  }) => {
    await page.goto("/guias/nope");
    await waitForMotionToSettle(page);
    // The existing root 404 (kept unchanged by plan D-6 and tests/e2e/
    // not-found.spec.ts, which expects its level-2 heading) has no H1: axe's
    // moderate best-practice `page-has-heading-one`. Gated like the Sobre mí
    // pages' audit, at serious and critical.
    await expectNoViolations(page, ["serious", "critical"]);
  });

  test("the mobile details open has no violations (AC 38)", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name.includes("desktop"),
      "the details index is for < 961px",
    );
    await page.goto("/guias/el-subte-explicado");
    await waitForMotionToSettle(page);
    await page
      .locator("details > summary", { hasText: "En esta guía" })
      .click();
    await expect(page.locator("details[open]")).toHaveCount(1);
    await expectNoViolations(page);
  });

  test("the focus ring shows on the black band's button (AC 39)", async ({
    page,
  }, testInfo) => {
    test.skip(
      !testInfo.project.name.includes("desktop"),
      "keyboard focus ring",
    );
    await page.goto("/guias/el-subte-explicado");
    const cta = page.getByRole("link", { name: "Quiero mi itinerario" });
    await cta.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(cta).toBeFocused();
    const ring = await cta.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        style: cs.outlineStyle,
        width: cs.outlineWidth,
        color: cs.outlineColor,
      };
    });
    expect(ring.style).toBe("solid");
    expect(parseFloat(ring.width)).toBeGreaterThanOrEqual(3);
    // the brand yellow: it reads against the black band
    expect(ring.color).toBe("rgb(255, 221, 18)");
  });
});

test.describe("headings and landmarks (AC 40) @feature-guias", () => {
  test("a guide has one H1, no skipped level, and its labels are not headings", async ({
    page,
  }) => {
    await page.goto("/guias/el-subte-explicado");
    const levels = await page.evaluate(() =>
      [...document.querySelectorAll("main h1, main h2, main h3, main h4")].map(
        (h) => Number(h.tagName[1]),
      ),
    );
    expect(levels.filter((l) => l === 1)).toHaveLength(1);
    for (let i = 1; i < levels.length; i++) {
      expect(
        (levels[i] as number) - (levels[i - 1] as number),
      ).toBeLessThanOrEqual(1);
    }
    await expect(
      page.getByRole("heading", { name: /^(En esta guía|Más de|Mi pique)/ }),
    ).toHaveCount(0);
    await expect(page.getByText("Mi pique")).toHaveCount(2);
  });

  test("a guide has its landmarks: one main, article, aside, figure and the labelled navs", async ({
    page,
  }, testInfo) => {
    await page.goto("/guias/el-subte-explicado");
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(
      page.getByRole("complementary", { name: "Más sobre esta guía" }),
    ).toHaveCount(1);
    await expect(page.getByRole("figure")).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Ruta" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Más guías" }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Más de Moverte por la ciudad" }),
    ).toBeVisible();
    if (testInfo.project.name.includes("desktop")) {
      await expect(
        page.getByRole("navigation", { name: "En esta guía" }),
      ).toBeVisible();
    }
  });

  test("the home is H1, then three H2 and twelve H3", async ({ page }) => {
    await page.goto("/guias");
    const levels = await page.evaluate(() =>
      [...document.querySelectorAll("main h1, main h2, main h3")].map((h) =>
        Number(h.tagName[1]),
      ),
    );
    expect(levels[0]).toBe(1);
    expect(levels.filter((l) => l === 2)).toHaveLength(3);
    expect(levels.filter((l) => l === 3)).toHaveLength(12);
  });
});

/** The size of the region that resolves to `target`, through its centre (as tap-targets.spec.ts). */
async function hitExtent(target: Locator) {
  await target.scrollIntoViewIfNeeded();
  return target.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const hits = (x: number, y: number) =>
      document.elementFromPoint(x, y)?.closest("a, button, summary") === el;
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

test.describe("coarse-pointer targets (AC 43) @feature-guias", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "phone-360",
      "coarse pointer (phone project)",
    );
  });

  test("home cards take taps across 44x44", async ({ page }) => {
    await page.goto("/guias");
    const extent = await hitExtent(
      page.getByRole("link", { name: /West Village/ }),
    );
    expect(extent.height).toBeGreaterThanOrEqual(44);
    expect(extent.width).toBeGreaterThanOrEqual(44);
  });

  test("the summary, the index rows, the 'Más de' rows and the pager cells take taps across 44x44", async ({
    page,
  }) => {
    await page.goto("/guias/el-subte-explicado");
    const summary = page.locator("details > summary", {
      hasText: "En esta guía",
    });
    expect(await hitExtent(summary)).toMatchObject({});
    expect((await hitExtent(summary)).height).toBeGreaterThanOrEqual(44);
    await summary.click();
    const rows = page.locator("details").getByRole("link");
    for (let i = 0; i < (await rows.count()); i++) {
      const extent = await hitExtent(rows.nth(i));
      expect(extent.height, `index row ${i}`).toBeGreaterThanOrEqual(44);
    }
    const more = page
      .getByRole("navigation", { name: "Más de Moverte por la ciudad" })
      .getByRole("link");
    for (let i = 0; i < (await more.count()); i++) {
      const extent = await hitExtent(more.nth(i));
      expect(extent.height, `"Más de" row ${i}`).toBeGreaterThanOrEqual(44);
    }
    const cells = page
      .getByRole("navigation", { name: "Más guías" })
      .getByRole("link");
    for (let i = 0; i < (await cells.count()); i++) {
      const extent = await hitExtent(cells.nth(i));
      expect(extent.height, `pager cell ${i}`).toBeGreaterThanOrEqual(44);
      expect(extent.width, `pager cell ${i}`).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe("the closing button (AC 43) @feature-guias", () => {
  test("is at least 48px tall on every project", async ({ page }) => {
    for (const [path, name] of [
      ["/guias/el-subte-explicado", "Quiero mi itinerario"],
      ["/guias/visa-a-estados-unidos", "Quiero gestionar mi visa"],
    ] as const) {
      await page.goto(path);
      const box = await page.getByRole("link", { name }).boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(48);
    }
  });
});
