# Frontend Architecture Conventions

> Standing architectural patterns for own-product frontend development.
> Loaded by Frontend Architect, Frontend Engineer, and Frontend Reviewer on every activation.
> Referenced by Frontend Security Engineer, Frontend QA Engineer, and Frontend DevOps Engineer.
> Update here once — every role picks up the change.

---

## Stack Baseline

**Framework:** Next.js 15.x — App Router only (`app/` directory). Pages Router is forbidden for new code.
**UI runtime:** React 19 (Server Components, Server Actions, `useActionState`, `useFormStatus`, `useOptimistic`, `use`)
**Language:** TypeScript 5.x, `strict: true`
**Styling:** Tailwind CSS 4 via `@tailwindcss/postcss` — CSS-first config (`@theme` in `app/globals.css`), no `tailwind.config.js`
**Animation:** GSAP 3.13+ with `@gsap/react` (`useGSAP`) — all GSAP plugins are free since 3.13
**Validation:** zod (single schema per boundary, shared client + server)
**Runtime:** Node.js 22 LTS (Next 15 minimum is 18.18)
**Package manager:** pnpm (lockfile committed; never mix managers in one repo)
**Lint/format:** ESLint 9 flat config (`eslint.config.mjs`) with `eslint-config-next` + `eslint-plugin-jsx-a11y`; Prettier + `prettier-plugin-tailwindcss`
**Unit/component tests:** Vitest + React Testing Library + `@testing-library/jest-dom` + jsdom; MSW for HTTP mocking
**E2E tests:** Playwright (+ `@axe-core/playwright` for accessibility)
**Utilities baseline:** `clsx` + `tailwind-merge` (`cn()`), `server-only`, `next/font`, `next/image`, `lucide-react` (icons)
**Backend:** consumed over HTTP from the companion backend team's API (Java/Spring Boot), or Next.js Server Actions when the project is frontend-owned full-stack
**Containerization:** Docker (`output: 'standalone'`) — deploy target per `frontend-devops-conventions.md`

Justify deviation explicitly. Don't introduce new core technologies (state libraries, styling libraries, animation libraries, data-fetching libraries, component kits) without an ADR.

---

## Version Notes

Facts the roles rely on for Next.js 15 / React 19 / Tailwind 4 / GSAP 3. Verify against current docs when a project's pinned version differs.

- Request APIs are **async** in Next 15: `await cookies()`, `await headers()`, `await params`, `await searchParams`.
- `fetch` is **not cached by default** in Next 15; opt in explicitly with `cache: 'force-cache'` or `next: { revalidate }`. GET Route Handlers are also uncached by default.
- `next.config.ts` (TypeScript) is supported. Turbopack is the default dev bundler.
- `middleware.ts` is a request-time hook at the edge — it is a routing/UX convenience, **not** a security boundary (see `frontend-security-conventions.md § Authorization (Data Access Layer)`).
- Tailwind 4 detects content automatically; theme tokens are CSS variables declared in `@theme`; dark mode variant declared with `@custom-variant`.
- GSAP: `useGSAP()` from `@gsap/react` is the only sanctioned way to run GSAP inside React — it scopes selectors and reverts tweens on unmount/StrictMode double-invoke.
- Upgrading the Next.js major (16+: `middleware.ts` → `proxy.ts` rename, cache components) is an ADR, not a `pnpm up`.

---

## App Router Layout

```
app/                       Routes ONLY — layouts, pages, loading/error/not-found, route handlers, metadata
  layout.tsx               Root layout: html/body, fonts, providers, theme attribute
  globals.css              @import "tailwindcss"; @theme tokens; @custom-variant dark; base resets
  (marketing)/             Route groups by audience or layout shell — never by tech concern
  (app)/
  api/                     Route Handlers — only when a Server Action does not fit (webhooks, downloads, third-party callbacks)
components/
  ui/                      Primitives (Button, Input, Dialog, Toast…) — presentational, token-driven, no data access
  layout/                  Shells, nav, footer
features/<feature>/        Feature modules, colocated: components/ hooks/ actions.ts schemas.ts queries.ts types.ts __tests__/
lib/
  api/                     Typed API client (server-side by default), response schemas, error mapping
  env.ts                   zod-validated process.env — the only place env is read
  utils.ts                 cn(), formatters — pure functions
  gsap.ts                  gsap.registerPlugin(...) once; re-exported for client modules
hooks/                     Cross-feature client hooks only
types/                     Shared TS types; generated API types (openapi-typescript) when an OpenAPI contract exists
tests/
  e2e/                     Playwright specs + fixtures (QA-owned)
  fixtures/                MSW handlers, data factories (shared — QA-owned; per-test inline fixtures — Engineer-owned)
  setup.ts                 Vitest setup (jest-dom, MSW server lifecycle)
public/                    Static assets only; no secrets, no user data
docs/                      adr/ tech-design/ specs/ ddr/ security/ qa/
```

