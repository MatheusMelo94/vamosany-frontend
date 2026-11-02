import { test, expect, type Locator, type Page } from "@playwright/test";

/**
 * The navbar's Guías menu and the guides' closing CTA (spec AC 4-7, 18;
 * DDR-0012, DDR-0013; release criterion 4-5). Desktop uses the mega-menu
 * (>= 1024), phone and tablet the drawer.
 */

const ITEMS = [
  ["El subte, explicado", "el-subte-explicado"],
  ["Desde el aeropuerto", "desde-el-aeropuerto"],
  ["Caminar por New York", "caminar-por-new-york"],
  ["Cómo moverte por New York", "como-moverte-por-new-york"],
  ["West Village", "west-village"],
  ["Murray Hill", "murray-hill"],
  ["Financial District", "financial-district"],
  ["Williamsburg", "williamsburg"],
  ["Visa a Estados Unidos", "visa-a-estados-unidos"],
  ["Cuánto cuesta un día en New York", "cuanto-cuesta-un-dia-en-new-york"],
  ["Qué llevar según la temporada", "que-llevar-segun-la-temporada"],
  ["Entradas para Broadway", "entradas-para-broadway"],
] as const;

const header = (page: Page) => page.locator("header[data-nav]");
const isDesktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;
const megaPanel = (page: Page) =>
  header(page).locator(".nav-capsule div.rounded-3xl");
const burger = (page: Page) =>
  header(page).getByRole("button", { name: /^(Abrir|Cerrar) menú$/ });
const drawer = (page: Page) =>
  header(page).getByRole("navigation", { name: "Menú" });

async function openMegaMenu(page: Page): Promise<Locator> {
  await header(page)
    .getByRole("button", { name: "Guías", exact: true })
    .hover();
  const panel = megaPanel(page);
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute("data-marker-ready", "");
  return panel;
}

/** Opens the drawer with the Guías group expanded (toggles it only if it is closed). */
async function openDrawerGuias(page: Page): Promise<Locator> {
  await burger(page).click();
  await expect(drawer(page)).toBeVisible();
  const group = drawer(page).getByRole("button", {
    name: "Guías",
    exact: true,
  });
  if ((await group.getAttribute("aria-expanded")) !== "true")
    await group.click();
  await expect(group).toHaveAttribute("aria-expanded", "true");
  return drawer(page);
}

