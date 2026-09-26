import { test, expect, type Locator, type Page } from "@playwright/test";

/**
 * Characterization of the navbar (ADR-0006 § 2 oracle; plan § 12). Written on
 * unchanged app code, before any navbar change, so later tasks diff the navbar
 * at header level instead of the page-level 1% tolerance.
 *
 * Captures isolate the navbar: `main` and `footer` are removed before the
 * screenshot so the landing's looping hero ring and timelines can't leak into
 * the clip. Clips are the union of `header[data-nav]` and the open overlay
 * (mega-menu panel, language menu), or the viewport for the drawer.
 */

// `display: none`, not `visibility: hidden`: the hero ring's preserve-3d cards
// keep painting as composited layers under `visibility: hidden`. The header is
// in flow at the top and the overlays are absolute/fixed, so removing <main>
// and <footer> does not move the navbar.
const ISOLATE = "main, footer { display: none !important; }";

/**
 * Applied before capture (not via toHaveScreenshot's `style`, which is injected
 * on the capture frame itself and still shows the ring's old compositor layer).
 */
async function isolate(page: Page) {
  await page.addStyleTag({ content: ISOLATE });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

/** Trigger label → snapshot slug. "About" became "Sobre mí" (DDR-0002; plan § 12 item 5). */
const PANELS = [
  ["Itineraries", "itineraries"],
  ["Guides", "guides"],
  ["Blog", "blog"],
  ["Services", "services"],
  ["Sobre mí", "sobre-mi"],
] as const;

/** spec § Menu IA (DDR-0002). */
const SOBRE_MI_ITEMS = [
  ["Sobre mí", "/sobre-mi"],
  ["Colaboraciones", "/colaboraciones"],
  ["Trabajá conmigo", "/trabaja-conmigo"],
  ["Contacto", "/contacto"],
  ["FAQ", "/preguntas-frecuentes"],
] as const;

type Box = { x: number; y: number; width: number; height: number };

function union(a: Box, b: Box): Box {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y,
  };
}

async function box(locator: Locator): Promise<Box> {
  const b = await locator.boundingBox();
  if (!b) throw new Error("element has no bounding box");
  return b;
}

async function open(page: Page) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  // The hero timeline runs on load; the navbar itself does not animate, but
  // let the page settle so layout is final.
  await page.waitForTimeout(1500);
}

const header = (page: Page) => page.locator("header[data-nav]");

/** The open desktop mega-menu panel: the only rounded-3xl block inside the capsule. */
const megaPanel = (page: Page) =>
  header(page).locator(".nav-capsule div.rounded-3xl");

const isDesktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;

test.describe("navbar characterization @feature-sobre-mi", () => {
  test("closed navbar", async ({ page }) => {
    await open(page);
    await isolate(page);
    await expect(page).toHaveScreenshot("navbar-closed.png", {
      clip: await box(header(page)),
      animations: "disabled",
    });
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("closed navbar, reduced motion", async ({ page }) => {
      await open(page);
      await expect(page.locator("html")).not.toHaveClass(/gsap/);
      await isolate(page);
      await expect(page).toHaveScreenshot("navbar-closed-reduced.png", {
        clip: await box(header(page)),
        animations: "disabled",
      });
    });
  });

  for (const [label, slug] of PANELS) {
    test(`mega-menu panel: ${label}`, async ({ page }) => {
      test.skip(!isDesktop(page), "mega-menu exists at >= 1024 only");
      await open(page);
      const trigger = header(page).getByRole("button", {
        name: label,
        exact: true,
      });
      // The open-with-pointer-on-trigger state, reached by hovering (a click
      // now keeps it open too, QA-0002; hover is the characterized path).
      await trigger.hover();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      const panel = megaPanel(page);
      await expect(panel).toBeVisible();
      await isolate(page);
      await expect(page).toHaveScreenshot(`navbar-panel-${slug}.png`, {
        clip: union(await box(header(page)), await box(panel)),
        animations: "disabled",
      });
    });
  }

  test("language menu", async ({ page }) => {
    test.skip(!isDesktop(page), "language dropdown exists at >= 1024 only");
    await open(page);
    await header(page).getByRole("button", { name: "Change language" }).click();
    const menu = header(page).getByRole("listbox", { name: "Language" });
    await expect(menu).toBeVisible();
    await isolate(page);
    await expect(page).toHaveScreenshot("language-menu.png", {
      clip: union(await box(header(page)), await box(menu)),
      animations: "disabled",
    });
  });

  test("drawer: top and last group", async ({ page }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
    await open(page);
    await header(page).getByRole("button", { name: "Toggle menu" }).click();
    const drawer = header(page).locator("> div.overflow-y-auto");
    await expect(drawer).toBeVisible();
    await isolate(page);
    await expect(page).toHaveScreenshot("drawer-top.png", {
      animations: "disabled",
    });
    await drawer.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await expect(page).toHaveScreenshot("drawer-last-group.png", {
      animations: "disabled",
    });
  });
});

