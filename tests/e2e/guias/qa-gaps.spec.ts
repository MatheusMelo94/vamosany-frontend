import { test, expect } from "@playwright/test";

/**
 * QA pass gaps (Test Pass 2026-11-02): checks the other guias specs leave
 * implicit. Photos really decode (not just "visible"), every internal link on
 * every page resolves, the hero credit matches the footer's list, and the
 * footer swap of AC 5 holds on the rendered site.
 */

const SLUGS = [
  "el-subte-explicado",
  "desde-el-aeropuerto",
  "caminar-por-new-york",
  "como-moverte-por-new-york",
  "west-village",
  "murray-hill",
  "financial-district",
  "williamsburg",
  "visa-a-estados-unidos",
  "cuanto-cuesta-un-dia-en-new-york",
  "que-llevar-segun-la-temporada",
  "entradas-para-broadway",
];
const PATHS = ["/guias", ...SLUGS.map((s) => `/guias/${s}`)];

test.describe("QA gaps @feature-guias", () => {
  for (const path of PATHS) {
    test(`${path}: every image decodes, the hero has alt and a credit (AC 14, 29, 31)`, async ({
      page,
    }) => {
      await page.goto(path);
      // force lazy images to load before asserting
      await page.evaluate(async () => {
        const imgs = Array.from(document.querySelectorAll("main img"));
        imgs.forEach((i) => ((i as HTMLImageElement).loading = "eager"));
        await Promise.all(
          imgs.map((i) => (i as HTMLImageElement).decode().catch(() => null)),
        );
      });
      const state = await page.evaluate(() =>
        Array.from(document.querySelectorAll("main img")).map((i) => {
          const img = i as HTMLImageElement;
          return {
            src: img.currentSrc,
            ok: img.complete && img.naturalWidth > 0,
            alt: img.getAttribute("alt"),
            figure: !!img.closest("figure"),
          };
        }),
      );
      expect(state.length).toBeGreaterThan(0);
      for (const s of state) expect(s.ok, `image failed: ${s.src}`).toBe(true);
      if (path !== "/guias") {
        const hero = state.find((s) => s.figure)!;
        expect(hero.alt, "hero alt").toBeTruthy();
        const credit = page.getByRole("figure").locator("figcaption");
        await expect(credit).toBeVisible();
        expect((await credit.innerText()).trim().length).toBeGreaterThan(8);
      } else {
        expect(state.length).toBe(12);
        for (const s of state) expect(s.alt).toBe("");
      }
    });

    test(`${path}: every internal link in the page resolves (AC 13, 19, 20)`, async ({
      page,
      request,
    }) => {
      await page.goto(path);
      const hrefs = await page.evaluate(() =>
        Array.from(document.querySelectorAll("a[href]"))
          .map((a) => a.getAttribute("href") as string)
          .filter((h) => h.startsWith("/") && !h.startsWith("//")),
      );
      const targets = new Set(hrefs.map((h) => h.split("#")[0] || "/"));
      for (const t of targets) {
        const res = await request.get(t);
        expect(res.status(), `${path} -> ${t}`).toBe(200);
      }
      // in-page anchors inside <main> exist (the navbar's #login/#signup are frozen placeholders)
      const anchors = await page.evaluate(() =>
        Array.from(document.querySelectorAll("main a[href^='#']"))
          .map((a) => (a.getAttribute("href") as string).slice(1))
          .filter((id) => id && !document.getElementById(id)),
      );
      expect(anchors, "dangling in-page anchors").toEqual([]);
    });
  }

  test("a Wikimedia hero credit is listed in the footer, character for character (AC 14, 30)", async ({
    page,
  }) => {
    // Subte guide uses a Wikimedia photo on the footer's list.
    const missing: string[] = [];
    for (const slug of SLUGS) {
      await page.goto(`/guias/${slug}`);
      const credit = (
        await page.getByRole("figure").locator("figcaption").innerText()
      ).trim();
      if (/Vamos a NY$/.test(credit)) continue;
      const footer = await page
        .locator("footer details")
        .evaluate((d) => d.textContent ?? "");
      const m = credit.match(/^Foto: (.+?)(?:, (CC[^,]*|Dominio público))?$/);
      const body = (m?.[1] ?? credit).replace(/^Foto: /, "");
      if (!footer.includes(body)) missing.push(`${slug}: "${credit}"`);
    }
    expect(missing).toEqual([]);
  });

  test("the footer says 'Caminar por New York', links the guides and never 'Taxi, Uber o subte' (AC 5)", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.getByText("Taxi, Uber o subte")).toHaveCount(0);
    await expect(
      footer.getByRole("link", { name: "Caminar por New York" }),
    ).toHaveAttribute("href", "/guias/caminar-por-new-york");
    await expect(
      footer.getByRole("link", { name: "Visa a Estados Unidos" }),
    ).toHaveAttribute("href", "/guias/visa-a-estados-unidos");
    for (const l of [
      "El subte, explicado",
      "Desde el aeropuerto",
      "Cómo moverte por New York",
      "Cuánto cuesta un día en New York",
      "Qué llevar según la temporada",
      "Entradas para Broadway",
    ]) {
      await expect(footer.getByRole("link", { name: l })).toHaveAttribute(
        "href",
        /^\/guias\/[a-z-]+$/,
      );
    }
  });
});
