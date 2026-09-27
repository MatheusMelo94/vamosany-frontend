# Test Pass: vamosany-front-end — Mobile navigation "Índice" (drawer below 1024px) v1

- **Date:** 2026-09-27
- **Reviewed commits:** `main..48e6db1` on `feat/mobile-menu-indice` (17 commits: 4 docs, then T001–T013)
- **Environment:** local production build of `48e6db1` (`next build` + `next start -p 3417`) in an isolated QA worktree.
  - Oracle for AC 1: `main` @ `6384cb9`, built from a clean `git archive` copy and served on 3418.
  - **No preview URL** (the branch isn't pushed), so every number here is local.
  - The CI screenshot baselines and the `update-snapshots` bot (T010) are still the checks of record for AC 1, AC 3 and the last clause of AC 41.
- **Test Plan reference:** derived on the spot from spec v1.1 § Acceptance Criteria 1–52 and the tasks.md T013 QA handoff. No separate pre-implementation Test Plan was produced.
- **Posture:** Production (the posture of record in the previous pass; the site is live on Vercel).
- **Matrix run:**
  - Chromium `phone-360` (touch), `tablet-768` and `desktop-1280`: the projects of record.
  - Ad-hoc viewports: 390 × 844, 360 × 640, 320 × 780, 639/640 × 900, 780 × 360 and 640 × 360 landscape, and 200% text at 360, 390 and 768.
  - **WebKit could not run** (see Process Gaps).
- **Gate Recommendation:** **PASS-WITH-RESERVATIONS.**
  - All 52 ACs have a passing test locally. There is no CRITICAL or HIGH bug, and no axe violation.
  - Two MEDIUM bugs (0006, 0007) and two LOW bugs (0008, 0009) are open. Each needs your accept-or-fix call (see Sign-Off).

## Scope Gate (as announced)
- **Touchpoint:** post-implementation.
- **Read:**
  - spec v1.1, plan, tasks (T001–T013 and the QA handoff);
  - DDR-0006, ADR-0009 and ADR-0010;
  - `frontend-qa-conventions.md`, `design-conventions.md § Motion Principles` and `§ Accessibility Baseline`;
  - `frontend-architecture-conventions.md § Performance Budgets`;
  - the T013 commit body (measurements, and the AC 46 note).
- **Commands:**
  - `npm run build` and `npm run check:first-load`;
  - `npx vitest run`;
  - Playwright through an untracked scratch config (`playwright.qa.config.ts`, the repo config with port 3417, `retries: 0` and a JSON reporter). Port 3100 belongs to the repo config, and port 3000 is the user's dev server.
- **E2E API strategy:** N/A. The menu reads static config and does no I/O (spec § Data Dependencies).
- **Upstream artifacts:**
  - Reviewer: running in parallel; no report on this branch yet.
  - Security: **none for this feature** (see Process Gaps).
- **Host load:** the parallel Reviewer ran the same drawer suites on the same 10-core host.
  - Two of my full runs, at load averages 20–31, were **discarded as contaminated**: 30–60s timeouts in unrelated suites (the pattern already recorded in Bug 0005).
  - Every result below comes from runs at load ≤ 7, mostly at 1 worker.

## E2E Results
- **Feature suite** (`--grep @feature-mobile-nav`, 3 projects, 1 worker, load ≤ 7): **102 passed, 1 failed, 53 skipped** (project-gated). By project: phone-360 50, tablet-768 49 and desktop-1280 3 passed, the desktop three being AC 2, AC 30 and AC 52.
  - The failure is the known intermittent AC 46 check, this time the **no-`.gsap`** variant on tablet-768 (`mobile-nav.spec.ts:1015`). Triaged in **Bug 0009**: a test-oracle problem, not a product defect.
- **Regression, other suites** (`sobre-mi/*`, `not-found`, `split-text`, `typography`; 3 projects, 1 worker): **421 passed, 0 failed**, 74 skipped (project-gated), load ≤ 6.
- **Landing and navbar screenshot suites** under the local `main` oracle: 66 passed, and the 2 expected failures are the drawer baselines (see Visual Regression).
- **QA evidence spec** (`2026-09-27_mobile-nav_v1.qa-spec.ts.txt`, 39 cases × phone-360 and tablet-768, 1 worker): **after probe fixes, every case passes except "360 × 780 at 200% text" on tablet-768, which is Bug 0007.** Covered:
  - fonts;
  - tap targets at 7 viewports;
  - overflow at 8 viewport and zoom cases;
  - short and landscape reachability;
  - keyboard with a group open;
  - the accessibility tree;
  - axe beyond S2/S3/S5;
  - rapid taps;
  - real-time motion (including CPU ×4);
  - accordion layout shift;
  - reduced motion on 3 routes.

  The first run's failures were probe defects, fixed before the rerun:
  - `land()` waited for the landing hero on non-landing routes;
  - a selector hit a hidden desktop `aria-expanded` trigger;
  - an expectation didn't account for `eyebrow`'s uppercase in accessible names;
  - the ×4 tests needed a longer timeout.
- **Vitest:** 32 files, **355/355 passed**.
- **Build:** clean. **`check:first-load`: OK, `/` = 178,780 B** (+288 B vs `perf/first-load.json`, within the 1,000 B allowance and the 180 kB budget). Route First Load: `/` 178 kB, `/sobre-mi` 113 kB, `/colaboraciones` 107 kB, `/trabaja-conmigo` 144 kB, `/contacto` 144 kB, `/preguntas-frecuentes` 108 kB. That matches the T013 commit.
- **Flaky (retried):** 0 retried into green.
  - The AC 46 case is reported as Bug 0009 with its measured rate (2/25 per variant, in isolation).
  - It is **not quarantined**, and the reason is recorded in the bug.

### Acceptance Criteria → evidence (phone-360 and tablet-768 from `/` unless noted)

| AC | Result | Evidence |
|---|---|---|
| 1 | PASS (local oracle) | 35 non-drawer snapshots match `main` @ `6384cb9` within the repo's 1% tolerance: 18 landing (idle, 25/50/75/100% scroll, reduced; × 3 widths); `navbar-closed` and `-reduced` at 360/768/1280; 10 `navbar-panel-*`; `language-menu`. The only diffs are `drawer-top` at 360 and 768, as DDR-0006 expects. CI (bot) is the check of record. |
| 2 | PASS | `mobile-nav` "desktop: no drawer, and the language button still reads EN" (1280) |
| 3 | PASS (local) / pending bot | Local oracle: only the drawer frames differ. The PR (bot commit, DDR-0006 citation) doesn't exist yet. |
| 4, 5 | PASS | `navbar.test.tsx` (RTL) plus `mobile-nav` focus and modality cases; QA accessibility tree ("Cerrar menú", `expanded`, landmark "Menú"). **See 0006**: on the first open of each page load, the X shows about 340ms before the veil and panel. |
| 6, 7 | PASS | `mobile-nav` "first level: five closed headers…"; QA fonts (every text node in all 5 groups: headers Montserrat 700, `text-transform: none`) |
| 8 | PASS | `mobile-nav` "360 × 780 / 390 × 844: the first level fits" |
| 9 | PASS | `mobile-nav` "phone: 16px insets, under the capsule, 24px radius, veil over the viewport" |
| 10 | PASS | `mobile-nav` "boxes and fonts"; QA fonts: the segments, Log in and Sign up are Montserrat 600 with `none` transform; **the only Courier text in the panel is the `h3` column headings, the scent lines and the prices** (all 5 groups, `/` and `/sobre-mi`) |
| 11 | PASS | `mobile-nav` "`${path}`: Sobre mí open with the header dot, Services closed" (5 routes) |
| 12–14 | PASS | `mobile-nav` "one group open at a time…"; QA keyboard |
| 15 | PASS | `mobile-nav` hit-region replacement (360, 768); **QA tap targets at 7 viewports (incl. 320, 360 × 640, 780 × 360, 640 × 360), all 5 groups**: every row ≥44px and as wide as the list, headers ≥56px, pills 48px, segments ≥44 × 44 |
| 16–18 | PASS | `mobile-nav` "tags on exactly three rows; Services' prices in Courier bold, right-aligned; no blurbs" |
| 19 | PASS (Chromium) | `mobile-nav` "keeps the opened header in view" (motion on and off). **Unverified on WebKit** (the handoff notes it has no scroll anchoring; see Process Gaps). |
| 20–23 | PASS | `mobile-nav` index cases (5 routes); QA axe S4 on `/colaboraciones` with Guides open |
| 24 | PASS | `mobile-nav` "reopen restores the default, list at the top"; QA rapid taps "close mid-accordion, reopen at once" (defaults, no leftover `height`, `scrollTop` 0) |
| 25, 26 | PASS | `mobile-nav` and `navbar` "tapping an item navigates and closes (AC 3)"; "a Services row from /sobre-mi lands on #services, in view"; QA "Enter on a row navigates and closes" |
| 27 | PASS | `mobile-nav` "Idioma: ES, PT, EN…" |
| 28 | PASS | `mobile-nav` "Log in / Sign up closes the drawer and navigates" |
| 29 | PASS | `mobile-nav` "X / veil / Escape closes and returns focus"; QA: Esc from a row inside an open group |
| 30 | PASS | `navbar` "drawer closes silently at ≥ 1024" (desktop-1280, `navbar-closed` compare) |
| 31 | PASS | `mobile-nav` "scrolling over the page or past the list's end doesn't move the page" |
| 32 | PASS | `mobile-nav` focus on open. **See 0006** for the first open's 340ms delay. |
| 33 | PASS | `mobile-nav` "keyboard: the full cycle…, both ways"; **QA: with Itineraries open, Tab visits its 12 rows in config order right after the header, then Guides**. Every focused row lies inside the list's visible rect (not obscured by the pinned footer; WCAG 2.4.11), with the 2px solid ring at 2px offset. |
| 34 | PASS | `mobile-nav` "the page behind is inert" (CDP accessibility tree) |
| 35 | PASS | `mobile-nav`; QA: Space on "Itineraries" expands it and focus stays |
| 36 | PASS | QA accessibility tree on `/sobre-mi`: h2 × 5 then h3 "VAMOS A NEW YORK", "AYUDA" (the `eyebrow` uppercase reaches the accessible name, per DDR-0006 item 22); button names equal the labels; the scent line is the description |
| 37 | PASS | Vitest (`drawer-group.test.tsx`) plus the accessibility tree (no dot, globe or chevron node exposed) |
| 38 | PASS | `mobile-nav` keyboard cycle (the ink ring, including Sign up and the pressed segment); QA keyboard (the rows' rings) |
| 39 | PASS | `mobile-nav` "boxes and fonts"; QA tap targets at 7 viewports |
| 40 | PASS | `mobile-nav` axe S2, S3 and S5 at 360 and 768: 0 violations. QA axe, **also 0**, on S3 Services (prices and tag pill), S4 on `/colaboraciones` with Guides open, and PT selected (WCAG 2.0/2.1/2.2 A and AA tags). |
| 41 | PASS (local) / baseline pending bot | `mobile-nav` "opening unfolds…" (`page.clock`) and "the frame at 0.9s is the settled drawer". Its "equals the committed drawer baseline" clause waits for the bot's regenerated PNGs. |
| 42, 43, 45, 47 | PASS | `mobile-nav` motion cases; `navbar` "drawer close rolls up…" |
| 44 | PASS | `mobile-nav` accordion swap ≤0.5s, double tap |
| 46 | PASS (intermittent oracle, **0009**) | `mobile-nav` reduced motion and no-`.gsap` (open/close and accordion): 3 of 4 cases pass consistently; the open/close compare is 23/25. QA reduced motion on `/`, `/sobre-mi` and `/preguntas-frecuentes` × 2 projects: **the first frame after each tap has no opacity below 1, no clip and no inline style, and `gsapPending` is 0.** |
| 48 | PASS | `mobile-nav` "360 × 640: Film Locations scrolls fully above the footer"; QA: every group's last row at 360 × 640, 780 × 360 and 640 × 360 |
| 49, 50 | PASS | `mobile-nav` "tablet: 420px wide, right edge on the capsule's right edge" and "the 420px cap starts at 640" |
| 51 | PASS | `mobile-nav` "320: no horizontal overflow" and "320: scent lines wrap"; QA overflow at 320 (all groups). **The 200%-text part of § Accessibility Acceptance fails: see 0007** (not an AC, but spec text). |
| 52 | PASS | `navbar` "no JavaScript › closed navbar matches its baseline" at 360/768/1280, compared against the `main` oracle |

## Accessibility Results
- **axe violations:** **0** of any impact on every open-drawer state tested:
  - S2, S3 (Itineraries), S3 (Services) and PT selected on `/`;
  - S4 on `/colaboraciones` with Guides open;
  - S5 on `/sobre-mi`;
  - each at 360 and 768.
- **Manual keyboard pass:** DONE, Playwright-driven, at 360 and 768 (a keyboard at 768 is the handoff's manual case).
  - Tab to the burger, then Enter: focus lands on "Itineraries". Space expands it, and focus stays.
  - Tab walks its 12 rows in config order, then Guides … Sobre mí, ES, PT, EN, Log in, Sign up, "Cerrar menú", then back to Itineraries. Shift+Tab reverses (Engineer case).
  - Every focused control shows the 2px ink ring at 2px offset, and no focused row is hidden behind the pinned footer.
  - Esc from a row closes, and focus returns to the burger, now named "Abrir menú".
  - Enter on a row navigates and closes the drawer. Space on the burger toggles.
  - `main`, `footer` and the logo are unfocusable and absent from the tree while the drawer is open (Engineer case, CDP tree).
  - **Finding: Bug 0006.** On the first open of a page load, a Tab pressed within about 300ms of Enter lands in the page, and focus is then pulled into the panel.
- **Screen reader:** **VoiceOver on iOS Safari NOT run.** There's no iOS device or WebKit here. The proxy is Chromium's accessibility tree on `/sobre-mi`:
  - the heading list is 5 `h2` plus the open group's 2 `h3`;
  - the names are "Abrir menú" / "Cerrar menú", "Menú" and "Idioma";
  - the scent lines are the header buttons' descriptions;
  - the segments expose `pressed`.
  - Note for the VoiceOver check: the scent lines and `h3`s reach assistive tech in **uppercase** ("BY LENGTH · BY SEASON · BY APPETITE"), because Chromium applies `text-transform` to accessible text. VoiceOver usually reads uppercase words normally, but confirm it doesn't spell "ESTA" or "FAQ"-like tokens letter by letter. Not a bug (DDR-0006 item 22).
- **Pre-existing, not re-filed:** Bug 0004 (Open). Its **drawer-item part is resolved by this feature**: rows now measure ≥44px, where they were 22px. The burger (40 × 40) and the logo link are frozen and unchanged, so 0004 stays open for those.

## Visual Regression Results
- The committed CI baselines aren't comparable on this machine (fonts differ), as documented in `playwright.config.ts`. The **local oracle** was used instead: `main` @ `6384cb9` recorded with `PW_LOCAL_BASELINE=1`, then `48e6db1` compared at the repo's 1% tolerance.
- **Snapshots compared: 39. Identical: 35. Diffs: 2 compared** (`drawer-top` at 360 and 768; `drawer-last-group` wasn't reached because the test stops at the first diff).
  - **All diffs are intended** (DDR-0006; tasks.md "Visual rule": only the four `drawer-*` files may change).
  - Every other screenshot is diff 0: the landing ×18, `navbar-closed` and `-reduced` ×6 (including the no-JS path), `navbar-panel-*` ×10 and `language-menu`.
- **Review by eye** of the new drawer frames (S2 at 360 and 768; S3 Services at 360 and 320; S4/S5 on `/colaboraciones`; 780 × 360 landscape):
  - They match the spec's typography and layout: Montserrat bold names, uppercase Courier `ink-muted` scent lines and column headings, Courier bold prices, yellow tag pills, the 6px header and row dots, a pinned footer with ES filled, and 48px pills.
  - Findings:
    - **Bug 0008:** Guides' scent line wraps to 3 lines at 360.
    - The tablet `drawer-top` capture includes the X button's **hover fill**, because the pointer is still over it after the click. That's harness brittleness, noted in 0009 for the Engineer.
  - Observation, not a bug (spec-conformant): on the 360 × 780 S5 view of `/contacto` and `/preguntas-frecuentes`, the current row starts below the list's fold, because every open starts at the top (AC 24). The header dot still orients the Visitor. It's for the UX Strategist to weigh in a later iteration.

## Regression Results
- **In scope** (`§ Regression Scope`, widened):
  - `components/layout/navbar.tsx` is a shared layout component on every route;
  - `lib/motion.ts` and `app/globals.css` (a new selector) are touched;
  - `tests/e2e/navbar.spec.ts` and `sobre-mi/tap-targets.spec.ts` locators changed.
  - Therefore: the landing, the five Sobre mí pages (structure, forms, FAQ, motion, responsive, tap targets, visual contracts, QA journeys), 404, split text, typography, and the desktop mega-menu and language menu.
- **Suite status: PASS.**
  - Other suites: 421/421.
  - Landing and navbar: 66/66, plus the 2 intended drawer diffs.
  - Feature suite: 102/103; the one failure is 0009, a test-oracle issue.
- Desktop freeze: the `desktop-1280` feature cases (AC 2, 30, 52) pass, and the oracle shows the mega-menu, language menu and closed navbar unchanged.

## Performance Smoke (local, indicative only; the preview is the check of record)
- **First Load JS:** `/` 178,780 B (≤ 180 kB). The drawer is a lazy chunk; the T013 figure is 5.8 kB gzip. **No budget breach.**
- **Unfold, real time** (warm reopen, rAF-sampled, 3 runs each):

| CPU | Panel first paint after tap | Panel unclipped | All 5 headers ≥ 0.8 opacity | Last header fully opaque | Longest frame gap in the first 900ms |
|---|---|---|---|---|---|
| ×1 (phone-360) | 57–89 ms | 584–608 ms | 528–549 ms | 663–683 ms | 26–41 ms |
| ×1 (tablet-768) | 62–95 ms | 595–626 ms | 539–570 ms | 672–692 ms | 25–34 ms |
| ×4 (phone-360) | 221–460 ms | 688–877 ms | 617–827 ms | 753–959 ms | 100–143 ms |
| ×4 (tablet-768) | 279–398 ms | 691–772 ms | 634–727 ms | 757–859 ms | 120–178 ms |

  - **The handoff question, "does ≈0.85s feel slow on repeated taps?"**
    - On a warm reopen at ×1, the index is readable at about 0.55s and fully settled by about 0.68s. The header-dot pop extends Sobre mí routes to about 0.85s.
    - A tap mid-sequence acts at once (AC 43).
    - Rapid-tap probes (7 taps at 80, 200 and 400ms, then close) always ended in a clean, fully settled state: no stuck clip, opacity, `inert` or scroll lock, and no inline style left on the icon.
    - In my judgment the reopen doesn't feel slow at ×1.
  - **Two things do make it feel slow:**
    - The **first** open of every page load adds a ≈340ms dead window before the unfold even starts (**Bug 0006**), so the first open settles at about 1.2s.
    - At CPU ×4 (mid-tier phone emulation), frames stall for 100–178ms and settling stretches to about 0.95s.
- **INP proxy** (Event Timing durations for burger taps, headless, shared host):
  - ×1: 48–144 ms.
  - ×4: 48–544 ms, with several interactions over the 200ms budget.
  - Not filed as a bug: this is emulation on a loaded shared host, not the preview on a real device. **It needs the ADR-0010 check** (INP and frame pacing of the unfold at 360 on the preview) before the production deploy.
- **CLS during the accordion (ADR-0009):**
  - Every `layout-shift` entry recorded during expand, collapse and swap had `hadRecentInput: true`, so they're input-driven and count **0** toward CLS.
  - The capsule never moved.
  - The tapped header stays put on expand, and moves only when a group above it collapses. `keepInView` then brings it to the list's top, as AC 19 requires.
- **Lighthouse:** not run. There's no preview, the drawer is an interaction that LHCI's navigation mode doesn't exercise, and the previous pass found `/` crashes the Lighthouse tab here.

## Exploratory Findings
- **Time-boxed:** about 60 minutes (the Production default), not counting the discarded contaminated runs.
- **Probed:**
  - fonts;
  - tap targets and overflow at 320 to 780, landscape, and 175% and 200% text;
  - the keyboard with groups open;
  - the first-open timing;
  - rapid open/close and close during the accordion;
  - reduced motion across routes;
  - frame pacing and layout shift;
  - the AC 46 flake.
- **Bugs found:** MEDIUM 2 (0006, 0007), LOW 2 (0008, 0009).
- **Out of scope / not tried:**
  - WebKit / iOS Safari (it can't launch here) and Firefox (not installed): scroll lock on iOS, AC 19 without scroll anchoring, and `inert` / `clip-path` support.
  - VoiceOver.
  - A real-device INP check.
  - Chunk-load failure (component-level only, per the handoff; covered by Vitest).
  - Security probes: none pursued, and no security smell seen. There are no user inputs, and every href comes from static config.
- **FYI (pre-existing, out of scope):** at 200% text, the landing page itself overflows horizontally (`scrollWidth` 537 at 360 and 474 at 175%). It's frozen per ADR-0006; if you want it tracked, it goes to the UX Strategist.

## Bugs by Severity
- **CRITICAL: 0**
- **HIGH: 0**
- **MEDIUM: 2**
  - [0006](../bugs/0006-drawer-first-open-340ms-gap.md): on the first open after each page load, the X shows at once, but the panel mounts about 340ms later. Until then the page isn't inert, focus is outside, and a quick Tab lands in the page.
  - [0007](../bugs/0007-services-row-price-overflows-at-200-text.md): at 200% text, the "Custom itinerary with Belén" row pushes "€149" out of the panel, and the list scrolls sideways (46px at 360).
- **LOW: 2**
  - [0008](../bugs/0008-guides-scent-line-wraps-to-three-lines.md): Guides' scent line wraps to 3 lines at 360; the spec says two.
  - [0009](../bugs/0009-ac46-closed-header-compare-flaky.md): the AC 46 open/close byte-exact compare is flaky (2/25) because of capsule-corner anti-aliasing. It happens with no drawer too, so it isn't a product defect.

## Routing Summary
- **Frontend Engineer: 3.** 0006 (with the Architect as FYI: `next/dynamic` first-mount throttle), 0007 (let the row wrap), 0009 (test oracle tolerance, plus the pointer off the X before the tablet baseline).
- **Frontend Architect: 0** (FYI on 0006).
- **UX Strategist: 1.** 0008: accept three lines, or choose an `eyebrow-sm` / `balance` DDR. Also, optionally, the S5 below-the-fold observation.
- **Frontend Security Engineer: 0.** No smells. The missing threat-model/findings step for this feature is a Process Gap.
- **Backend team: 0.**
- **Frontend DevOps Engineer: FYI.** WebKit and Firefox projects in CI (still missing, carried from the previous pass). CI `retries: 1` hides 0009.

## Process Gaps
1. **WebKit / iOS Safari unverified.** Playwright's WebKit is missing host libraries here (`libgstreamer-1.0`, `libgtk-4`, `libgraphene-1.0`, `libxslt`), and `playwright.config.ts` still has no `webkit-mobile` project. That matters most here for:
   - AC 19 (the handoff flags WebKit's missing scroll anchoring);
   - `inert`;
   - body scroll lock on iOS (`overflow: hidden` on `body` is known to be leaky in iOS Safari);
   - the `clip-path` unfold with `round`, under the capsule's backdrop blur.

   **Recommendation:** spot-check on a real iPhone on the preview, and add `webkit-mobile` to CI (DevOps).
2. **No preview URL.** The ADR-0010 INP and frame-pacing check and the VoiceOver pass need the preview on real devices.
3. **Baselines pending.** The four `drawer-*` PNGs haven't been regenerated by the bot yet. AC 1, AC 3 and AC 41's last clause are verified only against the local oracle.
4. **No Security review for this feature** (no threat model, no findings). It's low risk (no inputs, static hrefs), but the pipeline in `.claude/README.md` lists security after QA.
5. **No pre-implementation QA Test Plan**; the AC map above was derived on the spot.
6. **Shared host contention.** The Reviewer's parallel e2e runs pushed the load average to 20–31, and two of my runs were discarded. Running Reviewer and QA e2e back to back avoids this.

## Sign-Off
- **Status:** Draft (for your gate decision)
- **Notes:**
  - Everything the spec contracts holds up locally: the index, single-open, current-page dots, keyboard cycle, modality, reduced motion, responsive boxes and the desktop freeze. All 52 ACs have a passing test, axe is clean in every state tested, every visible target is ≥44px at 7 viewports, and the fonts match the desktop menu exactly.
  - **PASS-WITH-RESERVATIONS** rests on four open bugs, each needing your accept-or-fix call:
    - **0006 (MEDIUM):** the first-open dead window. It's the answer to DDR-0006's "does it feel slow?" question: repeated opens are fine, but the first one isn't. Recommendation: fix on this branch; it doesn't change the First Load budget.
    - **0007 (MEDIUM):** the 200% text overflow on the most popular service row. Recommendation: fix on this branch (a wrap rule plus one e2e case).
    - **0008 (LOW):** a UX call; it can ship as is.
    - **0009 (LOW):** a test-only change. Recommendation: fix before the bot run, so CI's `retries: 1` doesn't hide it.
  - If you fix 0006 and 0007, QA v2 will re-verify them by ID, rerun the feature suite, and recheck AC 32/34 timing and the 200% overflow.
- **Artifacts:**
  - Bugs: `docs/qa/bugs/0006…0009`.
  - QA evidence spec: `docs/qa/test-passes/2026-09-27_mobile-nav_v1.qa-spec.ts.txt`.
  - Probe scripts and AC 46 triage: `docs/qa/test-passes/2026-09-27_mobile-nav_v1.qa-scripts.txt`.
  - Both are `.txt` files, which keeps them out of `tsc`/ESLint. The Engineer may promote cases to `tests/e2e/mobile-nav.spec.ts` (`@feature-mobile-nav`): fonts across all groups, tap targets at more viewports, 200% text on a non-mobile context, keyboard with a group open, rapid taps.
