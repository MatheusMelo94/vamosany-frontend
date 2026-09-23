# Frontend DevOps Conventions

> Standing DevOps patterns for own-product frontend development.
> Loaded by Frontend DevOps Engineer.
> Update here once — every role picks up the change.

---

## Scope Posture

Frontend DevOps in this workspace is small-scale: **Vercel-first** (zero-config Next.js hosting with preview deployments per branch), with **Docker + PaaS** (Render, Railway, Fly.io) as the alternative when the project must co-locate with the backend or avoid vendor lock-in. Explicit non-goals:
- Kubernetes
- Terraform / IaC at platform scale
- Custom CDN or edge network engineering
- Multi-region SRE

Target is chosen per project at setup and recorded in `CLAUDE.md`. When a project outgrows this posture, that's an architectural decision (route to Frontend Architect for an ADR), not a unilateral DevOps expansion.

---

## Project Setup

Every new project gets these artifacts from day one (per `frontend-architecture-conventions.md § Multi-target Deployment`):

| Artifact | Purpose | Default location |
|----------|---------|------------------|
| `run-local.sh` | One-command local dev start (`pnpm install --frozen-lockfile && pnpm dev`) | repo root |
| `.env.example` | Placeholder env vars with public/secret annotation | repo root |
| `Dockerfile` | Standalone container build (all targets; required for PaaS) | repo root |
| `docker-compose.yml` | Local stack when backend/DB run locally (frontend + backend + Mongo) | repo root |
| `vercel.json` *(Vercel target)* or `render.yaml` / `railway.toml` / `fly.toml` *(PaaS target)* | Deploy config | repo root |
| `lighthouserc.json` | Lighthouse CI budgets (MVP+) | repo root |
| `.github/workflows/ci.yml` | Typecheck + lint + test + build + e2e on every push | `.github/workflows/` |
| `.github/workflows/deploy-staging.yml` | Deploy on merge to `main` | `.github/workflows/` |
| `.github/workflows/deploy-prod.yml` | Manual-trigger production deploy | `.github/workflows/` |
| `.github/dependabot.yml` (or Renovate config) | Dependency updates, grouped weekly | `.github/` |

`package.json` scripts of record: `dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `test:watch`, `test:e2e` (`playwright test`), `lhci`, `analyze` (`ANALYZE=true next build` with `@next/bundle-analyzer`).

---

## Dockerfile Baseline

For Next.js 15 projects (`next.config.ts` → `output: 'standalone'`):

- Base image: `node:22-alpine` for all stages; `corepack enable` to get the pinned pnpm version from `packageManager` in `package.json`
- Multi-stage: `deps` (install with `--frozen-lockfile`) → `build` (`pnpm build`) → `runner` (copies `.next/standalone`, `.next/static`, `public/` only)
- Non-root user: `RUN addgroup -S app && adduser -S app -G app` then `USER app`
- Runtime env: `NODE_ENV=production`, `PORT` from env (default 3000), `HOSTNAME=0.0.0.0`, `NEXT_TELEMETRY_DISABLED=1`
- `HEALTHCHECK CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/api/health || exit 1` — the project ships a minimal `app/api/health/route.ts`
- `NEXT_PUBLIC_*` values are build-time and public: pass them as `ARG`/`ENV` in the `build` stage and document them as non-secret; real secrets are **never** build args
- No secrets baked in — server secrets arrive at runtime via env

---

## Environment Model

Three environments per project:

| Environment | Purpose | Secret source |
|-------------|---------|---------------|
| `local` | Developer machine | `.env.local` (gitignored); template in `.env.example` |
| `preview` (staging) | Every PR / `main` deployment on the hosting target | Vercel *Preview* env vars, or managed secrets vendor (Doppler/Infisical, per `frontend-security-build-vs-buy.md`) injected in CI |
| `prod` | Production deployment | Vercel *Production* env vars, or the same vendor with a separate project/scope |

Env validation runs at build (`lib/env.ts`) — a missing variable fails the deploy, never the user. The frontend's `API_BASE_URL` points at the backend's matching environment (local → local, preview → backend staging, prod → backend prod); cross-wiring is a NO-GO.

---

## CI Pipeline Shape

Default GitHub Actions workflows. Actions are pinned to a commit SHA (see `frontend-security-conventions.md § Supply Chain`).

### `ci.yml`
- Trigger: every push, every PR
- Steps: checkout → `corepack enable` + setup Node 22 with pnpm cache → `pnpm install --frozen-lockfile` → `pnpm typecheck` → `pnpm lint` → `pnpm test` → `pnpm build` (cache `.next/cache`) → Playwright job (`pnpm exec playwright install --with-deps chromium`, `pnpm test:e2e`, upload `playwright-report/` on failure) → Lighthouse CI against the built app (MVP+)
- Bundle guard: fail if any route's First Load JS exceeds the budget in `frontend-architecture-conventions.md § Performance Budgets` (script reads `.next/build-manifest` or `next build` output)
- Required to pass before merge

### `deploy-staging.yml`
- Trigger: push to `main`
- Vercel target: deploy via Vercel Git integration (no workflow step needed) *or* `vercel deploy --prebuilt` from CI when Git integration is off; comment the preview URL on the commit
- PaaS target: build Docker image → push to registry (GHCR) tagged with the SHA → trigger PaaS staging deploy
- Post-deploy smoke: `curl` health endpoint + Playwright `@smoke` tag against the deployed URL; auto-rollback (promote previous deployment) if smoke fails

### `deploy-prod.yml`
- Trigger: `workflow_dispatch` (manual), input: release tag
- Steps: checkout → tag release → Vercel `vercel promote` of the staging deployment (or `vercel deploy --prod --prebuilt`) / PaaS prod deploy of the same image SHA that passed staging
- Requires Deploy Checklist GO recommendation referenced in the run summary
- Never builds a *new* artifact for prod — promotes the one that passed staging

---

## Secrets Integration

Vendor chosen per project by the Frontend Security Engineer in `frontend-security-build-vs-buy.md`. DevOps applies the integration:

- **Vercel env vars:** the default when the target is Vercel; scoped per environment; `vercel env pull .env.local` for local sync (never commit the result)
- **Doppler / Infisical:** `doppler run -- pnpm dev` locally; CI injects via the vendor's GitHub Action; server secrets only
- **GitHub Actions secrets:** deploy tokens and registry credentials only — never application secrets that could leak into a `NEXT_PUBLIC_` value
- **`.env` files:** local-only, prototype-only for anything else; never in MVP+ posture

Never log secrets in CI output. Mask computed values with `::add-mask::`. CI greps the client bundle (`.next/static`) for known secret prefixes as a guard against accidental `NEXT_PUBLIC_` exposure.

---

## Rollback Policy

Every deploy must have a documented rollback plan:

- **Vercel:** instant rollback to the previous production deployment (dashboard or `vercel rollback`); note the deployment id of last-known-good before promoting
- **PaaS / Docker:** last-known-good image tag identified before deploy; rollback command documented (`render rollback …`, `flyctl deploy --image …`)
- **Cache & ISR:** if the release changes cached data shapes, document the `revalidateTag`/purge step and whether the backend must be rolled back in lockstep
- **Contract coupling:** if the release depends on a backend release, the checklist records the backend version and the rollback order (frontend first, unless the backend change is backward-compatible)
- **Time-to-rollback target:** < 5 minutes from decision to traffic-on-old-version

---

## Deploy Checklist Template

```text
# Deploy Checklist: [Project] — [Release Tag] v[N]

