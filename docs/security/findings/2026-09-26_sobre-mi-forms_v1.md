# Findings Report: vamosany-front-end — Sobre mí, gate G2 (UI-only forms and client surfaces) v1

- **Date:** 2026-09-26
- **Gate:** G2 (`docs/specs/sobre-mi/tasks.md`), **light** depth, post-implementation Code Review
- **Anchor:** Threat model `docs/security/threat-models/2026-09-26_sobre-mi-forms_v1.md` (G1, R-01..R-08)
- **Posture:** **Production**, blocking on CRITICAL + HIGH (unchanged from G1; companion `vamosany-back` at the same bar)
- **Framework patch level:** `next@15.5.26` (15.5 backport line, as at G1). No `middleware.ts`. `npm audit --omit=dev --audit-level=high`: **0 vulnerabilities**.
- **Conventions loaded:** `frontend-security-conventions.md`, `frontend-security-build-vs-buy.md`
- **Scope:** `main..HEAD` on `feat/sobre-mi-pages`, reviewed at `2507f97` (the later `13aa953`, CI/vitest config only, does not touch the reviewed surfaces). Focus: `ed5a145..affd696` (schemas, form primitives, `ContactForm`, `CollaborationForm`, `useUiOnlyForm`, `UiOnlyFormShell`, T044 e2e), `beaa7eb` (`FaqDeepLink`), `ExternalLink` / `RichText`, build output.
- **Surfaces reviewed:** Client Components (form leaves, `FaqDeepLink`, `ExternalLink`, `RichText`, banner, no-JS block) · Config/headers (parity only) · Env/bundle · Dependencies. Server Actions / Route Handlers: **absence check** (R-03). Middleware: none.
- **Framework citations applied:** WSTG-CLNT-01, CLNT-06, CLNT-12, CLNT-14, INPV-01, CONF-12, APIT/ATHZ (absence); ASVS 4.0.3 V5.3.3, V8.2.2, V8.3.1, V14.2.1, V14.4.3; Cheat Sheets DOM-based XSS, HTML5 Security.
- **Bundle audit result:** **Clean.** See item 1.
- **Header/CSP verification result:** **Parity confirmed locally** (`next start`); **preview URL check pending** (item 6).

## G2 checklist results

