# Bug 0016: Two guias e2e tests fail under load (drawer 12-item loop, axe details-open)

- **Severity:** LOW
- **Found by:** E2E
- **Status:** Open
- **Posture:** Production
- **Environment:** chromium tablet-768, `next start` from e2885e5, --workers=2 on a machine with load average ~19 (other agents building)

## Reproduction
`npm run build && npx playwright test --workers=2` on a loaded machine. Failures: `guias/menu.spec.ts:71` (35.6 s, hit the 30 s test timeout) and `guias/a11y.spec.ts:64` (`page.evaluate: TypeError: e[o] is not a function` raised from `waitForMotionToSettle` -> `gsapPending`, a chunk evaluated while the page was still hydrating). Re-run alone with `--repeat-each=3`: 6/6 pass (menu.spec:71 takes 20-27 s unloaded, so it has ~10 % headroom).

## Expected
Tests are stable at --workers=2 (conventions § Accessibility & Performance Gates: flakes are quarantined, not retried into green). Related to Bug 0005 and 0015.

## Actual
Intermittent red under load. Not a product defect: no failure reproduces with the machine idle. Not quarantined, so AC 6 and AC 38 stay covered; disclosed here instead.

## Severity Justification
No user impact; test robustness only. LOW.

## Routed To
- **Owner role:** Frontend Engineer
- **Reason:** implementation of the test: split the 12-item loop (or `test.slow()`), and make `gsapPending` tolerate a mid-hydration evaluate.
