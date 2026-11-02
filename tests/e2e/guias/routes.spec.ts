import { test, expect } from "@playwright/test";

/**
 * Route-level behavior of the 12 guide pages (spec AC 1, 3, 13-16, 18, 19, 24,
 * 33, 36). Async Server Components, the 404 status, `generateStaticParams` and
 * the container-query layout only exist at route level (plan § 14).
 */

type GuideRoute = {
  slug: string;
  title: string;
  menuTitle: string;
  group: string;
  facts: boolean;
};

const MOVERTE = "Moverte por la ciudad";
const BARRIOS = "Barrios";
const ANTES = "Antes de viajar";
const ROUTES: GuideRoute[] = [
  {
    slug: "el-subte-explicado",
    title: "El subte, explicado",
    menuTitle: "El subte, explicado",
    group: MOVERTE,
    facts: true,
  },
  {
    slug: "desde-el-aeropuerto",
    title: "Desde el aeropuerto",
    menuTitle: "Desde el aeropuerto",
    group: MOVERTE,
    facts: true,
  },
  {
    slug: "caminar-por-new-york",
    title: "Caminar por New York",
    menuTitle: "Caminar por New York",
    group: MOVERTE,
    facts: true,
  },
  {
    slug: "como-moverte-por-new-york",
    title: "Cómo moverte por New York",
    menuTitle: "Cómo moverte por New York",
    group: MOVERTE,
    facts: true,
  },
  {
    slug: "west-village",
    title: "West Village",
    menuTitle: "West Village",
    group: BARRIOS,
    facts: false,
  },
  {
    slug: "murray-hill",
    title: "Murray Hill",
    menuTitle: "Murray Hill",
    group: BARRIOS,
    facts: false,
  },
  {
    slug: "financial-district",
    title: "Financial District",
    menuTitle: "Financial District",
    group: BARRIOS,
    facts: false,
  },
  {
    slug: "williamsburg",
    title: "Williamsburg",
    menuTitle: "Williamsburg",
    group: BARRIOS,
    facts: false,
  },
  {
    slug: "visa-a-estados-unidos",
    title: "Visa o ESTA: qué necesitás para viajar a Estados Unidos",
    menuTitle: "Visa a Estados Unidos",
    group: ANTES,
    facts: true,
  },
  {
    slug: "cuanto-cuesta-un-dia-en-new-york",
    title: "Cuánto cuesta un día en New York",
    menuTitle: "Cuánto cuesta un día en New York",
    group: ANTES,
    facts: true,
  },
  {
    slug: "que-llevar-segun-la-temporada",
    title: "Qué llevar según la temporada",
    menuTitle: "Qué llevar según la temporada",
    group: ANTES,
    facts: true,
  },
  {
    slug: "entradas-para-broadway",
    title: "Entradas para Broadway",
    menuTitle: "Entradas para Broadway",
    group: ANTES,
    facts: true,
  },
];

