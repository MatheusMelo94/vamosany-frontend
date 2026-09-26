# Plan: vamosany-front-end — Sobre mí (5 pages + navbar menu) v1.1

- **Status:** **Ready for /tasks (v1.1, UI-only forms).** Nothing blocks the remaining tasks:
  - ADR-0007 is Accepted (2026-09-26).
  - The § 7 tokens were approved and have landed (T006).
  - Security G1 is done (`docs/security/threat-models/2026-09-26_sobre-mi-forms_v1.md`, 0 blocking findings).
  - Still open: G2 (light checklist) before the M3 merge, and T003 (DevOps).
- **Amended:** v1.1, 2026-09-26. See **§ 0 Amendment v1.1**, which supersedes the sections it names.
- **Date:** 2026-09-26 · **Author:** Frontend Architect · **Approver:** Matheus Melo
- **Project / repo:** vamosany-front-end, `/home/agent/repos/vamosany-frontend`, branch `feat/sobre-mi-pages` (created by the Engineer from `main` @ `c3809d2`)
- **Stack check** (`frontend-architecture-conventions.md § Stack Baseline`): Next 15.5.26, React 19.1, TS 5.9, Tailwind 4.1, GSAP 3.15 + `@gsap/react`, zod 4.6, Vitest 5, Playwright 1.63. Deviations already recorded: npm and Vercel (ADR-0005), Node 24 (`.nvmrc`). `msw` and `server-only` are baseline but **not installed**; T001 adds them (baseline, no ADR). Next 15.5.26: no `middleware.ts` in the project; keep patch releases current (`§ Version Notes`).
- **Input:** UX Strategist spec `docs/specs/sobre-mi/spec.md` **v1.1** (commit `d580ec0`, see its Amendment Log), 0 open clarifications. **Confidence: full.**
- **Spec-Kit:** not initialized (no `.specify/`) → files in `docs/specs/sobre-mi/`.
- **Contract:** none needed in this release. The forms are **UI-only** and send nothing (spec v1.1 § Data Dependencies). `contract-request.md` is kept as **future work** for spec § When the Backend Is Connected. All other content is static.
- **Posture:** Production (`docs/security/findings/2026-09-22_production-baseline-review_v1.md`). Security blocks on CRITICAL and HIGH.
- **Decisions of record:** DDR-0002, DDR-0003, DDR-0004 (Accepted 2026-09-26); ADR-0002 (`.gsap` gate), ADR-0003 (headless motion controller), ADR-0006 (landing frozen); **ADR-0007 (Accepted 2026-09-26)**.
- **Tech Design Doc:** `docs/tech-design/sobre-mi.md` (trigger met: several ScrollTriggers per page; 3+ modules; new integration boundary). The component tree, data flow and full motion timeline table live there. This plan records the decisions and their citations.
- **Mockup:** `docs/design/mockups/sobre-mi-cuaderno.html` is the source of truth for layout and motion values; the spec is the contract for copy, states and AC. Where the spec doesn't state a value, the mockup value is used (e.g., the Colaboraciones row body starts at 0.05 s).

---

## 0. Amendment v1.1 (2026-09-26): UI-only forms, and deviations carried from implementation

**Why:** the user took the backend connection out of scope (spec v1.1, `d580ec0`), and Security G1 set R-01..R-07. M0–M2 are implemented (T002, T004–T024); T001 was skipped (see below). This section **supersedes** D5, § 3 (form rows), § 5, § 10 and § 11 where they conflict; those sections are marked accordingly.

### 0.1 Forms: decisions for this release

| # | Decision | Citation |
|---|---|---|
| F1 | **No Server Action, no Route Handler, no `fetch`, no `sendBeacon`** in the feature. The forms are client leaves that validate with zod and show the Not-configured banner on a valid submit. | spec v1.1 § Form States; G1 R-03; `§ Data Fetching & Mutations` (no writes this release) |
| F2 | **No-JS mechanism:** the form area renders two siblings. The form wrapper has `noscript:hidden` and the no-JS block has `hidden noscript:block`, using Tailwind 4's built-in `noscript:` variant = `@media (scripting: none)`. With JS off, the fields are `display:none` (outside the accessibility tree), and the block "Para escribirme, mandame un mail a hola@vamosany.com. Te respondo yo." is shown, with the `mailto:` link at `headline` size. **No `<noscript>` element and no inline style** (no CSP change). | spec v1.1 § Form States (No JS), AC 44; G1 R-01 |
| F3 | **Pre-hydration mechanism**, belt and braces: (a) inputs are **controlled and have no `name` attribute** (`id` + `autoComplete` kept), so no native submit can serialize a value; (b) the `<form>` has **no `action`/`method`**, and its only button renders `type="button"` on the server and on the first client render, becoming `type="submit"` after mount (`useEffect` → `hydrated` state, no hydration mismatch). A tap before hydration does nothing: no navigation, no URL change, no reload. With several fields and no submit button, browsers do no implicit submission on Enter. (c) After hydration, `onSubmit` always calls `preventDefault()`. | G1 R-01; spec AC 44 |
| F4 | **State:** local `useState` in the leaf: `values`, `errors`, `status: "idle" \| "field-errors" \| "not-configured"`, `announceKey`. **No storage APIs** (no localStorage/sessionStorage/IndexedDB/cookies). No `useActionState` (there is no action). | `§ State Management`; G1 R-02 |
| F5 | **Banner:** one `NotConfiguredBanner` above the form, `tabIndex={-1}`, focused after each valid submit, inside `role="status"` (polite). A repeat valid submit re-announces by bumping `announceKey` (the text node is re-mounted), never a second banner. A submit with errors removes it and shows Field error. | spec v1.1 AC 41–42; `§ Accessibility` (live regions) |
| F6 | **Copy in the build:** `features/sobre-mi/content/forms.ts` carries **only this release's strings**. "Enviando…", "¡Recibido!", "No se pudo enviar tu mensaje." and "Uso tu email solo para responderte." live only in the spec (§ When the Backend Is Connected), never in code, so they can't be in any chunk. | spec v1.1 AC 43 |
| F7 | **Visitor text is React text only.** No `dangerouslySetInnerHTML`; SplitText and other DOM-rebuilding helpers never target nodes that contain Visitor input; M8 animates wrappers. | G1 R-06; `frontend-security-conventions.md § Input & Output Handling` |
| F8 | **Form feedback motion (M8, this release: shake + banner entrance; no success)** runs in the **lazy headless controller**, not in the form leaf. The leaf dispatches `CustomEvent`s on its root (`sm:field-errors` with the invalid field ids, `sm:banner`), and the controller's form scene animates the `[data-sm-field]` / `[data-sm-banner]` wrappers inside its `useGSAP` context (`contextSafe` listeners). The form leaf therefore imports no GSAP, and reduced motion / no `.gsap` means no listener, so the banner and errors are simply static. | `§ Animation (GSAP 3)` (useGSAP only); ADR-0002/0003; spec M8 v1.1; G1 R-06 |
| F9 | `msw` and `server-only` are **not added** (T001 skipped): nothing is mocked or server-only in this release. That makes G1 R-07 moot. | G1 R-07 |

