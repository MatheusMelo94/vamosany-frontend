# Tasks: vamosany-front-end — Sobre mí (5 pages + navbar menu) v1

- **Plan:** `docs/specs/sobre-mi/plan.md` (Ready for /tasks) · **TDD:** `docs/tech-design/sobre-mi.md` · **Spec:** `docs/specs/sobre-mi/spec.md` v1 · **Contract Request:** `docs/specs/sobre-mi/contract-request.md`
- **Branch:** `feat/sobre-mi-pages` (the Engineer creates it from `main`). One task = one conventional commit. Execute in numeric order; the gates G1/G2 are Security, not the Engineer.
- **Commands** (npm, ADR-0005): suite = `npm run typecheck && npm run lint && npm test`; build = `npm run build`; e2e = `npm run test:e2e -- --grep @feature-sobre-mi` (tag every new spec `@feature-sobre-mi`). Screenshot baselines are generated **only** by the CI bot (`update-snapshots` label, or `update-snapshots-desktop` after T003). Locally, snapshots are ignored unless `PW_LOCAL_BASELINE=1` (`playwright.config.ts`).
- **Labels:** `Render-Preserving` (ADR-0006: the landing must be diff 0 unless the task names allowed diffs) · `Pre-Contract` · `ADR-0007` · `DDR-000N` · `Needs-Approval` (waiting on the user) · **build check required** where the task touches `app/`, `'use client'` boundaries, `next.config.ts`, `playwright.config.ts` or env.
- **Citations shorthand:** `A§` = `frontend-architecture-conventions.md §`, `D§` = `design-conventions.md §`, `S§` = `frontend-security-conventions.md §`, `Q§` = `frontend-qa-conventions.md §`.
- **AC numbers** are the spec's § Acceptance Criteria (1–51).

---

## M0 — Foundations (Render-Preserving; landing diff 0)

### T001 — chore: add `msw` and `server-only`; wire MSW into Vitest
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
- **Layer:** lib
- **Files:** `lib/utils.ts`, `lib/__tests__/utils.test.ts`
- **Acceptance:**
  - `slugify("¿Qué es un itinerario personalizado?") === "que-es-un-itinerario-personalizado"`, and `slugify("Viajes grupales") === "viajes-grupales"`. Accents, "¿", "¡" and punctuation are stripped; the result is stable and lowercase.
- **Test type:** component (unit)
- **Citations:** A§ App Router Layout (`lib/utils.ts` pure functions); spec § Page 5 (stable anchors)
- **Depends on:** —
- **Labels:** —

### T013 — test(content): commit the content source and the verbatim oracle
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
- **Layer:** schemas & types
- **Files:** `features/sobre-mi/types.ts` (content block types), `features/sobre-mi/components/external-link.tsx`, `features/sobre-mi/__tests__/external-link.test.tsx`
- **Acceptance:**
  - `ExternalLink` renders `target="_blank"` and `rel="noopener noreferrer"`; its accessible name ends with "(se abre en otra pestaña)"; the "↗" is `aria-hidden`. It rejects non-`https:` hrefs at the type or test level. **AC 28**
- **Test type:** component
- **Citations:** A§ Routing, Layouts & Boundaries (`<a>` for external links); S§ Input & Output Handling (URLs); spec § Accessibility (external links)
- **Depends on:** —
- **Labels:** —

### T015 — feat(sobre-mi): template components (`PageHeader`, `NotesLayout`, `ClosingRow`)
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
- **Layer:** styling
- **Files:** `features/sobre-mi/fonts.ts` (new `next/font` instance: `weight: "400"`, `style: "italic"`, `preload: false`, `display: "swap"`), `features/sobre-mi/components/signature.tsx`
- **Acceptance:**
  - The build shows no new preload link on `/` (landing HTML diff: none; landing e2e diff 0). The `/sobre-mi` signature computes `font-style: italic` with the italic face loaded (e2e: `document.fonts.check('italic 400 28px …')` after scroll).
- **Test type:** e2e
- **Citations:** A§ Performance Budgets (`next/font`); plan D7; spec § Token Proposals 2
- **Depends on:** T017
- **Labels:** build check required · Render-Preserving (landing)

### T019 — feat(colaboraciones): page, product ledger and closing
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

## M3 — Forms (Pre-Contract; Security-gated)

