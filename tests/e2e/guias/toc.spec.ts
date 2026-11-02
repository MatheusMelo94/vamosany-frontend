import { test, expect, type Page } from "@playwright/test";

/**
 * The "En esta guía" index and the keyboard path on a guide (spec AC 21-26,
 * 39; plan § 7, § 10). Real scrolling, sticky and hash behavior only exist in a
 * browser (plan § 14). The subte guide has 8 sections.
 */
const PATH = "/guias/el-subte-explicado";
const SECTIONS = [
  ["como-se-paga", "Cómo se paga"],
  ["tope", "El tope semanal"],
  ["otros-datos", "Otros datos"],
  ["uptown-y-downtown", "Uptown y downtown"],
  ["las-lineas", "Las líneas"],
  ["express-y-local", "Express y local"],
  ["apps-que-te-van-a-salvar", "Apps que te van a salvar"],
  ["tips-para-moverte-como-local", "Tips para moverte como local"],
] as const;

const aside = (page: Page) =>
  page.getByRole("navigation", { name: "En esta guía" });
const isWide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 961;

/** The text of every index link marked aria-current="location". */
const activeItems = (page: Page) =>
  aside(page).locator('a[aria-current="location"]').allTextContents();

const scrollInstantly = (page: Page, top: number) =>
  page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top);

/** Absolute document top of an element. */
const docTop = (page: Page, id: string) =>
  page.evaluate(
    (i) =>
      (document.getElementById(i)?.getBoundingClientRect().top ?? 0) +
      window.scrollY,
    id,
  );

/** Resolves once the (smooth) scroll has stopped: the same offset for five frames. */
const scrollSettled = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let last = -1;
        let same = 0;
        const tick = () => {
          same = window.scrollY === last ? same + 1 : 0;
          last = window.scrollY;
          if (same >= 5) resolve();
          else requestAnimationFrame(tick);
        };
        tick();
      }),
  );

/** The index is interactive once hydrated: the first item gets marked. */
async function open(page: Page, path = PATH) {
  await page.goto(path);
  if (isWide(page))
    await expect(aside(page).locator("a[aria-current]")).toHaveCount(1);
}

