import { expect, type Page } from "@playwright/test";

/**
 * Waits until no motion target is mid-fade and nothing is about to start:
 * GSAP is idle (its settle signal; see waitForGsapIdle), and every element
 * GSAP has given an inline opacity is 0 (not revealed yet; axe ignores
 * fully transparent content) or 1 (done). With motion on, an audit taken
 * mid-fade would flag contrast that the settled page doesn't have.
 */
export async function waitForMotionToSettle(page: Page): Promise<void> {
  await waitForGsapIdle(page);
  await expect
    .poll(() =>
      page.evaluate(() =>
        [
          ...document.querySelectorAll<HTMLElement>("main [style*='opacity']"),
        ].every((el) => ["0", "1"].includes(getComputedStyle(el).opacity)),
      ),
    )
    .toBe(true);
}

/**
 * Waits until the Sobre mí motion controller has mounted: `.gsap` is on
 * <html> and GSAP has written its first inline opacity inside the scene
 * (every scene's `fromTo` renders its start state at once). A condition,
 * not a sleep: under load the dynamic chunk can take seconds to arrive.
 */
export async function waitForMotionController(page: Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            document.documentElement.classList.contains("gsap") &&
            document.querySelector(
              "main [data-sm-scene] [style*='opacity']",
            ) !== null,
        ),
      { timeout: 15_000 },
    )
    .toBe(true);
}

/**
 * How many top-level GSAP animations are still going to change something:
 * not paused (a ScrollTrigger reveal waiting for its start is paused), not
 * finished (delays included) and not an endless loop. `null` until GSAP's module is loaded. GSAP
 * isn't on window, so it is taken from the page's webpack runtime
 * (test-only), once, and cached on window.
 */
export function gsapPending(page: Page): Promise<number | null> {
  return page.evaluate(() => {
    type Anim = {
      paused(): boolean;
      progress(): number;
      repeat(): number;
      totalDuration(): number;
    };
    type Gsap = {
      globalTimeline: {
        getChildren(nested: boolean, tweens: boolean, tls: boolean): Anim[];
      };
      getTweensOf: unknown;
    };
    type Req = ((id: string) => Record<string, unknown>) & {
      m: Record<string, { toString(): string }>;
    };
    const w = window as unknown as {
      __e2eGsap?: Gsap;
      webpackChunk_N_E?: unknown[];
    };
    if (!w.__e2eGsap && w.webpackChunk_N_E) {
      let req: Req | undefined;
      w.webpackChunk_N_E.push([
        [Symbol("gsap-probe")],
        {},
        (r: Req) => {
          req = r;
        },
      ]);
      for (const id of Object.keys(req?.m ?? {})) {
        const source = req?.m[id]?.toString() ?? "";
        if (
          !source.includes("globalTimeline") ||
          !source.includes("getTweensOf")
        )
          continue;
        for (const value of Object.values(req?.(id) ?? {})) {
          const g = value as Partial<Gsap> | null;
          if (g?.globalTimeline && g.getTweensOf) {
            w.__e2eGsap = g as Gsap;
            break;
          }
        }
        if (w.__e2eGsap) break;
      }
    }
    const g = w.__e2eGsap;
    // Without the motion gate nothing animates, loaded or not.
    if (!g)
      return document.documentElement.classList.contains("gsap") ? null : 0;
    return g.globalTimeline.getChildren(false, true, true).filter(
      (a) =>
        !a.paused() &&
        a.progress() < 1 &&
        // Endless loops (the landing's ring and marquee) never settle.
        a.repeat() !== -1 &&
        a.totalDuration() < 3600,
    ).length;
  });
}

/** Resolves after `count` rendered frames in the page (GSAP ticks on rAF). */
export function nextFrames(page: Page, count = 2): Promise<void> {
  return page.evaluate(
    (n) =>
      new Promise<void>((resolve) => {
        const step = (left: number) =>
          left <= 0 ? resolve() : requestAnimationFrame(() => step(left - 1));
        step(n);
      }),
    count,
  );
}

/**
 * GSAP's settle signal: nothing is pending on two samples in a row, each
 * taken after fresh frames (a tween created on the next frame, like the
 * M8 banner's, is seen). A condition, not a sleep; the timeout is only a
 * ceiling for slow runners.
 */
export async function waitForGsapIdle(
  page: Page,
  timeout = 15_000,
): Promise<void> {
  let idleRuns = 0;
  await expect
    .poll(
      async () => {
        await nextFrames(page);
        const pending = await gsapPending(page);
        idleRuns = pending === 0 ? idleRuns + 1 : 0;
        return idleRuns >= 2;
      },
      { timeout, intervals: [0] },
    )
    .toBe(true);
}

export type Sampler<T> = {
  /** Every sample so far (one per rendered frame). */
  read(): Promise<T[]>;
  /** Stops sampling and returns every sample. */
  stop(): Promise<T[]>;
};

/**
 * Samples `fn(arg)` inside the page on every animation frame, from now until
 * stop(). Frame sampling runs in lockstep with GSAP (both are rAF), so a
 * short tween is seen however slow the test runner's round trips are.
 * `fn` runs in the page: no closures over test-side variables.
 */
export async function sampleFrames<A, T>(
  page: Page,
  fn: (arg: A) => T,
  arg: A,
): Promise<Sampler<T>> {
  const fnHandle = await page.evaluateHandle(`(${fn.toString()})`);
  const recorder = await page.evaluateHandle(
    ([f, a]) => {
      const out: unknown[] = [];
      let on = true;
      const tick = () => {
        if (!on) return;
        out.push((f as (x: unknown) => unknown)(a));
        requestAnimationFrame(tick);
      };
      tick();
      return {
        out,
        stop() {
          on = false;
        },
      };
    },
    [fnHandle, arg] as const,
  );
  return {
    read: () => recorder.evaluate((r) => r.out.slice()) as Promise<T[]>,
    stop: () =>
      recorder.evaluate((r) => {
        r.stop();
        return r.out.slice();
      }) as Promise<T[]>,
  };
}

/**
 * Waits until the landing's motion controller has mounted (it reveals the
 * hero copy with an inline opacity once the heading is split) and GSAP has
 * settled. Without `.gsap` (reduced motion) there is nothing to wait for.
 */
export async function waitForLandingMotion(page: Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            !document.documentElement.classList.contains("gsap") ||
            document.querySelector("[data-hero-copy][style*='opacity']") !==
              null,
        ),
      { timeout: 15_000 },
    )
    .toBe(true);
  await waitForGsapIdle(page);
}
