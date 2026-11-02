# Tasks: vamosany-front-end — Guías v1

- **Plan:** `docs/specs/guias/plan.md` (Ready for /tasks) · **Spec:** `docs/specs/guias/spec.md` ("AC n" = its § Acceptance Criteria) · **DDR-0012**
- **Order:** layered per `frontend-architecture-conventions.md § Engineering Workflow`: schemas/types → data → styles → route skeleton → server components → client leaves → motion → menu → E2E → budget/baselines → QA handoff. There are no Server Actions or reads from an API (plan § 0), so those layers are empty.
- **Rules for every task:** TDD (failing test first, minimal code, `npm run typecheck && npm run lint && npm test`), one conventional commit, body cites the plan decision (D-n) and convention sections, tests line in the body. Tasks marked **build check** also run `npm run build`. Paths are exact; `@/` imports; named exports except Next route files; tokens only. Vitest tests live in `features/guias/__tests__/` unless stated.
- **Labels:** none are Pre-Contract (no contract) and none cite an ADR (none needed). **Gated** = waits for a user answer in plan § 18.
- **Slices** (stop for review at each boundary, plan § 19): A = GU-01–17 · B = GU-18–31 · C = GU-32–45 (GU-44/45 added 2026-11-02 for DDR-0013).
- **First task to start: GU-01.**

Legend per task: **Layer · What · Files · AC (test-checkable) · Test · Cites · Depends**

---

## Slice A — Content model and the 12 guides (no UI)

### GU-01 · Types, slugs, groups
- **Layer:** schemas & types
- **What:** Define the `Inline`/`Block`/`Guide*` types, the ordered `GUIDE_SLUGS` tuple (menu order) with `GuideSlug`, and the 3 groups with id, title, anchor and eyebrow.
- **Files:** `features/guias/types.ts`, `features/guias/content/slugs.ts`, `features/guias/content/groups.ts`, `features/guias/__tests__/groups.test.ts`
- **AC:** 12 slugs, in the order of spec § Routes, all matching `^[a-z0-9-]+$`, unique (AC 2). 3 groups with anchors `moverte-por-la-ciudad`, `barrios`, `antes-de-viajar` and eyebrows 01/02/03 (AC 9, 13). Each group owns 4 slugs.
- **Test:** component (Vitest, pure)
- **Cites:** plan D-2, D-3, § 4; § TypeScript Rules (discriminated unions, strict)
- **Depends:** none

### GU-02 · Guide metadata registry and queries
- **Layer:** data
- **What:** Create the lean `GUIDE_META` (slug, group, menuTitle, title, bajada) and pure queries `guideMeta`, `groupGuides`, `othersInGroup`, `nextGuide`, `guideHref`.
- **Files:** `features/guias/content/meta.ts`, `features/guias/content/queries.ts`, `features/guias/__tests__/meta.test.ts`, `features/guias/__tests__/queries.test.ts`, `features/guias/__tests__/support/guide-source.ts` (parser of `docs/content/guias.md`, shared with GU-04)
- **AC:** Titles, slugs and groups equal spec § Routes; the Visa `title` is "Visa o ESTA: qué necesitás para viajar a Estados Unidos" while its `menuTitle` is "Visa a Estados Unidos" (AC 3). Each `bajada` equals the Doc's `**Bajada:**` line, except item 4 where the Doc line IS the new blurb and item 3 "Caminar por New York" (AC 5). `nextGuide`: subte→aeropuerto, Williamsburg→Visa, Qué llevar→Broadway, Broadway→undefined (AC 19). `othersInGroup` returns the 3 others in menu order (AC 21).
- **Test:** component (pure)
- **Cites:** plan D-2 (lean module imported by the navbar: must import only `slugs`, `groups`, types); spec § Routes, Content Model rule 1
- **Depends:** GU-01

### GU-03 · Photo registry and credit lines
- **Layer:** data
- **What:** Declare `PHOTOS` (file, subject, author, license, kind), `GUIDE_PHOTOS` (per slug: photo id, Spanish alt, focal point) and `creditLine(slug)`, per spec § Photos.
- **Files:** `features/guias/content/photos.ts`, `features/guias/__tests__/photos.test.ts`
- **AC:** 12 uses map to the files and focal points of spec § Photos; `band-bridges` appears for Financial District (85% 50%) and Williamsburg (45% 50%) (AC 29). No `hero-*` file is referenced. Every file exists under `public/img`. Alt texts are non-empty and do not start with "Foto de". Credit lines read "Foto: <Subject> — <Author>, <License>" using the footer's strings, "Dominio público" for Chinatown (plan D-12), and "Foto: Vamos a NY" for the two brand photos (AC 14). **Every Wikimedia photo used has a `CREDITS.json` entry (same `file`, footer author contained in the JSON author, license equivalent) and `render(<Footer />)` contains its `Subject — Author, License` line** (AC 30; plan D-8). The footer file is not modified.
- **Test:** component (Vitest; reads `public/img/CREDITS.json` with `node:fs`, never at runtime)
- **Cites:** plan D-7, D-8, D-12; ADR-0006 (footer frozen); spec § Photos, § Credits
- **Depends:** GU-01