Rules:
- A file in `app/` contains routing glue only. Business/UI logic lives in `features/` or `components/`.
- One component per file; named exports everywhere except Next.js route files (which require default exports).
- Path alias `@/` maps to the repo root. No relative imports that climb more than one level (`../../..` is a smell → move the module).

---

## Component Model

- **Server Components by default.** Add `'use client'` only at the interactive leaf that needs state, effects, browser APIs, or GSAP.
- Never mark a `layout.tsx` or `page.tsx` as a client component to "make things work" — push interactivity down.
- Client components receive **serializable props** only (no functions except Server Actions, no class instances, no Dates without conversion).
- Server-only modules (`lib/api/`, data access, anything reading secrets) import `'server-only'` so a client import fails at build time.
- Composition over configuration: prefer `children`/slots to boolean-prop explosions.
- Props are declared with `type Props = { … }`; no `React.FC`. Exported components have explicit prop types.
- No default props objects, no prop spreading of unknown props onto DOM elements.

---

## Data Fetching & Mutations

- **Reads** happen in Server Components (async components) through `lib/api/` — never in `useEffect`.
- Every external response is parsed with a zod schema at the boundary (`lib/api/schemas/`). Types derive from schemas; hand-written response types are a smell.
- Caching is explicit per call: `cache: 'no-store'` for user-specific data, `next: { revalidate: N, tags: [...] }` for shared data. Document the choice in a comment when it is not obvious.
- **Writes** happen through Server Actions (`'use server'`), one action per mutation, in `features/<feature>/actions.ts`:
  1. parse input with the feature's zod schema,
  2. authorize inside the action (see § Authentication & Session),
  3. call the API client,
  4. `revalidatePath` / `revalidateTag` as needed,
  5. return a result union `{ ok: true, data } | { ok: false, errors }` — never throw for expected failures.
- Client mutation UX uses `useActionState` + `useFormStatus` (+ `useOptimistic` when the spec asks for optimistic UI).
- Route Handlers (`app/api/`) are reserved for non-form traffic: webhooks, file streaming, third-party callbacks, health checks.
- Client-side data libraries (TanStack Query, SWR) require an ADR — they are justified only for genuinely client-driven data (polling, live filters over large sets, offline).

---

## State Management

Escalate only as far as needed, in this order:
1. **URL state** (`searchParams`, dynamic segments) — filters, pagination, tabs, anything shareable.
2. **Server state** — data rendered by Server Components; refreshed via revalidation.
3. **Local component state** — `useState`/`useReducer` in the leaf that owns it.
4. **Context** — cross-tree *UI* state (theme, open drawer, toast queue). Providers live in `app/providers.tsx`.
5. **Global store** (Zustand, Redux…) — ADR required; must name the concrete state that (1)–(4) cannot hold.

No duplicated server data in client state. Derive, don't copy.

---

## Routing, Layouts & Boundaries

- Every route that fetches data ships `loading.tsx` (skeleton per `design-conventions.md § Screen States Matrix`) and `error.tsx` (client boundary with retry).
- `not-found.tsx` at root and at any segment that can 404 by id.
- Metadata via `generateMetadata` / `metadata` export — never hand-rolled `<head>` tags.
- Route groups organize by shell/audience. Parallel and intercepting routes are allowed only when the spec describes the UI pattern (e.g., modal-on-navigation) — cite the spec section in the plan.
- `middleware.ts` does: locale/redirect logic, lightweight cookie-presence redirects, CSP nonce injection. It does **not** do: authorization decisions, data fetching, anything requiring secrets beyond a cookie read.
- Navigation uses `next/link` and `next/navigation`; `<a>` is for external links only (with `rel="noopener noreferrer"`).

---

## Forms & Validation

- One zod schema per form in `features/<feature>/schemas.ts`, imported by both the client (for inline validation) and the Server Action (authoritative).
- Forms work without JavaScript where the interaction is a plain submit (progressive enhancement via `<form action={serverAction}>`); enhanced client validation is additive.
- Field errors bind to inputs with `aria-describedby` and `aria-invalid`; a form-level error region is `role="alert"`.
- Submit buttons reflect pending state (`useFormStatus`) and are disabled during submission to prevent double-submit.
- Error copy comes from `design-conventions.md § UX Writing` — actionable, no blame, no jargon.
- `react-hook-form` is permitted for complex multi-step forms; the schema remains the single source of truth (zod resolver).

