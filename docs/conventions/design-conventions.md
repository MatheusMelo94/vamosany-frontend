# Design Conventions

> Standing product-and-design patterns for own-product frontend development.
> Loaded by UX Strategist on every activation (spec shapes, quality bar, decision records).
> Loaded by Frontend Architect, Frontend Engineer, and Frontend Reviewer for tokens, motion, states, accessibility, and UX writing.
> Update here once — every role picks up the change.

---

## Purpose & Ownership

This file holds two things: (1) the **shapes** of Spec-Kit artifacts as the frontend team produces them — constitution, spec, clarification, Design Decision Record; (2) the **design baseline** every screen is held to — tokens, type, color, layout, motion, states, accessibility, writing. The UX Strategist proposes changes; the user approves. No role edits this file unilaterally.

When the companion backend team already produced a product constitution (`product-conventions.md § Constitution Shape`), that constitution is binding here; the frontend adds an **Experience Principles** appendix rather than a second constitution.

---

## Constitution Shape

Spec-Kit `/constitution` output. One per project. Immutable once *Accepted*; amendments create v[N+1].

```text
# Constitution: [Project] v[N]

- **Status:** Proposed | Accepted | Superseded by Constitution-v[N+1]
- **Date:** YYYY-MM-DD
- **Owner:** [user]

## Users
Who, concretely. Named roles or real people. Primary device and context of use (phone on the go, laptop at a desk, kiosk…).

## Problem
What this product solves for them, in their words.

## Why Now / Why This Way
Timing and approach; what was rejected.

## Success Criteria (v1)
Measurable. Countable. Dated.

## Non-Goals
3+ things this product deliberately does not do.

## Constraints
Regulatory, infra, team, budget, brand.

## Experience Principles
- **Promise:** one sentence — what using the product should feel like.
- **Voice:** 3 adjectives + 1 "never" (e.g., plain, warm, quick — never salesy).
- **Devices & breakpoints of record:** which viewports are first-class (e.g., 360, 768, 1280) and which are best-effort.
- **Motion stance:** functional-only | expressive-in-one-place | expressive (see § Motion Principles).
- **Accessibility floor:** WCAG 2.2 AA (default) — or stricter if posture demands.
- **Language(s):** e.g., pt-BR first, en second.
```

---

## Spec Shape

Spec-Kit `/specify` output for one feature = **one user journey**. Written by the UX Strategist. Ready-for-`/plan` only when every section is filled or explicitly marked N/A.

```text
# Spec: [Project] — [Feature] v[N]

- **Status:** Pre-Constitution Draft | Draft (Open Clarifications) | Ready for /clarify | Ready for /plan
- **Date:** YYYY-MM-DD
- **Constitution reference:** serves [user] from constitution § Users; advances success criterion [metric]
- **Related DDRs:** [IDs or none]
- **Backend contract:** [OpenAPI path / backend plan reference / "frontend-owned (Server Actions)" / "not yet published"]

## Feature in One Sentence

## User & Trigger
Who starts the journey, from where, on what device, in what state of mind.

## Journey
Numbered steps from entry to outcome. One journey. Branches noted as sub-steps.

## Screens & Surfaces
| Screen / surface | Route (proposed) | Purpose | Entry from | Exit to |
|------------------|------------------|---------|------------|---------|

## States Matrix
Per screen, per § Screen States Matrix: loading, empty, error, partial, success, offline (if relevant). Unstated states are a Spec Quality Bar failure.

## Content & Copy
Headlines, labels, CTA verbs, error and empty-state copy — per § UX Writing. Placeholder copy is labeled `[TBD]`.

## Motion Intent
What moves, why (what it communicates), and what happens under reduced motion. "None beyond CSS transitions" is a valid answer.

## Responsive Behavior
Per breakpoint of record: what changes (layout, density, navigation pattern).

## Accessibility Acceptance
Keyboard path through the journey; announcements for async steps; contrast and target-size notes; anything beyond the baseline.

## Data Dependencies
Reads and writes the journey needs (entity + operation), whether the backend contract exists, and what is optimistic.

## Out of Scope
2+ items this feature deliberately does not do.

## Acceptance Criteria
Numbered, observable, testable. Each references a screen and a state. These become the QA Engineer's test cases 1:1.

## Open Clarifications
Numbered. Empty when Status = Ready for /plan.
```

---

## Clarification Shape

Spec-Kit `/clarify` output. One file per round; rounds accumulate.

