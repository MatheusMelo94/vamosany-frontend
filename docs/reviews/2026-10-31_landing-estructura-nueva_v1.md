# Frontend Code Review: vamosany-front-end — Landing "estructura nueva" in Spanish (DDR-0008) v1

- **Date:** 2026-10-31
- **Reviewer:** Frontend Reviewer (for Matheus Melo)
- **Scope:** branch `feat/landing-estructura-nueva`, `cdd96a6..236c5fe`, 9 commits. Not pushed; no PR and no preview URL. One feature (DDR-0008). It also contains one unrelated chore commit (`4103ee8`, agent models; see Process Gaps).
- **Upstream artifacts:**
  - The spec of record is DDR-0008 (`docs/ddr/0008-landing-nova-estrutura-em-espanhol.md`, Accepted 2026-10-31).
  - The content brief (`ESTRUCTURA NUEVA WEB VAMOS A NY (2).md`) is untracked by design.
  - There is no formal spec, plan or tasks; the user accepted that for this PR.
  - There is no design handoff, no Security Engineer findings and no QA test plan.
  - ADR-0006 § 6 (freeze supersession) applies.
- **Posture:** Production (per the prior reviews and `docs/security/findings/`).
- **Recommendation:** **BLOCK.** There is one BLOCKING defect, RV-0024. With motion enabled, which is the default for most visitors, switching a tab in "Mis recomendados" leaves every card invisible. The fix is small and local; see the Sign-Off.

Finding IDs continue the project's `RV-` series (RV-0001 to RV-0023 are in the two earlier reports).

## Summary

- **Commits reviewed:** 9.
  - Feature: `eef1030` (landing), `03dd9de` (app shell), `c9a0ddf` (nav), `674e54d` (footer), `7bd7ea8` (blog), `236c5fe` (baseline removal).
  - Docs: `a67806a` (DDR-0008).
  - Unrelated: `4103ee8` (agent models).
- **Tests added:**
  - Unit: 1 new file, `features/landing/__tests__/recommendations.test.tsx` (5 cases). Six nav/drawer test files were updated to the new copy and the four groups.
  - E2E: no new spec. `mobile-nav.spec.ts`, `navbar.spec.ts`, `not-found.spec.ts` and `sobre-mi/tap-targets.spec.ts` were updated, and two Itineraries mega-menu PNGs were deleted.
- **Suite status** (run by me on `236c5fe`):
  - `npm run typecheck`: **PASS**
  - `npm run lint`: **PASS**
  - `npm run format:check`: **PASS**
  - `npm test`: **PASS**, 34 files / 361 tests
- **Build status** (`npm run build`): **PASS**, all routes static.
  - First Load JS for the touched routes: `/` 178 kB, `/_not-found` 103 kB. The other routes (shell copy only) are unchanged: `/sobre-mi` 113, `/colaboraciones` 108, `/preguntas-frecuentes` 108, `/contacto` 145, `/trabaja-conmigo` 145.
  - `npm run check:first-load`: **PASS**. `/` = 178,162 B, which is −330 B vs the baseline; the budget is 180.00 kB.
- **E2E** (my own `next start -p 3188`, isolated config, 2 workers): `navbar`, `mobile-nav`, `landing`, `not-found` and `sobre-mi/tap-targets`, all 3 projects.
  - Result: **180 passed, 134 skipped (project skips), 1 failed**.
  - The failure was `tap-targets.spec.ts:47` [phone-360], a webpack chunk `TypeError` inside `gsapPending`.
  - Re-run with `--repeat-each=5`: 20/20 passed. Not attributable to this branch: another `next start -p 3100` was started by a different process during my build.
  - Screenshots aren't compared locally; CI regenerates them (label `update-snapshots`).
- **Browser verification** (Playwright script against `next start`, 1280 / 360 / 320, motion on and `reducedMotion: reduce`): see RV-0024 and RV-0026.
- **BLOCKING findings:** 1
- **NON-BLOCKING findings:** 5
- **NIT findings:** 3
- **Open Security findings referenced:** none. No Security Engineer report exists for this branch (Process Gaps).

