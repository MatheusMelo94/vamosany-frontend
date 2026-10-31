# Findings Report: vamosany-front-end — Landing "estructura nueva" (DDR-0008) v1

- **Date:** 2026-10-31
- **Type:** Post-implementation Code Review, proportionate depth (change set is mostly copy)
- **Anchor:** No threat model (copy/structure change, no new data flow). DDR-0008 (`docs/ddr/0008-landing-nova-estrutura-em-espanhol.md`).
- **Posture:** **Production**, blocking on CRITICAL + HIGH (as in `2026-09-26_sobre-mi-forms_v1.md`)
- **Exposure context:** the GitHub repository has been **public since 2026-10-11**; everything committed, including history, is world-readable.
- **Framework patch level:** `next@15.5.28` installed (`^15.5.26` in `package.json`), `react`/`react-dom@19.3.0`. Above the fixed versions for the middleware-bypass class (CVE-2025-29927) and the December 2025 RSC advisories. No `middleware.ts`. `npm audit --omit=dev --audit-level=high`: **0 vulnerabilities**.
- **Conventions loaded:** `frontend-security-conventions.md`, `frontend-security-build-vs-buy.md`
- **Scope:** `cdd96a6..HEAD` on `feat/landing-estructura-nueva` (8 commits, `eef1030`..`236c5fe`, not pushed). The untracked root file `ESTRUCTURA NUEVA WEB VAMOS A NY (2).md` (content brief) was also read, see Observations.
- **Surfaces reviewed:** Client Components (`recommendations.tsx` new; `cta.tsx`, `reviews.tsx`, `services.tsx`, `blog.tsx`, `stats.tsx`, `dashboard-preview.tsx`, navbar/drawer/footer, `global-error.tsx`) · Server Components (`app/layout.tsx` metadata/lang, `not-found.tsx`) · Config/headers (unchanged, verified) · Env/bundle · Dependencies (unchanged) · Repo content (`.claude/agents/*.md`). Server Actions / Route Handlers: **absence check**.
- **Framework citations applied:** WSTG-INFO-05, WSTG-CLNT-01/-04/-14, WSTG-ERRH-01, WSTG-CONF-12, WSTG-BUSL-01; ASVS 4.0.3 V7.4.1, V8.3.4, V14.2.1, V14.4.x; Cheat Sheets HTML5 Security (tabnabbing), Error Handling.
- **Bundle audit result:** **Clean.**
- **Header/CSP verification result:** **Unchanged and confirmed locally** (`next start`); preview URL not supplied.

## Checklist results

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | Secrets / env in client bundle | **PASS** | `npm run build` exit 0; all routes `○ (Static)`. Grep of `.next/static` for `sk_(live\|test)_`, `AKIA…`, `ghp_`, `github_pat_`, `xox[bp]-`, `PRIVATE KEY`, `api_key`, `secret`, `VERCEL_`: only React/URL-polyfill library strings (`password:!0`, `s.password=r.password`). No `NEXT_PUBLIC_*` names inlined; the site URL in chunks is `NEXT_PUBLIC_SITE_URL`, public by design (`lib/env.ts` exposes nothing else). No `.map` files in `static`. Only `.env.example` is tracked. |
| 2 | No server mutation surface added | **PASS** | `.next/server/server-reference-manifest.json` has empty `node`/`edge`. No `'use server'`, `fetch(`, route handler or storage API in the diff. `app/api/health` pre-existing, untouched. |
| 3 | Personal data / contact data in committed content | **PASS with 0017** | Added-line scan of the diff for emails, phones, URLs, social handles: only `hola@vamosany.com` (business address, intended) and `tu@email.com` (placeholder). No phone numbers, no WhatsApp/social links. Reviews: first names, "Viajero anónimo", and one full name (0017). Repo-wide email scan at `HEAD`: only synthetic addresses (`sofia@email.com`, `*@ejemplo.com`). |
| 4 | `recommendations.tsx` (new client component) | **PASS** | Static `TABS` constant, rendered as React text (no `dangerouslySetInnerHTML`, no `href` from data). CTAs are `type="button"` with no destination; the only link is a literal `mailto:hola@vamosany.com`. Discount codes are placeholders and are public content by nature (nothing to protect). Affiliate disclosure copy present. Readiness gaps for real links: 0016. |
| 5 | Newsletter form `cta.tsx` (`action="#" method="post"`) | **No new finding; tracked by baseline 0009 (Open)** | Input `#cta-email` has **no `name`**, so a submit POSTs an empty body: the email never leaves the browser. Behaviour changed since 0009 was written: `POST /` now returns **405** (verified on `next start`), so a visitor who submits lands on an error response instead of the page. Same for the footer form. New copy ("ser la primera en enterarte…") strengthens the visitor's belief that they subscribed. CSP `form-action 'self'` holds. See Observations. |
| 6 | `global-error.tsx` showing `error.digest` | **PASS** | Renders only the digest (`Referencia: <digest>`), never `error.message` or the stack. In production the digest is an opaque hash Next generates for log correlation; it carries no internals. Rendered as a React text node (escaped). Acceptable per § Error Responses. |
| 7 | Headers / CSP | **PASS (unchanged)** | `next.config.ts` not in the diff. `curl -I` on `next start`: CSP (`default-src 'self'; … form-action 'self'; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests`), HSTS preload, XCTO, XFO DENY, Referrer-Policy, Permissions-Policy, COOP; no `X-Powered-By`. `<html lang="es">` served. |
| 8 | Dependencies / supply chain | **PASS** | No change to `package.json`, `package-lock.json`, `.npmrc`, `.github/`, `vercel.json`. |
| 9 | `.claude/agents/*.md` model settings | **PASS** | One-line `model:` changes. No tokens, paths with credentials, or private data; these files were already public. |

