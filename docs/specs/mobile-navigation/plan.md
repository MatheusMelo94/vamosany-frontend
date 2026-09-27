# Plan: vamosany-front-end — Mobile navigation "Índice" (drawer below 1024px) v1

- **Status:** **Ready for /tasks.** T011 (ADR-0010) and T012 (ADR-0009) were gated on two ADRs; both are *Accepted* (2026-09-27, Matheus Melo). See § 13.
- **Date:** 2026-09-27
- **Author:** Frontend Architect. The user is the sole approver.
- **Spec:** `docs/specs/mobile-navigation/spec.md` v1 (*Ready for /plan*, 52 ACs, no open clarifications), with the **font amendment of 2026-09-27** applied here ahead of the spec (§ 0.2).
- **Decisions of record:** DDR-0006 (implemented here), DDR-0002 (amended), DDR-0003 (extended), DDR-0005; ADR-0002 (`.gsap` gate), ADR-0006 (freeze, superseded for the drawer's open state only), ADR-0007 (FAQ height, closed scope), ADR-0008 (opacity reveals). **Drafted by this plan, Accepted 2026-09-27:** ADR-0009 (height animation on the drawer accordion) and ADR-0010 (`clip-path` as an animatable paint property).
- **Approved mockup:** `docs/design/mockups/mobile-menu-indice.html`, phone "A · Índice", including the 2026-09-27 font update (the "fonts match the desktop menu exactly" CSS block and the "Desktop dropdown" section).
- **Contract:** **none.** The Contract Gate passes as N/A. Every read is static bundled config (`components/layout/nav-config.ts`, `features/sobre-mi/content/nav.ts`) or `usePathname()`. The one write is local UI state. There are no Pre-Contract items and no Contract Request.
- **Posture:** production site on Vercel, with the landing frozen (ADR-0006). Every screenshot outside the four drawer files must stay diff 0 (AC 1).
- **Commands** (npm, ADR-0005): `npm run typecheck && npm run lint && npm test`; `npm run build && npm run check:first-load`; `npm run test:e2e -- --grep @feature-mobile-nav`.
- **Citations shorthand:** `A§` = `frontend-architecture-conventions.md §`, `D§` = `design-conventions.md §`, `S§` = `frontend-security-conventions.md §`.

---

## 0. Readiness, measurements and supersessions

### 0.1 Plan Readiness Gate

| Check | Result |
|---|---|
| Stack | Next 15.5.26, React 19.1, TS 5.9, Tailwind 4.1, GSAP 3.15 + `@gsap/react`. It matches A§ Stack Baseline, except npm (ADR-0005) and Node 24 (`.nvmrc`), which are already recorded. |
| Input | A UX Strategist spec marked *Ready for /plan*. **Confidence: full.** |
| Spec-Kit | Not initialized (no `.specify/`). Output goes to `docs/specs/mobile-navigation/{plan,tasks}.md`, as in `docs/specs/sobre-mi/`. |
| Conventions | A§ and D§ loaded; S§ Next.js Surface Map checked (§ 10). |
| Contract Gate | N/A. No backend dependency (spec § Data Dependencies). |
| Tech Design Doc trigger (A§ Tech Design Doc) | **Not met.** One area is touched (`components/layout/` plus `lib/motion.ts`). There's no new cross-cutting mechanism of the kinds listed (auth, real-time, i18n, offline), no ScrollTrigger, no Flip transition, and no integration boundary. The motion design is detailed enough in § 7. |

### 0.2 Font amendment (user decision 2026-09-27; supersedes the spec until the UX Strategist amends it)

The drawer uses **exactly the desktop menu's fonts**. This supersedes the spec's § Responsive Behavior › Layout values (header label `card-title`; `label-button` segments and pills) and the third row of the spec's § Where This Spec and the Mockup Differ ("`card-title` (19px)"):

| Element | Spec v1 said | This plan builds | Desktop reference |
|---|---|---|---|
| Group name (header label) | `card-title` (Courier, caps) | **Montserrat, sentence case, bold: `body-lg font-bold text-ink`** (18px, the existing utility closest to the mockup's 1.1rem) | the desktop triggers (Montserrat semibold) |
| Item title | `body-sm` semibold | unchanged: `body-sm font-semibold text-ink` | the desktop item title |
| Tag | `caption` semibold yellow pill | unchanged | desktop |
| Language segments | `label-button` (Courier, caps) | **`body-sm font-semibold`**, Montserrat, codes as written ("ES", "PT", "EN") | the desktop language button (`textLink`) |
| Log in / Sign up | `label-button` (Courier, caps) | **`body-sm font-semibold`**, Montserrat, sentence case ("Log in", "Sign up") | the desktop `textLink` |
| Column heading, scent line | `eyebrow` in `ink-muted` | unchanged (Courier), `eyebrow text-ink-muted` | the desktop column heading |
| Price | Courier Prime bold at the `body-sm` size | unchanged | the desktop price (Courier) |
| "See details", blurbs | not shown on mobile | unchanged (not shown) | — |

The size of the group name is the only value this amendment leaves to judgment. `body-lg` is the plan's choice because it is an existing token (D§ Design Tokens: no raw values). If the UX Strategist's amendment names a different existing utility, T007 swaps it, with no other change. Header rows stay ≥56px.

### 0.3 First Load JS: measured first, then budgeted

`/` ships the Navbar, and the Navbar holds the drawer. Measured on HEAD `159457e` in a clean worktree (`next build`, then `scripts/check-first-load.mjs`, gzip level 9):

| Build | `/` First Load JS | vs committed baseline 178,492 B |
|---|---|---|
| HEAD today | **178,233 B** | −259 B |
| Spike A: today's drawer JSX moved into a `next/dynamic({ ssr:false })` chunk, plus the new burger ARIA and a drawer-scoped language state | 177,971 B | −521 B |
| Spike B: Spike A plus the Navbar-side shape this plan needs (open and closing phase, burger ref, idle and `pointerdown` prefetch) | **178,071 B** | **−421 B** |
| Drawer chunk in Spike B (today's markup, gzip) | 1,191 B, lazy | not in First Load |

The guard fails above baseline + allowance = **179,492 B**, which is under the 179,500 B ceiling the coordinator set.

**Decision (A§ Performance Budgets: `next/dynamic` for client-only components; A§ Component Model):** the whole open drawer, including its markup, accordion state, modal behavior and both GSAP timelines, moves into **one lazy client chunk**. The Navbar keeps only the burger, a small open, closing and mounted state machine, the drawer-scoped language state, and the prefetch. After that, `/` is **~160 B smaller than today**. All later drawer growth lands in the lazy chunk, which the guard doesn't count.

- **Expected byte impact on `/`:** about **−150 to −100 B** vs today once T009 adds the language state. The end state is about 178.1 kB, **~1.4 kB under the guard**. The ADR-0006 § 4 `next/dynamic` condition ("only if it doesn't perceptibly delay the first animated frame") is met by the prefetch below.
- **Expected lazy chunk:** about 5–8 kB gzip of drawer code, plus `CustomEase` (about 3 kB gzip) on routes where it isn't loaded yet. `gsap` core is already in `/`'s First Load, because `hero-ring.tsx` imports `@/lib/gsap` statically. On the Sobre mí routes it is shared with the lazy Cuaderno controller. The chunk is **never fetched at ≥1024** (the burger is `lg:hidden`, and the prefetch checks the breakpoint).
- **Prefetch, so the first tap isn't late:** after hydration, and only when `matchMedia("(max-width: 1023.98px)")` matches, the Navbar calls `import("./drawer/mobile-drawer")` on idle (`requestIdleCallback`, falling back to `setTimeout` for Safari). The burger's `pointerdown` and `focus` call it as well, which is a no-op once it's loaded. This also keeps the spec's § States Matrix "Offline: works once the page has loaded" true.
- **The guard baseline doesn't move.** `perf/first-load.json` stays at 178,492 B with a 1,000 B allowance. Every task that touches `navbar.tsx` quotes the guard's output line in its commit body. **Stop rule:** if any task makes the guard fail, the Engineer stops and reports. Nothing is re-baselined upward. Tightening the baseline down to the new measurement after merge is an optional user decision (§ 14 Q3), not a task.

### 0.4 No-JS drawer: out of scope (spec § Out of Scope 5)

It isn't trivially free, so it isn't planned and no spec amendment is proposed. For the drawer to open without JS, its markup would have to be server-rendered into every page's HTML. Because the Navbar is a client component, that means either shipping the markup in First Load JS (the opposite of § 0.3), or restructuring it as a Server Component slot passed into the Navbar. It would also need a `popover`/`<details>` wrapper on the burger, whose UA top-layer styles would have to be neutralized to keep the frozen closed state pixel-identical. Even then, the X icon, the accordion, `inert` and focus return would still need JS. AC 52 only checks that the closed navbar is unchanged without JS (T010).

---

## 1. Component tree (server/client boundary)

`[S]` Server Component · `[C]` `'use client'` in First Load · `[C·dyn]` client via `next/dynamic({ ssr:false })`, a lazy chunk not in First Load.

```
app/(marketing)/page.tsx                         [S]  (unchanged)
app/(marketing)/(cuaderno)/layout.tsx            [S]  (unchanged)
└─ components/layout/navbar.tsx                  [C]  already client; stays the leaf that owns navbar state
   ├─ capsule <nav> (logo, desktop mega-menu, desktop language menu)   unchanged, frozen
   ├─ burger <button>                            name "Abrir menú" / "Cerrar menú", aria-expanded,
   │                                             aria-controls={drawerId} while mounted; icon X while mounted
   ├─ NavMarker                                  [C·dyn]  unchanged (desktop only)
   └─ MobileDrawer (when mounted)                [C·dyn]  components/layout/drawer/mobile-drawer.tsx
      ├─ veil <div aria-hidden onClick=close>    pointer-only (spec § Accessible names)
      └─ <nav id={drawerId} aria-label="Menú">   the panel: fixed box, flex column
         ├─ list region <div data-drawer-list>   overflow-y-auto, overscroll-contain
         │  └─ DrawerGroup ×5                    components/layout/drawer/drawer-group.tsx
         │     ├─ <h2><button aria-expanded aria-controls aria-labelledby aria-describedby>
         │     │    label · header dot (aria-hidden) · scent line (eyebrow, ink-muted) · chevron
         │     └─ body <div id data-drawer-body hidden={!shown}>
         │          ├─ <h3 class="eyebrow">column heading</h3>
         │          └─ <ul><li><Link> row: title · tag · price · static dot · aria-current
         └─ DrawerFooter                         components/layout/drawer/drawer-footer.tsx
            ├─ globe (aria-hidden) + <div role="group" aria-label="Idioma"> 3 × <button aria-pressed>
            └─ Log in · Sign up (<Link>, 48px)
```

Pure modules, no React, unit-tested:
- `components/layout/drawer/nav-model.ts`: `scentLine(group)`, `groupHasCurrent(group, pathname)`, `defaultOpenGroup(nav, pathname)`, `isCurrentHref(href, pathname)`, `itemHref(item)` (the `/#services` fallback).
- `components/layout/drawer/modal.ts`: `inertOutside(keep: Element[]): () => void` (restores exactly what it set), `wrapTab(event, first, last)`.
- `components/layout/drawer/drawer-motion.ts`: `playOpen`, `playClose` and `toggleBody` (timeline builders taking elements and `MOTION.drawer`), called only inside `useGSAP` or `contextSafe`.

**Props across the boundary** (A§ Component Model: serializable, except the callbacks between two client components): `open: boolean`, `lang`, `onLang`, `onClose`, `onExited`, `burgerRef`, `drawerId`. No server data crosses; the content is imported from `nav-config.ts` inside the chunk.

**Why the drawer is a sibling of the capsule `<nav>` and not inside it:** today's constraint stays (RV-0015). The capsule's `backdrop-filter` would become the containing block of a `fixed` child.

---

## 2. Routes and states (screen × state → file → task)

No route files change. The drawer is an overlay on every route that renders the Navbar (`/` and the five Sobre mí routes). No `loading.tsx`, `error.tsx` or `not-found.tsx` applies, because the data states are declared N/A in the spec with reasons (D§ Screen States Matrix).

| State (spec) | Where it's built | Task(s) | ACs |
|---|---|---|---|
| S1 Closed (every width, reduced motion, no JS) | `navbar.tsx` (the burger only; no drawer DOM) | T003 | 1, 4, 52 |
| S2 Open, all closed | `mobile-drawer.tsx`, `drawer-group.tsx`, `drawer-footer.tsx` | T006–T009 | 5–11, 32–34 |
| S3 One group open | `drawer-group.tsx` (body) | T007, T008, T012 | 12–19, 35 |
| S4 Current page in a closed group | header dot in `drawer-group.tsx` | T007 | 22 |
| S5 Current page in an open group (Sobre mí routes) | `defaultOpenGroup` + row dot + `aria-current` | T001, T007, T008 | 20, 21, 45 |
| S6 Reduced motion or no `.gsap` | the `motionEnabled()` branch in `drawer-motion.ts`; the gated chevron CSS | T011, T012 | 46 |
| S7 No JS | nothing (pre-existing gap, out of scope); the closed navbar is checked | T010 | 52 |
| S8 Tablet 640–1023 | panel classes `sm:` (420px, right-aligned) | T006 | 49, 50 |
| Resize to ≥1024 while open | the breakpoint listener in `mobile-drawer.tsx` | T004 | 30 |
| Drawer chunk fails to load | the loader's `catch` fallback in `navbar.tsx` | T003 | — (§ 9) |

---

## 3. Data reads (A§ Data Fetching & Mutations)

| Read | Source | Cache | Schema | Notes |
|---|---|---|---|---|
| Nav groups, columns, items, tags, prices, hrefs | `NAV` from `components/layout/nav-config.ts` (bundled) | N/A (static module) | TypeScript types `NavGroup`, `NavColumn` and `NavItem`. No zod: nothing crosses an I/O boundary. | One source for desktop and mobile (DDR-0002). |
| Scent line | derived: `group.columns.map(c => c.heading).join(" · ")` | — | — | No new field (spec § Content & Copy). |
| Current route | `usePathname()` inside the chunk | — | — | Drives S4, S5, the default open group, `aria-current` and dots. |

**Config invariant (spec § States Matrix › Empty):** a Vitest test fails if any group has 0 columns or any column has 0 items (T001).

## 4. Data writes

| Write | Mechanism | Revalidation | Optimistic |
|---|---|---|---|
| Drawer language selection | local state `drawerLang: "ES" \| "PT" \| "EN"` in `Navbar`, default `"ES"`, passed to the chunk | none | N/A |

No Server Actions and no Route Handlers.

---

## 5. State decisions (A§ State Management)

| State | Level | Why |
|---|---|---|
| `drawerOpen` (logical: drives `aria-expanded`, the name, and closing) and `drawerMounted` (drives the chunk and the X icon until the close finishes) | local, in `Navbar` | The burger lives in the Navbar. Keeping two booleans lets the name flip at once (AC 29) while the X stays until unmount (spec M9). Not URL state: a menu isn't shareable. |
| **`drawerLang`** (default ES) | local, in `Navbar`, **separate from the desktop `lang`** (EN, frozen) | Resolves spec Note 2 and AC 2: the desktop listbox keeps reading `lang` = "EN", so `language-menu-desktop-1280` and `navbar-closed-desktop-1280` stay diff 0. It is held in the Navbar, not in the chunk, so the choice survives closing and reopening in the same page session (spec: "ES is selected on **first** open"). Order ES · PT · EN is drawer-only. |
| `expanded: string \| null` and `shown: Set<string>` (bodies displayed, including one that is collapsing) | local, in `MobileDrawer` | `expanded` updates at once (`aria-expanded`, single-open). `shown` keeps a collapsing body painted until its tween ends, and under reduced motion it equals `expanded` immediately. Initialized from `defaultOpenGroup(NAV, pathname)` on every mount, so AC 24 holds by construction. A reopen during a close resets both explicitly. |
| Current page | derived from `usePathname()`, never stored | DDR-0002/0003 rule, as today. |

No context, and no global store.

---

## 6. Styling and tokens (A§ Styling; D§ Design Tokens)

**No token additions to `app/globals.css`** (spec § Design Handoff 6). New CSS consists of **new selectors only**, on the sobre-mi precedent:

- `.gsap [data-drawer-chevron] { transition: rotate 200ms var(--ease-default); }`. The chevron rotates through Tailwind 4's `rotate` property (`group-aria-expanded:rotate-180`). The transition exists **only under `.gsap`**, so "no `.gsap`" and reduced motion are instant (AC 46), which a plain `transition-transform` utility wouldn't give. 200ms matches the desktop triggers' `duration-200` (spec M10); a raw value is allowed in `globals.css`.

Panel box (it keeps today's classes, then adds):

| Width | Classes | AC |
|---|---|---|
| <640 | today's `fixed inset-x-4 top-[calc(1rem+3.5rem+0.5rem)] bottom-4 rounded-3xl border border-ink/[0.08] bg-canvas shadow-drawer`, plus `flex flex-col overflow-hidden` (the list scrolls, not the panel) | 9 |
| 640–1023 | `sm:left-auto sm:right-6 sm:w-105`. `w-105` = 105 × `--spacing` = 420px, a scale value rather than an arbitrary one. `right-6` = the header's `sm:px-6`, and the capsule's right edge sits there because `--container-page` (1200px) is wider than any sub-1024 viewport. | 49, 50 |

Inside: the list uses `px-5` (20px text inset, as today), `overflow-y-auto overscroll-contain`, and `min-h-0 flex-1`. The footer uses `border-t border-hairline bg-canvas px-4 pt-3 pb-4` with `gap-3` between its two rows. Rows use `min-h-11` (44px) with `border-b border-surface-1`. Headers use `min-h-14` (56px). The segment track is `min-h-12` with `border-2 border-hairline rounded-full`, and each segment fills the track's height (AC 39). Pills are `min-h-12 rounded-full` (Log in `bg-ink/5 hover:bg-ink/10`; Sign up `bg-ink text-inverse-ink hover:bg-ink/90`). The scent line and column headings use `eyebrow text-ink-muted` (the `eyebrow` utility defaults to `ink-tertiary`, so the override is required, AC 40). The price uses `font-mono font-bold` at the `body-sm` size. T008 asserts its computed `font-family` and `font-weight` (AC 17), because `body-sm` also sets `font-family`. The focus ring on every control is `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink` (AC 38). Fonts follow § 0.2.

Container queries aren't needed: the panel's width is set by the viewport rule above.

---

## 7. Motion strategy (A§ Animation (GSAP 3); D§ Motion Principles; DDR-0006 § Motion; spec § Motion Intent)

### 7.1 Where the code lives, and gating

- All GSAP lives in the lazy chunk: `drawer-motion.ts` builders, run inside `MobileDrawer`'s `useGSAP({ scope: rootRef, dependencies: [open] })` and `contextSafe` handlers (A§ Animation: `useGSAP` only). Imports come from `@/lib/gsap` and `@/lib/gsap-ease` (`getEases().arrive`). `navbar.tsx` imports **no** GSAP.
- **Gate:** every builder checks `motionEnabled()` (the `.gsap` class, ADR-0002) **when it is called**, not at mount, so removing the class at runtime also gives the instant path (AC 46). Reduced motion never gets `.gsap`, so one check covers both, and a `gsap.matchMedia()` reduced branch is added to satisfy A§ Animation literally. Off → no tween. The settled state is the natural CSS state, so it appears on the next frame.
- **Values:** a new `MOTION.drawer` entry and `EASE.pop = "back.out(3)"` in `lib/motion.ts`. These are additions only; no existing value changes (the file header's rule; ADR-0006 § 4). The shape:

```ts
drawer: {
  open:  { veil: { duration: 0.25, ease: "power1.out" },
           icon: { rotate: -90, scale: 0.6, duration: 0.35 },            // ease: arrive
           panel: { clipFrom: "inset(0% 0% 100% 0% round 24px)", y: -10, duration: 0.55 }, // arrive
           rows: { y: 14, duration: 0.35, stagger: 0.05, at: 0.15, ease: "power2.out" },
           footer: { y: 24, duration: 0.4, at: 0.3 },                     // arrive
           dot: { duration: 0.4, at: 0.45 } },                            // EASE.pop
  close: { panel: { y: -6, duration: 0.25, ease: "power2.in" }, veil: { duration: 0.2, at: 0.05 } },
  accordion: { expand: { duration: 0.3, ease: "power2.out" }, collapse: { duration: 0.18, ease: "power2.in" },
               rows: { y: 6, duration: 0.18, stagger: 0.03, at: 0.05, maxStart: 0.25 }, chevron: 0.2 },
}
```

The `24px` in `clipFrom` is `--radius-3xl` (Tailwind's default theme, 1.5rem; the panel's `rounded-3xl`). The builder reads the token with `getComputedStyle`, as `nav-marker.tsx` does, and the literal is only the jsdom fallback.

### 7.2 Open, the "unfold" (M1–M6; ADR-0010 for `clip-path`)

One timeline is built in `useGSAP` when `open` becomes true, in layout-effect timing, so the start state is applied before the first paint (A§ Animation: initial state):

| # | Target | Tween |
|---|---|---|
| M1 | veil | `fromTo opacity 0→1` |
| M2 | burger `<svg>` (through `burgerRef`, outside the scope; element refs, not selectors) | `from { rotate:-90, scale:0.6, opacity:0 }`, ease `arrive` |
| M3 | panel `<nav>` | `fromTo { clipPath: clipFrom, y:-10 } → { clipPath: "inset(0% 0% 0% 0% round 24px)", y:0, clearProps:"clipPath" }`, ease `arrive` |
| M4 | `[data-drawer-group]` ×5 (header plus a default-open body) | `from { y:14, opacity:0 }`, stagger 0.05, at 0.15 |
| M5 | footer | `from { y:24, opacity:0 }`, at 0.3 |
| M6 | the current-group header dot | `from { scale:0 }`, `EASE.pop`, at 0.45 |

- **Reveals use `opacity`, not `autoAlpha`** (ADR-0008 / A§ Animation). Headers, rows and footer controls are focusable, and they must stay in the tab order during the sequence (AC 43).
- **Focus safeguard (ADR-0008 condition 2):** a `focusin` listener in the panel (`contextSafe`) completes the reveal of the focused `[data-drawer-group]` or footer (`tween.progress(1)` on its child tween) when the user Tabs to it mid-sequence. **The initial programmatic focus on "Itineraries" at t = 0 is the one exception.** The spec requires it (spec § Motion Intent › Global rules, "focus moves into the panel at t = 0"; DDR-0006 item 18), and at that moment the whole panel is also still clipped by M3. The reveal is bounded: the header is fully opaque by t = 0.5s. See § 14 Q2; it doesn't block.
- **Input is never blocked** (A§ Animation: ≤300ms blocking; spec § Global rules): no `pointer-events` changes; handlers act on logical state and retarget.
- The capsule's backdrop blur must not flicker. The panel is a sibling of the capsule and animates only its own `clip-path` and `y`. No transform or filter is added to the capsule or the header. T011 verifies with a screenshot at t ≈ 0.05s that the capsule's pixels equal `navbar-closed` apart from the icon.

### 7.3 Close (M7–M9)

On `open` becoming false: kill the open timeline and build the close timeline **from the current values** (`to`, never `fromTo`), so a close during the unfold rolls up from wherever it is:
M7 `panel.to { clipPath: clipFrom, y:-6 }` (0.25s, `power2.in`); M8 `veil.to { opacity:0 }` at 0.05; `onComplete → onExited()`. The Navbar then unmounts the chunk, and the icon swaps to the burger at the same moment (M9). `useGSAP`'s revert clears the icon's inline transform. Motion off → `onExited()` synchronously.

**A reopen during a close** (burger tapped at t < 0.25s): kill the close timeline, reset `expanded` and `shown` to the defaults and the list's `scrollTop` to 0 (AC 24), then `to` the settled values with the open durations.

### 7.4 Accordion (M10–M13; ADR-0009 for `height`)

- **M11/M12:** the body wrapper `[data-drawer-body]` (`overflow-hidden`) tweens `height` from its current value to `"auto"` (expand, 0.3s `power2.out`) or to 0 (collapse, 0.18s `power2.in`), with `overwrite: true` and `clearProps: "height"` on complete. The headers below slide because the layout moves, not through transforms. In a single-open swap both tweens start together (they overlap), so the swap ends at max(0.3, 0.05 + 0.25 + 0.18) = **0.48s ≤ 0.5s** (AC 44). A second tap retargets from the current height (no queue). Tapping twice within 100ms ends collapsed, and nothing runs after 0.5s.
- **Collapse and AT:** when a group collapses, `aria-expanded` flips at once, and the body stays painted but gets `inert`, so its links leave the tab order and the accessibility tree immediately. It becomes `hidden` once `shown` drops it in `onComplete`.
- **M13 rows:** `from { opacity:0, y:6 }`, 0.18s, stagger `min(0.03, 0.2 / (n − 1))` so the last row starts ≤0.25s after M11 begins, at 0.05. The `focusin` safeguard completes a row's reveal if it gets focus.
- **M10 chevron:** CSS (§ 6), gated by `.gsap`.
- **Keeping the header in view (AC 19):** before starting, compute the opened header's final `offsetTop` (its current `offsetTop` minus the height of any collapsing body above it). If that is above the list's `scrollTop`, tween `scrollTop` to it with the collapse duration (instant when motion is off).

### 7.5 Reduced motion and no `.gsap` (S6, AC 46)

Each builder returns before creating tweens. Open: the settled DOM is painted on the first frame. Close: `onExited()` runs synchronously. Accordion: `shown` equals `expanded` immediately. Chevron: no transition. Scroll: `scrollTop` is set, not tweened.

### 7.6 Motion Principles deviations, and who covers them

The ≈0.85s sequence (more than 800ms), a second expressive moment, and the stagger of 0.05s (≤60ms, OK) are covered by **DDR-0006 item 17** (design). The `clip-path` animation is covered by **ADR-0010** (Accepted, engineering). The `height` animation is covered by **ADR-0009** (Accepted, engineering).

---

## 8. Accessibility mechanics (A§ Accessibility (engineering rules); spec § Accessibility Acceptance)

| Concern | Mechanism | AC |
|---|---|---|
| Burger | `aria-expanded={drawerOpen}`; `aria-label={drawerOpen ? "Cerrar menú" : "Abrir menú"}`; `aria-controls={drawerMounted ? drawerId : undefined}` (`drawerId` from `useId()`). The icon stays `aria-hidden`, and the `tap-target` class is kept (its hit area is frozen). | 4, 5 |
| Modality | **`inert` on everything outside {burger, veil, panel}**: `inertOutside()` walks from each kept element up to `<body>` and sets `inert` on every sibling that doesn't contain a kept element (`<main>`, `<footer>`, the route announcer, and inside the capsule the logo link and the hidden desktop block). It records what it set and restores exactly that on close or unmount. **Not a native `<dialog>`:** `showModal()` would make the burger inert, but the X is part of the focus cycle (AC 33), and ADR-0006 § 4 warns about UA dialog styles. | 34 |
| Focus in | On mount, `firstHeaderRef.focus({ preventScroll: true })` in a layout effect (t = 0). | 32 |
| Focus cycle | DOM order is burger → (veil, not focusable) → panel, so the natural Tab order already gives headers → open rows → ES → PT → EN → Log in → Sign up. A `keydown` handler on `document` wraps the two edges: Tab on the last control (Sign up) goes to the burger, and Shift+Tab on the burger goes to Sign up. Burger → Itineraries and Itineraries → burger (Shift+Tab) are native. | 33 |
| Esc | A `keydown` Escape on `document` while open calls `onClose()`, then focuses the burger. The Navbar's existing window Escape handler (desktop menus) is unaffected. | 29 |
| Close paths | The X (the burger), the veil `onClick`, and Esc close and focus the burger. Item links, Log in and Sign up close and let navigation proceed. The panel gets `inert` for the duration of M7 ("can't receive focus during M7"). The page's `inert` and scroll lock are released **at the start of the close**, not at unmount. | 25, 28, 29 |
| Breakpoint | `matchMedia("(min-width: 1024px)")` `change` → close silently: no motion, `onExited()` at once, no focus move (the burger is `display:none`), `inert` and scroll lock restored. | 30 |
| Scroll lock | Set in the chunk on open (`document.body.style.overflow = "hidden"`) and restored on close start and unmount. The list has `overscroll-contain`. Today's Navbar effect moves into the chunk. | 31 |
| Headers | `<h2><button aria-expanded aria-controls={bodyId} aria-labelledby={labelId} aria-describedby={scentId}>`. The name is exactly the label (the scent is inside the button for the tap area but is only the description). Chevron and header dot are `aria-hidden`. | 35, 36, 37 |
| Bodies | `<div id={bodyId} hidden={!shown}>`. Column headings are `<h3>`, and items are `<ul><li><Link>`. `aria-current="page"` goes only on the current row, whose dot is `aria-hidden` with `data-current-dot` (kept for existing tests). | 6, 12, 21, 36, 37 |
| Language | `<div role="group" aria-label="Idioma">` with 3 `<button aria-pressed>`. Toggle buttons, **not a radio group**, because AC 33 requires ES, PT and EN each in the Tab order. The globe is `aria-hidden`, and the visible word "Language" is removed. | 10, 27, 39 |
| Veil | `<div aria-hidden onClick>`. jsx-a11y's `click-events-have-key-events` and `no-static-element-interactions` get a one-line disable with the justification "pointer-only per spec § Accessible names; X and Esc cover keyboard/AT". | spec |
| Live regions | None. `aria-expanded` announces. | spec |

---

## 9. Error handling (A§ Error Handling)

There is no I/O, so no result unions and no `AppError`. **One new failure mode:** the lazy chunk fails to load (flaky network before the prefetch finished). `next/dynamic` would throw into the nearest error boundary, and on these routes that is only `app/global-error.tsx`, which would replace the whole page. The loader therefore catches:

```ts
const MobileDrawer = dynamic(
  () => loadDrawer().then((m) => m.MobileDrawer).catch(() => DrawerUnavailable),
  { ssr: false },
);
```

`DrawerUnavailable` is a two-line component in `navbar.tsx` that calls `onExited()` in an effect and returns `null`. The burger returns to closed, and the next tap retries: webpack forgets a failed chunk, and `loadDrawer` isn't memoized on failure. T003 covers this with a Vitest test that makes the import reject.

---

## 10. Security surfaces (S§ Next.js Surface Map)

| Surface | Touched? | Control |
|---|---|---|
| Server Components, Server Actions, Route Handlers, `middleware.ts`, `next.config.ts`, env | **No** | — |
| Client Components (`navbar.tsx`, `drawer/*`) | Yes | No `dangerouslySetInnerHTML`. Every `href` comes from the static config or is the `/#services`, `#login` or `#signup` literal, never from user input or the URL. `next/link` for internal targets. No storage (language state isn't persisted). No new dependency. |
| Third-party scripts, dependencies | No | No package added (Flip isn't used; see ADR-0009). |

Pre-existing, not touched: the inline `.gsap` gate script in `app/layout.tsx` (CSP nonce work belongs to its own item). A Security Engineer pass is optional for this feature. The threat surface is DOM-only (`inert`, focus), and there's no new data flow.

---

## 11. Performance

| Item | Expectation | Check |
|---|---|---|
| `/` First Load JS | ≈178.1 kB, about −150 B vs today; guard limit 179,492 B | `npm run check:first-load` in every task touching `navbar.tsx`; final line quoted in T013 |
| Sobre mí routes | about −150 B each (same Navbar) | Next build table, quoted in T013 |
| Drawer chunk | ~5–8 kB gzip plus CustomEase where it isn't loaded; fetched on idle below 1024 only | T013 records the gzip size |
| INP | Tap → state → one React commit plus GSAP start. No layout reads in the handler except the AC 19 `offsetTop` read. | QA Lighthouse or trace on preview (360) |
| CLS | The drawer is `fixed`, and the accordion's layout shift happens inside it after a user input (excluded from CLS within 500ms, the same reasoning as ADR-0007) | QA |
| Fonts, images | Nothing new (Montserrat and Courier are already loaded by `next/font`) | — |

---

## 12. Test strategy and snapshot impact (ADR-0006 § 2; DDR-0006 › Baselines)

**New e2e tag:** `@feature-mobile-nav`. Drawer specs live in `tests/e2e/navbar.spec.ts` (characterization), plus a new `tests/e2e/mobile-nav.spec.ts` for the behavioral ACs. QA owns both files; the Engineer writes them and QA reviews.

**Test assertions to update (not baselines):**

| File | Today | Change | Task |
|---|---|---|---|
| `tests/e2e/navbar.spec.ts` (4 places: L150–151, L193–195, L590–591) | `name: "Toggle menu"`, `name: "Menu"` | `"Abrir menú"`, `"Menú"` | T003 |
| `tests/e2e/sobre-mi/tap-targets.spec.ts` L115, L132–136 | same | same | T003 |
| `components/layout/__tests__/navbar.test.tsx` (6 places) | same | same (drawer tests now `await findByRole`, because the chunk is lazy) | T003 |
| `tap-targets.spec.ts` › "each drawer item owns its whole slot" (the 30px-pitch hit-region test) | invisible `::before` slot | **replaced** by "every drawer row's visible box is ≥44px tall and spans the list width" (AC 15), in every group at 360 and 768. The burger and logo hit-area test is **kept**. | T008 |
| `navbar.spec.ts` › "drawer: tapping an item navigates and closes the drawer (AC 3)" | links visible at once | on `/`, open the **Sobre mí** group first, then check the five hrefs and tap "Colaboraciones" | T008 |
| `navbar.spec.ts` › "drawer marks the current page … (AC 9)" on `/colaboraciones` | — | unchanged apart from the locator: Sobre mí is open by default there (S5) | T003 |
| `navbar.test.tsx` "mirrors the Sobre mí group…", "points every drawer item at a path…", "marks it in the drawer too…" | links visible at once | open the group first (or assert the S5 default) | T008 |

**Screenshot baselines. Exactly these four regenerate** (DDR-0006 › Consequences), by the `update-snapshots` label bot, with the PR citing DDR-0006:

| File | New content |
|---|---|
| `drawer-top-phone-360-linux.png`, `drawer-top-tablet-768-linux.png` | **S2** on `/`: first level, settled, list at top |
| `drawer-last-group-phone-360-linux.png`, `drawer-last-group-tablet-768-linux.png` | **S5** on `/sobre-mi`: the last group (Sobre mí) open by default, with the header dot, the row dot and the pinned footer, settled |

The names are kept on purpose. The bot's "changed" mode then rewrites these four files and creates none, so no orphaned PNG needs deleting and the Reviewer's allowed-diff list is exactly four paths. The test waits for GSAP to be idle (`waitForGsapIdle`) before capturing, because `animations: "disabled"` doesn't stop GSAP. That way the baseline doesn't need regenerating again after motion lands (T011/T012). **Every other committed screenshot must be diff 0:** `navbar-closed*` (3 projects, plus reduced motion), all `navbar-panel-*` (with and without hover), `language-menu-desktop-1280`, and everything under `tests/e2e/landing.spec.ts-snapshots/` and `tests/e2e/sobre-mi/`. A diff anywhere else is BLOCKING. No drawer screenshot is created on `desktop-1280` (every drawer test starts with `test.skip(isDesktop(page))`).

**Reusing an existing baseline in new tests:** Playwright resolves `toHaveScreenshot("navbar-closed.png")` by name and project. AC 30 therefore runs **on the `desktop-1280` project**: viewport 768, open the drawer, resize to 1280, then compare against `navbar-closed.png` (= `navbar-closed-desktop-1280`) with the same `open()`, `isolate()` and `clip` procedure as the closed test. AC 42 compares against `navbar-closed.png` on phone and tablet. AC 52 uses a `javaScriptEnabled: false` context and the same name. It can't call `waitForLandingMotion`, and if `page.addStyleTag` doesn't work without JS, the isolation style is injected with `page.route` on the HTML response.

**Time-sampled motion ACs (41, 43, 44, 46):** use `page.clock.install()` before navigation, then `clock.runFor(ms)` to sample at t ≈ 0.1s, 0.5s and 0.9s. GSAP's ticker runs on `requestAnimationFrame` and `performance.now`, which the clock controls. The fallback is `gsapPending` from `tests/e2e/support/motion.ts`. "No `.gsap`" (AC 46) is emulated by removing the class after load (`document.documentElement.classList.remove("gsap")`), which works because the builders check the gate at call time (§ 7.1).

**Unit (Vitest + RTL, jsdom):** `nav-model`, `modal`, `lib/motion` additions, and `MobileDrawer`, `DrawerGroup` and `DrawerFooter` behavior with the `.gsap` class absent (the instant path). The motion builders are tested by asserting the tweens they create on a paused timeline (`tl.getChildren()`, durations and positions), as `nav-marker.test.tsx` does.

---

## 13. ADRs drafted (Accepted 2026-09-27)

| ADR | Decision | Gates | If rejected |
|---|---|---|---|
| **ADR-0009** `docs/adr/0009-animacao-de-altura-no-acordeao-do-menu-mobile.md` | Extend ADR-0007's `height` exception to the drawer accordion's body wrapper only, under the same conditions (user action only, `.gsap` gate, `clearProps`, retarget with no queue, values in `lib/motion.ts`, closed scope). | T012 | T012 is re-planned as a Flip-based sibling translation plus a `clip-path` body reveal (see the ADR's alternatives). That is about 2 more tasks, and it adds the Flip plugin to the lazy chunk. |
| **ADR-0010** `docs/adr/0010-clip-path-como-propriedade-animavel.md` | Amend A§ Animation: `clip-path: inset()` is an allowed paint-only animation property, with conditions. It records the two existing uses (the DDR-0003 marker and the Sobre mí signature), which were never recorded. | T011 (M3, M7) | M3/M7 become a transform-only equivalent (a `scaleY` wrapper with counter-scaled content). That isn't pixel-equivalent to the approved mockup, so it needs a DDR-0006 amendment from the UX Strategist. |

**Why ADR-0009 and not Flip** (spec Note 1): the swap collapses one body and expands another at the same time, inside a scrolling list, retargets on quick double taps, and has to keep the tapped header in view (AC 19, 44). With `height`, the browser's layout gives all of that for free. With Flip, the collapsing body has to stay in the DOM while its siblings are translated, and translated siblings fight the scroll container's `scrollTop` correction. ADR-0007 already rejected `clip-path`/`scaleY` alone for the same "content below jumps" reason. The layout cost is bounded: the panel is `position: fixed`, so layout work stays inside the panel for ≤0.3s per tap.

**Why ADR-0010 is needed at all:** A§ Animation's wording is an allow-list ("Animate `transform` and `opacity`"), and `clip-path` is on neither list. It is paint-only (no layout), so it keeps the rule's intent, but the text doesn't say so. The project has already shipped it twice without a record, and this feature makes it a signature motion. A convention amendment (the ADR-0008 pattern) ends the per-feature ambiguity.

---

## 14. Open questions (none blocks T001–T010)

1. ~~**ADR-0009 and ADR-0010:** approve, amend or reject (§ 13).~~ Resolved: both Accepted on 2026-09-27; T011 and T012 are unblocked.
2. **The initial focus during the unfold vs ADR-0008 condition 2** (§ 7.2): the plan treats the spec-mandated t = 0 focus on "Itineraries" as bounded (opaque by 0.5s) and exempt from the "complete at once" safeguard; later Tab moves do complete reveals. Default: proceed like this. The alternative is to exclude the first header from M4 (it would appear with the unfold instead of rising), which changes approved motion slightly and would need the UX Strategist.
3. **Guard ratchet (optional):** after merge, lower `perf/first-load.json`'s baseline from 178,492 to the new measurement (about 178.1 kB)? It tightens the zero-growth guard. Default: leave it; the user decides.
4. **Group-name size** (§ 0.2): `body-lg font-bold` until the UX Strategist's spec amendment says otherwise.

---

## 15. Convention drift detected (proposals; conventions aren't edited here)

1. **A§ Animation:** `clip-path` as an animatable property. Drafted as ADR-0010, including its amendment text.
2. **A§ Animation / ADR-0008:** clarify that the `focusin` safeguard applies to user-initiated focus. Spec-mandated programmatic focus into a time-bounded, user-triggered sequence (≤0.5s to opaque) is allowed. Want me to draft it?
3. **A§ Performance Budgets:** "Overlays that exist only after a user action (drawers, dialogs, sheets) on a route at ≥98% of its First Load budget ship as a `next/dynamic({ ssr:false })` chunk, prefetched on idle where the trigger is visible, with a loader `catch` that resolves to a no-op component (no `error.tsx` blast radius)." Want me to draft it?
4. **A§ Accessibility (engineering rules):** "A modal disclosure whose trigger stays in the focus cycle uses `inert` on the outside plus two-edge Tab wrapping, not `<dialog>.showModal()`." Want me to draft it?
5. **D§ Motion Principles:** CSS transitions for state changes should sit behind the project's motion gate (`.gsap [data-…] { transition: … }`) when a spec requires "instant without the gate", because reduced-motion media queries alone don't cover the no-gate case. Want me to draft it?