The WAI-ARIA tabs are well done: roving tabindex, wrap-around, Home and End, role-based tests that read like the APG, and the focus ring works.

## Audit notes (pass)

- **Convention adherence:**
  - `'use client'` sits only on the `Recommendations` leaf; `page.tsx` stays a server component. No server-only imports, no env, no new dependencies.
  - `cn()` is used throughout, with no `@apply`.
  - The removed sections take their files with them. There are no dangling imports, and `planning-timeline` was the only consumer of its own code.
  - `lang="es"` is set on the root and in `global-error`, and the 404 and error copy follow § UX Writing (what happened, plus an action).
  - The nav and drawer wrap tweaks use scale utilities only.
- **Spec alignment (DDR-0008 § Decision 1–8):**
  - The section order matches.
  - The copy matches item by item: the dashboard header and buttons, the three service cards (prices, "El más completo", featured), the stats (+200 / +20 / +1000 km, formatted in `es`), "Lo que dicen mis viajeros" with ten reviews, the CTA copy and the newsletter strings.
  - The three sections are removed, and the menu, footer, blog, 404 and metadata are translated.
  - Placeholders in brackets, buttons without href and five stars are intentional per the brief, and are not graded.
- **Security cross-reference:** there is no report to cross-reference.
  - The only new outbound target is `mailto:hola@vamosany.com`. There is no raw HTML, no storage and no new env.
  - When the affiliate links land, they are a new surface (external `rel`, tracking parameters); see Process Gaps.
- **Test quality (recommendations):**
  - Queries use role and name throughout. Async interaction uses `userEvent`, with no sleeps.
  - Assertions are behavioral (`aria-selected`, focus, accessible name of the panel).
  - The gap is that nothing exercises the component under the `.gsap` motion gate (RV-0024).

## Findings

### BLOCKING

#### Finding RV-0024: Switching a tab in "Mis recomendados" leaves every card invisible (motion enabled)
- **Location:**
  - `features/landing/components/recommendations.tsx:165` (`<ul data-reveal-group>` inside the tab panel)
  - `app/globals.css:294-295` (`.gsap [data-reveal-group] > * { opacity: 0 }`)
  - `features/landing/motion/scroll-effects.tsx:42-61` (the group tween targets only the children present at mount)
- **Convention citation:**
  - `frontend-architecture-conventions.md § Animation (GSAP 3)`: the initial-state rule, and the rule that reveals "must never leave focus on an invisible element".
  - `design-conventions.md § Screen States Matrix`: Success shows the data.
  - DDR-0008 § Decision 4: three working tabs.
- **Issue:** Under the `.gsap` gate, every direct child of a `[data-reveal-group]` starts at `opacity: 0`. GSAP raises only the `<li>`s that exist when `ScrollEffects` mounts, which are the three "Pases y atracciones" cards. A tab switch makes React mount new `<li>`s (new keys). They match the CSS rule, get no tween, and stay at `opacity: 0`.
  - Verified in Chromium against `next start`. After clicking "Broadway", both cards' computed opacity is `0` at 1280, 360 and 320. Switching back to "Pases y atracciones" gives `0, 0, 0`. Switching before the section scrolls into view gives `0` as well.
  - Under `reducedMotion: reduce` all values are `1`, so the defect hits exactly the default audience.
  - The invisible cards still contain focusable buttons, so a keyboard user tabs onto invisible controls. The unit tests can't see this because jsdom never sets the `.gsap` class.
- **Remediation:**
  - Take the reveal off the per-tab children. For example, drop `data-reveal-group` from the `<ul>` and put `data-reveal` on the persistent `role="tabpanel"` wrapper (`:160`), which is never remounted. Alternatively, keep the stagger only for the first paint by rendering all three panels and toggling `hidden`, which also gives one panel per tab per the APG.
  - Add a Playwright case to `tests/e2e/landing.spec.ts` (`@feature-landing`) with motion enabled: scroll to `#recomendados`, click each tab, and assert every `[role=tabpanel] li` has computed opacity `1`.
  - Optionally repeat it for the case where the tab is switched before the section scrolls into view.