### G1 — Security gate: pre-implementation threat model of the form surfaces
- **Owner:** Frontend Security Engineer (posture: Production)
- **Input:** plan § 10, `contract-request.md`, spec § Data Dependencies
- **Output:** `docs/security/threat-model-sobre-mi-forms.md` with the required controls (rate limit, bot protection, honeypot, server-to-server auth, PII logging and retention). The Architect turns each required control into a task inserted before T031.
- **Blocks:** T027 onward

### T025 — feat(forms): zod schemas and form copy
- **Layer:** schemas & types
- **Files:** `features/sobre-mi/content/forms.ts` (labels, options slug → label, helper, errors, banners, success), `features/sobre-mi/schemas.ts` (`contactSchema`, `collaborationSchema`, `FIELD_LIMITS`), `features/sobre-mi/types.ts` (`FormState<F>`), `features/sobre-mi/__tests__/schemas.test.ts`
- **Acceptance:**
  - Empty required fields produce exactly the spec's § Form copy message per field; an email without "@" or domain produces "Revisá tu email, parece que le falta algo." and an empty email produces "Falta tu email para poder responderte." **AC 38, 39**
  - An empty `travelDate` parses to `null` and does not fail; select values outside the enum fail with the select copy; unknown keys are stripped. **AC 40**
- **Test type:** component (unit)
- **Citations:** A§ Forms & Validation; D§ UX Writing; S§ Input & Output Handling
- **Depends on:** T005
- **Labels:** Pre-Contract

### T026 — feat(api): server env and the delivery client (`lib/api/forms.ts`) with MSW handlers
- **Layer:** data functions
- **Files:** `lib/env.ts` (`client` + `server` schemas: `FORMS_API_BASE_URL` optional URL, `FORMS_API_TIMEOUT_MS` default 8000), `.env.example`, `lib/api/errors.ts` (`AppError`), `lib/api/schemas/forms.ts` (422 body), `lib/api/forms.ts` (`import "server-only"`: `deliverContactMessage`, `deliverCollaborationRequest`), `tests/fixtures/delivery/scenarios.ts`, `tests/fixtures/msw/handlers/sobre-mi.ts`, `lib/api/__tests__/forms.test.ts`
- **Acceptance:**
  - With the env var unset: returns `{ ok:false, reason:"not-configured" }` and **no request is made** (MSW `onUnhandledRequest:"error"` plus a request spy). **AC 44**
  - With it set (MSW): 202 → `{ ok:true }`; 422 with known `fieldErrors` → `{ ok:false, reason:"invalid", fieldErrors }`; 422 with an unknown code, 429, 500, a network error (`HttpResponse.error()`), a timeout (fake timers) or an unparsable body → `{ ok:false, reason:"unavailable" }`. The request body matches the contract-request shape and includes `Idempotency-Key`. **AC 44, 43 (mapping)**
  - The failure log line contains status and requestId and **no** payload fields (spy on `console.error`).
- **Test type:** component (unit, MSW)
- **Citations:** A§ Data Fetching & Mutations, A§ Error Handling, A§ Configuration & Environment; S§ Secrets & Environment, S§ Logging & Monitoring; contract-request.md
- **Depends on:** T001, T025
- **Labels:** Pre-Contract · build check required (env)
- **Commit footer:** `Pre-Contract: POST /v1/contact-messages, /v1/collaboration-requests mocked; reconcile when contract lands`

