import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { waitForMotionToSettle } from "../support/motion";

/**
 * Route-level structure of the Sobre mí pages (spec § Shared Page Structure,
 * § Page metadata, § Accessibility Acceptance). The pages are async-free
 * Server Components, but metadata, landmarks and the layout's <main lang>
 * only exist at route level.
 */

type Route = {
  path: string;
  title: string;
  description: string;
  h1: string;
  /** spec § Accessibility Acceptance (outline) */
  h2: string[];
  closing: boolean;
};

const ROUTES: Route[] = [
  {
    path: "/sobre-mi",
    title: "Sobre mí — Vamos a NY",
    description:
      "Soy Belén, comunicadora, estratega digital y, sobre todo, una persona profundamente enamorada de New York.",
    h1: "Sobre mí",
    h2: ["En el camino", "¿Armamos tu viaje juntos?"],
    closing: true,
  },
  {
    path: "/colaboraciones",
    title: "Colaboraciones — Vamos a NY",
    description:
      "Además de itinerarios y consultorías, con los años fui creando productos para quienes aman New York tanto como yo.",
    h1: "Colaboraciones",
    h2: [
      "El cuaderno que empezó todo",
      "Agenda Vamos a New York 2023",
      "Cápsula con Mona Cases",
      "Cuadernos 2023",
      "Agenda Vamos a New York 2024",
      "Tote bags con Efe Hus",
      "Agenda Vamos a New York 2026",
      "¿Querés crear algo juntos?",
    ],
    closing: true,
  },
  {
    path: "/trabaja-conmigo",
    title: "Trabajá conmigo — Vamos a NY",
    description:
      "Si tenés una marca, un proyecto o un servicio relacionado con New York, me encantaría conocerte.",
    h1: "¿Nos tomamos un cafecito?",
    h2: [
      "Marcas que quieran colaborar",
      "Empresas de servicios en New York",
      "Guías turísticos",
      "Empresas que quieran contratar mis itinerarios",
      "Agencias de viaje",
      "El cafecito",
    ],
    closing: false,
  },
  {
    path: "/preguntas-frecuentes",
    title: "Preguntas frecuentes — Vamos a NY",
    description:
      "Itinerarios, consultorías, viajes grupales y productos: lo que más me preguntan antes de viajar a New York.",
    h1: "Lo que más me preguntan antes de viajar",
    h2: [
      "Itinerarios y consultorías",
      "Viajes grupales",
      "Productos",
      "¿No está tu pregunta? Escribime y te respondo yo.",
    ],
    closing: true,
  },
  {
    path: "/contacto",
    title: "Contacto — Vamos a NY",
    description:
      "¿Estás planificando tu viaje a New York, tenés una duda sobre algún servicio o querés proponerme una colaboración? Contame lo que necesites.",
    h1: "Escribime, te respondo yo.",
    h2: ["Otras formas de encontrarme"],
    closing: false,
  },
];

test.describe("Sobre mí pages: route structure @feature-sobre-mi", () => {
  for (const route of ROUTES) {
    test(`${route.path}: 200, title and meta description (AC 13)`, async ({
      page,
    }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(route.title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        route.description,
      );
    });

    test(`${route.path}: Spanish main, one h1, landmarks (AC 14)`, async ({
      page,
    }) => {
      await page.goto(route.path);
      await expect(page.locator('main[lang="es"]')).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(
        page.getByRole("heading", { level: 1, name: route.h1 }),
      ).toBeAttached();
      await expect(page.getByRole("banner")).toHaveCount(1);
      await expect(page.getByRole("navigation")).toHaveCount(1);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("contentinfo")).toHaveCount(1);
    });
  }
});

/** Page-order check of the template slots (AC 11). */
async function slotOrder(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const main = document.querySelector("main");
    if (!main) return [];
    const slots: Array<[string, Element | null]> = [
      ["label", main.querySelector("[data-sm-label]")],
      ["h1", main.querySelector("h1")],
      ["dek", main.querySelector("[data-sm-dek]")],
      ["body", main.querySelector("[data-sm-notes], ol")],
      ["closing", main.querySelector("[data-sm-closing]")],
    ];
    const present = slots.filter(([, el]) => el) as Array<[string, Element]>;
    return present
      .sort(([, a], [, b]) =>
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1,
      )
      .map(([name]) => name);
  });
}

