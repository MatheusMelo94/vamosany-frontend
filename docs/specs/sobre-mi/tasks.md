# Tasks: vamosany-front-end — Sobre mí (5 pages + navbar menu) v1.1

- **v1.1 (2026-09-26):** UI-only forms (spec v1.1 `d580ec0`; Security G1 R-01..R-07). Backend tasks are marked **Deferred (backend)**, not deleted. M3–M5 rewritten. See plan § 0.
- **Plan:** `docs/specs/sobre-mi/plan.md` v1.1 (Ready for /tasks) · **TDD:** `docs/tech-design/sobre-mi.md` · **Spec:** `docs/specs/sobre-mi/spec.md` v1 · **Contract Request:** `docs/specs/sobre-mi/contract-request.md`
- **Branch:** `feat/sobre-mi-pages` (the Engineer creates it from `main`). One task = one conventional commit. Execute in numeric order; the gates G1/G2 are Security, not the Engineer.
- **Commands** (npm, ADR-0005): suite = `npm run typecheck && npm run lint && npm test`; build = `npm run build`; e2e = `npm run test:e2e -- --grep @feature-sobre-mi` (tag every new spec `@feature-sobre-mi`). Screenshot baselines are generated **only** by the CI bot (`update-snapshots` label, or `update-snapshots-desktop` after T003). Locally, snapshots are ignored unless `PW_LOCAL_BASELINE=1` (`playwright.config.ts`).
- **Labels:** `Render-Preserving` (ADR-0006: the landing must be diff 0 unless the task names allowed diffs) · `Pre-Contract` (only Deferred tasks now) · `Deferred (backend)` · `R-0N` (Security G1 control the task implements) · `ADR-0007` · `DDR-000N` · `Needs-Approval` (waiting on the user) · **build check required** where the task touches `app/`, `'use client'` boundaries, `next.config.ts`, `playwright.config.ts` or env.
- **Citations shorthand:** `A§` = `frontend-architecture-conventions.md §`, `D§` = `design-conventions.md §`, `S§` = `frontend-security-conventions.md §`, `Q§` = `frontend-qa-conventions.md §`.
- **AC numbers** are the spec's § Acceptance Criteria (1–51).

---

## M0 — Foundations (Render-Preserving; landing diff 0)

### T001 — chore: add `msw` and `server-only`; wire MSW into Vitest
- **Status:** Skipped. Not needed in v1.1: no MSW, no `server-only` (plan § 0.1 F9); this also makes G1 R-07 moot
- **Layer:** infra
- **Files:** `package.json`, `package-lock.json`, `tests/fixtures/msw/server.ts`, `tests/fixtures/msw/handlers/index.ts` (empty array), `tests/setup.ts`
- **Acceptance:**
  - `msw` (devDependency) and `server-only` (dependency) are installed with `npm install`; the commit body states each one's purpose (S§ Supply Chain).
  - `tests/setup.ts` starts the MSW server with `onUnhandledRequest: "error"` and resets handlers after each test; the existing suite stays green.
- **Test type:** component (the existing suite is the check)
- **Citations:** A§ Stack Baseline (MSW, `server-only`), Q§ Test Data Fixtures
- **Depends on:** —
- **Labels:** Render-Preserving

### T002 — test(e2e): characterize the current navbar (closed, panels, drawer, language menu)
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** e2e baseline
- **Files:** `tests/e2e/navbar.spec.ts` (new), `tests/e2e/navbar.spec.ts-snapshots/` (bot-generated)
- **Acceptance:**
  - On `/`, with **unchanged app code**, it captures `header[data-nav]` clips: `navbar-closed` (360/768/1280); `navbar-panel-{itineraries,guides,blog,services,about}` at 1280 (opened by clicking the trigger, pointer parked on the trigger); `drawer-top` and `drawer-last-group` at 360/768; `language-menu` at 1280. Reduced-motion variants of `navbar-closed` too.
  - The baseline is committed by the `update-snapshots` bot; the second CI run passes with diff 0.
- **Test type:** e2e
- **Citations:** ADR-0006 § 2 (oracle); plan § 12
- **Depends on:** —
- **Labels:** Render-Preserving · QA-owned file (the Engineer writes it; QA reviews)

### T003 — ci: scoped desktop snapshot update
- **Status:** **Open** (DevOps). Needed before regenerating the 6 landing desktop snapshots (plan § 12)
- **Owner:** Frontend DevOps Engineer
- **Files:** `.github/workflows/update-snapshots.yml`
- **Acceptance:**
  - The PR label `update-snapshots-desktop` runs `npx playwright test --project=desktop-1280 --update-snapshots=all` and commits only `tests/e2e/**/*-snapshots/*desktop-1280*`. The existing `update-snapshots` label behavior is unchanged.
  - The workflow's job summary lists the snapshot files changed in the bot commit, which the Reviewer uses to check against plan § 12.
- **Test type:** — (workflow dry run on a PR)
- **Citations:** `frontend-devops-conventions.md` § CI Pipeline Shape; plan § 12 item 4
- **Depends on:** —
- **Labels:** —

### T004 — refactor: move `motionEnabled()` to `lib/gsap.ts`; split `CustomEase`/`getEases` into `lib/gsap-ease.ts`
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** lib
- **Files:** `lib/gsap.ts`, `lib/gsap-ease.ts` (new), `lib/gsap-text.ts`, `features/landing/motion/attributes.ts` (re-export), `lib/__tests__/gsap-ease.test.ts`
- **Acceptance:**
  - `getEases()` returns the same `ds`/`arrive` instances when called twice; `lib/gsap-text.ts` still exports `SplitText`, `CustomEase` and `getEases`; the landing imports compile unchanged.
  - `npm run test:e2e` (landing + split-text) passes with diff 0; `npm run build` shows the landing's First Load JS unchanged (± 0.5 kB).
