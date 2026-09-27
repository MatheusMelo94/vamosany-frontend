import { test, expect, type Page } from "@playwright/test";

/**
 * SplitText headings (hero h1 + every [data-split-lines]) run inside the
 * ScrollEffects controller, loaded via next/dynamic (ssr: false), so this can
 * only be observed at route level. Regression for the production console
 * warnings "GSAP target [object NodeList] not found" / "GSAP target  not found"
 * emitted from SplitText's onSplit.
 */

const SPLIT_HEADINGS = "[data-hero-copy] h1, [data-split-lines]";

function collectGsapWarnings(page: Page): string[] {
  const messages: string[] = [];
  page.on("console", (msg) => {
    if (msg.text().includes("GSAP target")) messages.push(msg.text());
  });
  return messages;
}

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    const frame = () => new Promise((r) => requestAnimationFrame(r));
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await frame();
      await frame();
    }
  });
}

/** Opacity of the heading's animated wrapper and the largest vertical offset of any line inside it. */
function headingState(page: Page, index: number) {
  return page.evaluate(
    ({ selector, i }) => {
      const heading = document.querySelectorAll<HTMLElement>(selector)[i];
      const wrapper = heading.closest<HTMLElement>(
        "[data-hero-copy], [data-heading-block]",
      );
      const offsets = [heading, ...heading.querySelectorAll<HTMLElement>("*")]
        .map((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform))
        .map((m) => Math.abs(m.m42));
      return {
        opacity: wrapper ? getComputedStyle(wrapper).opacity : "1",
        maxOffsetY: Math.max(0, ...offsets),
        text: heading.textContent?.trim() ?? "",
      };
    },
    { selector: SPLIT_HEADINGS, i: index },
  );
}

test.describe("landing split-text headings @feature-landing-motion", () => {
  test("split headings end visible and GSAP never reports a missing target", async ({
    page,
  }) => {
    const warnings = collectGsapWarnings(page);

    await page.goto("/");
    await scrollThrough(page);

    const count = await page.locator(SPLIT_HEADINGS).count();
    expect(count).toBeGreaterThan(1);

    for (let i = 0; i < count; i++) {
      await page.locator(SPLIT_HEADINGS).nth(i).scrollIntoViewIfNeeded();
      await expect
        .poll(() => headingState(page, i), { timeout: 15_000 })
        .toMatchObject({ opacity: "1", maxOffsetY: 0 });
      expect((await headingState(page, i)).text).not.toBe("");
    }

    expect(warnings).toEqual([]);
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("split headings render visible and unsplit, with no GSAP warnings", async ({
      page,
    }) => {
      const warnings = collectGsapWarnings(page);

      await page.goto("/");
      await scrollThrough(page);

      const count = await page.locator(SPLIT_HEADINGS).count();
      for (let i = 0; i < count; i++) {
        await expect(page.locator(SPLIT_HEADINGS).nth(i)).toBeVisible();
        expect(await headingState(page, i)).toMatchObject({
          opacity: "1",
          maxOffsetY: 0,
        });
      }

      expect(warnings).toEqual([]);
    });
  });
});