## Findings summary

| ID | Severity | Blocking | Top 10:2025 | Title | Surface | Owner |
|---|---|---|---|---|---|---|
| 0016 | INFO | No | A06 Insecure Design | Affiliate-link readiness: no external-link path in `Button`; future affiliate links need `rel="sponsored noopener noreferrer"`, https-only typing and an allowlist | Client Component | Frontend Architect (component API), Frontend Engineer (implementation) |
| 0017 | INFO | No | A06 Insecure Design (privacy by design) | One reviewer shown with full name in a public site and public repo history; confirm written consent | Client Component (content) | UX Strategist / content owner (user) |

**Counts:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 0 · INFO 2.
**Blocking at Production:** **none.**
**Carried over, still Open:** baseline 0009 (LOW, newsletter forms with no consumer); Sobre mí 0013–0015, untouched by this branch.

---

# Finding 0016: Affiliate-link readiness — no external-link path in `Button`

- **Severity:** INFO
- **OWASP Top 10:2025:** A06 — Insecure Design
- **Framework citation(s):** WSTG-CLNT-04 (Client-side URL Redirect), WSTG-CLNT-14 (Reverse Tabnabbing); ASVS V14.2.1; Cheat Sheet HTML5 Security § Tabnabbing
- **Surface:** Client Component
- **Affected component:** `features/landing/components/recommendations.tsx:205-207` (CTAs `type="button"`, no destination); `components/ui/button.tsx:54-58` (`href` always renders `next/link`, no `target`/`rel`)
- **Status:** Open
- **Posture:** Production
- **Blocking at this posture:** No

## Description
The recommendation cards will carry affiliate links (DDR-0008). Today the CTAs are inert, so nothing is exploitable. When the links are filled in, the obvious path is `<Button href={affiliateUrl}>`, which renders `next/link` with no `target`, no `rel`, and no scheme check. The project already has the right pattern in `features/sobre-mi/components/external-link.tsx` (`target="_blank" rel="noopener noreferrer"`, `HttpsUrl` type, "(se abre en otra pestaña)" accessible name), but it renders as an underlined text link, not a button.

## Evidence
`button.tsx`: `if (href) { return <Link href={href} className={classes}>…</Link> }`. No external variant. `recommendations.tsx`: `<Button type="button" variant="secondary" className="w-full">{pick.cta}</Button>`.

## Impact
Without a defined path: missing `rel="sponsored"` (search-engine policy for paid links, not a security control but a compliance one), possible `javascript:`/`http:` hrefs if links ever come from a CMS or affiliate feed, and `next/link` prefetch/client routing applied to an off-site URL. Reverse tabnabbing is largely mitigated by modern browsers' implicit `noopener` on `_blank`, but the convention still requires explicit `rel`.

## Likelihood
Low today (no links). Moderate once content is filled in under time pressure.

## Remediation
What the future affiliate links need, in one place:
1. An external variant of `Button` (or a `ButtonLink` that composes `ExternalLink` semantics) rendering a plain `<a>` with `target="_blank"` and `rel="sponsored noopener noreferrer"`, plus the visually hidden "(se abre en otra pestaña)".
2. `href` typed as `HttpsUrl` (reuse `features/sobre-mi/types`) and, per Sobre mí 0015, a unit test asserting every affiliate href in the content module starts with `https://` and its host is in a short allowlist of partner domains.
3. Keep links as plain navigation. Affiliate widgets, tracking pixels or partner scripts would need `script-src`/`img-src`/`connect-src` changes in the CSP and a Third-Party Scripts review (§ Third-Party Scripts) before they are added.
4. Note that `noreferrer` strips the `Referer`; affiliate attribution must come from the URL parameters, which is how most programs work. Confirm with each program before dropping `noreferrer`.
5. Discount codes stay static text; do not copy them to the clipboard through a third-party library.

