import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  nextFrames,
  waitForGsapIdle,
  waitForMotionToSettle,
} from "../support/motion";

/**
 * The two UI-only forms (spec v1.1 § Form States; AC 38–45; Security G1
 * R-01). Synthetic values only (frontend-qa-conventions § Test Data Fixtures).
 */

type FormPage = {
  path: string;
  button: string;
  /** label → synthetic value, in md order */
  text: Record<string, string>;
  select: { label: string; value: string };
  /** label → empty-submit error copy, in md order */
  errors: Array<[string, string]>;
};

const PAGES: FormPage[] = [
  {
    path: "/contacto",
    button: "Enviar mensaje",
    text: {
      Nombre: "Persona Sintetica 7f3a",
      Email: "sintetico-7f3a@ejemplo.test",
      "¿Cuándo viajás? (opcional)": "marzo-sintetico-7f3a",
      Mensaje: "mensaje-sintetico-7f3a",
    },
    select: { label: "¿Sobre qué me escribís?", value: "consultoria" },
    errors: [
      ["Nombre", "Falta tu nombre."],
      ["Email", "Falta tu email para poder responderte."],
      ["¿Sobre qué me escribís?", "Elegí sobre qué me escribís."],
      ["Mensaje", "Contame en qué te puedo ayudar."],
    ],
  },
  {
    path: "/trabaja-conmigo",
    button: "Agendemos un cafecito",
    text: {
      Nombre: "Persona Sintetica 7f3a",
      "Empresa o marca": "estudio-sintetico-7f3a",
      Email: "sintetico-7f3a@ejemplo.test",
      "Contame tu idea": "idea-sintetica-7f3a",
    },
    select: {
      label: "¿Qué tipo de colaboración te interesa?",
      value: "marca",
    },
    errors: [
      ["Nombre", "Falta tu nombre."],
      ["Empresa o marca", "Falta el nombre de tu empresa o marca."],
      [
        "¿Qué tipo de colaboración te interesa?",
        "Elegí qué tipo de colaboración te interesa.",
      ],
      ["Email", "Falta tu email para poder responderte."],
      ["Contame tu idea", "Contame tu idea, aunque sea en dos líneas."],
    ],
  },
];

const CONNECTED_ONLY = [
  "Enviando…",
  "¡Recibido!",
  "No se pudo enviar tu mensaje.",
  "Uso tu email solo para responderte.",
];

const BANNER =
  "Por ahora, escribime a hola@vamosany.com. Lo que escribiste sigue acá.";
const NO_JS =
  "Para escribirme, mandame un mail a hola@vamosany.com. Te respondo yo.";

/** The banner: inside the persistent live region, the element that takes focus (RV-0012). */
const banner = (page: Page) => page.locator("main [data-sm-banner]");

/** Scoped to <main>: the footer has its own "Email address" field. */
const field = (page: Page, label: string) =>
  page.locator("main").getByLabel(label, { exact: true });

/** Every request the page makes: URL and body. */
type Req = { url: string; body: string; method: string; type: string };

function recordRequests(page: Page) {
  const requests: Req[] = [];
  page.on("request", (r) =>
    requests.push({
      url: r.url(),
      body: r.postData() ?? "",
      method: r.method(),
      type: r.resourceType(),
    }),
  );
  return requests;
}

/**
 * Anything that could carry form data: a non-GET request or one with a body.
 * (Lazy images and prefetches the page loads while it scrolls are GETs
 * without a body; `leaks()` still checks their URLs for typed values.)
 */
/**
 * Request barrier: the page fetches a sentinel URL and we wait until
 * Playwright has seen it, so every request the page started before now
 * (a submit handler's, a native form navigation's) has been recorded. A
 * condition instead of "wait N ms and hope it would have shown up". The
 * sentinel is an empty GET, so `sends` and `leaks` never count it.
 */
async function requestBarrier(page: Page): Promise<void> {
  const url = `/?e2e-barrier=${Math.random().toString(36).slice(2)}`;
  const seen = page.waitForRequest((r) => r.url().endsWith(url));
  await page.evaluate((u) => {
    void fetch(u).catch(() => undefined);
  }, url);
  await seen;
}