---

## Styling (Tailwind CSS 4)

- `app/globals.css` starts with `@import "tailwindcss";` followed by `@theme { … }` declaring the tokens from `design-conventions.md § Design Tokens`.
- Components consume **semantic** utilities (`bg-surface`, `text-ink`, `border-line`) generated from tokens. Raw hex, raw px, and arbitrary values (`bg-[#…]`, `w-[317px]`) are forbidden outside `globals.css` — a one-off needs a code comment justifying it.
- Class composition goes through `cn()`; conditional classes are never string-concatenated.
- `@apply` is allowed only in `globals.css` base layer for resets and typography defaults — never in component files.
- Dark mode: `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));` — theme set on `<html data-theme>` by the root layout; components use `dark:` utilities only for genuinely different treatments, tokens handle the rest.
- Responsive is **mobile-first** (`sm:`, `md:`, `lg:` add up). Use container queries (`@container`, `@md:`) for components that must adapt to their slot rather than the viewport.
- Focus styles are never removed; `focus-visible:` styles use the `--color-focus` token.
- Class order is enforced by `prettier-plugin-tailwindcss` (`tailwindStylesheet: "./app/globals.css"`).

---

## Animation (GSAP 3)

- **CSS transitions** for simple state changes (hover, focus, open/close, color, ≤ 300 ms). **GSAP** for sequences, scroll-driven motion, morphing, staggered reveals, and anything choreographed.
- GSAP runs only in client components, only inside `useGSAP(() => { … }, { scope: containerRef, dependencies: [...] })`. Never `useEffect` + raw `gsap` calls.
- Plugins register once in `lib/gsap.ts` (`gsap.registerPlugin(useGSAP, ScrollTrigger, …)`); client modules import `gsap` from there.
- Animate `transform` and `opacity`; never animate `width`/`height`/`top`/`left`/`margin` — use Flip for layout changes (ADR-0008).
  - **Entrance reveals of content that is, or contains, focusable or readable elements** (text, links, buttons, form fields) animate `opacity`, **not** `autoAlpha`: `autoAlpha`'s `visibility: hidden` removes not-yet-revealed content from the tab order and the accessibility tree, which breaks the keyboard path and screen-reader browsing.
  - Such reveals must never leave focus on an invisible element: the controller listens for `focusin` in its scope and completes the reveal of the focused target (or its revealed ancestor) at once.
  - Use `autoAlpha` for exits, closed overlays/menus/dialogs, decorative layers (`aria-hidden`), and content that must not be reachable until a user action reveals it.
