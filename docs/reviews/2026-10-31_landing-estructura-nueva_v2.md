# Frontend Code Review: vamosany-front-end — Landing "estructura nueva" in Spanish (DDR-0008) v2

- **Date:** 2026-10-31
- **Reviewer:** Frontend Reviewer (for Matheus Melo)
- **Scope:** branch `feat/landing-estructura-nueva` (PR #36), `cdd96a6..e155364`, 14 commits.
  - The history was rewritten before the first push (Security Finding 0017), so v1's hashes no longer exist. v1's range `cdd96a6..236c5fe` now maps to `cdd96a6..30ff1d0`.
  - Delta since v1: `1515e14` (fix: RV-0024 and others) and `e155364` (DDR-0008 records the user's decisions, footer "Montevideo"). Also new in the range, not audited as code: `67e943c` (review v1), `00292b4` (security findings), `6b94e09` (QA e2e spec), `bcdd54e` (QA report).
- **Upstream artifacts:**
  - Spec of record: DDR-0008 (`docs/ddr/0008-landing-nova-estrutura-em-espanhol.md`), amended in this range.
  - Security: `docs/security/findings/2026-10-31_landing-estructura-nueva_v1.md` (GO; 0016 INFO open, 0017 INFO resolved).
  - QA: `docs/qa/test-passes/2026-10-31_landing-estructura-nueva_v1.md` (FAIL on QA-0010 and QA-0011; QA-0010..0015).
  - Still none: formal spec, plan and tasks (user accepted), design handoff.
- **Posture:** Production.
- **Recommendation:** **CHANGES REQUESTED.** RV-0024 is resolved and verified in the browser and by an e2e that goes red on the old code. No BLOCKING findings remain. Two NON-BLOCKING items are open: RV-0027 (narrowed to the PR description) and the new RV-0033 (the new RV-0024 regression test doesn't detect RV-0024). Once RV-0033 is fixed, the recommendation moves to APPROVE, with RV-0027 either done or explicitly accepted.

## Summary

- **Commits reviewed (delta):** 2 (`1515e14`, `e155364`). All 14 commits in the range were re-checked for scope.
- **Tests added in the delta:**
  - E2E: new `tests/e2e/recommendations.spec.ts` (2 cases × 3 projects).
  - `landing-estructura.spec.ts`: the QA-0010 case is un-fixme'd. The contrast case is split: the section check passes, and the eyebrow check is fixme'd for QA-0011.
  - Unit: no change (no component test touched).
- **Suite status** (run by me on `e155364`):
  - `npm run typecheck`: **PASS**
  - `npm run lint`: **PASS**
  - `npm run format:check`: **PASS**
  - `npm test`: **PASS**, 34 files / 361 tests
- **Build status** (`npm run build`): **PASS**, all routes static.
  - First Load JS: `/` 178 kB, `/_not-found` 103 kB. The other routes are unchanged (`/sobre-mi` 113, `/colaboraciones` 108, `/preguntas-frecuentes` 108, `/contacto` 145, `/trabaja-conmigo` 145).
  - `npm run check:first-load`: **PASS**, `/` = 178,181 B, −311 B vs baseline, budget 180.00 kB. That's +19 B vs v1.
- **E2E** (`npx playwright test tests/e2e/recommendations.spec.ts tests/e2e/landing-estructura.spec.ts`, after `npm run build`, config server `next start` on 3100):
  - Result: **40 passed, 5 skipped, 0 failed**. The 5 skips are the QA-0011 eyebrow fixme × 3 projects and the desktop-only nav case on 360 and 768. This matches the commit body.
- **Red check** (scratch worktree at `e155364` with `recommendations.tsx` reverted to `1515e14^`, built, same two specs):
  - `landing-estructura.spec.ts:94` (motion on) **fails** on all 3 projects ("Broadway cards must be opaque"). Correct.
  - `recommendations.spec.ts:46` (tabs fit) **fails** at 360 (Internet's right edge at 427 px). Correct.
  - `recommendations.spec.ts:23` ("cards stay visible after switching tabs with motion on") **passes on the defective code**. See RV-0033.
- **Browser verification** (Playwright script against `next start`, motion on, 320 / 360 / 1280):
  - Effective opacity (product of ancestors) of every `[role=tabpanel] li` after switching to Broadway, Internet and back is `1` at all three widths.
  - The tablist wraps to 2 rows at 320 and 360. Every tab is inside the viewport, and there's no page-level horizontal scroll.
  - 10 star ratings expose `role="img"` named "5 de 5 estrellas".
  - The tab `transition-duration` is 0.18 s (`--duration-base`).
- **BLOCKING findings:** 0
- **NON-BLOCKING findings:** 2 open (RV-0027, RV-0033 new)
- **NIT findings:** 1 open (RV-0034 new)
- **Open Security findings referenced:** 0016 (INFO, non-blocking, future affiliate links) and baseline 0009 (LOW, newsletter without a service, accepted by the user in DDR-0008). There are no blocking security findings at Production.

The fix is the one v1 asked for. The reveal moved onto the persistent panel, with a comment that explains why, and the tabs now wrap instead of hiding a third of the strip. It's small, local and doesn't touch the frozen sections.

## Prior Findings Status

| ID | Severity (v1) | Status | Evidence |
|---|---|---|---|
| RV-0024 | BLOCKING | **Resolved** | `recommendations.tsx:160-169`: `data-reveal` sits on the persistent `role="tabpanel"`, and `data-reveal-group` was removed from the `<ul>`. Verified in Chromium at 320/360/1280 with motion on: every card has effective opacity 1 after each tab switch. Guarded by `landing-estructura.spec.ts:94`, which goes red on the old code. The regression test written for it, `recommendations.spec.ts:23`, doesn't guard it; that's RV-0033. |
| RV-0025 | NON-BLOCKING | **Accepted by user** | DDR-0008 § "Risco aceito (RV-0025)" (`e155364`): the user chose on 2026-10-31 to keep the buttons as they are, instead of `aria-disabled` plus "próximamente", until the links land. Links are the next content task. |
| RV-0026 | NON-BLOCKING | **Resolved** | `recommendations.tsx:128`: `flex-wrap justify-center`, with the arbitrary scrollbar pair and `overflow-x-auto` gone. Measured: all tabs are inside the viewport at 320 and 360. Guarded by `recommendations.spec.ts:46`, which goes red on the old code. The same pair at `reviews.tsx:123` predates this branch (it's on `main`) and isn't graded. |
| RV-0027 | NON-BLOCKING | **Still open (narrowed)** | The fix commit `1515e14` follows the § Engineering Workflow body format: what changed, why, and tests with counts (40 passed, 5 skipped, which I confirmed). It still cites RV/QA IDs rather than convention sections, and it bundles 8 independent changes into one commit. I couldn't read the PR #36 description: `gh` has no GitHub App token in this environment, and I didn't use a personal token. Remaining remediation: put the per-commit convention citations and test counts for the feature commits in the PR description. |
| RV-0028 | NON-BLOCKING | **Accepted by user** | DDR-0008 § 8 (`1515e14`) now records that Servicios has four items, including Visa (user decision), and that all four lead to `/#services` until service pages exist. The mismatch (a Visa link that lands on three cards) is now a recorded, decided consequence. |
| RV-0029 | NON-BLOCKING | **Resolved** | `recommendations.tsx:90`: `TABS.find(...) ?? TABS[0]`. There's no `!` in production code. `typecheck` passes. |
| RV-0030 | NIT | **Resolved** | `recommendations.tsx:147`: `duration-(--duration-base) ease-(--ease-default)`, so tokens are used and there's no magic number. v1 suggested `--duration-fast` (the design-conventions § Motion Principles row for state changes). The engineer matched `Button` (`button.tsx:20`, `--duration-base`) instead, which is the project's established precedent. Not re-graded; see the drift note. |
| RV-0031 | NIT | **Resolved** | `reviews.tsx:130-134`: `role="img" aria-label="5 de 5 estrellas"`. 10 instances measured. |
| RV-0032 | NIT | **Resolved** | `footer.tsx:150` is "Suscripción a la newsletter" and `footer.tsx:35` is "Archivo de la newsletter". No "al/del newsletter" remains in source. |

## Findings

### BLOCKING

None.

### NON-BLOCKING

#### Finding RV-0033: The RV-0024 regression test passes on the defective code
- **Location:** `tests/e2e/recommendations.spec.ts:4-9` (`cardOpacities`) and `:23-44`
- **Convention citation:** `frontend-architecture-conventions.md § Engineering Workflow` (Red before Green: the test must fail for the behavior it covers). Reviewer Test Quality audit (tests fail for the right reason).
- **Issue:**
  - The defect hid the `<li>` (`.gsap [data-reveal-group] > *`), but `cardOpacities` reads `getComputedStyle(article).opacity`. Opacity isn't inherited, so the `<article>` reports `"1"` while its `<li>` is at `0`.
  - `panelOpacity` multiplies from the panel upward, so it never sees the `<li>` either.
  - Verified: with `recommendations.tsx` reverted to `1515e14^` and rebuilt, this test passes on all 3 projects, while `landing-estructura.spec.ts:94` (which reads `parentElement`, the `<li>`) fails as it should.
  - The bug is guarded today only by the QA spec. The test whose name and tag claim RV-0024 would let it regress.
- **Remediation:**
  - Measure each card's **effective** opacity, the product of `getComputedStyle(n).opacity` from the `<article>` up to `<html>`. Reuse the ancestor walk already in `panelOpacity` per card and assert every value is `1`.
  - Re-run the red check: revert `recommendations.tsx` to `1515e14^`, `npm run build`, and confirm the test fails on Broadway.
  - Optionally drop `panelOpacity`, since the per-card ancestor walk covers it.
- **Routed to:** Frontend Engineer

### NIT

#### Finding RV-0034: DDR-0008 edited in place after it was Accepted
- **Location:** `docs/ddr/0008-landing-nova-estrutura-em-espanhol.md:3` (Status: Accepted 2026-10-31). Substantive edits in `1515e14` (§ 8: Itinerarios removed, Visa added; risk RV-0025) and `e155364` (risk wording, newsletter, reseñas, footer).
- **Convention citation:** `design-conventions.md § Design Decision Records` (line 137: "Immutable once *Accepted*"; Status: Proposed | Accepted | Superseded).
- **Issue:**
  - The decisions changed after acceptance, and nothing in the record shows it.
  - All edits are pre-merge, in the same PR and on the same day, so the record that lands on `main` is coherent. That's why this is a NIT.
  - The `e155364` commit is typed `docs(ddr)` but also changes production copy in `footer.tsx` ("Hecho en Montevideo"). The copy change is recorded in the DDR, so this is hygiene only.
- **Remediation:**
  - Add one line under Status, for example "Amended before merge, 2026-10-31: § 8 (Itinerarios, Visa), Botões sem destino, Newsletter, Reseñas, Rodapé (decisions of the user in the review/QA/security round)".
  - After merge, any further change is a new DDR that supersedes this one.
  - Keep code changes in `feat`/`fix` commits.
- **Routed to:** UX Strategist (record), Frontend Engineer (commit hygiene)

## QA and Security Cross-Reference (delta)

- **QA-0010** (HIGH): resolved. This is the same defect as RV-0024, and its QA case is un-fixme'd and goes red on the old code.
- **QA-0011** (HIGH): partially resolved.
  - The section-specific captions moved to `--color-ink-subtle` (#484846), and the section axe passes with eyebrows excluded.
  - The site-wide `.eyebrow` token (`--color-ink-tertiary`, #a8a8a4, about 2.3:1) is unchanged and fixme'd as pending a DDR, because it touches every frozen section (ADR-0006).
  - That's a design decision for the UX Strategist, not this PR's code. It keeps QA's gate open until QA re-grades it.
- **QA-0012** (MEDIUM): accepted by the user. Per DDR-0008 § Newsletter, the form stays visible without a service. This is the same item as Security baseline 0009.
- **QA-0013** (MEDIUM): pre-existing on `main`, and smaller on this branch (133 px vs 240 px overflow at 1024/150%, as the user measured). It's not attributable to this scope.
- **QA-0014** (LOW): resolved (same as RV-0032).
- **QA-0015** (LOW): pre-existing flaky FAQ test that the branch doesn't touch.
- **Security 0017:** resolved. `reviews.tsx:35` shows "Laura P.", and the history was rewritten before the first push.
- **Security 0016:** open, INFO, for the future affiliate-link PR.
- **No new security smells in the delta:** no raw HTML, storage, env or outbound URL was added.

## UI Quality Checklist

- **States covered (loading / empty / error / success):** Static content, so success only. The "Mis recomendados" success state now holds after every tab switch with motion on (RV-0024 resolved). The 404 and error states are unchanged since v1.
- **Keyboard + focus-visible:** Tabs are unchanged (roving tabindex, arrows, Home and End; the e2e passes on 3 projects). Focus no longer lands on invisible cards after a tab switch. The ten inert buttons are accepted by the user (RV-0025).
- **Reduced motion honored:** Yes. The `reduce` cases pass, and the content is visible at once.
- **Responsive at 360 / 768 / 1280:** Yes, and at 320. The tab strip wraps to two rows below `sm` with all tabs visible, and there's no horizontal scroll.
- **Tokens only (no raw values):** Yes for the delta. Motion and color use tokens (`--duration-base`, `--ease-default`, `--color-ink-subtle`).
- **Images / fonts:** No change.
- **Bundle:** `/` is at 178.18 kB of 180 kB, in budget, +19 B vs v1.
- **Copy:** Matches the amended DDR-0008, with "la newsletter" used consistently and "Hecho en Montevideo".

## Process Gaps

- **QA re-pass needed.** QA v1 is FAIL. QA-0010 is now fixed, and QA-0011 needs QA's re-grade, or a DDR for the `.eyebrow` token. Route: Frontend QA Engineer, then UX Strategist (token DDR).
- **CI `update-snapshots` run still to inspect.** The delta changes pixels inside DDR-0008's scope: the whole-panel reveal instead of the card stagger, the wrapped tab strip, and the caption color. The baseline must be regenerated, and someone must confirm that only DDR-0008 sections changed (ADR-0006). Route: user, via the CI workflow.
- **PR description not verified.** `gh` needs the GitHub App env (`GH_APP_ID` not set); I didn't fall back to a personal token. This affects RV-0027 only.
- **Landing reveals have no `focusin` safeguard** (`features/landing/motion/scroll-effects.tsx`, pre-existing). This is a known backlog item per ADR-0008 § 4, "Render-Preserving", and not introduced here. The new `data-reveal` panel holds focusable buttons, so it's one more instance. Route: Frontend Architect (backlog).
- **Unrelated commit in scope:** `aab3302` (agent models), unchanged since v1. The user decides.
- **Untracked brief at the repo root** is still untracked and not excluded. Add it to `.git/info/exclude` so a `git add -A` can't publish it.
- **Suggested convention update: § Motion Principles.** The table assigns `--duration-fast` to state changes, but the project's `Button` and now the tabs use `--duration-base` (180 ms). Either align the convention row with the project's choice or record the project value in the design system, so reviewers stop flagging one or the other. Route: Frontend Architect / UX Strategist.
- **Suggested convention update: § Animation (GSAP 3)** (from v1, still open). Content that mounts after the scroll controller runs must not sit under a `[data-reveal-group]`; reveal a persistent wrapper instead. RV-0024's fix is the reference pattern. Route: Frontend Architect.

## Sign-Off

- **Status:** Reviewed
- **Notes:**
  - **CHANGES REQUESTED.** There's no BLOCKING finding, and the suite, build, budget and requested e2e are green.
  - Fix RV-0033, a test-only change, and either fill in or explicitly accept RV-0027 (the PR description). Then this moves to APPROVE. RV-0034 is a one-line amendment note.
  - Merge also needs, outside this review: the QA re-pass (QA-0011), and inspection of the CI `update-snapshots` artifacts.
