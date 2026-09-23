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
  // Reveals, contadores (1.2 s) e o pin do overscroll precisam terminar antes da captura.
  await page.waitForTimeout(3000);
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

  test("baseline: viewport at 25/50/75/100% after a full scroll, motion enabled", async ({
    page,
  }) => {
    // Sem fullPage: a captura de pagina inteira redimensiona a viewport, o ScrollTrigger
    // recalcula os pins do overscroll e a pagina nunca estabiliza. Capturas de viewport em
    // posicoes fixas sao deterministas (scrub imediato, reveals once ja disparados).
    await page.goto("/");
    await scrollThrough(page);
    for (const fraction of [0.25, 0.5, 0.75, 1]) {
      await page.evaluate((f) => {
        window.scrollTo(
          0,
          Math.round((document.body.scrollHeight - window.innerHeight) * f),
        );
      }, fraction);
      await page.waitForTimeout(800);
      await expect(page).toHaveScreenshot(
        `scrolled-${Math.round(fraction * 100)}.png`,
        {
          mask: LOOPING(page),
          animations: "disabled",
        },
      );
    }
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