test.describe("navbar Sobre mí group (DDR-0002) @feature-sobre-mi", () => {
  test("desktop panel links each item to its route (AC 1)", async ({
    page,
  }) => {
    test.skip(!isDesktop(page), "mega-menu exists at >= 1024 only");
    await open(page);
    const trigger = header(page).getByRole("button", {
      name: "Sobre mí",
      exact: true,
    });
    await trigger.hover();
    const panel = megaPanel(page);
    await expect(panel).toBeVisible();
    await expect(panel.getByText("Vamos a New York")).toBeVisible();
    await expect(panel.getByText("Ayuda")).toBeVisible();
    for (const [title, href] of SOBRE_MI_ITEMS) {
      await expect(
        panel.getByRole("link", { name: new RegExp(`^${title} `) }),
      ).toHaveAttribute("href", href);
    }
  });

  test("drawer: tapping an item navigates and closes the drawer (AC 3)", async ({
    page,
  }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
    await open(page);
    const toggle = header(page).getByRole("button", { name: "Toggle menu" });
    await toggle.click();
    const drawer = header(page).locator("> div.overflow-y-auto");
    for (const [title, href] of SOBRE_MI_ITEMS) {
      await expect(
        drawer.getByRole("link", { name: title, exact: true }),
      ).toHaveAttribute("href", href);
    }
    await drawer
      .getByRole("link", { name: "Colaboraciones", exact: true })
      .click();
    await expect(page).toHaveURL(/\/colaboraciones$/);
    await expect(drawer).toHaveCount(0);
  });
});

test.describe("navbar keyboard path (AC 10) @feature-sobre-mi", () => {
  test("Enter opens, Tab reaches the first item, Escape returns focus to the trigger", async ({
    page,
  }) => {
    test.skip(!isDesktop(page), "mega-menu exists at >= 1024 only");
    await open(page);
    const trigger = header(page).getByRole("button", {
      name: "Sobre mí",
      exact: true,
    });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const panelId = await trigger.getAttribute("aria-controls");
    await expect(page.locator(`[id="${panelId}"]`)).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveAttribute("href", "/sobre-mi");
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
  });

  test("Tab past the last item closes the panel (RV-0005)", async ({
    page,
  }) => {
    test.skip(!isDesktop(page), "mega-menu exists at >= 1024 only");
    await open(page);
    const trigger = header(page).getByRole("button", {
      name: "Sobre mí",
      exact: true,
    });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    for (const [, href] of SOBRE_MI_ITEMS) {
      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toHaveAttribute("href", href);
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
    }
    await page.keyboard.press("Tab");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(megaPanel(page)).toHaveCount(0);
  });
});

/* ---- Pointer path (QA-0001, QA-0002) --------------------------------- */

