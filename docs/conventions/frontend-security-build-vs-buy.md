# Frontend Security Build-vs-Buy Registry

> Living registry of security primitive decisions for the frontend.
> Maintained by the Frontend Security Engineer role.
> Loaded on every Frontend Security Engineer activation.
> The Decisions Log is the only section any role appends to without a per-line edit approval — each entry summarizes a decision the user already accepted.

---

## Default Leans

Leans calibrate to posture. "BACKEND" means the primitive is owned by the companion backend team and the frontend only integrates (cookie, redirect, contract). "LIBRARY" means buy a well-maintained OSS library, don't hand-roll.

| Component | Prototype | MVP | Production | Regulated | Options (in preference order) | Notes |
|-----------|-----------|-----|------------|-----------|-------------------------------|-------|
| Authentication (B2C login, social, magic link) | BACKEND or BUY | BACKEND or BUY | BUY / BACKEND | BUY | Backend-owned session cookie; Auth.js; Clerk; Supabase Auth | Never hand-roll auth flows in the frontend; the frontend renders forms and stores nothing |
| Session storage | BACKEND | BACKEND | BACKEND | BACKEND | httpOnly cookie set by backend/BFF | localStorage tokens are a finding |
| MFA / passkeys | defer | BUY | BUY | BUY (required) | Auth vendor's built-in; WebAuthn via vendor | Building MFA UI from scratch → switch to vendor |
| Form validation | LIBRARY | LIBRARY | LIBRARY | LIBRARY | zod (+ react-hook-form for complex forms) | Single schema client+server |
| HTML sanitization | LIBRARY | LIBRARY | LIBRARY | LIBRARY | DOMPurify (`isomorphic-dompurify`) | Only if rich content exists at all — prefer no raw HTML |
| CSP nonce management | BUILD | BUILD | BUILD | BUILD | `middleware.ts` nonce + `next/script` | Small, framework-native; no vendor needed |
| Bot protection / CAPTCHA | skip | BUY | BUY | BUY | Cloudflare Turnstile; hCaptcha | On public forms and auth screens |
| Rate limiting | skip | BUY | BUY | BUY | Vercel WAF / Cloudflare rules; Upstash Ratelimit in actions | Edge first; app-level for actions |
| Error monitoring (client + server) | skip | BUY | BUY | BUY | Sentry (free tier ok at MVP) | PII scrubbing on by default; source maps uploaded privately |
| Analytics | skip / BUY privacy-first | BUY | BUY | BUY + consent | Plausible; PostHog; Vercel Analytics | No PII in events; consent gate at Regulated/EU |
| Feature flags | BUILD (env) | BUILD (env) or BUY | BUY | BUY | `lib/env.ts` booleans; Vercel Flags; PostHog flags | Build until flags need targeting |
| Payments UI | BUY | BUY | BUY | BUY | Stripe Checkout / Elements; Mercado Pago Checkout Pro | Card data never touches the app; PCI scope stays with the vendor |
| File uploads | BUY | BUY | BUY | BUY | Presigned S3/R2 URLs; UploadThing | Type/size validated server-side; never store user HTML/SVG for inline render |
| Secrets management | env files | BUY | BUY | BUY | Vercel env vars; Doppler; Infisical | Per `frontend-devops-conventions.md § Secrets Integration` |
| Dependency scanning | BUY (free) | BUY (free) | BUY (free) | BUY | Dependabot / Renovate + `pnpm audit` | Grouped weekly; blocking at MVP+ |
| WAF / DDoS | skip | BUY | BUY | BUY | Vercel WAF; Cloudflare | Rate limiting rules live here |
| Consent management (cookies/tracking) | skip | BUILD (simple banner) | BUY or BUILD | BUY | Own banner with real opt-in; CMP vendor | Regulated/EU → vendor with audit trail |
| Penetration testing | skip | skip | BUY | BUY (required) | Vendor; scope from Frontend Security Engineer | Role recommends scope, never performs |
| i18n | LIBRARY | LIBRARY | LIBRARY | LIBRARY | next-intl | Security relevance: locale/redirect injection |
| UI component kit | design decision (DDR) | — | — | — | — | Recorded in `docs/ddr/`, not here |

Default posture for own products going live: Production.

---

## Decision Template

Every security-relevant build-vs-buy choice is assessed with this template before implementation guidance is given. Full assessment file: `docs/security/build-vs-buy/[YYYY-MM-DD]_[component-slug]_v[N].md`.

```text
# Build-vs-Buy: [Component] — [Project]

- **Date:** YYYY-MM-DD
- **Posture:** Prototype | MVP | Production | Regulated
- **Default lean (registry):** BUILD | BUY | BACKEND | LIBRARY
- **Status:** Proposed | Accepted | Superseded

## Component
What primitive, and which feature/spec needs it.

## Project Context
Traffic expectations, data sensitivity, team capacity (solo), budget, existing vendors, backend ownership.

## Options
- **Build:** [what it would take]
- **Buy A:** [vendor, pricing tier]
- **Buy B:** [vendor, pricing tier]
- **Backend-owned:** [if the backend team can own it]

## Analysis
| Criterion | Build | Buy A | Buy B | Backend |
|-----------|-------|-------|-------|---------|
| Effort (days) | | | | |
| Security risk | | | | |
| Cost (monthly at 1× / 10× users) | | | | |
| Fit (Next.js App Router, RSC, Server Actions) | | | | |
| Compliance / data residency | | | | |
| Reversibility (exit cost) | | | | |
| Bundle impact (kB client JS) | | | | |

## Recommendation
One option, stated plainly.

## Rationale
Why, in one paragraph. Cite the registry lean and any deviation from it.

## Revisit Triggers
Conditions under which this decision should be re-opened (see § Revisit Triggers).
```

---

## Revisit Triggers

| Trigger | Typical pivot |
|---------|---------------|
| Feature spec introduces MFA, SSO, or passkeys | Switch auth to a vendor |
| First paying customer / handling card data | Payments must be vendor-hosted (no exception) |
| EU / LGPD scope confirmed | Consent management vendor; analytics with consent gate |
| Traffic > 10× the MVP assumption | Rate limiting and bot protection to edge/WAF |
| Rich text / user HTML enters the product | Sanitization library + CSP review + ADR |
| Posture upgrades (MVP → Production → Regulated) | Re-run every "skip" / "defer" row above |
| A vendor is compromised or discontinued | Exit per the Reversibility column of the accepted assessment |
| Bundle budget breached by a security SDK | Lazy-load / server-side alternative or vendor change |

---

## Decisions Log

Append-only. One line per accepted decision. Format:

`| [YYYY-MM-DD] | [project] | [component] | [decision: BUILD/BUY <vendor>/BACKEND/LIBRARY <name>] | [posture] | [rationale, one clause] | [revisit trigger] | [assessment path] |`

| Date | Project | Component | Decision | Posture | Rationale | Revisit trigger | Assessment |
|------|---------|-----------|----------|---------|-----------|-----------------|------------|
| | | | | | | | |

---

*Last updated: 2026-09-22*

---