### T027 — feat(forms): Server Actions `sendContactMessage`, `sendCollaborationRequest`
- **Layer:** Server Actions
- **Files:** `features/sobre-mi/actions.ts` (`'use server'`), `features/sobre-mi/__tests__/actions.test.ts`
- **Acceptance:**
  - Invalid `FormData` → `{ status:"field-errors", errors, values }` with the typed values echoed back (trimmed strings) and no delivery call. **AC 38 (server)**
  - Delivery `ok` → `{ status:"success", email }`; `invalid` → `field-errors` mapped to the spec copy; `not-configured` → `{ status:"failed", reason:"not-configured", values }`; `unavailable` → `{ status:"failed", reason:"unavailable", values }`. No code path returns success without `ok:true`. **AC 42, 43, 44**
  - Any control required by G1 that belongs in the action is covered here, or has a dedicated task (per G1's output).
- **Test type:** component (unit; delivery module mocked with `vi.mock`)
- **Citations:** A§ Data Fetching & Mutations (5-step action), A§ Error Handling (result unions); S§ Next.js Surface Map (Server Actions)
- **Depends on:** G1, T026
- **Labels:** Pre-Contract · build check required

### T028 — feat(forms): form primitives (field, select, submit row, banner, success)
- **Layer:** client leaves
- **Files:** `features/sobre-mi/components/forms/{form-field,select-field,submit-row,form-banner,form-success}.tsx`, `features/sobre-mi/__tests__/form-primitives.test.tsx`
- **Acceptance:**
  - `FormField` with an error sets `aria-invalid="true"` and `aria-describedby` → the error element (bold text plus an `aria-hidden` "!" badge) and applies the inset 3px `brand` bar; the label is visible and bound with `htmlFor`; "(opcional)" sits inside the label. **AC 38, 36 (label)**
  - `SubmitRow` pending: label "Enviando…", `disabled`, `aria-busy="true"`, `min-w-55` (220px) kept; the helper "Uso tu email solo para responderte." is always present. **AC 37, 41**
  - `FormBanner` `reason="unavailable"` renders the connection-error copy and `reason="not-configured"` the not-configured copy, both `role="alert"`. `FormSuccess` renders H2 "¡Recibido!" (`tabIndex=-1`, train span) inside `aria-live="polite"`, with `{email}` rendered as text (a test with `<b>x</b>` as the email shows it literally). **AC 42, 43, 44**
- **Test type:** component
- **Citations:** A§ Forms & Validation; D§ Component States (loading keeps width, `aria-busy`); A§ Accessibility
- **Depends on:** T025
- **Labels:** —

### T029 — feat(contacto): `ContactForm` (useActionState, client validation, focus, values kept)
- **Layer:** client leaf
- **Files:** `features/sobre-mi/components/forms/contact-form.tsx` (`'use client'`), `features/sobre-mi/components/contacto-page.tsx`, `features/sobre-mi/__tests__/contact-form.test.tsx`
- **Acceptance:**
  - Five fields in `[md]` order with labels, selects on "Elegí una opción", `autocomplete` per spec, two-column rows `@fields:`; button "Enviar mensaje". **AC 36, 37**
  - Submitting empty: `preventDefault`, every error shows, focus goes to the first invalid field, typed text is kept; fixing a field clears its error while typing; an empty "¿Cuándo viajás?" does not block. **AC 38, 39, 40**
  - With the action stubbed: pending → fields `readOnly` plus the pending button, and a second click sends nothing; success replaces the form and focuses the H2, whose line links to `/preguntas-frecuentes`; failed shows the banner, keeps the values (`defaultValue` from `state.values`), shows the button "Probar de nuevo" and resubmits. **AC 41, 42, 43**
- **Test type:** component
- **Citations:** A§ Forms & Validation (`useActionState`, `useFormStatus`, progressive enhancement); A§ Component Model (only the action crosses)
- **Depends on:** T027, T028, T023
- **Labels:** Pre-Contract · build check required

### T030 — feat(trabaja-conmigo): `CollaborationForm`
- **Layer:** client leaf
- **Files:** `features/sobre-mi/components/forms/collaboration-form.tsx` (`'use client'`), `features/sobre-mi/components/trabaja-conmigo-page.tsx`, `features/sobre-mi/__tests__/collaboration-form.test.tsx`
- **Acceptance:**
  - Fields in `[md]` order (Nombre | Empresa o marca; tipo | Email; Contame tu idea); button "Agendemos un cafecito". **AC 33, 37**
  - The same behaviors as T029 for errors, pending, success ("…para agendar el cafecito.") and failed. **AC 38, 39, 41, 42, 43**
- **Test type:** component
- **Citations:** as T029
- **Depends on:** T029, T020
- **Labels:** Pre-Contract · build check required

### T031 — test(e2e): form round trips against the mock delivery server (both pages)
- **Layer:** e2e
- **Files:** `tests/fixtures/delivery/mock-server.ts` (`node:http`, same `scenarios.ts`), `playwright.config.ts` (`webServer` array: mock on :3199; `next start -p 3100` with `FORMS_API_BASE_URL=http://127.0.0.1:3199` and `FORMS_API_TIMEOUT_MS=1500`; `next start -p 3101` **without** the var), `.github/workflows/ci.yml` (env if needed; DevOps review), `tests/e2e/sobre-mi/forms.spec.ts`
- **Acceptance:**
  - On `/contacto` and `/trabaja-conmigo`: valid data → "Enviando…" → "¡Recibido!" with the typed email and focus on the H2; `falla@`/`limite@`/`lento@` → Failed banner (connection copy) with values kept; `invalido@` → field error on email. **AC 41, 42, 43**
  - Against :3101 (unset): valid data → Failed with "Por ahora, escribime a hola@vamosany.com." and never the connection copy; the mock server receives 0 requests. **AC 44**
  - axe shows no serious or critical violations in the field error, submitting (route delay), success and failed states. Landing e2e still passes. **AC 45**
- **Test type:** e2e
- **Citations:** Q§ Framework Defaults, Q§ Test Data Fixtures (synthetic data); A§ Engineering Workflow (Pre-Contract); contract-request.md § Mock
- **Depends on:** T030
- **Labels:** Pre-Contract · build check required · QA-owned shared fixture (QA reviews `mock-server.ts`/`scenarios.ts`)

### G2 — Security gate: code review of the form surfaces
- **Owner:** Frontend Security Engineer
- **Scope:** T025–T031 commits plus any G1-derived tasks; CI bundle grep for `FORMS_`
- **Blocks:** merging M3

---

## M4 — Motion (DDR-0004; all values from `lib/motion.ts`)

### T032 — feat(motion): Sobre mí headless controller, gate and nav `is-scrolled` parity
- **Layer:** motion
- **Files:** `features/sobre-mi/components/cuaderno-motion.tsx` (`'use client'`, `next/dynamic` `ssr:false`), `features/sobre-mi/motion/cuaderno-scroll-effects.tsx`, `features/sobre-mi/motion/scenes/nav-scrolled.ts`, the 5 page components (mount `<CuadernoMotion/>` and `data-sm-scene`), `tests/e2e/sobre-mi/motion.spec.ts`
- **Acceptance:**
  - Reduced motion (`reducedMotion:'reduce'`) and JS disabled: on all 5 pages, `html` has no `.gsap`, every `[data-sm-*]` target has `opacity: 1` and no transform, `--train` is `0%`, and there is no `[data-reading-bar]` box. **AC 16**
  - Motion on: after scrolling 80px, `[data-nav]` has `.is-scrolled`; navigating client-side `/sobre-mi` → `/colaboraciones` leaves no ScrollTrigger from the previous page (`ScrollTrigger.getAll()` targets are all in the current DOM); no "GSAP target" console warnings.
- **Test type:** e2e
- **Citations:** ADR-0002, ADR-0003; A§ Animation (useGSAP only, gate); TDD § 4.1
- **Depends on:** T004, T006, T024
- **Labels:** DDR-0004 · build check required

### T033 — feat(motion): M1 heading entrance and the "20" count-up
- **Layer:** motion
- **Files:** `features/sobre-mi/motion/scenes/entrance.ts`, `tests/e2e/sobre-mi/motion.spec.ts`
- **Acceptance:**
  - Motion on: the label, then words, then train, then dek run in sequence (sampled: at t≈0.9 s the dek has started and `--train` is not yet `0%`). At the end the H1's visual copy is one text node run (no SplitText wrappers), with `--train: 0%` and opacity 1. **AC 15**
  - The H1's accessible name equals the title at every sample (`getByRole('heading',{level:1,name})` throughout). On `/sobre-mi` the visual "20" counts from 0 during the entrance, and the accessibility tree exposes only "20". **AC 14, 21**
- **Test type:** e2e
- **Citations:** spec M1; A§ Animation; plan § 8.5–8.6
- **Depends on:** T032
- **Labels:** DDR-0004

### T034 — feat(motion): M2 shared reveals (notes, prose, figures, closing, form fields)
- **Layer:** motion
- **Files:** `features/sobre-mi/motion/scenes/reveals.ts`, `tests/e2e/sobre-mi/motion.spec.ts`
- **Acceptance:**
  - Scrolling to each notes column, paragraph, figure, closing row and form reveals it (opacity → 1, y → 0); scrolling back up and down again does not replay it (`once`). The pull lines and the signature are excluded from the prose reveal. **AC 17**
- **Test type:** e2e
- **Citations:** spec M2; A§ Animation (`once: true`)
- **Depends on:** T032
- **Labels:** DDR-0004

### T035 — feat(motion): M3 Sobre mí scenes (pull-line train, parallax, signature, timeline)
- **Layer:** motion
- **Files:** `features/sobre-mi/motion/scenes/sobre-mi.ts`, `tests/e2e/sobre-mi/motion.spec.ts`
- **Acceptance:**
  - The pull-line `--train` goes 100% → 0% when it enters view; the photo `img` transform changes with scroll while its box's `getBoundingClientRect()` relative to the document is unchanged; the signature's `clip-path` ends at `none`/`inset(0)`. **AC 22, 23, 24**
  - The rail's `scaleY` grows with scroll (sampled at 3 positions, monotonic), and the rows end at x 0 with opacity 1; at 360 the tag sits under the line. Reduced: rail full, rows in place, photo still. **AC 25**
  - The Layout Instability API reports 0 shifts from these elements during the scroll. **AC 19**
- **Test type:** e2e
- **Citations:** spec M3; A§ Animation (transform/opacity/clip-path); A§ Performance Budgets (CLS)
- **Depends on:** T034, T018
- **Labels:** DDR-0004

### T036 — feat(motion): M4 Colaboraciones (year tick, partner/body, quote train, navbar reading bar)
- **Layer:** motion
- **Files:** `features/sobre-mi/motion/scenes/colaboraciones.ts`, `components/layout/navbar.tsx` (renders `<span aria-hidden data-reading-bar>` only when `READING_BAR_ROUTES` includes the pathname), `tests/e2e/sobre-mi/motion.spec.ts`
- **Acceptance:**
  - Each 4-digit year ticks from the previous row's year (the first from 2021) to its own when the row enters; "2024–25" fades in; rows with the same year don't tick; assistive tech reads only the final year. **AC 29**
  - On `/colaboraciones` the 3px bar's `scaleX` is 0 before the ledger, grows through it and is 1 after it. It is not rendered on any other route or under reduced motion. **AC 30**
  - The Efe Hus quote's train sweeps on scroll. The landing and `navbar.spec.ts` snapshots show diff 0. **AC 27, 51**
- **Test type:** e2e
- **Citations:** spec M4; DDR-0004 (reading bar is the one page-level navbar touch); ADR-0006
- **Depends on:** T034
- **Labels:** DDR-0004 · build check required · Render-Preserving (landing)

### T037 — feat(motion): M5 audience rules and M6 contact channels
- **Layer:** motion
- **Files:** `features/sobre-mi/motion/scenes/{trabaja-conmigo,contacto}.ts`, `tests/e2e/sobre-mi/motion.spec.ts`
- **Acceptance:**
  - Each audience row's rule goes `scaleX` 0 → 1, then its H2 and text rise, when the row reaches `top 90%`; at 768 and 1280 the H2 and text sit side by side, at 360 they are stacked. **AC 32**
  - The three contact lines slide in about 0.9 s after load without scrolling; reduced: in place. **AC 35**
- **Test type:** e2e
- **Citations:** spec M5, M6
- **Depends on:** T034
- **Labels:** DDR-0004

### T038 — feat(motion): M7 FAQ row reveal and animated open/close
- **Layer:** motion
- **Files:** `features/sobre-mi/motion/scenes/faq.ts`, `features/sobre-mi/components/faq-item.tsx` (`data-sm-faq-answer` wrapper, `data-closing` hook for the glyph), `tests/e2e/sobre-mi/faq.spec.ts`
- **Acceptance:**
  - Rows rise group by group on scroll. Click, Enter or Space on a question opens it: the answer height animates from 0 to its content height, the content fades up and "+" becomes "×"; several can be open; closing animates to 0 and then `details.open === false`. A click during the animation retargets without getting stuck. **AC 47**
  - Reduced motion: open and close are instant (native). The deep link still opens without animation. Focus stays on the `summary`. **AC 47, 48**
- **Test type:** e2e
- **Citations:** spec M7; **ADR-0007**; A§ Animation
- **Depends on:** T034, T022, **ADR-0007 Accepted**
- **Labels:** ADR-0007 · DDR-0004

### T039 — feat(motion): M8 form feedback (shake, banner, success train)
- **Layer:** motion
- **Files:** `features/sobre-mi/components/forms/{contact-form,collaboration-form,form-banner,form-success}.tsx` (`useGSAP({ scope })` + `contextSafe`), `features/sobre-mi/__tests__/form-motion.test.tsx`, `tests/e2e/sobre-mi/forms.spec.ts`
- **Acceptance:**
  - Motion on: a submit with errors shakes each invalid field once (x keyframes from `MOTION.form.shake`); typing does not shake. The banner enters from y −8; on success the "¡Recibido!" train sweeps and the lines rise. **AC 38, 42, 43**
  - Reduced (no `.gsap`): no shake, and the banner and success show immediately and statically; the error texts still show. The form is never blocked by motion (the second submit is still controlled only by `isPending`).
- **Test type:** component (the gate branch) + e2e
- **Citations:** spec M8; A§ Animation (useGSAP scope, reduced branch); D§ Motion Principles (feedback paired with text)
- **Depends on:** T031, T032
- **Labels:** DDR-0004 · Pre-Contract · build check required

---

## M5 — Baselines, performance, handoff

### T040 — test(e2e): visual baselines for the 5 pages and the landing regression check
- **Layer:** e2e
- **Files:** `tests/e2e/sobre-mi/visual.spec.ts`, `tests/e2e/sobre-mi/visual.spec.ts-snapshots/` (bot)
- **Acceptance:**
  - Per page at 360/768/1280: idle (motion), after a full scroll, and full-page reduced. Form pages also get the field error, failed and success states (mock server). Generated by the bot.
  - Landing: the 12 phone/tablet files are unchanged since `main`; the 6 desktop files changed only in the navbar band (compared by the Reviewer with the diff images). `navbar.spec.ts` diffs are exactly the plan § 12 list. **AC 51**
- **Test type:** e2e
- **Citations:** Q§ Visual Regression Scope; ADR-0006 § 2–3
- **Depends on:** T033–T039
- **Labels:** —

### T041 — perf: First Load JS per route, LCP and CLS on the preview
- **Layer:** performance
- **Files:** `docs/specs/sobre-mi/plan.md` (§ 11 filled with the measured numbers, as an Architect-approved edit), `lighthouserc.json` (add the 5 routes, DevOps)
- **Acceptance:**
  - `npm run build`: each new route ≤ 180 kB First Load JS; the landing unchanged (± 1 kB) compared with `main`.
  - Lighthouse (mobile) on the preview for `/sobre-mi` and `/contacto`: LCP ≤ 2.5 s, CLS ≤ 0.1. A breach → the Architect picks a mitigation from TDD § 5 before merge.
- **Test type:** Lighthouse CI + build output
- **Citations:** A§ Performance Budgets; Q§ Accessibility & Performance Gates
- **Depends on:** T040
- **Labels:** build check required

### T042 — docs: QA handoff (E2E journey scope)
- **Layer:** handoff
- **Files:** none (PR description / chat), per A§ Engineering Workflow › QA handoff
- **Content for the Frontend QA Engineer:**
  - **Routes:** `/sobre-mi`, `/colaboraciones`, `/trabaja-conmigo`, `/contacto`, `/preguntas-frecuentes`, plus `/` (navbar and landing regression).
  - **States:** static success at 320/360/768/1280; motion on / reduced / no-JS; FAQ closed, open, deep link (group + question) and unknown hash; forms idle, field error (client and server 422), submitting, success, failed (unavailable) and failed (not configured, :3101); navbar closed, each panel, marker hover and focus, current page, drawer and current dot.
  - **AC to cover in E2E:** 1–10 (navbar), 11–20 (shared), 21–26 (Sobre mí), 27–31 (Colaboraciones), 32–33 (Trabajá), 34–36 (Contacto), 37–45 (forms, run on both pages), 46–50 (FAQ), 51 (landing regression).
  - **Manual:** a keyboard pass on the menu path and both forms; a check that a fast pointer sweep across a panel doesn't feel busy (DDR-0003 consequence); a screen-reader spot check of the H1 names, counters and years.
  - **Open labels to report:** Pre-Contract (T025–T031, T039), ADR-0007 (T038), Needs-Approval (T006, if still open).
  - **Commands:** `npm run build && npm run test:e2e -- --grep @feature-sobre-mi`, plus the full `npm run test:e2e` for the landing regression. Environment: local and the Vercel preview (`FORMS_API_BASE_URL` unset on preview → the not-configured path is the expected preview behavior).
- **Depends on:** T041
- **Labels:** —

---

## First task for the Engineer

**T001** (`chore: add msw and server-only; wire MSW into Vitest`), on the new branch `feat/sobre-mi-pages`. T002 (the navbar characterization baseline) must land, with its bot-generated snapshots committed, **before any change to `components/layout/navbar.tsx`**.