```text
# Clarification Round [N]: [Project] — [Feature]

- **Date:** YYYY-MM-DD
- **Spec:** [path] v[N]

| # | Question (from spec § Open Clarifications) | Answer (user) | Spec section updated |
|---|--------------------------------------------|---------------|----------------------|

## Resulting Spec Changes
Diff-style summary of what changed in the spec. Spec version increments.

## Still Open
Numbered items that remain; empty when the spec moves to Ready for /plan.
```

---

## DDR Template

Design Decision Records capture product-and-experience decisions that deserve durable rationale: a screen pattern choice (modal vs page), a scope cut on a journey, a deferral (dark mode to v2), a build-vs-buy on UX (component kit, design tool), a deviation from § Anti-Patterns, or any feature that conflicts with the constitution's non-goals or Experience Principles. Stored at `docs/ddr/[NNNN]-[slug].md`. Immutable once *Accepted*.

```text
# DDR-[NNNN]: [Decision title]

- **Status:** Proposed | Accepted | Superseded by DDR-[NNNN]
- **Date:** YYYY-MM-DD
- **Deciders:** [user]
- **Constitution / spec reference:** [§ or path]

## Context
The user problem or constraint forcing the decision.

## Decision
What we chose. Name the pattern/screen/behavior.

## User Impact
Who gains, who loses, and what they see differently.

## Consequences
- **Positive:**
- **Negative:**
- **Neutral:**

## Alternatives Considered
Option → why rejected.

## References
Specs, ADRs, research notes, external patterns.
```

---

## Spec Quality Bar

Applied continuously by the UX Strategist. Reject (surface the weakness, propose a sharper version, wait for the user) any of these:

| Failure | Signal | Push-back |
|---------|--------|-----------|
| Vague user | "users", "people", "someone" | *Concretely, who? Name the constitution role and their device.* |
| No success criteria | nothing countable | *How do we know v1 works? Pick a number.* |
| Implicit success | "it should feel nice" | *Unobservable. What proxy can QA measure?* |
| Scope creep | journey grows mid-conversation | *This grew from X to X+Y — intentional? Each screen has cost.* |
| Multi-journey spec | 2+ distinct journeys | *Split: one spec = one journey.* |
| Non-goal conflict | contradicts constitution | *Stop — DDR Trigger.* |
| No out-of-scope | nothing listed | *What is NOT this feature? List 2+.* |
| **Unstated states** | no loading/empty/error | *What does the user see while waiting, with nothing, and when it fails?* |
| **Device-blind** | no viewport/context | *Phone in one hand or laptop? It changes the layout and the copy.* |
| **Motion as decoration** | animation with no stated job | *What does this motion tell the user? If nothing, cut it.* |
| **Copy as afterthought** | "we'll write it later" | *Copy is design. Draft the CTA verbs and error lines now.* |
| **Contract-blind** | writes with no backend contract | *Which endpoint/action? If unpublished, mark Pre-Contract in Data Dependencies.* |

The Strategist never silently rewrites a weak input into a strong one.

---

## Screen States Matrix

Every screen that shows data declares all applicable states. The Architect plans them, the Engineer builds them, the Reviewer checks them, QA tests them.

| State | Shows | Rule |
|-------|-------|------|
| Loading | Skeleton matching the final layout (same heights → zero CLS) | Never a spinner for content areas; spinners only inside buttons |
| Empty | One sentence explaining why it's empty + one primary action | An empty screen is an invitation to act |
| Error | What went wrong + how to fix + retry action | Never blame the user; never expose internals |
| Partial | Data plus an inline notice for the missing part | Do not block the whole screen for one failed section |
| Success | The data; confirmations for mutations (toast or inline) | Confirmation vocabulary matches the action verb ("Save" → "Saved") |
| Offline / stale | Banner + last-updated time when relevant | Only when the spec says the journey can be used offline or with stale data |
| Permission denied | Explanation + path back | Distinct from 404; no data leakage about existence |

---

## Design Tokens