### GU-04 · Fidelity and integrity harness
- **Layer:** data (test infrastructure)
- **What:** Build `plainText()` for a `Guide`, the Doc-section extractor with the D1–D7 normalizer and an enumerated exception table (each exception must be consumed), the `GUIDES` join (`guides.ts`) over an initially empty `BODIES`, and the integrity checks, parametrized over whatever bodies exist.
- **Files:** `features/guias/content/guides/index.ts` (`BODIES: Partial<Record<GuideSlug, GuideBody>>` until GU-17), `features/guias/content/guides.ts`, `features/guias/__tests__/support/plain-text.ts`, `features/guias/__tests__/guides-fidelity.test.ts`, `features/guias/__tests__/guides-integrity.test.ts`
- **AC:** (a) Fidelity compares block by block, fails on any word, quote, "¿", "×" or "8,75" difference outside D1–D7 (AC 27) and treats the "Cómo se paga" reorder as the documented A-8 exception (AC 28). (b) Integrity: section ids unique per guide and equal to `slugify(h2)` unless in the Visa explicit list; `tocLabel` appears only on "El tope semanal (fare cap)"; every `keyFacts[].source` occurs in the guide's plain text (AC 17); every `{ guide }` resolves; every `href` is `https:` or `/guias/<slug>` (G2 allowlist as in `features/sobre-mi/__tests__/content-hrefs.test.ts`). (c) A dead exception fails the suite. (d) The harness proves it can fail: one self-test feeds a deliberately altered guide and expects a diff.
- **Test:** component (pure)
- **Cites:** plan § 14, D-2; spec § Content Fidelity, § Content Model rules 2–8; reuse the style of `features/sobre-mi/__tests__/verbatim.ts`
- **Depends:** GU-02, GU-03

### GU-05 · Guide body: El subte, explicado
- **Layer:** data (content)
- **What:** Write the body verbatim: intro, key facts (USD 3 / USD 35 / 24 h), sections with `tocLabel` "El tope semanal", the two `tip` blocks, the "Cómo funciona" H3 (D2), CTA lead and label.
- **Files:** `features/guias/content/guides/el-subte-explicado.ts`, registered in `guides/index.ts`
- **AC:** Fidelity and integrity green for this slug. Exactly 2 `tip` blocks; in "Cómo se paga" the payment methods are one list followed by the callout (D4/A-8, AC 15, 28). `keyFacts` = 3, sources `USD 3`, `USD 35`, `24 horas` (AC 16, 17). Section "El tope semanal (fare cap)" has id `tope` (spec AC 26 example).
- **Test:** component
- **Cites:** spec § Key Facts, § Content Fidelity (D2, D4)
- **Depends:** GU-04

### GU-06 · Guide body: Desde el aeropuerto
- **What:** Verbatim body; intro is two paragraphs (opening + "Dato clave antes de arrancar") with the key-facts box after both; D1 sub-labels as H3; `{ guide: "el-subte-explicado" }` link replacing `\[El subte, explicado\]` (D3).
- **Files:** `features/guias/content/guides/desde-el-aeropuerto.ts` (+ register)
- **AC:** Fidelity/integrity green; facts `USD 8,75`, `tarifa fija de USD 70`, `Bus Q70 + subte (gratis + USD 3)` found in text (AC 17); the inline link resolves and carries no brackets in `plainText` (AC 20).
- **Layer / Test / Cites / Depends:** data (content) · component · spec § Key Facts, D1, D3 · GU-04

### GU-07 · Guide body: Caminar por New York
- **What:** Verbatim body, D1 sub-labels (e.g. "High Line") as H3, facts (`se camina en un minuto`, `tres o cuatro minutos`, `entre 15 y 20 mil pasos por día`).
- **Files:** `features/guias/content/guides/caminar-por-new-york.ts` (+ register)
- **AC:** Fidelity/integrity green; 3 facts with sources in text (AC 16, 17).
- **Layer / Test / Cites / Depends:** data (content) · component · spec § Key Facts, D1 · GU-04

### GU-08 · Guide body: Cómo moverte por New York
- **What:** Verbatim body (D5 noise removal on the `**` title), D1 labels, the `{ guide }` link (D3), facts (`USD 3 por viaje`, `Staten Island Ferry (gratis)`, `dentro de las dos horas`).
- **Files:** `features/guias/content/guides/como-moverte-por-new-york.ts` (+ register)
- **AC:** Fidelity/integrity green; link to `el-subte-explicado` resolves (AC 20); 3 facts (AC 16, 17).
- **Layer / Test / Cites / Depends:** data (content) · component · spec § Key Facts, D1, D3, D5 · GU-04

### GU-09 · Guide body: West Village
- **What:** Verbatim body; **no** `keyFacts`.
- **Files:** `features/guias/content/guides/west-village.ts` (+ register)
- **AC:** Fidelity/integrity green; `keyFacts` is `undefined` (AC 16).
- **Layer / Test / Cites / Depends:** data (content) · component · spec § Key Facts (no box) · GU-04

### GU-10 · Guide body: Murray Hill
- **Files:** `features/guias/content/guides/murray-hill.ts` (+ register)
- **What / AC:** Verbatim body, no `keyFacts`; fidelity/integrity green (AC 16, 27).
- **Layer / Test / Cites / Depends:** data (content) · component · spec § Key Facts · GU-04

### GU-11 · Guide body: Financial District
- **Files:** `features/guias/content/guides/financial-district.ts` (+ register)
- **What / AC:** Verbatim body, no `keyFacts`; fidelity/integrity green (AC 16, 27).
- **Layer / Test / Cites / Depends:** data (content) · component · spec § Key Facts · GU-04

### GU-12 · Guide body: Williamsburg
- **Files:** `features/guias/content/guides/williamsburg.ts` (+ register)
- **What / AC:** Verbatim body, no `keyFacts`; fidelity/integrity green (AC 16, 27).
- **Layer / Test / Cites / Depends:** data (content) · component · spec § Key Facts · GU-04

### GU-13 · Guide body: Visa o ESTA
- **What:** Verbatim body under slug `visa-a-estados-unidos`: native numbered list (five steps, `ol`), two external links (`{ href, text }`, https), explicit section ids (`visa`, `esta`, `la-diferencia-en-resumen`, `no-sabes-cual-te-corresponde`, `te-ayudo-con-tu-visa`), CTA in the `{ heading, body, label }` shape from the "Te ayudo con tu visa" section ("Quiero gestionar mi visa"), `afterCta` = the italic disclaimer as `fine`, facts (`USD 185`, `foto de 5×5 cm`, `hasta 90 días`).
- **Files:** `features/guias/content/guides/visa-a-estados-unidos.ts` (+ register)
- **AC:** Fidelity/integrity green; exactly one `ol` with 5 items (AC 15); 2 external hrefs, https (AC 20); the "te-ayudo-con-tu-visa" id exists in `sections`-derived index data even though it renders as the band (AC 18); `fine` present in `afterCta`.
- **Layer / Test / Cites / Depends:** data (content) · component · spec § Content Model rule 4, A-11 · GU-04

