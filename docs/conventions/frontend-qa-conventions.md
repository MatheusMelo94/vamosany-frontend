# Frontend QA Conventions

> Standing QA patterns for own-product frontend development.
> Loaded by Frontend QA Engineer (and Frontend DevOps Engineer for CI integration).
> Update here once — every role picks up the change.

---

## Testing Pyramid Posture

Per project posture (per `frontend-security-conventions.md § Project Posture`):

| Posture | Unit/Component % | E2E % | Accessibility | Visual regression | Notes |
|---------|------------------|-------|---------------|-------------------|-------|
| Prototype | 70 | 30 | axe on happy path | none | E2E = primary journey happy path only |
| MVP | 60 | 40 | axe on every journey | key screens at 360 + 1280 | E2E covers each feature's primary journey + main error path |
| Production | 55 | 45 | axe + manual keyboard pass | all screens at breakpoints of record, both themes | E2E covers all spec acceptance criteria |
| Regulated | 50 | 50 | axe + manual + screen-reader spot check | all screens + states | E2E covers all AC + compliance checks |

Guidance percentages, not hard caps. The Frontend Engineer owns unit/component coverage; QA owns E2E, accessibility passes, visual regression, and performance smoke.

---

## Framework Defaults

| Layer | Default | Justified deviation |
|-------|---------|---------------------|
| Component / hook / util tests | Vitest + React Testing Library + jsdom | Engineer-owned (not QA) |
| HTTP mocking in component tests | MSW (`tests/fixtures/msw/`) | — |
| E2E (routes, Server Actions, navigation) | Playwright | Cypress acceptable if already in the project; no Selenium |
| E2E API strategy | Playwright `page.route()` mocks at Prototype; real preview backend at MVP+ | Contract tests when backend publishes OpenAPI |
| Accessibility automation | `@axe-core/playwright` inside E2E journeys | — |
| Visual regression | Playwright `toHaveScreenshot()` with committed baselines | Third-party visual service only via ADR |
| Performance smoke | Lighthouse CI (`lighthouserc.json`) against the preview URL | Only at MVP+ posture |
| Test data | `@faker-js/faker` (seeded) factories | — |

Commands of record: `pnpm test` (Vitest), `pnpm test:e2e` (Playwright), `pnpm test:e2e --grep @feature-<slug>` (single feature), `pnpm lhci` (Lighthouse CI). QA Engineer confirms the commands at session start; respects project overrides.

---

## Browser & Device Matrix

| Posture | Projects in `playwright.config.ts` |
|---------|------------------------------------|
| Prototype | `chromium-desktop` (1280) |
| MVP | + `chromium-mobile` (Pixel 7 emulation, 360-ish) |
| Production | + `webkit-mobile` (iPhone emulation), `firefox-desktop` |
| Regulated | Production matrix + reduced-motion project + dark-theme project |

Viewport of record for screenshots: 360, 768, 1280 (per `design-conventions.md § Spacing, Layout & Responsive Breakpoints`).

---

## Test Plan Template

```text
# Test Plan: [Project] — [Feature] v[N]

- **Date:** YYYY-MM-DD
- **Spec:** [link to /specify output] v[N]
- **Posture:** Prototype | MVP | Production | Regulated
- **Environment under test:** local | preview URL
- **E2E API strategy:** mocked (page.route) | real backend [env]
- **Matrix:** [projects from § Browser & Device Matrix]

## Acceptance Criteria → Test Cases

| AC # | Criterion | Screen / state | E2E Test Case (Given-When-Then) | Viewports | Owner | Status |
|------|-----------|----------------|--------------------------------|-----------|-------|--------|

## Accessibility Cases
| Journey step | Keyboard path | Announcement expected | axe scope |
|--------------|---------------|-----------------------|-----------|

## Visual Regression Scope
[Screens × viewports × themes to snapshot; baselines to create or update]

## Regression Scope
[Prior features in scope per § Regression Scope]

## Exploratory Areas
[Per § Exploratory Checklist]

## Performance Smoke
[Routes to run through Lighthouse CI; budgets from `frontend-architecture-conventions.md § Performance Budgets`; N/A at Prototype]

## Test Data Needs
[Factories / MSW handlers / seeded users required; existing or to-be-created]

## Coverage Handoff to Engineer
[Plain-English summary of what the Engineer's component tests should cover; what QA will own]
```

---

## Test Pass Report Template

```text
# Test Pass: [Project] — [Feature] v[N]

- **Date:** YYYY-MM-DD
- **Reviewed commits:** [range or branch]
- **Environment:** local | preview URL [commit SHA]
- **Test Plan reference:** [link, or "derived on the spot"]
- **Gate Recommendation:** PASS | FAIL | PASS-WITH-RESERVATIONS

## E2E Results
- Projects run: [list]
- Tests run: [N] — Passed: [N] — Failed: [N] — Flaky (retried): [N]
- Failure details: [each linked to a Bug ID]

## Accessibility Results
- axe violations: [N] (by impact: critical / serious / moderate / minor)
- Manual keyboard pass: DONE | SKIPPED (why) — findings linked to Bug IDs

## Visual Regression Results
- Snapshots compared: [N] — Diffs: [N] — Accepted as intended: [N] (list) — Bugs: [IDs]

## Regression Results
- In-scope features tested: [list]
- Suite status: PASS | FAIL — failures linked to Bug IDs

## Performance Smoke
- Routes: [list] — LCP / INP / CLS / First Load JS vs budget — Budget breaches: [Bug IDs] (N/A at Prototype)

## Exploratory Findings
- Time-boxed: [N minutes]
- Bugs found: [count by severity]
- Out-of-scope explorations: [what wasn't tried; why]

## Bugs by Severity
- CRITICAL: [N] — IDs
- HIGH: [N] — IDs
- MEDIUM: [N] — IDs
- LOW: [N] — IDs

## Routing Summary
- Frontend Engineer: [N] — Frontend Architect: [N] — UX Strategist: [N] — Frontend Security Engineer: [N] — Backend team (via user): [N]

## Sign-Off
- **Status:** Draft | Reviewed | Accepted by user
- **Notes:** [anything affecting the user's gate decision]
```