Deferred (backend), kept for spec § When the Backend Is Connected: the delivery design in § 5 below, T026, T027 and T031, and `contract-request.md`. Connecting delivery requires a spec amendment, a new plan revision and **threat model v2** (G1 § 6: fail-closed activation with base URL + S2S token, `lib/env.server.ts`, outbound hardening, honeypot, edge rate limit, privacy notice, CI bundle grep).

### 0.2 Deviations from implementation, now binding on M4

| # | What the Engineer did | Consequence for the remaining tasks |
|---|---|---|
| E1 | T006 scoped every hiding rule as `.gsap [data-sm-scene] [data-sm-…]` (`app/globals.css`, after the tokens). A target is hidden only when **both** motion is on **and** the page root carries `data-sm-scene`. | **T032 must add `data-sm-scene="<page>"` to each page root in the same commit that mounts `CuadernoMotion`.** Adding one without the other either does nothing or hides content with no controller to reveal it. The reduced/no-JS e2e in T032 guards this. |
| E2 | T020: `<main>` in the `(cuaderno)` layout is a page-wide named container, `@container/screen`. | Container queries in the M3 form rows and M4 scenes use `@…/screen` for page-level breakpoints; component-level ones keep their own `@container`. Selectors in motion scenes must not assume a `main > section` structure. |
| E3 | `/` First Load JS is **178 / 180 kB** before any M4 code. | **M4 adds no application code to `/`**; webpack runtime growth is capped at 1,000 B (§ 0.3 item 6). |

### 0.3 Zero bytes on `/`: why the lazy approach guarantees it, and the check

`/` pays for code reachable from `app/(marketing)/page.tsx` and the root layout, including `Navbar` (client) and `HeroRing` (client, which imports `lib/gsap` and `lib/motion`). M4 is designed so that nothing it adds is reachable from that graph:

1. The controller and all scenes are imported only by `features/sobre-mi/components/cuaderno-motion.tsx` through `next/dynamic({ ssr:false })`, and `CuadernoMotion` is imported only by the five Sobre mí page components. `/` never imports it.
2. **M4 does not edit `components/layout/navbar.tsx`, `nav-config.ts`, `lib/gsap.ts`, `lib/gsap-ease.ts`, `lib/motion.ts`, `lib/utils.ts` or `app/layout.tsx`**, the modules `/` ships. All M4 values already exist (T005). If a scene needs a value that doesn't exist, the Engineer stops and routes it to the Architect; it does not add it to `lib/motion.ts`.
3. **Reading bar (T036), changed from v1:** the navbar is **not** edited. The Colaboraciones scene creates `<span aria-hidden data-reading-bar>` and appends it to `[data-nav] .nav-capsule` at runtime, inside its `useGSAP` context, removing it on revert. It exists only on `/colaboraciones` with motion on, and the existing `[data-reading-bar]` CSS still applies.
4. The form leaves import no GSAP (F8).
5. **Check (T043, new, before T032):** a script, `scripts/check-first-load.mjs`, reads the `next build` output manifests and computes the gzip First Load JS of `/`. It fails if the value is above the committed baseline in `perf/first-load.json` (`{ "/": <bytes measured on this branch before M4> }`) by more than 0 bytes, or above 180 kB. It runs in `ci.yml` after `npm run build`, and every M4 commit body quotes its output.
6. **Amendment 2026-09-26 (coordinator decision, measured during T032):** adding any `next/dynamic` chunk anywhere in the app grows webpack's shared runtime (its chunk map) and regroups shared chunks, which `/` also loads: +206 B with the controller reduced to `return null`, +0 B with no lazy import. That growth is not application code reachable from `/`, so point 1 still holds. The guard therefore allows a **runtime allowance of at most 1,000 B** over the pre-M4 baseline for all of M4 combined. The 180 kB budget is unchanged, and point 2 (no edits to modules `/` ships) stays binding. If M4 needs more than 1,000 B, the Engineer stops and reports.

---

## 1. Decisions at a glance