### GU-14 · Guide body: Cuánto cuesta un día en New York
- **What:** Verbatim body, `fine` small print ("Los precios son aproximados…"), facts (`entre USD 50 y 70`, `entre USD 120 y 160`, `más de USD 200`) plus a flag for the "precios aproximados" accessible name.
- **Files:** `features/guias/content/guides/cuanto-cuesta-un-dia-en-new-york.ts` (+ register)
- **AC:** Fidelity/integrity green; `keyFacts` has 3; the guide exposes `keyFactsLabel: "Datos clave, precios aproximados"` (type `GuideBody.keyFactsLabel?`, default "Datos clave" applied by the component) (AC 16, 17; spec § Content & Copy).
- **Layer / Test / Cites / Depends:** data (content) · component · spec § Key Facts · GU-04 (adds the optional field to `types.ts`)

### GU-15 · Guide body: Qué llevar según la temporada
- **What:** Verbatim body ("Mi pique de valija" is an H2, not a callout, A-7), facts (`3 o 5 °C`, `pasan los 28 °C`, `110 V`).
- **Files:** `features/guias/content/guides/que-llevar-segun-la-temporada.ts` (+ register)
- **AC:** Fidelity/integrity green; zero `tip` blocks in this guide (AC 15); 3 facts with sources (AC 17).
- **Layer / Test / Cites / Depends:** data (content) · component · spec A-7 · GU-04

### GU-16 · Guide body: Entradas para Broadway
- **What:** Verbatim body, facts (`dos entradas por el precio de una`, `hasta 50% de descuento`, `cargo de USD 8 por entrada`).
- **Files:** `features/guias/content/guides/entradas-para-broadway.ts` (+ register)
- **AC:** Fidelity/integrity green; 3 facts (AC 16, 17); it is the last guide (no `nextGuide`).
- **Layer / Test / Cites / Depends:** data (content) · component · spec § Key Facts · GU-04

### GU-17 · Registry completeness
- **Layer:** data
- **What:** Tighten `BODIES` to `Record<GuideSlug, GuideBody>` (compile-time completeness) and add the whole-registry assertions.
- **Files:** `features/guias/content/guides/index.ts`, `features/guias/content/guides.ts`, `features/guias/__tests__/guides-completeness.test.ts`
- **AC:** 12 guides in menu order; exactly 8 with 3 facts and 4 without (AC 16); `tip` blocks total 2, only in the subte guide; `ol` only in Visa; `fine` total 2 (Cuánto cuesta, Visa); `afterCta` only Visa; 11 CTAs "Quiero mi itinerario" + Visa "Quiero gestionar mi visa" (AC 18, 15). `getGuide("nope")` is `undefined`.
- **Test:** component
- **Cites:** plan § 4, § 14
- **Depends:** GU-05 to GU-16

> **Review gate A.** Nothing user-visible yet. Landing, navbar, Sobre mí untouched.

---

## Slice B — The guide page

### GU-18 · Layout breakpoints, `tall` variant, list marker (global CSS)
- **Layer:** styling
- **What:** Add `--container-guide-facts: 35.0625rem`, `--container-guide-aside: 60.0625rem`, `--container-guide-cards: 62.5625rem` to `@theme`, `@custom-variant tall (@media (min-height: 45rem))`, and `@utility guide-list` (10 px yellow square, 1.5 px ink border, from tokens).
- **Files:** `app/globals.css`, `features/guias/__tests__/styles.test.ts`
- **AC:** The CSS-as-text test finds the three declarations with those values, the `tall` variant and the `guide-list` utility; no existing rule in `globals.css` changes (diff touches additions only). **build check required.**
- **Test:** component (CSS text, like `features/sobre-mi/__tests__/styles.test.ts`)
- **Cites:** plan D-9, § 8; § Styling (container queries); DDR-0011 (no new tokens)
- **Depends:** none · **Gated:** Q2 (default: proceed)

### GU-19 · Guías shell layout and metadata builders
- **Layer:** route skeleton
- **What:** Create `app/(marketing)/(guias)/layout.tsx` (Navbar + `<main lang="es" id="contenido" className="@container/screen">` + Footer) and the `homeMetadata` / `guideMetadata(slug)` builders.
- **Files:** `app/(marketing)/(guias)/layout.tsx`, `features/guias/content/metadata.ts`, `features/guias/__tests__/metadata.test.ts`
- **AC:** Titles are `Guías — Vamos a NY` and `<page title> — Vamos a NY`; description = intro text (home) / bajada (guide); `alternates.canonical` is `/guias` or `/guias/<slug>`; guides have `openGraph.type = "article"`, `locale: "es"`, `images` = the hero file path (resolved against `metadataBase` by Next) (AC 33). `guideMetadata("nope")` returns `{}` without throwing (the page 404s).
- **Test:** component (builders); layout is verified by GU-30 e2e
- **Cites:** § Routing (metadata via `generateMetadata`); `app/(marketing)/(cuaderno)/layout.tsx` precedent; plan D-1. **build check required.**
- **Depends:** GU-17

### GU-20 · `GuideHeading` and `Breadcrumb`
- **Layer:** server components
- **What:** `GuideHeading` (eyebrow, H1 with sr-only name + aria-hidden split copy + `highlight-heading`, dek; `align` "center" | "start"; `sm("heading"|"label"|"split"|"train"|"dek")`) and `Breadcrumb`.
- **Files:** `features/guias/components/guide-heading.tsx`, `features/guias/components/breadcrumb.tsx`, `features/guias/__tests__/guide-heading.test.tsx`
- **AC:** Exactly one H1 whose accessible name equals the title (AC 3, 40); order eyebrow → H1 → dek; marker applies to the whole title on guides and only to "Todo lo que necesitás" on the home (the component takes the marked substring) (AC 9); breadcrumb `nav[aria-label="Ruta"]`, "Guías" → `/guias`, group → `/guias#<anchor>` (AC 13); the breadcrumb is **not** inside `[data-sm-heading]` (plan D-11).
- **Test:** component
- **Cites:** plan D-11, § 10; pattern of `features/sobre-mi/components/page-header.tsx`
- **Depends:** GU-17