const sends = (requests: Req[]) =>
  requests.filter((r) => r.method !== "GET" || r.body !== "");

function leaks(requests: Req[], values: string[]): string[] {
  return requests.flatMap((r) =>
    values
      .filter(
        (v) =>
          r.url.includes(v) ||
          r.url.includes(encodeURIComponent(v)) ||
          r.body.includes(v) ||
          r.body.includes(encodeURIComponent(v)),
      )
      .map((v) => `${v} in ${r.url}`),
  );
}

async function fill(page: Page, form: FormPage) {
  for (const [label, value] of Object.entries(form.text)) {
    await field(page, label).fill(value);
  }
  await field(page, form.select.label).selectOption(form.select.value);
}

/** Serious/critical axe violations, minus the frozen footer contrast (ADR-0006). */
async function axeSerious(page: Page): Promise<string[]> {
  // An axe run is heavy under parallel load: a longer ceiling, no sleep.
  test.slow();
  // Audit the settled page: bring the form into view (its reveal fires)
  // and wait until nothing is mid-fade.
  const form = page.locator("main [data-sm-form]");
  if (await form.isVisible()) {
    await form.scrollIntoViewIfNeeded();
    // In view, its reveal must have run to the end.
    await expect(form.locator("[data-sm-field]").last()).toHaveCSS(
      "opacity",
      "1",
    );
  }
  await waitForMotionToSettle(page);
  const results = await new AxeBuilder({ page }).analyze();
  const out: string[] = [];
  for (const v of results.violations) {
    if (v.impact !== "serious" && v.impact !== "critical") continue;
    for (const n of v.nodes) {
      const target = String(n.target[0]);
      const inFooter = await page.evaluate(
        (sel) => Boolean(document.querySelector(sel)?.closest("footer")),
        target,
      );
      if (v.id === "color-contrast" && inFooter) continue;
      out.push(`${v.id}: ${target}`);
    }
  }
  return out;
}

async function hydrated(page: Page, form: FormPage) {
  await expect(page.getByRole("button", { name: form.button })).toHaveAttribute(
    "type",
    "submit",
  );
}