| # | Decision | Citation |
|---|---|---|
| D1 | Routes `/sobre-mi`, `/colaboraciones`, `/trabaja-conmigo`, `/contacto`, `/preguntas-frecuentes` in a nested route group `app/(marketing)/(cuaderno)/`, whose layout renders Navbar + `<main lang="es" id="contenido">` + Footer. The landing's `app/(marketing)/page.tsx` is **not touched**. | `§ App Router Layout`, `§ Routing, Layouts & Boundaries`; spec § Locale Behavior |
| D2 | All pages are static Server Components. Content is typed TS/TSX modules in `features/sobre-mi/content/` (no MDX: it would add a dependency and a pipeline; TSX handles the inline links). | `§ Component Model`, `§ Data Fetching & Mutations` (no reads) |
| D3 | One template (`PageHeader`, `NotesLayout`, `ClosingRow`) plus a small block set. Client leaves: the two forms, `FaqDeepLink`, `CuadernoMotion` (dynamic), `NavMarker` (dynamic). | `§ Component Model`; ADR-0003 criterion (own state → leaf; static choreography → controller) |
| D4 | Motion: a new **headless controller** per page (ADR-0003 pattern, scenes split by file), `.gsap` gate (ADR-0002), all values in `lib/motion.ts`. | `§ Animation (GSAP 3)`; DDR-0004; TDD § 4 |
| D5 | **Superseded by § 0.1 F1–F9 (v1.1, UI-only).** ~~Forms: one Server Action per form → `lib/api/forms.ts` (`server-only`) → `POST` to `FORMS_API_BASE_URL`. Unset → Failed/not-configured with no request. Result unions, never thrown.~~ Deferred (backend). | `§ Data Fetching & Mutations`, `§ Forms & Validation`, `§ Error Handling`, `§ Configuration & Environment` |
| D6 | Navbar: characterize its current pixels first; then the label/IA change (DDR-0002), then the marker (DDR-0003) as a dynamically loaded node that exists only inside an open desktop panel. The closed navbar at 360/768 stays pixel-identical; at 1280 only the label changes. | ADR-0006 § 2–3, § 6; DDR-0002, DDR-0003 |
| D7 | Signature "Belén": **real italic**. A second `next/font` instance, `Courier_Prime({ weight: "400", style: "italic", preload: false })`, declared in `features/sobre-mi/fonts.ts` and applied only to `Signature`. About 20 KB, fetched only on `/sobre-mi` and only when the signature renders. No change to the root layout or the landing. | `§ Performance Budgets` (`next/font`); spec § Token Proposals 2 (UX prefers real italic) |
| D8 | FAQ: native `<details>/<summary>` server-rendered; the animated toggle is a controller scene gated by `.gsap` (ADR-0007); deep links are handled by an always-on `FaqDeepLink` leaf. | spec M7, AC 47–49; ADR-0007 |
| D9 | i18n: Spanish-only pages at unprefixed Spanish slugs; `<main lang="es">`; no `hreflang`. **Follow-up ADR "i18n routing"** (prefix vs localized slugs, redirects for these slugs, a working switcher). Not blocking. | spec § Locale Behavior; constitution § Language(s) |

---

## 2. Component tree (server/client boundary)

`[S]` Server Component · `[C]` `'use client'` · `[C·dyn]` client via `next/dynamic({ ssr:false })`, not in First Load JS.

```
app/(marketing)/(cuaderno)/layout.tsx                         [S]
├─ Navbar                              components/layout/navbar.tsx          [C]  existing; + usePathname, aria-current, drawer dot, reading-bar slot
│  └─ NavMarker                        components/layout/nav-marker.tsx      [C·dyn]  rendered inside an open desktop panel only
├─ <main lang="es" id="contenido">
│  └─ app/(marketing)/(cuaderno)/{sobre-mi,colaboraciones,trabaja-conmigo,contacto,preguntas-frecuentes}/page.tsx   [S] metadata + one feature component
│     └─ features/sobre-mi/components/
│        ├─ sobre-mi-page.tsx | colaboraciones-page.tsx | trabaja-conmigo-page.tsx | contacto-page.tsx | faq-page.tsx   [S]
│        ├─ cuaderno-motion.tsx        [C]  → motion/cuaderno-scroll-effects.tsx [C·dyn] (headless, returns null)
│        ├─ page-header.tsx            [S]  label · H1 (sr-only name + aria-hidden split target with train) · dek
│        ├─ notes-layout.tsx           [S]  @container; notes 200px + main (≥ gutter bp), stacked below
│        ├─ closing-row.tsx            [S]  headline + Button primary/secondary between 2px ink rules
│        ├─ prose.tsx, pull-line.tsx, photo-figure.tsx (next/image), signature.tsx, timeline.tsx     [S]  Sobre mí
│        ├─ product-ledger.tsx         [S]  Colaboraciones
│        ├─ audience-rows.tsx          [S]  Trabajá conmigo
│        ├─ channel-list.tsx           [S]  Contacto
│        ├─ faq-group.tsx, faq-item.tsx [S] ; faq-deep-link.tsx [C]
│        ├─ external-link.tsx          [S]  target=_blank, rel, sr-only "(se abre en otra pestaña)", aria-hidden "↗"
│        └─ forms/
│           ├─ contact-form.tsx        [C]  useActionState(sendContactMessage)
│           ├─ collaboration-form.tsx  [C]  useActionState(sendCollaborationRequest)
│           └─ form-field.tsx, select-field.tsx, submit-row.tsx, form-banner.tsx, form-success.tsx   (imported by the [C] forms → client)
└─ Footer                              components/layout/footer.tsx          [S]  unchanged (frozen; already credits the subway photo)
```

Props that cross into client components: the Server Action reference, and plain-string copy/option arrays from the content modules. No functions other than actions, no Dates, no class instances (`§ Component Model`).

---

## 3. Routes & states (every screen × every state → file → task)

No route fetches data, so there is no `loading.tsx` or route `error.tsx`. The spec says "no skeleton (static)", and render failures go to the existing `app/global-error.tsx` and unknown routes to `app/not-found.tsx` (`§ Routing, Layouts & Boundaries`: loading/error are required only on routes that fetch).