### GU-21 · `Inline` renderer
- **Layer:** server components
- **What:** Render `Inline[]`: strings, `{b}`, `{i}`, `{guide}` (next/link, menuTitle text, yellow-hover underline like the breadcrumb), `{href,text}` (`ExternalLink` from Sobre mí).
- **Files:** `features/guias/components/inline.tsx`, `features/guias/__tests__/inline.test.tsx`
- **AC:** A `{guide}` renders `<a href="/guias/el-subte-explicado">El subte, explicado</a>` with no brackets (AC 20); external links open in a new tab with `rel="noopener noreferrer"` and the hidden "(se abre en otra pestaña)" (AC 20); bold/italic map to `<strong>`/`<em>`.
- **Test:** component
- **Cites:** plan D-3; § Routing (`next/link`); `features/sobre-mi/components/external-link.tsx`
- **Depends:** GU-17

### GU-22 · `Blocks` renderer (paragraph, H3, lists, tip callout, small print)
- **Layer:** server components
- **What:** Render `Block[]` per spec § Page Structure: `p`, `h3`, `ul` (class `guide-list`), `ol` (native numbers), `tip` (`TipCallout`: `surface-1` box, 20 px radius, eyebrow "Mi pique" as text), `fine`.
- **Files:** `features/guias/components/blocks.tsx`, `features/guias/components/tip-callout.tsx`, `features/guias/__tests__/blocks.test.tsx`
- **AC:** `ul` items carry the yellow marker and bold lead-ins stay bold (AC 15); `ol` renders `<ol>` with visible numbers and never the marker; the callout shows the text "Mi pique" and is not a heading or a landmark (AC 15, 40); `fine` uses `ink-muted` and a smaller size token.
- **Test:** component
- **Cites:** plan § 8, § 10; spec § Block rendering table; A-7
- **Depends:** GU-18, GU-21

### GU-23 · `KeyFacts`
- **Layer:** server components
- **What:** Three-cell box (2 px ink border, 20 px radius, hairline dividers, Courier tabular figures), one column below the facts container width, three at and above it.
- **Files:** `features/guias/components/key-facts.tsx`, `features/guias/__tests__/key-facts.test.tsx`
- **AC:** Renders a `role="list"` with 3 `listitem`s, each reading "figure, label" together; `aria-label` "Datos clave" or the guide's override (AC 16); renders nothing (no element) when `keyFacts` is undefined (AC 16); classes use `@guide-facts:` container variants (AC 16: 1 column at 360, 3 at ≥561).
- **Test:** component
- **Cites:** plan § 10; spec § Key Facts box, § Accessibility
- **Depends:** GU-18

### GU-24 · `GuideHero`
- **Layer:** server components
- **What:** `figure` with a reserved 3:2 `bg-surface-1` box, `next/image` (`fill`, `priority`, `sizes`, `object-cover`, focal `objectPosition`) and a mono `figcaption` credit.
- **Files:** `features/guias/components/guide-hero.tsx`, `features/guias/__tests__/guide-hero.test.tsx`
- **AC:** The image has the registry alt (never empty) and `priority`; the caption equals `creditLine(slug)` and is real text directly after the box (AC 14); the box has `aspect-3/2` and its fill so a missing image leaves size and credit (AC 32); `sizes` is `(min-width: 48rem) 760px, 100vw` (AC 31).
- **Test:** component
- **Cites:** plan D-7; § Accessibility (engineering rules); `features/sobre-mi/components/photo-figure.tsx` precedent
- **Depends:** GU-03

### GU-25 · `CtaBand` (standard and Visa variants)
- **Layer:** server components
- **What:** Black band (`bg-inverse-canvas`, `text-inverse-ink`, 20 px radius): lead as a paragraph in Courier 700 plus the yellow pill `Button` to `/#services`; Visa variant renders the section's H2 (with its `id`), paragraph and button.
- **Files:** `features/guias/components/cta-band.tsx`, `features/guias/__tests__/cta-band.test.tsx`
- **AC:** Standard: lead is a `<p>`, link text "Quiero mi itinerario", `href="/#services"`; no new heading in the outline (AC 18, 40). Visa: H2 "Te ayudo con tu visa" with `id="te-ayudo-con-tu-visa"`, link "Quiero gestionar mi visa", same href (AC 18). The button is ≥48 px tall (`min-h-12`, AC 43).
- **Test:** component
- **Cites:** plan § 10; `components/ui/button.tsx`; spec § Content Model rules 4–5
- **Depends:** GU-17

### GU-26 · `Pager` and `MoreInGroup`
- **Layer:** server components
- **What:** `Pager` (`nav[aria-label="Más guías"]`, cell "← Volver a / Todas las guías" and optional "Siguiente guía → / <menuTitle>") and `MoreInGroup` (`nav` "Más de <grupo>", 3 rows with bajada).
- **Files:** `features/guias/components/pager.tsx`, `features/guias/components/more-in-group.tsx`, `features/guias/__tests__/pager.test.tsx`
- **AC:** Subte's pager links to `/guias` and `/guias/desde-el-aeropuerto`; Broadway's pager has one cell (AC 19). `MoreInGroup` lists the other three in menu order with blurbs, no heading elements (AC 21, 40). Rows use `tap-target` (AC 43). Visa shows "Visa a Estados Unidos" in pager/"Más de" (AC 3).
- **Test:** component
- **Cites:** plan § 10; spec A-14
- **Depends:** GU-02

