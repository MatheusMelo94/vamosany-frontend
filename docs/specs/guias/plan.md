# Plan: vamosany-front-end — Guías (home + 12 guides, with photos) v1

- **Status:** **Ready for /tasks.** No open clarification on states or acceptance criteria. Four items need a user answer but none blocks the first 30 tasks (§ Open Questions); one (Q1, the footer) gates a single task.
- **Date:** 2026-11-02
- **Project / repo:** `vamosany-front-end`, branch `feat/guias`
- **Spec:** `docs/specs/guias/spec.md` (Ready for /plan, 2026-11-01) · **Content:** `docs/content/guias.md` · **Prototype:** https://claude.ai/artifact/UcHUFFiweoJnuvBWu9vfMA (illustration; the spec is the contract)
- **DDRs:** DDR-0012 (this feature), DDR-0011, DDR-0004, DDR-0003, DDR-0002 · **ADRs applied:** ADR-0002 (`.gsap` gate), ADR-0003 (headless motion controllers + attribute contract), ADR-0005 (npm), ADR-0006 (frozen landing/navbar/footer), ADR-0008 (opacity reveals). **New ADRs: none** (§ Deviation Gate).
- **Conventions governing:** `frontend-architecture-conventions.md` (§ Component Model, § Routing, Layouts & Boundaries, § Styling, § Animation, § Accessibility, § Performance Budgets, § Engineering Workflow), `design-conventions.md` (§ Screen States Matrix, § Design Tokens, § Motion Principles), `frontend-security-conventions.md § Next.js Surface Map`.
- **Input source / confidence:** UX Strategist spec, *Ready for /plan* → confidence **full**.
- **Stack check:** Next 15.5 / React 19 / TS 5.9 / Tailwind 4 / GSAP 3.15, npm, Node 24 (CLAUDE.md). Matches the baseline except the documented npm/Node/Vercel choices (ADR-0001, ADR-0005). Next patch is the repo's `^15.5.26`; the user should confirm the lockfile resolves a patched 15.5.x before release (middleware-class advisories do not apply: this feature adds no middleware).

## 0. Contract Gate