| # | Item (G1 § 5) | Result | Evidence |
|---|---|---|---|
| 1 | Build + bundle grep; no server-action entries (R-03) | **PASS** | `npm run build` exit 0; all 5 routes `○ (Static)`. `.next/server/server-reference-manifest.json` = `{"node":{},"edge":{}}`. Grep of `.next/static` for `sk_(live\|test)_`, `-----BEGIN`, `AKIA…`, `ghp_`, `xox[bp]-`, `eyJhbGciOi`, `re_…`: 0 hits. Env names: only `NEXT_CACHE_REVALIDATE_TAG_TOKEN_HEADER` (Next.js framework constant). No `.map` files in `static`. `createServerReference` appears once, in the shared framework chunk (React runtime, present in every Next app); no action ids. No `'use server'`, `fetch(`, `sendBeacon`, `XMLHttpRequest` in the feature. Only `app/api/health` exists (pre-existing, not this feature). `lib/env.ts` exposes only `NEXT_PUBLIC_SITE_URL` (public by design). |
| 2 | R-01 end to end (JS off, pre-hydration) | **PASS** | Prerendered `contacto.html` / `trabaja-conmigo.html`: `<form noValidate>` with no `action`/`method`; every `input`/`textarea`/`select` has an `id` and **no `name`**; the form's button is `type="button"` in server HTML (the only `type="submit"` is the pre-existing footer newsletter button). Implicit submission (Enter) is blocked by the HTML spec: no submit button and more than one blocking text field. JS off: form root is `noscript:hidden`, `NoJsBlock` shown (Tailwind 4.3.3 `noscript:` = `@media (scripting: none)`). T044 (`tests/e2e/sobre-mi/forms.spec.ts`) re-run with `--workers=1`: phone-360 14/14 and desktop-1280 all green (4 first-run failures on phone-360 were `ENOENT` on `test-results/.playwright-artifacts-*`, a shared-output-dir collision with a concurrent run; clean on re-run with an isolated `--output`). Manual probe: 24 valid submits across both forms, 0 non-GET requests, 0 requests carrying typed values, URL unchanged. |
| 3 | XSS payloads in every field, Field error + Not-configured, motion on and off (R-06); no `dangerouslySetInnerHTML` | **PASS (motion off / current build) — motion-on PENDING T039** | Payloads `<b>x</b>`, `"><img src=x onerror=…>`, `<script>…</script>`, `javascript:…`, `{{7*7}}${7*7}`, RLO/NUL/CRLF in every text field, both states, `reducedMotion` `no-preference` and `reduce`: 0 `<b>`/`<img src=x>` created, 0 script execution, 0 dialogs, 0 page errors. No `dangerouslySetInnerHTML`/`innerHTML` in `features/sobre-mi` (the one in `app/layout.tsx` is the pre-existing motion gate script, static, out of scope). No SplitText consumer in the feature yet; the M4 controller does not exist, so "motion on" today only means the `.gsap` class is set. **Must re-run after T039.** |
| 4 | No storage APIs in form leaves (R-02) | **PASS** | No `localStorage`/`sessionStorage`/`indexedDB`/`document.cookie` in `features/sobre-mi`, `components`, `lib`, or `static/chunks/app/**`. Values live in `useUiOnlyForm` React state only. |
| 5a | FaqDeepLink hostile hashes (R-04) | **PASS with findings 0013, 0014** | Probe on `/preguntas-frecuentes`: `#%E0%A4%A` (malformed), `#"><img src=x onerror=…>`, 5 KB hash, ~180 KB hash, `#__proto__`, `#a,b[c]`: no throw, nothing opened, no DOM injection, ~410–500 ms page settle (no CPU stall). Decoding is in try/catch; the hash only reaches `getElementById`, never a selector or a DOM write. But the lookup is not restricted to `data-sm-anchor` ids (0013) and the malformed/huge cases are not in the test suite (0014). |
| 5b | ExternalLink `rel` + `https:` only (R-05) | **PASS with finding 0015** | `ExternalLink` always renders `target="_blank" rel="noopener noreferrer"`; `href` typed `HttpsUrl` (`` `https://${string}` ``), `@ts-expect-error` test rejects `http:` and `mailto:`. No `<iframe>`, `next/script` or embeds. The G1 runtime test over every content href was replaced by the type (0015). |
| 6 | `curl -I` on preview, 5 routes vs `/` | **PARTIAL — local PASS, preview PENDING** | Against `next start -p 3100`: `/`, `/sobre-mi`, `/colaboraciones`, `/trabaja-conmigo`, `/contacto`, `/preguntas-frecuentes` return the same 7 headers (CSP, HSTS, XCTO, XFO, Referrer-Policy, Permissions-Policy, COOP) with an identical CSP (hash `954f974f`), no `X-Powered-By`. No preview URL was supplied; the Vercel preview check is still owed before merge to `main`/deploy. |
| 7 | `npm audit --omit=dev --audit-level=high` (R-07 moot) | **PASS** | `found 0 vulnerabilities`. T001 skipped, so no `msw`/`server-only` added; R-07 N/A. |

## Findings summary

| ID | Severity | Blocking | Top 10:2025 | Title | Surface | Owner |
|---|---|---|---|---|---|---|
| 0013 | LOW | No | A05 Injection (defense in depth) | `FaqDeepLink` acts on any element id, not only `data-sm-anchor` targets (R-04 control partially met) | Client Component | Frontend Engineer |
| 0014 | INFO | No | A05 | R-04 hostile-hash cases (malformed `%`, 5 KB) missing from unit/e2e tests | Client Component (tests) | Frontend Engineer |
| 0015 | INFO | No | A05 | R-05 runtime check over content hrefs replaced by a compile-time type; `RichText` non-https branch is unguarded at runtime | Client Component (tests) | Frontend Engineer |

**Counts:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1 · INFO 2.
**Blocking at Production:** **none.**
**G1 carry-over:** R-01 (MEDIUM) **Resolved** by the implementation (evidence item 2). R-02, R-03 **met**. R-06 **met for the current build**, motion-on re-check pending. R-07 **N/A**. R-08 (CI bundle grep, INFO) **still open as backlog**, unchanged: no secret exists in this release; it becomes required before the first server secret (DevOps).

---

# Finding 0013: `FaqDeepLink` acts on any element id, not only `data-sm-anchor` targets

