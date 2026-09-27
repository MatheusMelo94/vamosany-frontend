import { test, expect, type Locator, type Page } from "@playwright/test";
import { waitForLandingMotion } from "./support/motion";

/**
 * Behavioral checks of the phone menu "Índice" (mobile-navigation spec;
 * plan § 8, § 12). Characterization screenshots live in navbar.spec.ts,
 * where the committed baselines are resolved.
 */

const isDesktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;
const header = (page: Page) => page.locator("header[data-nav]");
const burger = (page: Page) =>
  header(page).getByRole("button", { name: /^(Abrir|Cerrar) menú$/ });
const panel = (page: Page) =>
  header(page).getByRole("navigation", { name: "Menú" });

async function openLanding(page: Page) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await waitForLandingMotion(page);
}

async function openDrawer(page: Page): Promise<Locator> {
  await burger(page).click();
  await expect(panel(page)).toBeVisible();
  return panel(page);
}

/**
 * [role, name] of every node Chromium exposes to assistive tech. Read from
 * the browser's own tree (CDP), because Playwright's ariaSnapshot() doesn't
 * honour `inert`.
 */
async function exposed(page: Page): Promise<Array<[string, string]>> {
  const cdp = await page.context().newCDPSession(page);
  const { nodes } = await cdp.send("Accessibility.getFullAXTree");
  await cdp.detach();
  return nodes
    .filter((n) => !n.ignored)
    .map((n) => [String(n.role?.value ?? ""), String(n.name?.value ?? "")]);
}

/** True when a programmatic focus() lands on the element. */
function takesFocus(locator: Locator): Promise<boolean> {
  return locator.evaluate((el) => {
    (el as HTMLElement).focus();
    return document.activeElement === el;
  });
}

