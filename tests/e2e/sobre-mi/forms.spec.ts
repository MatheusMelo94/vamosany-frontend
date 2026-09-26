import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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
      const banner = page.getByRole("status");
      await expect(banner).toHaveText(BANNER);
      await expect(banner).toBeFocused();
      await expect(
        banner.getByRole("link", { name: "hola@vamosany.com" }),
      ).toHaveAttribute("href", "mailto:hola@vamosany.com");
      expect(await axeSerious(page)).toEqual([]);

      await page.getByRole("button", { name: form.button }).click();
      await expect(page.getByRole("status")).toHaveCount(1);
      await expect(page.getByRole("status")).toBeFocused();
      for (const [label, value] of Object.entries(form.text)) {
        await expect(field(page, label)).toHaveValue(value);
      }
      expect(page.url()).toBe(url);
      await page.waitForTimeout(300);
      expect(sends(requests.slice(before))).toEqual([]);
      expect(leaks(requests, Object.values(form.text))).toEqual([]);

      // A later submit with an error removes the banner (AC 42).
      await field(page, "Nombre").fill("");
      await page.getByRole("button", { name: form.button }).click();
      await expect(page.getByRole("status")).toHaveCount(0);
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
      await page.waitForTimeout(1000);
      release();
      await hydrated(page, form);
      await page.waitForTimeout(300);

      expect(page.url()).toBe(url);
      // One document load (the goto); the router's same-document
      // history.replaceState on hydration is not a navigation.
      expect(requests.filter((r) => r.type === "document")).toHaveLength(1);
      expect(sends(requests)).toEqual([]);
      expect(leaks(requests, Object.values(form.text))).toEqual([]);
    });
  });
}