### GU-27 · Active-section rule (pure)
- **Layer:** client leaves (logic)
- **What:** `activeSectionId({ tops, line, atBottom })` per plan § 7.
- **Files:** `features/guias/lib/active-section.ts`, `features/guias/__tests__/active-section.test.ts`
- **AC:** Before the first H2 → first id; between two headings → the one above the 120 px line; heading exactly on the line → that heading; a short last section is activated by `atBottom`; empty list → `null`; unknown hash is irrelevant to the function (AC 22, 26).
- **Test:** component (pure)
- **Cites:** plan § 7; spec § Motion Intent (active-section rule)
- **Depends:** none

### GU-28 · `GuideToc` (aside index, client island)
- **Layer:** client leaves
- **What:** `'use client'` `GuideToc({ items: {id,label}[] })`: real anchors, `aria-current="location"` on the active one (yellow fill, bold), rAF-throttled passive scroll/resize listener using GU-27, and on click moves focus to the target H2 (`preventScroll: true`) without `preventDefault`.
- **Files:** `features/guias/components/guide-toc.tsx`, `features/guias/__tests__/guide-toc.test.tsx`
- **AC:** First client render and the server HTML mark no item active (no-JS state, AC 36); after a simulated scroll exactly one item has `aria-current="location"` (AC 22); clicking an item focuses the matching element with `tabindex="-1"` (AC 23); listeners are removed on unmount; props are serializable.
- **Test:** component (jsdom with mocked geometry); real scrolling is covered in GU-38
- **Cites:** plan § 7, § 10; § Component Model (client leaf, serializable props); § Accessibility
- **Depends:** GU-27 · **build check required.**

### GU-29 · `GuideTocDetails` (mobile index)
- **Layer:** client leaves
- **What:** `'use client'` wrapper over a native `<details>` with `<summary>` "En esta guía" (≥44 px), the same links, closes on link click, otherwise inert.
- **Files:** `features/guias/components/guide-toc-details.tsx`, `features/guias/__tests__/guide-toc-details.test.tsx`
- **AC:** Renders `details > summary` "En esta guía" with one link per section (labels per spec rule 3, "El tope semanal" via `tocLabel`) (AC 24); clicking a link removes `open`; with JS absent it is a plain `<details>` (no state needed); opening it does not move focus.
- **Test:** component
- **Cites:** plan § 10; spec § Accessibility (Mobile index)
- **Depends:** GU-27 · **build check required.**

### GU-30 · Guide page composition and `/guias/[slug]` route
- **Layer:** route + server components
- **What:** `GuidePage` (grid: article then aside; sticky aside only at `@guide-aside:` and `tall:`; `details` visible below, aside nav above; "Más de" under the pager below) and `app/(marketing)/(guias)/guias/[slug]/page.tsx` with `generateStaticParams`, `dynamicParams = false`, `generateMetadata`, `notFound()`.
- **Files:** `features/guias/components/guide-page.tsx`, `app/(marketing)/(guias)/guias/[slug]/page.tsx`, `tests/e2e/guias/routes.spec.ts`
- **AC (e2e, 3 projects):** the 12 slugs return 200 with exactly one H1 equal to the page title, the hero with its credit, a key-facts list on exactly 8 guides, the CTA band and the pager (AC 1, 3, 13–16, 18, 19); `/guias/nope` returns 404 and contains `<meta name="robots" content="noindex">` (AC 1, 33); DOM order is breadcrumb → eyebrow → H1 → dek → hero → article → aside (AC 13, spec keyboard path); only one "En esta guía" is exposed per viewport width (AC 24). `view-source` of the built HTML for `/guias/el-subte-explicado` is complete without JS (AC 36 preview).
- **Test:** e2e (`@feature-guias`)
- **Cites:** plan D-1, D-6, § 2, § 3; § Routing, Layouts & Boundaries; § Component Model. **build check required.**
- **Depends:** GU-19 to GU-26, GU-28, GU-29, GU-18

### GU-31 · Segment 404 with "Ver todas las guías"
- **Layer:** empty/error states
- **What:** `app/(marketing)/(guias)/guias/not-found.tsx` (copy of the existing 404 copy + second button to `/guias`, no inner `<main>`), then verify Next renders it for unknown slugs; if not, delete the file and keep the root 404.
- **Files:** `app/(marketing)/(guias)/guias/not-found.tsx`, `tests/e2e/guias/not-found.spec.ts`
- **AC:** `/guias/nope` is HTTP 404 and `noindex`, shows "Esta cuadra no está en el mapa." and "Volver al inicio" → `/` (AC 1); if the segment file is kept, also "Ver todas las guías" → `/guias` and exactly one `<main>`; the existing `tests/e2e/not-found.spec.ts` still passes unchanged.
- **Test:** e2e
- **Cites:** plan D-6; spec § States Matrix (Unknown slug), § Copy for the 404 addition. **build check required.**
- **Depends:** GU-30

> **Review gate B.** `/guias/<slug>` complete and linkable by URL; the menu does not point to it yet.

---

## Slice C — Home, menu, motion, E2E, budget

### GU-32 · `GuideCard`
- **Layer:** server components
- **What:** One `<Link>` card: 3:2 photo box with `alt=""`, H3 title, bajada, "Leer la guía →" (arrow `aria-hidden`), 2 px ink border, 20 px radius, hover lift pointer-fine only; `priority` prop for the first row.
- **Files:** `features/guias/components/guide-card.tsx`, `features/guias/__tests__/guide-card.test.tsx`
- **AC:** The whole card is one link to `/guias/<slug>` whose accessible name is the card text (AC 10); thumbnail `alt=""` (spec A-4); `sizes` per plan D-7; `motion-reduce:` removes the lift, border change stays (AC 12); title wraps without overflow (`min-w-0`, `wrap-anywhere`) (AC 11).
- **Test:** component
- **Cites:** plan D-7, § 8; § Accessibility (engineering rules)
- **Depends:** GU-03, GU-18

