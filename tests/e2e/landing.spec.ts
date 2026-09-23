import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Violacoes conhecidas no design congelado (ADR-0006). Nao sao corrigidas aqui:
 * viram DDR/issue. Qualquer violacao serious/critical fora desta lista falha o teste.
 * - color-contrast: legendas do footer em text-white/45 sobre bg-ink dao 4.48:1 (minimo 4.5:1).
 * - scrollable-region-focusable: o carrossel de reviews (.snap-x) rola mas nao recebe foco de teclado (T-24).
 */
const KNOWN_A11Y = new Set(["color-contrast", "scrollable-region-focusable"]);

/**
 * Blocos com loop infinito (GSAP: anel do hero e marquee de bairros). O anel gira em 3D e
 * extravasa a propria caixa, entao mascaramos o container inteiro. A fidelidade pixel a
 * pixel dessas areas e coberta pelo baseline com reduced-motion.
 */
const LOOPING = (page: Page) => [
  page.locator("section:has([data-ring]), div:has(> [data-ring])").first(),
  page
    .locator("[data-marquee]")
    .locator("xpath=ancestor::*[self::section or self::div][1]"),
];

/** Rola a pagina inteira para disparar todos os ScrollTriggers e volta ao topo. */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
}

test.describe("landing", () => {
  test("renders and has no unknown serious accessibility violations", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (v) =>
        (v.impact === "serious" || v.impact === "critical") &&
        !KNOWN_A11Y.has(v.id),
    );
    expect(
      serious.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
      ),
    ).toEqual([]);
  });

  test("baseline: idle, motion enabled", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot("idle-motion.png", {
      mask: LOOPING(page),
      animations: "disabled",
    });
  });

  test("baseline: after full scroll, motion enabled", async ({ page }) => {
    await page.goto("/");
    await scrollThrough(page);
    await expect(page).toHaveScreenshot("scrolled-motion.png", {
      fullPage: true,
      mask: LOOPING(page),
      animations: "disabled",
    });
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("every reveal target is visible without animation", async ({
      page,
    }) => {
      await page.goto("/");
      await expect(page.locator("html")).not.toHaveClass(/gsap/);
      const hidden = await page
        .locator("[data-reveal]")
        .evaluateAll(
          (els) =>
            els.filter((el) => getComputedStyle(el).opacity !== "1").length,
        );
      expect(hidden).toBe(0);
    });

    test("baseline: full page, reduced motion", async ({ page }) => {
      await page.goto("/");
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot("full-reduced-motion.png", {
        fullPage: true,
        animations: "disabled",
      });
    });
  });
});