test.describe("Guías menu: navigation @feature-guias", () => {
  test("each of the 12 mega-menu items goes to its guide (AC 4)", async ({
    page,
  }) => {
    test.skip(!isDesktop(page), "mega-menu exists at >= 1024 only");
    for (const [title, slug] of ITEMS) {
      await page.goto("/");
      const panel = await openMegaMenu(page);
      await panel.getByRole("link", { name: new RegExp(`^${title}`) }).click();
      await expect(page).toHaveURL(new RegExp(`/guias/${slug}$`));
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("each of the 12 drawer items goes to its guide and closes the drawer (AC 6)", async ({
    page,
  }) => {
    test.skip(isDesktop(page), "the drawer exists below 1024 only");
    for (const [title, slug] of ITEMS) {
      await page.goto("/");
      const menu = await openDrawerGuias(page);
      await menu.getByRole("link", { name: title, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/guias/${slug}$`));
      await expect(drawer(page)).toHaveCount(0);
    }
  });

  test('"Taxi, Uber o subte" is nowhere in the navbar or the drawer (AC 5)', async ({
    page,
  }) => {
    await page.goto("/");
    if (isDesktop(page)) {
      const panel = await openMegaMenu(page);
      await expect(panel.getByText("Caminar por New York")).toBeVisible();
      await expect(panel.getByText("Taxi, Uber o subte")).toHaveCount(0);
    } else {
      const menu = await openDrawerGuias(page);
      await expect(menu.getByText("Caminar por New York")).toBeVisible();
      await expect(menu.getByText("Taxi, Uber o subte")).toHaveCount(0);
    }
    await expect(page.getByText("Taxi, Uber o subte")).toHaveCount(0);
  });

  test("on /guias/west-village the marker, dot and aria-current sit on West Village with no travel (AC 7)", async ({
    page,
  }) => {
    test.skip(!isDesktop(page), "mega-menu exists at >= 1024 only");
    await page.goto("/guias/west-village");
    const panel = await openMegaMenu(page);
    const current = panel.locator('[data-nav-item][aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toContainText("West Village");
    // no travel: two frames after the panel mounts, the dot already rests on it
    await page.evaluate(
      () =>
        new Promise<void>((r) =>
          requestAnimationFrame(() => requestAnimationFrame(() => r())),
        ),
    );
    const item = await current.boundingBox();
    const dot = await panel.locator("[data-marker-dot]").boundingBox();
    expect(
      Math.abs((dot?.x ?? 0) - ((item?.x ?? 0) + (item?.width ?? 0) - 24)),
    ).toBeLessThanOrEqual(0.5);
    expect(Math.abs((dot?.y ?? 0) - ((item?.y ?? 0) + 15))).toBeLessThanOrEqual(
      0.5,
    );
  });

  test("in the drawer West Village has the static dot and aria-current; the Guías group opens by itself (AC 7)", async ({
    page,
  }) => {
    test.skip(isDesktop(page), "the drawer exists below 1024 only");
    await page.goto("/guias/west-village");
    await burger(page).click();
    await expect(drawer(page)).toBeVisible();
    const group = drawer(page).getByRole("button", {
      name: "Guías",
      exact: true,
    });
    await expect(group).toHaveAttribute("aria-expanded", "true");
    await expect(group.locator("[data-header-dot]")).toBeVisible();
    const current = drawer(page).locator('[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText("West Village");
    await expect(current.locator("[data-current-dot]")).toBeVisible();
  });
});

test.describe('Guías menu: the "Todas las guías →" row (DDR-0013) @feature-guias', () => {
  test("desktop: the last link of the panel, reachable by keyboard, goes to /guias", async ({
    page,
  }) => {
    test.skip(!isDesktop(page), "mega-menu exists at >= 1024 only");
    await page.goto("/");
    const trigger = header(page).getByRole("button", {
      name: "Guías",
      exact: true,
    });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const panel = megaPanel(page);
    await expect(panel).toBeVisible();
    // Tab order: the 12 items, then the row
    for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
    await expect(
      panel.getByRole("link", { name: /^Entradas para Broadway/ }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    const row = panel.getByRole("link", { name: "Todas las guías" });
    await expect(row).toBeFocused();
    await expect(row).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/guias$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      "Todo lo que necesitás para moverte por New York",
    );
  });

  test("desktop: a click on the row goes to /guias, and it is the current page there", async ({
    page,
  }) => {
    test.skip(!isDesktop(page), "mega-menu exists at >= 1024 only");
    await page.goto("/");
    const panel = await openMegaMenu(page);
    await panel.getByRole("link", { name: "Todas las guías" }).click();
    await expect(page).toHaveURL(/\/guias$/);
    const again = await openMegaMenu(page);
    await expect(
      again.getByRole("link", { name: "Todas las guías" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("drawer: the last row of the Guías group goes to /guias and closes the drawer", async ({
    page,
  }) => {
    test.skip(isDesktop(page), "the drawer exists below 1024 only");
    await page.goto("/");
    const menu = await openDrawerGuias(page);
    const row = menu.getByRole("link", { name: "Todas las guías" });
    await row.scrollIntoViewIfNeeded();
    await expect(row).toBeVisible();
    const box = await row.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    await row.click();
    await expect(page).toHaveURL(/\/guias$/);
    await expect(drawer(page)).toHaveCount(0);
  });

  test("drawer: on /guias the row is current and opens the group by itself", async ({
    page,
  }) => {
    test.skip(isDesktop(page), "the drawer exists below 1024 only");
    await page.goto("/guias");
    await burger(page).click();
    await expect(drawer(page)).toBeVisible();
    await expect(
      drawer(page).getByRole("button", { name: "Guías", exact: true }),
    ).toHaveAttribute("aria-expanded", "true");
    const current = drawer(page).locator('[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAttribute("href", "/guias");
  });
});

test.describe("closing CTA reaches the Servicios section (AC 18, release criterion 5) @feature-guias", () => {
  const services = (page: Page) => page.locator("#services");

  test("a client navigation from a guide lands on #services, in view", async ({
    page,
  }) => {
    await page.goto("/guias/el-subte-explicado");
    // after hydration, so the click is a client-side navigation
    await expect(page.locator("html")).toHaveClass(/gsap/);
    await page.waitForLoadState("networkidle");
    await page.getByRole("link", { name: "Quiero mi itinerario" }).click();
    await expect(page).toHaveURL(/\/#services$/);
    await expect(services(page)).toBeInViewport({ timeout: 15_000 });
  });

  test.describe("a full load of /#services", () => {
    test.describe("with motion off (reduced motion)", () => {
      test.use({ reducedMotion: "reduce" });

      test("lands on the section", async ({ page }) => {
        await page.goto("/#services");
        await expect(services(page)).toBeInViewport({ timeout: 15_000 });
      });
    });

    test.describe("without JavaScript", () => {
      test.use({ javaScriptEnabled: false });

      test("lands on the section", async ({ page }) => {
        await page.goto("/#services");
        await expect(services(page)).toBeInViewport();
      });
    });

    // KNOWN LANDING ISSUE, found while verifying this feature and left
    // untouched (not caused by it; the landing is frozen, ADR-0006): with
    // motion ON, the landing's ScrollTrigger layout grows the page after the
    // browser has jumped to the hash, so a direct load of `/#services` (a new
    // tab, a shared link) often ends short of the section (it is flaky at 768,
    // so it is not asserted here). The guides' CTA is a client navigation and
    // is unaffected (the test above). Reported to the user for a decision.
  });

  test("the Visa guide's button goes to the same place", async ({ page }) => {
    await page.goto("/guias/visa-a-estados-unidos");
    await page.waitForLoadState("networkidle");
    await page.getByRole("link", { name: "Quiero gestionar mi visa" }).click();
    await expect(page).toHaveURL(/\/#services$/);
    await expect(services(page)).toBeInViewport({ timeout: 15_000 });
  });
});
