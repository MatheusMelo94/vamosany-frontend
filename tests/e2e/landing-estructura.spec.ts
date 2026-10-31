import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { waitForGsapIdle, waitForMotionToSettle } from "./support/motion";

/**
 * DDR-0008 acceptance reference (no formal spec): new landing order, removed
 * sections, "Mis recomendados" tabs, stats end values, Spanish-only copy.
 * Condition-based waits only. Synthetic data only.
 */

const TAG = "@feature-landing-estructura-nueva";

const scrollToEnd = async (page: Page) => {
  await page.evaluate(async () => {
    const frame = () => new Promise((r) => requestAnimationFrame(r));
    for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) {
      window.scrollTo(0, y);
      await frame();
      await frame();
    }
  });
  await waitForGsapIdle(page);
};

const tabs = (page: Page) =>
  page.getByRole("tablist", { name: "Categorías de recomendados" });

async function openRecommendations(page: Page) {
  await page.goto("/");
  await page.locator("#recomendados").scrollIntoViewIfNeeded();
  await expect(tabs(page)).toBeVisible();
}

for (const motion of ["no-preference", "reduce"] as const) {
  test.describe(`landing structure, motion ${motion} ${TAG}`, () => {
    test.use({ reducedMotion: motion });

    test("sections in the DDR-0008 order; removed sections are gone", async ({
      page,
    }) => {
      await page.goto("/");
      const body = page.locator("main");
      const headings = await body.locator("h1, h2").allInnerTexts();
      const text = headings.join(" | ").replace(/\s+/g, " ");
      const order = [
        "Servicios",
        "Mis recomendados",
        "Lo que dicen mis viajeros",
        "Tu próximo viaje a New York empieza acá",
      ];
      const positions = await Promise.all(
        [
          "#services, section:has(h2:has-text('Tres formas de viajar conmigo'))",
          "#recomendados",
          "section:has(h2:has-text('Lo que dicen mis viajeros'))",
          "#newsletter",
        ].map((sel) =>
          page
            .locator(sel)
            .first()
            .evaluate((el) => el.getBoundingClientRect().top + scrollY),
        ),
      );
      expect([...positions].sort((a, b) => a - b)).toEqual(positions);
      for (const gone of [
        "This is what a day looks like",
        "Written on foot, twice a year",
        "Everything in the file",
        "Planning takes one evening",
      ])
        expect(text).not.toContain(gone);
      await expect(page.locator("#recomendados")).toContainText(order[1], {
        ignoreCase: true,
      });
      expect(text.toLowerCase()).toContain(
        "lo que no puede faltar en tu viaje",
      );
    });

    test("stats end at +200, +20 and +1.000 km (DDR-0008 §5)", async ({
      page,
    }) => {
      await page.goto("/");
      await page.locator("[data-count]").first().scrollIntoViewIfNeeded();
      await scrollToEnd(page);
      await waitForMotionToSettle(page);
      const values = await page
        .locator("[data-count]")
        .evaluateAll((els) => els.map((e) => e.textContent?.trim()));
      // "es" formats 1000 as "1000" (no grouping under 5 digits in CLDR es)
      expect(values).toEqual(["+200", "+20", "+1000 km"]);
    });

    test("every recommendations tab shows its cards (AC DDR-0008 §4)", async ({
      page,
    }) => {
      // QA-0010 (fixed): the panel, not each card, carries the reveal, so the
      // cards of a tab opened later are visible with motion on.
      await openRecommendations(page);
      const counts: Record<string, number> = {
        "Pases y atracciones": 3,
        Broadway: 2,
        Internet: 1,
      };
      for (const [name, n] of Object.entries(counts)) {
        await tabs(page).getByRole("tab", { name }).click();
        await waitForGsapIdle(page);
        const cards = page.locator("#recomendados [role=tabpanel] article");
        await expect(cards).toHaveCount(n);
        for (let i = 0; i < n; i++) await expect(cards.nth(i)).toBeVisible();
        const opacities = await cards.evaluateAll((els) =>
          els.map((e) => getComputedStyle(e.parentElement!).opacity),
        );
        expect(opacities, `${name} cards must be opaque`).toEqual(
          Array(n).fill("1"),
        );
      }
    });
  });
}

