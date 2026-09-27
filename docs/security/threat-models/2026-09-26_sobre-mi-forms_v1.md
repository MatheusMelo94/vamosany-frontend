# Threat Model: vamosany-front-end — Sobre mí (5 pages, 2 UI-only forms, motion, external links, navbar) v1

- **Date:** 2026-09-26
- **Gate:** G1 (`docs/specs/sobre-mi/tasks.md`), pre-implementation Spec & Plan review
- **Reviewed artifacts:** `docs/specs/sobre-mi/{spec,plan,tasks,contract-request}.md`, `docs/tech-design/sobre-mi.md`, `docs/specs/constitution.md`, `docs/security/findings/2026-09-22_production-baseline-review_v1.md`, `docs/decisions-2026-09-23.md`, `next.config.ts`, `.github/workflows/ci.yml`, `lib/env.ts`
- **Scope change (user, 2026-09-26, after the plan was written):** there is **no backend connection in this release**. The forms make **no network request**: no Server Action delivery, no `FORMS_API_*` env var, no endpoint. A valid submit shows the banner "Por ahora, escribime a hola@vamosany.com." The plan's delivery design (plan § 5, T026, T027, T031, `contract-request.md`) becomes future work (§ 6). The Architect needs to re-plan M3 to match; that's routed, not decided here.
- **Posture:** **Production**, blocking on CRITICAL and HIGH (baseline findings report, plan header, `docs/decisions-2026-09-23.md`). The companion `vamosany-back` is also at a production bar.
- **Framework patch level:** `next@15.5.26` = the current 15.5 `backport` tag. `npm audit --omit=dev` shows 0 vulnerabilities. No `middleware.ts`. **Patched.**
- **Conventions loaded:** `frontend-security-conventions.md`, `frontend-security-build-vs-buy.md`.
- **Surfaces in scope:** [x] Client (form leaves, FaqDeepLink, NavMarker, motion controller, ExternalLink) · [x] Config/headers (impact check only) · [x] Dependencies (T001) · [ ] Server Actions / Route Handlers (**must stay absent**) · [ ] Middleware · [ ] Third-party scripts · [ ] Backend contract (future, § 6)

## 1. Trust boundaries (this release)

| # | Boundary | Notes |
|---|---|---|
| TB1 | Visitor input → DOM (form fields, error and banner states) | React text nodes only. The typed values never leave the browser. |
| TB2 | Visitor input → network | **Must not be crossed.** This includes JS-disabled and pre-hydration submits (§ 3, R-01). |
| TB3 | URL fragment → DOM lookup (`FaqDeepLink`) | Lookup key only. |
| TB4 | Site → third-party origins | Plain `<a target="_blank">` to partner sites, Instagram, TikTok, and `mailto:`. No embeds or SDKs. |
| TB5 | Build → client bundle | No new env vars or secrets in this release. |

Lazy GSAP chunks (`next/dynamic`) load from `/_next/static` on the same origin. The navbar change (DDR-0002/0003) uses static internal hrefs, `usePathname` and `aria-current`. **Neither introduces a trust boundary.**

## 2. STRIDE (release scope)

| | Threat | Mitigation | Anchor |
|---|---|---|---|
| **S** | None. There is no identity, session or endpoint. | — | — |
| **T** | A crafted URL hash (`#"><img…>`, malformed `%`-encoding, very long) reaches `FaqDeepLink`. | R-04 | WSTG-CLNT-06 |
| **R** | None. Nothing is recorded or sent. | — | — |
| **I** | (1) **Form values leak into the URL, access logs, browser history or `Referer`** through a native submit when JS is off or before hydration. (2) Form values persisted to `localStorage` or similar as "draft" convenience. (3) Referrer leakage to partner sites. | (1) R-01. (2) R-02. (3) `Referrer-Policy: strict-origin-when-cross-origin` (live) + `rel="noopener noreferrer"` (R-05). | ASVS V8.3.1; WSTG-CLNT-12, CLNT-14 |
| **D** | None new. Static prerendered pages; no endpoint to flood. | — | — |
| **E** | A leftover `'use server'` module or Route Handler from the original plan would become a public endpoint. | R-03 | WSTG-APIT / ATHZ; § Next.js Surface Map |
| **XSS (T/E)** | User text rendered unsafely: `dangerouslySetInnerHTML`, or passed to SplitText or other DOM-rebuilding motion helpers (M8 shake/banner). | React text only; R-06 | WSTG-CLNT-01, INPV-01; Cheat Sheet DOM-based XSS |

## 3. Findings and required controls (this release)