- **Test type:** component + e2e regression
- **Citations:** ADR-0002 condition 2; ADR-0003 condition 2; A§ Animation (GSAP 3)
- **Depends on:** —
- **Labels:** Render-Preserving · build check required

### T005 — feat(motion): add the Sobre mí motion values to `lib/motion.ts`
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** lib
- **Files:** `lib/motion.ts`, `lib/__tests__/motion.test.ts` (new)
- **Acceptance:**
  - A test pins **every existing** `EASE`/`MOTION` key and value (inline snapshot) and fails if any existing value changes.
  - The new keys exist with exactly the values in plan § 8.4: `page`, `menuMarker`, `sobreMi`, `colaboraciones`, `trabajaConmigo`, `contacto`, `faq`, `form`.
- **Test type:** component (unit)
- **Citations:** A§ Animation ("durations and easings come from…"); DDR-0003, DDR-0004; spec § Token Proposals 1
- **Depends on:** —
- **Labels:** Render-Preserving

### T006 — style: token additions and `.gsap` initial-state rules for `[data-sm-*]`
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** styling
- **Files:** `app/globals.css`
- **Acceptance:**
  - Adds the tokens and utilities the user approved from plan § 7 (`body-prose`, `display-pull`, `--container-{gutter,rows,fields,timeline-sm}`), plus the `.gsap [data-sm-*]` rules and `[data-reading-bar]` rules from plan § 7. **No existing rule is edited.**
  - Landing e2e passes with diff 0.
- **Test type:** e2e regression
- **Citations:** A§ Styling (Tailwind CSS 4); D§ Design Tokens; ADR-0002 condition 3
- **Depends on:** T005
- **Labels:** Render-Preserving · **Needs-Approval** (token additions, plan § 14 Q3; if declined, only the `.gsap` rules land and components use justified arbitrary values)

---

## M1 — Navbar (DDR-0002, DDR-0003)