- **Severity:** LOW
- **OWASP Top 10:2025:** A05 — Injection (defense in depth on a DOM source)
- **Framework citation(s):** WSTG-CLNT-06 (Client-side Resource Manipulation), WSTG-CLNT-01; ASVS V5.1.3 (allowlist input validation); Cheat Sheet DOM-based XSS (treat `location.hash` as untrusted)
- **Surface:** Client Component
- **Affected component:** `features/sobre-mi/components/faq-deep-link.tsx:24-30` (`follow()`)
- **Status:** Open
- **Posture:** Production
- **Blocking at this posture:** No

## Description
G1 R-04 required the lookup to be "restricted to known `data-sm-anchor` ids". The component calls `document.getElementById(hash)` and then, for any match, sets `open = true` if it is a `<details>` and calls `scrollIntoView`, then does it again on `scrollend`, `load` and `fonts.ready`. Any element with an id on the page (navbar, footer, `#contenido`, `#newsletter-email`) is a valid target. The hash is never used as a selector or written to the DOM, so there is no injection path. The gap is scope: the component's authority is wider than its purpose, and it widens silently as the page gains ids.

## Evidence
Probe on the production build: `/preguntas-frecuentes#contenido` and `#newsletter-email` are acted on (the browser's native fragment scroll does the same, so there's no new capability today). All 14 `<details>` on the page with an id are FAQ items carrying `data-sm-anchor`; the footer `<details>` has no id. So today the only extra effect over native behavior (opening a `<details>`) can only hit FAQ items.

## Impact
Today: none beyond native fragment navigation. Worst credible future outcome: a crafted link opens or repeatedly re-scrolls to a non-FAQ disclosure (for example a future navbar or consent `<details id>`), which is a UI-redress nuisance. No data exposure, no script execution.

## Likelihood
Easy to trigger, negligible payoff.

## Remediation
After `getElementById`, act only when the resolved element carries the anchor attribute: `if (!target?.hasAttribute("data-sm-anchor")) return;`. Check the resolved element; don't build a selector from the hash. Optionally no-op on hashes longer than a sane cap (for example 200 chars) before decoding. Per `frontend-security-conventions.md § Input & Output Handling` (URL-derived values are untrusted; allowlist).

## Remediation Route
- **Owner role:** Frontend Engineer
- **Reason routed there:** implementation (T022 control line)

---

# Finding 0014: R-04 hostile-hash cases missing from the test suite

- **Severity:** INFO
- **OWASP Top 10:2025:** A05 — Injection
- **Framework citation(s):** WSTG-CLNT-06; ASVS V5.1.3
- **Surface:** Client Component (tests)
- **Affected component:** `features/sobre-mi/__tests__/faq-deep-link.test.tsx` ("unknown or hostile hash" case covers `#no-existe`, `#"><img …>`, `#` only); `tests/e2e/sobre-mi/faq.spec.ts` (unknown hash only)
- **Status:** Open
- **Posture:** Production
- **Blocking at this posture:** No

## Description
G1 R-04 named three cases: `#%E0%A4%A`, `#"><img>`, and a 5 KB hash. Only the second is tested. The try/catch around `decodeURIComponent` is the code path that keeps a malformed escape from throwing inside `useEffect`, and it has no regression test. G2 verified the behavior manually (see item 5a), so this is a coverage gap, not a defect.

## Impact
A future refactor could drop the try/catch or move decoding outside it. A throw inside the effect would break the FAQ's deep-link behavior for that load and surface a client error. No security impact beyond that.

## Likelihood
N/A (regression risk).

## Remediation
Add to the existing unit case: `#%E0%A4%A` (asserts no throw, nothing opened, no scroll), `"#" + "a".repeat(5 * 1024)`, and a hash naming a non-anchor id (pairs with 0013). Per `frontend-security-conventions.md § Input & Output Handling`.

## Remediation Route
- **Owner role:** Frontend Engineer
- **Reason routed there:** implementation (tests)

---

# Finding 0015: R-05 runtime href check replaced by a compile-time type

- **Severity:** INFO
- **OWASP Top 10:2025:** A05 — Injection
- **Framework citation(s):** WSTG-CLNT-04 / CLNT-01 (`href` injection); ASVS V5.1.4; Cheat Sheet XSS Prevention (URL contexts)
- **Surface:** Client Component (tests)
- **Affected component:** `features/sobre-mi/types.ts:4,48` (`HttpsUrl`, `RichSegment`), `features/sobre-mi/components/rich-text.tsx:14-29`, `features/sobre-mi/types.ts:16` (`ClosingAction.href: string`)
- **Status:** Open
- **Posture:** Production
- **Blocking at this posture:** No