- **Routed to:** Frontend Engineer

### NON-BLOCKING

#### Finding RV-0025: Ten focusable buttons that do nothing (accessibility consequence of the "no href yet" decision)
- **Location:**
  - `features/landing/components/dashboard-preview.tsx:234,237`
  - `features/landing/components/services.tsx:128` (3 buttons)
  - `features/landing/components/recommendations.tsx:186` (up to 3 per tab)
  - `features/landing/components/cta.tsx:45,48`
- **Convention citation:**
  - `frontend-architecture-conventions.md § Accessibility (engineering rules)`: every interactive element is operable.
  - `design-conventions.md § Component States`: a non-actionable control is disabled with contrast kept, or removed from the tab order with an explanation nearby.
- **Issue:** The decision itself is the user's and is recorded in DDR-0008 (User Impact: "os botões não levam a lugar nenhum"); it is not graded. Its consequence is graded:
  - Keyboard and screen-reader users reach about ten controls announced as "botón" ("Quiero mi itinerario", "Agendar consultoría", "Usar mi código"…).
  - Activating them produces no feedback of any kind, which reads as a broken page rather than a pending one.
  - Pointer users at least get the hover lift. Keyboard users get nothing.
- **Remediation:** pick one; the user decides.
  - (a) Render them with `aria-disabled="true"` plus a visually hidden "(próximamente)" in the accessible name, keeping them visible so the freeze holds.
  - (b) Record the a11y consequence explicitly in DDR-0008 § Consequences as an accepted risk until the links land, and add a tracking item to the migration backlog.
  - Either way, the first content PR that adds links should remove them all at once.
- **Routed to:** UX Strategist (decision), then Frontend Engineer

#### Finding RV-0026: At 360 and 320 the "Internet" tab is clipped off-screen behind a hidden scrollbar
- **Location:** `features/landing/components/recommendations.tsx:128`
- **Convention citation:**
  - `design-conventions.md § Accessibility Baseline` (layouts survive 320 px) and `§ Spacing, Layout & Responsive Breakpoints`
  - `frontend-architecture-conventions.md § Styling (Tailwind CSS 4)`: arbitrary values need a justifying comment, and `[scrollbar-width:none]` and `[&::-webkit-scrollbar]:hidden` have none.
- **Issue:** The tab strip is 409 px wide inside a 316 px box at 360, and 276 px at 320 (measured).
  - At 360 the third category is entirely outside the box, with no scrollbar, fade or chevron to signal it (screenshot verified). Touch users must guess they can swipe the strip.
  - There's no page-level horizontal scroll, and keyboard users can reach it with arrows.
  - The same unexplained arbitrary pair already exists at `reviews.tsx:123`.
- **Remediation:**
  - Let the strip wrap (`flex-wrap justify-center`, with `w-fit` dropped below `sm`), or use a 3-column grid with labels that fit, so all three tabs are visible at 320.
  - If the scroller stays, add an edge-fade affordance.
  - Move the scrollbar hiding into a named `@utility scrollbar-none` in `globals.css` (used by both components) instead of two arbitrary values.
- **Routed to:** Frontend Engineer (UX Strategist if the pattern changes)

#### Finding RV-0027: Commit hygiene: no convention citations or test counts; DDR committed after the code
- **Location:**
  - Commit bodies of `eef1030`, `03dd9de`, `c9a0ddf`, `674e54d`, `7bd7ea8`, `236c5fe`. `03dd9de`, `a67806a` and `236c5fe` have no body at all.
  - DDR-0008 (`a67806a`) lands after `eef1030` and `03dd9de`.