test.describe(`Mis recomendados tabs ${TAG}`, () => {
  test("WAI-ARIA keyboard: roving tabindex, arrows wrap, Home/End, one tab stop", async ({
    page,
  }) => {
    await openRecommendations(page);
    const tab = (n: string) => tabs(page).getByRole("tab", { name: n });
    await expect(tab("Pases y atracciones")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(tab("Broadway")).toHaveAttribute("tabindex", "-1");
    await tab("Pases y atracciones").focus();
    await page.keyboard.press("ArrowRight");
    await expect(tab("Broadway")).toBeFocused();
    await expect(tab("Broadway")).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("End");
    await expect(tab("Internet")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(tab("Pases y atracciones")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(tab("Internet")).toBeFocused();
    await page.keyboard.press("Home");
    await expect(tab("Pases y atracciones")).toBeFocused();
    // Tab leaves the tablist into the panel (first focusable card button).
    await page.keyboard.press("Tab");
    await expect(
      page.locator("#recomendados [role=tabpanel] button").first(),
    ).toBeFocused();
    // The panel is labelled by the selected tab.
    const labelled = await page
      .locator("#recomendados [role=tabpanel]")
      .getAttribute("aria-labelledby");
    await expect(page.locator(`[id="${labelled}"]`)).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("axe: no critical/serious violations in the section (all tabs)", async ({
    page,
  }) => {
    // color-contrast is tracked as QA-0011 (ink-tertiary token, 2.2-2.4:1).
    await openRecommendations(page);
    for (const name of ["Pases y atracciones", "Broadway", "Internet"]) {
      await tabs(page).getByRole("tab", { name }).click();
      await waitForMotionToSettle(page);
      const r = await new AxeBuilder({ page })
        .include("#recomendados")
        .disableRules(["color-contrast"])
        .analyze();
      expect(
        r.violations
          .filter((v) => ["serious", "critical"].includes(v.impact ?? ""))
          .map(
            (v) =>
              `${name}: ${v.id} ${v.nodes.map((n) => n.target.join(" ") + " " + (n.any[0]?.message ?? "")).join("; ")}`,
          ),
      ).toEqual([]);
    }
  });

  test("no horizontal overflow at the viewport of record", async ({ page }) => {
    await openRecommendations(page);
    for (const name of ["Pases y atracciones", "Broadway", "Internet"]) {
      await tabs(page).getByRole("tab", { name }).click();
      const o = await page.evaluate(() => ({
        doc: document.documentElement.scrollWidth - innerWidth,
        sec:
          (document.querySelector("#recomendados") as HTMLElement).scrollWidth -
          (document.querySelector("#recomendados") as HTMLElement).clientWidth,
      }));
      expect(o.doc, name).toBeLessThanOrEqual(0);
      expect(o.sec, name).toBeLessThanOrEqual(0);
    }
  });
});

test.describe(`Mis recomendados contrast ${TAG}`, () => {
  test("text meets 4.5:1 (WCAG 1.4.3), eyebrows aside", async ({ page }) => {
    await openRecommendations(page);
    await waitForMotionToSettle(page);
    const r = await new AxeBuilder({ page })
      .include("#recomendados")
      .exclude("#recomendados .eyebrow")
      .withRules(["color-contrast"])
      .analyze();
    expect(r.violations).toEqual([]);
  });

  test("eyebrows meet 4.5:1 (WCAG 1.4.3)", async ({ page }) => {
    // QA-0011: `.eyebrow` uses --color-ink-tertiary (#a8a8a4, ~2.3:1) on every
    // section of the site. Changing the token is a design decision (DDR, ADR-0006).
    test.fixme(true, "QA-0011: site-wide eyebrow token, pending DDR");
    await openRecommendations(page);
    await waitForMotionToSettle(page);
    const r = await new AxeBuilder({ page })
      .include("#recomendados .eyebrow")
      .withRules(["color-contrast"])
      .analyze();
    expect(r.violations).toEqual([]);
  });
});

test.describe(`navbar and reviews ${TAG}`, () => {
  test("desktop nav has the 4 groups of DDR-0008 (Guías, Blog, Servicios, Sobre mí)", async ({
    page,
  }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1024, "drawer below 1024");
    await page.goto("/");
    const bar = page.locator("header[data-nav] div.hidden.lg\\:flex");
    for (const label of ["Guías", "Blog", "Servicios", "Sobre mí"])
      await expect(bar.getByText(label, { exact: true }).first()).toBeVisible();
  });

  test("reviews: the arrow buttons scroll the carousel and it holds 10 reseñas", async ({
    page,
  }) => {
    await page.goto("/");
    const next = page.getByRole("button", { name: "Reseñas siguientes" });
    await next.scrollIntoViewIfNeeded();
    await expect(page.locator("section figure")).toHaveCount(10);
    const scroller = page.locator("section figure").first().locator("..");
    // Retry the click: right after load the handler may not be hydrated yet.
    await expect(async () => {
      await next.click();
      expect(await scroller.evaluate((e) => e.scrollLeft)).toBeGreaterThan(0);
    }).toPass({ timeout: 10_000 });
  });
});