- **Date:** YYYY-MM-DD
- **Target environment:** staging | prod
- **Hosting target:** Vercel | Render | Railway | Fly
- **Recommendation:** GO | NO-GO
- **Last-known-good:** [Vercel deployment id | image tag]
- **Backend version depended on:** [tag / "none"]

## Upstream Gates
| Gate | Status | Reference |
|------|--------|-----------|
| Frontend Reviewer | APPROVE / CHANGES REQUESTED / BLOCK | [link] |
| Frontend QA Engineer | PASS / FAIL / PASS-WITH-RESERVATIONS | [link] |
| Frontend Security Engineer pre-deploy sign-off | GO / NO-GO | [link] |

All gates must clear (or have explicit risk acceptance) for GO recommendation.

## Own Readiness Checks
- [ ] `.env.example` reconciled against target environment (no missing vars; no secret in `NEXT_PUBLIC_*`)
- [ ] CI green on the deploy commit (typecheck, lint, test, build, e2e)
- [ ] Bundle budget within limits for every route
- [ ] Preview deployment smoke-tested on a real phone + desktop (primary journey)
- [ ] Security headers verified on the preview URL (`curl -I` — CSP, HSTS, nosniff, frame-ancestors)
- [ ] Lighthouse CI within thresholds (MVP+)
- [ ] Rollback plan documented (last-known-good, command, cache/ISR notes)
- [ ] Domain / DNS / redirects unchanged, or change documented
- [ ] Backend contract compatibility confirmed (version above)

## Risk Acceptance (if any gate is non-clear)
- [What was accepted]
- [Why acceptable for this deploy]
- [Revisit trigger]

## Recommendation Justification
[One paragraph: why GO or NO-GO; cite gates and own checks]

## Sign-Off
- **Status:** Draft | Reviewed | Accepted by user
- **Notes:** [anything affecting the user's deploy decision]
```

Deploy Checklists are versioned. A second pass after fixes produces v[N+1].

---

## Convention Drift

When a project surfaces a deployment pattern not in this file (a new hosting target, an edge function, an image CDN, a cron), the Frontend DevOps Engineer flags it and the user decides whether to update conventions. Same drift-detection pattern as Frontend Architect / Frontend Security Engineer.

---

*Last updated: 2026-09-22*

---
