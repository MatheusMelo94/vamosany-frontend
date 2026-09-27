import { test, expect, type Page } from "@playwright/test";
import { waitForGsapIdle, waitForMotionToSettle } from "../support/motion";

/**
 * QA's extra journeys for Sobre mí (docs/qa/test-passes/2026-09-26_sobre-mi_v1.md),
 * promoted from the QA evidence file: only the cases no other test covers.
 * Condition-based waits only (RV-0007). Synthetic data only.
 */

const ROUTES = [
  "/sobre-mi",
  "/colaboraciones",
  "/trabaja-conmigo",
  "/contacto",
  "/preguntas-frecuentes",
] as const;

const FORMS = [
  {
    path: "/contacto",
    button: "Enviar mensaje",
    order: [
      "Nombre",
      "Email",
      "¿Sobre qué me escribís?",
      "¿Cuándo viajás? (opcional)",
      "Mensaje",
    ],
    fill: async (page: Page) => {
      await field(page, "Nombre").fill("Persona Sintetica 7f3a");
      await field(page, "Email").fill("sintetico-7f3a@ejemplo.test");
      await field(page, "¿Sobre qué me escribís?").selectOption({ index: 1 });
      await field(page, "Mensaje").fill("mensaje-sintetico-7f3a");
    },
  },
  {
    path: "/trabaja-conmigo",
    button: "Agendemos un cafecito",
    order: [
      "Nombre",
      "Empresa o marca",
      "¿Qué tipo de colaboración te interesa?",
      "Email",
      "Contame tu idea",
    ],
    fill: async (page: Page) => {
      await field(page, "Nombre").fill("Persona Sintetica 7f3a");
      await field(page, "Empresa o marca").fill("estudio-sintetico-7f3a");
      await field(page, "¿Qué tipo de colaboración te interesa?").selectOption({
        index: 1,
      });
      await field(page, "Email").fill("sintetico-7f3a@ejemplo.test");
      await field(page, "Contame tu idea").fill("idea-sintetica-7f3a");
    },
  },
] as const;

const isDesktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;
const header = (page: Page) => page.locator("header[data-nav]");
const field = (page: Page, label: string) =>
  page.locator("main").getByLabel(label, { exact: true });

async function hydrated(page: Page, button: string) {
  await expect(page.getByRole("button", { name: button })).toHaveAttribute(
    "type",
    "submit",
  );
}

/**
 * Visible elements in <main>/<header> that stick out of the viewport
 * horizontally and aren't clipped by a fitting ancestor (QA's probe).
 */
function overflowReport(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out: string[] = [];
    const sw = document.scrollingElement!.scrollWidth;
    if (sw > vw) out.push(`scrollWidth ${sw} > ${vw}`);
    for (const el of document.querySelectorAll<HTMLElement>(
      "main *, header *",
    )) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const s = getComputedStyle(el);
      if (s.visibility === "hidden" || s.opacity === "0") continue;
      if (el.closest("[aria-hidden='true']")) continue;
      if (r.right <= vw + 0.5 && r.left >= -0.5) continue;
      let clipped = false;
      for (
        let p = el.parentElement;
        p && p !== document.body;
        p = p.parentElement
      ) {
        const ps = getComputedStyle(p);
        if (ps.overflowX !== "visible" || ps.clipPath !== "none") {
          const pr = p.getBoundingClientRect();
          if (pr.right <= vw + 0.5 && pr.left >= -0.5) {
            clipped = true;
            break;
          }
        }
      }
      if (!clipped)
        out.push(
          `${el.tagName.toLowerCase()} "${(el.textContent ?? "").trim().slice(0, 30)}" [${Math.round(r.left)},${Math.round(r.right)}]`,
        );
    }
    return out.slice(0, 15);
  });
}

/** Scrolls through the page (two frames per step) and waits for motion to settle. */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const frame = () => new Promise((r) => requestAnimationFrame(r));
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await frame();
      await frame();
    }
    window.scrollTo(0, document.body.scrollHeight);
  });
  await waitForMotionToSettle(page);
}

test.describe("QA journeys: navbar keyboard @feature-sobre-mi", () => {
  test("Tab walks the five Sobre mí items in order, each with a visible focus indicator; the current page is marked", async ({
    page,
  }) => {
    test.skip(!isDesktop(page), "mega-menu at >= 1024 only");
    await page.goto("/contacto");
    const trigger = header(page).getByRole("button", {
      name: "Sobre mí",
      exact: true,
    });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const stops: Array<{ href: string | null; indicator: boolean }> = [];
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      stops.push(
        await page.evaluate(() => {
          const el = document.activeElement as HTMLElement;
          const s = getComputedStyle(el);
          return {
            href: el.getAttribute("href"),
            indicator:
              (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) ||
              s.boxShadow !== "none",
          };
        }),
      );
    }
    expect(stops.map((s) => s.href)).toEqual([
      "/sobre-mi",
      "/colaboraciones",
      "/trabaja-conmigo",
      "/contacto",
      "/preguntas-frecuentes",
    ]);
    expect(stops.every((s) => s.indicator)).toBe(true);
    await expect(
      header(page).locator('.nav-capsule [aria-current="page"]'),
    ).toHaveAttribute("href", "/contacto");
  });
});

