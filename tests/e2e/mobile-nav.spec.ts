import { test, expect, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  gsapPending,
  waitForGsapIdle,
  waitForLandingMotion,
} from "./support/motion";
import { diffPixels } from "./support/pixels";

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

/** Opens the drawer and waits for the unfold to settle (plan § 7.2). */
async function openDrawer(page: Page): Promise<Locator> {
  await burger(page).click();
  await expect(panel(page)).toBeVisible();
  await waitForGsapIdle(page);
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

type OpenSample = {
  t: number;
  claimsOpen: boolean;
  x: boolean;
  controlsMissing: boolean;
  panel: boolean;
  modal: boolean;
};

/**
 * Taps the burger and samples every animation frame for `ms`: what the
 * burger claims (name, X, aria-controls) next to what exists (panel,
 * inert page, scroll lock).
 */
function sampleOpen(page: Page, ms: number): Promise<OpenSample[]> {
  return page.evaluate(
    (ms) =>
      new Promise<OpenSample[]>((resolve) => {
        const btn = document.querySelector<HTMLButtonElement>(
          "header[data-nav] button[aria-label$='menú']",
        );
        if (!btn) throw new Error("no burger");
        const out: OpenSample[] = [];
        const t0 = performance.now();
        const sample = () => {
          const controls = btn.getAttribute("aria-controls");
          const nav = document.querySelector(
            "header[data-nav] nav[aria-label='Menú']",
          );
          out.push({
            t: Math.round(performance.now() - t0),
            claimsOpen:
              btn.getAttribute("aria-label") === "Cerrar menú" ||
              btn.getAttribute("aria-expanded") === "true",
            x:
              btn.querySelector("path")?.getAttribute("d") ===
              "m5 5 10 10M15 5 5 15",
            controlsMissing:
              controls !== null && document.getElementById(controls) === null,
            panel: nav !== null,
            modal:
              document.querySelectorAll("[inert]").length > 0 &&
              document.body.style.overflow === "hidden",
          });
        };
        btn.click();
        sample();
        const tick = () => {
          sample();
          if (performance.now() - t0 < ms) requestAnimationFrame(tick);
          else resolve(out);
        };
        requestAnimationFrame(tick);
      }),
    ms,
  );
}

/** Frames where the burger claims more than the page delivers. */
const incoherent = (samples: OpenSample[]) =>
  samples.filter(
    (s) =>
      s.controlsMissing || ((s.claimsOpen || s.x) && !(s.panel && s.modal)),
  );

test.describe("drawer first open (QA-0006, RV-0023) @feature-mobile-nav", () => {
  test.beforeEach(({ page }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
  });

  test("warm chunk: the first tap shows the panel, the inert page and the X in the same frame", async ({
    page,
  }) => {
    await openLanding(page);
    await page.waitForLoadState("networkidle");
    const samples = await sampleOpen(page, 400);
    expect(incoherent(samples)).toEqual([]);
    // By the first frame after the tap (samples[0] is taken synchronously,
    // before React's microtask flush): nothing waits for a Suspense reveal.
    expect(samples[1]).toMatchObject({ claimsOpen: true, panel: true });
  });

  test("warm chunk: Enter then Tab at once stays inside the drawer", async ({
    page,
  }) => {
    await openLanding(page);
    await page.waitForLoadState("networkidle");
    await burger(page).focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(() => {
      const nav = document.querySelector(
        "header[data-nav] nav[aria-label='Menú']",
      );
      return !!nav && nav.contains(document.activeElement);
    });
    expect(inside).toBe(true);
  });

  test("cold chunk on a slow network: the burger claims nothing until the panel exists, and the X animates once", async ({
    page,
  }) => {
    const { width, height } = page.viewportSize() ?? { width: 0, height: 0 };
    // Load where the burger is hidden (no idle prefetch), then narrow it:
    // the chunk is first requested by the tap itself.
    await page.setViewportSize({ width: 1280, height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState("networkidle");
    await page.setViewportSize({ width, height });
    let delayed = 0;
    await page.route("**/_next/static/chunks/**", async (route) => {
      delayed += 1;
      await new Promise((r) => setTimeout(r, 1500));
      await route.continue();
    });
    const samples = await sampleOpen(page, 2500);
    expect(delayed).toBeGreaterThan(0);
    expect(incoherent(samples)).toEqual([]);
    expect(samples.at(-1)).toMatchObject({ claimsOpen: true, panel: true });
    // The X appears once, with the panel: it never shows, vanishes, returns.
    const flips = samples.filter((s, i) => i > 0 && s.x !== samples[i - 1].x);
    expect(flips).toHaveLength(1);
  });
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

  // QA-0007: a plain (non-emulated) window, where the layout viewport stays
  // 360 even though the landing overflows at 2× text (isMobile would widen it).
  for (const width of [360, 390]) {
    test(`${width} at 200% text: every row fits the list, no sideways scroll, prices right-aligned (QA-0007)`, async ({
      browser,
    }) => {
      test.skip(
        test.info().project.name !== "tablet-768",
        "one plain Chromium context is enough",
      );
      const context = await browser.newContext({
        viewport: { width, height: 780 },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      await page.goto("/");
      await page.addStyleTag({
        content: "html { font-size: 200% !important; }",
      });
      await burger(page).click();
      const drawer = panel(page);
      await expect(drawer).toBeVisible();
      for (const label of ["Itineraries", "Guides", "Blog", "Services"]) {
        const h = drawer.getByRole("button", { name: label, exact: true });
        if ((await h.getAttribute("aria-expanded")) !== "true") await h.click();
        const report = await drawer.evaluate((n) => {
          const list = n.querySelector("[data-drawer-list]") as HTMLElement;
          const limit = list.getBoundingClientRect().right - 20 + 0.5;
          const rows = [
            ...n.querySelectorAll("[data-drawer-body]:not([hidden]) a"),
          ];
          return {
            scrollX: list.scrollWidth - list.clientWidth,
            over: rows.flatMap((a) =>
              [...a.querySelectorAll("span")]
                .filter((s) => s.getBoundingClientRect().right > limit)
                .map((s) => s.textContent?.trim()),
            ),
            misaligned: rows
              .map((a) => [a, a.querySelector("[data-row-price]")] as const)
              .filter(
                ([a, price]) =>
                  price &&
                  Math.abs(
                    a.getBoundingClientRect().right -
                      price.getBoundingClientRect().right,
                  ) > 1,
              )
              .map(([a]) => a.textContent?.trim()),
          };
        });
        expect(report, label).toEqual({ scrollX: 0, over: [], misaligned: [] });
      }
      await context.close();
    });
  }

  test("the list scrolls inside the panel; the footer stays pinned", async ({
    page,
  }) => {
    const { drawer, b } = await openAt(page, 360, 640);
    await drawer.getByRole("button", { name: "Itineraries" }).click();
    await waitForGsapIdle(page); // the accordion settles (T012)
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
      await waitForGsapIdle(page); // the accordion settles (T012)
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
    await waitForGsapIdle(page); // the accordion settles (T012)
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
    await waitForGsapIdle(page); // the accordion settles (T012)
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

// The painted result the unit tests used to pin as Tailwind class names
// (RV-0021): colors and shapes as the browser computes them, from the tokens.
test.describe("drawer paint: tokens as computed (AC 12, 16, 22, 26, 28) @feature-mobile-nav", () => {
  test.beforeEach(({ page }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
  });

  test("column headings ink-muted; rows ink semibold over a surface-1 rule; tags and the header dot brand; Sign up and the pressed segment ink on inverse", async ({
    page,
  }) => {
    await page.goto("/sobre-mi");
    await page.evaluate(() => document.fonts.ready);
    const drawer = await openDrawer(page);
    await drawer
      .getByRole("button", { name: "Itineraries", exact: true })
      .click();
    await waitForGsapIdle(page);
    const paint = await drawer.evaluate((nav) => {
      const token = (name: string) => {
        const probe = document.createElement("i");
        probe.style.color = `var(${name})`;
        document.body.append(probe);
        const value = getComputedStyle(probe).color;
        probe.remove();
        return value;
      };
      const cs = (el: Element | null) => {
        if (!el) throw new Error("missing element");
        return getComputedStyle(el);
      };
      const body = nav.querySelector("[data-drawer-body]:not([hidden])");
      const row = body?.querySelector("a") ?? null;
      const tag = body?.querySelector("[data-row-tag]") ?? null;
      const dot = nav.querySelector("[data-header-dot]");
      const es = [...nav.querySelectorAll("button")].find(
        (b) => b.textContent === "ES",
      );
      const signup = [...nav.querySelectorAll("a")].find(
        (a) => a.textContent === "Sign up",
      );
      return {
        tokens: {
          brand: token("--color-brand"),
          ink: token("--color-ink"),
          inkMuted: token("--color-ink-muted"),
          surface1: token("--color-surface-1"),
          inverse: token("--color-inverse-ink"),
        },
        h3: cs(body?.querySelector("h3") ?? null).color,
        row: {
          rule: [
            cs(row).borderBottomStyle,
            cs(row).borderBottomWidth,
            cs(row).borderBottomColor,
          ],
          title: [
            cs(row?.querySelector("[data-row-title]") ?? null).color,
            cs(row?.querySelector("[data-row-title]") ?? null).fontWeight,
          ],
        },
        tag: [cs(tag).backgroundColor, cs(tag).color, tag?.textContent],
        tagRound:
          parseFloat(cs(tag).borderTopLeftRadius) >=
          (tag?.getBoundingClientRect().height ?? 0) / 2,
        dot: [
          cs(dot).backgroundColor,
          dot?.getBoundingClientRect().width,
          dot?.getBoundingClientRect().height,
          parseFloat(cs(dot).borderTopLeftRadius) >= 3,
        ],
        es: [
          es?.getAttribute("aria-pressed"),
          cs(es ?? null).backgroundColor,
          cs(es ?? null).color,
        ],
        signup: [cs(signup ?? null).backgroundColor, cs(signup ?? null).color],
      };
    });
    const { brand, ink, inkMuted, surface1, inverse } = paint.tokens;
    expect(paint.h3).toBe(inkMuted);
    expect(paint.row.rule).toEqual(["solid", "1px", surface1]);
    expect(paint.row.title).toEqual([ink, "600"]);
    expect(paint.tag).toEqual([brand, ink, "Best seller"]);
    expect(paint.tagRound).toBe(true);
    expect(paint.dot).toEqual([brand, 6, 6, true]);
    expect(paint.es).toEqual(["true", ink, inverse]);
    expect(paint.signup).toEqual([ink, inverse]);
  });
});

test.describe("drawer footer (AC 2, 8, 10, 27, 33, 38, 39) @feature-mobile-nav", () => {
  test("desktop: no drawer, and the language button still reads EN", async ({
    page,
  }) => {
    test.skip(!isDesktop(page), "desktop project only");
    await openLanding(page);
    await expect(panel(page)).toHaveCount(0);
    await expect(header(page).locator(".fixed.inset-0")).toHaveCount(0);
    await expect(
      header(page).getByRole("button", { name: "Change language" }),
    ).toHaveText("EN");
  });

  test.describe("below 1024", () => {
    test.beforeEach(({ page }) => {
      test.skip(isDesktop(page), "drawer exists below 1024 only");
    });

    test("Idioma: ES, PT, EN with ES pressed; PT stays open, changes nothing, survives reopen", async ({
      page,
    }) => {
      await openLanding(page);
      const drawer = await openDrawer(page);
      const idioma = drawer.getByRole("group", { name: "Idioma" });
      const segs = idioma.getByRole("button");
      await expect(segs).toHaveText(["ES", "PT", "EN"]);
      await expect(idioma.getByRole("button", { pressed: true })).toHaveText(
        "ES",
      );
      const url = page.url();
      const text = await page.locator("main").innerText();
      await segs.nth(1).click();
      await expect(idioma.getByRole("button", { pressed: true })).toHaveText(
        "PT",
      );
      await expect(panel(page)).toBeVisible();
      expect(page.url()).toBe(url);
      expect(await page.locator("main").innerText()).toBe(text);
      await burger(page).click();
      await expect(panel(page)).toHaveCount(0);
      const again = await openDrawer(page);
      await expect(
        again
          .getByRole("group", { name: "Idioma" })
          .getByRole("button", { pressed: true }),
      ).toHaveText("PT");
    });

    test("boxes and fonts: 48px pills side by side, ≥44 × 44 segments, Montserrat semibold", async ({
      page,
    }) => {
      await openLanding(page);
      const drawer = await openDrawer(page);
      const login = drawer.getByRole("link", { name: "Log in", exact: true });
      const signup = drawer.getByRole("link", { name: "Sign up", exact: true });
      const l = await login.boundingBox();
      const s = await signup.boundingBox();
      if (!l || !s) throw new Error("no pill box");
      expect(l.height).toBeCloseTo(48, 0);
      expect(s.height).toBeCloseTo(48, 0);
      expect(l.x + l.width).toBeLessThan(s.x);
      expect(Math.abs(l.y - s.y)).toBeLessThanOrEqual(1);
      for (const seg of await drawer
        .getByRole("group", { name: "Idioma" })
        .getByRole("button")
        .all()) {
        const b = await seg.boundingBox();
        expect(b?.height ?? 0).toBeGreaterThanOrEqual(44);
        expect(b?.width ?? 0).toBeGreaterThanOrEqual(44);
      }
      const fonts = await drawer
        .locator("[data-drawer-footer] a, [data-drawer-footer] button")
        .evaluateAll((els) =>
          els.map((el) => {
            const cs = getComputedStyle(el);
            return [cs.fontFamily, cs.fontWeight, cs.textTransform];
          }),
        );
      expect(fonts).toHaveLength(5);
      for (const [family, weight, transform] of fonts) {
        expect(family).toMatch(/^"?_*Montserrat/);
        expect([weight, transform]).toEqual(["600", "none"]);
      }
      // Only headings, scent lines and prices are Courier in the panel.
      const courier = await drawer.evaluate((el) =>
        [...el.querySelectorAll<HTMLElement>("*")]
          .filter(
            (n) =>
              n.childElementCount === 0 &&
              n.textContent?.trim() &&
              /Courier/.test(getComputedStyle(n).fontFamily),
          )
          .every((n) => n.matches("[id$='-scent'], h3, [data-row-price]")),
      );
      expect(courier).toBe(true);
    });

    test("keyboard: the full cycle from Itineraries, both ways, with the ink focus ring", async ({
      page,
    }) => {
      await openLanding(page);
      await openDrawer(page);
      const order = [
        "Guides",
        "Blog",
        "Services",
        "Sobre mí",
        "ES",
        "PT",
        "EN",
        "Log in",
        "Sign up",
        "Cerrar menú",
        "Itineraries",
      ];
      const focused = () =>
        page.evaluate(() => {
          const el = document.activeElement as HTMLElement;
          const cs = getComputedStyle(el);
          const labelled = el.getAttribute("aria-labelledby");
          return {
            name:
              el.getAttribute("aria-label") ??
              (labelled
                ? document.getElementById(labelled)?.textContent
                : el.textContent?.trim()),
            ring: [cs.outlineStyle, cs.outlineWidth, cs.outlineColor],
          };
        });
      const names: string[] = [];
      for (let i = 0; i < order.length; i++) {
        await page.keyboard.press("Tab");
        const f = await focused();
        names.push(f.name ?? "");
        if (f.name !== "Cerrar menú")
          expect(f.ring, f.name ?? "").toEqual([
            "solid",
            "2px",
            "rgb(8, 10, 11)",
          ]);
      }
      expect(names).toEqual(order);
      const back: string[] = [];
      for (let i = 0; i < order.length; i++) {
        await page.keyboard.press("Shift+Tab");
        back.push((await focused()).name ?? "");
      }
      expect(back).toEqual([...order].reverse().slice(1).concat("Itineraries"));
    });

    for (const [w, h] of [
      [360, 780],
      [390, 844],
    ] as const) {
      test(`${w} × ${h}: the first level fits the list with no scroll (S2)`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: w, height: h });
        await openLanding(page);
        const drawer = await openDrawer(page);
        expect(
          await drawer
            .locator("[data-drawer-list]")
            .evaluate((el) => el.scrollHeight <= el.clientHeight),
        ).toBe(true);
      });
    }
  });
});

test.describe("drawer accessibility audit (AC 40) @feature-mobile-nav", () => {
  test.beforeEach(({ page }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
  });

  const states: Array<[string, string, string | null]> = [
    ["S2 on /", "/", null],
    ["S3 (Itineraries open) on /", "/", "Itineraries"],
    ["S5 on /sobre-mi", "/sobre-mi", null],
  ];

  for (const [name, path, group] of states) {
    test(`axe: 0 violations on the open drawer, ${name}`, async ({ page }) => {
      if (path === "/") await openLanding(page);
      else await page.goto(path);
      const drawer = await openDrawer(page);
      if (group)
        await drawer.getByRole("button", { name: group, exact: true }).click();
      await waitForGsapIdle(page);
      const results = await new AxeBuilder({ page })
        .include('header[data-nav] nav[aria-label="Menú"]')
        .analyze();
      expect(results.violations).toEqual([]);
      // The audit covered the scent lines' and headings' contrast.
      const checked = [...results.passes, ...results.incomplete].some(
        (r) => r.id === "color-contrast",
      );
      expect(checked).toBe(true);
    });
  }
});

/* ---- Motion (T011, T012): time-sampled with page.clock (plan § 12) ---- */

// Removes <main> and <footer> so the landing's loops can't differ between
// two frames; the header and the fixed drawer don't move (navbar.spec.ts).
const ISOLATE = "main, footer { display: none !important; }";

/** Loads `path` with a fake clock, lets it settle, then stops time. */
async function pausedAt(page: Page, path: string) {
  await page.clock.install();
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  if (path === "/") await waitForLandingMotion(page);
  await waitForGsapIdle(page);
  // Load the lazy chunk first with one open/close cycle, so the measured tap
  // mounts the panel in its own frame, whatever the network did.
  await openDrawer(page);
  await burger(page).click();
  await expect(panel(page)).toHaveCount(0);
  await waitForGsapIdle(page);
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + 1000);
}

/** Taps the burger and waits for the lazy chunk to mount the panel (t = 0). */
async function tapOpen(page: Page) {
  await burger(page).click();
  await expect(panel(page)).toBeAttached();
}

type Frame = {
  /** Bottom inset of the panel's clip-path in %, or null without a clip. */
  clipBottom: number | null;
  panelY: number;
  veil: number | null;
  icon: { angle: number; scale: number; opacity: number };
  groups: number[];
  footer: number;
  headerDot: number | null;
  rowDot: { width: number; transform: string } | null;
  capsule: number[];
  main: number[];
};

/** Reads the drawer's motion state from computed styles, in the page. */
function frame(page: Page): Promise<Frame> {
  return page.evaluate(() => {
    const nav = document.querySelector<HTMLElement>(
      'header[data-nav] nav[aria-label="Menú"]',
    );
    const veil = nav?.previousElementSibling ?? null;
    const svg = document.querySelector(
      'header[data-nav] button[aria-label$="menú"] svg',
    );
    const matrix = (el: Element) => {
      const t = getComputedStyle(el).transform;
      return new DOMMatrixReadOnly(t === "none" ? undefined : t);
    };
    const opacity = (el: Element | null) =>
      el ? Number(getComputedStyle(el).opacity) : 0;
    const rect = (el: Element | null) => {
      const r = el?.getBoundingClientRect();
      return r ? [r.x, r.y, r.width, r.height] : [];
    };
    const clip = nav ? getComputedStyle(nav).clipPath : "none";
    let clipBottom: number | null = null;
    if (clip.startsWith("inset(")) {
      const v = (clip.slice(6).split("round")[0] ?? "")
        .trim()
        .split(/\s+/)
        .map((x) => Number.parseFloat(x));
      clipBottom = v.length >= 3 ? (v[2] ?? 0) : (v[0] ?? 0);
    }
    const m = svg ? matrix(svg) : new DOMMatrixReadOnly();
    const hd = nav?.querySelector("[data-header-dot]");
    const rd = nav?.querySelector("[data-current-dot]");
    return {
      clipBottom,
      panelY: nav ? matrix(nav).f : 0,
      veil: veil ? opacity(veil) : null,
      icon: {
        angle: (Math.atan2(m.b, m.a) * 180) / Math.PI,
        scale: Math.hypot(m.a, m.b),
        opacity: svg ? opacity(svg) : 0,
      },
      groups: [...(nav?.querySelectorAll("[data-drawer-group]") ?? [])].map(
        opacity,
      ),
      footer: opacity(nav?.querySelector("[data-drawer-footer]") ?? null),
      headerDot: hd ? matrix(hd).a : null,
      rowDot: rd
        ? {
            width: rd.getBoundingClientRect().width,
            transform: getComputedStyle(rd).transform,
          }
        : null,
      capsule: rect(document.querySelector(".nav-capsule")),
      main: rect(document.querySelector("main h1, main h2")),
    };
  });
}

test.describe("drawer motion: the unfold and the roll-up (AC 41–43, 45, 47) @feature-mobile-nav", () => {
  test.beforeEach(({ page }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
  });

  test("opening unfolds: clipped at 0.1s, settled by 0.9s; the capsule and page never move", async ({
    page,
  }) => {
    await pausedAt(page, "/");
    const before = await frame(page);
    await tapOpen(page);
    const start = await frame(page);
    await page.clock.runFor(100);
    const early = await frame(page);
    expect(early.clipBottom).not.toBeNull();
    expect(early.clipBottom!).toBeGreaterThan(0);
    expect(early.clipBottom!).toBeLessThan(100);
    expect(early.icon.angle).toBeGreaterThan(-90);
    expect(early.icon.angle).toBeLessThan(-0.5);
    expect(early.veil!).toBeGreaterThan(0);
    expect(early.veil!).toBeLessThan(1);

    await page.clock.runFor(800);
    const settled = await frame(page);
    expect(settled.clipBottom).toBeNull();
    expect(settled.panelY).toBe(0);
    expect(settled.icon).toEqual({ angle: 0, scale: 1, opacity: 1 });
    expect(settled.veil).toBe(1);
    expect(settled.groups).toEqual([1, 1, 1, 1, 1]);
    expect(settled.footer).toBe(1);
    expect(await gsapPending(page)).toBe(0);

    // AC 47: only the icon moves inside the capsule; nothing on the page.
    for (const f of [start, early, settled]) {
      expect(f.capsule).toEqual(before.capsule);
      expect(f.main).toEqual(before.main);
    }
  });

  test("the frame at 0.9s is the settled drawer", async ({ page }) => {
    await pausedAt(page, "/");
    await page.addStyleTag({ content: ISOLATE });
    await tapOpen(page);
    await page.clock.runFor(900);
    const at900 = await page.screenshot();
    await page.clock.runFor(2000);
    expect(await page.screenshot()).toEqual(at900);
  });

  test("on a Sobre mí route only the header dot pops; the row dot is full size from the first frame (AC 45)", async ({
    page,
  }) => {
    await pausedAt(page, "/sobre-mi");
    await tapOpen(page);
    const start = await frame(page);
    expect(start.headerDot).toBe(0);
    expect(start.rowDot).toEqual({ width: 6, transform: "none" });
    await page.clock.runFor(300);
    expect((await frame(page)).headerDot).toBe(0);
    await page.clock.runFor(600);
    const settled = await frame(page);
    expect(settled.headerDot).toBe(1);
    expect(settled.rowDot).toEqual({ width: 6, transform: "none" });
  });

  test("during the unfold a header tap opens its group, Tab moves inside and reveals, the X rolls up from where it is (AC 43)", async ({
    page,
  }) => {
    await pausedAt(page, "/");
    await tapOpen(page);
    await page.clock.runFor(200);
    const drawer = panel(page);

    await page.keyboard.press("Tab");
    const guides = drawer.getByRole("button", { name: "Guides" });
    await expect(guides).toBeFocused();
    const mid = await frame(page);
    expect(mid.groups[1]).toBe(1);
    expect(mid.groups[3]).toBeLessThan(1);

    await guides.click();
    await expect(guides).toHaveAttribute("aria-expanded", "true");

    await page.clock.runFor(50);
    const beforeClose = await frame(page);
    await burger(page).click();
    await page.clock.runFor(16);
    const closing = await frame(page);
    expect(closing.clipBottom!).toBeGreaterThanOrEqual(
      (beforeClose.clipBottom ?? 0) - 0.5,
    );
    expect(closing.clipBottom!).toBeLessThan(
      (beforeClose.clipBottom ?? 0) + 20,
    );
    await page.clock.runFor(350);
    await expect(panel(page)).toHaveCount(0);
  });

  test("closing rolls up and fades the veil; both are gone by 0.35s and the burger is back (AC 42)", async ({
    page,
  }) => {
    await pausedAt(page, "/");
    await tapOpen(page);
    await page.clock.runFor(1000);
    await burger(page).click();
    await expect(burger(page)).toHaveAccessibleName("Abrir menú");
    await page.clock.runFor(100);
    const rolling = await frame(page);
    expect(rolling.clipBottom!).toBeGreaterThan(0);
    expect(rolling.veil!).toBeLessThan(1);
    await expect(panel(page)).toBeAttached();
    await page.clock.runFor(250);
    await expect(panel(page)).toHaveCount(0);
    await expect(header(page).locator(".fixed.inset-0")).toHaveCount(0);
    // No inline declaration left on the icon (an empty style="" is fine).
    expect(
      (await burger(page).locator("svg").getAttribute("style")) ?? "",
    ).toBe("");
  });
});

/** Frame right after each tap = the settled frame (AC 46, open and close). */
/** Antialiasing budget for a closed-header compare across an overlay cycle. */
const MAX_AA_PIXELS = 10;

async function instantOpenClose(page: Page) {
  await page.addStyleTag({ content: ISOLATE });
  await page.mouse.move(1, 1);
  const closed = await header(page).screenshot({ animations: "disabled" });
  await burger(page).click();
  await expect(panel(page)).toBeAttached();
  // The panel now mounts in the tap's own frame (QA-0006), while the frozen
  // burger's CSS hover fill (transition-colors) is still fading in under the
  // pointer. "disabled" ends CSS transitions only: any GSAP (inline-style)
  // drawer motion would still show up in this byte-exact compare.
  const opened = await page.screenshot({ animations: "disabled" });
  await page.waitForTimeout(1000);
  expect(await page.screenshot({ animations: "disabled" })).toEqual(opened);
  await burger(page).click();
  expect(await panel(page).count()).toBe(0);
  await page.mouse.move(1, 1);
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  // A pixel budget, not byte equality (RV-0019, QA-0009): after any overlay
  // cycle, Chromium may re-rasterize the capsule's backdrop-filtered rounded
  // corner with ~4 antialiasing pixels a few levels apart, drawer or not.
  // Anything the drawer could leave behind (the X, a hover fill, a focus
  // ring, a moved capsule) changes far more than 10 pixels.
  const after = await header(page).screenshot({ animations: "disabled" });
  const diff = await diffPixels(page, closed, after);
  expect(diff.sameSize).toBe(true);
  expect(diff.count, JSON.stringify(diff.box)).toBeLessThanOrEqual(
    MAX_AA_PIXELS,
  );
}

test.describe("drawer motion off: reduced motion (AC 46) @feature-mobile-nav", () => {
  test.use({ reducedMotion: "reduce" });
  test("open and close are instant", async ({ page }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
    await openLanding(page);
    await expect(page.locator("html")).not.toHaveClass(/gsap/);
    await instantOpenClose(page);
  });
});

test.describe("drawer motion off: no .gsap gate (AC 46) @feature-mobile-nav", () => {
  test("open and close are instant", async ({ page }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
    await openLanding(page);
    await page.evaluate(() =>
      document.documentElement.classList.remove("gsap"),
    );
    await instantOpenClose(page);
  });
});

/** Top of a group's header and height of its body, in the page. */
function groupBox(page: Page, label: string) {
  return panel(page)
    .getByRole("button", { name: label, exact: true })
    .evaluate((button) => {
      const group = button.closest("[data-drawer-group]");
      const body = group?.querySelector("[data-drawer-body]");
      return {
        top: button.getBoundingClientRect().top,
        body: body?.getBoundingClientRect().height ?? 0,
        hidden: body?.hasAttribute("hidden") ?? true,
        inert: body?.hasAttribute("inert") ?? false,
      };
    });
}

test.describe("drawer motion: the accordion (AC 19, 44; M11–M13) @feature-mobile-nav", () => {
  test.beforeEach(({ page }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
  });

  test("a swap overlaps: the old body collapses (inert), the new one grows, the headers slide; all done by 0.5s (AC 44)", async ({
    page,
  }) => {
    await pausedAt(page, "/");
    await tapOpen(page);
    await page.clock.runFor(1000);
    const drawer = panel(page);
    await drawer.getByRole("button", { name: "Itineraries" }).click();
    await page.clock.runFor(1000);
    const blogBefore = await groupBox(page, "Blog");

    await drawer.getByRole("button", { name: "Guides" }).click();
    await page.clock.runFor(100);
    const itMid = await groupBox(page, "Itineraries");
    expect(itMid.hidden).toBe(false);
    expect(itMid.inert).toBe(true);
    expect(itMid.body).toBeGreaterThan(0);
    const guidesMid = await groupBox(page, "Guides");
    const blogMid = await groupBox(page, "Blog");

    await page.clock.runFor(400);
    expect(await gsapPending(page)).toBe(0);
    const itEnd = await groupBox(page, "Itineraries");
    const guidesEnd = await groupBox(page, "Guides");
    const blogEnd = await groupBox(page, "Blog");
    expect(itEnd.hidden).toBe(true);
    expect(guidesMid.body).toBeGreaterThan(0);
    expect(guidesMid.body).toBeLessThan(guidesEnd.body);
    // Blog slides, it doesn't jump: mid-swap it is at neither end (the
    // overlap can take it past both, as the expand leads the collapse).
    expect(Math.abs(blogMid.top - blogBefore.top)).toBeGreaterThan(1);
    expect(Math.abs(blogMid.top - blogEnd.top)).toBeGreaterThan(1);
  });

  test("a double tap within 100ms leaves the group collapsed, nothing running after 0.5s (AC 44)", async ({
    page,
  }) => {
    await pausedAt(page, "/");
    await tapOpen(page);
    await page.clock.runFor(1000);
    const guides = panel(page).getByRole("button", { name: "Guides" });
    await guides.click();
    await page.clock.runFor(60);
    await guides.click();
    await page.clock.runFor(500);
    await expect(guides).toHaveAttribute("aria-expanded", "false");
    expect((await groupBox(page, "Guides")).hidden).toBe(true);
    expect(await gsapPending(page)).toBe(0);
  });
});

/** Opens Itineraries, scrolls Blog's header near the list's bottom, taps it. */
async function blogAfterLongGroup(page: Page) {
  const drawer = await openDrawer(page);
  await drawer.getByRole("button", { name: "Itineraries" }).click();
  await waitForGsapIdle(page);
  const list = drawer.locator("[data-drawer-list]");
  const blog = drawer.getByRole("button", { name: "Blog", exact: true });
  await list.evaluate((el, b) => {
    const header = [...el.querySelectorAll("h2 button")].find((x) =>
      x.textContent?.includes(b),
    );
    if (!header) throw new Error("no Blog header");
    const box = el.getBoundingClientRect();
    el.scrollTop += header.getBoundingClientRect().bottom - box.bottom + 8;
  }, "Blog");
  // Precondition: without a correction Blog would end above the list's top.
  const outOfView = await list.evaluate((el) => {
    const body = el.querySelector("[data-drawer-body]:not([hidden])");
    return (body?.getBoundingClientRect().height ?? 0) > el.clientHeight / 2;
  });
  expect(outOfView).toBe(true);
  await blog.click();
  await waitForGsapIdle(page);
  const [b, l] = await Promise.all([blog.boundingBox(), list.boundingBox()]);
  if (!b || !l) throw new Error("no box");
  expect(b.y).toBeGreaterThanOrEqual(l.y - 0.5);
  expect(b.y + b.height).toBeLessThanOrEqual(l.y + l.height + 0.5);
}

test.describe("drawer keeps the opened header in view (AC 19) @feature-mobile-nav", () => {
  test("with motion", async ({ page }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
    await openLanding(page);
    await blogAfterLongGroup(page);
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });
    test("instant", async ({ page }) => {
      test.skip(isDesktop(page), "drawer exists below 1024 only");
      await openLanding(page);
      await blogAfterLongGroup(page);
    });
  });
});

/** Frame right after an expand and a collapse tap = the settled frame (AC 46). */
async function instantAccordion(page: Page) {
  await page.addStyleTag({ content: ISOLATE });
  const drawer = await openDrawer(page);
  const guides = drawer.getByRole("button", { name: "Guides" });
  // Leave the burger first: its hover fill fades out on a CSS transition
  // (the frozen navbar's, not drawer motion) when the pointer moves away.
  await guides.hover();
  await page.waitForTimeout(500);
  for (const expanded of ["true", "false"]) {
    await guides.click();
    await expect(guides).toHaveAttribute("aria-expanded", expanded);
    const after = await page.screenshot();
    await page.waitForTimeout(1000);
    expect(await page.screenshot()).toEqual(after);
  }
}

test.describe("accordion motion off: reduced motion (AC 46) @feature-mobile-nav", () => {
  test.use({ reducedMotion: "reduce" });
  test("expand and collapse are instant", async ({ page }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
    await openLanding(page);
    await instantAccordion(page);
  });
});

test.describe("accordion motion off: no .gsap gate (AC 46) @feature-mobile-nav", () => {
  test("expand and collapse are instant, chevron included", async ({
    page,
  }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
    await openLanding(page);
    await page.evaluate(() =>
      document.documentElement.classList.remove("gsap"),
    );
    await instantAccordion(page);
  });
});
