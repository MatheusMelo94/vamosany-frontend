# Frontend Code Review: vamosany-front-end — Mobile navigation "Índice" (drawer below 1024px) v1

- **Date:** 2026-09-27
- **Reviewer:** Frontend Reviewer (for Matheus Melo)
- **Scope:** branch `feat/mobile-menu-indice`, `main (6384cb9)..48e6db1`: 18 commits (5 docs, 13 task commits T001–T013). One feature (spec v1.1). Not pushed; no PR and no preview URL.
- **Upstream artifacts:** spec `docs/specs/mobile-navigation/spec.md` v1.1 (Ready for /plan, 52 ACs) · `plan.md` (Ready for /tasks) · `tasks.md` (T001–T013, with the QA handoff) · DDR-0006 (Accepted) · ADR-0006 (freeze), ADR-0008, ADR-0009 and ADR-0010 (Accepted 2026-09-27; the § Animation amendment is applied in `66c98e5`) · approved mockup `docs/design/mockups/mobile-menu-indice.html` · source analysis `docs/design/mobile-menu-analysis-2026-09-27.md` · **Security findings: not produced** (see Process Gaps) · **QA test plan / pass: not produced** (the handoff exists in `tasks.md` § QA handoff and the T013 body)
- **Posture:** Production (plan header; `docs/security/findings/2026-09-26_sobre-mi-forms_v1.md`)
- **Recommendation:** **BLOCK**. There is one BLOCKING finding, and it is a merge gate rather than a code defect: the four drawer baselines haven't been regenerated, so AC 1 and AC 3 (the freeze) are unproven. No code change is needed to clear it. See Sign-Off.

Finding IDs continue the project's `RV-` series (RV-0001–RV-0016 are in `2026-09-26_sobre-mi_v1.md`).

## Summary

- **Commits reviewed:** 18. Plan tasks map 1:1 to commits: T001 `736af09`, T002 `a32fe0e`, T003 `7362e76`, T004 `12bd5c0`, T005 `71dfea4`, T006 `c9c4459`, T007 `4d61769`, T008 `7397b20`, T009 `b66254e`, T010 `908cb1f`, T011 `6d48de9`, T012 `7348375`, T013 `48e6db1`.
- **Tests added:**
  - Unit: 6 new Vitest files under `components/layout/drawer/__tests__/` (92 cases), plus updates to `navbar.test.tsx` and `lib/__tests__/motion.test.ts`. The suite grew from about 243 to 355.
  - E2E: `tests/e2e/mobile-nav.spec.ts` (new, 38 test declarations, parameterized over routes and viewports), plus 4 new tests in `navbar.spec.ts` (AC 30, 42, 52 and the redefined drawer captures) and the replaced row-size test in `sobre-mi/tap-targets.spec.ts`.
  - No PNG is changed in the scope.
- **Suite status** (run by me on `48e6db1`, fresh `npm ci`):
  - `npm run typecheck`: **PASS**
  - `npm run lint`: **PASS**
  - `npm test`: **PASS**, 32 files / 355 tests
