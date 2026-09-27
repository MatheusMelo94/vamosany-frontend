# Tasks: vamosany-front-end — Mobile navigation "Índice" v1

- **Plan:** `docs/specs/mobile-navigation/plan.md` (Ready for /tasks) · **Spec:** `docs/specs/mobile-navigation/spec.md` v1 (plus the font amendment of 2026-09-27, plan § 0.2) · **DDR:** DDR-0006 · **ADRs:** ADR-0009 and ADR-0010 (*Proposed*)
- **Branch:** `feat/mobile-menu-indice` (exists). **One PR** for the whole feature. One task = one conventional commit. Execute in numeric order.
- **Commands** (npm, ADR-0005): suite = `npm run typecheck && npm run lint && npm test`; build = `npm run build && npm run check:first-load`; e2e = `npm run test:e2e -- --grep @feature-mobile-nav` (tag every new drawer test `@feature-mobile-nav`; existing `@feature-sobre-mi` tests keep their tag). Screenshots are compared only in CI; baselines come **only** from the `update-snapshots` label bot.
- **Byte rule (plan § 0.3):** every task that touches `components/layout/navbar.tsx` runs `npm run build && npm run check:first-load` and quotes the output line in its commit body. **If the guard fails (`/` > 179,492 B), stop and report.** Don't edit `perf/first-load.json`.
- **Visual rule (AC 1, DDR-0006):** only `drawer-top-{phone-360,tablet-768}` and `drawer-last-group-{phone-360,tablet-768}` may change. Any other screenshot diff is BLOCKING.
- **Labels:** `DDR-0006` (a visible drawer change) · `Render-Preserving` (diff 0 everywhere, including the drawer files) · `ADR-0009` / `ADR-0010` (can't merge until that ADR is *Accepted*) · **build check required** (touches a `'use client'` boundary or a dynamic import).
- **Citations:** `A§` = `frontend-architecture-conventions.md §`, `D§` = `design-conventions.md §`, `S§` = `frontend-security-conventions.md §`. AC numbers are the spec's (1–52).
- **Files:** new code goes in `components/layout/drawer/` (`nav-model.ts`, `modal.ts`, `drawer-motion.ts`, `mobile-drawer.tsx`, `drawer-group.tsx`, `drawer-footer.tsx`) with tests in `components/layout/drawer/__tests__/`. New behavioral e2e goes in `tests/e2e/mobile-nav.spec.ts`.

---

## M0: Pure foundations (no UI change)

### T001: feat(nav): drawer nav model (scent line, current group, default open group, config invariant)
- **Layer:** schemas & types (pure)
- **What:** Add pure helpers that derive everything the drawer needs from `NAV` and a pathname.
- **Files:** `components/layout/drawer/nav-model.ts`, `components/layout/drawer/__tests__/nav-model.test.ts`
- **Acceptance:**
  - `scentLine(group)` returns exactly the five spec strings (for example "By length · By season · By appetite"). Changing a column heading in a fixture changes the output (it's derived, not copied).
  - `defaultOpenGroup(NAV, p)` is `"Sobre mí"` for each of the five Sobre mí paths and `null` for `/`, `/#services` and unknown paths. `groupHasCurrent` is never true for Services. `itemHref` falls back to `/#services`.
  - A config invariant fails if any group has 0 columns or any column has 0 items (spec § States Matrix › Empty).
- **Test type:** component (Vitest, pure)
- **ACs:** 7, 11, 20, 23 (logic)
- **Citations:** A§ App Router Layout (colocation), A§ TypeScript Rules (explicit return types), A§ State Management ("derive, don't copy")
- **Depends on:** —
- **Labels:** Render-Preserving

### T002: feat(motion): add `MOTION.drawer` and `EASE.pop`
- **Layer:** schemas & types (motion values)
- **What:** Add the drawer's named motion values (plan § 7.1) and the pop ease, with no change to existing values.
- **Files:** `lib/motion.ts`, `lib/__tests__/motion.test.ts`
- **Acceptance:**
  - `MOTION.drawer.open`, `.close` and `.accordion` hold the spec § Motion Intent values. `EASE.pop === "back.out(3)"`.
  - A test pins every pre-existing key of `MOTION` and `EASE` to its current value (additions only).
  - A test asserts the accordion worst case, `max(expand, rows.at + rows.maxStart + rows.duration, collapse)`, is ≤0.5s (AC 44 budget).
- **Test type:** component (Vitest)
- **ACs:** 41–44 (values)
- **Citations:** A§ Animation (durations from D§ Motion Principles; no magic numbers); ADR-0006 § 4; DDR-0006 item 15
- **Depends on:** —
- **Labels:** Render-Preserving

---

## M1: The drawer becomes a lazy chunk, behind a modal (today's content)

### T003: refactor(nav): move the drawer into a lazy, prefetched chunk; burger and landmark names
- **Layer:** route skeleton (client boundary)
- **What:** Move today's drawer JSX, unchanged, into `MobileDrawer` (loaded with `next/dynamic({ ssr:false })`, prefetched on idle below 1024 and on burger `pointerdown`/`focus`, with a `catch` fallback). Add the Navbar's `drawerOpen`/`drawerMounted` phases, and rename the burger ("Abrir menú" / "Cerrar menú", `aria-controls`) and the landmark ("Menú").
- **Files:** `components/layout/navbar.tsx`, `components/layout/drawer/mobile-drawer.tsx`, `components/layout/__tests__/navbar.test.tsx`, `tests/e2e/navbar.spec.ts` (locators only), `tests/e2e/sobre-mi/tap-targets.spec.ts` (locators only)
- **Acceptance:**
  - Closed: the burger is named "Abrir menú" with `aria-expanded="false"` and no `aria-controls`. After a tap: "Cerrar menú", `aria-expanded="true"`, `aria-controls` = the id of `navigation` "Menú" (RTL with `findByRole`). Every "Toggle menu" / "Menu" locator is updated (plan § 12 table), and those tests pass.
  - If the dynamic import rejects (mocked), the burger returns to "Abrir menú" / `aria-expanded="false"` and nothing else is unmounted. A second tap retries the import.
  - `npm run check:first-load` passes and reports `/` ≤ 178,300 B (spike: 178,071 B). The **full** e2e suite is diff 0, including the four drawer files: the content is unchanged. `navbar.tsx` imports no GSAP.
- **Test type:** component + e2e
- **ACs:** 4, 5; 1 (diff 0); Sobre mí AC 9 (locator)
- **Citations:** A§ Component Model (interactivity in leaves), A§ Performance Budgets (`next/dynamic`), A§ Error Handling (no `error.tsx` blast radius), A§ Accessibility (icon buttons carry a name); ADR-0006 § 4 (`next/dynamic` condition)
- **Depends on:** —
- **Labels:** Render-Preserving · build check required

### T004: feat(nav): drawer modality: `inert` outside, scroll lock, pointer-only veil, close at ≥1024
- **Layer:** client leaf (behavior)
- **What:** While open, make everything except the burger, veil and panel inert, lock page scroll (moved from the Navbar into the chunk; the list has `overscroll-contain`), make the veil an `aria-hidden` div, and close silently when the viewport reaches 1024.
- **Files:** `components/layout/drawer/modal.ts`, `components/layout/drawer/__tests__/modal.test.ts`, `components/layout/drawer/mobile-drawer.tsx`, `components/layout/navbar.tsx` (remove the body-overflow effect), `tests/e2e/mobile-nav.spec.ts` (new)
- **Acceptance:**
  - `inertOutside([a, b])` sets `inert` on every sibling, up to `<body>`, that doesn't contain `a` or `b`. Its disposer removes only what it set: a node that was already `inert` stays `inert` (Vitest). E2E: while open, `main`, `footer` and the logo link can't be focused and are absent from `page.accessibility`/ARIA snapshots; after close, both are restored.
  - While open, `wheel` or touch-scroll over the page and past the list's end leaves `window.scrollY` unchanged. After close, the page scrolls again.
  - **On the `desktop-1280` project:** set the viewport to 768, open, then resize to 1280. The panel and veil have count 0, `body.style.overflow === ""`, no element has `inert`, and the header matches `navbar-closed.png` (the same `open()`, `isolate()` and clip as the closed test).
- **Test type:** component + e2e
- **ACs:** 30, 31, 34
- **Citations:** A§ Accessibility (dialogs trap focus), D§ Accessibility Baseline, S§ Next.js Surface Map (client DOM only); plan § 8
- **Depends on:** T003
- **Labels:** Render-Preserving (the veil keeps its box and classes) · build check required

### T005: feat(nav): drawer focus: focus in on open, two-edge Tab wrap, Esc, focus return
- **Layer:** client leaf (behavior)
- **What:** Focus the panel's first focusable on open, wrap Tab between the last panel control and the burger, close on Esc from anywhere, and return focus to the burger on X, veil and Esc. The panel is `inert` while it closes.
- **Files:** `components/layout/drawer/modal.ts` (`wrapTab`), `components/layout/drawer/mobile-drawer.tsx`, `components/layout/drawer/__tests__/mobile-drawer.test.tsx`, `tests/e2e/mobile-nav.spec.ts`
- **Acceptance:**
  - On open, `document.activeElement` is the panel's first focusable. Tab from the last focusable goes to the burger, Tab from the burger to the first focusable, and Shift+Tab reverses both (RTL + user-event).
  - The X, a veil click and Esc (with focus on any panel control) each close the drawer and leave focus on the burger, named "Abrir menú" (e2e, phone and tablet).
  - Item, Log in and Sign up clicks close the drawer, and navigation proceeds.
- **Test type:** component + e2e
- **ACs:** 29, 32 (the first focusable; the "Itineraries" header lands in T007), 33 (the edges)
- **Citations:** A§ Accessibility (Escape closes, focus restored), D§ Accessibility Baseline (keyboard path)
- **Depends on:** T004
- **Labels:** Render-Preserving

---

## M2: The "Índice" (visible change, DDR-0006)

### T006: feat(nav): panel shell: scrolling list plus pinned footer; 420px tablet panel
- **Layer:** client leaf (layout)
- **What:** Split the panel into a scrolling list region and a pinned footer region (flex column), and cap the panel at 420px from 640px, right-aligned with the capsule.
- **Files:** `components/layout/drawer/mobile-drawer.tsx`, `tests/e2e/mobile-nav.spec.ts`
- **Acceptance:**
  - At 360 × 780 the panel box is left 16, right 16, top 80 and bottom 16, with a 24px radius. The veil covers the viewport.
  - At 768 × 1024 the panel is 420px wide and its right edge equals the capsule's right edge (±1px). At 639 it is full width minus 16px insets; at 640 it is 420px.
  - At 320 the panel has no horizontal overflow (`scrollWidth ≤ clientWidth`).
- **Test type:** e2e
- **ACs:** 9, 49, 50, 51 (the box)
- **Citations:** A§ Styling (tokens only: `sm:w-105`, `sm:right-6`; mobile-first), D§ Spacing, Layout & Responsive Breakpoints
- **Depends on:** T005
- **Labels:** DDR-0006 · build check required

### T007: feat(nav): accordion index: five headers, single-open, default group, header dot
- **Layer:** client leaf (success state + interaction)
- **What:** Replace the group list with five `DrawerGroup` headers (`h2 > button`, name = label, scent line as the description, chevron, header dot), plus single-open state (`expanded`/`shown`) initialized from `defaultOpenGroup`. Closed bodies are `hidden`. Fonts per plan § 0.2 (label `body-lg font-bold`, Montserrat, sentence case; scent `eyebrow text-ink-muted`).
- **Files:** `components/layout/drawer/drawer-group.tsx`, `components/layout/drawer/mobile-drawer.tsx`, `components/layout/drawer/__tests__/drawer-group.test.tsx`, `components/layout/drawer/__tests__/mobile-drawer.test.tsx`, `app/globals.css` (new selector only: `.gsap [data-drawer-chevron]` transition, plan § 6)
- **Acceptance:**
  - On `/`: exactly five `h2 > button` headers in desktop order, each with `aria-expanded="false"`, an accessible name equal to the label, and a description equal to the scent line. No item link is in the accessibility tree. Focus on open is "Itineraries". Enter or Space toggles a header and focus stays on it.
  - Single-open: open Itineraries, then Guides → only Guides is expanded. Tap the open header → none is expanded. Services is closed by default on every route.
  - On the five Sobre mí routes, Sobre mí is expanded on open, and its header shows an `aria-hidden` dot that stays after collapse (S4). On `/` no dot shows. Close and reopen → the default state, with the list at `scrollTop` 0.
- **Test type:** component (RTL, mocked `usePathname`) + e2e
- **ACs:** 6, 7, 11, 12 (the `aria-expanded` part), 13, 14, 20, 22, 23, 24, 32, 35, 36 (`h2`), 37 (chevrons, header dot)
- **Citations:** A§ Accessibility (semantic HTML first), A§ State Management (local state; derived current page), A§ Component Model; DDR-0002 (order and labels), DDR-0003 (extended dot)
- **Depends on:** T001, T006
- **Labels:** DDR-0006

### T008: feat(nav): group bodies: column headings, 44px rows, tags, prices, current row
- **Layer:** client leaf (success state)
- **What:** Render each body as `h3` column headings (`eyebrow text-ink-muted`) followed by `ul > li > Link` rows (≥44px; title `body-sm font-semibold`; tag pill; price `font-mono font-bold` right-aligned; static dot plus `aria-current`), with no blurbs. Replace the obsolete drawer hit-region test and update the "AC 3" drawer tests to open the group first.
- **Files:** `components/layout/drawer/drawer-group.tsx`, `components/layout/drawer/__tests__/drawer-group.test.tsx`, `components/layout/__tests__/navbar.test.tsx`, `tests/e2e/sobre-mi/tap-targets.spec.ts`, `tests/e2e/navbar.spec.ts`, `tests/e2e/mobile-nav.spec.ts`
- **Acceptance:**
  - Opening each group shows its `h3` headings and links in config order. The tags "Best seller", "New" and "Most popular" appear on exactly their three rows. Services shows three rows with prices "from €25", "€149" and "€290" (computed font Courier Prime, weight 700, right-aligned). No blurb text appears in any group, and "with Belén" never wraps (AC 17).
  - **Replaces** "each drawer item owns its whole slot": every row's visible `boundingBox` is ≥44px tall and as wide as the list, in every group, at 360 and 768. On `/colaboraciones`, exactly one element has `aria-current="page"`, and it carries a visible `[data-current-dot]`.
  - "Drawer: tapping an item navigates and closes (Sobre mí AC 3)" opens Sobre mí first on `/`, then taps Colaboraciones → URL `/colaboraciones`, panel count 0. A Services row from `/sobre-mi` lands on `/#services`, in view. At 360 × 640, with Itineraries open, "Film Locations" scrolls fully above the footer. At 320, scent lines wrap without truncation.
- **Test type:** component + e2e
- **ACs:** 12, 15, 16, 17, 18, 21, 25, 26, 36 (`h3`), 37 (the row dot), 48, 51 (wrapping)
- **Citations:** A§ Routing (`next/link`), A§ Styling (tokens; `min-h-11`), D§ Accessibility Baseline (44px targets, contrast); DDR-0003, DDR-0005
- **Depends on:** T007
- **Labels:** DDR-0006

### T009: feat(nav): pinned footer: "Idioma" segmented control (ES default, drawer-scoped) and Log in / Sign up
- **Layer:** client leaf (success state + interaction)
- **What:** Build `DrawerFooter`: a globe plus `role="group"` "Idioma" with ES · PT · EN `aria-pressed` toggles (full-height ≥44px segments), and 48px Log in / Sign up pills side by side (Montserrat `body-sm font-semibold`, sentence case). The state is `drawerLang` in the Navbar (default "ES"), separate from the desktop `lang` (EN).
- **Files:** `components/layout/drawer/drawer-footer.tsx`, `components/layout/drawer/__tests__/drawer-footer.test.tsx`, `components/layout/navbar.tsx`, `components/layout/drawer/mobile-drawer.tsx`, `tests/e2e/mobile-nav.spec.ts`
- **Acceptance:**
  - The group "Idioma" has three buttons in the order ES, PT, EN, with ES pressed on first open. Tapping PT presses only PT, the drawer stays open, and the URL and page text don't change. The choice survives close and reopen. At 1280 the desktop language button still reads "EN".
  - Log in (left) and Sign up (right) are each 48px tall. They close the drawer and go to `#login` / `#signup`. Each segment's tap box is ≥44 × 44.
  - The full keyboard cycle from "Itineraries" with no group open: Guides, Blog, Services, Sobre mí, ES, PT, EN, Log in, Sign up, Cerrar menú, Itineraries (and the reverse with Shift+Tab). Each control shows the 2px ink `focus-visible` ring, including Sign up and the pressed segment. At 360 × 780 and 390 × 844 in S2, the list has `scrollHeight ≤ clientHeight`.
- **Test type:** component + e2e
- **ACs:** 2, 8, 10, 27, 28, 33, 38, 39
- **Citations:** A§ State Management (local state; no duplicated state), A§ Accessibility (focus visible); plan § 0.2 (fonts), § 5
- **Depends on:** T008
- **Labels:** DDR-0006 · build check required (First Load re-measured)

### T010: test(e2e): drawer characterization: four baselines, axe, freeze and no-JS checks
- **Layer:** E2E (characterization)
- **What:** Redefine the two drawer screenshots (`drawer-top` = S2 on `/`; `drawer-last-group` = S5 on `/sobre-mi`), waiting for GSAP to be idle. Add axe runs, and a no-JS closed-navbar check. The PR gets the `update-snapshots` label, and the bot regenerates exactly the four files.
- **Files:** `tests/e2e/navbar.spec.ts`, `tests/e2e/mobile-nav.spec.ts`, then the 4 PNGs (bot)
- **Acceptance:**
  - The bot commit changes exactly `drawer-{top,last-group}-{phone-360,tablet-768}-linux.png` and creates no other file. The PR body cites DDR-0006. The next CI run is green with every other screenshot diff 0.
  - `@axe-core/playwright` reports 0 violations on the open drawer in S2, in S3 (Itineraries), and in S5 on `/sobre-mi`, at 360 and 768 (color contrast included).
  - With `javaScriptEnabled: false`, the header matches `navbar-closed.png` at 360, 768 and 1280.
- **Test type:** e2e
- **ACs:** 1, 3, 40, 52
- **Citations:** ADR-0006 § 2–3 (oracle); DDR-0006 › Baselines; A§ Accessibility (`jsx-a11y`, axe); plan § 12
- **Depends on:** T009
- **Labels:** DDR-0006 · QA-owned files (the Engineer writes them; QA reviews)

---

## M3: Motion

### T011: feat(motion): drawer open "unfold" and close roll-up (M1–M9)
- **Layer:** motion
- **What:** Implement `playOpen` and `playClose` in `drawer-motion.ts` (veil, icon via `burgerRef`, panel `clip-path` plus `y`, group and footer rises with `opacity`, header dot pop), run from `useGSAP`. The close is built from current values, a reopen during a close resets to the defaults, the `focusin` safeguard is in place, and the gate is checked at call time.
- **Files:** `components/layout/drawer/drawer-motion.ts`, `components/layout/drawer/__tests__/drawer-motion.test.ts`, `components/layout/drawer/mobile-drawer.tsx`, `tests/e2e/mobile-nav.spec.ts`
- **Acceptance:**
  - Vitest on a paused timeline: tween targets, durations, positions and eases match `MOTION.drawer` (M1–M7). With `.gsap` absent, no tween is created and `onExited` runs synchronously on close.
  - E2E with `page.clock`: at t ≈ 0.1s the panel is partly clipped, the X is rotated between −90° and 0°, and the veil is partly transparent. By 0.9s everything has settled (the screenshot equals `drawer-top`). On `/sobre-mi` only the header dot scales from 0, while the row dot is at full size from the first frame. Close unmounts the panel and veil by 0.35s, and the header then equals `navbar-closed.png`.
  - During the unfold, tapping a header opens it, tapping the X closes from the current state, and Tab moves focus within the panel. With `reducedMotion: 'reduce'`, and separately with `.gsap` removed, the frame after each tap equals the settled frame. The capsule and page content never move (their bounding boxes are equal across samples).
- **Test type:** component + e2e
- **ACs:** 41, 42, 43, 45, 46 (open and close), 47
- **Citations:** A§ Animation (`useGSAP` only; `gsap.matchMedia` reduced branch; opacity reveals per ADR-0008; no input blocking); D§ Motion Principles; DDR-0006 items 13, 14, 16, 17; ADR-0002
- **Depends on:** T002, T010
- **Labels:** **ADR-0010** (needs *Accepted* before merge) · DDR-0006

### T012: feat(motion): accordion expand/collapse (M10–M13), overlap ≤500ms, header kept in view
- **Layer:** motion
- **What:** Implement `toggleBody`: animate the body wrapper's `height` (expand to `auto`, collapse to 0, overlapping), stagger the rows with `opacity` plus `y`, retarget without a queue, keep a collapsing body painted but `inert` until done, keep the opened header in view by adjusting `scrollTop`, and make everything instant without the gate.
- **Files:** `components/layout/drawer/drawer-motion.ts`, `components/layout/drawer/__tests__/drawer-motion.test.ts`, `components/layout/drawer/mobile-drawer.tsx`, `tests/e2e/mobile-nav.spec.ts`
- **Acceptance:**
  - With motion on, opening Guides while Itineraries is open ends within 500ms (`gsapPending` = 0 at 0.5s via `page.clock`). A double tap within 100ms leaves the group collapsed with nothing running after 500ms. While a body collapses, its links aren't focusable.
  - After Blog opens while Itineraries (above, long) collapses, Blog's header is inside the list's visible rect, with motion on and with reduced motion.
  - With reduced motion, and with `.gsap` removed, the frame after an expand or collapse tap equals the settled frame (including the chevron: no transition without `.gsap`). `height` is animated only in `drawer-motion.ts` (a grep check in the test or review note).
- **Test type:** component + e2e
- **ACs:** 19, 44, 46 (expand and collapse)
- **Citations:** A§ Animation (the `height` exception per ADR-0009; retarget; reduced branch); D§ Motion Principles (layout change); ADR-0007 (precedent)
- **Depends on:** T011
- **Labels:** **ADR-0009** (needs *Accepted* before merge) · DDR-0006

---

## M4: Measure and hand off

### T013: chore(perf): final measurements and QA handoff
- **Layer:** E2E journey handoff
- **What:** Record the final byte numbers and hand QA the drawer's E2E scope.
- **Files:** PR description (no code). `perf/first-load.json` is **not** edited (plan § 14 Q3).
- **Acceptance:**
  - The PR quotes `npm run check:first-load` for `/` (expected ≈178.1 kB, ≤179,492 B), the `next build` First Load for the five Sobre mí routes, and the gzip size of the drawer chunk(s).
  - The PR lists the snapshot diff summary: the four drawer files changed, every other screenshot 0.
  - The QA handoff block below is posted in the PR, together with the Reviewer handoff (A§ Engineering Workflow: spec, plan, tasks, DDR-0006, ADR-0009/0010 status, commands, preview URL).
- **Test type:** —
- **ACs:** all (handoff)
- **Citations:** A§ Performance Budgets; A§ Engineering Workflow (Reviewer and QA handoff)
- **Depends on:** T012
- **Labels:** —

---

## QA handoff (E2E scope for the Frontend QA Engineer)

- **Routes:** `/`, `/sobre-mi`, `/colaboraciones`, `/trabaja-conmigo`, `/contacto`, `/preguntas-frecuentes`
- **Projects:** `phone-360` (plus ad hoc viewports 390 × 844, 360 × 640, 320 × 780, 639/640 × 900, 780 × 360 landscape best-effort), `tablet-768`, `desktop-1280` (freeze only, plus AC 2 and AC 30)
- **States:** S1–S8 (spec § States Matrix), the resize to ≥1024 while open, and chunk-load failure (component-level only)
- **Acceptance criteria to cover:** Freeze 1–3 · Burger 4–5 · First level 6–11 · One group open 12–19 · Current page 20–24 · Navigation and closing 25–31 · Keyboard and SR 32–40 · Motion 41–47 · Responsive 48–51 · No JS 52
- **Manual:** VoiceOver on iOS Safari at 360 (heading list = 5 `h2` plus the open group's `h3`; names "Abrir menú" / "Cerrar menú" / "Menú" / "Idioma"; scent lines as descriptions). Keyboard at 768. Repeated open and close taps with motion on, to check that the ≈0.85s unfold doesn't feel slow (DDR-0006 › Consequences). INP and frame pacing of the unfold at 360 on the preview (ADR-0010 consequence). CLS during accordion motion (ADR-0009).
- **Known out of scope:** a no-JS drawer (S7, pre-existing), translation, placeholder links (Q1), desktop.

**First task for the Engineer: T001.**