### GU-33 · Guías home and `/guias` route
- **Layer:** server components + route
- **What:** `GroupStripe` ×3 (alternating `canvas`/`surface-1`/`canvas`, eyebrow 01–03, H2, "4 guías", grid 1/2/4 columns by container variants) in `GuiasHomePage`, plus `app/(marketing)/(guias)/guias/page.tsx` exporting `homeMetadata`.
- **Files:** `features/guias/components/group-stripe.tsx`, `features/guias/components/guias-home-page.tsx`, `app/(marketing)/(guias)/guias/page.tsx`, `features/guias/__tests__/guias-home-page.test.tsx`, `tests/e2e/guias/home.spec.ts`
- **AC:** Eyebrow "Guías", H1 with the marker only on "Todo lo que necesitás", the approved intro, three sections titled and numbered as spec, each with "4 guías" and 4 cards in menu order (AC 9); H1 → H2 → H3, one H1 (AC 40); group anchors `#moverte-por-la-ciudad|barrios|antes-de-viajar` exist and the guide breadcrumb reaches them (AC 13); cards 4/2/1 columns at 1280/768/360 and no horizontal scroll at 320 (AC 11, e2e); stripe 1's cards `priority`.
- **Test:** component (structure) + e2e (columns, anchors)
- **Cites:** plan § 2, § 3; spec § Page Structure (home). **build check required.**
- **Depends:** GU-20, GU-32

### GU-34 · M1 heading entrance via a Guías controller
- **Layer:** motion
- **What:** `features/guias/motion/guias-scroll-effects.tsx` (`useGSAP`, `motionEnabled()`, scenes `[navScrolled, entrance, focusReveal]` from `features/sobre-mi/motion/scenes/*`, `ScrollTrigger.refresh` after fonts) and `guias-motion.tsx` (`next/dynamic`, `ssr:false`); mount in both pages with `data-sm-scene="guias"` on the root.
- **Files:** `features/guias/motion/guias-scroll-effects.tsx`, `features/guias/motion/guias-motion.tsx`, `features/guias/components/guide-page.tsx`, `features/guias/components/guias-home-page.tsx`, `tests/e2e/guias/motion.spec.ts`
- **AC (e2e):** Motion on (1280, then 360): the H1 words rise and the marker pulls in, the dek lands, the H1 ends as a single text run, and nothing else on the page animates (no inline opacity/transform on `main` descendants outside the heading and navbar) (AC 34). Reduced (`reducedMotion: 'reduce'`): eyebrow, H1, dek visible at once with no transforms, anchors jump (computed `scroll-behavior: auto`) (AC 35). Sobre mí's `tests/e2e/sobre-mi/motion.spec.ts` and the landing specs are unchanged and green (AC 37). The controller module imports no other Sobre mí scene (assert by reading its source in a Vitest test).
- **Test:** e2e + component (import assertion)
- **Cites:** plan D-5, § 9; ADR-0002, ADR-0003, ADR-0008; § Animation (useGSAP, reduced motion, opacity reveals). **build check required.**
- **Depends:** GU-30, GU-33 · fallback (static marker) only if AC 37 fails.

### GU-35 · Navbar: real links, swap, blurb
- **Layer:** menu
- **What:** `features/guias/content/nav.ts` builds `GUIAS_NAV` from `meta.ts`; `components/layout/nav-config.ts` replaces the literal "Guías" group with it; update the tests that carry the old strings.
- **Files:** `features/guias/content/nav.ts`, `components/layout/nav-config.ts`, `components/layout/__tests__/navbar.test.tsx`, `components/layout/__tests__/nav-config.test.ts`, `components/layout/drawer/__tests__/drawer-group.test.tsx`, `features/guias/__tests__/nav.test.ts`, `features/guias/__tests__/nav-weight.test.ts`
- **AC:** The Guías group lists 3 × 4 items with spec titles/blurbs and `href="/guias/<slug>"` (AC 4); item 3 is "Caminar por New York" / "Cómo entender la ciudad y recorrerla a pie."; item 4 blurb is "Subte, Uber, bus o a pie: cuándo conviene cada uno."; "Taxi, Uber o subte" is absent from `NAV` (AC 5); `/guias/west-village` marks only that item `aria-current="page"` in panel and drawer (AC 7); no other group changes (AC 8); `nav-weight`: `features/guias/content/nav.ts` imports only `meta`, `queries`, `groups` and types. **Run `npm run build && npm run check:first-load`: if `/` grows beyond baseline + allowance, raise `perf/first-load.json` in this commit with the measured bytes in the body and tell the user (plan § 13).** **build check required.**
- **Test:** component
- **Cites:** plan D-2, D-4, § 13; DDR-0012 § Decision 2; DDR-0002/0003; ADR-0006
- **Depends:** GU-17 (and logically GU-33: do not merge the menu before both templates exist)

### GU-36 · Footer string "Taxi, Uber o subte" (Gated on Q1)
- **Layer:** menu
- **What:** Only if the user answers Q1(a): change that single string in `components/layout/footer.tsx` to "Caminar por New York". Otherwise skip and amend AC 5 in the QA handoff.
- **Files:** `components/layout/footer.tsx`
- **AC:** The string "Taxi, Uber o subte" appears nowhere under `app/`, `components/`, `features/` (a grep-style Vitest test over source files); the footer renders otherwise identically; CI baseline diff (if any) is limited to that text.
- **Test:** component
- **Cites:** plan Q1; ADR-0006
- **Depends:** GU-35 · **Gated** · label: **Gated: user decision Q1**
- **Resolved 2026-11-02:** Q1 answered (a); the Guías column of the footer also got the guide hrefs (its entries were links). Q2 (structural widths in `@theme`) accepted; Q3 slug `visa-a-estados-unidos` confirmed; A-1 resolved by DDR-0013 (GU-44/45).