test.describe("index (aside, >= 961px) @feature-guias", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      !testInfo.project.name.includes("desktop"),
      "the aside exists at >= 961px",
    );
  });

  test("is sticky 112px below the top on a tall viewport (AC 21)", async ({
    page,
  }) => {
    await open(page);
    const wrapper = page.locator("aside[aria-label='Más sobre esta guía']");
    await expect(wrapper).toHaveCSS("position", "sticky");
    await expect(wrapper).toHaveCSS("top", "112px");
    await scrollInstantly(page, 1500);
    await expect
      .poll(async () => Math.round((await wrapper.boundingBox())?.y ?? 0))
      .toBe(112);
  });

  test.describe("short viewport (AC 25)", () => {
    test.use({ viewport: { width: 1280, height: 600 } });

    test("is not sticky below 720px of height", async ({ page }) => {
      await open(page);
      await expect(
        page.locator("aside[aria-label='Más sobre esta guía']"),
      ).toHaveCSS("position", "static");
    });
  });

  test("has one item per section, labelled with the H2 or its tocLabel (AC 21)", async ({
    page,
  }) => {
    await open(page);
    await expect(aside(page).getByRole("link")).toHaveText(
      SECTIONS.map(([, label]) => label),
    );
    const more = page.getByRole("navigation", {
      name: "Más de Moverte por la ciudad",
    });
    await expect(more.getByRole("link")).toHaveCount(3);
  });

  test("marks exactly one item as you read: the first at the top, the last at the bottom (AC 22)", async ({
    page,
  }) => {
    await open(page);
    expect(await activeItems(page)).toEqual(["Cómo se paga"]);

    // heading 3 at 100px from the top: it has passed the 120px line
    await scrollInstantly(page, (await docTop(page, "otros-datos")) - 100);
    await expect.poll(() => activeItems(page)).toEqual(["Otros datos"]);

    // heading 3 at 130px: not yet passed, the one before stays active
    await scrollInstantly(page, (await docTop(page, "otros-datos")) - 130);
    await expect.poll(() => activeItems(page)).toEqual(["El tope semanal"]);

    await scrollInstantly(page, 100000);
    await expect
      .poll(() => activeItems(page))
      .toEqual(["Tips para moverte como local"]);
    await scrollInstantly(page, 0);
    await expect.poll(() => activeItems(page)).toEqual(["Cómo se paga"]);
  });

  test("a click scrolls the H2 below the navbar, updates the hash and focuses it; Tab continues after it (AC 23)", async ({
    page,
  }) => {
    await open(page);
    await aside(page).getByRole("link", { name: "Las líneas" }).click();
    await expect(page).toHaveURL(/#las-lineas$/);
    const heading = page.locator("#las-lineas");
    await expect(heading).toBeFocused();
    // smooth scroll settles with the H2 at the 112px scroll margin
    await expect
      .poll(async () => Math.round((await heading.boundingBox())?.y ?? 0), {
        timeout: 10_000,
      })
      .toBe(112);
    await page.keyboard.press("Tab");
    const after = await page.evaluate(() => {
      const h = document.getElementById("las-lineas") as HTMLElement;
      const f = document.activeElement as HTMLElement;
      return {
        following: Boolean(
          h.compareDocumentPosition(f) & Node.DOCUMENT_POSITION_FOLLOWING,
        ),
        inIndex: Boolean(f.closest("nav[aria-label='En esta guía']")),
      };
    });
    expect(after.following).toBe(true);
    expect(after.inIndex).toBe(false);
  });

  test("a click during the page's first moments still ends with the H2 at the scroll margin (AC 23, RV-0049)", async ({
    page,
  }) => {
    // The motion controller's ScrollTrigger refresh resets the scroll to 0 and
    // back, which cancels a smooth scroll already under way. Slowing the CPU
    // and clicking as soon as the link exists makes that collision certain.
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.goto(PATH, { waitUntil: "commit" });
    const link = aside(page).getByRole("link", { name: "Las líneas" });
    await link.click();
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
    await expect(page).toHaveURL(/#las-lineas$/);
    await expect
      .poll(
        async () =>
          Math.round((await page.locator("#las-lineas").boundingBox())?.y ?? 0),
        { timeout: 10_000 },
      )
      .toBe(112);
  });

  test("a #hash on load opens at that section, clear of the navbar, with its item active (AC 26)", async ({
    page,
  }) => {
    await page.goto(`${PATH}#tope`);
    await expect.poll(() => activeItems(page)).toEqual(["El tope semanal"]);
    const y = Math.round((await page.locator("#tope").boundingBox())?.y ?? 0);
    expect(y).toBe(112);
    // the page adds no focus handling of its own on load: the browser's native
    // fragment focus on the tabindex=-1 heading shows no focus ring
    expect(
      await page
        .locator("#tope")
        .evaluate((el) => el.matches(":focus-visible")),
    ).toBe(false);
  });

  test("an unknown hash leaves the page at the top with the first item active (AC 26)", async ({
    page,
  }) => {
    await page.goto(`${PATH}#no-existe`);
    await expect.poll(() => activeItems(page)).toEqual(["Cómo se paga"]);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("keyboard only: breadcrumb, closing band, pager, index, then the group's guides, focus always visible and never under the navbar (AC 39)", async ({
    page,
  }) => {
    await open(page);
    await page
      .getByRole("navigation", { name: "Ruta" })
      .getByRole("link", { name: "Guías" })
      .focus();
    const stops: string[] = [];
    const record = async () => {
      await scrollSettled(page);
      const state = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const hit = document.elementFromPoint(
          r.left + r.width / 2,
          r.top + r.height / 2,
        );
        return {
          name: (el.textContent ?? "").trim().replace(/\s+/g, " "),
          visible:
            cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 3,
          unobscured: hit === el || el.contains(hit),
        };
      });
      expect(state.visible, `focus ring on "${state.name}"`).toBe(true);
      expect(state.unobscured, `"${state.name}" is not covered`).toBe(true);
      stops.push(state.name);
    };
    await record();
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("Tab");
      await record();
    }
    expect(stops).toEqual([
      "Guías",
      "Moverte por la ciudad",
      "Quiero mi itinerario",
      "← Volver aTodas las guías",
      "Siguiente guía →Desde el aeropuerto",
      ...SECTIONS.map(([, label]) => label),
      "Desde el aeropuertoJFK, Newark y LaGuardia comparados.",
      "Caminar por New YorkCómo entender la ciudad y recorrerla a pie.",
      "Cómo moverte por New YorkSubte, Uber, bus o a pie: cuándo conviene cada uno.",
    ]);
  });
});

test.describe("index (details, < 961px) @feature-guias", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name.includes("desktop"),
      "the details index is for < 961px",
    );
  });

  test("lists the same sections and keeps the aside index out of the accessibility tree (AC 24)", async ({
    page,
  }) => {
    await open(page);
    const summary = page.locator("details > summary", {
      hasText: "En esta guía",
    });
    await expect(summary).toBeVisible();
    await expect(aside(page)).toHaveCount(0); // getByRole skips display:none
    await summary.click();
    const links = page.locator("details").getByRole("link");
    await expect(links).toHaveText(SECTIONS.map(([, label]) => label));
    const box = await summary.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });

  test("choosing a section closes the details, goes there and focuses the heading (AC 24)", async ({
    page,
  }) => {
    await open(page);
    const details = page.locator("details", { hasText: "En esta guía" });
    await details.locator("summary").click();
    await expect(details).toHaveAttribute("open", "");
    await details.getByRole("link", { name: "El tope semanal" }).click();
    await expect(details).not.toHaveAttribute("open", "");
    await expect(page).toHaveURL(/#tope$/);
    await expect(page.locator("#tope")).toBeFocused();
    await expect
      .poll(
        async () =>
          Math.round((await page.locator("#tope").boundingBox())?.y ?? 0),
        {
          timeout: 10_000,
        },
      )
      .toBe(112);
  });

  test("'Más de <grupo>' comes after the pager (AC 24)", async ({ page }) => {
    await open(page);
    const order = await page.evaluate(() => {
      const pager = document.querySelector(
        "nav[aria-label='Más guías']",
      ) as Element;
      const more = document.querySelector(
        "nav[aria-label^='Más de ']",
      ) as Element;
      return Boolean(
        pager.compareDocumentPosition(more) & Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });
    expect(order).toBe(true);
  });
});