| Screen | State | Where it lives | Task |
|---|---|---|---|
| All 5 pages | Success (static) | `features/sobre-mi/components/*-page.tsx` + content modules | T016–T023 |
| All 5 pages | Loading (images) | `PhotoFigure`: 3:2 box, `bg-surface-2`, `next/image fill` + `sizes` | T017 |
| All 5 pages | Partial (image fails) | same box stays with its fill; `alt` present | T017 |
| All 5 pages | Error: unknown route / render failure | existing `app/not-found.tsx` / `app/global-error.tsx` (no change) | covered by existing `tests/e2e/not-found.spec.ts` |
| Navbar | open/closed, marker, current page | `components/layout/navbar.tsx`, `nav-config.ts`, `nav-marker.tsx` | T007–T011 |
| FAQ | all closed on load / hash opens / unknown hash | `faq-item.tsx` (native), `faq-deep-link.tsx` | T021, T022 |
| Contacto + Trabajá forms (**v1.1: states are Idle, Field error, Not configured, No JS, Before hydration**; see § 0.1; Submitting/Success/Failed rows below are Deferred) | Idle | `forms/*-form.tsx` initial state `{ status: "idle" }` | T029, T030 |
| | Field error (client or server 422) | `form-field.tsx` (`aria-invalid`, `aria-describedby`, "!" badge, inset 3px `brand` bar) | T028–T030 |
| | Submitting | `submit-row.tsx` (`isPending`: "Enviando…", min-w 220px kept, `disabled`, `aria-busy`); fields `readOnly` + `bg-surface-1 text-ink-muted` | T028–T030 |
| | Success | `form-success.tsx` replaces the form in place; H2 `tabIndex={-1}` focused; `aria-live="polite"` wrapper | T028–T030 |
| | Failed (unavailable / not-configured) | `form-banner.tsx` `role="alert"` above the form; button "Probar de nuevo"; values kept | T028–T031 |

---

## 4. Data reads

None at runtime (`§ Data Fetching & Mutations`). The content is compiled in:

| Module | Content | Notes |
|---|---|---|
| `features/sobre-mi/content/metadata.ts` | `<title>` + description per route | spec § Page metadata |
| `features/sobre-mi/content/nav.ts` | the 5 menu items (title, blurb, href, column) | consumed by `components/layout/nav-config.ts` (the single source for menu and drawer) |
| `features/sobre-mi/content/{sobre-mi,colaboraciones,trabaja-conmigo,contacto,faq}.tsx` | label, H1, dek, notes, body blocks, closing row | `.tsx` where a paragraph has inline links or bold; `as const` data otherwise |
| `features/sobre-mi/content/forms.ts` | labels, options (slug → label), helper, errors, banners, success copy | the same strings are used by the zod schemas |

