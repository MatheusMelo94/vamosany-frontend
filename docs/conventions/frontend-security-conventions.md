# Frontend Security Conventions

> Standing security baseline for own-product frontend development on Next.js.
> Loaded by the Frontend Security Engineer role on every activation.
> Frontend Architect (and Frontend Engineer) reference this for secure-by-default planning and implementation.

---

## Frameworks of Record

| Framework | Purpose | When applied |
|-----------|---------|--------------|
| **OWASP WSTG** (Web Security Testing Guide) | Primary testing reference — *how to test* | Per-feature testing checklist; pre-deploy review |
| **OWASP ASVS** (Application Security Verification Standard) | Control reference — *what to build* | When defining controls during design/implementation |
| **OWASP Top 10:2025** | Triage / risk classification | Every finding mapped to a Top 10 category |
| **OWASP Cheat Sheet Series** (XSS Prevention, DOM-based XSS, CSP, Clickjacking, Third-Party JavaScript, HTML5 Security) | Implementation guidance for client-side controls | Remediation write-ups |
| **Next.js security guidance** (Server Actions, Data Access Layer, Middleware) | Framework-specific controls | Planning and review of every server-side surface |
| **STRIDE** | Threat modeling | New features and architectural reviews |
| **NIST Zero Trust principles** | Trust posture | Every request, every layer — the browser is never trusted |

WSTG is the primary testing lens. ASVS defines required controls. Top 10 is the triage shorthand.

---

## WSTG Coverage Checklist (per feature)

Not every category applies to every feature — pick what's relevant.