for (const form of PAGES) {
  test.describe(`${form.path} form @feature-sobre-mi`, () => {
    test("Field error: every error, focus on the first invalid field (AC 38)", async ({
      page,
    }) => {
      await page.goto(form.path);
      await hydrated(page, form);
      await page.getByRole("button", { name: form.button }).click();
      for (const [label, copy] of form.errors) {
        await expect(field(page, label)).toHaveAttribute(
          "aria-invalid",
          "true",
        );
        await expect(field(page, label)).toHaveAccessibleDescription(copy);
      }
      await expect(field(page, form.errors[0]?.[0] ?? "")).toBeFocused();
      expect(await axeSerious(page)).toEqual([]);
    });

    test("malformed email: its copy, cleared while typing (AC 39)", async ({
      page,
    }) => {
      await page.goto(form.path);
      await hydrated(page, form);
      await field(page, "Email").fill("sintetico-7f3a@");
      await page.getByRole("button", { name: form.button }).click();
      await expect(field(page, "Email")).toHaveAccessibleDescription(
        "Revisá tu email, parece que le falta algo.",
      );
      await field(page, "Email").pressSequentially("ejemplo.test");
      await expect(field(page, "Email")).not.toHaveAttribute("aria-invalid");
      await expect(field(page, "Email")).toHaveValue(
        "sintetico-7f3a@ejemplo.test",
      );
    });

    test("Not configured: nothing sent, one focused banner, values kept (AC 41, 42)", async ({
      page,
    }) => {
      const requests = recordRequests(page);
      await page.goto(form.path);
      await hydrated(page, form);
      const url = page.url();
      await fill(page, form);
      const before = requests.length;
      await page.getByRole("button", { name: form.button }).click();
      const region = page.locator("main").getByRole("status");
      await expect(region).toHaveText(BANNER);
      await expect(banner(page)).toBeFocused();
      await expect(
        region.getByRole("link", { name: "hola@vamosany.com" }),
      ).toHaveAttribute("href", "mailto:hola@vamosany.com");
      expect(await axeSerious(page)).toEqual([]);

      await page.getByRole("button", { name: form.button }).click();
      await expect(page.locator("main").getByRole("status")).toHaveCount(1);
      await expect(banner(page)).toHaveCount(1);
      await expect(banner(page)).toBeFocused();
      for (const [label, value] of Object.entries(form.text)) {
        await expect(field(page, label)).toHaveValue(value);
      }
      expect(page.url()).toBe(url);
      await requestBarrier(page);
      expect(sends(requests.slice(before))).toEqual([]);
      expect(leaks(requests, Object.values(form.text))).toEqual([]);

      // A later submit with an error removes the banner (AC 42).
      await field(page, "Nombre").fill("");
      await page.getByRole("button", { name: form.button }).click();
      await expect(banner(page)).toHaveCount(0);
      await expect(page.locator("main").getByRole("status")).toHaveText("");
      await expect(field(page, "Nombre")).toBeFocused();
    });

    test("Idle: axe clean, and no connected-release copy in the page or its JS (AC 43, 45)", async ({
      page,
    }) => {
      const scripts: Promise<string>[] = [];
      page.on("response", (r) => {
        if (r.url().endsWith(".js")) scripts.push(r.text().catch(() => ""));
      });
      await page.goto(form.path);
      await hydrated(page, form);
      await page.waitForLoadState("networkidle");
      const html = await page.content();
      const bodies = await Promise.all(scripts);
      expect(bodies.length).toBeGreaterThan(0);
      for (const text of CONNECTED_ONLY) {
        expect(html).not.toContain(text);
        for (const body of bodies) expect(body).not.toContain(text);
      }
      expect(await axeSerious(page)).toEqual([]);
    });

    test.describe("R-01: JavaScript disabled", () => {
      test.use({ javaScriptEnabled: false });

      test("shows the email block instead of the form, no fields (AC 44, 45)", async ({
        page,
      }) => {
        await page.goto(form.path);
        await expect(page.locator("main").getByText(NO_JS)).toBeVisible();
        await expect(
          page
            .locator("main")
            .getByRole("link", { name: "hola@vamosany.com" })
            .last(),
        ).toHaveAttribute("href", "mailto:hola@vamosany.com");
        for (const label of Object.keys(form.text)) {
          await expect(field(page, label)).toBeHidden();
        }
        await expect(page.locator("main").getByRole("textbox")).toHaveCount(0);
        await expect(
          page.getByRole("button", { name: form.button }),
        ).toHaveCount(0);
      });
    });

    test("R-01: the no-JS rendering has no serious axe violations (AC 45)", async ({
      page,
    }) => {
      // axe injects through evaluate(), which never returns with JavaScript
      // disabled. Reproduce the no-JS rendering instead: nothing hydrates
      // (chunks blocked) and the @media (scripting: none) swap is applied.
      await page.route("**/_next/static/chunks/**", (route) => route.abort());
      await page.goto(form.path, { waitUntil: "domcontentloaded" });
      // Without JS the ADR-0002 gate never adds .gsap; the inline gate script
      // still runs in this context, so undo it.
      await page.evaluate(() =>
        document.documentElement.classList.remove("gsap"),
      );
      await page.addStyleTag({
        content:
          ".noscript\\:hidden{display:none!important}.noscript\\:block{display:block!important}",
      });
      await expect(page.locator("main").getByText(NO_JS)).toBeVisible();
      await expect(page.locator("main").getByRole("textbox")).toHaveCount(0);
      expect(await axeSerious(page)).toEqual([]);
    });

    test("R-01: a click before hydration sends and navigates nothing (AC 44)", async ({
      page,
    }) => {
      let release: () => void = () => {};
      const held = new Promise<void>((r) => (release = r));
      await page.route("**/_next/static/chunks/**", async (route) => {
        await held;
        await route.continue();
      });
      const requests = recordRequests(page);

      await page.goto(form.path, { waitUntil: "domcontentloaded" });
      const url = page.url();
      const button = page.getByRole("button", { name: form.button });
      await expect(button).toHaveAttribute("type", "button");
      await fill(page, form);
      await button.click();
      // Anything the click started (a native submit would navigate) is on
      // the wire before the chunks are released.
      await requestBarrier(page);
      release();
      await hydrated(page, form);
      await requestBarrier(page);

      expect(page.url()).toBe(url);
      // One document load (the goto); the router's same-document
      // history.replaceState on hydration is not a navigation.
      expect(requests.filter((r) => r.type === "document")).toHaveLength(1);
      expect(sends(requests)).toEqual([]);
      expect(leaks(requests, Object.values(form.text))).toEqual([]);
    });
  });
}

