import { test, expect, type Page } from "@playwright/test";

/**
 * Typefaces of record (DDR-0005): Montserrat for body text, Courier Prime for
 * display. next/font hashes family names ("__Montserrat_1a2b3c"), so the
 * checks match the family by name, not the exact string.
 */

const ROUTES = [
  "/",
  "/sobre-mi",
  "/colaboraciones",
  "/trabaja-conmigo",
  "/contacto",
  "/preguntas-frecuentes",
] as const;

/** DDR-0005 risk points are checked at these widths (320 for the hero). */
const WIDTHS = [320, 360, 768, 1280] as const;

/** First family of an element's computed font-family, unquoted. */
async function primaryFamily(page: Page, selector: string): Promise<string> {
  return page
    .locator(selector)
    .first()
    .evaluate(
      (el) =>
        getComputedStyle(el)
          .fontFamily.split(",")[0]
          ?.trim()
          .replace(/^["']|["']$/g, "") ?? "",
    );
}

test.describe("typefaces (DDR-0005) @feature-typography", () => {
  // A body-face paragraph per route: the hero subtitle, a prose paragraph.
  for (const [path, bodySelector] of [
    ["/", "[data-hero-quote]"],
    ["/sobre-mi", "main p.body-prose"],
  ] as const) {
    test(`${path}: body text resolves to a loaded Montserrat, display to Courier Prime`, async ({
      page,
    }) => {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);

      const body = await primaryFamily(page, bodySelector);
      expect(body).toMatch(/Montserrat/);
      expect(await primaryFamily(page, "h1")).toMatch(/Courier[_ ]Prime/);

      // The face is actually loaded (not a fallback), and one variable file
      // covers every weight the code uses: 400, 600, 700 (DDR-0005 § 3-4).
      const weights = await page.evaluate((family) => {
        return [...document.fonts]
          .filter(
            (f) =>
              f.family.replace(/^["']|["']$/g, "") === family &&
              f.status === "loaded" &&
              f.style === "normal",
          )
          .map((f) => f.weight);
      }, body);
      expect(weights.length).toBeGreaterThan(0);
      const [min, max] = (weights[0] ?? "").split(" ").map(Number);
      expect(min).toBeLessThanOrEqual(400);
      expect(max ?? min).toBeGreaterThanOrEqual(700);
    });
  }
});

test.describe("layout under Montserrat (DDR-0005 risk points) @feature-typography", () => {
  // Widths are set per test; one project is enough.
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-1280",
      "viewport widths are driven inside the test",
    );
  });

  test("no route scrolls horizontally at 320, 360, 768 or 1280", async ({
    page,
  }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 800 });
      for (const path of ROUTES) {
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow, `${path} at ${width}px`).toBe(0);
      }
    }
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("hero: no line holds a single word at any width (DDR-0001)", async ({
      page,
    }) => {
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto("/");
        await page.evaluate(() => document.fonts.ready);
        for (const selector of ["h1", "[data-hero-quote]"]) {
          const lines = await page
            .locator(selector)
            .first()
            .evaluate((el) => {
              // Group each word by the vertical centre of its box.
              const rows: { y: number; words: string[] }[] = [];
              const walker = document.createTreeWalker(
                el,
                NodeFilter.SHOW_TEXT,
              );
              for (let n = walker.nextNode(); n; n = walker.nextNode()) {
                const text = n.textContent ?? "";
                for (const m of text.matchAll(/\S+/g)) {
                  const range = document.createRange();
                  range.setStart(n, m.index);
                  range.setEnd(n, m.index + m[0].length);
                  const r = range.getBoundingClientRect();
                  const y = r.top + r.height / 2;
                  const row = rows.find(
                    (l) => Math.abs(l.y - y) < r.height / 2,
                  );
                  if (row) row.words.push(m[0]);
                  else rows.push({ y, words: [m[0]] });
                }
              }
              return rows.map((r) => r.words.join(" "));
            });
          for (const line of lines) {
            expect(
              line.split(" ").length,
              `${selector} at ${width}px: "${line}" (lines: ${JSON.stringify(lines)})`,
            ).toBeGreaterThan(1);
          }
        }
      }
    });
  });
});