- **Convention citation:** `frontend-architecture-conventions.md § Engineering Workflow` (Conventional Commits: the body cites sections and lists tests; Red before Green).
- **Issue:**
  - The problem is systematic across the branch, unlike the previous two features, whose commit hygiene was exemplary.
  - The order puts the spec after the implementation, so test-first can't be shown from history for `recommendations.tsx`: test and code arrive in the same commit.
  - The copy and data changes in Stats (the new `prefix` data attribute), Services, Reviews and CTA have no unit test. They are covered only by the CI baselines.
- **Remediation:**
  - No history rewrite is needed for this PR. Put the citations and test counts in the PR description instead.
  - Keep the § Engineering Workflow body format for the RV-0024 fix commit (Red: the failing e2e; then Green).
- **Routed to:** Frontend Engineer

#### Finding RV-0028: Menu "Servicios › Visa de Estados Unidos" points to a section that has no Visa
- **Location:** `components/layout/nav-config.ts:146-152` (`href: "/#services"`)
- **Convention citation:** `frontend-architecture-conventions.md § Review Report Template` / Spec & Plan Alignment (behavior not in the spec is routed to the UX Strategist). DDR-0008 § Decision 2 lists three services, and § 8 only says the menu items are "alinhados à oferta nova".
- **Issue:**
  - The menu and drawer advertise a fourth service (USD 70, "Servicio para uruguayos") that the DDR doesn't name.
  - Its link lands on `#services`, which shows only three cards. A visitor who picks Visa finds no Visa.
  - Guías also has "Visa a Estados Unidos" (`:75`), so there are two near-identical titles in two groups.
- **Remediation:** the UX Strategist decides one of two paths:
  - (a) Amend DDR-0008 (or add a small DDR) to include Visa, and add a fourth card or an anchor target.
  - (b) Drop the menu item until the service has a page.
- **Routed to:** UX Strategist

#### Finding RV-0029: Non-null assertion in production code
- **Location:** `features/landing/components/recommendations.tsx:90` (`TABS.find((t) => t.id === active)!`)
- **Convention citation:** `frontend-architecture-conventions.md § TypeScript Rules` ("No non-null assertions (`!`) outside tests").
- **Issue:** The assertion is structural, not user-visible today. It hides the case where `active` drifts from `TABS`, and `useState(TABS[0].id)` / `TABS[next].id` lean on the same unchecked indexing.
- **Remediation:** Hold the active **index** in state (`useState(0)`) and derive `const tab = TABS[activeIndex] ?? TABS[0]`, which also simplifies `onKeyDown`. Or type `TABS` as a non-empty tuple and fall back with `??`.
- **Routed to:** Frontend Engineer

### NIT

#### Finding RV-0030: Tab color transition uses Tailwind's default timing, not the motion tokens
- **Location:** `features/landing/components/recommendations.tsx:147` (`transition-colors`)
- **Convention citation:** `design-conventions.md § Motion Principles` (state change uses `--duration-fast`); `frontend-architecture-conventions.md § Animation` (no magic numbers).
- **Issue:** The default is 150 ms with Tailwind's easing. The project tokens are `--duration-fast` (120 ms) and `--ease-default`, as `Button` and `blog.tsx` use.
- **Remediation:** `transition-colors duration-(--duration-fast) ease-(--ease-default)`.
- **Routed to:** Frontend Engineer

#### Finding RV-0031: Star rating named with `aria-label` on a generic `<span>`
- **Location:** `features/landing/components/reviews.tsx:130` (touched in this scope; the pattern predates it)
- **Convention citation:** `frontend-architecture-conventions.md § Accessibility (engineering rules)` (ARIA only to fill gaps, correctly).
- **Issue:** ARIA 1.2 prohibits naming the generic role, so some screen readers read "★★★★★" or nothing. "Cinco de cinco" also lacks its noun.
- **Remediation:** `<span role="img" aria-label="5 de 5 estrellas">`.
- **Routed to:** Frontend Engineer