---

## Bug Template

```text
# Bug [NNNN]: [Title]

- **Severity:** CRITICAL | HIGH | MEDIUM | LOW
- **Found by:** E2E | Accessibility | Visual | Regression | Exploratory | Performance
- **Status:** Open | Fixed | Accepted-Risk
- **Posture:** Prototype | MVP | Production | Regulated
- **Environment:** browser/project, viewport, theme, reduced-motion on/off, commit SHA

## Reproduction
Step-by-step. Synthetic data only. Attach screenshot/trace path (`test-results/…`) when available.

## Expected
What should happen (cite spec AC # or convention §).

## Actual
What happens. Console errors sanitized — no PII.

## Severity Justification
Impact + likelihood. A blocked journey step is HIGH minimum; data loss or security is CRITICAL (route to Security).

## Routed To
- **Owner role:** Frontend Engineer | Frontend Architect | UX Strategist | Frontend Security Engineer | Backend team (via user)
- **Reason:** [implementation / architecture / spec-copy-states / security / API contract]
```

Bugs are immutable once *Fixed* — re-occurrences open as new bugs referencing the prior ID.

---

## Regression Scope

When deciding which prior features are in scope after a change:

- **Default minimum:** every route in the same route group as the changed code, plus every feature that imports a changed `features/` or `components/ui/` module.
- **Widened when:** the change touches a shared layout, `globals.css`/tokens, `lib/api/`, `lib/env.ts`, `middleware.ts`, `next.config.ts`, auth/session, a `components/ui/` primitive, or a GSAP module used in more than one place.
- **Narrowed only when:** the user explicitly accepts the risk and the change is provably isolated (e.g., copy-only change inside one feature).

When in doubt, widen. Token changes are never isolated — they re-snapshot everything.

---

## Exploratory Checklist

Apply per feature, time-boxed:

| Category | Probe |
|----------|-------|
| Keyboard-only | Complete the journey without a mouse; Tab order; Escape/Enter/Space semantics; focus after dialog close |
| Screen reader spot check | Landmarks, heading outline, live-region announcements (VoiceOver/NVDA; Production+) |
| Viewport & zoom | 320 px width, 200 % zoom, landscape phone, container overflow |
| Reduced motion | OS setting on: sequences instant, content visible, nothing hidden behind an unplayed reveal |
| Theme | Dark theme (if shipped): contrast, images with transparent backgrounds, focus ring |
| Network | Slow 3G throttling: skeletons appear, no layout shift; offline mid-submit; timeout copy |
| Navigation | Back/forward after Server Action; refresh mid-flow; deep link into every screen; 404 by wrong id |
| Forms | Double-submit, paste, autofill, max length, unicode/emoji, leading/trailing spaces, browser validation vs inline validation |
| Data | Empty lists, one item, 1 000 items, very long strings, missing optional fields, stale data after revalidation |
| Time | Date rendering across timezones/locales; relative time drift |
| Errors | API 500 / 403 / 401 on each read and write; expired session mid-journey |
| Security-adjacent | Anything smelling of XSS, open redirect, exposed env, or auth bypass → stop and route to Frontend Security Engineer (do not pursue in QA scope) |

Extend per project.

---

## Exploratory Time-Box

Default: 30 minutes per feature. Adjust by posture:

| Posture | Default time-box |
|---------|-----------------|
| Prototype | 15 min |
| MVP | 30 min |
| Production | 60 min |
| Regulated | 90 min + Frontend Security Engineer follow-up |

Past the time-box, deliver findings even if exploration could continue. Note out-of-scope explorations in the Test Pass Report.

---

## Test Data Fixtures

- Factories, not literals: `tests/fixtures/factories/user.ts` exposes `buildUser({ role: 'member' })` using seeded faker (`faker.seed(42)` in setup) so snapshots are stable.
- MSW handlers live in `tests/fixtures/msw/handlers/<feature>.ts`, composed in `tests/fixtures/msw/server.ts` (Vitest) and `browser.ts` (if needed); Playwright uses `page.route()` helpers in `tests/e2e/fixtures/api.ts` that reuse the same factories.
- Playwright fixtures (`tests/e2e/fixtures/index.ts`) provide authenticated contexts via a seeded test user and stored storage state — never real credentials.
- Synthetic data only — never copy real user data, even from prod backups. Names, emails, and images are generated.
- Fixtures-as-code, not JSON files (type-safe; refactorable).
- QA owns shared/project-wide fixtures and factories; the Engineer owns per-test inline fixtures.
- Screenshot baselines are committed per project and platform (`__screenshots__/`); updating a baseline is a deliberate commit (`test: update wishlist snapshots after token change`).

---

## Accessibility & Performance Gates

- Every E2E journey ends with `await new AxeBuilder({ page }).analyze()`; **critical** and **serious** violations fail the test at MVP+ (any impact at Regulated).
- Lighthouse CI thresholds (MVP+): performance ≥ 0.85, accessibility ≥ 0.95, best-practices ≥ 0.9; Core Web Vitals per `frontend-architecture-conventions.md § Performance Budgets`. Breaches are HIGH bugs routed to the Frontend Engineer (or Architect when structural).
- Flaky tests are quarantined with `test.fixme()` and a Bug ID within the same session — never deleted, never retried into green silently.

---

*Last updated: 2026-09-22*

---