- **Build status** (`npm run build`): **PASS**, all routes static. First Load JS per route (Next's table): `/` 178 kB · `/sobre-mi` 113 kB · `/colaboraciones` 107 kB · `/trabaja-conmigo` 144 kB · `/contacto` 144 kB · `/preguntas-frecuentes` 108 kB. These are unchanged vs `main` at kB precision.
- **`npm run check:first-load`: PASS.** `/` = **178,787 B**, +295 B of the 1,000 B allowance, which matches the Engineer's number exactly. Measured on `main` in the same environment (fresh install from `git archive`), `/` = **178,555 B**, so the feature's **net effect on `/` is +232 B**. The plan predicted −100 to −150 B (§ 0.3). See RV-0018.
  - The drawer chunk is lazy (`903.*.js`, about 5.8 kB gzip per T013). `navbar.tsx` imports no GSAP.
  - The drawer's motion values are in `/`'s First Load: the strings `clipFrom`, `maxStart`, `back.out(3)` and `inset(0% 0% 100%` were found in `static/chunks/app/(marketing)/page-*.js`.
- **E2E** (my own `next start -p 3317`, `--workers=2`; `mobile-nav.spec.ts` + `navbar.spec.ts` + `sobre-mi/tap-targets.spec.ts`, 3 projects):
  - Run 1 at host load average 28 on 10 cores: 122 passed, 133 skipped (project skips), 33 failed. All 33 failures were timeouts or torn-down contexts (`waitForLandingMotion` / `waitForGsapIdle` predicate timeouts, "session closed", `Received: undefined`). Pre-existing desktop `@feature-sobre-mi` tests timed out the same way.
  - `--last-failed` re-run once the load dropped to about 6: **33/33 passed**.
  - Net: **155 passed, 0 functional failures.** Screenshots aren't compared locally (`ignoreSnapshots` outside CI).
  - Targeted checks:
    - AC 46 open/close on tablet-768, `--repeat-each=25`: **9/50 failed** (RV-0019; the cause is pre-existing).
    - AC 30 pointer probe: the capture is taken while hovering "Blog" (RV-0020).
- **BLOCKING findings:** 1
- **NON-BLOCKING findings:** 4
- **NIT findings:** 2
- **Open Security findings referenced:** none. No Security Engineer report exists for this feature (Process Gaps).

The rest is in good shape: TDD discipline, commit hygiene (convention citations, test counts, byte lines) and deviation disclosure are exemplary. The modality, focus, accordion and motion code closely follows plan §§ 7–8.

## Audit notes (pass)

- **Convention adherence:**
  - Files sit in `components/layout/drawer/` with colocated tests. `'use client'` is only on the leaves (`navbar.tsx` was already client; `mobile-drawer.tsx` is new).
  - Props across the chunk boundary are the plan's. `next/link` is used for every internal target.
  - Tokens and scale values only. The arbitrary `top-[calc(…)]` and `border-ink/[0.08]` are pre-existing and carry a justifying comment; `sm:w-105` is a scale value.
  - `cn()` is used throughout, with no `@apply`.
  - GSAP runs only inside `useGSAP({ scope, dependencies })` / `contextSafe`, and the gate is read at call time. The `gsap.matchMedia` reduced branch is present.
  - Reveals of focusable content use `opacity` (ADR-0008), with the `focusin` safeguard.
  - `height` is animated only in `drawer-motion.ts` (ADR-0009; a grep guard test enforces it). `clip-path: inset(… round token)` ends with `clearProps` and is not on a `backdrop-filter` element (ADR-0010).
  - Values come from `lib/motion.ts`. The only CSS addition is one gated selector (`.gsap [data-drawer-chevron]`).
  - jsx-a11y is clean, and so is TypeScript (explicit return types, no `any`).
- **TDD discipline:**
  - Every behavior commit carries its tests, and names describe behavior.
  - T010 is honestly labeled as characterization.
  - Commit bodies cite `A§`/`D§` sections, list test counts and quote the guard line.
  - Deviations are disclosed and reasoned: `DrawerRetry` vs plan § 9, the AC 30 test's file location, `shown` deferred to T012, and the T003 absolute byte target.
  - No `Draft`, `Pre-Convention` or `Pre-Contract` labels are open.
- **Spec & plan alignment:**
  - All 52 ACs map to an automated test, except that AC 1 and AC 3 are pending the snapshot bot (RV-0017). The manual parts of AC 40 and § Accessibility Acceptance (VoiceOver, keyboard at 768) are QA's.
  - States S1–S8 are all implemented, and the data states are validly declared N/A.
  - The copy deck is verbatim: scent lines are derived, with no `[TBD]`. The accessible names match (Abrir/Cerrar menú, Menú, Idioma).
  - There is no scope creep.
- **Security cross-reference:**
  - There is no report to cross-reference.
  - From reading the code, I saw no security-smelling pattern: hrefs are static config or literals, there is no raw HTML, no storage, no env and no new dependency.
- **Test quality:**
  - RTL queries use role, label and text.
  - E2E tests use `page.clock` for time-sampled motion, CDP AX-tree checks for `inert`, and axe scoped to the landmark.
  - The issues are RV-0019, RV-0020 and RV-0021.

## Findings

### BLOCKING

#### Finding RV-0017: The freeze oracle isn't closed: the four drawer baselines haven't been regenerated, so AC 1 and AC 3 are unproven and the CI screenshot run is red
- **Location:** `tests/e2e/navbar.spec.ts-snapshots/drawer-{top,last-group}-{phone-360,tablet-768}-linux.png` (unchanged on the branch); `tests/e2e/navbar.spec.ts:200-236` (redefined captures)
- **Convention citation:**
  - `frontend-architecture-conventions.md § Review Report Template` (a diff ≠ 0 outside the allowed list is BLOCKING, per ADR-0006 § 3)
  - `frontend-qa-conventions.md § Test Data Fixtures` ("updating a baseline is a deliberate commit")
  - spec AC 1 and AC 3; tasks T010 acceptance ("The bot commit changes exactly … and creates no other file. The PR body cites DDR-0006. The next CI run is green with every other screenshot diff 0.")
  - T013 acceptance (snapshot diff summary in the PR)
- **Issue:**
  - The branch redefines what `drawer-top` (S2 on `/`) and `drawer-last-group` (S5 on `/sobre-mi`) show, but the committed PNGs still show the old drawer. In CI these four captures will fail until the `update-snapshots` label bot rewrites them.
  - More importantly, the freeze can only be proven on the CI runner. That covers every `navbar-closed*` (including the new AC 30, AC 42 and AC 52 comparisons against it), every `navbar-panel-*`, `language-menu-desktop-1280`, and `landing.spec.ts-snapshots/` / `sobre-mi/`. Locally, `ignoreSnapshots` is on, and the Engineer's local-oracle runs aren't the oracle of record (ADR-0006 § 2).
  - The bot runs in `changed` mode (`--update-snapshots`), so it would also silently rewrite any *frozen* baseline that happened to fail in that run. The file audit of the bot commit is therefore the actual freeze check.
  - The branch isn't pushed, so none of this has run yet.
- **Remediation:**
  1. Push, open the PR citing DDR-0006, and apply the `update-snapshots` label.
  2. Verify that the bot commit touches **exactly** the four `drawer-*` PNGs listed above and creates no file.
  3. Check that the next CI run is green (with RV-0019 quarantined or fixed, so a retry isn't what turns it green).
  4. Post the T013 Reviewer/QA handoff and the snapshot diff summary in the PR body.
  5. If the bot touches any other PNG, that is a freeze regression: stop and route it back here.
- **Routed to:** Frontend DevOps Engineer / user (bot run) + Frontend Engineer (bot-commit file audit, PR body)

### NON-BLOCKING

#### Finding RV-0018: `/` grows +232 B net: the drawer's motion values and loader glue landed in First Load, against plan § 0.3
- **Location:** `lib/motion.ts:15-16,135-175` (`EASE.pop`, `MOTION.drawer`; confirmed in `static/chunks/app/(marketing)/page-*.js`); `components/layout/navbar.tsx:22-68` (`DrawerRetry`, the loader with its `catch`, the idle prefetch); `plan.md` § 0.3 and § 7.1
- **Convention citation:** `frontend-architecture-conventions.md § Performance Budgets` (First Load ≤ 180 kB; `next/dynamic` for client-only components); `scripts/check-first-load.mjs` header ("the allowance … is not room for application code"); plan § 0.3 ("All later drawer growth lands in the lazy chunk")
- **Issue:**
  - Measured in the same environment, `main` is 178,555 B and HEAD is 178,787 B, a net +232 B. The plan approved a **−100 to −150 B** outcome, so the result is about 350 B worse than planned.
  - About 186 B is `MOTION.drawer` + `EASE.pop` (T002's own measurement). `MOTION` is one `const` object imported by the landing, so it can't be tree-shaken. About 74 B is `DrawerRetry` (T003). The rest is the Navbar state machine and prefetch the plan expected.
  - The plan contradicts itself here: § 7.1 puts the values in `lib/motion.ts`, while § 0.3 says every drawer byte goes into the lazy chunk. The Engineer followed § 7.1 and disclosed the cost in T002/T003.
  - The guard passes, but `/` is at 99.3% of its 180 kB budget. 295 B of the 1,000 B allowance (which is meant for webpack runtime growth, not app code) is now spent, and the next feature inherits that.
- **Remediation:**
  - Architect: amend plan § 7.1 (and note in ADR-0006 § 4's spirit that *new* motion values may live outside `lib/motion.ts`) so that drawer-only values move to a module imported only by the chunk. For example, `components/layout/drawer/motion-values.ts`, or `lib/motion-drawer.ts` with `EASE.pop` alongside.
  - Engineer: move them, and keep the T002 pin tests pointed at the new module.
  - Expected: about −190 B on `/`, bringing the net to about +40 B. Quote the guard line.
  - Optionally, fold `DrawerRetry`'s re-import into `loadDrawer` to shave the loader.
  - Record the measured `main` value next to the baseline so future deltas are environment-independent (see RV-0004).
- **Routed to:** Frontend Architect (plan amendment) → Frontend Engineer

#### Finding RV-0019: The AC 46 open/close test's closed-header compare is byte-exact and flaky (9/50 on tablet-768); the cause is a pre-existing compositor anti-aliasing delta, not this feature
- **Location:** `tests/e2e/mobile-nav.spec.ts:1002-1018` (`instantOpenClose`, the assertion at `:1015`); used by `:1020-1028` (reduced motion) and `:1030-1039` (no `.gsap`)
- **Convention citation:** `frontend-qa-conventions.md § Accessibility & Performance Gates` ("Flaky tests are quarantined with `test.fixme()` and a Bug ID within the same session — never … retried into green silently"); `§ Framework Defaults` (visual regression via `toHaveScreenshot()`)
- **Issue:**
  - `--repeat-each=25 --project=tablet-768` gave 9 failures out of 50, always at `:1015` and in both variants. The T013 body reported "passed 48/48 on repeat".
  - A probe that diffed the two header captures in-canvas found **exactly 4 pixels** at (732–733, 7) and (732–733, 48), each off by 4 to 8 out of 255 per channel. Those points lie on the anti-aliased edge of the capsule's rounded right cap (radius 28, the `backdrop-filter` element). The delta persists 500 ms later. The burger's background, focus, hover, SVG transform and inline style all equal the pre-open state.
  - **The same probe on a `main` build (old drawer) reproduced the identical 4-pixel delta** (3/60 on `main`, 1/60 on HEAD). So it is a Chromium raster/compositing artifact after any overlay cycle, not a regression. The product's closed state is correct, and AC 42's `navbar-closed.png` compare (1% tolerance, CI) is the authoritative freeze check.
  - As written, the test asserts pixel equality that the platform doesn't guarantee. With CI `retries: 1` it would be retried into green silently, which the QA convention forbids.
- **Remediation:**
  - For the **closed** comparison, use a tolerant comparison: for example `toHaveScreenshot`-style `maxDiffPixels` (≤ 10) via a small pixel-diff helper, or compare against `navbar-closed.png` as the AC 42 test does.
  - Keep byte-exact equality for the **open** frame (it's stable) and for the accordion variants (not observed flaky).
  - Until it's fixed, quarantine it with `test.fixme()` and a QA bug ID rather than relying on retries.
- **Routed to:** Frontend QA Engineer (owns `tests/e2e/`; bug ID, quarantine decision) + Frontend Engineer (the fix)

#### Finding RV-0020: The AC 30 freeze capture is taken with the pointer hovering the desktop "Blog" trigger and passes only through the 1% tolerance
- **Location:** `tests/e2e/navbar.spec.ts:100-121` ("drawer closes silently at ≥ 1024 …")
- **Convention citation:** spec AC 30 ("the desktop navbar renders identically to `navbar-closed-desktop-1280`"); ADR-0006 § 2 (diff 0 expected; tolerance only for anti-aliasing); `frontend-qa-conventions.md § Framework Defaults`
- **Issue:**
  - The burger is clicked at (713, 44) at 768 wide. After the resize to 1280, that point is over the desktop "Blog" trigger. My probe showed `:hover` on `BUTTON(Blog)`, and the header capture changes once the mouse moves away.
  - So the test compares a *hovered* navbar against the unhovered baseline. This is the "9 px on the Blog chevron, pre-existing strict-only" the Engineer recorded from T007 onward. It is a test artifact, not a product diff, but it uses up the tolerance that exists for anti-aliasing and could mask a real 1% regression.
  - The AC 42 test already does the right thing (`page.mouse.move(1, 1)` before capturing).
- **Remediation:** Add `await page.mouse.move(1, 1)` (and, for symmetry with AC 42, blur the active element) after the resize and before `isolate()`/capture. Re-run it strict (`PW_LOCAL_BASELINE=1`) and expect 0 px.
- **Routed to:** Frontend Engineer (QA reviews; QA-owned file)

#### Finding RV-0021: Unit tests assert Tailwind class names (17 `toHaveClass` calls)
- **Location:** `components/layout/drawer/__tests__/drawer-group.test.tsx:74,79,113,148,165-166,186,210,270,279`; `drawer-footer.test.tsx:46-51,68,75`
- **Convention citation:** `frontend-architecture-conventions.md § Engineering Workflow` ("Test names describe behavior, not implementation"); the reviewer's test-quality rubric (implementation-detail assertions)
- **Issue:**
  - These assert strings like `min-h-11`, `eyebrow text-ink-muted`, `flow-root` and `pb-3`, not behavior. A token rename or an equivalent refactor breaks them, and a real regression (for example a class overridden by specificity) passes them.
  - The observable facts are already covered in e2e with computed styles and boxes: 44px rows, Courier/Montserrat, `ink-muted` rgb(72,72,70), 48px pills, and ≥44 × 44 segments.
- **Remediation:** Drop the class assertions where e2e covers the computed result. Keep only structural assertions that jsdom can observe (roles, names, `aria-*`, `hidden`/`inert`, order). The `flow-root`/`pb-3` wrapper checks can become the AC 19 e2e they protect, which already exists.
- **Routed to:** Frontend Engineer

### NIT

#### Finding RV-0022: `clip()` derives the shape by string-replacing `"24px"` and `"100%"` in a stored CSS string
- **Location:** `components/layout/drawer/drawer-motion.ts:53-60`; `lib/motion.ts` (`MOTION.drawer.open.panel.clipFrom`)
- **Convention citation:** `frontend-architecture-conventions.md § Animation (GSAP 3)` (values from named motion values; ADR-0010 condition 5, radius from the token)
- **Issue:** If `clipFrom`'s literal changes (for example to `24PX`, `1.5rem`, or a different inset order), the replacements silently stop working and the radius token is ignored. `"100%"` is also replaced positionally, as its first occurrence.
- **Remediation:** Store numbers (`clip: { bottomFrom: 100 }`) and build `` `inset(0% 0% ${b}% 0% round ${radius || "24px"})` `` in one place.
- **Routed to:** Frontend Engineer

#### Finding RV-0023: On a cold chunk, the first tap shows the X and `aria-controls` before the panel exists, then M2 re-animates the X
- **Location:** `components/layout/navbar.tsx:400-423` (`setDrawerMounted(true)` drives the X and `aria-controls` before `MobileDrawer` resolves); `drawer-motion.ts:95-107` (M2 `from` rotate −90 / opacity 0)
- **Convention citation:** spec § Accessibility Acceptance (`aria-controls` points to the panel while it is open); spec M2; `frontend-architecture-conventions.md § Performance Budgets` (the `next/dynamic` condition in ADR-0006 § 4: no perceptible delay)
- **Issue:**
  - This was found by code reading and not reproduced; the idle and `pointerdown` prefetch normally win the race.
  - If the chunk isn't loaded yet (a tap right after hydration on a slow network), the burger flips to the X with `aria-expanded="true"` and an `aria-controls` that points to a missing id. When the chunk arrives, the X jumps back to −90° / transparent and animates in.
- **Remediation:** QA checks this on Slow 3G (exploratory "Network" row). If it's visible, drive the icon and `aria-controls` from a "drawer ready" signal (for example, set by `MobileDrawer`'s first layout effect) rather than from `drawerMounted`.
- **Routed to:** Frontend QA Engineer (verify) → Frontend Engineer

## UI Quality Checklist

- **States covered:** Yes. The data states are validly N/A (static config, no I/O; the config invariant is tested). Menu states S1–S8 are all built and tested: closed, S2, S3, S4/S5 dots and `aria-current`, reduced motion, no-JS closed navbar, and the 420px tablet panel.
- **Keyboard + focus-visible:** Yes.
  - Focus goes to "Itineraries" at t = 0, and the full Tab cycle works both ways including the X.
  - Esc, the veil and the X return focus to the burger. Enter and Space toggle a header and keep focus on it.
  - The outside is `inert` (verified in Chromium's AX tree).
  - The 2px ink ring shows on every control, including Sign up and the pressed segment.
  - Manual VoiceOver and keyboard passes are pending (QA).
- **Reduced motion honored:** Yes. Every builder returns before creating tweens without `.gsap`, and the chevron transition exists only under the gate. The AC 46 frame compares pass, except the flaky closed-header capture (RV-0019; a pre-existing artifact).
- **Responsive at 360 / 768 / 1280:** Yes, plus 320, 390 × 844, 360 × 640 and 639/640. The drawer never renders at ≥1024, and a resize while open closes it silently. The desktop capture needs RV-0020.
- **Tokens only (no raw values):** Yes. There are no new arbitrary values, and the pre-existing ones are commented. Fonts match the desktop menu (Montserrat; Courier Prime only for headings, scent lines and prices), verified by computed style in e2e.
- **Targets:** Rows are ≥44px on the visible box (all 40 rows, at 360 and 768), headers are ≥56px, pills 48px, segments ≥44 × 44.
- **Bundle:** The drawer and its GSAP are in a lazy chunk, prefetched only below 1024. `/` is +232 B net (RV-0018).

## Process Gaps

1. **No Frontend Security Engineer report for this feature.**
   - Plan § 10 calls a pass "optional" because the surface is DOM-only (`inert`, focus, static hrefs), and the project pipeline (`CLAUDE.md`) runs security after review.
   - At Production posture, the merge still needs either a light Security Engineer pass or an explicit, recorded user acceptance of skipping it.
   - Route: Frontend Security Engineer, before merge and deploy.
2. **No QA test plan or test pass yet.** The QA handoff is in `tasks.md` § QA handoff and the T013 body. Pending:
   - manual VoiceOver on iOS Safari at 360 and a keyboard pass at 768;
   - WebKit behavior of AC 19 `keepInView` (no scroll anchoring);
   - INP and frame pacing of the ≈0.85s unfold and the `clip-path` paint on the preview (ADR-0010 consequence);
   - CLS during accordion motion (ADR-0009);
   - the RV-0019 bug ID and quarantine;
   - the RV-0023 Slow 3G check.
   - Route: Frontend QA Engineer.
3. **No PR and no preview URL.** The T013 acceptance ("the PR quotes…", "the QA handoff block is posted in the PR") is met only in the commit body. It is cleared together with RV-0017.
4. **E2E environment:**
   - `playwright.config.ts` hard-codes port 3100 with `reuseExistingServer: true` locally, so a run can silently test another worktree's server. I ran on 3317 through a scratch config override.
   - Under heavy host load (load average 28 on 10 cores), 33 tests timed out, including pre-existing desktop ones, and all passed once the load fell.
   - Results from shared hosts should be read with that in mind.

## Convention drift (suggestions only; conventions not edited)

- **Suggested convention update: § Performance Budgets / § Animation.** Motion values used only by a lazily loaded module live beside it (or in a separate `lib/` module), not in the shared `lib/motion.ts` object that a First Load route imports. A shared `const` object can't be tree-shaken per chunk (RV-0018).
- **Suggested convention update (QA): § Framework Defaults / visual regression.** Screenshot equality across an overlay open/close cycle uses a pixel tolerance. Chromium's compositor can shift anti-aliasing on `backdrop-filter` edges after an overlay, so byte equality across such a cycle isn't a platform guarantee (RV-0019).
- **Suggested convention update (QA/DevOps): § Framework Defaults.** The e2e port comes from an env var (`PW_PORT`, default 3100), and `reuseExistingServer` is off unless explicitly requested. That prevents cross-worktree false results.
- Plan § 15 items 2–5 (the `focusin` exemption for spec-mandated programmatic focus, the lazy-overlay rule, `inert` + two-edge wrap over `<dialog>`, gated CSS state transitions) are still open drafts. I agree with all four.

## Sign-Off

- **Status:** Reviewed (awaiting the user's merge decision)
- **Notes:**
  - **BLOCK** rests only on RV-0017, a merge gate with no code change: push, label `update-snapshots`, audit that the bot commit touches exactly the four `drawer-*` PNGs, and get a green CI.
  - RV-0018–RV-0021 are NON-BLOCKING. At Production posture I recommend fixing RV-0019 (quarantine or tolerance) and RV-0020 (a one-line pointer move) before the bot run, because both affect the freeze evidence RV-0017 depends on. RV-0018 needs an Architect decision; it can land as a follow-up if the user accepts the +232 B on record.
  - Security sign-off, or a recorded waiver, and the QA pass (Process Gaps 1–2) remain before deploy.
  - Once RV-0017 is cleared and the Process Gaps are addressed, a v2 pass can move this to **CHANGES REQUESTED** (for any open NON-BLOCKING items) or **APPROVE**.
