# Bug 0009: AC 46 "open and close are instant" fails intermittently on tablet-768: a byte-exact screenshot compare hits 4 anti-aliased pixels on the capsule corner, and it does so with the drawer never opened too

- **Severity:** LOW
- **Found by:** E2E (the triage the T013 handoff asked for)
- **Status:** Open
- **Posture:** Production
- **Environment:** Chromium headless shell 1243 (Playwright 1.63), `tablet-768`, light, `48e6db1` local build, host load average ≤ 7.

## Reproduction
`tests/e2e/mobile-nav.spec.ts`, the `instantOpenClose()` helper (lines 1002–1018), used by both "drawer motion off" describes (reduced motion, and no `.gsap`). The failing assertion is line 1015: after close, `header.screenshot({ animations: "disabled" })` is compared **byte for byte** (`toEqual`) against the pre-open capture.

- **Feature run, 1 worker:** 102 passed, 1 failed: the **no-`.gsap`** variant at line 1015. The handoff saw the reduced-motion variant fail, so both variants are affected.
- **Triage** (`qa-ac46-triage.spec.ts`, 25 repeats per variant, tablet-768):
  - As written: **2/25 fail**.
  - With a 300ms settle after the pointer leaves the burger: **2/25 fail**. Hover isn't the cause; in the failing runs the burger's background was already `rgba(0,0,0,0)` at capture.
  - Diff in every failure: **4 pixels**, bounding box x 732–733, y 7–48 of the header capture. That's the anti-aliased right rounded corner of the capsule (backdrop-filter, `rounded-full`).
  - **Control, drawer never opened** (capture the closed header, hover the burger, move away, capture again): **3/25 fail with the identical 4-pixel box.**
  - **Control, DOM and computed style of every header node before and after open+close:** identical, except for an empty `style=""` attribute left on the burger `<svg>`. It has no computed effect, and the Engineer's own AC 42 test already accepts it.

## Expected
`frontend-qa-conventions.md § Accessibility & Performance Gates`: flaky tests are quarantined or fixed, never retried into green. CI runs `retries: 1`, which would hide this silently.

## Actual
The product behaves as specified: the frame right after each tap equals the settled frame, and nothing moves. My own "QA reduced motion" probe on 3 routes × 2 projects found no opacity below 1, no clip and no inline motion style on the first frame after each tap. The failures come from the oracle: an exact byte compare on a region where Chromium's compositor doesn't rasterize the backdrop-filtered corner deterministically.

**Not quarantined, deliberately.** `test.fixme()` would leave AC 46 (open/close) with no passing test on any project, and the fix is a one-line oracle change. This pass also doesn't edit the Engineer's spec while the Reviewer is reviewing it. The user decides whether to quarantine now or take the fix.

## Severity Justification
There is no product defect, and the test passes about 92% of the time. The cost is CI noise and a habit of re-running red builds. LOW.

## Routed To
- **Owner role:** Frontend Engineer
- **Reason:** test robustness. Suggested fixes, either one:
  - (a) compare the two captures with a small tolerance, the same as the repo's screenshots: `maxDiffPixelRatio` 0.01, or `maxDiffPixels` ≈ 10;
  - (b) clip the closed-header capture to the burger's box, which is what AC 46 is about.

  In the same change, move the pointer off the X before `drawer-top` on tablet-768: that baseline currently captures the X's hover fill. It's harmless, but it's the frozen navbar's hover state baked into a drawer baseline.