## Description
G1 R-05 asked for a unit test that iterates every external href in the content modules. The implementation enforces `https://` with a template-literal type plus per-page tests of specific partner and social links. That is sound for the current static, first-party content, but a type can be bypassed with a cast, and two render paths accept broader strings. `RichText` renders any non-`https://` segment as a plain same-tab `<a href>` (the type limits it to `mailto:`, runtime does not), and `ClosingAction.href` is an untyped `string`. There's no runtime check that would catch a `javascript:` or `http:` value introduced by a cast or, later, by CMS/i18n-sourced content.

## Impact
None today: all hrefs are hard-coded first-party literals. This becomes relevant when content moves to a CMS or translation files (the product is growing to es/pt/en).

## Likelihood
N/A today.

## Remediation
Add one unit test that walks every exported content module (`features/sobre-mi/content/*`) and asserts every `href` matches `^https://`, `^mailto:` or `^/` (not `//`). Before content becomes externally sourced, add a runtime guard in `RichText`/`ClosingRow` that drops non-allowlisted schemes. Per `frontend-security-conventions.md § Input & Output Handling` (URLs).

## Remediation Route
- **Owner role:** Frontend Engineer
- **Reason routed there:** implementation (tests; runtime guard when the content source changes)

---

## Observations (no finding)

- **Footer newsletter form** (baseline Finding 0009) now renders on the five new routes. Its input has no `name`, so a submit POSTs an empty body to the current route: no value leaves the browser. Tracking stays with 0009; no new finding.
- **Schemas:** trimmed, bounded (`FIELD_LIMITS` mirrored as `maxLength`), `z.enum` for selects, errors keyed by known fields. Adequate for a UI-only release. The G1 § 6 input policy (control chars, CR/LF, bidi) is **required when delivery is connected**, not now.
- **Custom events** `sm:field-errors` / `sm:banner` carry only control ids, never values. The M8 motion handlers must keep it that way (included in the post-T039 re-check).
- **Test infra:** concurrent Playwright runs share `test-results/` and collide (`ENOENT` on trace artifacts). Not a security issue; QA/DevOps may want `--output` per run for agents.

## Pending: post-T039 re-check (G2 item 3, motion on)

Re-run after T039 lands, on a fresh `npm run build`:
1. The same XSS payload set in every field, in Field error and Not-configured states, with motion **on** (default `reducedMotion`) and **off**. Assert no `<b>`/`<img>` is created and no script runs (R-06; the planned `<b>x</b>` test with motion on).
2. Review the M4/M8 controller source: SplitText and any `innerHTML`/text-rebuilding helper target only static first-party copy, never `[data-sm-field]` contents, inputs, error lines or the banner; shake/banner motion animates wrappers only.
3. `sm:*` event `detail` still carries ids only; handlers read no field values.
4. Re-grep the new lazy motion chunks for storage APIs and network calls (R-02, R-03).
5. Confirm the server-reference manifest is still empty.

## Pending: preview header check (G2 item 6)

`curl -I` the five routes and `/` on the Vercel preview for this branch and compare the header set and CSP with `/`. Local `next start` parity is confirmed. Owner: Frontend DevOps Engineer, or Security at pre-deploy sign-off once a preview URL is supplied.

## Recommended action

**GO for merging M3 (the UI-only forms) at Production posture.** There are no CRITICAL, HIGH or MEDIUM findings. The G1 MEDIUM (R-01) is resolved with e2e and manual evidence. 0013–0015 are non-blocking and should be fixed opportunistically (0013 is a one-line guard). G2 remains **open for two items**: item 3 with motion on (after T039) and item 6 on the preview URL. Neither blocks M3. Both must be closed before the feature's pre-deploy sign-off.

## Convention drift

Two notes, in addition to G1 § 7 (still pending approval):
1. **§ Input & Output Handling:** "URL-fragment handlers act only on elements carrying an explicit anchor marker (for example `data-*-anchor`), never on arbitrary ids."
2. **§ Input & Output Handling (URLs):** "Content-module hrefs are covered by a runtime scheme test even when typed; types don't survive casts or externally sourced content."

*Suggested convention update: fold these into the G1-proposed § "UI-only forms and env-activated integrations" (or a short § "Client-side URL sources"). Want me to draft it?*

## Sign-Off
- **Status:** Draft (awaiting user review)
- **Reviewer:** Frontend Security Engineer
- **Approver:** Matheus Melo