test.describe("navbar pointer path @feature-sobre-mi", () => {
  test.beforeEach(({ page }) => {
    test.skip(!isDesktop(page), "mega-menu exists at >= 1024 only");
  });

  // QA-0001: the panel floats 7px under the capsule. A pointer that travels
  // slowly from the trigger to the first item must not lose the panel there.
  for (const pxPerStep of [2, 4, 6]) {
    test(`panel stays open while the pointer crosses the gap at ${pxPerStep}px per sample (QA-0001)`, async ({
      page,
    }) => {
      await open(page);
      const trigger = header(page).getByRole("button", {
        name: "Sobre mí",
        exact: true,
      });
      await trigger.hover();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      const from = await box(trigger);
      const item = megaPanel(page).getByRole("link").first();
      const to = await box(item);
      const x = from.x + from.width / 2;
      const y0 = from.y + from.height / 2;
      const y1 = to.y + to.height / 2;
      await page.mouse.move(x, y0);
      await page.mouse.move(x, y1, {
        steps: Math.ceil((y1 - y0) / pxPerStep),
      });
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await expect(item).toBeVisible();
    });
  }

  test("a mouse click on a closed trigger leaves its panel open (QA-0002)", async ({
    page,
  }) => {
    await open(page);
    const trigger = header(page).getByRole("button", {
      name: "Sobre mí",
      exact: true,
    });
    // A real click: the pointer moves onto the trigger (mouseenter) and clicks.
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(megaPanel(page)).toBeVisible();
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  for (const from of ["/sobre-mi", "/"]) {
    test(`a Services item on ${from} lands on the landing's #services (RV-0010)`, async ({
      page,
    }) => {
      // On "/", let the landing's load-time motion settle first, as every
      // landing test here does; a click during it is not what this covers.
      if (from === "/") await open(page);
      else await page.goto(from);
      const trigger = header(page).getByRole("button", {
        name: "Services",
        exact: true,
      });
      await trigger.hover();
      await megaPanel(page)
        .getByRole("link", { name: /Custom itinerary with Belén/ })
        .click();
      await expect(page).toHaveURL(/\/#services$/);
      // Smooth scroll (CSS) settles the section at the top of the viewport.
      await expect
        .poll(() =>
          page.evaluate(() =>
            Math.abs(
              document.getElementById("services")?.getBoundingClientRect()
                .top ?? Number.POSITIVE_INFINITY,
            ),
          ),
        )
        .toBeLessThan(1);
    });
  }

  test("panel still closes when the pointer leaves the navbar upward (QA-0001)", async ({
    page,
  }) => {
    await open(page);
    const trigger = header(page).getByRole("button", {
      name: "Sobre mí",
      exact: true,
    });
    await trigger.hover();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const from = await box(trigger);
    await page.mouse.move(from.x + from.width / 2, 2, { steps: 10 });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});

/* ---- Moving marker (DDR-0003; T011) ---------------------------------- */

/** Dot rest position on an item (page coords): 24px in from the right, 15px down. */
const DOT_OFFSET = { right: 24, top: 15 };

async function openByHover(page: Page, label: string): Promise<Locator> {
  const trigger = header(page).getByRole("button", {
    name: label,
    exact: true,
  });
  await trigger.hover();
  const panel = megaPanel(page);
  await expect(panel).toBeVisible();
  // The marker chunk is dynamic: wait until it has mounted in this panel.
  await expect(panel).toHaveAttribute("data-marker-ready", "");
  return panel;
}

/** Whether the dot rests on `item` now (x/y within half a pixel, scale 1). */
async function dotRestsOn(panel: Locator, item: Locator): Promise<boolean> {
  const target = await box(item);
  const d = await box(panel.locator("[data-marker-dot]"));
  return (
    Math.abs(d.x - (target.x + target.width - DOT_OFFSET.right)) <= 0.5 &&
    Math.abs(d.y - (target.y + DOT_OFFSET.top)) <= 0.5 &&
    Math.abs(d.width - 10) <= 0.1
  );
}

/** Waits until the dot rests on `item`. */
async function expectDotOn(panel: Locator, item: Locator, timeout = 3000) {
  await expect.poll(() => dotRestsOn(panel, item), { timeout }).toBe(true);
}

/** The highlight's visible rect, from its clip-path inset against the marker root. */
async function highlightBox(panel: Locator): Promise<Box> {
  return panel.locator("[data-nav-marker]").evaluate((root) => {
    const layer = root.querySelector<HTMLElement>("[data-marker-layer]");
    const r = root.getBoundingClientRect();
    const m = /inset\(([-\d.]+)px ([-\d.]+)px ([-\d.]+)px ([-\d.]+)px/.exec(
      layer ? getComputedStyle(layer).clipPath : "",
    );
    if (!m) throw new Error("no clip-path inset on the highlight");
    const [top, right, bottom, left] = m.slice(1).map(Number) as [
      number,
      number,
      number,
      number,
    ];
    return {
      x: r.left + left,
      y: r.top + top,
      width: r.width - left - right,
      height: r.height - top - bottom,
    };
  });
}

function overlaps(a: Box, b: Box): boolean {
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
}

test.describe("navbar moving marker (DDR-0003) @feature-sobre-mi", () => {
  test.beforeEach(({ page }) => {
    test.skip(!isDesktop(page), "mega-menu exists at >= 1024 only");
  });

  for (const [label] of PANELS) {
    test(`${label}: one highlight and one dot follow the pointer (AC 4)`, async ({
      page,
    }) => {
      await open(page);
      const panel = await openByHover(page, label);
      const items = panel.locator("[data-nav-item]");
      await expect(panel.locator("[data-marker-layer]")).toHaveCount(1);
      await expect(panel.locator("[data-marker-dot]")).toHaveCount(1);

      const first = items.first();
      const last = items.last();
      await first.hover();
      await expectDotOn(panel, first);
      await last.hover();
      await expectDotOn(panel, last);
      await expect
        .poll(async () => {
          const h = await highlightBox(panel);
          const t = await box(last);
          return [h.x - t.x, h.y - t.y, h.width - t.width, h.height - t.height]
            .map((v) => Math.round(Math.abs(v)))
            .join(",");
        })
        .toBe("0,0,0,0");
      // The item's own hover background is off: the marker is the highlight.
      await expect(last).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    });
  }

  test("follows keyboard focus (AC 4)", async ({ page }) => {
    await open(page);
    const trigger = header(page).getByRole("button", {
      name: "Sobre mí",
      exact: true,
    });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const panel = megaPanel(page);
    await expect(panel).toHaveAttribute("data-marker-ready", "");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expectDotOn(panel, panel.locator("[data-nav-item]").nth(1));
  });

  test("retargets mid-flight to the latest item", async ({ page }) => {
    await open(page);
    const panel = await openByHover(page, "Itineraries");
    const items = panel.locator("[data-nav-item]");
    await items.nth(0).hover();
    await expectDotOn(panel, items.nth(0));
    await items.nth(11).hover();
    await page.waitForTimeout(120);
    await items.nth(5).hover();
    await expectDotOn(panel, items.nth(5));
    await expect(panel.locator("[data-marker-dot]")).toHaveCount(1);
  });

  for (const [label] of PANELS) {
    test(`${label}: the dot never covers a title, tag or price (AC 7)`, async ({
      page,
    }) => {
      await open(page);
      const panel = await openByHover(page, label);
      const items = panel.locator("[data-nav-item]");
      const count = await items.count();
      for (let i = 0; i < count; i++) {
        const item = items.nth(i);
        await item.hover();
        await expectDotOn(panel, item);
        const dot = await box(panel.locator("[data-marker-dot]"));
        const blockers = [item.locator("[data-nav-title]")];
        for (const text of ["Best seller", "New", "Most popular"]) {
          const tag = item.getByText(text, { exact: true });
          if (await tag.count()) blockers.push(tag);
        }
        for (const price of ["from €25", "€149", "€290", "See details"]) {
          const el = item.getByText(price, { exact: true });
          if (await el.count()) blockers.push(el);
        }
        for (const blocker of blockers) {
          expect(overlaps(dot, await box(blocker))).toBe(false);
        }
      }
    });
  }

  for (const [label, slug] of PANELS) {
    test(`${label}: hover snapshot`, async ({ page }) => {
      await open(page);
      const panel = await openByHover(page, label);
      const item = panel.locator("[data-nav-item]").nth(1);
      await item.hover();
      await expectDotOn(panel, item);
      await page.waitForTimeout(400);
      await isolate(page);
      await expect(page).toHaveScreenshot(`navbar-panel-${slug}-hover.png`, {
        clip: union(await box(header(page)), await box(panel)),
        animations: "disabled",
      });
    });
  }

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("the marker jumps with no travel (AC 8)", async ({ page }) => {
      await open(page);
      const panel = await openByHover(page, "Guides");
      const items = panel.locator("[data-nav-item]");
      await items.nth(0).hover();
      await expectDotOn(panel, items.nth(0), 500);
      await items.nth(11).hover();
      await page.evaluate(
        () =>
          new Promise<void>((r) =>
            requestAnimationFrame(() => requestAnimationFrame(() => r())),
          ),
      );
      // Two frames after the hover, the dot already rests on the target: no tween.
      expect(await dotRestsOn(panel, items.nth(11))).toBe(true);
    });
  });
});

test.describe("navbar marker on a Sobre mí route (AC 5, 6, 9) @feature-sobre-mi", () => {
  test("opens on the current page with no travel and returns to it (AC 5, 6)", async ({
    page,
  }) => {
    test.skip(!isDesktop(page), "mega-menu exists at >= 1024 only");
    await page.goto("/colaboraciones");
    await page.evaluate(() => document.fonts.ready);
    const panel = await openByHover(page, "Sobre mí");
    const current = panel.locator('[data-nav-item][aria-current="page"]');
    await expect(current).toHaveAttribute("href", "/colaboraciones");
    await expect(panel.locator('[aria-current="page"]')).toHaveCount(1);
    // No travel: already on the current item two frames after mounting.
    await page.evaluate(
      () =>
        new Promise<void>((r) =>
          requestAnimationFrame(() => requestAnimationFrame(() => r())),
        ),
    );
    expect(await dotRestsOn(panel, current)).toBe(true);
    const other = panel.locator("[data-nav-item]").last();
    await other.hover();
    await expectDotOn(panel, other);
    // Pointer leaves the items but stays in the panel: back to the current page.
    const box0 = await box(panel);
    await page.mouse.move(box0.x + box0.width - 8, box0.y + box0.height - 8);
    await expectDotOn(panel, current);
  });

  test("drawer marks the current page with aria-current and the dot (AC 9)", async ({
    page,
  }) => {
    test.skip(isDesktop(page), "drawer exists below 1024 only");
    await page.goto("/colaboraciones");
    await header(page).getByRole("button", { name: "Toggle menu" }).click();
    const drawer = header(page).locator("> div.overflow-y-auto");
    const current = drawer.locator('[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAttribute("href", "/colaboraciones");
    await expect(current.locator("[data-current-dot]")).toBeVisible();
  });
});