### GU-44 · DDR-0013: "Todas las guías →" link (added 2026-11-02)
- **Layer:** docs
- **What:** Record the user's decision to add a "Todas las guías →" row at the foot of the Guías mega-menu panel and of the Guías drawer group (plan § 16 item 1; resolves spec A-1).
- **Files:** `docs/ddr/0013-link-todas-las-guias.md`, `docs/specs/guias/tasks.md`
- **AC:** DDR-0013 is Accepted 2026-11-02, decider Matheus Melo; states what does not change (columns, trigger, marker, DDR-0003 behavior), the drawer row rules (44 px, 200% text), `aria-current` on `/guias`, and the baseline impact.
- **Test:** none (document)
- **Cites:** `design-conventions.md § DDR Template`; ADR-0006
- **Depends:** GU-35

### GU-45 · "Todas las guías →" in the panel and the drawer (added 2026-11-02)
- **Layer:** menu
- **What:** `NavGroup.footerLink?: { label; href }`; `GUIAS_NAV` sets it to "Todas las guías" → `/guias`; the desktop panel renders it under the columns (not a `data-nav-item`, so the marker ignores it) and the drawer renders it as the last row of the group body, same row style; `nav-model` counts it as a current-page candidate.
- **Files:** `components/layout/nav-config.ts`, `components/layout/navbar.tsx`, `components/layout/drawer/drawer-group.tsx`, `components/layout/drawer/nav-model.ts`, `features/guias/content/nav.ts`, tests in `components/layout/__tests__/navbar.test.tsx`, `components/layout/drawer/__tests__/drawer-group.test.tsx`, `nav-model.test.ts`, `features/guias/__tests__/nav.test.ts`
- **AC (unit):** the link exists in the panel and in the drawer with `href="/guias"` and the text "Todas las guías"; the arrow is `aria-hidden`; on `/guias` it has `aria-current="page"` and the drawer opens the Guías group with the header dot; the other groups render no such row; the row is not a `data-nav-item`; the drawer row keeps `min-h-11` and wraps at 200% text; `nav-weight` still holds.
- **Test:** component
- **Cites:** DDR-0013; plan § 16; DDR-0003; ADR-0006. **build check required** (`check:first-load` for `/`).
- **Depends:** GU-44

### GU-37 · E2E: menu navigation and CTA
- **Layer:** E2E
- **What:** From `/`, open the Guías menu at 1280 and the drawer at 360/768, pick items, verify navigation, marker, `aria-current`, and that every CTA reaches the Servicios section by client navigation and by full load.
- **Files:** `tests/e2e/guias/menu.spec.ts`
- **AC:** 12 items navigate to the right guide in mega-menu and drawer; tapping closes the drawer (AC 6); on `/guias/west-village` the marker and dot are on "West Village" with no travel, `aria-current="page"` in both (AC 7); "Taxi, Uber o subte" is absent in navbar and drawer (AC 5); the CTA lands with `#services` in the URL and the section in view, both for a client navigation (from the guide after hydration) and `page.goto('/#services')` (AC 18, release criterion 5).
- **Also (added 2026-11-02, DDR-0013):** the "Todas las guías →" row is reachable by keyboard (Tab from the last item of the panel; Enter navigates to `/guias`), is present in the drawer's Guías group, and navigates to `/guias` from both.
- **Test:** e2e
- **Cites:** plan § 3, § 14; DDR-0003; DDR-0013
- **Depends:** GU-35, GU-45

### GU-38 · E2E: index behavior and keyboard
- **Layer:** E2E
- **What:** Real scrolling and keyboard on the subte guide at 1280 (aside) and 360 (details), plus hash-on-load.
- **Files:** `tests/e2e/guias/toc.spec.ts`
- **AC:** At 1280×800 the aside is sticky at 112 px; at 1280×600 it is not (AC 21, 25). Scrolling marks exactly one item `aria-current="location"` per the rule, first at the top, last at the bottom (AC 22). Clicking an item scrolls the H2 below the navbar, updates the hash and focuses the H2; the next Tab lands after it (AC 23). `/guias/el-subte-explicado#tope` opens at that section clear of the navbar with its item active; an unknown hash leaves the top with the first item active (AC 26). At 360/768 the `<details>` lists the same sections, closes on choose, and the aside index is not in the accessibility tree (AC 24). Keyboard-only path of spec § Accessibility works with focus always visible and not under the navbar (AC 39).
- **Test:** e2e
- **Cites:** plan § 7, § 10; spec § Accessibility (Index behavior)
- **Depends:** GU-30, GU-28, GU-29

### GU-39 · E2E: responsive, text size, no-JS, reduced
- **Layer:** E2E
- **What:** Layout robustness across the cross-cutting conditions of spec § States Matrix.
- **Files:** `tests/e2e/guias/responsive.spec.ts`
- **AC:** No horizontal scroll (`scrollWidth <= clientWidth`) on `/guias`, subte, Visa, West Village at 320, 360, 768, 1280 (AC 11, 41); at 200% text-only (root font-size 200% injected) and 200% browser-zoom equivalent (640 CSS px) no content loss, overlap or horizontal scroll, and the 2-column layout persists at text-only 200% on a wide window (AC 41); with JavaScript disabled all text, hero, credit, index anchors, native `<details>`, CTA and pager work, no item is active, and the heading is visible (AC 36); reduced motion: no hover lift on cards/buttons/pager (computed transform stays `none`) (AC 12, 35).
- **Test:** e2e
- **Cites:** spec § States Matrix cross-cutting rows; plan D-9
- **Depends:** GU-33, GU-34

