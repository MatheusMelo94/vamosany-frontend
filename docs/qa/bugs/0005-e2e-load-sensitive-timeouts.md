# Bug 0005: 20 feature E2E cases fail under CPU contention (timeouts, motion-timing assertions), then pass on rerun

- **Severity:** LOW
- **Found by:** E2E
- **Status:** Open
- **Posture:** Production
- **Environment:** Chromium, all three projects, `1ae0c4e` local build, `--workers=4` on a shared 10-core host with load average about 21 (another agent was building and testing in parallel)

## Reproduction
1. Full run, `--workers=4`, under load: **362 passed, 20 failed**.
2. `--last-failed --workers=1`: **20/20 passed**.
3. Full run, `--workers=2`, load about 5: **382 passed, 0 failed**.

The failing cases fall into three groups:
- **30s test timeouts inside axe runs** (`structure.spec.ts:213` on `/trabaja-conmigo` and `/preguntas-frecuentes`; `forms.spec.ts:235`) and inside `page.evaluate` scroll helpers (`structure.spec.ts:147/162` on `/contacto`; `motion.spec.ts:145` on `/colaboraciones` and `/trabaja-conmigo`).
- **Motion-timing assertions** that sample mid-animation (`motion.spec.ts:724` year tick, `:840` audience rules; `faq.spec.ts:179`; `forms.spec.ts:399/425`).
- **Marker polls** with a 3s or 5s window (`navbar.spec.ts:362` for four panels, "the dot never covers…"), and the hydration wait in `forms.spec.ts:301` (the pre-hydration test).

Traces were kept locally for the session.

## Expected
`frontend-qa-conventions.md § Accessibility & Performance Gates`: flaky tests are quarantined or fixed, never retried into green. CI runs `retries: 1`, which would mask these silently on a slower runner.

## Actual
These are load-sensitive, not flaky at representative load: nothing failed across 382 cases at 2 workers. They aren't quarantined, because they aren't flaky under CI-like conditions and QA doesn't edit the feature specs.

## Severity Justification
There is no product defect. The risk is intermittent CI noise and a habit of re-running red builds. LOW.

## Suggested direction
Mark the axe-bearing and full-scroll tests `test.slow()`. Give the marker `expect.poll` calls a longer timeout. Where a motion test samples a value mid-flight, assert on the end state plus monotonic progress rather than on a specific frame. DevOps can confirm the CI `workers` count.

## Routed To
- **Owner role:** Frontend Engineer (spec robustness); DevOps FYI (CI worker count)
- **Reason:** implementation (test code)