### T007 — refactor(nav): extract `NAV` into `components/layout/nav-config.ts`
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** schemas & types
- **Files:** `components/layout/nav-config.ts` (new: `NavGroup`, `NavItem` types, `NAV`, `READING_BAR_ROUTES`), `components/layout/navbar.tsx`, `components/layout/__tests__/navbar.test.tsx` (new)
- **Acceptance:**
  - An RTL test renders `Navbar` and asserts the five trigger labels and, after clicking each trigger, the column headings and item titles (today's content).
  - `navbar.spec.ts` and the landing e2e pass with diff 0.
- **Test type:** component + e2e regression
- **Citations:** A§ App Router Layout (one concern per file), A§ Component Model
- **Depends on:** T002
- **Labels:** Render-Preserving

### T008 — feat(nav): "Sobre mí" group with five items (mega-menu + drawer)
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** client leaf
- **Files:** `features/sobre-mi/content/nav.ts` (new), `components/layout/nav-config.ts`, `components/layout/__tests__/navbar.test.tsx`
- **Acceptance:**
  - The trigger reads "Sobre mí" in the last position. Its panel has the columns "Vamos a New York" (Sobre mí, Colaboraciones, Trabajá conmigo) and "Ayuda" (Contacto, FAQ) with the exact blurbs and `href`s from spec § Menu IA. The drawer lists the same items, and tapping one navigates and closes it. **AC 1, 3**
  - No menu or drawer renders "Our Story", "How We Research", "Press", "Work With Us", "Contact", "Refunds" or "The usual suspects". **AC 2**
  - Snapshots: the only diffs are the ones allowed by plan § 12 (item 5, plus the 6 landing desktop files). Regenerate with `update-snapshots-desktop` and `update-snapshots`; the commit body cites DDR-0002 and lists the files. **AC 51**
- **Test type:** component + e2e
- **Citations:** DDR-0002; A§ Routing, Layouts & Boundaries (`next/link`); ADR-0006 § 6
- **Depends on:** T003, T007
- **Labels:** DDR-0002 · build check required

### T009 — fix(a11y nav): disclosure semantics, with Esc returning focus to the trigger
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** accessibility
- **Files:** `components/layout/navbar.tsx`, `components/layout/__tests__/navbar.test.tsx`
- **Acceptance:**
  - Each panel is rendered in DOM order right after its trigger (inside the trigger's `<li>`), and the trigger has `aria-controls`. Tab from an open trigger reaches its first item. **AC 10 (path)**
  - Esc closes an open dropdown and moves focus to its trigger. **AC 10**
  - `navbar.spec.ts` closed and panel snapshots show diff 0 (the positioning context is still the capsule).
- **Test type:** component + e2e regression
- **Citations:** A§ Accessibility (engineering rules); spec § Accessibility (keyboard path, menu)
- **Depends on:** T008
- **Labels:** Render-Preserving

### T010 — feat(nav): current page (`aria-current`) and the static drawer dot
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** client leaf
- **Files:** `components/layout/navbar.tsx`, `components/layout/__tests__/navbar.test.tsx` (mock `next/navigation` `usePathname`)
- **Acceptance:**
  - With pathname `/colaboraciones`, the "Colaboraciones" item has `aria-current="page"` in both the mega-menu and the drawer, and no other item has it. **AC 5 (aria), 9**
  - In the drawer, the current item shows a 6px `bg-brand` dot marked `aria-hidden`. On `/`, no item is current and the snapshots show diff 0. **AC 9**
- **Test type:** component
- **Citations:** DDR-0002, DDR-0003 (drawer); A§ State Management (derive, don't copy)
- **Depends on:** T009
- **Labels:** DDR-0003 · build check required

### T011 — feat(nav): moving marker in every desktop dropdown
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** motion
- **Files:** `components/layout/nav-marker.tsx` (new, `'use client'`, loaded with `next/dynamic` `ssr:false` from the navbar), `components/layout/navbar.tsx` (`data-nav-item`, `data-marker-ready`, title `group-hover:underline underline-offset-4`, room reserved for the dot on the title line), `tests/e2e/navbar.spec.ts`
- **Acceptance:**
  - At 1280, in each of the 5 panels, hovering or focusing another item moves the single highlight (`clip-path`) and the single dot to it; a new target mid-flight retargets. On `/colaboraciones` the marker opens on "Colaboraciones" with no travel; pointer-leave of the list returns it to the current item. **AC 4, 5, 6**
  - The dot's box never intersects the item's title, tag or price boxes in any panel (e2e bounding-box check). Reduced: the marker jumps (the transform equals the target on the next frame, no tween). **AC 7, 8**
  - No-hover panel snapshots and closed-navbar snapshots show diff 0; new hover snapshots are added; the landing's First Load JS is unchanged (± 1 kB, build output).
- **Test type:** e2e (+ component: `NavMarker` places itself on the `aria-current` item)
- **Citations:** DDR-0003; A§ Animation (useGSAP scope, transform/opacity, no width/height); plan § 8.7; ADR-0002 (gate)
- **Depends on:** T004, T005, T010
- **Labels:** DDR-0003 · build check required

---

## M2 — Shared template and the five static pages

### T012 — feat(utils): `slugify()` for anchors
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** lib
- **Files:** `lib/utils.ts`, `lib/__tests__/utils.test.ts`
- **Acceptance:**
  - `slugify("¿Qué es un itinerario personalizado?") === "que-es-un-itinerario-personalizado"`, and `slugify("Viajes grupales") === "viajes-grupales"`. Accents, "¿", "¡" and punctuation are stripped; the result is stable and lowercase.
- **Test type:** component (unit)
- **Citations:** A§ App Router Layout (`lib/utils.ts` pure functions); spec § Page 5 (stable anchors)
- **Depends on:** —
- **Labels:** —

### T013 — test(content): commit the content source and the verbatim oracle
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** schemas & types
- **Files:** `docs/content/sobre-mi-source.md` (verbatim copy of `tempcontentabout/ESTRUCTURA NUEVA WEB VAMOS A NY.md`), `features/sobre-mi/__tests__/verbatim.ts` (helper), `features/sobre-mi/__tests__/verbatim.test.ts`
- **Acceptance:**
  - `normalizeSource()` strips `**`, `*`, `\` escapes and `[text](url)` → `text`, and collapses whitespace. A test proves known sentences are found, and that a string with one accent changed is **not** found.
  - `DOCUMENTED_EXCEPTIONS` lists exactly the spec-sanctioned edits: the Contacto brackets, the two H2 titles without years, and the Efe Hus quote marks (plan § 14 Q1).
- **Test type:** component (unit)
- **Citations:** spec AC 12, § Content & Copy (provenance tags)
- **Depends on:** —
- **Labels:** —

### T014 — feat(sobre-mi): content types and `ExternalLink`
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** schemas & types
- **Files:** `features/sobre-mi/types.ts` (content block types), `features/sobre-mi/components/external-link.tsx`, `features/sobre-mi/__tests__/external-link.test.tsx`
- **Acceptance:**
  - `ExternalLink` renders `target="_blank"` and `rel="noopener noreferrer"`; its accessible name ends with "(se abre en otra pestaña)"; the "↗" is `aria-hidden`. It rejects non-`https:` hrefs at the type or test level. **AC 28**
- **Test type:** component
- **Citations:** A§ Routing, Layouts & Boundaries (`<a>` for external links); S§ Input & Output Handling (URLs); spec § Accessibility (external links)
- **Depends on:** —
- **Labels:** —

### T015 — feat(sobre-mi): template components (`PageHeader`, `NotesLayout`, `ClosingRow`)
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** Server Components
- **Files:** `features/sobre-mi/components/{page-header,notes-layout,closing-row}.tsx`, `features/sobre-mi/motion/attributes.ts` (typed `SM_ATTR` contract, used by the markup from now on), `features/sobre-mi/__tests__/template.test.tsx`
- **Acceptance:**
  - `PageHeader` renders, in order, a label line (1–3 items, no "·" separators between items), one `h1` whose accessible name equals the title (`sr-only` copy plus an `aria-hidden` visual copy with `highlight-heading` + `data-sm-train`), and the dek. **AC 11, 14**
  - `NotesLayout` renders the notes column before the main column in DOM order, as an `@container` with `@gutter:` two columns. `ClosingRow` renders a headline (`h2`) + primary and optional secondary `Button`s between 2px ink rules. **AC 11, 18 (structure)**
- **Test type:** component
- **Citations:** A§ Component Model; D§ Spacing, Layout & Responsive Breakpoints; spec § Shared Page Structure; ADR-0003 condition 3
- **Depends on:** T006, T014
- **Labels:** —

### T016 — feat(route): `(cuaderno)` layout and `/sobre-mi` route skeleton
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** route skeleton
- **Files:** `app/(marketing)/(cuaderno)/layout.tsx`, `app/(marketing)/(cuaderno)/sobre-mi/page.tsx`, `features/sobre-mi/content/metadata.ts`, `features/sobre-mi/components/sobre-mi-page.tsx` (header only), `tests/e2e/sobre-mi/structure.spec.ts`
- **Acceptance:**
  - `GET /sobre-mi` returns 200 with `<title>` "Sobre mí — Vamos a NY" and the § Page metadata description. **AC 13**
  - `main[lang="es"]` exists, the page has exactly one `h1`, and the header, nav, main and footer landmarks are present. The build output marks the route as static (`○`). **AC 14**
- **Test type:** e2e
- **Citations:** A§ App Router Layout, A§ Routing, Layouts & Boundaries (metadata export); spec § Locale Behavior
- **Depends on:** T015
- **Labels:** build check required

### T017 — feat(sobre-mi): page body (notes, prose, pull line, photo, headline line, signature, timeline, closing)
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** Server Components
- **Files:** `features/sobre-mi/content/sobre-mi.tsx`, `features/sobre-mi/components/{prose,pull-line,photo-figure,signature,timeline}.tsx`, `features/sobre-mi/components/sobre-mi-page.tsx`, `features/sobre-mi/__tests__/sobre-mi-page.test.tsx`
- **Acceptance:**
  - Every `[md]` string passes the verbatim oracle; the label shows "+20 visitas" with the number twin pattern (`aria-hidden` visual plus `sr-only` "20"); "a reemplazar" appears nowhere. **AC 11, 12, 21 (static), 23 (content)**
  - The photo is `/img/how-subway.webp` in a 3:2 `bg-surface-2` box with the alt "Salida de una estación de subte en Union Square, New York" and the caption "Union Square, New York."; the timeline has the 5 rows from § Page 1 with `[data-sm-rail]`; the pull line and signature carry their motion attributes. **AC 22–25 (static)**
  - Closing row: "¿Armamos tu viaje juntos?", "Ver itinerarios" → `/#services`, "Viajes grupales" → `/preguntas-frecuentes#viajes-grupales`. **AC 26**
- **Test type:** component
- **Citations:** A§ Performance Budgets (`next/image`, `sizes`); D§ Screen States Matrix (image loading/partial); spec § Page 1
- **Depends on:** T013, T016
- **Labels:** —

### T018 — feat(sobre-mi): real italic for the signature (Courier Prime italic 400, no preload)
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** styling
- **Files:** `features/sobre-mi/fonts.ts` (new `next/font` instance: `weight: "400"`, `style: "italic"`, `preload: false`, `display: "swap"`), `features/sobre-mi/components/signature.tsx`
- **Acceptance:**
  - The build shows no new preload link on `/` (landing HTML diff: none; landing e2e diff 0). The `/sobre-mi` signature computes `font-style: italic` with the italic face loaded (e2e: `document.fonts.check('italic 400 28px …')` after scroll).
- **Test type:** e2e
- **Citations:** A§ Performance Budgets (`next/font`); plan D7; spec § Token Proposals 2
- **Depends on:** T017
- **Labels:** build check required · Render-Preserving (landing)

### T019 — feat(colaboraciones): page, product ledger and closing
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** Server Components + route
- **Files:** `app/(marketing)/(cuaderno)/colaboraciones/page.tsx`, `features/sobre-mi/content/colaboraciones.tsx`, `features/sobre-mi/components/{product-ledger,colaboraciones-page}.tsx`, `features/sobre-mi/__tests__/colaboraciones-page.test.tsx`, `tests/e2e/sobre-mi/structure.spec.ts` (+ route)
- **Acceptance:**
  - Seven rows in § Page 2 order, each with a year (number twin), a partner line, an `h2` title and the `[md]` story. The Efe Hus row has 3 paragraphs around the quote `<p lang="en">` carrying `data-sm-sweep`. Partner links use `ExternalLink`. **AC 12, 27, 28, 29 (static)**
  - The closing row has the `[md]` H2 and paragraph (with `mailto:hola@vamosany.com` inline), "Escribime" → `mailto:hola@vamosany.com` and "Trabajá conmigo" → `/trabaja-conmigo`. Title and meta come from § Page metadata. **AC 13, 31**
- **Test type:** component + e2e (route/metadata)
- **Citations:** spec § Page 2; A§ Component Model
- **Depends on:** T017
- **Labels:** build check required

### T020 — feat(trabaja-conmigo): page with the static parts (audience rows, cafecito notes and cierre)
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** Server Components + route
- **Files:** `app/(marketing)/(cuaderno)/trabaja-conmigo/page.tsx`, `features/sobre-mi/content/trabaja-conmigo.tsx`, `features/sobre-mi/components/{audience-rows,trabaja-conmigo-page}.tsx`, `features/sobre-mi/__tests__/trabaja-conmigo-page.test.tsx`
- **Acceptance:**
  - H1 "¿Nos tomamos un cafecito?", the dek, the notes and the intro, plus five audience rows (`h2` + text, `[data-sm-rule]`, first rule 2px ink) with the `[md]` copy. No closing row. **AC 11, 12, 32 (static)**
  - The cafecito section: notes (El cafecito / Virtual / En Montevideo / O en New York) and the `[md]` Cierre as `body-lg`; a form slot is reserved (filled in T030). **AC 33 (static part)**
- **Test type:** component + e2e (route/metadata AC 13)
- **Citations:** spec § Page 3
- **Depends on:** T017
- **Labels:** build check required

### T021 — feat(faq): page, 3 groups, 14 native disclosures, closing row
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** Server Components + route
- **Files:** `app/(marketing)/(cuaderno)/preguntas-frecuentes/page.tsx`, `features/sobre-mi/content/faq.tsx`, `features/sobre-mi/components/{faq-group,faq-item,faq-page}.tsx`, `features/sobre-mi/__tests__/faq-page.test.tsx`, `tests/e2e/sobre-mi/faq.spec.ts`
- **Acceptance:**
  - The groups "Itinerarios y consultorías" (8), "Viajes grupales" (5) and "Productos" (1), each with an `h2` + count ("1 pregunta" singular), with `[md]` Q&A in order. The second answer is a 5-item list. Anchors are `id={slugify(text)}` with `scroll-margin-top`; the label reads "14 preguntas". **AC 12, 46**
  - All closed on load; with **JS disabled** (Playwright `javaScriptEnabled: false`) a click opens and closes a question. The "+"/"×" glyph is `aria-hidden`. **AC 47 (instant), 49**
  - Closing row "¿No está tu pregunta? Escribime y te respondo yo." → "Escribime" `/contacto`. **AC 50**
- **Test type:** component + e2e
- **Citations:** spec § Page 5; A§ Accessibility (semantic HTML first)
- **Depends on:** T012, T017
- **Labels:** build check required

### T022 — feat(faq): `FaqDeepLink` (hash opens a question and scrolls clear of the navbar)
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** client leaf
- **Files:** `features/sobre-mi/components/faq-deep-link.tsx` (`'use client'`), `features/sobre-mi/components/faq-page.tsx`, `features/sobre-mi/__tests__/faq-deep-link.test.tsx`, `tests/e2e/sobre-mi/faq.spec.ts`
- **Acceptance:**
  - Loading `/preguntas-frecuentes#que-es-un-itinerario-personalizado` opens that `details` with no animation, and its top is below the navbar's bottom edge; `#viajes-grupales` scrolls that group below the navbar. **AC 48, 26 (destination)**
  - An unknown hash leaves every question closed at the top. The hash is looked up with `getElementById` only, never injected. **AC 48**
- **Test type:** component + e2e
- **Citations:** A§ Component Model (leaf); S§ Input & Output Handling; spec § States Matrix (FAQ)
- **Depends on:** T021
- **Labels:** build check required

### T023 — feat(contacto): page with the static parts (dek, "Otras formas de encontrarme")
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** Server Components + route
- **Files:** `app/(marketing)/(cuaderno)/contacto/page.tsx`, `features/sobre-mi/content/contacto.tsx`, `features/sobre-mi/components/{channel-list,contacto-page}.tsx`, `features/sobre-mi/__tests__/contacto-page.test.tsx`
- **Acceptance:**
  - The dek contains "…puede que tarde un par de días en contestarte…", and no "[" or "]" appears anywhere in the page text. **AC 34**
  - An `h2` "Otras formas de encontrarme" plus Email (`mailto:`), Instagram and TikTok links (the external ones via `ExternalLink`), inside `[data-sm-channels]`. No closing row; a form slot is reserved (T029). **AC 35 (static), 13**
- **Test type:** component + e2e (route/metadata)
- **Citations:** spec § Page 4
- **Depends on:** T017
- **Labels:** build check required

### T024 — test(e2e): shared structure, responsive layout and axe on the 5 pages
- **Status:** Done (committed on `feat/sobre-mi-pages`)
- **Layer:** e2e
- **Files:** `tests/e2e/sobre-mi/structure.spec.ts`
- **Acceptance:**
  - For each of the 5 routes: the slot order is label → h1 → dek → body (→ closing on 3 pages); one `h1`; the H2 outline matches spec § Accessibility (outline). **AC 11, 14**
  - At 320 and 360, `scrollWidth <= clientWidth`, and the notes column is above the main column; at 1280 the notes column is 200px wide and the prose ≤ 760px. **AC 18**
  - axe shows no serious or critical violations at 360 and 1280 in the idle state. **AC 20**
- **Test type:** e2e
- **Citations:** Q§ Accessibility & Performance Gates; D§ Accessibility Baseline
- **Depends on:** T019–T023
- **Labels:** —

---

## M3 — Forms, UI-only (spec v1.1; Security G1 R-01..R-06)

States in this release: **Idle, Field error, Not configured, No JS, Before hydration** (spec v1.1 § Form States). Mechanism: plan § 0.1 F1–F9. No network request of any kind.

### G1 — Security gate: pre-implementation threat model
- **Status:** Done. `docs/security/threat-models/2026-09-26_sobre-mi-forms_v1.md` (0 blocking; R-01 MEDIUM, R-02..R-07 LOW, R-08 INFO)

### T025 — feat(forms): zod schemas and this release's form copy (trimmed)
- **Layer:** schemas & types
- **Files:** `features/sobre-mi/content/forms.ts` (labels, options slug → label, field errors, not-configured banner, no-JS block; **only this release's strings**), `features/sobre-mi/schemas.ts` (`contactSchema`, `collaborationSchema`, `FIELD_LIMITS`), `features/sobre-mi/__tests__/schemas.test.ts`
- **Acceptance:**
  - Empty required fields produce exactly the spec's § Form copy message per field; an empty email produces "Falta tu email para poder responderte." and a malformed one "Revisá tu email, parece que le falta algo." **AC 38, 39**
  - An empty `travelDate` passes (→ `null`); out-of-enum select values fail with the select copy. **AC 40**
  - A test asserts that the content module contains none of "Enviando…", "¡Recibido!", "No se pudo enviar tu mensaje." or "Uso tu email solo para responderte." **AC 43**
- **Test type:** component (unit)
- **Citations:** A§ Forms & Validation; D§ UX Writing; plan § 0.1 F6
- **Depends on:** T005
- **Labels:** —

### T026 — Delivery client and server env
- **Status:** **Deferred (backend).** Spec v1.1 § When the Backend Is Connected; requires a new plan revision and threat model v2 (G1 § 6: fail-closed activation, `lib/env.server.ts`, outbound hardening)

### T027 — Server Actions `sendContactMessage`, `sendCollaborationRequest`
- **Status:** **Deferred (backend).** Replaced in this release by plan § 0.1 F1 (no Server Action, G1 R-03). The no-JS and pre-hydration mechanism is decided in plan § 0.1 F2–F3 and implemented in T028–T030

### T028 — feat(forms): form primitives (field, select, submit row, banner, no-JS block) (trimmed)
- **Layer:** client leaves
- **Files:** `features/sobre-mi/components/forms/{form-field,select-field,submit-row,not-configured-banner,no-js-block}.tsx`, `features/sobre-mi/__tests__/form-primitives.test.tsx`
- **Acceptance:**
  - `FormField`/`SelectField` render a visible `<label htmlFor>` ("(opcional)" inside the label) and a controlled control with `id` and `autoComplete` but **no `name` attribute**. With an error: `aria-invalid="true"`, `aria-describedby` → the error element (bold text + `aria-hidden` "!" badge), inset 3px `brand` bar, and a `data-sm-field` wrapper. **AC 36 (label), 38; R-01**
  - `SubmitRow` renders one button with `min-w-55` (220px) and **no helper line**. It takes `hydrated: boolean` and renders `type="button"` when false, `type="submit"` when true. **AC 37, 43, 44; R-01**
  - `NotConfiguredBanner`: 2px ink border, the text "Por ahora, escribime a hola@vamosany.com. Lo que escribiste sigue acá." with the address as a `mailto:` link in mono bold; `role="status"`, `tabIndex={-1}`, `data-sm-banner`. `NoJsBlock`: the same style, "Para escribirme, mandame un mail a hola@vamosany.com. Te respondo yo.", with the `mailto:` link at `headline` size. **AC 41, 44**
  - An XSS string typed into a field renders as literal text in the error and banner states, and no element is created from it (`<b>x</b>` → no `<b>`). **R-06**
- **Test type:** component
- **Citations:** A§ Forms & Validation; A§ Accessibility; D§ Component States; G1 R-01, R-06
- **Depends on:** T025
- **Labels:** R-01 · R-06

### T029 — feat(contacto): `ContactForm` (Idle, Field error, Not configured, No JS, Before hydration)
- **Layer:** client leaf
- **Files:** `features/sobre-mi/components/forms/contact-form.tsx` (`'use client'`), `features/sobre-mi/components/contacto-page.tsx`, `features/sobre-mi/__tests__/contact-form.test.tsx`
- **Acceptance:**
  - Idle: five fields in `[md]` order (two per row at `@fields`), selects on "Elegí una opción", button "Enviar mensaje", no helper line. The form area is two siblings: form wrapper `noscript:hidden` and `NoJsBlock` `hidden noscript:block`. `<form>` has no `action`/`method`. **AC 36, 37; plan § 0.1 F2**
  - Submit with errors: `preventDefault`, each error under its field, focus on the first invalid field, values kept, any banner removed, and one `sm:field-errors` `CustomEvent` dispatched on the form root with the invalid field ids. Fixing a field clears its error while typing. An empty "¿Cuándo viajás?" doesn't block. **AC 38, 39, 40, 42 (second half)**
  - Valid submit: **no `fetch`/XHR/`sendBeacon` call** (spies), the `NotConfiguredBanner` appears above the form and receives focus, values are kept, and `location.href` is unchanged. A second valid submit keeps exactly one banner and re-announces it (`announceKey` remount). One `sm:banner` event is dispatched. **AC 41, 42; R-01, R-03**
  - Values live only in `useState`; a test spies `localStorage`/`sessionStorage` `setItem` and `document.cookie`, which are never written. The button is `type="button"` in the server render (`renderToString`) and `type="submit"` after mount. **R-02, R-01**
- **Test type:** component
- **Citations:** A§ Forms & Validation, A§ State Management, A§ Component Model; plan § 0.1 F1–F8; G1 R-01..R-03, R-06
- **Depends on:** T028, T023
- **Labels:** R-01 · R-02 · R-03 · build check required

### T030 — feat(trabaja-conmigo): `CollaborationForm` (same states)
- **Layer:** client leaf
- **Files:** `features/sobre-mi/components/forms/collaboration-form.tsx` (`'use client'`), `features/sobre-mi/components/trabaja-conmigo-page.tsx`, `features/sobre-mi/__tests__/collaboration-form.test.tsx`
- **Acceptance:**
  - Fields in `[md]` order (Nombre | Empresa o marca; tipo | Email; Contame tu idea), button "Agendemos un cafecito", no helper line, and the no-JS sibling. **AC 33, 37**
  - The same behaviors and checks as T029 for Field error, Not configured, storage, the button type and no network. **AC 38, 39, 41, 42; R-01, R-02, R-03, R-06**
  - If the two leaves now duplicate their state logic, extract a `useUiOnlyForm(schema)` hook in the refactor step (in `features/sobre-mi/hooks/`).
- **Test type:** component
- **Citations:** as T029
- **Depends on:** T029, T020
- **Labels:** R-01 · R-02 · R-03 · build check required

### T031 — Form round trips against the mock delivery server
- **Status:** **Deferred (backend).** No delivery to mock. The UI-only e2e is T044

### T044 — test(e2e): form states and R-01 no-leak (both pages) (new)
- **Layer:** e2e
- **Files:** `tests/e2e/sobre-mi/forms.spec.ts`
- **Acceptance:**
  - On `/contacto` and `/trabaja-conmigo`, with a request listener over **every** request: empty submit → field errors with focus on the first invalid field; malformed email → the malformed copy, cleared while typing; valid submit → one banner, focused, values kept, URL unchanged; second valid submit → still one banner. **AC 38–42**
  - The page text and the page's loaded JS responses contain none of the 4 connected-release strings. **AC 43**
  - **R-01:** (a) context `javaScriptEnabled: false`: no field is visible or in the accessibility tree; the no-JS block and a `mailto:hola@vamosany.com` link are visible. (b) Pre-hydration: hold every `/_next/static/chunks/**` response with `page.route` (the server HTML renders), fill the fields with synthetic values (e.g. `sintetico-7f3a@ejemplo.test`) through `page.fill`, click the button, wait 1 s, then release the chunks. Assert that the URL is unchanged, there was no navigation, and no request URL or post body contains any of the values. **AC 44; R-01**
  - axe shows no serious or critical violations in the Idle, Field error, Not configured and No-JS states, on both pages. **AC 45**
- **Test type:** e2e
- **Citations:** Q§ Accessibility & Performance Gates; Q§ Test Data Fixtures (synthetic data); G1 R-01
- **Depends on:** T030
- **Labels:** R-01 · QA reviews the spec (shared journey file)

### G2 — Security gate: light code review of the forms and the feature's client surfaces
- **Owner:** Frontend Security Engineer
- **Checklist** (G1 § 5):
  1. `npm run build`; grep `.next/static` for secret prefixes and env names; confirm no server-action entries for the five routes (R-03).
  2. R-01 end to end: JS disabled + pre-hydration submit → no request carries field values; URL unchanged (T044 as evidence, plus a manual check).
  3. XSS payloads in every field across Field error and Not-configured states, motion on and off (R-06); no `dangerouslySetInnerHTML` in the feature.
  4. No storage APIs in the form leaves (R-02).
  5. FaqDeepLink hostile hashes (R-04); ExternalLink `rel` and `https:` only (R-05).
  6. `curl -I` on the preview for the five routes: same header set as `/`.
  7. `npm audit --omit=dev --audit-level=high` clean (R-07 is moot: T001 was skipped).
- **Blocks:** merging M3. **Re-run item 3 after T039** (motion on).

---

## M4 — Motion (DDR-0004; 0 bytes on `/`)

"Unchanged from v1" below refers to the v1 task text in commit `eec9605` (`git show eec9605:docs/specs/sobre-mi/tasks.md`), and to the motion table in `docs/tech-design/sobre-mi.md` § 4.2.

Binding for every M4 task (plan § 0.2–0.3):
- **Don't edit** `components/layout/navbar.tsx`, `nav-config.ts`, `lib/gsap.ts`, `lib/gsap-ease.ts`, `lib/motion.ts`, `lib/utils.ts` or `app/layout.tsx`.
- **No new motion values.** If one is needed, stop and route it to the Architect.
- Every commit quotes the `scripts/check-first-load.mjs` output.

### T043 — ci: guard `/` First Load JS at 0 bytes of growth (new)
- **Owner:** Frontend Engineer (the script) + Frontend DevOps Engineer (the CI step)
- **Files:** `scripts/check-first-load.mjs`, `perf/first-load.json` (the baseline measured on this branch after M3), `package.json` (`"check:first-load"`), `.github/workflows/ci.yml` (step after `npm run build`)
- **Acceptance:**
  - After `npm run build`, the script computes the gzip First Load JS of `/` from `.next` manifests (the same files `next build` reports for the route) and prints it. It exits non-zero if the value is **greater than** `perf/first-load.json["/"]` or greater than 180 kB.
  - A self-test proves the check fails when a byte is added to a module `/` ships (e.g. a temporary string in `nav-config.ts`, reverted in the same test run), and passes on the clean build.
- **Test type:** script + CI
- **Citations:** A§ Performance Budgets; plan § 0.3
- **Depends on:** T044
- **Labels:** build check required

### T032 — feat(motion): headless controller mount + `data-sm-scene` (same commit), gate, nav `is-scrolled` parity
- **Layer:** motion
- **Files:** `features/sobre-mi/components/cuaderno-motion.tsx` (`'use client'`, `next/dynamic` `ssr:false`), `features/sobre-mi/motion/cuaderno-scroll-effects.tsx`, `features/sobre-mi/motion/scenes/nav-scrolled.ts`, the 5 page components (**mount `<CuadernoMotion/>` and add `data-sm-scene="<page>"` to the page root in this same commit**), `tests/e2e/sobre-mi/motion.spec.ts`
- **Acceptance:**
  - Reduced motion and JS disabled, on all 5 pages: `html` has no `.gsap`, every `[data-sm-*]` target has opacity 1 and no transform, `--train` is `0%`, there is no `[data-reading-bar]` element, and the form area follows F2. **AC 16**
  - Motion on: every page root has `data-sm-scene`, and every hidden target ends visible after a full scroll (proving the gate and the controller shipped together, plan § 0.2 E1). `[data-nav]` gets `.is-scrolled` after 80px. Client navigation `/sobre-mi` → `/colaboraciones` leaves no ScrollTrigger pointing at detached nodes. No "GSAP target" console warnings.
  - `npm run check:first-load` passes (0 bytes on `/`).
- **Test type:** e2e
- **Citations:** ADR-0002, ADR-0003; A§ Animation; plan § 0.2 E1, § 0.3
- **Depends on:** T043
- **Labels:** DDR-0004 · build check required

### T033 — feat(motion): M1 heading entrance and the "20" count-up
- **Status:** Open. Unchanged from v1 (acceptance: AC 14, 15, 21), plus `check:first-load` passes
- **Depends on:** T032

### T034 — feat(motion): M2 shared reveals (notes, prose, figures, closing, form fields)
- **Status:** Open. Unchanged from v1 (AC 17), with one addition: form-field reveals target the `[data-sm-field]` wrappers of the **JS form only**; the no-JS block is never animated. `check:first-load` passes
- **Depends on:** T032

### T035 — feat(motion): M3 Sobre mí scenes (pull-line train, parallax, signature, timeline)
- **Status:** Open. Unchanged from v1 (AC 19, 22–25), plus `check:first-load` passes. Scene selectors are scoped to `[data-sm-scene="sobre-mi"]` (plan § 0.2 E2: no `main > section` assumptions)
- **Depends on:** T034

### T036 — feat(motion): M4 Colaboraciones (year tick, partner/body, quote train, reading bar created by the scene)
- **Layer:** motion
- **Files:** `features/sobre-mi/motion/scenes/colaboraciones.ts`, `tests/e2e/sobre-mi/motion.spec.ts`. **v1.1: `components/layout/navbar.tsx` is not touched**
- **Acceptance:**
  - Year tick and fade as in v1; assistive tech reads only the final year. **AC 29**
  - With motion on, on `/colaboraciones` only, the scene appends `<span aria-hidden="true" data-reading-bar>` to `[data-nav] .nav-capsule`. Its `scaleX` is 0 before the ledger, grows through it and is 1 after it. The span is removed on unmount: after client navigation to another page, no `[data-reading-bar]` remains. Reduced motion or no JS: never created. **AC 30**
  - Efe Hus quote train sweeps. `navbar.spec.ts` and the landing snapshots show diff 0; `check:first-load` passes. **AC 27, 51**
- **Test type:** e2e
- **Citations:** spec M4; DDR-0004; ADR-0006; plan § 0.3 item 3
- **Depends on:** T034
- **Labels:** DDR-0004 · Render-Preserving (landing)

### T037 — feat(motion): M5 audience rules and M6 contact channels
- **Status:** Open. Unchanged from v1 (AC 32, 35), plus `check:first-load` passes. Rows breakpoint per the `@container/screen` / component containers as implemented in T020
- **Depends on:** T034

### T038 — feat(motion): M7 FAQ row reveal and animated open/close
- **Status:** Open. **ADR-0007 Accepted (2026-09-26), no longer blocked.** Acceptance unchanged from v1 (AC 47, 48), plus `check:first-load` passes
- **Depends on:** T034, T022

### T039 — feat(motion): M8 form feedback in the controller (shake + banner entrance; no success)
- **Layer:** motion
- **Files:** `features/sobre-mi/motion/scenes/form-feedback.ts` (listens for `sm:field-errors` / `sm:banner` on `[data-sm-form]` via `contextSafe`), `tests/e2e/sobre-mi/forms.spec.ts`. **The form leaves are not edited except, if needed, to add `data-sm-form`**
- **Acceptance:**
  - Motion on: a submit with errors shakes each invalid field's `[data-sm-field]` wrapper once (`MOTION.form.shake`); typing doesn't shake. The not-configured banner enters from y −8 (`MOTION.form.banner`), and a repeat valid submit replays the entrance on the single banner. **AC 38, 41, 42 (motion part)**
  - Reduced / no `.gsap`: no listener is attached, and errors and the banner appear statically at once. Focus behavior is identical with motion on and off. **AC 38, 41**
  - The tweens target wrappers only; an XSS string in a field is still literal text with motion on (no element created). **R-06**
  - The form route chunks gain no GSAP import (build output), and `check:first-load` passes. `MOTION.form.success` stays unused in this release.
- **Test type:** e2e
- **Citations:** spec M8 v1.1; A§ Animation (useGSAP, reduced branch); plan § 0.1 F8; G1 R-06
- **Depends on:** T034, T044
- **Labels:** DDR-0004 · R-06

---

## M5 — Baselines, performance, handoff

### T003 — ci: scoped desktop snapshot update (DevOps)
- **Status:** **Open. Must land before T040** (and before any regeneration of the 6 landing desktop files). Definition unchanged (M0 above)

### T040 — test(e2e): visual baselines for the 5 pages and the landing regression check
- **Status:** Open. As in v1, with the form states changed to **Idle, Field error, Not configured, No JS** (instead of field error / failed / success). Landing check unchanged (**AC 51**; only the 6 desktop files may change, via the T003 label)
- **Depends on:** T003, T033–T039

### T041 — perf: First Load JS per route, LCP and CLS on the preview
- **Status:** Open. As in v1, plus: `/` must equal `perf/first-load.json` exactly (T043); every new route ≤ 180 kB
- **Depends on:** T040

### T042 — docs: QA handoff (E2E journey scope)
- **Status:** Open. As in v1, with these v1.1 changes:
  - **Form states:** Idle, Field error, Not configured, No JS, Before hydration (the **R-01** no-leak check), on both pages.
  - **AC for forms:** 37–45 as rewritten in spec v1.1.
  - **Open labels:** none Pre-Contract (T026/T027/T031 Deferred (backend)).
  - **Environment:** local and preview. No env vars are involved.
- **Depends on:** T041, G2

---

## Remaining work, in order

T003 (DevOps, in parallel), T025, T028, T029, T030, T044, **G2**, T043, T032, T033, T034, T035, T036, T037, T038, T039, T040, T041, T042.

**Next task for the Engineer:** T025.
