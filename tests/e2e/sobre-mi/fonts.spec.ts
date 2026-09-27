import { test, expect, type Page } from "@playwright/test";

/** Font preloads in the served HTML (T018: the italic face must not add one). */
async function fontPreloads(page: Page, path: string): Promise<string[]> {
  const response = await page.request.get(path);
  const html = await response.text();
  return [...html.matchAll(/<link[^>]*rel="preload"[^>]*as="font"[^>]*>/g)]
    .map((m) => /href="([^"]+)"/.exec(m[0])?.[1] ?? "")
    .sort();
}

test.describe("signature italic (plan D7) @feature-sobre-mi", () => {
  test("adds no font preload to the landing or to /sobre-mi", async ({
    page,
  }) => {
    const landing = await fontPreloads(page, "/");
    expect(landing).toEqual([
      "/_next/static/media/111c93f1bc244164-s.p.woff2",
      "/_next/static/media/828e2958d60bafae-s.p.woff2",
    ]);
    expect(await fontPreloads(page, "/sobre-mi")).toEqual(landing);
  });

  test("renders the signature in the real Courier Prime italic", async ({
    page,
  }) => {
    await page.goto("/sobre-mi");
    const signature = page.locator("[data-sm-signature]");
    await signature.scrollIntoViewIfNeeded();
    await expect(signature).toHaveCSS("font-style", "italic");
    await expect
      .poll(() =>
        signature.evaluate(async (el) => {
          await document.fonts.ready;
          const family = getComputedStyle(el).fontFamily;
          const faces = [...document.fonts].filter(
            (f) =>
              f.style === "italic" &&
              f.status === "loaded" &&
              family.includes(f.family.replace(/^["']|["']$/g, "")),
          );
          return faces.length > 0;
        }),
      )
      .toBe(true);
  });
});