#### Finding RV-0032: Newsletter form name differs between the CTA and the footer
- **Location:** `components/layout/footer.tsx:150` ("Suscripción al newsletter") vs `features/landing/components/cta.tsx:60` ("Suscripción a la newsletter")
- **Convention citation:** `design-conventions.md § UX Writing` (vocabulary is stable).
- **Issue:** The same form is named two ways on one page.
- **Remediation:** Pick one gender for "newsletter" across the site. The CTA's lede already uses "la newsletter".
- **Routed to:** UX Strategist (copy), then Frontend Engineer

## UI Quality Checklist

- **States covered (loading / empty / error / success):** Static content with no data states; N/A beyond success. **Gap:** the success state of "Mis recomendados" fails after any tab switch with motion on (RV-0024). The 404 and global error states are translated with an action.
- **Keyboard + focus-visible:** Tabs are a single tab stop with arrows, Home, End and wrap, and the global `:focus-visible` ring renders (`solid 2px` measured). **Gaps:** after a tab switch, focus can land on invisible buttons (RV-0024), and about ten buttons do nothing on activation (RV-0025).
- **Reduced motion honored:** Yes. All cards are visible at `reduce` at 1280, 360 and 320, and the `.gsap` gate is unchanged.
- **Responsive at 360 / 768 / 1280:** There's no page-level horizontal scroll at 320, 360 or 1280. **Gap:** the tab strip clips "Internet" at ≤ 360 (RV-0026). The nav and drawer wraps pass the existing e2e at all three projects.
- **Tokens only (no raw values):** Mostly. The unexplained arbitrary scrollbar pair is in RV-0026, and the default transition timing in RV-0030.
- **Images / fonts:** No new images. The blog reuses existing `next/image` assets with `sizes`, and the alts describe the photos shown.
- **Bundle:** `/` is at 178.16 kB of 180 kB (−330 B vs baseline). That's in budget, but the headroom is thin for the coming affiliate and content work.
- **Copy:** Matches DDR-0008. Sentence case and CTA verbs are right. The bracket placeholders are intentional (DDR-0008 § 4).

## Process Gaps

- **No formal spec, plan or tasks.** The user accepted DDR-0008 as the spec for this PR, so this is a process note, not a blocker. As a result, no acceptance-criteria table exists to map tests against. Route: UX Strategist, if "Mis recomendados" grows beyond placeholders (real affiliate content, tracking).
- **No Security Engineer findings for this branch.** At Production posture, run the Security review before deploy (pipeline order: review → QA → security). The diff shows no new data surface. The one item for the Security Engineer is the upcoming affiliate links (`rel="sponsored noopener noreferrer"`, tracking parameters), which should be reviewed in the content PR that adds them. Route: Frontend Security Engineer.
- **No QA test plan or pass.** The landing baselines are regenerated by CI, so the visual freeze outside DDR-0008's scope (ADR-0006) is unproven until the `update-snapshots` run is inspected. Also needed: a manual keyboard and screen-reader pass of the tabs and the inert buttons. Route: Frontend QA Engineer.
- **Unrelated commit in scope:** `4103ee8` (agent model settings) isn't part of DDR-0008. Leave it or split it out at the user's discretion; it has no runtime impact.
- **Untracked brief at repo root:** `ESTRUCTURA NUEVA WEB VAMOS A NY (2).md` is untracked on purpose (DDR-0008). Keep it out of commits, or add it to `.git/info/exclude`.
- **Suggested convention update: § Animation (GSAP 3).** Content that mounts after the scroll controller runs (tab panels, filters, "load more") must not sit under a `[data-reveal-group]` whose children the CSS gate hides. Either reveal a persistent wrapper or re-run the reveal on mount. RV-0024 is the first instance; it will recur as the site gets interactive sections. Route: Frontend Architect.

## Sign-Off

- **Status:** Reviewed
- **Notes:**
  - **BLOCK on RV-0024 only.** Fixing it (reveal on the persistent panel plus one Playwright case under motion) moves this to CHANGES REQUESTED or APPROVE, depending on how the user disposes of RV-0025 to RV-0029.
  - RV-0025 and RV-0028 need a user or UX decision, not code.
  - Before merge, the `update-snapshots` CI run must be inspected so that only DDR-0008's sections changed.