test.describe("Sobre mí pages: shared structure, layout and a11y @feature-sobre-mi", () => {
  for (const route of ROUTES) {
    test(`${route.path}: slots in order and the spec's H2 outline (AC 11, 14)`, async ({
      page,
    }) => {
      await page.goto(route.path);
      expect(await slotOrder(page)).toEqual(
        route.closing
          ? ["label", "h1", "dek", "body", "closing"]
          : ["label", "h1", "dek", "body"],
      );
      const h2 = await page
        .locator("main h2")
        .evaluateAll((els) => els.map((el) => el.textContent?.trim() ?? ""));
      expect(h2).toEqual(route.h2);
    });

    test(`${route.path}: no horizontal scroll; notes above main when narrow, 200px beside it at 1280 (AC 18)`, async ({
      page,
    }) => {
      const width = page.viewportSize()?.width ?? 0;
      const widths = width <= 360 ? [320, 360] : [width];
      for (const w of widths) {
        await page.setViewportSize({ width: w, height: 780 });
        await page.goto(route.path);
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect({ w, overflow }).toEqual({ w, overflow: 0 });

        // The notes column (or the ledger's year column) vs its main column.
        const pair = await page.evaluate(() => {
          const notes =
            document.querySelector("main [data-sm-notes]") ??
            document.querySelector("main ol > li > div:first-child");
          const mainCol = notes?.nextElementSibling;
          if (!notes || !mainCol) return null;
          const n = notes.getBoundingClientRect();
          const m = mainCol.getBoundingClientRect();
          return {
            nWidth: n.width,
            nBottom: n.bottom,
            nRight: n.right,
            mTop: m.top,
            mLeft: m.left,
          };
        });
        if (!pair) throw new Error("no notes/main pair");
        if (w < 860) {
          expect(pair.nBottom).toBeLessThanOrEqual(pair.mTop);
        }
        if (w >= 1280) {
          expect(Math.round(pair.nWidth)).toBe(200);
          expect(pair.nRight).toBeLessThanOrEqual(pair.mLeft);
        }
      }
      if (width >= 1280) {
        const widest = await page
          .locator("main p.body-prose, main [data-sm-row-body]")
          .evaluateAll((els) =>
            Math.max(0, ...els.map((el) => el.getBoundingClientRect().width)),
          );
        expect(widest).toBeLessThanOrEqual(760);
      }
    });

    test(`${route.path}: axe finds no serious or critical violations (AC 20)`, async ({
      page,
    }) => {
      test.skip(
        (page.viewportSize()?.width ?? 0) === 768,
        "AC 20: idle state at 360 and 1280",
      );
      await page.goto(route.path);
      await page.evaluate(() => document.fonts.ready);
      // Idle = after the M1 entrance has settled (the label fades in, and a
      // half-transparent label rightly fails contrast mid-animation).
      await expect(page.locator("main [data-sm-label]")).toHaveCSS(
        "opacity",
        "1",
      );
      await expect
        .poll(() =>
          page
            .locator("main [data-sm-train]")
            .evaluate((el) =>
              getComputedStyle(el).getPropertyValue("--train").trim(),
            ),
        )
        .toBe("0%");
      await waitForMotionToSettle(page);
      const results = await new AxeBuilder({ page }).analyze();
      // Known, frozen (ADR-0006; landing.spec.ts KNOWN_A11Y): the footer's
      // text-white/45 captions are 4.48:1 on bg-ink. Waived only for nodes
      // that resolve inside <footer>; anything in main or the navbar fails.
      const inFooter = async (target: string) =>
        page.evaluate(
          (sel) => Boolean(document.querySelector(sel)?.closest("footer")),
          target,
        );
      const serious = [];
      for (const v of results.violations) {
        if (v.impact !== "serious" && v.impact !== "critical") continue;
        const nodes = [];
        for (const n of v.nodes) {
          const target = String(n.target[0]);
          if (v.id === "color-contrast" && (await inFooter(target))) continue;
          nodes.push(n);
        }
        if (nodes.length) serious.push({ ...v, nodes });
      }
      expect(
        serious.map(
          (v) =>
            `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
        ),
      ).toEqual([]);
    });
  }
});