**Verbatim oracle (AC 12):** T013 commits the content file (currently untracked in `tempcontentabout/`) as `docs/content/sobre-mi-source.md`, unchanged. A Vitest helper normalizes the markdown (drops `**`, `*`, `\` escapes and link syntax), and every `[md]` string in the content modules must be a substring of it. The **documented exceptions** come from the spec: Contacto brackets removed (Resolved Clarification 1); the years in parentheses moved out of two H2 titles (spec § Page 2); the Efe Hus quote's quote marks (see § 14 Q1).

---

## 5. Data writes

> **v1.1: no writes in this release** (§ 0.1 F1). Everything below is **Deferred (backend)** and kept for spec § When the Backend Is Connected. Revisit with threat model v2 (G1 § 6). Still valid in this release: the **Schemas** paragraph (client-only use) and the `FIELD_LIMITS` / `maxLength` rule.

| Action | File | Input schema | Delivery | Revalidation | Optimistic |
|---|---|---|---|---|---|
| `sendContactMessage(prev, formData)` | `features/sobre-mi/actions.ts` | `contactSchema` (`features/sobre-mi/schemas.ts`) | `POST {FORMS_API_BASE_URL}/v1/contact-messages` | none (nothing reads it) | **No**. Success only on 2xx (spec) |
| `sendCollaborationRequest(prev, formData)` | same | `collaborationSchema` | `POST {FORMS_API_BASE_URL}/v1/collaboration-requests` | none | **No** |

**Schemas** (zod 4, one per form, shared by client and server; `§ Forms & Validation`):
- `name`: trim, min 1 → "Falta tu nombre."; `maxLength` 100.
- `email`: trim, min 1 → "Falta tu email para poder responderte."; then `z.email()` → "Revisá tu email, parece que le falta algo."; max 254.
- `topic` / `collaborationType`: enum of slugs; `""` → the spec's select error.
- `travelDate`: optional; `""` → `null`; max 60.
- `message` / `idea`: trim, min 1 → the spec's copy; max 5000.
- `company`: min 1 → "Falta el nombre de tu empresa o marca."; max 120.
- Max lengths are enforced with HTML `maxLength` on the inputs, so no over-length error is reachable from the UI. Server-side over-length (only possible by bypassing the UI) → Failed/unavailable. See § 14 Q2.

**Result union** (`features/sobre-mi/types.ts`), never thrown (`§ Error Handling`):
```ts
type FormState<F extends string> =
  | { status: "idle" }
  | { status: "success"; email: string }
  | { status: "field-errors"; errors: Partial<Record<F, string>>; values: Record<F, string> }
  | { status: "failed"; reason: "unavailable" | "not-configured"; values: Record<F, string> };
```

**Delivery client** (`lib/api/forms.ts`, `import "server-only"`): reads `env.server.FORMS_API_BASE_URL` / `FORMS_API_TIMEOUT_MS` (default 8000) and sends one `fetch` with `AbortSignal.timeout`, `cache: "no-store"` and an `Idempotency-Key`. It maps responses to `{ ok: true } | { ok: false; reason: "not-configured" | "unavailable" } | { ok: false; reason: "invalid"; fieldErrors }` through `lib/api/errors.ts` (`AppError`: `code`, `status`, `requestId`). It parses the 422 body with `lib/api/schemas/forms.ts`. It logs one server line per failure (status, requestId, **no payload**). The UI never branches on raw status codes (`§ Error Handling`).

**Auth:** public forms, no session. There is no DAL check because there is no user data to authorize (`§ Authentication & Session` covers user data). Abuse controls go to Security (§ 10).

**Env** (`lib/env.ts`, `§ Configuration & Environment`): split into `client` (existing `NEXT_PUBLIC_SITE_URL`) and `server` (`FORMS_API_BASE_URL: z.url().optional()`, `FORMS_API_TIMEOUT_MS: z.coerce.number().int().positive().default(8000)`). `.env.example` documents both as server-only, unset in prod until the backend exists. DevOps registers them in the Vercel Preview and Production scopes, left unset. `lib/api/forms.ts` is the only reader of the server keys.

**Pre-Contract mock:** see `contract-request.md` § Mock. Vitest uses MSW (`tests/fixtures/msw/`). Playwright uses `tests/fixtures/delivery/mock-server.ts` as a second `webServer` on port 3199, because the action's `fetch` runs in the Next server and `page.route()` can't see it. A third `webServer` (`next start -p 3101` **without** the env var) covers AC 44's not-configured path end to end.

---

## 6. State decisions (`§ State Management`)

| Screen | State | Level |
|---|---|---|
| Navbar | open panel, drawer, language (existing) | local (existing) |
| Navbar | current page | derived from `usePathname()`, not stored |
| FAQ | which questions are open | DOM (`details.open`); deep link from `location.hash` (URL). No React state |
| Forms | form status, errors, echoed values | `useActionState` (server-returned) plus local client-validation errors in the form leaf |
| Motion | none in React | DOM + GSAP context |

No context, no store.

---

## 7. Styling & tokens (`§ Styling (Tailwind CSS 4)`; `design-conventions.md § Design Tokens`)

Existing tokens and utilities cover color, radius, display type, `body-lg`, `caption`, `highlight-heading`, `container-ds`, `--duration-*`, `--ease-default`, `--text-label-sm` (13px mono). Layout widths on the 4px scale are plain utilities: notes column `w-50` (200px), prose `max-w-190` (760px), 40px gap `gap-10`.

**Token additions — approved by the user on 2026-09-26** (values from the approved mockup; the spec's "no new type tokens" line did not account for them; UX Strategist informed via this plan):

| Proposed token | Value | Used by | Why a token |
|---|---|---|---|
| `@utility body-prose` | Arial 1.0625rem / 1.7 | Prose paragraphs (spec § Shared Page Structure: "17px / 1.7") | no existing step is 17/1.7 |
| `@utility display-pull` | display, 700, uppercase, `clamp(1.375rem, 3.4cqi, 2rem)`, lh 1.2, ls .02em | Pull lines (Sobre mí, Efe Hus quote) | new display step |
| `--container-gutter: 53.75rem` | 860px | `NotesLayout`, FAQ groups, ledger (Tailwind 4 container variant `@gutter:`) | container-query breakpoint used 4× |
| `--container-rows: 47.5rem` | 760px | Audience rows two-column | spec breakpoint |
| `--container-fields: 35rem` | 560px | Form rows two-column | spec breakpoint |
| `--container-timeline-sm: 32.5rem` | 520px | Timeline tag drops under the line | mockup breakpoint |

If declined, the fallback is arbitrary values with a justification comment per use (`§ Styling`). T006 adds whatever is approved under a `style:` commit.

**New CSS in `globals.css`** (T006; new selectors only, the landing rules are untouched): `.gsap [data-sm-heading], .gsap [data-sm-reveal], .gsap [data-sm-notes] > *, … { opacity: 0 }`; `.gsap [data-sm-train], .gsap [data-sm-sweep] { --train: 100% }`; `[data-reading-bar] { display: none } .gsap [data-reading-bar] { display: block; transform: scaleX(0) }`; `.gsap [data-sm-signature] { clip-path: inset(0 100% 0 0) }`; `.gsap [data-sm-rail] { transform: scaleY(0) }`; `.gsap [data-sm-rule] { transform: scaleX(0) }`; `[data-sm-anchor] { scroll-margin-top: … }` (navbar height + gap, on the 4px scale: `scroll-mt-24`).

**Responsive** (spec § Responsive Behavior): mobile-first. Padding comes from `container-ds` (20px, 32px from 768). Components that depend on their slot use `@container` (NotesLayout, rows, ledger, timeline, form rows, FAQ groups); the navbar keeps its viewport `lg:` breakpoint. Minimum widths: 360 (checked at 320 for no horizontal scroll).

---

## 8. Motion strategy (`§ Animation (GSAP 3)`; `design-conventions.md § Motion Principles`; DDR-0003/0004)

Full timeline and trigger table: `docs/tech-design/sobre-mi.md` § 4. Decisions:

1. **Controller:** `features/sobre-mi/motion/cuaderno-scroll-effects.tsx`, one `useGSAP(() => …, { dependencies: [] })`. It returns early when `!motionEnabled()`, runs `entrance` and `reveals`, then the scenes whose root attribute is present on the page (`[data-sm-scene="sobre-mi"]`, …). Scenes are pure functions in `motion/scenes/{entrance,reveals,sobre-mi,colaboraciones,trabaja-conmigo,contacto,faq,nav-scrolled}.ts`. The attribute contract is typed in `motion/attributes.ts` (`SM_ATTR`, `smSel()`), as ADR-0003 condition 3 requires. The controller is mounted per page by the page component (not the layout), so client navigation between these pages remounts and reverts it.
2. **Gate:** `motionEnabled()` moves to `lib/gsap.ts` (ADR-0002 condition 2 already asks for this), re-exported from `features/landing/motion/attributes.ts` so the landing's imports don't change (Render-Preserving, T004).
3. **Eases:** `lib/gsap-ease.ts` gets `CustomEase` + `getEases()`; `lib/gsap-text.ts` re-exports them and keeps `SplitText`. Landing behavior is identical (T004).
4. **New `lib/motion.ts` entries** (additions only; existing values are frozen by ADR-0006. A test pins the existing keys and values):
   - `MOTION.page = { dekOffset: "-=0.85", count: { at: 0.1, ease: "power2.out" }, notes: { y: 12, duration: 0.4, stagger: 0.06 }, closing: { y: 14, duration: 0.4, stagger: 0.08 }, formFields: { y: 16, duration: 0.4, stagger: 0.07 } }`
   - `MOTION.menuMarker = { pill: 0.55, dot: 0.75, stretchMax: 2.6, stretchDivisor: 160, squash: 0.8, stretchEase: "power1.inOut", dotOffset: { right: 24, top: 15 } }`
   - `MOTION.sobreMi = { parallax: { scaleFrom: 1.18, scaleTo: 1.04, yPercent: 6, scrub: 0.4 }, signature: { duration: 1.2, start: "top 92%", ease: "power2.inOut" }, rail: { start: "top 80%", end: "bottom 55%", scrub: 0.4 }, timelineRows: { x: -14, duration: 0.4, stagger: 0.1 } }`
   - `MOTION.colaboraciones = { readingBar: { start: "top 70%", end: "bottom 60%", scrub: 0.3 }, yearTick: { duration: 0.6, start: "top 82%", firstFrom: 2021 }, yearFade: { duration: 0.3 }, partner: { x: -10, duration: 0.4, at: 0.1 }, body: { y: 18, duration: 0.45, stagger: 0.06, at: 0.05 } }`
   - `MOTION.trabajaConmigo = { rule: { duration: 0.6, start: "top 90%" }, text: { y: 14, duration: 0.4, stagger: 0.08, offset: "-=0.35" } }`
   - `MOTION.contacto = { channels: { x: -14, duration: 0.4, stagger: 0.09, delay: 0.9 } }`
   - `MOTION.faq = { rows: { y: 12, duration: 0.35, stagger: 0.05 }, open: { duration: 0.4, content: { y: 8, duration: 0.35, delay: 0.08 } }, close: { duration: 0.3, ease: "power2.inOut" } }`
   - `MOTION.form = { shake: { x: [0, -7, 7, -4, 4, 0], duration: 0.4 }, banner: { y: -8, duration: 0.35 }, success: { sweepDelay: 0.1, lines: { y: 12, duration: 0.4, stagger: 0.08, delay: 0.25 } } }`
   - Reused as is: `MOTION.heading.{eyebrow,lines,sweep}`, `MOTION.reveal`, `MOTION.sweep`, `MOTION.trigger.{reveal,sweep}`, `MOTION.count.duration`, `MOTION.nav`, `EASE.ds`, `EASE.arrive`.
5. **H1 split (M1):** SplitText `type: "words", mask: "words", aria: "none"` on the `aria-hidden` visual copy; the `sr-only` copy holds the accessible name at every moment (AC 14, spec § Accessibility "H1 split"). `split.revert()` on complete, so the H1 is one text run and the train is one band (AC 15). The split waits for `document.fonts.ready`, as on the landing.
6. **Counters and years:** an `aria-hidden` animated twin plus an `sr-only` final value; server HTML shows final values, so reduced motion and no-JS are correct with no code (AC 21, 29).
7. **Navbar marker (M9):** `NavMarker` renders two `aria-hidden` nodes inside the panel: a panel-sized `bg-surface-1` layer and the dot. The highlight moves by tweening `clip-path: inset(t r b l round var(--radius-xl))`. The dot tweens `x/y` plus `keyframes` `scaleX/scaleY`. **No `width`/`height` tweens**: the mockup's `moveMarker()` animates width/height, which `§ Animation` forbids; `clip-path` gives the same pixels and is a spec-listed property. Behaviors: current-route placement with no travel on open; fade in on first hover or focus otherwise; return to the current item on `pointerleave` of the item list; retarget mid-flight with `overwrite: "auto"`; `motionEnabled() === false` → `gsap.set` (jump). Items keep `hover:bg-surface-1` until the marker mounts; then `data-marker-ready` on the panel turns the per-item hover background off (no-JS and pre-hydration keep today's hover).
8. **Reading bar (M4):** `Navbar` renders `<span aria-hidden data-reading-bar>` inside the capsule only when `pathname === "/colaboraciones"` (constant `READING_BAR_ROUTES` in `nav-config.ts`). The CSS keeps it `display:none` unless `.gsap`. The Colaboraciones scene scrubs `scaleX`. The landing DOM is unchanged.
9. **Nav `is-scrolled`:** the landing controller adds `.is-scrolled` to `[data-nav]`. The Sobre mí pages don't mount it, so scene `nav-scrolled.ts` replicates it with `MOTION.nav.start` (the navbar behaves "unchanged from today", spec § Screens).
10. **FAQ toggle (M7):** under `.gsap` the FAQ scene intercepts `summary` clicks (`preventDefault`) and tweens the answer wrapper's `height` (**ADR-0007, Proposed**). The "+"→"×" glyph uses a CSS transition (`motion-safe:`) keyed on `details[open]:not([data-closing])`. Without `.gsap`, the native toggle is instant (AC 47 reduced, AC 49).
11. **Form feedback (M8):** inside each form leaf, `useGSAP({ scope: formRef })` + `contextSafe`: shake only on a submit that produced errors, banner entrance, success train and lines. It checks `motionEnabled()`; reduced → no shake, and the static banner and success are shown immediately.
12. **Budgets:** nothing loops; nothing blocks input (every tween is non-blocking; forms are never disabled by motion); CLS: only transform, opacity, clip-path and background-position, plus the ADR-0007 height exception on user action.

---

## 9. Accessibility mechanics (`§ Accessibility (engineering rules)`; spec § Accessibility Acceptance)

| Need | Mechanism | AC |
|---|---|---|
| Language | `<main lang="es">` in the `(cuaderno)` layout; the Efe Hus quote `<p lang="en">` | 14 |
| Outline | one H1 in `PageHeader`; H2s per spec; landmarks from the layout (header/nav in Navbar, main, footer) | 14 |
| H1 name stable | `sr-only` text + `aria-hidden` split copy | 14, 15 |
| Menu keyboard | **Disclosure pattern fix:** the panel is rendered in DOM order right after its trigger (inside the trigger's `<li>`; the positioning context is still the capsule, so the pixels are identical). Trigger gets `aria-controls`. Esc closes and returns focus to the trigger (per-trigger ref map). `NavMarker` follows `focusin`. | 4, 10 |
| Current page | `aria-current="page"` on the matching item (mega-menu + drawer); static 6px `bg-brand` dot in the drawer | 5, 9 |
| Decorative motion | train spans, marker nodes, rail, reading bar, rules, "+"/"×", "↗" all `aria-hidden` | spec § A11y |
| External links | `ExternalLink`: `target="_blank" rel="noopener noreferrer"` + `sr-only` "(se abre en otra pestaña)" | 28 |
| Forms | visible `<label htmlFor>`; "(opcional)" inside the label; `aria-invalid` + `aria-describedby` → error `id`; focus the first invalid field after client validation **and** after a server `field-errors` result; submit `aria-busy` + `disabled` while `isPending`; success H2 `tabIndex={-1}` focused inside `aria-live="polite"`; Failed banner `role="alert"`, focus stays on the retry button | 37–45 |
| FAQ | native disclosure; opening doesn't move focus; `scroll-margin-top` on group and question anchors so deep links and focus clear the sticky navbar | 47–49; WCAG 2.4.11 |
| Targets | menu items, summaries, buttons, contact links `min-h-11` (44px) on coarse pointers (`pointer-coarse:` variant) | spec § A11y |
| Automated | axe on every page (idle, 360 and 1280) and on every form state | 20, 45 |

---

## 10. Security surfaces (`frontend-security-conventions.md § Next.js Surface Map`)

> **v1.1:** G1 is done (`docs/security/threat-models/2026-09-26_sobre-mi-forms_v1.md`; 0 blocking; R-01 MEDIUM, R-02..R-07 LOW, R-08 INFO). In this release the surfaces are **client only**: form leaves (R-01, R-02, R-06), FaqDeepLink (R-04), ExternalLink (R-05); Server Actions and Route Handlers **must stay absent** (R-03). The table below is the original (delivery) analysis, kept for v2 of the threat model. G2 runs at light depth (tasks.md G2).

| Surface | Touch | Controls planned | Open for Security (gate G1) |
|---|---|---|---|
| Server Actions `sendContactMessage`, `sendCollaborationRequest` | 2 new public POST endpoints | zod parse (unknown keys stripped); result union with no internals; no payload logging; `maxLength` + zod max; echoed values rendered as text only; `server-only` delivery module | **rate limit** (default: public forms 10/IP/h), **bot protection** (Turnstile would add a third-party script and a CSP change → build-vs-buy), honeypot; whether bot/rate controls may wait until `FORMS_API_BASE_URL` is set (no delivery happens while it's unset) |
| Outbound request (SSRF-shaped) | action → `FORMS_API_BASE_URL` | URL only from server env (never from input); fixed paths; timeout | server-to-server auth (`FORMS_API_TOKEN`?), see contract-request Ask 3 |
| Environment | new server-only vars | `lib/env.ts` server schema; not `NEXT_PUBLIC_`; CI bundle grep | confirm the CI grep covers `FORMS_` |
| Client components | forms, FaqDeepLink, NavMarker | no `dangerouslySetInnerHTML`; `location.hash` only used as a lookup key against known ids (`CSS.escape`, `getElementById`), never injected | — |
| `next.config.ts` / CSP | none | Server Actions are same-origin (`form-action 'self'`, `connect-src 'self'` already allow them) | a CSP change only if Turnstile is chosen |
| PII | name, email, free text | not logged, not stored by the frontend; the success copy shows the typed email as text | retention and "used only to reply" promise (spec § Data Dependencies) |

Gates: **G1** Security pre-implementation review (threat model) before T027. **G2** Security code review of the form surfaces before the M3 merge. Whatever Security requires becomes new tasks; this plan does not decide the controls.

---

## 11. Performance (`§ Performance Budgets`)

| Route | Expected First Load JS impact | Notes |
|---|---|---|
| `/` (landing) | **Measured 178 / 180 kB after M0–M2. M4 adds no app code; runtime allowance ≤ 1,000 B** (§ 0.3 item 6) | Guarded by T043 (`scripts/check-first-load.mjs`, budget file `perf/first-load.json`) |
| `/sobre-mi`, `/colaboraciones`, `/preguntas-frecuentes` | shared chunk + Navbar + `CuadernoMotion` wrapper (the controller, ScrollTrigger, SplitText and CustomEase are dynamic) + `FaqDeepLink` (tiny) | Well under 180 kB |
| `/contacto`, `/trabaja-conmigo` | + form leaf + zod (client validation). **v1.1: no GSAP in the form leaf** (M8 is in the lazy controller, § 0.1 F8) | Measure in T029. If > 180 kB, use `zod/mini` for the client schema (Architect call with the numbers) |

- Images: `how-subway.webp` via `next/image` (`fill`, `sizes="(min-width: 1280px) 760px, 100vw"`), not `priority` (below the fold).
- Fonts: D7 italic has `preload: false`, so it's fetched only on `/sobre-mi`.
- **LCP risk:** the H1 starts hidden under `.gsap` until the dynamic controller and `document.fonts.ready` (the same trade-off as the landing hero). T041 measures LCP at 360 on the preview. Threshold 2.5 s; mitigation options are in TDD § 5.
- CLS: 3:2 image boxes, no layout-affecting tweens (except ADR-0007), fonts `display: swap` with the existing metric fallback.

---

## 12. Landing freeze: navbar pixel strategy and exact snapshot impact (ADR-0006, DDR-0002/0003, AC 51)

**Fact check.** The committed baseline (`tests/e2e/landing.spec.ts-snapshots/`) has 18 PNGs: `idle-motion`, `scrolled-25`, `scrolled-50`, `scrolled-75`, `scrolled-100` and `full-reduced-motion`, for each of `phone-360`, `tablet-768` and `desktop-1280`. **The "mega menu open", "drawer open" and "language menu" snapshots that ADR-0006 § 2 lists do not exist**, so the navbar's open states have no oracle today. The sticky navbar appears in every one of the 18 files.

**Strategy.**
1. **Characterize first (T002, before any navbar code):** a new `tests/e2e/navbar.spec.ts` on unchanged code captures clipped `header[data-nav]` snapshots: closed at 360/768/1280; each of the 5 panels open at 1280 with the pointer parked on its trigger (no item hovered); drawer open at 360 and 768 (top, and scrolled to the last group); language menu open at 1280. The baseline is generated by the CI bot (`update-snapshots` label) and committed. From then on, navbar changes are diffed at header level (much stricter than the page-level `maxDiffPixelRatio: 0.01`).
2. **Closed navbar identity:** no new DOM exists in the closed state. The marker lives in the open panel; the reading bar renders only on `/colaboraciones`; the disclosure DOM-order fix only moves the panel node when it's open, and its positioning context is still the capsule. At **360 and 768** the triggers are hidden (`lg:flex`), so the closed navbar must be **diff 0** there. At **1280** the only change is the trigger label "About" → "Sobre mí", which is wider and shifts the right-hand group left (`justify-between`).
3. **Landing snapshots that must be regenerated (allowed by DDR-0002; cite it in the commit):** exactly these 6 files, all desktop:
   - `idle-motion-desktop-1280-linux.png`
   - `scrolled-25-desktop-1280-linux.png`, `scrolled-50-desktop-1280-linux.png`, `scrolled-75-desktop-1280-linux.png`, `scrolled-100-desktop-1280-linux.png`
   - `full-reduced-motion-desktop-1280-linux.png`

   The 12 `phone-360` and `tablet-768` landing files must stay **unchanged**. A change in any of them is BLOCKING (ADR-0006 § 3).
4. **Why a scoped update is needed:** the label change is probably below the 1% page tolerance, so `--update-snapshots` (changed mode) may **not** rewrite those 6 files, and the baseline would silently keep showing "About". T003 (DevOps) adds a label `update-snapshots-desktop` that runs `npx playwright test --project=desktop-1280 --update-snapshots=all`. The Reviewer checks that the bot commit touches only the allowed files.
5. **Navbar characterization snapshots expected to change** (DDR-0002/0003): `navbar-closed-desktop-1280`, `navbar-panel-about→sobre-mi-desktop-1280` (renamed to the new label), `drawer-last-group-{phone-360,tablet-768}`. Expected diff 0: `navbar-closed-{phone-360,tablet-768}`, panels Itineraries/Guides/Blog/Services with no hover, `drawer-top-*`, `language-menu-desktop-1280`. If reserving room for the dot changes the Itineraries or Services panels (tag or price rows), that is allowed by DDR-0003 but must be named in the commit body.
6. New snapshots added (not regressions): marker hover states, the five new pages (idle, scrolled, reduced × 3 viewports), form states.

---

## 13. Delivery shape

42 tasks in 6 milestones (`tasks.md`), executed in numeric order on `feat/sobre-mi-pages`, plus two Security gates (G1, G2). This is well over the ~12-task threshold, so I recommend **splitting the merge into PRs by milestone**:

| PR | Milestones | Why this cut |
|---|---|---|
| 1 | M0 (foundations, characterization baseline) | Render-preserving; landing diff 0 |
| 2 | M1 + M2 (navbar + 5 static pages) | The menu must not link to routes that don't exist yet; this is the only PR that regenerates landing snapshots (the 6 desktop files) |
| 3 | M3 (UI-only forms) | Gated by Security G2 (light). G1 is done. No contract |
| 4 | M4 (motion) | DDR-0004; ADR-0007 Accepted; T043 guard first (≤ 1,000 B runtime allowance on `/`) |
| 5 | M5 (baselines, perf, QA handoff) | Closes the feature |

If the user prefers a single PR, the same order still applies.

---

## 14. Open questions (none block /tasks)

| # | Question | Owner | Default if unanswered |
|---|---|---|---|
| Q1 | The Efe Hus quote: the content file has straight quotes `"…"`, the spec shows curly `“…”`. AC 12 says "character for character" with the file. | UX Strategist / user | Curly quotes (spec text), listed as a documented exception in the verbatim oracle |
| Q2 | *(v1.1: resolved by design. `maxLength` makes it unreachable, and there is no server.)* No copy exists for over-length input; the plan makes it unreachable (`maxLength`) and maps a server `too_long` to Failed. | UX Strategist | As planned |
| Q3 | Token additions in § 7 | user | **Resolved:** approved and landed in T006 | **Resolved 2026-09-26: approved as tokens.**
| Q4 | Rate limit, bot protection, honeypot and server-to-server auth for the forms | Security + backend | **Deferred (backend):** G1 § 6 lists the requirements for the connected release |
| Q5 | i18n routing ADR (prefix vs localized slugs; redirects for these 5 slugs; switcher) | Architect (follow-up) | Spanish slugs unprefixed, as shipped |
| Q6 | ADR-0006 § 2 lists menu/drawer/language snapshots that were never committed | user | T002 creates them; the ADR text is not edited (it's Accepted and immutable). Noted here and in drift |

---

## 15. Convention drift detected (proposals; nothing edited)

1. **`frontend-qa-conventions.md § Framework Defaults / § Test Data Fixtures`:** there is no pattern for E2E of a Server Action that calls an external HTTP API (`page.route()` can't intercept it). Proposed: "mock HTTP server as a Playwright `webServer`, fed by the same scenario resolver as the MSW handlers".
2. **`frontend-architecture-conventions.md § Animation`:** ADR-0003's headless controller is now used by a second feature. Proposed: promote "headless controller for static content pages, scenes split by file, typed attribute contract" into the convention, with ADR-0003 as rationale.
3. **`§ Animation`:** add "highlight/marker that resizes → `clip-path: inset()` on a container-sized layer, not width/height".
4. **`§ Accessibility`:** "split-text headings: `sr-only` name + `aria-hidden` split copy; SplitText `aria: "none"`".
5. **`design-conventions.md § Design Tokens`:** container-query breakpoints as tokens (`--container-*`) when a component set repeats them.

Want me to draft any of these?

### v1.1 drift additions
6. `frontend-security-conventions.md § Input & Output Handling` (G1 § 7): "UI-only forms must not serialize values on native submit": no `name` attributes, a pre-hydration `type="button"`, and a `noscript:` fallback (the pattern in § 0.1 F2–F3).
7. `frontend-architecture-conventions.md § Performance Budgets`: "a route at ≥ 98% of its First Load budget gets a CI byte guard (`scripts/check-first-load.mjs`) before new client code lands".