### GU-40 · E2E: axe, contrast, tap targets
- **Layer:** accessibility polish
- **What:** `@axe-core/playwright` plus pointer-coarse measurements.
- **Files:** `tests/e2e/guias/a11y.spec.ts`
- **AC:** Zero axe violations on `/guias`, subte, Visa, West Village, the 404, and the mobile `<details>` open, at 360 and 1280, after motion settles (reuse `waitForMotionToSettle`), excluding only the documented footer `color-contrast` exception (AC 38, 42); focus ring visible on the black band's button; on a coarse pointer cards, index rows, "Más de" rows, pager cells and `<summary>` measure ≥44×44 and the CTA ≥48 px tall (AC 43); landmarks and headings per AC 40 (one H1, no skipped levels, "En esta guía"/"Más de"/"Mi pique" are not headings).
- **Test:** e2e
- **Cites:** `frontend-qa-conventions.md` (axe gate); spec § Accessibility Acceptance
- **Depends:** GU-33, GU-38

### GU-41 · Budgets, README, and Lighthouse notes
- **Layer:** performance
- **What:** Measure First Load JS for `/`, `/guias`, `/guias/[slug]`; add the two new routes to `perf/first-load.json` and to CI's `check:first-load` step if the script supports it without edits (it takes a route argument); document the 13 routes in the README routes table; record LCP/CLS expectations for QA.
- **Files:** `perf/first-load.json`, `.github/workflows/ci.yml` (two added `run` lines, only if baselines exist), `README.md` (routes table), `scripts/__tests__/check-first-load.test.ts` untouched
- **AC:** `/` unchanged vs baseline (or raised only as done in GU-35); `/guias` and `/guias/[slug]` ≤ 180,000 B gzip (Next's kB are 1000 bytes); the README routes table lists `/guias` and `/guias/<slug>` with "public, static"; the GSAP chunk is not in either route's First Load files.
- **Test:** build script (`npm run build && npm run check:first-load -- <route>`) + e2e unaffected
- **Cites:** plan § 13; § Performance Budgets; `frontend-devops-conventions.md` (bundle guard). **build check required.**
- **Depends:** GU-35, GU-34

### GU-42 · Visual baselines for the two templates
- **Layer:** E2E (visual)
- **What:** `tests/e2e/guias/visual.spec.ts` capturing `/guias` and the subte guide (top screen and full page) at 360/768/1280 after motion settles; list the expected CI baseline changes in the commit body.
- **Files:** `tests/e2e/guias/visual.spec.ts`
- **AC:** Locally the spec passes with `ignoreSnapshots` (no PNGs committed from a dev machine). Expected CI diffs are only: new Guías PNGs, `navbar-panel-guides-*`, and any drawer capture that includes the Guías group (plan § 15). Anything else in the diff is a bug (AC 8, 37).
- **Test:** e2e (screenshot)
- **Cites:** CLAUDE.md (baselines regenerate through `update-snapshots`), DDR-0011, ADR-0006
- **Depends:** GU-35, GU-34 · note for the user: after pushing, add the `update-snapshots` label to the PR and review the committed images before merging (I do not push).

### GU-43 · QA handoff
- **Layer:** E2E journey handoff
- **What:** Write `docs/qa/guias-handoff.md` listing scope for the Frontend QA Engineer; no code.
- **Files:** `docs/qa/guias-handoff.md`
- **AC:** Lists routes (13 + 404), states (success, 404, partial photo, no JS, reduced, 200%, 320 px, short viewport, hash), viewports (320, 360, 768, 1280), spec AC numbers to cover (1–43) with the spec each task already asserts and what remains manual (keyboard pass, contrast of the black band and active item, photo-failure simulation, screen-reader read of the key-facts box and the two navs), the Q1 outcome, the baseline-regeneration procedure, and the commands (`npm run build && npm run test:e2e -- --grep @feature-guias`).
- **Test:** none (document)
- **Cites:** `frontend-architecture-conventions.md § Engineering Workflow` (QA handoff); `frontend-qa-conventions.md`
- **Depends:** GU-37 to GU-42

> **Review gate C.** Full Frontend Reviewer pass, then QA test pass, then Security (light), then the PR with the `update-snapshots` label.

---

## Coverage map (spec AC → task)

| AC | Task(s) | AC | Task(s) | AC | Task(s) |
|---|---|---|---|---|---|
| 1 | GU-30, 31 | 16 | GU-17, 23, 30 | 31 | GU-24, 41 |
| 2 | GU-01, 02 | 17 | GU-04, 05–16 | 32 | GU-24 |
| 3 | GU-02, 20, 26 | 18 | GU-25, 37 | 33 | GU-19, 30, 31 |
| 4 | GU-35 | 19 | GU-02, 26, 30 | 34 | GU-34 |
| 5 | GU-02, 35, 36, 37 | 20 | GU-21, 06, 08, 13 | 35 | GU-34, 39 |
| 6 | GU-37 | 21 | GU-26, 38 | 36 | GU-28, 39 |
| 7 | GU-35, 37 | 22 | GU-27, 28, 38 | 37 | GU-34, 42 |
| 8 | GU-35, 42 | 23 | GU-28, 38 | 38 | GU-40 |
| 9 | GU-20, 33 | 24 | GU-29, 38 | 39 | GU-38 |
| 10 | GU-32 | 25 | GU-18, 38 | 40 | GU-20, 33, 40 |
| 11 | GU-32, 33, 39 | 26 | GU-27, 38 | 41 | GU-39 |
| 12 | GU-32, 39 | 27 | GU-04–16 | 42 | GU-40 |
| 13 | GU-20, 30, 33 | 28 | GU-04, 05 | 43 | GU-25, 40 |
| 14 | GU-03, 24 | 29 | GU-03 | | |
| 15 | GU-17, 22 | 30 | GU-03 | | |

## QA handoff block (summary; full text in GU-43)

- **Routes:** `/guias`, the 12 `/guias/<slug>`, `/guias/<unknown>` (404).
- **States:** success; 404 + noindex; photo failure (box + credit stay); no JS; reduced motion; 200% text/zoom; 320 px; viewport height <720 at ≥961; hash on load (valid and unknown).
- **Viewports:** 320 (extra), 360, 768, 1280. **Acceptance numbers:** 1–43 (map above).
- **Open before QA:** Q1 (footer string) outcome; baselines regenerated by the `update-snapshots` label.
