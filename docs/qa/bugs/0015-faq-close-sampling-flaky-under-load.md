# Bug 0015: faq.spec.ts:203 "several can be open; closing slides to 0" fails under CPU load, on main as well

- **Severity:** LOW
- **Found by:** E2E
- **Status:** Open
- **Posture:** Production
- **Environment:** Chromium (Playwright) via `npx playwright test` on the three configured projects (phone-360, tablet-768, desktop-1280), light theme, `next start` build of `1ead046` (+ test commit `6362de5`).

## Reproduction
`npx playwright test tests/e2e/sobre-mi/faq.spec.ts:203 --repeat-each=80 --workers=6`: failures on origin/main (cdd96a6) AND on this branch. With 1 worker and 40 repeats: 0 failures on the branch. With 4 workers x 40: 0/120 on main, 1/120 on the branch; with 6 workers x 80: several failures on both. Fails at line 224: no sampled frame has open && 0<height<full && glyph<45. The branch changes nothing in features/sobre-mi, the FAQ spec or globals.css, so it is pre-existing. Likely cause: the test starts sampling frames only after `summary.click()` returns; under load the 300 ms close (height + glyph, CSS transition) can finish with no sampled frame in the mid-state. The product is fine. Not quarantined (see report).

## Expected
frontend-qa-conventions § Accessibility & Performance Gates: flaky tests are quarantined or fixed, never retried into green. CI `retries: 1` hides it.

## Routed To
- **Owner role:** Frontend Engineer
- **Reason:** test oracle (start the frame sampler before the click, or assert the end state plus a relaxed mid-state).