/* ---- M8 form feedback (T039) ---------------------------------------- */

/** Records, every frame, each field wrapper's x and the banner's y/opacity. */
async function recordFeedback(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as {
      __fb: Array<{
        x: number[];
        banner: { y: number; opacity: number } | null;
      }>;
    };
    w.__fb = [];
    const tx = (el: Element) => {
      const t = getComputedStyle(el).transform;
      return t === "none" ? 0 : new DOMMatrixReadOnly(t);
    };
    const tick = () => {
      const fields = [
        ...document.querySelectorAll("main [data-sm-form] [data-sm-field]"),
      ];
      const banner = document.querySelector("main [data-sm-banner]");
      w.__fb.push({
        x: fields.map((f) => {
          const m = tx(f);
          return m === 0 ? 0 : Math.round(m.m41);
        }),
        banner: banner
          ? {
              y: (() => {
                const m = tx(banner);
                return m === 0 ? 0 : Math.round(m.m42);
              })(),
              opacity: Number(getComputedStyle(banner).opacity),
            }
          : null,
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

const feedback = (page: Page) =>
  page.evaluate(() =>
    (
      window as unknown as {
        __fb: Array<{
          x: number[];
          banner: { y: number; opacity: number } | null;
        }>;
      }
    ).__fb.splice(0),
  );

/** Brings the form into view, fully revealed (M2), before interacting. */
async function formReady(page: Page, form: FormPage) {
  await page.goto(form.path);
  await hydrated(page, form);
  await page.locator("main [data-sm-form]").scrollIntoViewIfNeeded();
  await expect(
    page.locator("main [data-sm-form] [data-sm-field]").last(),
  ).toHaveCSS("opacity", "1");
}

for (const form of PAGES) {
  test.describe(`${form.path} form feedback (T039) @feature-sobre-mi`, () => {
    test("a submit with errors shakes each invalid field once; typing doesn't (AC 38)", async ({
      page,
    }) => {
      await formReady(page, form);
      await recordFeedback(page);
      await page.getByRole("button", { name: form.button }).click();
      await waitForGsapIdle(page);
      const frames = await feedback(page);
      const invalid = form.errors.length;
      const fields = frames[0]?.x.length ?? 0;
      // Every invalid field moved; on /contacto the optional travel-date
      // field (4th wrapper) never did; everything ends back at x 0.
      const moved = Array.from({ length: fields }, (_, i) =>
        frames.some((f) => (f.x[i] ?? 0) !== 0),
      );
      expect(moved.filter(Boolean)).toHaveLength(invalid);
      if (form.path === "/contacto") expect(moved[3]).toBe(false);
      expect(frames.at(-1)?.x.every((x) => x === 0)).toBe(true);
      await expect(field(page, form.errors[0]?.[0] ?? "")).toBeFocused();

      await field(page, "Nombre").pressSequentially("Persona");
      // A shake from typing would be a pending tween here.
      await waitForGsapIdle(page);
      const typing = await feedback(page);
      expect(typing.every((f) => f.x.every((x) => x === 0))).toBe(true);
    });

    test("the banner enters from above, and replays on a repeat valid submit (AC 41, 42)", async ({
      page,
    }) => {
      await formReady(page, form);
      await fill(page, form);
      await recordFeedback(page);
      for (let round = 0; round < 2; round++) {
        await page.getByRole("button", { name: form.button }).click();
        await expect(banner(page)).toBeFocused();
        // The entrance starts on the next frame; idle = it has ended.
        await waitForGsapIdle(page);
        const frames = (await feedback(page)).filter((f) => f.banner);
        expect(frames.some((f) => (f.banner?.y ?? 0) < 0)).toBe(true);
        expect(frames.some((f) => (f.banner?.opacity ?? 1) < 1)).toBe(true);
        expect(frames.at(-1)?.banner).toEqual({ y: 0, opacity: 1 });
        await expect(banner(page)).toHaveCount(1);
        await expect(banner(page)).toBeFocused();
      }
    });

    test("typed markup stays text with motion on, and events carry only control ids (R-06)", async ({
      page,
    }) => {
      await formReady(page, form);
      await page.evaluate(() => {
        const w = window as unknown as { __events: unknown[] };
        w.__events = [];
        const root = document.querySelector("main [data-sm-form]");
        for (const type of ["sm:field-errors", "sm:banner"]) {
          root?.addEventListener(type, (e) =>
            w.__events.push({
              type,
              detail: (e as CustomEvent).detail ?? null,
            }),
          );
        }
      });
      const payload = '<b>x</b>"><img src=x onerror=alert(1)>';
      const eventCount = () =>
        page.evaluate(
          () => (window as unknown as { __events: unknown[] }).__events.length,
        );
      await field(page, "Nombre").fill(payload);
      await page.getByRole("button", { name: form.button }).click();
      await expect.poll(eventCount).toBe(1);
      await fill(page, form);
      await field(page, "Nombre").fill(payload);
      await page.getByRole("button", { name: form.button }).click();
      await expect.poll(eventCount).toBe(2);
      await waitForGsapIdle(page);
      await expect(page.locator("main b, main img[src='x']")).toHaveCount(0);
      await expect(field(page, "Nombre")).toHaveValue(payload);
      const events = await page.evaluate(
        () => (window as unknown as { __events: unknown[] }).__events,
      );
      expect(events.length).toBe(2);
      for (const e of events as Array<{ type: string; detail: unknown }>) {
        const json = JSON.stringify(e.detail);
        expect(json).not.toContain("<b>");
        expect(json).not.toContain("Persona");
        if (e.type === "sm:field-errors") {
          const ids = (e.detail as { fields: string[] }).fields;
          expect(Object.keys(e.detail as object)).toEqual(["fields"]);
          for (const id of ids)
            expect(id).toMatch(/^(contact|collab)-[a-z-]+$/);
        } else {
          expect(e.detail).toBeNull();
        }
      }
    });

    test.describe("reduced motion", () => {
      test.use({ reducedMotion: "reduce" });

      test("no shake, a static banner, the same focus (AC 38, 41)", async ({
        page,
      }) => {
        await page.goto(form.path);
        await hydrated(page, form);
        await recordFeedback(page);
        await page.getByRole("button", { name: form.button }).click();
        await expect(field(page, form.errors[0]?.[0] ?? "")).toBeFocused();
        await nextFrames(page, 4);
        const errorFrames = await feedback(page);
        expect(errorFrames.every((f) => f.x.every((x) => x === 0))).toBe(true);
        await expect(field(page, form.errors[0]?.[0] ?? "")).toBeFocused();
        await fill(page, form);
        await feedback(page);
        await page.getByRole("button", { name: form.button }).click();
        await expect(banner(page)).toBeFocused();
        await nextFrames(page, 4);
        const bannerFrames = (await feedback(page)).filter((f) => f.banner);
        expect(bannerFrames.length).toBeGreaterThan(0);
        expect(
          bannerFrames.every(
            (f) => f.banner?.y === 0 && f.banner?.opacity === 1,
          ),
        ).toBe(true);
        await expect(banner(page)).toBeFocused();
      });
    });
  });
}
