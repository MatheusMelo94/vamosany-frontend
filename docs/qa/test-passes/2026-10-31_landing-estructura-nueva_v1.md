# Test Pass: vamosany-front-end — Landing nueva estructura (DDR-0008) v1

- **Date:** 2026-10-31
- **Reviewed commits:** `cdd96a6..1ead046` on `feat/landing-estructura-nueva` (not pushed), plus QA test commit `6362de5`
- **Environment:** local `next start` (port 3100, `npm run build` of the branch); Chromium, projects phone-360 / tablet-768 / desktop-1280
- **Test Plan reference:** derived on the spot from DDR-0008 (no formal spec, by user decision). Label: Draft — no spec.
- **Posture:** Production (screenshots ignored locally; baseline regenerated in CI)
- **Gate Recommendation:** **FAIL** (open HIGH: QA-0010, QA-0011)

## E2E Results
- Full suite (`npx playwright test --workers=2`) on `236c5fe`: 592 passed, 0 failed, 200 skipped (project-scoped skips). Typecheck, lint and Vitest green.
- New spec `tests/e2e/landing-estructura.spec.ts` (`@feature-landing-estructura-nueva`): 36 tests, 12 pass/project-case groups; 24 skipped = 3 quarantined cases (QA-0010 motion-on, QA-0011) + desktop-only nav test on narrow projects; 0 failures after quarantine. Stable over 3 repeats.
- Covered: section order and removed sections gone (motion on and reduced); stats end at `+200`, `+20`, `+1000 km` (motion on and reduced; `es` does not group 1000); tab keyboard (roving tabindex, Arrow wrap, Home/End, one tab stop, panel labelled by the tab, Tab into panel); no horizontal overflow in `#recomendados` for every tab at 360/768/1280; reviews carousel (10 reseñas, next button scrolls); desktop nav has the 4 groups.
- Failure details: Broadway/Internet cards invisible with motion on (QA-0010).

## Accessibility Results
- axe in `#recomendados` (3 tabs x 3 viewports): critical 0, serious 1 rule (color-contrast, QA-0011), moderate/minor 0.
- Whole-landing axe test still passes only because `landing.spec.ts` allowlists `color-contrast` and `scrollable-region-focusable` (known, ADR-0006). The reviews carousel is not focusable but has labelled prev/next buttons.
- Manual keyboard pass (automated as above): DONE for the tabs; menu/drawer keyboard covered by the existing 592-test suite. CTA form: input has a label (sr-only), `aria-label` on the form; submit behaviour is QA-0012. Screen-reader spot check: not done (no SR in this environment).
- Reduced motion: tabs/cards, stats and structure checked with `reducedMotion: reduce`: content visible at once, stats show final values.

## Visual Regression Results
- Local screenshots are ignored by config; CI regenerates the baseline. Not compared here. No local visual diff review was possible: reviewer must check the CI "update snapshots" artifacts.

## Regression Results
- In scope (widened: shared nav/footer/layout, `app/layout`, scroll-effects): landing, navbar, mobile-nav, not-found, typography, split-text and all Sobre mí specs — all pass.
- English scan (text, aria-label, placeholder, alt, title) on `/`, the 5 Sobre mí pages, 404, menu, drawer, footer: no leftover English UI copy. Remaining English = proper names (The Met, Top of the Rock, The High Line) and a verbatim quote on `/colaboraciones` (guarded by `verbatim.test.ts`). `<html lang="es">` everywhere. Only a gender inconsistency (QA-0014).
- Navbar: 4 groups, Servicios has 4 items incl. Visa (`USD 70`), checked in nav-config and by the existing nav specs (mega-menu 1024/1280, drawer 360/768, overflow/tag/price wrapping). At 200% root text: 360 and 768 clean; desktop bar overflows at 1024/150% and 1280/200% (QA-0013).

## Performance Smoke
- Lighthouse CI not run (no preview URL; local only). `/` First Load JS 178 kB (build output). Needs a CI/preview run before release.

## Exploratory Findings
- Time-boxed: about 45 minutes of the 60 (viewports, 200% text, forms, tabs, English scan, flaky triage).
- Bugs found: 2 HIGH, 2 MEDIUM, 2 LOW.
- Not tried: slow-3G, screen reader, Firefox/WebKit (config has only Chromium), dark theme (not shipped), real Lighthouse.
- Notes (not bugs): buttons without href and bracketed placeholders are intentional (DDR-0008). The tab panel is not itself focusable, acceptable since it contains buttons. Reviews keep five stars without ratings (DDR consequence). First click on the reviews arrow right after load can be lost before hydration (the test retries).

## Flaky triage: `tests/e2e/sobre-mi/faq.spec.ts:203` (QA-0015)
- Pre-existing: it fails on `origin/main` (cdd96a6) too. 6 workers x 80 repeats: failures on both; 1 worker x 40 on the branch: 0. The branch touches nothing the test exercises.
- Likely cause: the oracle. `sampleAnswer` starts sampling after `click()` returns; under CPU load the 300 ms close can pass with no sampled frame in the mid-state (line 224). Product is fine. Route: Frontend Engineer (test fix); same pattern as QA-0009. Not quarantined; user decides (CI `retries: 1` hides it).

## Bugs by Severity
- CRITICAL: 0
- HIGH: 2 — QA-0010 (Broadway/Internet tabs blank with motion on), QA-0011 (ink-tertiary contrast 2.2-2.4:1 in the new section)
- MEDIUM: 2 — QA-0012 (newsletter submit reloads, no feedback; pre-existing shape), QA-0013 (desktop nav overflows with large text)
- LOW: 2 — QA-0014 (la/al newsletter), QA-0015 (flaky FAQ test, pre-existing)

## Routing Summary
- Frontend Engineer: 3 (0010, 0013, 0015) — Frontend Architect: 0 — UX Strategist: 3 (0011, 0012, 0014) — Security: 0 — Backend: 0

## Sign-Off
- **Status:** Draft
- **Notes:** FAIL per Quality Gate (open HIGH at Production). Fix 0010 and decide 0011 (token DDR) to move to PASS-WITH-RESERVATIONS; 0012-0015 can be accepted. After the fix, remove `test.fixme` for QA-0010 in the new spec. Convention drift suggestion: add a § for "dynamic content inside `data-reveal-group`" (reveal bound once at mount) and for 200%-text checks on the desktop nav. Want me to draft it?