**No backend contract. Nothing is Pre-Contract.** Every read is static data typed in the repo (spec § Data Dependencies): 12 guides, photos, credits, menu. No endpoint, no Server Action, no Route Handler, no form, no cookie, no storage, no `lib/api/` function, no MSW handler, no Contract Request for the backend team. The only external data dependency is the existing landing section id `/#services` (verified: `features/landing/components/services.tsx:76`, and the navbar's Servicios items already link to it from the Sobre mí pages, so cross-page navigation to the hash has precedent; task GU-37 asserts it for a client navigation and a full load).

## 1. Decisions that were open in the spec (and the Notes for the Architect)

| # | Decision | Choice | Why (citation) |
|---|---|---|---|
| D-1 | **Where the routes live** | New route group `app/(marketing)/(guias)/` with its own 12-line `layout.tsx` (Navbar + `<main lang="es" id="contenido" className="@container/screen">` + Footer), pages under `guias/`. **Not** inside `(cuaderno)`. | § Routing, Layouts & Boundaries: groups organize by shell/audience. The shell is the same as Sobre mí, but the group is named for that family ("cuaderno de campo" pages) and the two families will diverge (Guías get an aside; no `template.tsx`). Touching `(cuaderno)/layout.tsx` risks the Sobre mí baselines (ADR-0006) for 12 lines of glue. Duplication is recorded as a follow-up (shared `SiteShell`, § 13). Cost: a client navigation between a Guías page and a Sobre mí page remounts the navbar (different layout); the menu is closed on navigation anyway. |
| D-2 | **Where the 12 guides live** | **One module per guide**, `features/guias/content/guides/<slug>.ts` (body only), plus a **lean `meta.ts`** (slug, group, menuTitle, title, bajada) that holds every string shared by lists. A join module `guides.ts` builds the full `Guide` from meta + body + photo. | (a) One file per guide gives reviewable per-guide diffs, one commit per guide, and one place for Belén's edits. (b) **The split is forced by the bundle**: `components/layout/navbar.tsx` is `'use client'` and imports `NAV`; if the menu imported the full registry, ~60 kB of guide text would ship in the First Load JS of `/` (baseline 178,492 of 180,000 bytes; § Performance Budgets). The menu imports `meta.ts` only. (c) The spec's rule "a bajada lives in one place" holds: bajada exists only in `meta.ts`; cards, "Más de", pager, dek, menu and `<meta description>` all read it. |
| D-3 | **Internal guide links** | Content type `{ guide: GuideSlug }` (spec § Content Model). `GuideSlug` is a literal union derived from `GUIDE_SLUGS` (`as const` tuple in `content/slugs.ts`), so a typo is a type error; a runtime test also asserts every reference resolves. Rendered by one `Inline` component as `next/link` to `/guias/${slug}` with the target's `menuTitle` as text. No hand-written `/guias/...` strings in content. | § TypeScript Rules (discriminated unions, no stringly typing); § Routing (`next/link` for internal). |
| D-4 | **Menu data** | `features/guias/content/nav.ts` exports `GUIAS_NAV: NavGroup` built from `meta.ts`; `components/layout/nav-config.ts` imports it exactly as it imports `SOBRE_MI_NAV`. The hard-coded "Guías" literal in `nav-config.ts` is deleted. | Single source (spec AC 2); same pattern as DDR-0002's `SOBRE_MI_NAV`. |
| D-5 | **Motion: reuse M1?** | **Reuse, via a separate headless controller** `features/guias/motion/guias-scroll-effects.tsx` that mounts only `[navScrolled, entrance, focusReveal]`, imported from `features/sobre-mi/motion/scenes/*` and the existing `sm()` attribute contract. It does **not** mount `CuadernoScrollEffects`. | ADR-0003 (headless controller, attribute contract); spec § Motion Intent "reuse only if it does not leak Sobre mí-specific scenes". Scenes are pure functions of `{root, eases, contextSafe}`, so reuse is clean and nothing in Sobre mí changes (AC 37). `navScrolled` is required for parity: the landing's controller sets `.is-scrolled` on the navbar and is not mounted on content pages. `focusReveal` completes the H1 reveal if focus enters it (ADR-0008 cond. 2). **The static fallback is not taken.** Cross-feature import of scenes is a smell recorded for a later hoist (§ 13). |
| D-6 | **404 for unknown slugs** | `export const dynamicParams = false` + `generateStaticParams` over `GUIDE_SLUGS` + `notFound()` in the page/`generateMetadata` for any slug that slips through. Add `app/(marketing)/(guias)/guias/not-found.tsx` (renders inside the Guías shell, so no second `<main>`; two buttons: "Volver al inicio", "Ver todas las guías"). **Verification step in GU-31:** if Next 15.5 does not use the segment boundary for `dynamicParams=false` misses, delete the segment file and rely on the root `app/not-found.tsx` (spec explicitly accepts that). HTTP 404 and `noindex` are asserted in e2e either way. | § Routing (`not-found.tsx` at any segment that can 404 by id); spec § States Matrix. Next emits `noindex` on not-found renders. |
| D-7 | **Photos** | Registry `features/guias/content/photos.ts`: `PHOTOS` (file, subject, author, license, kind) declared once per file; `GUIDE_PHOTOS` (per-guide use: photo id, Spanish alt, focal point). `next/image` with `fill` inside a reserved `aspect-3/2` box (`bg-surface-1`), `object-cover`, `style={{ objectPosition }}` from the registry. Hero: `priority`, `sizes="(min-width: 48rem) 760px, 100vw"`. Cards: `sizes="(min-width: 62.5625rem) 280px, (min-width: 35.0625rem) 50vw, 100vw"`, `alt=""`; stripe 1 (first row) `priority`, the rest lazy. The credit string is built by one function from the registry. | § Accessibility (engineering rules: `next/image`, meaningful alt), § Performance Budgets (`sizes`, ≤200 kB images). Registry = spec "single source" requirement. |
| D-8 | **Credits test** | Vitest asserts, for every Wikimedia photo used: (i) an entry with the same `file` exists in `public/img/CREDITS.json`, author compatible (footer author is contained in the JSON author) and license equivalent ("Dominio público" ↔ "Public domain"); (ii) rendering `<Footer />` contains the line `${subject} — ${author}, ${license}`. The footer is not modified (it renders as a sync Server Component, so RTL can render it). Brand photos (`kind: "brand"`) are exempt and credit "Foto: Vamos a NY". | Spec § Credits, AC 14, 30; ADR-0006. |
| D-9 | **Layout breakpoints** | Add to the `@theme` block in `app/globals.css`, as **container-query widths of the existing `@container/screen` on `<main>`** (precedent: the four Sobre mí widths approved in plan § 7, 2026-09-26): `--container-guide-facts: 35.0625rem` (≥561 facts in 3 columns, cards 2 columns, pager 2 columns), `--container-guide-aside: 60.0625rem` (≥961 two columns with the aside), `--container-guide-cards: 62.5625rem` (≥1001 four card columns). Plus one custom variant `@custom-variant tall (@media (min-height: 45rem))` for "sticky only when the viewport is ≥720px tall" (container queries cannot see height). No colors, no type, no spacing: these are structural switch points, not design tokens, so spec § Token Proposals ("none") still holds; **Q2 asks the user to confirm** that reading. Fallback if refused: `min-[..]` arbitrary variants with a justification comment (permitted by § Styling), same values. | § Styling (container queries for slot adaptation; arbitrary values need a comment); spec § Responsive Behavior keeps 560/960/1000. One 15 px caveat: a classic desktop scrollbar makes `<main>` 15 px narrower than the viewport, so the 961 switch lands at a ~976 px window there; Playwright's headless Chromium hides scrollbars, so tests are exact. |
| D-10 | **Scroll offset and sticky top** | `scroll-mt-28` (7rem = 112 px) on H2 and `top-28` on the sticky aside, instead of the spec's literal 110 px. Spec delta of 2 px, token-based, keeps focus clear of the navbar (WCAG 2.4.11). The existing `[data-sm-anchor]` rule (96 px) is **not** reused: it is too small for this navbar height. | § Styling (no arbitrary values); spec § Accessibility Acceptance (focus never obscured). |
| D-11 | **Breadcrumb outside the M1 heading** | `[data-sm-heading]` wraps only eyebrow + H1 + dek. The breadcrumb is a sibling above it. | `.gsap [data-sm-scene] [data-sm-heading]` starts at `opacity: 0` until the lazy controller runs; links inside would be focusable while invisible (§ Animation, opacity-reveal rule). |
| D-12 | **Credit casing** | The credit for the Chinatown photo reads "Dominio público" (the footer's string) not "dominio público" (spec table). AC 14 says the credit must match the footer character for character, so the footer wins. | Spec AC 14. |

## 2. Component tree (server / client boundary)

`'use client'` appears in **four** files only. Everything else is a Server Component and renders to static HTML at build time.

```
app/(marketing)/(guias)/layout.tsx                       [server]  Navbar(client, existing) + <main lang="es" id="contenido" class="@container/screen"> + Footer(server, existing, untouched)
├─ guias/page.tsx                                        [server]  metadata export; renders <GuiasHomePage/>
│   └─ features/guias/components/guias-home-page.tsx     [server]  <div data-sm-scene="guias">
│       ├─ <GuiasMotion/>                                [CLIENT]  next/dynamic ssr:false -> guias-scroll-effects (headless, renders null)
│       ├─ <GuideHeading align="center" .../>            [server]  data-sm-heading: eyebrow, H1 (sr-only name + aria-hidden split copy + train), dek
│       └─ 3 × <GroupStripe/>                            [server]  <section aria-labelledby>, alternating canvas/surface-1, eyebrow 01-03, H2, "4 guías"
│           └─ 4 × <GuideCard/>                          [server]  one <Link> (whole card): <Image alt=""/>, H3, bajada, "Leer la guía →"
├─ guias/[slug]/page.tsx                                 [server]  generateStaticParams, dynamicParams=false, generateMetadata, notFound()
│   └─ guide-page.tsx                                    [server]  <div data-sm-scene="guias">
│       ├─ <GuiasMotion/>                                [CLIENT]  (same wrapper)
│       ├─ <Breadcrumb/>                                 [server]  nav aria-label "Ruta"
│       ├─ <GuideHeading align="start" .../>             [server]  eyebrow = group, H1 = page title, dek = bajada
│       ├─ <GuideHero/>                                  [server]  figure: 3:2 box + <Image priority/> + figcaption credit
│       ├─ hr (2px ink)
│       └─ grid: 
│           ├─ <article>
│           │   ├─ <GuideTocDetails/>                    [CLIENT]  <details> "En esta guía" (<=960); closes on choose
│           │   ├─ <Blocks blocks={intro}/>              [server]  p / h3 / ul / ol / tip / fine -> <Inline/> (links, bold, italic, ExternalLink)
│           │   ├─ <KeyFacts/>                           [server]  only when guide.keyFacts; role=list
│           │   ├─ sections.map -> <h2 id tabIndex=-1 scroll-mt-28/> + <Blocks/>   (Visa: the "te-ayudo-con-tu-visa" section renders as the band)
│           │   ├─ <CtaBand/>                            [server]  lead + Button inverse/primary -> /#services   (Visa variant: H2+p+button)
│           │   ├─ afterCta <Blocks/> (Visa disclaimer)
│           │   └─ <Pager/>                              [server]  nav aria-label "Más guías"
│           └─ <aside aria-label="Más sobre esta guía">  (after the article in the DOM, placed right by the grid)
│               ├─ <GuideToc/>                           [CLIENT]  nav "En esta guía" (>=961): anchors + active section + focus on click
│               └─ <MoreInGroup/>                        [server]  nav "Más de <grupo>"; below the pager at <=960
└─ guias/not-found.tsx                                   [server]  (D-6)
```

Boundary rules honored: no `'use client'` on layout or page (§ Component Model); client leaves receive serializable props only (`{ id, label }[]` for the TOC); `GuideToc`/`GuideTocDetails` are the only interactive leaves, `GuiasMotion` is the lazy wrapper (same shape as `CuadernoMotion`: `next/dynamic` with `ssr:false` needs a client wrapper). The fourth client file is the controller itself (`guias-scroll-effects.tsx`, `useGSAP`).

Only one of the two "En esta guía" lists is in the accessibility tree at any width: the aside list is `hidden` below the aside container width, the `<details>` is `hidden` at and above it; both are `display: none`, not visually hidden (spec § Responsive Behavior).

## 3. Routes and states (screen × state → file)

Static content, so the states matrix collapses (spec § States Matrix). Nothing in it is unplanned:

| Screen / surface | State | File | Task |
|---|---|---|---|
| `/guias` | Success | `guias/page.tsx` → `guias-home-page.tsx` | GU-33 |
| `/guias` | Loading | None by design: static, photo boxes reserved 3:2 (`aspect-3/2 bg-surface-1`) so CLS is 0. No `loading.tsx` (route fetches nothing; § Routing requires it only for routes that fetch data). | GU-32 |
| `/guias` | Empty | N/A (12 guides always exist; the registry test enforces it) | GU-17 |
| `/guias`, guides | Error (render failure) | Existing `app/global-error.tsx`. No segment `error.tsx`: there is no recoverable async failure to retry, and a retry button over a static page would be fiction. Recorded as a deliberate omission against § Routing, Layouts & Boundaries. | n/a |
| `/guias`, guides | Partial (photo fails) | The 3:2 box keeps size and `surface-1` fill; text, credit and link still work | GU-24, GU-32 |
| `/guias/<slug>` ×12 | Success | `guias/[slug]/page.tsx` → `guide-page.tsx` | GU-30 |
| `/guias/<unknown>` | 404 + `noindex` | `dynamicParams=false` + `notFound()`; `guias/not-found.tsx` (or root fallback) | GU-30, GU-31 |
| Index (aside) | Active item / unknown hash / top / bottom | `active-section.ts` + `guide-toc.tsx` | GU-27, GU-28 |
| Key facts | 8 guides with box, 4 without (no element) | `key-facts.tsx`, conditional in `guide-page.tsx` | GU-23 |
| Navbar › Guías | 12 linked items, current marked | `features/guias/content/nav.ts`, `nav-config.ts` | GU-35 |
| No JS / Reduced motion / 200% / 320 px / short viewport / hash | Cross-cutting | CSS (no `.gsap`) + e2e | GU-39 |

## 4. Content model (final shape)

Spec § Content Model is adopted with these concretizations. Files:

```
features/guias/
  types.ts                  Inline, Block, GuideGroupId, GuideMeta, GuideBody, Guide, Photo, GuidePhoto, KeyFact, Cta
  content/
    slugs.ts                GUIDE_SLUGS (as const, menu order) ; type GuideSlug
    groups.ts               GROUPS: [{ id, title, anchor, eyebrow "01".."03" }]  (group anchors = ids)
    meta.ts                 GUIDE_META: readonly GuideMeta[]  (LEAN; imported by the navbar)
    queries.ts              guideMeta(slug), groupGuides(groupId), othersInGroup(slug), nextGuide(slug), guideHref(slug)   (pure, lean)
    photos.ts               PHOTOS, GUIDE_PHOTOS, creditLine(photoId)
    guides/<slug>.ts ×12    GuideBody = { intro, keyFacts?, sections, cta, afterCta? }   (verbatim text)
    guides/index.ts         BODIES: Record<GuideSlug, GuideBody>
    guides.ts               GUIDES: readonly Guide[] = meta ⨝ body ⨝ photo ; getGuide(slug) ; (server pages only)
    nav.ts                  GUIAS_NAV: NavGroup  (from meta; consumed by components/layout/nav-config.ts)
    metadata.ts             homeMetadata, guideMetadata(slug)
  lib/active-section.ts     pure rule for the TOC
  components/               § 2
  motion/guias-scroll-effects.tsx, motion/guias-motion.tsx
  __tests__/                § 9
```

- `GuideBody.sections[].id` explicit (spec rule 2), unique per guide, checked against `slugify(h2 text)` from `lib/utils.ts` with the Visa exceptions listed in the spec; `tocLabel` only for "El tope semanal (fare cap)".
- Content is static, trusted, first-party data. There is no `dangerouslySetInnerHTML` anywhere: text is React children; bold/italic/links are typed `Inline` nodes. No zod: zod guards untrusted boundaries (§ Data Fetching), and there is none; compile-time `satisfies` plus the integrity tests are the guard.
- External links (Visa, 2): `ExternalLink` from `features/sobre-mi/components/external-link.tsx` and its `HttpsUrl` type, reused as-is. Test: every href in the Guías content is `https:` or an internal `/guias/...` path (same allowlist as `content-hrefs.test.ts`).
- The Doc's order differs from the menu; `GUIDE_SLUGS` is menu order and the join does not sort.

## 5. Data reads

| Read | Function | Source | Cache mode | Schema |
|---|---|---|---|---|
| Guide by slug | `getGuide(slug)` | `content/guides.ts` (in-repo module) | Fully static: `generateStaticParams` + `dynamicParams=false`; no `fetch`, so no cache directive applies | TypeScript types + integrity tests (no zod, § 4) |
| Menu, cards, pager, "Más de", metadata | `content/meta.ts` + `queries.ts` | in-repo | static | same |
| Photos / credits | `content/photos.ts` | in-repo + `public/img/CREDITS.json` (test-time only; **never imported at runtime**) | static | same |

No `lib/api/`, no DAL/session call: there is no user data (§ Authentication & Session does not apply).

## 6. Data writes

None. No Server Action, no form, no revalidation, no optimistic UI (spec § Data Dependencies).

## 7. State decisions (§ State Management)

1. **URL state:** the section hash (`#id`) is the only shareable state; the TOC never fights it (native anchors; the client updates nothing the browser has not already set).
2. **Server state:** all content, rendered at build time.
3. **Local state:** one `useState<string | null>` for the active section id inside `GuideToc` (the aside). `GuideTocDetails` has no state; it closes the native `<details>` through its ref on link click.
4. **Context / store:** none.

**Active-section rule** (pure function, unit-tested, spec § Motion Intent): input `{ tops: {id,top}[] (viewport-relative), line = 120, atBottom }` → the last section whose `top <= line`; none above the first H2 → the first id; `atBottom` → the last id; hash on load is covered because the same computation runs after hydration and the browser has already scrolled. Listener: one passive `scroll` + `resize` handler throttled with `requestAnimationFrame`; `atBottom` computed as `innerHeight + scrollY >= scrollHeight - 2`. No IntersectionObserver (it cannot express "last above the line" nor the bottom rule without extra sentinels). Initial render (server and first client render) marks **no** item active, which is the no-JS state.

Index click: `onClick` on each link does not `preventDefault`; the browser scrolls (smooth, or instant under reduced motion) and sets the hash; the handler then calls `target.focus({ preventScroll: true })` on the H2 (`tabIndex={-1}`), satisfying AC 23.

## 8. Styling and tokens (§ Styling, design-conventions § Design Tokens)

- Tokens only; mapping from spec § Responsive Behavior: `ink`, `brand`, `surface-1`, `ink-muted`, `hairline`, `canvas`, `inverse-canvas`/`inverse-ink`, `rounded-lg` (20 px). No new color/type/space token; the three `--container-guide-*` widths and the `tall` variant are structural (D-9, Q2).
- Reuse: `container-ds`, `display-xl`/`display-lg`, `body-lg`, `highlight-heading`, `label-button`, `eyebrow`, `Button` (`variant="primary"` on the home card arrow is not a button; the CTA is `Button` with the yellow primary styling, the black band wrapper is `bg-inverse-canvas`), `cn()`.
- New global CSS (all in `app/globals.css`, GU-18): the three container widths, the `tall` variant, and a list-marker utility (`@utility guide-list` for the 10 px yellow square with 1.5 px ink border). The yellow-square marker is a pseudo-element, so it is a utility, not `@apply` in a component (§ Styling).
- Hover lift: reuse the `Button`/card pattern `hover:-translate-y-0.5 transition-[...] duration-150 ease-(--ease-default) motion-reduce:hover:translate-y-0`, pointer-fine only via `[@media(hover:hover)_and_(pointer:fine)]:`-style variant if one already exists; otherwise a justified arbitrary variant (spec AC 12: lift only on pointer-fine).
- Touch targets: existing `tap-target` utility for the index rows, "Más de" rows, pager cells, `<summary>`.
- `scroll-behavior: smooth` is already global with a reduced-motion override (`globals.css:116, 330`); nothing to add.

## 9. Motion strategy (§ Animation; design-conventions § Motion Principles)

- **Only motion:** M1 heading entrance on both templates (spec § Motion Intent), through `guias-scroll-effects.tsx` = `useGSAP(() => { if (!motionEnabled() || !contextSafe) return; … }, { dependencies: [] })`, scenes `[navScrolled, entrance, focusReveal]`. Values come from `MOTION.heading` / `MOTION.page.dekOffset` (no new numbers).
- **Reduced motion / no JS:** the gate is `motionEnabled()` and the `.gsap` class (ADR-0002). Without `.gsap` the hidden initial state (`.gsap [data-sm-scene] [data-sm-heading]`) never applies, so the heading renders in place with the train at 0%. The `entrance` scene already splits only after `document.fonts.ready` and reverts the split on landing.
- **`data-sm-scene="guias"`** goes on the page root together with `<GuiasMotion/>`, as Sobre mí does, because the hidden-state CSS is scoped to `[data-sm-scene]`.
- **Not planned (by spec):** scroll reveals, parallax, reading bar, count-ups, GSAP hover. `data-sm-reveal`, `-parallax`, `-rail`, etc. are never emitted.
- **Known risk, inherited from Sobre mí:** if the lazy controller chunk fails to load, the heading stays at opacity 0 under `.gsap`. Same trade-off as the Sobre mí pages; not widened here. Mitigation already in place (controller loads after hydration, outside First Load JS). Noted for the Reviewer, not a task.
- **LCP guard:** the heading is hidden until the chunk arrives, so on guide pages the **hero photo** is LCP (`priority`, outside `[data-sm-heading]`); on the home the LCP is the first stripe's card photos (`priority`) or the H1 after M1. GU-41 measures it.
- **Fallback (static marker)** is not needed; recorded as available if GU-34 finds a Sobre mí regression (AC 37).

## 10. Accessibility mechanics (§ Accessibility; spec § Accessibility Acceptance)

- Landmarks: layout `main`; page `header` (breadcrumb nav `aria-label="Ruta"`, heading block), hero `figure`, `article`, `aside aria-label="Más sobre esta guía"` holding two `nav`s with their own `aria-label` ("En esta guía", "Más de <grupo>"), pager `nav aria-label="Más guías"`. Home: H1 → three `section`s (`aria-labelledby` → H2) → H3 cards.
- Headings: "En esta guía", "Más de …", "Mi pique" are `<p>`/`<span>` labels. H3 only for the D1/D2 sub-labels.
- H1: sr-only copy + `aria-hidden` visual copy for the split (same as `PageHeader`); the visual copy is `data-sm-split` + `data-sm-train` + `highlight-heading`.
- TOC: real anchors; active item `aria-current="location"` plus yellow fill and bold (non-color cue); H2 `tabIndex={-1}`; focus moves on click. Mobile: native `<details>`/`<summary>`; choosing a link closes it; without JS it stays open.
- Key facts: `<dl>`-free `role="list"` of `listitem`s, figure + label in one item; `aria-label="Datos clave"` (Cuánto cuesta: "Datos clave, precios aproximados").
- Card: whole card one `<Link>`, thumbnail `alt=""`.
- Focus ring: global `:focus-visible` (DDR-0011) works on the black band (yellow ring on black); verified in GU-40.
- 200% text: rem-based aside width and container widths; `min-w-0` + `overflow-wrap:anywhere` on card titles and the Visa URLs (320 px, AC 41).

## 11. Error handling (§ Error Handling)

No expected failures exist (no I/O). Unexpected render failures throw to the existing `global-error.tsx`. Unknown slug → `notFound()`. No `AppError` mapping, no result unions: nothing returns a result.

## 12. Security surfaces (frontend-security-conventions § Next.js Surface Map)

| Surface | Touch | Control required |
|---|---|---|
| Server Components | 2 static pages | No user data, no session: nothing to authorize. Content is first-party static data. |
| Server Actions / Route Handlers / middleware | **none added** | n/a |
| Client | 3 client leaves | No `dangerouslySetInnerHTML`; TOC reads only DOM geometry; no storage, no network, no `window.location` writes. The hash is never interpolated into HTML (the active rule matches it against known ids). |
| External links (Visa ×2) | `ExternalLink` | `target="_blank"` with `rel="noopener noreferrer"`; https-only by type and by test. |
| Open Graph / metadata | `og:image` | Absolute URL from `metadataBase` (`NEXT_PUBLIC_SITE_URL`, already validated in `lib/env.ts`); no user input. |
| `next/image` | local `/img/*.webp` | Same-origin static files; no `remotePatterns` change, `next.config.ts` untouched. |
| Supply chain | **no new dependency** | All needed pieces (next/image, gsap, @gsap/react, clsx, tailwind-merge) are installed. |

The Security Engineer has nothing to threat-model beyond "static content + external links"; a light pre-merge check is enough.

## 13. Performance (§ Performance Budgets)

- **Landing untouched.** `/` First Load JS (baseline 178,492 B gzip, +1,000 B runtime allowance in `perf/first-load.json`) is exposed to exactly one change: `nav-config.ts` now imports `GUIAS_NAV` (lean `meta.ts`) and the 12 items gain `href`. Expected delta: a few hundred bytes. **GU-35 measures it** (`npm run build && npm run check:first-load`). If the guard fails by bytes attributable to the 12 hrefs and the swapped strings, the baseline is raised in the same commit with the measured number in the commit body, and the user is told (this is a code-size change on a frozen surface, not a visual one). Under no circumstances is the full registry (`guides.ts`, `guides/*`, `photos.ts`) imported from `nav-config.ts` or anything the navbar reaches; a test (`nav` import-graph assertion: `GUIAS_NAV` module imports only `meta`/`queries`/types) guards that.
- **New routes:** `/guias` and `/guias/[slug]` First Load JS ≤ 180 kB (conventions budget). Expected ≈ shared chunks + one small client leaf (TOC + details) ≈ a few kB. GSAP lives in the lazy `next/dynamic` chunk, outside First Load. GU-41 records both numbers and, if cheap, extends `check-first-load` coverage to them in CI (the script already takes a route argument; adding two `run: npm run check:first-load -- /guias` lines needs baselines in `perf/first-load.json`).
- **Images:** sources are already optimized `.webp` (700–1100 px, one 1920×465 panorama); a 3:2 box ≤760 px never upscales more than ~1.1×. `sizes` per D-7. `og:image` points at the static file (no optimizer).
- **Fonts:** unchanged (`next/font`, swap).
- `next/dynamic` candidates: only the motion controller (already planned).

## 14. Test plan split (§ Engineering Workflow; frontend-qa-conventions)

**Vitest + RTL** (`features/guias/__tests__/`, `components/layout/__tests__/`): everything that is data or a component.

| File | Covers | Spec AC |
|---|---|---|
| `meta.test.ts` | 12 slugs/groups/titles = spec § Routes table; menu order; bajadas equal the Doc's `**Bajada:**` lines (and the 2 menu blurb changes); Visa title ≠ menuTitle; slug regex `^[a-z0-9-]+$` | 2, 3, 5 |
| `queries.test.ts` | `nextGuide` (subte→aeropuerto, Williamsburg→Visa, Qué llevar→Broadway, Broadway→none); `othersInGroup` returns 3 in menu order | 19, 21 |
| `photos.test.ts` | 12 uses map to the spec files; `band-bridges` twice with different focal; no `hero-*`; every file exists in `public/img`; alt non-empty and not starting "foto de"; credit strings; **every Wikimedia photo has a `CREDITS.json` entry and a rendered `<Footer/>` line** | 14, 29, 30 |
| `guides-fidelity.test.ts` | per guide, `plainText(guide)` equals its section in `docs/content/guias.md` after D1–D7 only, via an enumerated exception table where every exception must be consumed (a dead exception fails); curly quotes, ¿, ×, "8,75" preserved | 27, 28 |
| `guides-integrity.test.ts` | unique section ids per guide, = `slugify(h2)` (+ explicit Visa ids); `tocLabel` only on "El tope semanal"; each `keyFacts[].source` occurs in the guide text; exactly 8 guides with exactly 3 facts, 4 without; `{guide}` refs resolve; hrefs allowlisted; 2 `tip` blocks (subte only), `ol` only in Visa, 2 `fine` blocks, `afterCta` only Visa | 15–17, 20 |
| `active-section.test.ts` | the rule: above first, between, exact line, last section short, bottom, empty list | 22, 26 |
| Component tests | `GuideHeading` (one H1, accessible name = title, order), `Breadcrumb`, `Inline` (guide link text = menuTitle, no brackets; ExternalLink hidden text), `Blocks`, `KeyFacts` (3 items, labelled, absent when undefined), `CtaBand` (both variants), `Pager` (1 or 2 cells), `MoreInGroup`, `GuideToc` (aria-current, focus on click), `GuideTocDetails` (closes on choose), `GuideCard` (one link, `alt=""`), `GuideHero` (alt, priority, caption) | 10, 13–15, 18–20, 22–24 |
| `metadata.test.ts` | titles, descriptions, canonical, OG article + `og:image` path, home = intro text | 33 |
| `nav-config.test.ts`, `navbar.test.tsx`, drawer tests (edit) | 3×4 items with hrefs and new titles/blurbs; "Taxi, Uber o subte" absent; `aria-current` on the current Guías item | 4–7 |
| `nav-weight.test.ts` | `features/guias/content/nav.ts` imports nothing heavy (static import-graph check on its source) | (budget) |
| `styles.test.ts` (Guías block) | `--container-guide-*` and `tall` variant declared in `globals.css` | 11, 25 |

**Playwright** (`tests/e2e/guias/*.spec.ts`, tag `@feature-guias`, projects phone-360 / tablet-768 / desktop-1280): routes and status, 404, menu navigation, CTA to `/#services`, TOC behavior, keyboard path, hash on load, short viewport, no-JS, reduced motion, no horizontal scroll at 320/360/768/1280, 200% text and zoom, axe, tap targets, motion on, visual baselines.

Playwright must be used (not RTL) for: async Server Component rendering of the two routes, `generateStaticParams`/404 status, the real scroll-driven active highlight, sticky behavior, and layout assertions.

## 15. Screenshot baseline impact (ADR-0006, DDR-0011 pattern)

| Baseline | Effect | Action |
|---|---|---|
| `navbar-panel-guides-desktop-1280` and `…-hover-…` | **Changes** (item 3 text, item 4 blurb) | Regenerate through the CI `update-snapshots` label on the PR; review the diff images to confirm only those two strings moved |
| Drawer baselines (`drawer-last-group-*`, `drawer-top-*`) | Change **only if** the Guías group is in the capture; `drawer-top` shows group labels collapsed, so expected unchanged, `drawer-last-group` shows the last group. Verify in the CI diff. | Regenerate only if the CI run reports a diff, and only these |
| All other navbar, landing, Sobre mí baselines | **Must not change** (AC 8, 37). A diff outside the Guías panel is a bug, not a baseline update | Reviewer blocks |
| New: `/guias` and one guide (subte) at 360 / 768 / 1280 | New baselines, first generated in CI | GU-42 adds `tests/e2e/guias/visual.spec.ts` with `maskElements`/`animations: "disabled"` after motion settles; label `update-snapshots` generates the PNGs; locally `ignoreSnapshots` is on, so nothing fails on a dev machine |

Order of operations for the PR: implement → push → CI red on the Guías-panel diff only → add label `update-snapshots` → review the committed PNGs → CI green. (The agent does not push; this is the user's step.)

## 16. A-1 recommendation (how users reach `/guias`)

Not implemented in this plan (spec A-1; the menu is frozen). **Recommendation, for the user to decide later:**

1. **Preferred:** add a single non-numbered row at the foot of the Guías mega-menu panel and the drawer group: "Todas las guías →" linking to `/guias`. It keeps the three-column structure, the trigger's open/close behavior and the marker untouched, gives `/guias` a front door on every page, and costs one DDR amendment (DDR-0013), one `NavGroup.footerLink` optional field, and the same two baseline regenerations (panel, drawer).
2. **Cheap companion, no navbar change:** make the footer's "Guías" column heading a link to `/guias` (the footer is also frozen, so it needs the same DDR).
3. **Rejected:** turning the "Guías" trigger itself into a link (it is a menu button on desktop and a disclosure in the drawer; a link there breaks keyboard and touch semantics).
4. **Until then:** `/guias` is reachable from every guide's breadcrumb and pager, and by URL. For SEO, a sitemap (A-10) is the missing discovery path and is worth the follow-up.

The code is prepared for (1): `GUIAS_NAV` is built in one place, so adding the row later is a one-file change.

## 17. Deviation Gate

No deviation. Checked: no new library; no Pages Router; no `'use client'` on layouts/pages; no `useEffect` data fetching (the TOC's scroll listener is DOM geometry, not data); no raw values (D-9/D-10 use theme widths and spacing tokens); motion has a reduced-motion branch and is the spec's stated intent. Two judgment calls that look like deviations but are not, so no ADR: (a) container-width entries in `@theme` (D-9; precedent plan § 7; confirm in Q2), (b) importing motion scenes across features (D-5; no rule forbids it; hoist suggested below). **No ADR needed.**

## 18. Open Questions

| # | Question | Needed by | Default taken |
|---|---|---|---|
| **Q1** | **The footer still lists "Taxi, Uber o subte"** (`components/layout/footer.tsx:20`, in its "Guías" column, a dead `href="#"`). Spec AC 5 says the string appears "nowhere in the navbar, the drawer or **the site**", but the spec also says the footer is frozen and must not change, and DDR-0012 does not list it. These conflict. Options: (a) change that one string to "Caminar por New York" (a text change on a frozen surface; needs your OK, no baseline impact because the footer is below the fold in current captures, to be verified in CI); (b) leave the footer and amend AC 5 to navbar + drawer. | Before GU-36 | **(b) until you decide.** GU-36 is gated on this; GU-37 asserts the string is absent from navbar and drawer only. My recommendation is (a): a visitor who scrolls to the footer sees a link that no longer exists in the menu. |
| **Q2** | Are the three `--container-guide-*` widths and the `tall` variant in `@theme` acceptable as "structural, not tokens" (D-9)? | Before GU-18 | Yes, per the Sobre mí precedent. If no: arbitrary `min-[..]` variants with comments. |
| **Q3** | Spec A-11: confirm slug `visa-a-estados-unidos` before launch (after launch it needs a redirect). | Before merge to `main` | Keep. |
| **Q4** | A-1 (§ 16): decide later; no code depends on it. | n/a | Not implemented. |

Also noted, not blocking: the footer sentence "Todas las fotos vienen de Wikimedia Commons" is inexact once brand photos appear (spec A-3); untouched.

## 19. Delivery slices (the plan exceeds ~12 tasks, so it is cut at review points)

The spec is one journey and the acceptance criteria stay together, but 43 tasks should not be reviewed as one diff. Stop and review (Frontend Reviewer, optionally the user) at each slice boundary:

- **Slice A (GU-01 to GU-17): content model and the 12 guides.** No UI, no route, nothing user-visible, zero risk to the landing. Done when the fidelity and integrity suites are green for all 12.
- **Slice B (GU-18 to GU-31): the guide page.** Routes `/guias/<slug>` work and are complete; the menu does not link to them yet.
- **Slice C (GU-32 to GU-43): home, menu, motion, E2E, budget, baselines, QA handoff.** The menu swap (GU-35) is deliberately late: the 12 links go live only when both templates exist.

## 20. Convention drift (proposals; I do not edit convention files)

1. **Add a § "Static content pages"** to `frontend-architecture-conventions.md`: content-as-typed-data in `features/<f>/content/`, a lean `meta` module separate from bodies whenever a client component (navbar) needs a subset, fidelity tests against a source document. Sobre mí and Guías now both do this.
2. **Hoist the shared motion pieces** (`entrance`, `nav-scrolled`, `focus-reveal`, `scenes/types`, `attributes`) from `features/sobre-mi/motion` to a neutral `lib/motion-scenes/` (or `features/page-motion/`) so Guías does not import from a sibling feature. A pure move with the existing tests; propose as its own task after this feature ships.
3. **Extract `SiteShell`** (Navbar + `<main lang="es" id="contenido" class="@container/screen">` + Footer) used by `(cuaderno)` and `(guias)` layouts; the two layouts are identical.
4. **Photo-credit registry shared with the footer** (spec already calls it a welcome follow-up): one registry feeding both footer list and page credits; the footer currently hard-codes 11 lines.
5. **Structural breakpoints in `@theme`:** if Q2 is accepted, document "container-query widths for page templates are structural and do not need a Token Proposal" in `design-conventions.md § Design Tokens`.
6. **`next/image` `priority` is `preload` in Next 16** (§ Version Notes): note for the day of the major upgrade.

Contract Requests for the backend team: **none.**