Declared once in `app/globals.css` under `@theme`. Names are **semantic** (what it's for), not descriptive (what it looks like). Components never use raw values (`frontend-architecture-conventions.md § Styling (Tailwind CSS 4)`).

```css
@import "tailwindcss";

@theme {
  /* Color — semantic roles; values set per project brand */
  --color-surface: …;        /* page background */
  --color-surface-raised: …; /* cards, sheets */
  --color-ink: …;            /* primary text */
  --color-ink-muted: …;      /* secondary text */
  --color-line: …;           /* borders, dividers */
  --color-accent: …;         /* the one brand action color */
  --color-accent-ink: …;     /* text on accent */
  --color-focus: …;          /* focus ring — must meet 3:1 against surface */
  --color-success: …; --color-warning: …; --color-danger: …;

  /* Type */
  --font-sans: var(--font-body), ui-sans-serif, system-ui, sans-serif;   /* injected by next/font */
  --font-display: var(--font-display), var(--font-sans);                 /* optional second family */
  --text-xs: 0.75rem;  --text-sm: 0.875rem;  --text-base: 1rem;  --text-lg: 1.125rem;
  --text-xl: 1.25rem;  --text-2xl: 1.5rem;   --text-3xl: 1.875rem; --text-4xl: 2.25rem; --text-5xl: 3rem;

  /* Spacing — 4 px base; components use the scale, never ad-hoc px */
  --spacing: 0.25rem;

  /* Radius — hierarchy, not one radius everywhere */
  --radius-sm: 0.25rem; --radius-md: 0.5rem; --radius-lg: 1rem; --radius-full: 9999px;

  /* Elevation — at most three levels */
  --shadow-1: …; --shadow-2: …; --shadow-3: …;

  /* Motion */
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1);
  --duration-fast: 150ms; --duration-base: 250ms; --duration-slow: 450ms;

  /* Layout */
  --container-prose: 65ch; --container-page: 80rem;
  --z-dropdown: 10; --z-sticky: 20; --z-overlay: 30; --z-modal: 40; --z-toast: 50;
}

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

Adding a token is a design decision (UX Strategist proposes → user approves → Engineer adds under `style:` commit). Removing one requires a grep proving zero usages.

---

## Typography

- One or two families, chosen for this product — not the default sans you would reach for on any project. If two, they are clearly distinct in role (display vs body).
- Loaded via `next/font` (self-hosted, `display: 'swap'`, subsets declared) and exposed as `--font-body` / `--font-display` CSS variables.
- Type scale from § Design Tokens; heading levels map to scale steps consistently across the product.
- Body line length ≤ 80 characters (`max-w-prose`); body line-height 1.5–1.6; display line-height 1.1–1.2.
- Sentence case everywhere. No all-caps labels, no tracked-out eyebrow labels above every heading, no single-word color/italic accents inside headlines.
- Numbers in tables and data use tabular figures (`tabular-nums`).

---

## Color

- Palette of 4–6 base values plus semantic status colors, expressed only through § Design Tokens.
- Exactly **one** accent color for primary actions. Secondary actions are neutral.
- Text contrast ≥ 4.5:1 (body) and ≥ 3:1 (large text, UI components, focus ring) against its surface, in both themes.
- Color is never the only carrier of meaning (pair with icon, text, or pattern).
- Dark theme is a token swap on `[data-theme="dark"]`, not a component rewrite. Ship it only when the constitution's Experience Principles ask for it — otherwise a DDR to defer.

---

## Spacing, Layout & Responsive Breakpoints

- 4 px base scale. Vertical rhythm uses the same scale (stack gaps of 4/8/12/16/24/32/48/64).
- Breakpoints of record default: **360** (phone), **768** (tablet/small laptop), **1280** (desktop). Design mobile-first; the 360 layout must be complete, not a squeezed desktop.
- Page container `max-w-page` centered; reading content `max-w-prose`. Alignment is left by default; centered layouts require a stated reason (hero, empty state, auth screen).
- Touch targets ≥ 44 × 44 px on pointer-coarse devices; interactive spacing ≥ 8 px.
- Structural devices (borders, dividers, numbering, cards) encode information. Cards are for things that are genuinely discrete and comparable — not a wrapper for every section. Numbered markers only for real sequences.
- Navigation pattern per breakpoint is declared in the spec (e.g., bottom tab bar at 360, sidebar at 1280).

---

## Motion Principles

Motion has a job: show what changed, where something went, or what to look at next. Decoration is cut.

| Category | Tool | Duration | Easing | Notes |
|----------|------|----------|--------|-------|
| State change (hover, focus, toggle) | CSS transition | `--duration-fast` | `--ease-out-quart` | Never animate layout properties |
| Enter / exit (dialog, sheet, toast) | CSS or GSAP | `--duration-base` | out-quart in, in-out-quart out | Exit faster than enter |
| Layout change (reorder, expand) | GSAP Flip | `--duration-base`–`--duration-slow` | `--ease-in-out-quart` | Preserve element identity |
| Orchestrated reveal (one per page) | GSAP timeline | ≤ 800 ms total | out-quart | **One** hero moment; stagger ≤ 60 ms |
| Scroll-driven | GSAP ScrollTrigger | scrubbed or `once: true` | — | Only when the spec's Motion Intent asks; never on content people need immediately |
| Feedback (success, error shake) | CSS | `--duration-fast` | — | Pair with text; never rely on motion alone |

Rules:
- Spend expressiveness in one place per screen. Fade-and-slide-up on every section and hover lift on every card is the generic default — do not ship it.
- `prefers-reduced-motion: reduce` → no transforms larger than opacity crossfades; sequences become instant; ScrollTrigger reveals render visible. This branch is mandatory in every animation module.
- Nothing loops without a purpose stated in the spec. Nothing blocks input > 300 ms.
- Motion never causes layout shift (CLS budget in `frontend-architecture-conventions.md § Performance Budgets`).

---

## Component States

Every interactive primitive in `components/ui/` implements, in order: default, hover (pointer-fine only), focus-visible, active, disabled, loading (where async), error (form controls), selected/checked (where stateful). A primitive PR without all applicable states is CHANGES REQUESTED.

- Disabled elements keep ≥ 3:1 contrast for their outline/text or are removed from the tab order with an explanation nearby.
- Loading buttons keep their width (no layout jump) and expose `aria-busy`.
- Destructive actions use `--color-danger` and require a confirmation step proportional to reversibility.

---

## Accessibility Baseline

WCAG 2.2 AA is the floor for every screen. In addition:
- A full keyboard path exists for every journey in the spec (documented in spec § Accessibility Acceptance).
- Focus is always visible (`--color-focus` ring, ≥ 3:1) and never trapped except inside open dialogs.
- Headings form an outline (one `h1` per page). Landmarks: `header`, `nav`, `main`, `footer`.
- Every image has `alt`; every icon-only control has a name; every input has a visible label.
- Async status is announced (`aria-live`); errors are associated with fields (`aria-describedby`).
- Text resizes to 200 % without loss; layouts survive 320 px width with no horizontal scroll.
- Motion honors reduced-motion (§ Motion Principles). No flashing > 3 Hz.
- Automated check: `@axe-core/playwright` in every E2E journey (`frontend-qa-conventions.md § Accessibility & Performance Gates`). Automated passes are necessary, not sufficient — QA does a manual keyboard pass per feature.

---

## UX Writing

Words are design content. Every string does one job.

- Write from the user's perspective, in plain verbs, sentence case. Name things by what users understand, not how the system is built ("Notifications", not "Webhook config").
- CTAs say exactly what happens: "Save changes", "Create wishlist", "Send invite" — never "Submit", "OK", "Go".
- Vocabulary is stable through a flow: the button "Publish" produces the toast "Published".
- Errors: what happened + what to do next. No apologies, no vagueness, no stack traces, no blame. *"We couldn't save your changes. Check your connection and try again."*
- Empty states: why it's empty + one action. *"No wishlists yet. Create your first one."*
- Confirmations for destructive actions name the object: *"Delete 'Birthday 2026'? This can't be undone."*
- Tone follows the constitution's Voice line. Copy is written in the product's first language and structured for translation (no concatenated sentence fragments).
- Placeholder copy in specs is marked `[TBD]` and is a review finding if it reaches production.

---

## Anti-Patterns

These are defaults, not choices. Where the constitution's brand direction asks for one explicitly, follow the brand; otherwise, avoid:
- Cream background + high-contrast serif display + terracotta accent, or near-black + single acid accent, when the brand didn't ask for it.
- Identical rounded cards with the same soft shadow for every section; gradient washes as decoration.
- Tracked-out ALL-CAPS eyebrow labels, middle-dot meta strings, arrows appended to every link.
- Spinners for content loading (use skeletons); modals for things that could be pages; toasts for errors that need action.
- Animation on everything (see § Motion Principles); parallax on content people need to read.
- Placeholder as label; icon-only navigation without labels at 360.
- Reaching for a component kit's default look without re-tokenizing it (a kit is a DDR: `frontend-security-build-vs-buy.md` lists none because it's a design decision, recorded here).

---

## Design Handoff

What the UX Strategist hands the Frontend Architect with a *Ready for /plan* spec (all inside the spec or linked from it):
1. Spec per § Spec Shape with every section filled.
2. Screen inventory with proposed routes and the navigation pattern per breakpoint.
3. States matrix per screen.
4. Copy deck (all strings, keyed by screen).
5. Motion intent per screen, including the reduced-motion behavior.
6. Token additions proposed (if any), each with a reason.
7. Accepted DDRs referenced by number.

Visual mockups are optional in this workflow; when they exist (Figma or otherwise), they are linked and treated as illustration — the spec text is the contract.

---

*Last updated: 2026-09-22*

---