| Code | Category | Apply when (frontend) |
|------|----------|-----------------------|
| WSTG-INFO | Information Gathering | New routes, error pages, headers, source maps, `robots`/`sitemap` |
| WSTG-CONF | Configuration & Deployment | `next.config.ts`, headers/CSP, env exposure, image `remotePatterns`, hosting config |
| WSTG-IDNT | Identity Management | Registration/profile screens, account lifecycle UI |
| WSTG-ATHN | Authentication | Login, reset, MFA screens; cookie handling; BFF routes |
| WSTG-ATHZ | Authorization | Every Server Action, Route Handler, and data function; `middleware.ts`; IDOR through params |
| WSTG-SESS | Session Management | Cookies, logout, session refresh, storage |
| WSTG-INPV | Input Validation | Every form, `searchParams`, dynamic segments, uploads, `dangerouslySetInnerHTML` |
| WSTG-ERRH | Error Handling | `error.tsx`, action result shapes, console leakage |
| WSTG-CRYP | Cryptography | Only if the frontend signs/encrypts anything (it usually shouldn't) — TLS, cookie flags |
| WSTG-BUSL | Business Logic | Multi-step flows, optimistic UI, client-side gating of paid features |
| WSTG-CLNT | Client-Side | XSS, DOM XSS, clickjacking, postMessage, storage, third-party scripts, open redirects |
| WSTG-APIT | API Testing | Route Handlers and Server Actions as endpoints (they are public HTTP endpoints) |

---

## Next.js Surface Map

Every feature is reviewed surface by surface. Server Actions and Route Handlers are **public HTTP endpoints** regardless of which component calls them.

| Surface | Primary threats | Required controls |
|---------|-----------------|-------------------|
| Server Components (`app/**/page.tsx`, async components) | Data over-fetch leaking to client props; auth assumed from layout | `requireSession()` in the data function (DAL); pass minimal projections to client components; `server-only` on data modules |
| Server Actions (`'use server'`) | Unauthenticated invocation; unvalidated input; CSRF via proxied origins; mass assignment | zod-parse input; authorize inside the action; result unions (no thrown internals); `serverActions.allowedOrigins` when behind a proxy; never accept ids the user shouldn't own without ownership check |
| Route Handlers (`app/api/**`) | Same as actions plus method confusion; SSRF in proxies; open CORS | Explicit method handlers; zod on body/query; allowlisted outbound hosts; no `*` CORS on credentialed routes; webhook signature verification |
| `middleware.ts` | Treated as the auth boundary; bypass (e.g., CVE-2025-29927 class) | Redirect/UX only; **authorization always re-checked in the DAL**; keep Next.js patched |
| Client Components | XSS via `dangerouslySetInnerHTML`, `href` injection, DOM sinks; secrets in bundle; token in storage | No raw HTML without sanitization + ADR; URL validation; `NEXT_PUBLIC_` audit; httpOnly cookies only |
| `next.config.ts` / headers | Missing CSP/HSTS; permissive `images.remotePatterns`; source maps in prod | § Default Headers; § Content Security Policy; `remotePatterns` scoped to exact hosts; `productionBrowserSourceMaps: false` |
| Environment | Secret in `NEXT_PUBLIC_`; secret read in client module | `lib/env.ts` split schemas; CI bundle grep; `server-only` |
| Third-party scripts / SDKs | Supply-chain injection; data exfiltration; CSP relaxation | § Third-Party Scripts |
| Dependencies | Malicious/compromised packages; install scripts | § Supply Chain |

---

## Default Headers

For every deployment, set via `next.config.ts` `headers()` (or hosting config), verified with `curl -I` at pre-deploy:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()   (minimal allowlist; extend per feature)
Content-Security-Policy: <strict, nonce-based — see § Content Security Policy>
```

`X-Frame-Options` is superseded by CSP `frame-ancestors 'none'`; send both while legacy browsers matter. `Cross-Origin-Opener-Policy: same-origin` at Production+.

---

## Content Security Policy

Start strict, relax with explicit justification (each relaxation is a finding at Production+ unless documented).

Baseline (nonce generated per request in `middleware.ts`, passed via the `x-nonce` request header and read by the root layout for `next/script`):

```
default-src 'self';
script-src 'self' 'nonce-<nonce>' 'strict-dynamic';
style-src 'self' 'unsafe-inline';            (Tailwind/GSAP need inline styles; tighten with nonces when feasible)
img-src 'self' data: blob: <image hosts>;
font-src 'self';
connect-src 'self' <api origin> <analytics origin>;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
upgrade-insecure-requests;
```

Rules:
- Development may add `'unsafe-eval'` for HMR; production never does.
- GSAP does not require `eval`; if a plugin or third-party script does, that is a build-vs-buy question, not a CSP relaxation.
- Third-party scripts load through `next/script` with the nonce, or `@next/third-parties` — never a raw `<script>` tag.
- `report-to` / `report-uri` to the error-monitoring vendor at Production+.

---

## Session & Token Handling

- Session tokens live in **httpOnly, Secure, SameSite=Lax** cookies (`SameSite=Strict` when no cross-site entry points exist). `Path=/`, scoped domain, explicit `Max-Age`.
- Never in `localStorage`, `sessionStorage`, IndexedDB, or non-httpOnly cookies. A JS-readable token is a HIGH finding at MVP+.
- The frontend never handles raw passwords beyond posting them over TLS to the auth endpoint; no client-side hashing, no local caching.
- Refresh happens server-side (BFF route or backend-set cookie). Logout clears the cookie **and** invalidates server-side.
- CSRF: Server Actions are protected by Next.js's Origin/Host check; behind a reverse proxy set `experimental.serverActions.allowedOrigins`. Mutating Route Handlers require a same-site cookie **plus** Origin verification (or a CSRF token) — SameSite alone is not the control.
- Session-bound UI state (open drawer, drafts) is never a security state.

---

## Authorization (Data Access Layer)

- Authorization is decided **next to the data**: `lib/api/session.ts` (`'server-only'`) exposes `getSession()` / `requireSession()` / `requireRole()`; every Server Component fetch, Server Action, and Route Handler calls one of them.
- `middleware.ts` may redirect unauthenticated users for UX; it is never the only check. Assume middleware can be bypassed.
- Ownership checks (does this user own resource `id`?) live in the data function, never in the UI condition that hides a button.
- Client components receive projections, not principals: `{ id, displayName, role }` — never tokens, emails of other users, or permission blobs beyond what the screen renders.
- Hidden UI ≠ authorization. Any action reachable by URL or by calling the action must enforce the same rule server-side (WSTG-ATHZ, ASVS V4).
- Sequential/guessable ids in user-visible URLs are forbidden (IDOR); the backend contract must expose UUIDs or opaque ids.

---

## Input & Output Handling

- Every boundary parses with zod: Server Action inputs, Route Handler body/query, `searchParams`, dynamic `params`, API responses, webhook payloads. Unknown keys stripped.
- **XSS:** React escapes by default; `dangerouslySetInnerHTML` is forbidden without (a) sanitization through DOMPurify (`isomorphic-dompurify`) with an explicit allowlist and (b) an ADR naming the content source. Markdown rendering uses a sanitizing renderer.
- **URLs:** any user-controlled `href`/`src` is validated (`http(s):` only; `javascript:` and `data:` rejected). `redirect(next)` after auth uses an allowlist of internal paths (must start with `/` and not `//`).
- **Uploads:** validate type by magic bytes server-side (never trust `Content-Type`), cap size, generate the stored filename, never render user-uploaded HTML/SVG inline (`dangerouslyAllowSVG` stays off).
- **postMessage:** always check `event.origin` against an allowlist; never `'*'` targetOrigin with data.
- **Rich embeds / iframes:** `sandbox` attribute, allowlisted `src`, `referrerpolicy`.
- Output encoding for non-HTML contexts (CSV export, JSON-in-attribute) is explicit.

---

## Secrets & Environment

- `NEXT_PUBLIC_*` is **public forever** — inlined at build time into the client bundle. Only non-secret configuration (public API base URL, analytics site id, feature flags).
- Server secrets are read only in `lib/env.ts` (`server` schema) and modules marked `'server-only'`; a client import fails the build.
- `.env.example` committed with placeholders and a `public | secret` column in the README env table; `.env.local` gitignored.
- CI greps `.next/static` for secret prefixes (`sk_`, `-----BEGIN`, vendor-specific) and fails on a hit.
- No secrets in logs, error messages, source maps, client bundles, or repository history. Rotation: quarterly for long-lived; immediately on compromise.

---

## Supply Chain

- Lockfile committed; CI installs with `--frozen-lockfile`. Package manager pinned via `packageManager` in `package.json`.
- New dependencies require: purpose stated in the commit body, weekly downloads and maintenance sanity check, and no install scripts unless justified (`pnpm` blocks lifecycle scripts by default in recent versions — keep it that way; allowlist explicitly).
- `pnpm audit --audit-level=high` in CI at MVP+ (blocking); Dependabot/Renovate grouped weekly updates with CI required.
- GitHub Actions pinned to full commit SHAs, not tags. Third-party actions justified per use.
- Minimum-version policy: Next.js and React patch releases applied within a week of a security advisory; `next` major upgrades via ADR.
- No `postinstall` scripts in the project itself; build steps are explicit `package.json` scripts.

---

## Third-Party Scripts

- Loaded only via `next/script` (with nonce, `strategy` chosen deliberately) or `@next/third-parties`. Raw `<script src>` tags are a finding.
- Each script has a documented purpose, data-collection scope, and consent requirement (Regulated/EU: consent gate before load).
- Subresource Integrity (`integrity`) for statically versioned scripts; vendors that rotate URLs are loaded from a first-party proxy or rejected.
- Analytics never receives PII in URLs or event payloads; user ids are hashed or vendor-anonymous ids.
- Error-monitoring SDK scrubs request bodies, cookies, and headers by default configuration.

---

## Logging & Monitoring

Log explicitly (server side):
- Server Action / Route Handler authorization failures (with request id, user id, resource id)
- Validation failures at boundaries (shape only, no payload)
- CSP violation reports (Production+)
- Rate-limit triggers

Never log (anywhere):
- Tokens, cookies, passwords, API keys
- Full form payloads, request/response bodies in production
- PII in browser console (production builds strip `console.*` except `error` via `compiler.removeConsole`)

Client errors ship to the error-monitoring vendor (build-vs-buy) with PII scrubbing; server logs correlate with the backend via the request id header.

---

## Rate Limiting

Default starting points (edge/WAF preferred — Vercel WAF, Cloudflare; application-level via Upstash Ratelimit inside actions at MVP+):
- Login / signup / password reset actions: 5 attempts per IP per minute, progressive backoff
- Public form submissions (contact, waitlist): 10 per IP per hour + bot protection (Turnstile) at MVP+
- Authenticated mutations: 60 per user per minute (adjust per product)
- Public Route Handlers: 100 per IP per minute
- Lockout policy: temporary + alert > permanent

---

## Error Responses

- Server Actions return `{ ok: false, errors }` with field-level messages from `design-conventions.md § UX Writing`; never the underlying exception.
- Route Handlers return the standard error shape (`timestamp`, `status`, `error` code, `message`, `path`) — aligned with the backend's shape; no stack traces, versions, file paths, or upstream error bodies.
- `error.tsx` shows generic copy plus a retry; the `digest` is logged, never displayed to the user.
- 401 vs 403 vs 404 are deliberate: a resource the user may not know exists returns 404 (no existence leakage).

---

## Project Posture

Security strictness calibrates to project posture. The Frontend Security Engineer asks (or reads from project config) which posture applies:

| Posture | Blocking findings | Notes |
|---------|-------------------|-------|
| **Prototype** | CRITICAL only | Risk acceptance documented for HIGH/MEDIUM |
| **MVP** | CRITICAL + HIGH | Document accepted MEDIUMs |
| **Production** | CRITICAL + HIGH | Default for own products going live |
| **Regulated** | CRITICAL + HIGH + MEDIUM | When handling regulated data (PII, PHI, payments, KYC) — consent gating, stricter CSP |

Posture set per project, recorded in project-level `CLAUDE.md` or `docs/security-posture.md`. Shared with the backend project when both exist — postures do not diverge across the two repos.

---

## Finding Template

```text
# Finding [NNNN]: [Title]

- **Severity:** CRITICAL | HIGH | MEDIUM | LOW | INFO
- **OWASP Top 10:2025:** A[NN] — [name]
- **Framework citation(s):** WSTG-[CODE], ASVS V[N].[N].[N], Cheat Sheet [name] (as applicable)
- **Surface:** Server Component | Server Action | Route Handler | Middleware | Client Component | Config | Env | Third-party | Dependency
- **Affected component:** [file path + line(s)]
- **Status:** Open | Accepted-Risk | Resolved
- **Posture:** Prototype | MVP | Production | Regulated
- **Blocking at this posture:** Yes | No

## Description
What the issue is, in one paragraph.

## Evidence
Code reference, request/response sample (synthetic), bundle grep line, or repro steps.

## Impact
What an attacker can achieve. Worst credible outcome.

## Likelihood
How easy is it to exploit? (Trivial / Easy / Moderate / Hard)

## Remediation
Concrete fix. Cite the `frontend-security-conventions.md` section the fix anchors to (e.g., *per § Authorization (Data Access Layer)*).

## Remediation Route
- **Owner role:** Frontend Engineer | Frontend Architect | UX Strategist | Frontend DevOps Engineer | Backend team (via user)
- **Reason routed there:** [implementation / architecture / scope / deploy config / API contract]

## Acceptance Note (if Status = Accepted-Risk)
- **Accepted by:** [user]
- **Date accepted:** YYYY-MM-DD
- **Reason:** [why risk is accepted at this posture]
- **Revisit trigger:** [condition that should re-open this finding]
```

Findings are immutable once *Resolved* — re-discovered issues open as a new finding referencing the prior ID.

---

## Threat Model Template

```text
# Threat Model: [Project] — [Feature] v[N]

- **Date:** YYYY-MM-DD
- **Reviewed artifact:** [spec / plan path or quoted brief]
- **Posture:** Prototype | MVP | Production | Regulated
- **Surfaces in scope:** Edge/Middleware | Server (RSC / Actions / Route Handlers) | Client | Third-party | Backend contract (check all that apply)

## Trust Boundaries
Every boundary the feature crosses: browser ↔ Next server, Next server ↔ backend API, Next server ↔ third-party, anonymous ↔ authenticated, role ↔ role, user-controlled content ↔ DOM.

## STRIDE Walkthrough

### Spoofing
- **Threats:**
- **Mitigations:** [ASVS control + convention § where applicable]

### Tampering
- **Threats:**
- **Mitigations:**

### Repudiation
- **Threats:**
- **Mitigations:**

### Information Disclosure
- **Threats:**
- **Mitigations:**

### Denial of Service
- **Threats:**
- **Mitigations:**

### Elevation of Privilege
- **Threats:**
- **Mitigations:**

## Required ASVS Controls
Cite by section (V[N].[N].[N]).

## Required WSTG Coverage (for code review phase)
Pull from § WSTG ↔ Layer Mapping.

## Contract Dependencies
Backend endpoints or actions this feature trusts; what the frontend must still validate client-of-server side.

## Open Questions
Numbered. Routed to upstream role (Strategist / Architect / Engineer / Backend team).

## Sign-Off
- **Status:** Draft | Reviewed | Approved
- **Reviewer:** [user]
- **Notes:**
```

Threat models are versioned. A spec/plan change after approval triggers v[N+1].

---

## Build vs Buy

Every security primitive is a make-or-buy decision. See `frontend-security-build-vs-buy.md` for vendor leans, project decisions, and the structured decision template.

---

## WSTG ↔ Layer Mapping

| Layer | Primary WSTG categories |
|-------|------------------------|
| Edge / Middleware / Hosting | INFO, CONF, ATHZ (bypass), CLNT (headers/CSP) |
| Server (RSC data functions, Server Actions, Route Handlers) | ATHN, ATHZ, SESS, INPV, ERRH, BUSL, APIT |
| Client (components, storage, DOM) | CLNT, INPV (client-side), SESS (storage), BUSL (client gating) |
| Third-party scripts & dependencies | CONF, CLNT, INFO |
| Backend contract (consumed) | APIT — reviewed by the backend team; frontend verifies it validates responses and never trusts them for authorization |

---

*Last updated: 2026-09-22*

---