test.describe("guide pages @feature-guias", () => {
  for (const route of ROUTES) {
    test(`/guias/${route.slug} renders the full template`, async ({ page }) => {
      const response = await page.goto(`/guias/${route.slug}`);
      expect(response?.status()).toBe(200);

      // one H1 equal to the page title (AC 3)
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toHaveCount(1);
      await expect(h1).toHaveAccessibleName(route.title);
      await expect(page).toHaveTitle(`${route.title} — Vamos a NY`);

      // hero with its credit directly under it (AC 14)
      const figure = page.getByRole("figure");
      await expect(figure.getByRole("img")).toBeVisible();
      await expect(figure.locator("figcaption")).toHaveText(/^Foto: .+/);

      // key facts on exactly 8 guides (AC 16)
      await expect(
        page.getByRole("list", { name: /^Datos clave/ }),
      ).toHaveCount(route.facts ? 1 : 0);

      // closing band (AC 18) and pager (AC 19)
      const itinerary = page.getByRole("link", {
        name:
          route.slug === "visa-a-estados-unidos"
            ? "Quiero gestionar mi visa"
            : "Quiero mi itinerario",
      });
      await expect(itinerary).toHaveAttribute("href", "/#services");
      const pager = page.getByRole("navigation", { name: "Más guías" });
      await expect(
        pager.getByRole("link", { name: /Todas las guías/ }),
      ).toHaveAttribute("href", "/guias");

      // breadcrumb (AC 13)
      const crumb = page.getByRole("navigation", { name: "Ruta" });
      await expect(crumb.getByRole("link", { name: "Guías" })).toHaveAttribute(
        "href",
        "/guias",
      );
      await expect(
        crumb.getByRole("link", { name: route.group }),
      ).toBeVisible();
    });
  }

  test("pager 'Siguiente' follows the menu order, and the last guide has none (AC 19)", async ({
    page,
  }) => {
    await page.goto("/guias/williamsburg");
    const next = page
      .getByRole("navigation", { name: "Más guías" })
      .getByRole("link", { name: /Siguiente guía/ });
    await expect(next).toHaveAttribute("href", "/guias/visa-a-estados-unidos");
    await expect(next).toContainText("Visa a Estados Unidos");

    await page.goto("/guias/entradas-para-broadway");
    const pager = page.getByRole("navigation", { name: "Más guías" });
    await expect(pager.getByRole("link")).toHaveCount(1);
  });

  test("an unknown slug is a 404 with noindex (AC 1, 33)", async ({ page }) => {
    const response = await page.goto("/guias/nope");
    expect(response?.status()).toBe(404);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });

  test("DOM order is breadcrumb, eyebrow, H1, dek, hero, article, aside (AC 13)", async ({
    page,
  }) => {
    await page.goto("/guias/el-subte-explicado");
    const order = await page.evaluate(() => {
      const pick = (selector: string) => document.querySelector(selector);
      const els = [
        pick('main nav[aria-label="Ruta"]'),
        pick("main [data-sm-label], main header p"),
        pick("main h1"),
        pick("main [data-sm-dek]"),
        pick("main figure"),
        pick("main article"),
        pick("main aside"),
      ];
      return els.map((el, i) =>
        i === 0 || !el || !els[i - 1]
          ? Boolean(el)
          : Boolean(
              (els[i - 1] as Element).compareDocumentPosition(el) &
              Node.DOCUMENT_POSITION_FOLLOWING,
            ),
      );
    });
    expect(order).toEqual([true, true, true, true, true, true, true]);
  });

  test("exposes only one 'En esta guía' index per viewport width (AC 24)", async ({
    page,
    viewport,
  }) => {
    await page.goto("/guias/el-subte-explicado");
    const aside = page.getByRole("navigation", { name: "En esta guía" });
    const summary = page.locator("details > summary", {
      hasText: "En esta guía",
    });
    if ((viewport?.width ?? 0) >= 961) {
      await expect(aside).toBeVisible();
      await expect(summary).toBeHidden();
    } else {
      await expect(aside).toBeHidden();
      await expect(summary).toBeVisible();
    }
  });

  test("is complete in the raw HTML, before any JavaScript runs (AC 36)", async ({
    request,
  }) => {
    const response = await request.get("/guias/el-subte-explicado");
    const html = await response.text();
    for (const text of [
      "El subte, explicado",
      "Leé el mapa como una local.",
      "Datos clave",
      "USD 35",
      "El tope semanal",
      "Quiero mi itinerario",
      "Foto: Subte de Union Square — TLK in 3, CC BY-SA 3.0",
      "Siguiente guía",
    ]) {
      expect(html, text).toContain(text);
    }
    expect(html).toContain('href="#tope"');
    expect(html).not.toContain("aria-current=");
  });

  test("canonical and Open Graph article data point at the guide (AC 33)", async ({
    page,
  }) => {
    await page.goto("/guias/west-village");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/guias\/west-village$/,
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      "content",
      "article",
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /\/img\/trip-soho\.webp$/,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Calles arboladas, brownstones y cafés con encanto.",
    );
  });
});