- Every animation module declares reduced-motion behavior with `gsap.matchMedia()` — `(prefers-reduced-motion: reduce)` branch either skips motion or uses instant `set()`; this is mandatory, not optional.
- Initial state is set to avoid flash-of-unstyled/unanimated content: elements that animate *in* start at `opacity: 0` (never `invisible`/`visibility: hidden` for focusable or readable content — see above) and `useGSAP` (layout-effect timing) sets the tween; hydration never shows the pre-animation frame. Where the project uses a motion gate (e.g. ADR-0002's `.gsap` class), the hidden initial state applies only under the gate, so no-JS and reduced motion render content visible.
- Scroll reveals: `ScrollTrigger` with `once: true` by default; pinning/scrubbing only when the spec's motion intent asks for it.
- Durations and easings come from `design-conventions.md § Motion Principles`. Hard-coded magic numbers are a review finding.
- No animation may block input for longer than 300 ms, and none may run on a loop without a purpose stated in the spec.

---

## Error Handling

- Expected failures (validation, 4xx from the API) are **values** (result unions), rendered inline. Unexpected failures throw and are caught by the nearest `error.tsx`.
- `lib/api/errors.ts` maps HTTP/API error shapes to a typed `AppError` (`code`, `message`, `status`, `requestId`). UI never branches on raw status codes.
- Server errors reaching the client show generic copy; Next.js already redacts server error messages in production — do not re-expose them via props.
- Server-side errors are logged once, with the request id from the API response, on the server. Nothing is logged in the browser in production.
- `global-error.tsx` exists at the root for layout-level failures.

---

## Authentication & Session

- Session tokens live in **httpOnly, Secure, SameSite=Lax cookies** issued by the backend (or by a Route Handler acting as BFF). Never in `localStorage`, `sessionStorage`, or client-readable cookies.
- A **Data Access Layer** (`lib/api/session.ts`, `'server-only'`) exposes `getSession()` / `requireSession()`; every Server Component, Server Action, and Route Handler that touches user data calls it. Authorization is decided there — never solely in `middleware.ts`.
- Role/permission checks happen next to the data they protect (same function), not in the component tree.
- Client components receive only the minimal user projection they need (`{ id, displayName, role }`), never the raw session or token.
- Logout invalidates server-side and clears the cookie; redirects use an allowlisted `next` path (see `frontend-security-conventions.md § Input & Output Handling`).

> Auth is a build-vs-buy decision per project. See `frontend-security-build-vs-buy.md`. Default above applies when the backend team owns auth or when "build" is chosen.

---

## Configuration & Environment

- `lib/env.ts` parses `process.env` with two zod schemas: `server` (secrets, API base URL) and `client` (`NEXT_PUBLIC_*` only). Build fails on missing/invalid vars.
- `NEXT_PUBLIC_*` values are **inlined into the client bundle at build time** — they are public forever. Only non-secret config goes there.
- `.env.example` committed with placeholders and comments; `.env.local` gitignored. One value set per environment (local / preview / prod) per `frontend-devops-conventions.md § Environment Model`.
- Feature flags are read once in `lib/env.ts` or a flags module; components never read `process.env` directly.

---

## Accessibility (engineering rules)

Design-level baseline lives in `design-conventions.md § Accessibility Baseline`. Engineering rules:
- Semantic HTML first (`<button>`, `<nav>`, `<main>`, `<h1>`…`<h6>` in order); ARIA only to fill gaps, never to replace semantics.
- Every interactive element is keyboard reachable and operable; focus order follows visual order; focus is visible (`focus-visible`).
- Every `<img>` uses `next/image` with a meaningful `alt` (or `alt=""` when decorative). Icon-only buttons carry `aria-label`.
- Form controls have visible `<label>`s bound by `htmlFor`; placeholder is never the label.
- Async status changes announce via `aria-live="polite"` regions (toasts, "saving…").
- Dialogs trap focus and restore it on close; Escape closes.
- Motion respects `prefers-reduced-motion` (see § Animation).
- `eslint-plugin-jsx-a11y` runs in CI; violations are review findings.

---

## Performance Budgets

Defaults per route unless the plan states otherwise (measured on the preview deployment, mobile emulation):

| Metric | Budget |
|--------|--------|
| LCP | ≤ 2.5 s |
| INP | ≤ 200 ms |
| CLS | ≤ 0.1 |
| First Load JS (Next build output) | ≤ 180 kB per route |
| Largest image | ≤ 200 kB, served via `next/image` |

Rules: `next/font` for all fonts (self-hosted, `display: 'swap'`); `next/image` for all raster images with explicit `sizes`; `next/dynamic` for heavy client-only components (charts, editors, GSAP-plugin-heavy scenes); no `'use client'` on layouts; no barrel files that pull the world into a route.

---

## TypeScript Rules

- `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`, `exactOptionalPropertyTypes` when the project tolerates it.
- No `any`; use `unknown` and narrow. No non-null assertions (`!`) outside tests.
- Domain types derive from zod schemas (`z.infer`); API types are generated from OpenAPI when the backend publishes one (`openapi-typescript`), never hand-copied.
- Exported functions declare return types. Discriminated unions over optional booleans for state (`status: 'idle' | 'pending' | 'error'`).
- `pnpm typecheck` = `tsc --noEmit` and is part of every suite check.

---

## Cross-Cutting

### Documentation

Every project has:
- `README.md` with: purpose, stack, setup (local + Docker), env var table (name / public? / purpose), routes table (path + auth + description), test commands
- `CLAUDE.md` for AI-assisted development context (posture, package manager, deploy target, backend contract location)
- `docs/` folder: `adr/`, `tech-design/`, `specs/`, `ddr/`, `security/`, `qa/`

### Multi-target Deployment

Every project supports from day one:
- `run-local.sh` for local dev (`pnpm install --frozen-lockfile && pnpm dev`)
- `Dockerfile` (`output: 'standalone'`) — and `docker-compose.yml` when a local backend/DB is part of the dev loop
- Deploy config for the chosen target (Vercel project or `render.yaml` / `railway.toml` / `fly.toml`)

**CI/CD:** GitHub Actions in `.github/workflows/`. Default workflows: `ci.yml` (typecheck + lint + test + build + e2e on every push), `deploy-staging.yml` (on merge to main), `deploy-prod.yml` (manual). Owned by the Frontend DevOps Engineer per `frontend-devops-conventions.md`.

### Repository Hygiene

- `.gitignore` covers `.env*.local`, `.next/`, `node_modules/`, `playwright-report/`, `test-results/`, coverage, IDE files
- Branch naming: `<type>/<ticket-or-slug>` (e.g., `feat/004-wishlist-page`, `fix/dialog-focus-trap`)
- Conventional commits required (`feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:`, `style:` for pure token/CSS changes)

### Engineering Workflow

Standing discipline for engineering roles (Frontend Engineer; Frontend DevOps for config) when implementing tasks against this codebase.

**Test-Driven Development (TDD):**
- **Red:** Write the failing test first. Component/hook/util behavior → Vitest + RTL (`features/<feature>/__tests__/`). Behavior that only exists at the route level (async Server Components, navigation, Server Action round-trips) → a Playwright spec in `tests/e2e/` tagged `@feature-<slug>`, since RTL cannot render async Server Components. Test names describe behavior, not implementation. Run to confirm it fails for the expected reason.
- **Green:** Write minimal production code to pass. No over-engineering. No unrelated improvements.
- **Suite check:** `pnpm typecheck && pnpm lint && pnpm test`. All must pass.
- **Refactor:** Clean up without changing test outcomes (extract components when repetition emerges, replace magic values with tokens). Re-run suite.
- **Build check:** `pnpm build` at the end of any task that touches `app/`, `'use client'` boundaries, `next.config.ts`, or env — it is the only step that catches RSC boundary violations and env schema failures.
- **Commit:** One conventional-commit per task with convention citations in the body.

**Conventional Commits (required):**
- Format: `<type>: <subject>` — `feat`, `fix`, `test`, `refactor`, `docs`, `chore`, `style`.
- Body cites the relevant `frontend-architecture-conventions.md` and `design-conventions.md` sections (e.g., *"per § Data Fetching & Mutations"*).
- Body lists tests, e.g., *"Tests: 22 passed, 0 failed (pnpm test); e2e: 3 passed (pnpm test:e2e --grep @feature-wishlist)"*.

**Branch Naming:** `<type>/<ticket-or-slug>`.

**One task at a time:** No parallel task execution. Tasks complete in user-specified order.

**Convention gaps:** Engineer surfaces gaps to the user and routes to the Frontend Architect. Engineer does not invent patterns or update conventions unilaterally.

**Pre-Convention label:** When a task must proceed before a convention exists, commit body includes `Pre-Convention: [pattern] not yet in conventions; implement defers to architect`.

**Pre-Contract label:** When a task consumes an API endpoint whose contract is not yet published by the backend team, the Engineer codes against an MSW handler in `tests/fixtures/` and the commit footer includes `Pre-Contract: [endpoint] mocked; reconcile when contract lands`.

**Draft label:** When a task is implemented from an informal brief rather than a Frontend Architect `/tasks` output, commit footer includes `Draft: pending architect review`.

**Reviewer handoff:** When a feature is ready for review, the Engineer announces (chat or PR description): commit range or branch, paths to spec / plan / tasks / design handoff / security findings (or "not produced"), test commands used, preview URL if any, and open *Pre-Convention* / *Pre-Contract* / *Draft* labels. This is the Frontend Reviewer's input contract per `§ Review Report Template`.

**QA handoff:** Same artifacts as Reviewer handoff, plus the E2E command (`pnpm test:e2e`) and the environment under test (local / preview URL). This is the Frontend QA Engineer's input contract per `frontend-qa-conventions.md § Test Plan Template`.

---

## Review Report Template

The Frontend Reviewer produces this report for every per-feature review. Findings are severity-graded; the report ends with a single recommendation (APPROVE / CHANGES REQUESTED / BLOCK).

```text
# Frontend Code Review: [Project] — [Feature] v[N]

- **Date:** YYYY-MM-DD
- **Reviewer:** [user]
- **Scope:** [PR URL / branch / commit range]
- **Upstream artifacts:** [spec, plan, tasks, design handoff, security findings — or "missing" with route]
- **Recommendation:** APPROVE | CHANGES REQUESTED | BLOCK

## Summary
- Commits reviewed: [N]
- Tests added: [N unit/component, N e2e]
- Suite status (pnpm typecheck && pnpm lint && pnpm test): [PASS | FAIL]
- Build status (pnpm build): [PASS | FAIL] — First Load JS per touched route: [kB]
- BLOCKING findings: [N]
- NON-BLOCKING findings: [N]
- NIT findings: [N]
- Open Security findings referenced: [IDs from Frontend Security Engineer's report, or "none / not produced"]

## Findings

### BLOCKING

#### Finding [NNNN]: [Title]
- **Location:** `[path/to/file.tsx:NN]`
- **Convention citation:** per `frontend-architecture-conventions.md § [Section]` OR `design-conventions.md § [Section]`
- **Issue:** [one paragraph]
- **Remediation:** [concrete fix]
- **Routed to:** Frontend Engineer | Frontend Architect | UX Strategist | Backend team (via user)

### NON-BLOCKING
[Same structure as BLOCKING; severity differs.]

### NIT
[Same structure; small suggestions only.]

## UI Quality Checklist
- States covered (loading / empty / error / success): [Yes | gaps]
- Keyboard + focus-visible: [Yes | gaps]
- Reduced motion honored: [Yes | N/A | gaps]
- Responsive at 360 / 768 / 1280: [Yes | gaps]
- Tokens only (no raw values): [Yes | gaps]

## Process Gaps
[Upstream artifacts missing — spec, plan, design handoff, security findings — and the recommended route to fix.]

## Sign-Off
- **Status:** Draft | Reviewed | Approved by user
- **Notes:** [anything blocking the user's merge decision]
```

Review Reports are versioned. A second pass after Engineer's revisions produces v[N+1].

---

## ADR Template

ADRs (Architecture Decision Records) document architectural decisions and deviations. Stored at `docs/adr/[NNNN]-[slug].md` in the project repo.

```text
# ADR-[NNNN]: [Decision title]

- **Status:** Proposed | Accepted | Superseded by ADR-[NNNN]
- **Date:** YYYY-MM-DD
- **Deciders:** [name(s) — typically the user]

## Context
What is the problem or situation? What constraints apply? Why does this decision need to be made now?

## Decision
What did we decide? Be specific — name the technology, pattern, or approach chosen.

## Consequences
- **Positive:** What we gain.
- **Negative:** What we trade off or accept as cost.
- **Neutral:** Notable side effects.

## Alternatives Considered
For each alternative: option name, why it was rejected.

## References
Links to specs, plans, related ADRs, DDRs, external docs.
```

ADRs are immutable once *Accepted* — replace via *Superseded* rather than edit.

---

## Tech Design Doc

Produced by the Frontend Architect **only** when a feature meets one of: three or more feature modules touched; a new cross-cutting mechanism (auth flow, real-time updates, i18n, offline); a GSAP scene with more than one ScrollTrigger or a Flip-based layout transition; or a new integration boundary (third-party SDK, BFF route). Stored at `docs/tech-design/[feature-slug].md`.

Shape: Goal & spec reference → Component tree (server/client marked) → Data flow (reads, actions, revalidation) → Motion design (timeline, triggers, reduced-motion branch) → Risks & open questions → Task outline (feeds `/tasks`).

---

## Workflow Integration

### Spec-Kit (spec-driven development)

This workspace uses [Spec-Kit](https://github.com/github/spec-kit). Frontend roles integrate as follows:

| Spec-Kit phase | Role responsible |
|----------------|------------------|
| `/constitution` | UX Strategist drafts (or inherits the product constitution from the backend team's Product Strategist and appends Experience Principles); user approves |
| `/specify` | UX Strategist produces (screens, flows, states, acceptance criteria) |
| `/clarify` | UX Strategist + user iterate |
| `/plan` | Frontend Architect produces |
| `/tasks` | Frontend Architect breaks down |
| `/implement` | Frontend Engineer, one task at a time |
| `/analyze` | Frontend Security Engineer + Frontend Reviewer |
| `/checklist` | Frontend QA Engineer (Test Plan derived from acceptance criteria) |

Always check Spec-Kit docs for the current command set (`/speckit.*` prefixes in recent versions) — this mapping evolves.

### Backend ↔ Frontend handoff

When the companion backend team exists, the contract of record is the backend's `/plan` API table or its OpenAPI document. The Frontend Architect applies the **Contract Gate**: no `/plan` is marked *Ready for /tasks* without a contract reference or an explicit mock strategy (*Pre-Contract*). API defects found by frontend roles route to the backend team via the user — frontend roles never patch around a broken contract silently.

---

*Last updated: 2026-09-22*

---