## Remediation Route
- **Owner role:** Frontend Architect (component API decision), then Frontend Engineer
- **Reason routed there:** design of a shared primitive, then implementation with tests

---

# Finding 0017: One reviewer shown with full name in public content and public repo history

- **Severity:** INFO
- **OWASP Top 10:2025:** A06 — Insecure Design (privacy by design)
- **Framework citation(s):** WSTG-INFO-05 (Review Webpage Content for Information Leakage); ASVS V8.3.4 (sensitive personal data identified and handled per policy)
- **Surface:** Client Component (content)
- **Affected component:** `features/landing/components/reviews.tsx` (one review entry)
- **Status:** Resolved (2026-10-31): the user chose to shorten the surname to an initial ("Laura P."). The unpushed branch history was rewritten before the first push, so the full name never reached the public repo. The text of this finding was redacted the same way.
- **Posture:** Production
- **Blocking at this posture:** No

## Description
Reviewer first names are intended content. One entry publishes a first name and surname of a private individual. It comes from the content brief, so it is likely intended, but it goes further than the other entries, and because the repo is public it is now also in permanent git history once pushed.

## Evidence
Diff of `reviews.tsx`: every other entry is a first name, a couple, "y familia" or "Viajero anónimo"; one entry is `Laura P.`.

## Impact
Low: a name tied to a trip date and service. The concern is consent and the right to erasure (the footer says "Hecho en Madrid", so GDPR applies), which is harder to honour once the name is in public git history.

## Likelihood
Depends only on whether consent exists.

## Remediation
Confirm the reviewer agreed to be named in full. If not confirmed, shorten to "Laura P." **before pushing**, so the full name never reaches public history. Keep a record of review consents with the content brief.

## Remediation Route
- **Owner role:** UX Strategist / content owner (the user decides)
- **Reason routed there:** content and consent decision, not code

---

## Observations (no finding)

- **Newsletter forms (baseline 0009, LOW, Open).** Still no `name` on the inputs, so no email is transmitted. Since 0009 was written, `POST /` returns **405**, so a submit now shows an error response. Not a security regression; the promise in the copy is the problem. Options until a provider exists (BUY per Default Leans, with double opt-in and bot protection): render the button disabled with "Muy pronto", or keep the form out of the page. When it is wired, the 0009 remediation applies in full (Server Action or provider form, zod, rate limit, honeypot/Turnstile, privacy policy link that resolves, consent checkbox). Owner stays as in 0009.
- **Untracked content brief at repo root** (`ESTRUCTURA NUEVA WEB VAMOS A NY (2).md`, 249 lines). Contains reviewer names, prices and the business email, no phones or private emails. Do not commit it to the public repo by accident (`git add .`/`-A`): move it out of the repo or add it to `.gitignore`. If it should be versioned, put it in `docs/` deliberately, after 0017 is decided.
- **Inert CTAs** (`type="button"` with no destination) in `cta.tsx`, `dashboard-preview.tsx`, `recommendations.tsx`: no security impact; UX/content follow-up per DDR-0008.
- **`app/layout.tsx` inline script** (`dangerouslySetInnerHTML`, motion gate): pre-existing, static, untouched by this branch.

## Recommended action

**GO** for merging and deploying this branch at Production posture. No CRITICAL, HIGH or MEDIUM findings; headers, CSP and bundle unchanged and clean; no dependency changes. Decide 0017 **before the first push** (it is the only item that cannot be undone afterwards). Address 0016 before the first real affiliate link lands. Preview-URL header check remains owed at pre-deploy sign-off.

## Convention drift

1. **§ Third-Party Scripts / new § "Outbound and affiliate links":** "Monetized outbound links render as `<a target="_blank" rel="sponsored noopener noreferrer">`, `href` typed `https://` and checked against a partner-domain allowlist in a unit test; affiliate widgets or pixels require a CSP and Third-Party Scripts review."
2. **§ Logging & Monitoring / content:** "Public repo: personal data of real people (reviews, testimonials) is limited to what consent covers, decided before the first push."

*Suggested convention update: add a § for outbound/affiliate links (item 1) and a line on testimonial content in public repos (item 2). Want me to draft it?*

## Sign-Off
- **Status:** Draft (awaiting user review)
- **Reviewer:** Frontend Security Engineer
- **Approver:** Matheus Melo
