# solo-founder-dev-team-front

An AI frontend team for solo-founder product development on **Next.js 15 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4 · GSAP 3** — seven specialized agents anchored to standing convention files, forming a complete spec → plan → implement → review → test → ship pipeline driven by [Spec-Kit](https://github.com/github/spec-kit).

Companion to `solo-founder-dev-team` (the backend team: Java 17 / Spring Boot / MongoDB, in `vamosany-back`). Both plugins share the same shape — one agent per role, one conventions file per discipline, one project posture (Prototype / MVP / Production / Regulated) that calibrates strictness everywhere.

## Pipeline

```
UX Strategist ──► Frontend Architect ──► Frontend Engineer ──► Frontend Reviewer ──► Frontend QA Engineer ──► Frontend DevOps Engineer
/constitution        /plan  /tasks          /implement            /analyze              /checklist + test pass     Deploy Checklist
/specify /clarify    ADRs, Tech Design      TDD, one task         Review Report         Test Pass Report           GO / NO-GO
DDRs                 Contract Gate          at a time             APPROVE/CHANGES/BLOCK PASS/FAIL/RESERVATIONS     rollback

                                   Frontend Security Engineer (spec/plan → threat model; code → findings; pre-deploy sign-off)
```

## Agents

| Agent | Color | Owns | Loads |
|-------|-------|------|-------|
| `ux-strategist` | purple | Constitution (or Experience Principles appendix), `/specify`, `/clarify`, Design Decision Records (DDRs); Spec Quality Bar incl. states, copy, motion intent, accessibility, contract mapping | `design-conventions.md` |
| `frontend-architect` | blue | `/plan`, `/tasks`, ADRs, Tech Design Docs; server/client boundaries, data reads/writes, routing/states, motion strategy; **Contract Gate** against the backend API | `frontend-architecture-conventions.md`, `design-conventions.md` |
| `frontend-engineer` | green | Implementation, one task at a time, red-green-refactor TDD (Vitest + RTL; Playwright for route-level behavior), conventional commits with convention citations, build check | `frontend-architecture-conventions.md`, `design-conventions.md` |
| `frontend-reviewer` | yellow | Pre-merge review: convention adherence, TDD discipline, spec/plan alignment, test quality, UI quality (states, keyboard, reduced motion, responsive, tokens); runs typecheck/lint/test/build | `frontend-architecture-conventions.md`, `design-conventions.md` |
| `frontend-security-engineer` | red | Posture-calibrated review of every Next.js surface (Server Components, Server Actions, Route Handlers, middleware, client, config, env, third parties, deps); threat models; findings; build-vs-buy; Decisions Log | `frontend-security-conventions.md`, `frontend-security-build-vs-buy.md` |
| `frontend-qa-engineer` | cyan | Test Plans from acceptance criteria; Playwright E2E, axe + manual accessibility, visual regression, regression, exploratory, Lighthouse smoke; bugs routed by owner; quality gate; shared fixtures/MSW | `frontend-qa-conventions.md` |
| `frontend-devops-engineer` | orange | Project setup (Vercel-first; Docker standalone + PaaS alternative), CI/staging/prod workflows, env reconciliation, Deploy Checklist aggregating all gates, rollback | `frontend-devops-conventions.md` |

Agent names are prefixed so both plugins can be installed side by side without collisions.

## Conventions

Standing baselines in `docs/conventions/`. Every agent loads its file(s) on activation via `docs/conventions/…`, cites sections (`§ …`) in plans, commits, findings, and reports, and proposes updates for the user to approve — no agent edits a convention file unilaterally.

| File | Baseline for |
|------|--------------|
| `frontend-architecture-conventions.md` | Stack baseline and version notes; App Router layout; component model; data fetching & Server Actions; state; routing & boundaries; forms; Tailwind 4 tokens-only styling; GSAP via `useGSAP`; errors; auth/session (Data Access Layer); env; accessibility; performance budgets; TypeScript; engineering workflow (TDD, labels, handoffs); Review Report, ADR, Tech Design Doc templates; Spec-Kit mapping and backend handoff |
| `design-conventions.md` | Constitution / Spec / Clarification / DDR shapes; Spec Quality Bar; Screen States Matrix; design tokens (`@theme`); typography; color; layout & breakpoints (360 / 768 / 1280); motion principles; component states; accessibility baseline (WCAG 2.2 AA); UX writing; anti-patterns; design handoff |
| `frontend-qa-conventions.md` | Pyramid by posture; Vitest/RTL, Playwright, axe, visual regression, Lighthouse CI defaults; browser & device matrix; Test Plan / Test Pass / Bug templates; regression scope; exploratory checklist and time-box; fixtures; accessibility & performance gates |
| `frontend-devops-conventions.md` | Scope posture; project setup artifacts; standalone Dockerfile; environment model (local / preview / prod paired to the backend); CI pipeline shape; secrets integration; rollback policy; Deploy Checklist template |
| `frontend-security-conventions.md` | Frameworks of record (OWASP WSTG/ASVS/Top 10:2025/Cheat Sheets, Next.js guidance, STRIDE, Zero Trust); WSTG checklist; Next.js surface map; headers & CSP; sessions; DAL authorization; input/output handling; secrets; supply chain; third-party scripts; logging; rate limiting; posture table; Finding and Threat Model templates |
| `frontend-security-build-vs-buy.md` | Default leans by posture (auth, sessions, bot protection, rate limiting, monitoring, analytics, payments, uploads, secrets, WAF, consent, pentest…); Decision Template; revisit triggers; per-project Decisions Log |

Defaults you may want to adjust for your own projects: **pnpm** as package manager, **Node 22**, **Vercel** as primary hosting target, breakpoints of record **360 / 768 / 1280**, First Load JS budget **180 kB / route**.

## Install

```bash
# from a local checkout
claude plugin install ./solo-founder-dev-team-front

# or add the packaged file via the Claude UI: solo-founder-dev-team-front.plugin
```

Validate with `claude plugin validate .claude-plugin/plugin.json`.

## Working with the backend team

1. **Constitution:** if the backend team's Product Strategist already produced the product constitution, the UX Strategist inherits it and only appends *Experience Principles*.
2. **Contract of record:** the backend `/plan` API table or its OpenAPI document. The Frontend Architect's **Contract Gate** refuses to mark a plan *Ready for /tasks* without it — or labels affected tasks **Pre-Contract**, defines the MSW handler the Engineer codes against, and emits a *Contract Request* for the backend team.
3. **Posture:** one posture per product, shared by both repos.
4. **Routing:** API defects found by any frontend role route to the backend team via you — no silent client-side workarounds.

## Quick start

```
1. "Use ux-strategist: draft the constitution for <project>" (or the Experience Principles appendix)
2. "Use ux-strategist: spec the <feature> journey"
3. "Use frontend-security-engineer: review the spec — posture MVP"          → threat model
4. "Use frontend-architect: plan <feature>; contract: <openapi path>"       → plan + tasks
5. "Use frontend-qa-engineer: derive the test plan for <feature>"           → /checklist
6. "Use frontend-engineer: repo <path>; start task 1"                       → one task at a time
7. "Use frontend-reviewer: review branch feat/<slug>"                       → APPROVE / CHANGES / BLOCK
8. "Use frontend-security-engineer: review the commits"                     → findings
9. "Use frontend-qa-engineer: run the test pass on the preview URL"        → PASS / FAIL
10. "Use frontend-devops-engineer: prepare the prod deploy for v<X>"        → GO / NO-GO
```

## License

MIT — see `LICENSE`.