| ID | Severity | Blocking | Top 10:2025 | Control (becomes a task or an acceptance line) | Owner |
|---|---|---|---|---|---|
| **R-01** | **MEDIUM** | No | A06 Insecure Design | **No form value may leave the browser in any mode.** A plain `<form>` with named inputs does a native GET submit when JS is disabled or when the Visitor taps "Enviar" before hydration (likely on a 360 phone, with lazy chunks). That puts name, email and message in the query string, Vercel logs and history. It's the same pattern as baseline Finding 0009. **Acceptance:** with `javaScriptEnabled: false`, and on a click before hydration, submitting a filled form causes **no navigation and no request carrying field values**. Implementation is the Architect's choice. Options: (a) no `name` attributes (controlled inputs, `autoComplete` kept), plus `method="post"` with no action target, or a submit that stays `type="button"` until hydrated; (b) a `<noscript>` block showing the fallback email banner. A Playwright test asserts that no request's URL or body contains the synthetic values. | Frontend Architect → Frontend Engineer |
| **R-02** | LOW | No | A04 / A06 | No persistence of form values (`localStorage`, `sessionStorage`, IndexedDB, cookies). Values live in React state only. G2 greps for storage APIs. | Frontend Engineer |
| **R-03** | LOW | No | A01 Broken Access Control | **No Server Action or Route Handler in this feature.** No `'use server'` and no new `app/api/**`. The build's server-action manifest has no entry for these routes. No `fetch` or `navigator.sendBeacon` in the form leaves. G2 checks the build output. | Frontend Engineer |
| **R-04** | LOW | No | A05 Injection | `FaqDeepLink`: `decodeURIComponent` inside try/catch; lookup via `getElementById` restricted to known `data-sm-anchor` ids; no selector concatenation; unknown or malformed hash → no-op (test with `#%E0%A4%A`, `#"><img>`, and a 5 KB hash). | Frontend Engineer (T022) |
| **R-05** | LOW | No | A05 | `ExternalLink` accepts only `https:` (a unit test iterates every external href in the content modules) and always renders `rel="noopener noreferrer"`. No `<iframe>`, `next/script` or social embeds in the feature. INFO: add a periodic partner-link check to QA regression, because a domain that expires can be re-registered by someone else. | Frontend Engineer (T017/T023) |
| **R-06** | LOW | No | A05 | SplitText or any `innerHTML`-based helper targets only static first-party copy, never nodes containing Visitor input. M8 animates wrappers. The planned `<b>x</b>` test runs with motion on and asserts that no `<b>` element is created. | Frontend Engineer (T028/T039) |
| **R-07** | LOW | No | A03 Supply Chain | If T001 still adds `msw` (possibly unnecessary now that nothing is delivered; the Architect decides), the commit body must justify its `postinstall` script (a no-op without `msw.workerDirectory`; don't set that key). | Frontend Engineer (T001) |
| **R-08** | INFO | No | A02 | `ci.yml` has no `.next/static` bundle grep (convention default). No secret exists in this release, so this is backlog. **It becomes required before the first server secret** (§ 6). | Frontend DevOps Engineer |

**Counts:** CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 6 · INFO 1. **No blocking findings at Production posture.**

**CSP and headers impact:** none. No third-party origin, no inline script, and no `connect-src` change. `form-action 'self'` and `frame-ancestors 'none'` stay as they are. Revisit triggers for decisions #7 (static CSP) and #9 (error monitoring), "first dynamic feature", **do not fire**, because this release adds no server-side surface.

**Privacy:** no personal data is collected or transmitted, so no privacy notice is required for this release, provided R-01 holds. (The helper line "Uso tu email solo para responderte." on a form that sends nothing is a UX/copy question for the UX Strategist, not a security issue.)

## 4. ASVS / WSTG for G2

- **ASVS 4.0.3:** V5.3.3 (context output encoding), V8.3.1 (no sensitive data in URLs), V8.2.2 (no sensitive data in browser storage), V14.4.3 (CSP unchanged), V14.2.1 (dependencies).
- **WSTG:** CLNT-01, CLNT-06, CLNT-12, CLNT-14, INPV-01, CONF (headers, bundle), APIT/ATHZ (absence check only).

## 5. G2 — still required, at light depth

Yes, G2 is still needed for this release. The forms put Visitor input into the DOM, the pipeline requires a security gate, and the conventions require a build and bundle grep on every code review. Depth is **light**: a focused review of client leaves and config, not a Server Action review. Checklist:

1. `npm run build`; grep `.next/static` for secret prefixes and env names. Confirm there are no server-action entries for the five routes (R-03).
2. R-01 end to end: JS disabled + pre-hydration submit → no request carries field values, and the URL is unchanged.
3. XSS payloads in every field across field-error and banner states, motion on and off (R-06). No `dangerouslySetInnerHTML` in the feature.
4. No storage APIs in the form leaves (R-02).
5. FaqDeepLink hostile hashes (R-04); external link `rel` and https (R-05).
6. `curl -I` on the preview for the five routes: same header set as `/`.
7. `npm audit --omit=dev --audit-level=high` clean; T001 commit body (R-07).

## 6. When the backend is connected (future requirements, not blockers for this release)

Connecting delivery (a Server Action → server-to-server POST, per the parked `contract-request.md`) is a **new feature** that needs its own spec/plan update and a **new threat model (v2)** before implementation. The G1 review of the original plan produced these requirements; carry them forward.

**Frontend, before delivery code merges**
- **Fail-closed activation:** delivery happens only when both the base URL **and** a server-to-server token are configured, so delivery can't be switched on by setting one env var on Vercel. Server keys go in a `server-only` env module (`lib/env.server.ts`), never `NEXT_PUBLIC_`.
- **Outbound hardening:** `https:` only (loopback excepted for e2e), `redirect: "error"`, env base URL + constant path, response body size cap, zod-parsed response, `fieldErrors` keys filtered to known fields, upstream text never shown (ASVS V5.2.6, V9.2.2).
- **Input policy:** existing zod + max lengths, plus reject control characters, CR/LF and bidi controls in single-line fields (mail header injection, ASVS V5.2.3); `experimental.serverActions.bodySizeLimit` about 64 KB.
- **Logging:** one PII-free line per outcome (form, outcome, upstream status, requestId). Never name, email, text, IP or token (ASVS V7.1.1–2).
- **Honeypot** (BUILD): off-screen, `aria-hidden`, `tabIndex=-1`, an autofill-proof name. On a hit, show Failed with the fallback email, never fake success (UX to confirm).
- **CI bundle grep with a canary token value** (R-08 becomes required).
- **Edge rate limit** (Vercel Firewall rule on POST to the two form routes; confirm plan entitlement), proposed 20 per IP per 10 min.
- **Client IP forwarding** to the backend from Vercel's platform header, sent only with the S2S token.
- **Privacy notice** page linked from both forms and the footer before real PII is collected (ASVS V8.3.3). Counsel confirms jurisdictions (Uruguay Ley 18.331, LGPD, GDPR).
- **Revisit decisions #7 (CSP) and #9 (error monitoring):** the server surface fires both triggers.

**Backend contract (whatever backend or provider the user chooses; provider not decided here)**
- Verify a dedicated, single-purpose bearer token (constant-time compare, rotation with overlap). Never a curator credential.
- Authoritative rate limits per client IP (trusted only on authenticated requests) and per email. Proposed 10 per IP per hour and 3 per email per hour; `429` on breach.
- Re-validate all fields server-side. Output-encode on every consumer surface (backoffice, notification email). No Visitor input in mail headers except an encoded `Reply-To`.
- **No automatic email to the submitted address** (email-bombing vector).
- PII: purpose limited to replying, curator-only access, no PII in logs, retention with a fixed period (proposed 12 months after last exchange; IP 30 days), deletion on request.
- `Idempotency-Key` as a dedup key only; opaque (UUID) ids; error shape with `requestId` and no internals; TLS only; spam signals recorded.

**Build-vs-buy leans to decide then** (no Decisions Log entries proposed now):
- **Rate limiting:** BUY edge (Vercel Firewall) + BACKEND authoritative. An in-memory limiter on serverless is rejected.
- **Bot protection:** BUILD honeypot at connection; Turnstile (registry lean BUY) deferred behind triggers (spam reaching the inbox, an autoresponder, repeated rate-limit hits). Recording that deferral would be a registry deviation.
- **S2S auth:** BUILD bearer secret in Vercel env, fail-closed; HMAC as an upgrade. IP allowlisting is not viable from Vercel egress.
- **PII retention:** BACKEND.
- **Error monitoring:** registry lean BUY (Sentry free tier, PII scrubbing), or a documented skip.

## 7. Convention drift (suggestions; nothing edited)

1. **§ Input & Output Handling:** "UI-only forms (no consumer) must not serialize values on native submit (no-JS and pre-hydration)." This is the second occurrence after baseline Finding 0009.
2. **§ Next.js Surface Map:** "Integrations activated by an env var must fail closed on missing credentials."
3. **§ Client:** "Never pass user-controlled text to text-splitting or DOM-rebuilding animation utilities."

*Suggested convention update: add a § for "UI-only forms and env-activated integrations". Want me to draft it?*

## Sign-Off
- **Status:** Draft
- **Reviewer:** Matheus Melo
- **Notes:** This replaces an unapproved draft of v1 written against the delivery plan before the scope change. Any change that adds a network request to the forms requires v2.
