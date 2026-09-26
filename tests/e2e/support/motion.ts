import { expect, type Page } from "@playwright/test";

/**
 * Waits until no motion target is mid-fade and nothing is about to start:
 * every element GSAP has given an inline opacity is 0 (not revealed yet;
 * axe ignores fully transparent content) or 1 (done), and the picture is
 * the same across two samples 500 ms apart (a reveal that was just
 * triggered by a scroll would change it). With motion on, an audit taken
 * mid-fade would flag contrast that the settled page doesn't have.
 */
export async function waitForMotionToSettle(page: Page): Promise<void> {
  const sample = () =>
    page.evaluate(() =>
      [
        ...document.querySelectorAll<HTMLElement>("main [style*='opacity']"),
      ].map((el) => getComputedStyle(el).opacity),
    );
  let previous = "";
  await expect
    .poll(
      async () => {
        const now = await sample();
        const key = now.join(",");
        const settled =
          now.every((o) => o === "0" || o === "1") && key === previous;
        previous = key;
        return settled;
      },
      { timeout: 10_000, intervals: [500] },
    )
    .toBe(true);
}