test.describe("QA journeys: closing row (AC 26) @feature-sobre-mi", () => {
  test("'Ver itinerarios' lands on the landing's services section", async ({
    page,
  }) => {
    await page.goto("/sobre-mi");
    await page
      .locator("main")
      .getByRole("link", { name: "Ver itinerarios" })
      .click();
    await expect(page).toHaveURL(/\/#services$/);
    await expect(page.locator("#services")).toBeInViewport();
  });
});

for (const form of FORMS) {
  test.describe(`QA journeys: ${form.path} keyboard path @feature-sobre-mi`, () => {
    test("Tab moves through the fields in md order, never under the sticky capsule", async ({
      page,
    }) => {
      await page.goto(form.path);
      await hydrated(page, form.button);
      await field(page, form.order[0]).focus();
      const capsule = header(page).locator(".nav-capsule");
      const seen: string[] = [];
      const obscured: string[] = [];
      for (let i = 0; i <= form.order.length; i++) {
        if (i > 0) await page.keyboard.press("Tab");
        const stop = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement;
          const label = el.id
            ? document.querySelector(`label[for="${el.id}"]`)
            : null;
          return {
            name: (label?.textContent ?? el.textContent ?? "")
              .replace(/\s+/g, " ")
              .trim(),
            top: el.getBoundingClientRect().top,
          };
        });
        const box = (await capsule.boundingBox())!;
        seen.push(stop.name);
        if (stop.top < box.y + box.height)
          obscured.push(`${stop.name}@${Math.round(stop.top)}`);
      }
      expect(seen).toEqual([...form.order, form.button]);
      expect(obscured).toEqual([]);
    });

    test("from the focused Not-configured banner, Tab reaches its email link", async ({
      page,
    }) => {
      await page.goto(form.path);
      await hydrated(page, form.button);
      await form.fill(page);
      await page.getByRole("button", { name: form.button }).click();
      await expect(page.locator("main [data-sm-banner]")).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(
        page.locator("main [data-sm-banner]").getByRole("link", {
          name: "hola@vamosany.com",
        }),
      ).toBeFocused();
    });

    test("Enter in a text field submits; a double click keeps one banner", async ({
      page,
    }) => {
      await page.goto(form.path);
      await hydrated(page, form.button);
      await form.fill(page);
      await field(page, "Email").press("Enter");
      await expect(page.locator("main [data-sm-banner]")).toBeFocused();
      await page.getByRole("button", { name: form.button }).dblclick();
      await expect(page.locator("main [data-sm-banner]")).toBeFocused();
      await waitForGsapIdle(page);
      await expect(page.locator("main").getByRole("status")).toHaveCount(1);
      await expect(page.locator("main [data-sm-banner]")).toHaveCount(1);
    });
  });
}

test.describe("QA journeys: long input @feature-sobre-mi", () => {
  test("a long email, a long unbroken name and emoji don't widen the page; the error line wraps", async ({
    page,
  }) => {
    await page.goto("/contacto");
    await hydrated(page, "Enviar mensaje");
    const long = `sintetico.${"x".repeat(90)}ejemplo-muy-largo-sintetico.test`;
    await field(page, "Email").fill(long);
    await field(page, "Nombre").fill(
      `${"Supercalifragilisticoespialidoso".repeat(3)} 🗽🍎✨`,
    );
    await page.getByRole("button", { name: "Enviar mensaje" }).click();
    await expect(field(page, "Email")).toHaveAttribute("aria-invalid", "true");
    await waitForMotionToSettle(page);
    expect(await overflowReport(page)).toEqual([]);
  });
});

const VIEWS = [
  { name: "landscape phone 640x360", width: 640, height: 360, mobile: true },
  {
    name: "200% zoom of 1280 (640x400)",
    width: 640,
    height: 400,
    mobile: false,
  },
] as const;

for (const v of VIEWS) {
  test.describe(`QA journeys: no horizontal overflow, ${v.name} @feature-sobre-mi`, () => {
    test.use({
      viewport: { width: v.width, height: v.height },
      isMobile: v.mobile,
      hasTouch: v.mobile,
    });
    test.beforeEach(({}, info) => {
      test.skip(info.project.name !== "phone-360", "viewport set here: once");
    });

    for (const route of ROUTES) {
      test(`${route}, motion on, after a full scroll`, async ({ page }) => {
        test.slow();
        await page.goto(route);
        await scrollThrough(page);
        expect(await overflowReport(page)).toEqual([]);
      });
    }

    test.describe("JavaScript disabled", () => {
      test.use({ javaScriptEnabled: false });
      for (const route of ["/contacto", "/trabaja-conmigo"]) {
        test(`${route}: the email block fits`, async ({ page }) => {
          await page.goto(route);
          expect(await overflowReport(page)).toEqual([]);
        });
      }
    });
  });
}

test.describe("QA journeys: reduced motion hides nothing @feature-sobre-mi", () => {
  test.use({ reducedMotion: "reduce" });
  for (const route of ROUTES) {
    test(`${route}: no text in <main> is transparent or hidden`, async ({
      page,
    }) => {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const hidden = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>("main *")]
          .filter((el) => {
            const s = getComputedStyle(el);
            return (
              el.getClientRects().length > 0 &&
              (s.opacity === "0" || s.visibility === "hidden") &&
              !el.closest("[aria-hidden='true']") &&
              (el.textContent ?? "").trim().length > 0
            );
          })
          .map(
            (el) =>
              `${el.tagName} ${(el.textContent ?? "").trim().slice(0, 30)}`,
          ),
      );
      expect(hidden).toEqual([]);
    });
  }
});