test.describe("drawer modality (AC 30, 31, 34) @feature-mobile-nav", () => {
  test.beforeEach(({ page }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
  });

  test("while open, the page behind is inert; after close it is restored", async ({
    page,
  }) => {
    await openLanding(page);
    const logo = header(page).getByRole("link", { name: "Vamos a NY — home" });
    const mainLink = page.locator("main a").first();
    const footerLink = page.locator("footer a").first();

    await openDrawer(page);
    for (const target of [logo, mainLink, footerLink]) {
      expect(await takesFocus(target)).toBe(false);
    }
    const tree = await exposed(page);
    expect(tree).not.toContainEqual(["link", "Vamos a NY — home"]);
    expect(tree.map(([role]) => role)).not.toContain("main");
    expect(tree.map(([role]) => role)).not.toContain("contentinfo");
    expect(tree).toContainEqual(["navigation", "Menú"]);

    await burger(page).click();
    await expect(panel(page)).toHaveCount(0);
    await expect(page.locator("[inert]")).toHaveCount(0);
    for (const target of [logo, mainLink, footerLink]) {
      expect(await takesFocus(target)).toBe(true);
    }
  });

  test("while open, scrolling over the page or past the list's end doesn't move the page", async ({
    page,
  }) => {
    await openLanding(page);
    const drawer = await openDrawer(page);
    const before = await page.evaluate(() => window.scrollY);
    const b = await drawer.boundingBox();
    if (!b) throw new Error("no panel box");

    // Over the veil (the 16px strip left of the panel), then over the list,
    // far past its end.
    await page.mouse.move(b.x / 2, b.y + b.height / 2);
    await page.mouse.wheel(0, 800);
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    for (let i = 0; i < 6; i++) await page.mouse.wheel(0, 1500);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBe(before);

    if (test.info().project.name === "phone-360") {
      const cdp = await page.context().newCDPSession(page);
      for (const x of [b.x / 2, b.x + b.width / 2]) {
        await cdp.send("Input.synthesizeScrollGesture", {
          x,
          y: b.y + b.height / 2,
          yDistance: -1500,
          gestureSourceType: "touch",
          repeatCount: 2,
        });
      }
      expect(await page.evaluate(() => window.scrollY)).toBe(before);
    }

    await burger(page).click();
    await expect(panel(page)).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => document.body.style.overflow))
      .toBe("");
    await page.mouse.wheel(0, 600);
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(before);
  });

  test("the veil is pointer-only: not exposed to assistive tech, a tap closes", async ({
    page,
  }) => {
    await openLanding(page);
    const drawer = await openDrawer(page);
    const tree = await exposed(page);
    expect(tree.map(([, name]) => name)).not.toContain("Close menu");
    const b = await drawer.boundingBox();
    if (!b) throw new Error("no panel box");
    await page.mouse.click(b.x / 2, b.y + b.height / 2);
    await expect(panel(page)).toHaveCount(0);
    await expect(burger(page)).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("drawer focus (AC 25, 28, 29, 32, 33) @feature-mobile-nav", () => {
  test.beforeEach(({ page }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
  });

  const closedBurger = (page: Page) =>
    header(page).getByRole("button", { name: "Abrir menú" });

  test("focus moves to the panel's first control on open", async ({ page }) => {
    await openLanding(page);
    const drawer = await openDrawer(page);
    await expect(drawer.locator("a[href], button").first()).toBeFocused();
  });

  const closers: Array<
    [string, (page: Page, drawer: Locator) => Promise<void>]
  > = [
    ["the X", (page) => burger(page).click()],
    [
      "a veil tap",
      async (page, drawer) => {
        const b = await drawer.boundingBox();
        if (!b) throw new Error("no panel box");
        await page.mouse.click(b.x / 2, b.y + b.height / 2);
      },
    ],
    [
      "Escape from a panel control",
      async (page, drawer) => {
        await drawer.getByRole("button").nth(2).focus();
        await page.keyboard.press("Escape");
      },
    ],
  ];

  for (const [name, close] of closers) {
    test(`${name} closes and returns focus to the burger`, async ({ page }) => {
      await openLanding(page);
      const drawer = await openDrawer(page);
      await close(page, drawer);
      await expect(panel(page)).toHaveCount(0);
      await expect(closedBurger(page)).toBeFocused();
    });
  }

  for (const [name, href] of [
    ["Log in", /#login$/],
    ["Sign up", /#signup$/],
  ] as const) {
    test(`${name} closes the drawer and navigates`, async ({ page }) => {
      await openLanding(page);
      const drawer = await openDrawer(page);
      await drawer.getByRole("link", { name, exact: true }).click();
      await expect(page).toHaveURL(href);
      await expect(panel(page)).toHaveCount(0);
    });
  }
});

test.describe("drawer panel box (AC 9, 49, 50, 51) @feature-mobile-nav", () => {
  test.beforeEach(({ page }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
  });

  async function openAt(page: Page, width: number, height: number) {
    await page.setViewportSize({ width, height });
    await openLanding(page);
    const drawer = await openDrawer(page);
    const b = await drawer.boundingBox();
    if (!b) throw new Error("no panel box");
    return { drawer, b };
  }

  test("phone: 16px insets, under the capsule, 24px radius, veil over the viewport", async ({
    page,
  }) => {
    const { drawer, b } = await openAt(page, 360, 780);
    expect(b.x).toBeCloseTo(16, 0);
    expect(360 - (b.x + b.width)).toBeCloseTo(16, 0);
    expect(b.y).toBeCloseTo(80, 0);
    expect(780 - (b.y + b.height)).toBeCloseTo(16, 0);
    expect(
      await drawer.evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
    ).toBe("24px");
    const veil = drawer.locator("xpath=preceding-sibling::div[1]");
    expect(await veil.boundingBox()).toEqual({
      x: 0,
      y: 0,
      width: 360,
      height: 780,
    });
  });

  test("tablet: 420px wide, right edge on the capsule's right edge", async ({
    page,
  }) => {
    const { b } = await openAt(page, 768, 1024);
    const capsule = await header(page).locator(".nav-capsule").boundingBox();
    if (!capsule) throw new Error("no capsule box");
    expect(Math.abs(b.width - 420)).toBeLessThanOrEqual(1);
    expect(
      Math.abs(b.x + b.width - (capsule.x + capsule.width)),
    ).toBeLessThanOrEqual(1);
  });

  test("the 420px cap starts at 640", async ({ page }) => {
    const narrow = await openAt(page, 639, 900);
    expect(narrow.b.x).toBeCloseTo(16, 0);
    expect(narrow.b.width).toBeCloseTo(639 - 32, 0);
    await page.setViewportSize({ width: 640, height: 900 });
    await expect
      .poll(async () => (await narrow.drawer.boundingBox())?.width)
      .toBeCloseTo(420, 0);
  });

  test("320: no horizontal overflow in the panel", async ({ page }) => {
    const { drawer } = await openAt(page, 320, 780);
    const overflow = await drawer.evaluate((el) =>
      [el, ...el.querySelectorAll("*")].some(
        (n) =>
          n.scrollWidth > n.clientWidth &&
          getComputedStyle(n).overflowX !== "visible",
      ),
    );
    expect(overflow).toBe(false);
    expect(
      await drawer.evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
  });

  test("the list scrolls inside the panel; the footer stays pinned", async ({
    page,
  }) => {
    const { drawer, b } = await openAt(page, 360, 640);
    await drawer.getByRole("button", { name: "Itineraries" }).click();
    const list = drawer.locator("[data-drawer-list]");
    const footer = drawer.locator("[data-drawer-footer]");
    const scroll = await list.evaluate((el) => ({
      overflowing: el.scrollHeight > el.clientHeight,
      panelScrolls: el.parentElement
        ? el.parentElement.scrollHeight > el.parentElement.clientHeight
        : true,
    }));
    expect(scroll).toEqual({ overflowing: true, panelScrolls: false });
    const before = await footer.boundingBox();
    await list.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    const after = await footer.boundingBox();
    expect(after).toEqual(before);
    if (!after) throw new Error("no footer box");
    expect(after.y + after.height).toBeLessThanOrEqual(b.y + b.height);
  });
});

const LABELS = ["Itineraries", "Guides", "Blog", "Services", "Sobre mí"];
const SCENTS = [
  "By length · By season · By appetite",
  "Getting around · Neighbourhoods · Before you fly",
  "Latest · Readers",
  "Ready-made · One to one · In person",
  "Vamos a New York · Ayuda",
];
const SOBRE_MI_PATHS = [
  "/sobre-mi",
  "/colaboraciones",
  "/trabaja-conmigo",
  "/contacto",
  "/preguntas-frecuentes",
];

/** The group header buttons: each is the only child of an h2. */
const groupHeaders = (drawer: Locator) =>
  drawer.getByRole("heading", { level: 2 }).getByRole("button");

test.describe("drawer index (AC 6, 7, 11, 20, 22, 23, 24, 32, 36) @feature-mobile-nav", () => {
  test.beforeEach(({ page }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
  });

  test("first level: five closed headers in desktop order, Montserrat bold, scent lines, no item links", async ({
    page,
  }) => {
    await openLanding(page);
    const drawer = await openDrawer(page);
    const hs = groupHeaders(drawer);
    await expect(hs).toHaveCount(5);
    for (const [i, label] of LABELS.entries()) {
      const h = hs.nth(i);
      await expect(h).toHaveAccessibleName(label);
      await expect(h).toHaveAccessibleDescription(SCENTS[i] ?? "");
      await expect(h).toHaveAttribute("aria-expanded", "false");
      const font = await h.getByText(label, { exact: true }).evaluate((el) => {
        const cs = getComputedStyle(el);
        return [cs.fontFamily, cs.fontWeight, cs.textTransform];
      });
      expect(font[0]).toMatch(/^"?_*Montserrat/);
      expect(font.slice(1)).toEqual(["700", "none"]);
      const scent = await h.getByText(SCENTS[i] ?? "").evaluate((el) => {
        const cs = getComputedStyle(el);
        return [cs.fontFamily, cs.color];
      });
      expect(scent[0]).toMatch(/Courier[_ ]Prime/);
      expect(scent[1]).toBe("rgb(72, 72, 70)"); // ink-muted, not ink-tertiary (AC 40)
      expect((await h.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(56);
    }
    await expect(drawer.getByRole("link")).toHaveCount(2); // Log in, Sign up
    await expect(hs.first()).toBeFocused();
    await expect(drawer.locator("[data-header-dot]")).toHaveCount(0);
    await expect(drawer.locator("[aria-current]")).toHaveCount(0);
  });

  test("one group open at a time; the open header closes it; Enter keeps focus", async ({
    page,
  }) => {
    await openLanding(page);
    const drawer = await openDrawer(page);
    const header = (name: string) =>
      drawer.getByRole("button", { name, exact: true });
    await header("Itineraries").click();
    await expect(drawer.getByRole("heading", { level: 2 })).toHaveCount(5);
    await expect(
      drawer.getByRole("link", { name: "Weekend Escape" }),
    ).toBeVisible();
    await header("Guides").click();
    await expect(header("Itineraries")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(header("Guides")).toHaveAttribute("aria-expanded", "true");
    await header("Guides").focus();
    await page.keyboard.press("Enter");
    await expect(header("Guides")).toHaveAttribute("aria-expanded", "false");
    await expect(header("Guides")).toBeFocused();
    await expect(drawer.getByRole("link")).toHaveCount(2);
  });

  for (const path of SOBRE_MI_PATHS) {
    test(`${path}: Sobre mí open with the header dot, Services closed`, async ({
      page,
    }) => {
      await page.goto(path);
      const drawer = await openDrawer(page);
      const sobreMi = drawer.getByRole("button", {
        name: "Sobre mí",
        exact: true,
      });
      await expect(sobreMi).toHaveAttribute("aria-expanded", "true");
      await expect(sobreMi.locator("[data-header-dot]")).toBeVisible();
      await expect(
        drawer.getByRole("button", { name: "Services", exact: true }),
      ).toHaveAttribute("aria-expanded", "false");
      await expect(drawer.locator("[aria-expanded='true']")).toHaveCount(1);
    });
  }

  test("the header dot stays after collapse; reopen restores the default, list at the top", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto("/sobre-mi");
    let drawer = await openDrawer(page);
    const sobreMi = drawer.getByRole("button", {
      name: "Sobre mí",
      exact: true,
    });
    await sobreMi.click();
    await expect(sobreMi).toHaveAttribute("aria-expanded", "false");
    await expect(sobreMi.locator("[data-header-dot]")).toBeVisible();
    await drawer.getByRole("button", { name: "Itineraries" }).click();
    const list = drawer.locator("[data-drawer-list]");
    await list.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    expect(await list.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    await burger(page).click();
    await expect(panel(page)).toHaveCount(0);
    drawer = await openDrawer(page);
    await expect(
      drawer.getByRole("button", { name: "Sobre mí", exact: true }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(
      drawer.getByRole("button", { name: "Itineraries" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      await drawer.locator("[data-drawer-list]").evaluate((el) => el.scrollTop),
    ).toBe(0);
  });
});

test.describe("drawer group bodies (AC 12, 16, 17, 18, 21, 25, 26, 48, 51) @feature-mobile-nav", () => {
  test.beforeEach(({ page }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
  });

  test("tags on exactly three rows; Services' prices in Courier bold, right-aligned; no blurbs", async ({
    page,
  }) => {
    await openLanding(page);
    const drawer = await openDrawer(page);
    const tagged: string[] = [];
    for (const label of LABELS) {
      await drawer.getByRole("button", { name: label, exact: true }).click();
      const body = drawer.locator("[data-drawer-body]:visible");
      await expect(body.getByRole("heading", { level: 3 })).not.toHaveCount(0);
      for (const t of await body.locator("[data-row-tag]").all()) {
        await expect(t).toBeVisible();
        tagged.push((await t.textContent()) ?? "");
      }
      // Blurbs end with a period; no row text does.
      for (const row of await body.getByRole("link").all()) {
        expect(await row.textContent()).not.toMatch(/\.$/);
      }
    }
    expect(tagged).toEqual(["Best seller", "New", "Most popular"]);

    // Services is open last-but-one; open it again.
    await drawer.getByRole("button", { name: "Services", exact: true }).click();
    const rows = drawer.locator("[data-drawer-body]:visible a");
    await expect(rows).toHaveCount(3);
    const prices = await rows.evaluateAll((as) =>
      as.map((a) => {
        const p = a.querySelector("[data-row-price]") as HTMLElement;
        const cs = getComputedStyle(p);
        const pr = p.getBoundingClientRect();
        const ar = a.getBoundingClientRect();
        return {
          text: p.textContent,
          family: cs.fontFamily,
          weight: cs.fontWeight,
          transform: cs.textTransform,
          rightGap: Math.round(ar.right - pr.right),
        };
      }),
    );
    expect(prices.map((p) => p.text)).toEqual(["from €25", "€149", "€290"]);
    for (const p of prices) {
      expect(p.family).toMatch(/Courier[_ ]Prime/);
      expect(p.weight).toBe("700");
      expect(p.transform).toBe("none");
      expect(p.rightGap).toBe(0);
    }
    // "with Belén" never breaks across lines (DDR-0005).
    const oneLine = await rows.nth(1).evaluate((a) => {
      const title = a.querySelector("[data-row-title]")?.firstChild;
      const text = title?.textContent ?? "";
      const range = document.createRange();
      const from = text.indexOf("with");
      range.setStart(title as Node, from);
      range.setEnd(title as Node, text.length);
      const tops = new Set(
        [...range.getClientRects()].map((r) => Math.round(r.top)),
      );
      return tops.size;
    });
    expect(oneLine).toBe(1);
  });

  test("a Services row from /sobre-mi lands on the landing's #services, in view", async ({
    page,
  }) => {
    await page.goto("/sobre-mi");
    const drawer = await openDrawer(page);
    await drawer.getByRole("button", { name: "Services", exact: true }).click();
    await drawer.getByRole("link", { name: /^Walk with Belén/ }).click();
    await expect(page).toHaveURL(/\/#services$/);
    await expect(panel(page)).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(() =>
          Math.abs(
            document.getElementById("services")?.getBoundingClientRect().top ??
              Number.POSITIVE_INFINITY,
          ),
        ),
      )
      .toBeLessThan(1);
  });

  test("360 × 640: with Itineraries open, Film Locations scrolls fully above the footer", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await openLanding(page);
    const drawer = await openDrawer(page);
    await drawer.getByRole("button", { name: "Itineraries" }).click();
    const last = drawer.getByRole("link", { name: "Film Locations" });
    await drawer.locator("[data-drawer-list]").evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    const row = await last.boundingBox();
    const footer = await drawer.locator("[data-drawer-footer]").boundingBox();
    if (!row || !footer) throw new Error("no box");
    expect(row.y + row.height).toBeLessThanOrEqual(footer.y);
  });

  test("320: scent lines wrap, never truncate", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 780 });
    await openLanding(page);
    const drawer = await openDrawer(page);
    const scents = drawer.locator(
      "[data-drawer-group] h2 button [id$='-scent']",
    );
    await expect(scents).toHaveCount(5);
    const clipped = await scents.evaluateAll(
      (els) =>
        els.filter(
          (el) =>
            el.scrollWidth > el.clientWidth ||
            getComputedStyle(el).textOverflow === "ellipsis" ||
            getComputedStyle(el).whiteSpace === "nowrap",
        ).length,
    );
    expect(clipped).toBe(0);
    const wrapped = await scents.evaluateAll(
      (els) =>
        els.filter(
          (el) =>
            el.getBoundingClientRect().height >
            parseFloat(getComputedStyle(el).lineHeight) * 1.5,
        ).length,
    );
    expect(wrapped).toBeGreaterThan(0);
  });
});
