import { test, expect, type Locator, type Page } from "@playwright/test";

/**
 * Visual contracts the RTL tests used to pin as Tailwind class names
 * (RV-0008): asserted here as computed styles, so a harmless refactor
 * (tokenizing a class) keeps them green and a broken style turns them red.
 * Width-independent, so one viewport; reduced motion, so nothing is
 * mid-reveal. The notes column (200 px beside main at 1280, above it when
 * narrow) is covered in structure.spec.ts (AC 18). Synthetic values only.
 */

test.use({ reducedMotion: "reduce" });
test.beforeEach(({ page }) => {
  test.skip(page.viewportSize()?.width !== 1280, "width-independent styles");
});

/** What `property: value` computes to in this page (tokens resolved). */
const resolve = (page: Page, property: string, value: string) =>
  page.evaluate(
    ([p, v]) => {
      const probe = document.createElement("div");
      probe.style.setProperty(p, v);
      document.body.append(probe);
      const out = getComputedStyle(probe).getPropertyValue(p);
      probe.remove();
      return out;
    },
    [property, value] as const,
  );

const css = (locator: Locator, property: string) =>
  locator.evaluate(
    (el, p) => getComputedStyle(el).getPropertyValue(p),
    property,
  );

const weight = async (locator: Locator) =>
  Number(await css(locator, "font-weight"));

test.describe("Sobre mí visual contracts (RV-0008) @feature-sobre-mi", () => {
  test("the first note reads bold in ink; the rest are lighter", async ({
    page,
  }) => {
    await page.goto("/sobre-mi");
    const notes = page.locator("main [data-sm-notes]").first().locator("> *");
    const ink = await resolve(page, "color", "var(--color-ink)");
    expect(await weight(notes.nth(0))).toBeGreaterThanOrEqual(700);
    expect(await css(notes.nth(0), "color")).toBe(ink);
    expect(await weight(notes.nth(1))).toBeLessThan(700);
  });

  test("the heading's visual line carries the highlighter band", async ({
    page,
  }) => {
    await page.goto("/sobre-mi");
    const visual = page.locator("main [data-sm-train]");
    expect(await css(visual, "background-image")).toMatch(/linear-gradient/);
    expect((await css(visual, "--train")).trim()).toBe("0%");
  });

  test("the closing row sits between 2px ink rules; primary is yellow, secondary outline", async ({
    page,
  }) => {
    await page.goto("/colaboraciones");
    const closing = page.locator("main [data-sm-closing]");
    const ink = await resolve(page, "color", "var(--color-ink)");
    const brand = await resolve(page, "background-color", "var(--color-brand)");
    const rule = await closing.evaluate((row) => {
      // The rules are on the row or its first bordered descendant.
      const bordered = [row, ...row.querySelectorAll("*")].find(
        (el) => getComputedStyle(el).borderTopWidth === "2px",
      );
      if (!bordered) return null;
      const s = getComputedStyle(bordered);
      return {
        top: s.borderTopWidth,
        bottom: s.borderBottomWidth,
        color: s.borderTopColor,
      };
    });
    expect(rule).toEqual({ top: "2px", bottom: "2px", color: ink });
    // The two action slots (the supporting text can hold its own link).
    const actions = closing.locator("span[data-sm-closing-item] > a");
    await expect(actions).toHaveCount(2);
    const [primary, secondary] = [actions.nth(0), actions.nth(1)];
    expect(await css(primary, "background-color")).toBe(brand);
    expect(await css(secondary, "background-color")).toBe("rgba(0, 0, 0, 0)");
  });

  test("an invalid field shows the brand error bar; a valid one doesn't; the button is at least 220px", async ({
    page,
  }) => {
    await page.goto("/contacto");
    const button = page.getByRole("button", { name: "Enviar mensaje" });
    await expect(button).toHaveAttribute("type", "submit");
    expect((await button.boundingBox())!.width).toBeGreaterThanOrEqual(220);
    await button.click();
    const main = page.locator("main");
    const invalid = main.getByLabel("Nombre", { exact: true });
    const optional = main.getByLabel("¿Cuándo viajás? (opcional)", {
      exact: true,
    });
    await expect(invalid).toHaveAttribute("aria-invalid", "true");
    const brand = await resolve(page, "color", "var(--color-brand)");
    const bar = await css(invalid, "box-shadow");
    expect(bar).toContain(brand);
    expect(bar).toMatch(/0px -3px 0px 0px inset|inset 0px -3px 0px 0px/);
    expect(await css(optional, "box-shadow")).toBe("none");
  });

  test("the not-configured banner has a 2px ink border and a bold mono address", async ({
    page,
  }) => {
    await page.goto("/contacto");
    const main = page.locator("main");
    await expect(
      page.getByRole("button", { name: "Enviar mensaje" }),
    ).toHaveAttribute("type", "submit");
    await main.getByLabel("Nombre", { exact: true }).fill("Persona 7f3a");
    await main
      .getByLabel("Email", { exact: true })
      .fill("sintetico-7f3a@ejemplo.test");
    await main
      .getByLabel("¿Sobre qué me escribís?", { exact: true })
      .selectOption("consultoria");
    await main.getByLabel("Mensaje", { exact: true }).fill("mensaje-7f3a");
    await page.getByRole("button", { name: "Enviar mensaje" }).click();
    const banner = page.getByRole("status");
    await expect(banner).toBeFocused();
    const ink = await resolve(page, "color", "var(--color-ink)");
    const mono = await resolve(page, "font-family", "var(--font-mono)");
    expect(await css(banner, "border-top-width")).toBe("2px");
    expect(await css(banner, "border-top-color")).toBe(ink);
    const link = banner.getByRole("link", { name: "hola@vamosany.com" });
    expect(await weight(link)).toBeGreaterThanOrEqual(700);
    expect(await css(link, "font-family")).toBe(mono);
  });

  test.describe("JavaScript disabled", () => {
    test.use({ javaScriptEnabled: false });

    test("the no-JS address is a prominent bold mono link, larger than its sentence", async ({
      page,
    }) => {
      await page.goto("/contacto");
      const block = page
        .locator("main")
        .getByText(/^Para escribirme, mandame un mail a/);
      const link = block.getByRole("link", { name: "hola@vamosany.com" });
      const mono = await resolve(page, "font-family", "var(--font-mono)");
      expect(await weight(link)).toBeGreaterThanOrEqual(700);
      expect(await css(link, "font-family")).toBe(mono);
      expect(parseFloat(await css(link, "font-size"))).toBeGreaterThan(
        parseFloat(await css(block, "font-size")),
      );
    });
  });
});
