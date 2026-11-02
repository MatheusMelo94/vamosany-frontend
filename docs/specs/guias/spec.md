# Spec: vamosany-front-end — Guías (home + 12 guide pages, with photos) v1

- **Status:** Ready for /plan. The scope, the visual direction, the copy of the Guías home and the photo decision were approved by the user on 2026-11-01. Nothing is blocking. Items the user did not decide are recorded as labeled assumptions in § Open Assumptions (A-1 … A-14); none of them needs an answer before /plan.
- **Date:** 2026-11-01
- **Owner:** Matheus Melo
- **Constitution reference:** serves the **Visitor** (constitution § Users, frontend addition: pre-customer, mostly on a phone) on 360 first, 1280 second. Public-site success criteria are not defined by the constitution yet ("nenhuma metrica propria em v1; a primeira feature spec de marketing define a metrica de conversao e amenda esta constituicao"). This spec proposes one (§ Success Criteria) but does **not** amend the constitution; that is a user decision (A-9).
- **Related DDRs:** **DDR-0012** (this feature: Guías pages, menu swap, photos, motion scope). Builds on DDR-0011 (design system tokens, no new tokens here), DDR-0004 (motion on content pages; only M1 is extended here), DDR-0003 (navbar moving marker, now has real routes to mark), DDR-0002 (pattern for a menu group that gets real pages). All *Accepted*. Also ADR-0002 (`.gsap` gate), ADR-0003 (headless motion controllers), ADR-0006 (frozen landing and navbar).
- **Backend contract:** none. Static content owned by the frontend. No endpoint, no Server Action, no form (§ Data Dependencies).
- **Content source:** `docs/content/guias.md` (Belén's Google Doc, section GUIDES, exported 2026-11-01). **Verbatim, no rewriting** (§ Content Fidelity).
- **Approved prototype:** https://claude.ai/artifact/UcHUFFiweoJnuvBWu9vfMA (two templates: Guías home; one guide, shown with "El subte, explicado"). It is the visual and structural source of truth for layout, tokens and the two templates. **The photos are not in the prototype**; they are a later user decision (§ Photos). The prototype is illustration; **this text is the contract**. Where the two differ, § Where This Spec and the Prototype Differ lists it.

> **Scope note (Spec Quality Bar: multi-journey).** One home and twelve guides could read as thirteen specs. They ship as one because they are one journey (a Visitor finds the right guide, reads it, and moves on to the itinerary), built on two templates and one content model. The Architect may split `/tasks` per layer; the acceptance criteria stay together.

---

## Feature in One Sentence

Turn the navbar's "Guías" menu (12 dead items) into a real section: a Guías home at `/guias` and 12 guide pages at `/guias/<slug>` that publish Belén's text unchanged, each with one photo, a sticky "En esta guía" index, and a closing band that sends the Visitor to the itinerary.

## User & Trigger

- **Who:** the **Visitor**. Spanish-speaking (Río de la Plata voseo), planning a New York trip, not a customer yet. Three real needs sit behind the three groups: "how do I get around" (Moverte por la ciudad), "where do I stay" (Barrios), "what do I sort out before flying" (Antes de viajar).
- **From where:**
  1. The navbar "Guías" menu on any page (desktop mega-menu ≥1024, drawer below). Each of the 12 items becomes a real link.
  2. A search result or a social link that lands directly on a guide. This is the likely majority of entries; every guide must make sense without having seen the home.
  3. Links between guides (inline links and the "Más de <grupo>" list) and the pager.
- **Device:** phone in one hand first (360 floor), laptop second (1280). 768 best-effort.
- **State of mind:** "I need one answer, now" (how do I pay the subway, which airport route). A second mood on the Barrios and Antes de viajar guides is "help me decide", which is where the closing band converts.

## Journey

One journey: *find a guide, read it, act on it.*

1. The Visitor arrives at a guide by one of the entries above, or opens the menu "Guías" and picks one of the 12 items.
   - 1a. From the menu: the marker highlights the item; Enter or tap goes to `/guias/<slug>`.
   - 1b. Direct arrival: the breadcrumb ("Guías / <grupo>") is the way back to the home.
   - 1c. Arrival with a `#section` hash: the page opens at that section, clear of the floating navbar.
2. They read the head: group eyebrow, title with the yellow marker, the dek (Belén's *bajada*), then the photo.
3. They read, or jump to a section:
   - 3a. Desktop: the sticky "En esta guía" index highlights the section being read; a click scrolls to the section.
   - 3b. Phone: the "En esta guía" `<details>` at the top of the text lists the sections.
   - 3c. An inline mention of another guide ("la guía El subte, explicado") is a link to it.
4. At the end of the text they reach the closing band: "¿Querés que te arme…?" + a yellow button that goes to the itinerary (`/#services`). The Visa guide's button is "Quiero gestionar mi visa", same destination.
5. Below the band, the pager: back to all guides, or the next guide in menu order.
6. Alternative exits: "Más de <grupo>" (the other three guides of the group, with their blurbs), the navbar.
7. Outcome: the Visitor got the answer, and either moved to `/#services` or to the next guide.

## Screens & Surfaces

| Screen / surface | Route | Purpose | Entry from | Exit to |
|---|---|---|---|---|
| Guías home | `/guias` | Show the 12 guides in their 3 groups; each card has a photo, title, blurb, "Leer la guía →" | Guide breadcrumb, pager "Todas las guías", direct/search. **Not from the navbar in this release (A-1).** | Any of the 12 guides |
| Guide page (×12) | `/guias/<slug>` (table below) | Read one guide | Navbar menu, home card, "Más de <grupo>", pager, inline guide links, search | `/#services`, another guide, `/guias`, external sources (Visa guide) |
| Unknown slug | any `/guias/<unknown>` | 404 | A mistyped or stale link | `/` (existing 404 button); `/guias` if the Architect adds the segment 404 (§ States) |
| Navbar › "Guías" mega-menu (≥1024) | global | Reach the 12 guides. Only items change: real `href`s, and one swap | Any page | The 12 routes |
| Navbar › drawer group "Guías" (<1024) | global | Same, on phone/tablet | Burger | The 12 routes |

**Navigation pattern per breakpoint:** the navbar is unchanged (floating capsule ≥1024, burger → drawer below). Inside the pages: breadcrumb at the top; pager at the end. No bottom bar, no sidebar nav beyond the guide's own index.

### Routes, groups and menu order

Slugs are Spanish, accent-free, lowercase, hyphenated. Menu order is the order of the pager ("next guide") and of every list. The Doc lists the guides in a different order from the menu; **the menu wins**.

| # | Group | Menu title (cards, menu, "Más de", pager) | Slug | Page title (H1, `<title>`) |
|---|---|---|---|---|
| 1 | Moverte por la ciudad | El subte, explicado | `el-subte-explicado` | El subte, explicado |
| 2 | Moverte por la ciudad | Desde el aeropuerto | `desde-el-aeropuerto` | Desde el aeropuerto |
| 3 | Moverte por la ciudad | Caminar por New York | `caminar-por-new-york` | Caminar por New York |
| 4 | Moverte por la ciudad | Cómo moverte por New York | `como-moverte-por-new-york` | Cómo moverte por New York |
| 5 | Barrios | West Village | `west-village` | West Village |
| 6 | Barrios | Murray Hill | `murray-hill` | Murray Hill |
| 7 | Barrios | Financial District | `financial-district` | Financial District |
| 8 | Barrios | Williamsburg | `williamsburg` | Williamsburg |
| 9 | Antes de viajar | Visa a Estados Unidos | `visa-a-estados-unidos` (A-11) | **Visa o ESTA: qué necesitás para viajar a Estados Unidos** |
| 10 | Antes de viajar | Cuánto cuesta un día en New York | `cuanto-cuesta-un-dia-en-new-york` | Cuánto cuesta un día en New York |
| 11 | Antes de viajar | Qué llevar según la temporada | `que-llevar-segun-la-temporada` | Qué llevar según la temporada |
| 12 | Antes de viajar | Entradas para Broadway | `entradas-para-broadway` | Entradas para Broadway |

Group anchors on the home: `#moverte-por-la-ciudad`, `#barrios`, `#antes-de-viajar`.

**Blurb = bajada, one source.** The card blurb, the menu blurb, the "Más de" blurb and the dek are the same string (the guide's *Bajada*). Ten of the twelve already equal today's menu blurbs. The two that change are in § Menu Changes.

### Menu changes (DDR-0012)

| Item | Today | After |
|---|---|---|
| Item 3 of "Moverte por la ciudad" | "Taxi, Uber o subte" — "Cuándo conviene cada uno." (no page) | **"Caminar por New York"** — "Cómo entender la ciudad y recorrerla a pie." (user decision; the blurb is the guide's bajada) |
| Item 4 | "Cómo moverte por New York" — "A pie, en subte, bus o ferry." | Title unchanged. Blurb becomes the bajada: **"Subte, Uber, bus o a pie: cuándo conviene cada uno."** (A-2) |
| All 12 items | no `href` | `href="/guias/<slug>"` per the table |

Nothing else in the navbar or the drawer changes: structure, order of groups, marker, spacing. The menu is a frozen surface (ADR-0006); the swap and the blurb change are why DDR-0012 exists. The navbar's current-route behavior (DDR-0003: marker placed on the current item without travel; drawer `aria-current="page"`) starts working for these items as soon as they have `href`s; no new behavior is specified.

## Page Structure

### Guías home (`/guias`)

Slots, in order, on the site shell (navbar, `<main>`, footer, same shell as the Sobre mí pages):

| # | Slot | Rule |
|---|---|---|
| H1 | Head (centered, white, `wrap`) | Eyebrow "Guías" (Courier lowercase, yellow dash). H1 "**Todo lo que necesitás** para moverte por New York" with the marker on "Todo lo que necesitás" only. Intro paragraph, max ~56ch, `ink-muted`. |
| H2 | Three group stripes, in menu order | Alternating background: group 1 white (`canvas`), group 2 cream (`surface-1`), group 3 white. Each: eyebrow "01" / "02" / "03", H2 group title, right-aligned count "4 guías". |
| H3 | 4 cards per stripe | Card = one link: **photo (3:2) on top**, H3 title, blurb, "Leer la guía →". 2px `ink` border, 20px radius (`--radius-lg`), white. |

### Guide page (`/guias/<slug>`)

| # | Slot | Rule |
|---|---|---|
| G1 | Breadcrumb | `Guías` (link to `/guias`) `/` `<grupo>` (link to `/guias#<group-anchor>`, A-6). |
| G2 | Head | Eyebrow = group name. H1 = page title, whole title with the marker. Dek = bajada (`ink-muted`, 1.25rem). Max width ~760px. |
| G3 | **Hero photo** | One photo per guide, 3:2, same max width as the head, with a credit line under it (§ Photos). |
| G4 | 2px `ink` rule, then a 2-column grid | Reading column (≤68ch) + aside (≈300px, 18.75rem, so it scales with text) with a 56px gap. |
| G5 | Reading column | In order: mobile "En esta guía" `<details>` (≤960 only) → intro blocks → key-facts box (only 8 of 12 guides, § Key Facts) → H2 sections → closing CTA band → pager. |
| G6 | Aside (≥961) | "En esta guía" index (sticky) + "Más de <grupo>" (the other 3 guides of the group, each with its blurb). ≤960: the index is hidden and "Más de <grupo>" stacks **below the pager**. |

Block rendering (all 12 guides use these and only these):

| Block | Rendering |
|---|---|
| Paragraph | `ink`, 1.05rem, 1.6 line height, 18px below. Bold and italic inline as in the Doc. |
| H2 section | Courier 700, `scroll-margin-top` 110px (clear of the floating navbar), has an `id` (§ Content Model). Appears in the index. |
| H3 | Courier 700 1.15rem. Used for the Doc's bold own-line sub-labels (D1) and for "Cómo funciona" (D2). Not in the index. |
| List | No bullets; each item has a 10px yellow square with a 1.5px `ink` border. Bold lead-ins stay bold. |
| Numbered list | Visa guide, the five steps. Native `<ol>` with its numbers visible (never the yellow squares: it is a real sequence). |
| **Mi pique** callout | Cream (`surface-1`) box, 20px radius, eyebrow "Mi pique", then the text. Only for paragraphs the Doc starts with "**Mi pique:**" (2, both in the subte guide). |
| Small print | The two italic closing lines of the Doc (Cuánto cuesta, Visa). `ink-muted`, smaller. |
| Closing CTA band | Black (`inverse-canvas`) band, 20px radius: line in Courier 700 + yellow pill button (2px yellow border on the black band, as in the prototype). |
| Pager | Two cells: "← Volver a / Todas las guías" and "Siguiente guía → / <title>". One cell if there is no next. |

### Key Facts box

A 3-cell box (2px `ink` border, 20px radius, hairline dividers): big figure in Courier (tabular numerals), small label in `ink-muted`. **Every figure is taken from the guide's own text**; `source` below is the exact string that must appear in that guide (a test enforces it, § Content Model). The label is chrome copy and may paraphrase; the figure may not.

| Guide | Figure → label (source in the Doc) |
|---|---|
| El subte, explicado | **USD 3** → por viaje, en subte o bus local (`USD 3`) · **USD 35** → tope en 7 días: después, gratis (`USD 35`) · **24 h** → funciona todos los días (`24 horas`) |
| Desde el aeropuerto | **USD 8,75** → el AirTrain de JFK (`USD 8,75`) · **USD 70** → taxi de JFK a Manhattan, tarifa fija (`tarifa fija de USD 70`) · **Gratis** → el bus Q70 de LaGuardia (`Bus Q70 + subte (gratis + USD 3)`) |
| Caminar por New York | **1 min** → por cuadra entre calles, más o menos (`se camina en un minuto`) · **3 a 4 min** → por cuadra entre avenidas (`tres o cuatro minutos`) · **15 a 20 mil** → pasos por día es lo normal (`entre 15 y 20 mil pasos por día`) |
| Cómo moverte por New York | **USD 3** → por viaje, en subte o bus (`USD 3 por viaje`) · **Gratis** → el Staten Island Ferry (`Staten Island Ferry (gratis)`) · **2 h** → de transbordo gratis entre bus y subte (`dentro de las dos horas`) |
| Cuánto cuesta un día en New York | **USD 50 a 70** → día económico (`entre USD 50 y 70`) · **USD 120 a 160** → día intermedio (`entre USD 120 y 160`) · **Más de USD 200** → día completo (`más de USD 200`). The box's accessible name says the prices are approximate, as the Doc's small print does. |
| Qué llevar según la temporada | **3 o 5 °C** → máximas típicas en invierno (`3 o 5 °C`) · **Más de 28 °C** → máximas en verano (`pasan los 28 °C`) · **110 V** → la corriente en Estados Unidos (`110 V`) |
| Entradas para Broadway | **2×1** → en Broadway Week (`dos entradas por el precio de una`) · **Hasta 50%** → de descuento en TKTS, el mismo día (`hasta 50% de descuento`) · **USD 8** → de cargo por entrada en TKTS (`cargo de USD 8 por entrada`) |
| Visa o ESTA | **USD 185** → tasa consular de la visa (`USD 185`) · **5×5 cm** → foto para la entrevista (`foto de 5×5 cm`) · **90 días** → de estadía con ESTA (`hasta 90 días`) |
| West Village, Murray Hill, Financial District, Williamsburg | **No box.** These guides have no figures worth a box; nothing is invented to fill one. No empty placeholder renders. |

Position: after the intro blocks (everything before the first H2), before the first H2. For "Desde el aeropuerto" the intro is two paragraphs (the opening and "Dato clave antes de arrancar"); the box comes after both.

## Content Model

Static data typed in the repo; no CMS, no runtime fetch. **Illustrative shape; the Architect finalizes names and file layout.** The intent the Engineer must keep: the text lives in data, verbatim, one place per guide; every list (menu, cards, "Más de", pager, metadata) derives from the same registry.

```ts
type Inline =                       // a paragraph/list item is Inline[]
  | string                          // plain text, verbatim, curly quotes kept
  | { b: string }                   // bold
  | { i: string }                   // italic ("Lover", "Sex and the City")
  | { guide: GuideSlug }            // link to another guide; label = that guide's menu title
  | { href: string; text: string }  // external link (Visa guide: 2)

type Block =
  | { type: "p"; text: Inline[] }
  | { type: "h3"; text: string }
  | { type: "ul"; items: Inline[][] }
  | { type: "ol"; items: Inline[][] }       // Visa steps only
  | { type: "tip"; text: Inline[] }         // "Mi pique" callout
  | { type: "fine"; text: Inline[] }        // small print

type Guide = {
  slug: GuideSlug;
  group: "moverte-por-la-ciudad" | "barrios" | "antes-de-viajar";
  menuTitle: string;                // El subte, explicado …
  title: string;                    // page title; differs only for Visa
  bajada: string;                   // dek = card blurb = menu blurb = meta description
  photo: PhotoRef;                  // § Photos
  intro: Block[];                   // before the first H2
  keyFacts?: { value: string; label: string; source: string }[]; // exactly 3, or absent
  sections: { id: string; title: string; tocLabel?: string; blocks: Block[] }[]; // H2s
  cta:
    | { lead: string; label: string }                          // 11 guides: the Doc's bold question + button
    | { heading: string; body: string; label: string };        // Visa: "Te ayudo con tu visa" section is the band
  afterCta?: Block[];               // Visa: the italic disclaimer
}
```

Rules the data and its tests must hold:

1. **Order:** the registry array is in menu order; groups derive from `group`. Pager next = next element; the last (Entradas para Broadway) has none.
2. **Section ids:** explicit, accent-free, lowercase, unique within the guide, derived from the H2 text by dropping accents, parentheses and punctuation (e.g. "Cómo se paga" → `como-se-paga`). The Visa H2s are long, so the ids are short: `visa`, `esta`, `la-diferencia-en-resumen`, `no-sabes-cual-te-corresponde`, `te-ayudo-con-tu-visa`. Titles that repeat across guides ("Qué ver", "Cómo llegar") are fine because ids are per page.
3. **Index label:** the H2 text, verbatim. One exception, from the prototype: "El tope semanal (fare cap)" shows as "El tope semanal" (`tocLabel`).
4. **Visa CTA:** the Doc has no bold question, it has a section "Te ayudo con tu visa" + paragraph + button. That section is rendered **as the band** (H2 + paragraph + button inside the black band), keeps its `id`, and stays in the index. The italic disclaimer follows the band.
5. **All other CTAs:** `lead` is the Doc's bold question (e.g. "¿Querés que te arme el recorrido día a día, con las líneas que te convienen?"), rendered as a paragraph in the band, not a heading (keeps the outline clean). `label` is the Doc's "Botón: …" text ("Quiero mi itinerario"). Destination for all 12: **`/#services`** (a real link, user decision 4).
6. **Guide links:** the Doc's `\[El subte, explicado\]` (2 occurrences: Desde el aeropuerto, Cómo moverte por New York) become `{ guide: "el-subte-explicado" }`, rendered as a link whose text is the guide's menu title, without brackets. Underlined with the yellow 3px hover treatment as the breadcrumb.
7. **External links** (2, Visa guide): new tab, `rel="noopener noreferrer"`, visually hidden "(se abre en otra pestaña)", same component pattern as Sobre mí (`ExternalLink`).
8. **Fidelity test:** for each guide, the plain text rendered from the data equals the plain text of its section in `docs/content/guias.md` after applying only deviations D1–D7 (§ Content Fidelity). Each `keyFacts[].source` must occur in the guide's rendered text. Section ids unique. Every `{ guide }` resolves.

## Content Fidelity

Belén's words are not rewritten, trimmed, reordered or "fixed". The permitted changes are structural, and only these:

| # | Change | Where |
|---|---|---|
| D1 | A bold own-line sub-label becomes an H3 (e.g. "AirTrain + subte (la opción más económica)", "High Line", "Staten Island Ferry (gratis)"). The label text is unchanged, parentheses included. | Aeropuerto, Cómo moverte, Caminar |
| D2 | "Cómo funciona:" (a plain line) becomes the H3 "Cómo funciona" (colon dropped, as in the prototype). | Subte |
| D3 | `\[El subte, explicado\]` loses the brackets and becomes a link. | Aeropuerto, Cómo moverte |
| D4 | "**Mi pique:**" paragraphs become Mi pique callouts: the label moves to the eyebrow, the text after the colon is the body. In "Cómo se paga" the two payment methods are one list and the callout follows it (prototype order). | Subte (2 callouts) |
| D5 | Markdown export noise is dropped: stray `\*\*`, trailing `**` before a line break, the `**` around "Cómo moverte por New York" in the menu list. | All |
| D6 | The "Bajada:" label is dropped; the text is the dek. The "En el menú GUÍAS" overview at the top of the Doc is content for the menu, not a page. | All |
| D7 | "Botón: X" is the button label; the bold question before it is the band's lead. Italic closing lines become small print. | All |

Everything else is verbatim, including curly quotes (“ ” ’), "¿", "?", "USD 8,75", "×", and the Doc's own bold/italic. Lead-ins such as "**Tip:**", "**Ojo:**", "**Importante:**", "**Dato clave antes de arrancar:**", "**Antes de viajar, chequeá:**" stay as bold lead-ins inside normal paragraphs; they are not callouts (A-7). "Mi pique de valija" is an H2 section of Qué llevar, not a callout.

A text issue in the Doc is **not** fixed here. If Belén's text needs a correction, it is a change to `docs/content/guias.md` first, then to the data.

## Photos

User decision 3 (2026-11-01): add photos using the images already in `public/img` and `public/img/ring`, with credits; the user will replace them later. **One hero photo per guide, and a thumbnail on each home card (the same photo).**

### Mapping

All 3:2 crops. "Focal" is the `object-position` the Engineer sets so the crop keeps the subject. Sources are 700–1100px wide (the panorama is 1920×465), so a 3:2 box up to 760px wide never upscales the source more than ~1.1×.

| # | Guide | File | Focal | Alt text (Spanish, describes what the crop shows) | Credit line |
|---|---|---|---|---|---|
| 1 | El subte, explicado | `public/img/how-subway.webp` | 50% 45% | Andén de la estación 14th Street del subte, con un tren de la línea L detenido y un cartel que anuncia el próximo tren a Brooklyn en 5 minutos. | Subte de Union Square — TLK in 3, CC BY-SA 3.0 |
| 2 | Desde el aeropuerto | `public/img/quote-street.webp` | 50% 45% | Vista desde lo alto de una calle nevada de Manhattan, con un taxi amarillo cruzando entre los edificios. | Taxi amarillo después de la nieve — Corentin Villemeur, CC BY-SA 4.0 |
| 3 | Caminar por New York | `public/img/trip-high-line.webp` | 50% 55% | Calle de Manhattan vista desde el High Line al atardecer, con edificios de ladrillo, un bus articulado y un taxi amarillo. | The High Line — King of Hearts, CC BY-SA 4.0 |
| 4 | Cómo moverte por New York | `public/img/post-dumbo.webp` | 50% 60% | Una lancha azul y blanca de la policía de New York navega frente al puente de Brooklyn al atardecer. | Puente de Brooklyn al atardecer — MusikAnimal, CC BY-SA 4.0 |
| 5 | West Village | `public/img/trip-soho.webp` | 50% 40% | Edificios de fundición con escaleras de incendio en una esquina de SoHo, bajo un farol y un cartel de Greene Street. | 451 Broome Street, SoHo — Axel Tschentscher, CC BY-SA 4.0 |
| 6 | Murray Hill | `public/img/trip-grand-central.webp` | 50% 40% | El gran salón de Grand Central Terminal, con ventanales altos, una bandera de Estados Unidos y gente caminando. | Grand Central Terminal — Diliff, CC BY 2.5 |
| 7 | Financial District | `public/img/band-bridges.webp` | **85% 50%** | El puente de Brooklyn, con su torre de piedra, y detrás el de Manhattan, sobre el East River con el cielo despejado. | Puentes de Brooklyn, Manhattan y Williamsburg — Axel Tschentscher, CC BY-SA 4.0 |
| 8 | Williamsburg | `public/img/band-bridges.webp` | **45% 50%** | Los puentes de Brooklyn y de Manhattan sobre el East River y, al fondo, el de Williamsburg, con los edificios de la orilla. | (same as 7) |
| 9 | Visa a Estados Unidos | `public/img/ring/vamosany6.webp` | 50% 55% | Un grupo de mujeres sonríe detrás de las letras gigantes «Chau» en un aeropuerto, frente a un mural que dice «Buen viaje». | Foto: Vamos a NY (A-3) |
| 10 | Cuánto cuesta un día en New York | `public/img/trip-chinatown.webp` | 50% 55% | Una calle comercial de Chinatown, en Manhattan, con carteles, faroles rojos y gente caminando por la vereda. | Chinatown, Manhattan — Derek Jensen, dominio público |
| 11 | Qué llevar según la temporada | `public/img/trip-central-park.webp` | 50% 50% | Árboles de hojas amarillas y verdes en Central Park, junto a un lago, con edificios de Manhattan detrás. | Central Park en otoño — Ed Yourdon, CC BY-SA 2.0 |
| 12 | Entradas para Broadway | `public/img/ring/vamosany3.webp` | 50% 50% | Un grupo de mujeres abrigadas posa de noche frente a las pantallas luminosas de Times Square. | Foto: Vamos a NY (A-3) |

- 11 distinct files for 12 guides: `band-bridges` serves two guides with two different focal points (the only repeat; the cards sit side by side in the same stripe and must read as different images).
- **Not used:** `hero-aerial`, `hero-manhattan`, `hero-nyc`, `hero-view` (no entry in `CREDITS.json`, no credit in the footer, not used anywhere today: their license is unknown), `post-autumn`, `post-night`, `ring/vamosany2` (the "No soy any" sign), `ring/vamosany4`, `ring/vamosany5`. Several of these were weaker matches; the user replaces photos later.
- Weak fits, stated so nobody is surprised: West Village shows SoHo (the nearest downtown cast-iron street); Visa and Broadway use brand photos that only suggest the topic ("Buen viaje", Times Square). Alt text says what the photo shows, never what the guide wishes it showed.

### Credits

- **On each guide page:** a visible credit line directly under the hero photo (a `<figcaption>` in the small mono style of the site): "Foto: <Subject> — <Author>, <License>" for Wikimedia photos, using the **same subject, author and license strings the footer shows today**; "Foto: Vamos a NY" for brand photos. It is text, not hidden, not a tooltip (CC BY / CC BY-SA require visible attribution).
- **On the home:** the card thumbnails carry no per-card credit line (12 repeated captions would drown the cards). The attribution is the footer's existing "Créditos de fotografía" disclosure, as it is for the landing's photos today. All 9 Wikimedia photos used here are already listed there.
- **Single source (requirement, not mechanism):** each photo is declared once with file, Spanish subject, author, license and alt/focal data per use. A test asserts that every Wikimedia photo used by Guías has an entry in `public/img/CREDITS.json` **and** a matching line in the footer's credit list; a photo without both fails the build. The footer itself does not change (frozen); consolidating its hardcoded list with the same registry is a welcome follow-up for the Architect, not part of this feature.
- When the user replaces a photo, the registry entry (file, alt, credit) is the only place to edit.

### Photo states

- **Loading:** the 3:2 box is reserved with a `surface-1` fill, so nothing moves when the photo arrives (zero CLS). On the hero the photo is high priority (it is the LCP element on guide pages); card thumbnails below the first row load lazily.
- **Failed to load:** the box stays, filled `surface-1`, the credit line stays. The page is fully usable.
- **Card thumbnail alt:** `alt=""` (A-4). The card's link name is the title and blurb; the descriptive alt lives on the hero, where the photo is content. Repeating a long description in 12 link names makes the home worse for screen-reader users.
- **Hero alt:** the text in the table. Never "foto de…", never empty.

## States Matrix

Both templates are static: content is known at build time. There is no loading, empty, partial or permission state for *content*. The states that exist:

| Screen | Loading | Empty | Error | Partial | Success | Offline |
|---|---|---|---|---|---|---|
| **Guías home** | No skeleton (static). Photo boxes reserved 3:2. | N/A (12 guides always exist) | Render failure → existing `global-error.tsx` | A photo fails → its box stays filled `surface-1`; card text and link still work | 12 cards in 3 stripes | N/A (browser's own offline page) |
| **Guide page** | No skeleton. Hero box reserved 3:2; no content moves when images or fonts arrive (fonts `swap`, per site) | N/A (every guide has text) | Render failure → `global-error.tsx` | Hero fails → box + credit stay. JS fails → see No JS | Full guide | N/A |
| **Unknown slug** | N/A | N/A | **404**, HTTP status 404, `noindex`. Shows the existing `not-found.tsx` ("Esta cuadra no está en el mapa." + "Volver al inicio"). The Architect may add a `/guias` segment 404 with a second button "Ver todas las guías" (copy fixed below); if that is not cleanly possible, the existing 404 alone is acceptable. Known slug with different case or trailing slash follows the framework default (no custom redirects). | N/A | N/A | N/A |
| **Index (sticky, ≥961)** | N/A | N/A | A `#hash` that matches no section → page opens at the top, first item active | N/A | Active item follows reading (§ Accessibility, § Motion); `aria-current="location"` on it | N/A |
| **Key facts box** | N/A | Guides with no figures render **no box** (4 guides) | N/A | N/A | 3 cells; 1 column ≤560 | N/A |
| **Navbar › Guías** | N/A | N/A | N/A | N/A | 12 linked items; current guide marked (DDR-0003 behavior) | N/A |

Cross-cutting conditions (apply to every screen above):

| Condition | What the Visitor gets |
|---|---|
| **No JS** | Everything readable and navigable: all text, the hero, the credit, links, the pager, the CTA. The index links are plain anchors and work; the mobile `<details>` opens natively; there is no active-section highlight (no item is marked active); the heading marker sits in place (no entrance). Nothing is hidden waiting for a script. |
| **Reduced motion** (`prefers-reduced-motion: reduce`, i.e. no `.gsap` class per ADR-0002) | No heading entrance: eyebrow, H1 with the marker in place, and dek are visible immediately, no transforms. Smooth scroll off (jump to anchors). Hover lift off (cards, buttons, pager cells keep their border/background change only). The index highlight changes instantly. |
| **200% text size** (text-only enlargement) and **200% browser zoom** (640 CSS px at a 1280 window) | No loss of content, no horizontal scroll, no overlap. 200% zoom lands in the ≤960 layout automatically (single column, `<details>` index). Text-only 200% at a wide window keeps 2 columns because the aside width is in rem; the sticky behavior is conditional (below) so the aside never becomes taller than the screen and unreachable. |
| **320 px width** | No horizontal scroll; the longest unbroken strings (card titles, section ids, URLs in the Visa guide) wrap. |
| **Short viewport** (height < 720px at ≥961) | The aside is **not sticky**; it flows with the page. Sticky applies only when the viewport is at least 720px tall. |
| **Hash on load** (`/guias/x#tope`) | Opens with the section clear of the navbar (110px margin), index marks that section active, focus does not jump. |
| **Print** | Not designed. Browser default. |

### Copy for the 404 addition (only if the Architect adds it)

Secondary button: "Ver todas las guías" → `/guias`. The rest is the existing 404 copy, unchanged.

## Content & Copy

Product copy language: Spanish, rioplatense voseo (constitution: "espanhol primeiro"). The guide texts are Belén's, in `docs/content/guias.md`; they are not copied into this spec (§ Content Fidelity). This deck is only the **chrome** around them. Strings marked "(proto)" are the approved prototype's.

### Guías home

| Slot | String |
|---|---|
| Eyebrow | Guías |
| H1 | Todo lo que necesitás para moverte por New York (marker on "Todo lo que necesitás") |
| Intro (user-approved) | Lo que aprendí en más de 20 visitas, ordenado para que lo encuentres rápido: cómo moverte, en qué barrio quedarte y qué resolver antes de viajar. |
| Group eyebrows | 01 · 02 · 03 |
| Group H2s | Moverte por la ciudad · Barrios · Antes de viajar |
| Group count | 4 guías |
| Card | `<menu title>` / `<bajada>` / Leer la guía → (the arrow is decorative, `aria-hidden`) |
| `<title>` | Guías — Vamos a NY |
| Meta description | The intro paragraph above. |

### Guide page

| Slot | String |
|---|---|
| Breadcrumb | `aria-label` "Ruta" · Guías / <grupo> |
| Eyebrow | <grupo> |
| H1 / dek | page title / bajada (§ Routes) |
| Credit | "Foto: …" per § Photos |
| Index title (aside nav and mobile summary) | En esta guía |
| Aside list title | Más de <grupo> (e.g. "Más de Moverte por la ciudad") |
| Callout eyebrow | Mi pique |
| Key facts | `aria-label` "Datos clave" (Cuánto cuesta: "Datos clave, precios aproximados") |
| CTA button | Quiero mi itinerario (11 guides) · Quiero gestionar mi visa (Visa) → `/#services` |
| Pager | ← Volver a / Todas las guías · Siguiente guía → / <menu title of next> · `aria-label` "Más guías" |
| `<title>` | `<page title> — Vamos a NY` (same pattern as the Sobre mí pages) |
| Meta description | `<bajada>` |
| 404 (existing) | Esta cuadra no está en el mapa. · La página que buscabas no existe o cambió de lugar. Volvé al inicio para seguir armando tu viaje. · Volver al inicio |

Vocabulary stays stable: the menu item, the card title, the "Más de" entry and the pager use the same string. The one page whose H1 differs from its menu title is Visa (the Doc says so on purpose); the card, menu, "Más de" and pager keep "Visa a Estados Unidos".

### SEO metadata per page

| Page | `<title>` | Description | Canonical | Open Graph |
|---|---|---|---|---|
| `/guias` | Guías — Vamos a NY | the intro | `/guias` | `website`; image: none specific (site default if one exists) |
| `/guias/<slug>` | `<page title> — Vamos a NY` | `<bajada>` | `/guias/<slug>` | `article`; title, description as left; `og:image` = the guide's hero photo (absolute URL from the site's `metadataBase`); `locale` es |
| 404 | existing | existing | none | `noindex` |

Notes: bajadas are short (24–55 characters), so the descriptions are thin; Belén can supply longer ones later and the model has room for an optional override (A-5). "Visa o ESTA: qué necesitás para viajar a Estados Unidos — Vamos a NY" is ~66 characters and may be truncated in results; the user fixed that title. The page has `lang="es"` through the shell.

## Motion Intent

**Stance: functional only, plus one expressive moment that already exists.** The only GSAP motion on these pages is the **M1 heading entrance** from the Sobre mí spec (eyebrow rises, H1 words rise, the yellow marker pulls in, the dek lands while the marker is still braking), on **both** templates. DDR-0012 extends DDR-0004's M1 to these pages and **nothing else** from DDR-0004.

Job of M1: "you arrived at a new station"; it is the same gesture the landing and the Sobre mí pages open with, so the Guías read as the same product. Values are M1's (`MOTION.heading`, dek offset `-=0.85`); this spec adds none.

Explicitly **not** used here, and why:
- **Scroll reveals on paragraphs, lists, cards (M2).** These are reference pages: people arrive for one answer and scroll fast. Text must be visible the moment it reaches the screen.
- **Hero photo parallax.** The photo is content; it never moves.
- **Reading bar, count-ups, rails.** No job on a reading page.
- **Card hover lift on the home** is CSS only (below), not GSAP.

CSS-only transitions (state feedback, `--duration-fast`, `--ease-out-quart`; never animate layout):
- Cards, pager cells, buttons: 2px lift on hover (pointer-fine only) and a border/background change; the prototype's 0.15 s.
- Index items: background and weight change when active or hovered.
- Smooth scrolling to anchors (`scroll-behavior: smooth`), disabled under reduced motion.

**The active-section highlight is behavior, not animation.** It marks "where you are". Rule: the active item is the last section whose heading has passed the line 120px below the top of the viewport; at the top of the page (above the first H2) the first item is active; at the bottom of the page the last item is active even if its heading never reaches the line. No smoothing, no sliding highlight.

**Fallback if reusing M1 is not clean:** if the existing heading controller cannot serve these pages without changing Sobre mí's behavior or its bundle, the Architect ships both templates with the marker static in place (as in the prototype) and records it in the plan. That is within this spec; it needs no new DDR.

Under **reduced motion and no JS**: § States Matrix, cross-cutting rows. Nothing loops; nothing blocks input; no layout shift (M1 uses transform and opacity only). LCP guard: the H1 starts clipped under M1, so on guide pages the **hero photo** is the LCP element and the Architect budgets the entrance accordingly; on the home the LCP element is the H1 or the first card photo.

## Responsive Behavior

Breakpoints of record 360 / 768 / 1280. The prototype's internal switch points (560, 960, 1000) are kept because they are where the layout actually needs to change.

| Viewport | Guías home | Guide page |
|---|---|---|
| **360** (≤560) | Head centered, intro wraps to full width. Cards: 1 column, photo on top, full card width; no fixed min height. Group head: count wraps under the H2. | 16px gutters. Breadcrumb wraps. Head and hero full width (hero 3:2). `<details>` "En esta guía" at the top of the text. Key facts: 1 column, hairline between cells. CTA band: lead above, button full-width-capable (≥48px tall). Pager: 1 column. "Más de <grupo>" below the pager. |
| **768** (561–960) | Cards: 2 columns. | Single column, still the `<details>` index (≤960). Facts: 3 columns (≥561). Pager: 2 columns. |
| **≥961** | 2 columns up to 1000px, 4 columns above | Two columns: reading ≤68ch + aside ≈300px, gap 56px. Index and "Más de" in the aside; `<details>` hidden. Aside sticky at `top: 110px` when the viewport is ≥720px tall. |
| **1280** | 4 columns; stripes alternate; page `wrap` max 1200px, centered. | As ≥961; head max 760px, left-aligned. |

Other rules:
- Home head is **centered** (the prototype's choice: a landing-like index; stated reason per `design-conventions.md`); the guide head is left-aligned.
- Touch targets ≥44×44px on pointer-coarse devices: cards, index and "Más de" rows, pager cells, buttons (48px), `<summary>`.
- Only one of the two "En esta guía" lists is ever exposed (the other is `display: none`, not just visually hidden), so assistive tech never reads two.
- Card heights in a row follow the tallest card; the "Leer la guía →" row sits at the card's foot.
- Tokens, not raw values. Prototype → token: `--ink`→`ink`, `--yellow`→`brand`, `--smoke`→`surface-1`, `--grey`→`ink-muted`, `--line`→`hairline`, white→`canvas`, black band→`inverse-canvas` with `inverse-ink` text, 20px→`--radius-lg`. No new tokens (§ Token Proposals).

## Accessibility Acceptance

WCAG 2.2 AA floor (constitution). Beyond the baseline:

- **Language:** `lang="es"` through the shell. The guides contain English proper nouns (Apple Pay, OMNY, "Mi pique", "fare cap"); they need no `lang` markers unless a whole phrase is English (none is).
- **Landmarks (both templates):** site `nav` ("Principal") and footer from the shell; one `main`; inside it the page `header` (breadcrumb nav, eyebrow, H1, dek), the hero `figure`, the `article` (reading column), an `aside` (aria-label "Más sobre esta guía"), the pager `nav` ("Más guías"). The aside holds two navs: "En esta guía" and "Más de <grupo>" (each with its own `aria-label`).
- **Headings:** one H1 per page. Guide: H1 → H2 (sections) → H3 (sub-labels); no skipped levels; the Visa band's H2 stays an H2. "En esta guía", "Más de <grupo>" and "Mi pique" are labels, **not headings**. Home: H1 → H2 (3 groups) → H3 (cards).
- **H1 and the marker:** the marker is a background; the H1's accessible name equals the title at every moment, including during M1 (if the words are split for the entrance, the visual copy is `aria-hidden` and the real title is the accessible name, as the Sobre mí `PageHeader` does).
- **Keyboard path, guide (desktop):** Tab → breadcrumb links → (hero is not focusable) → index links (8–9 in the aside) → "Más de" links → … the article's links in DOM order → CTA button → pager. The DOM order puts the article first so the Visitor is not made to cross the aside to reach the text; the aside follows the article in the DOM and is placed on the right by the grid. A skip link past the index is not needed (the aside is after the content).
- **Index behavior:** the index is a list of real links (`<a href="#id">`). Activating one scrolls to the section **and moves focus to that section's H2** (`tabindex="-1"`), so the next Tab continues from there, and the URL hash updates. The active item has `aria-current="location"` **and** a visible non-color cue (the yellow fill plus bold weight; the text never relies on color alone).
- **Mobile index:** a native `<details>` with `<summary>` "En esta guía" (≥44px target). Choosing a link closes it (progressive enhancement; without JS it stays open and is still usable). Enter/Space toggles; opening does not move focus.
- **Card link:** the whole card is one link (the title is a heading inside it). Its accessible name is the card text; "Leer la guía →" is part of it. Thumbnail `alt=""`.
- **External links** (Visa guide): new tab, with the hidden "(se abre en otra pestaña)".
- **Focus:** the site's focus style (3px `brand` outline + `ink` halo, DDR-0011) on every focusable element, including inside the black CTA band (the yellow ring reads against black). Never removed. Focus is never obscured by the floating navbar: anchors, the index and the focus target after an index click all sit below it (`scroll-margin-top` 110px; WCAG 2.4.11).
- **Contrast** (token pairs): `ink` on `canvas` and on `surface-1` ≥ 15:1; `ink-muted` (#5d5b52) on `canvas` ≈ 6.9:1 and on `surface-1` ≈ 6:1 (≥ 4.5:1, used for dek, blurbs, labels, credit line); `on-brand` on `brand` ≈ 14:1 (active index item, button); `inverse-ink` on `inverse-canvas` 21:1 (CTA band). `ink-tertiary` is not used for text smaller than 18px.
- **Targets and spacing:** ≥44px on coarse pointers; ≥8px between adjacent index and "Más de" rows.
- **Images:** every image has `alt`. Hero: descriptive. Thumbnails: `alt=""` with the reason in § Photos. The credit line is real text.
- **Key facts box:** a list (`role="list"` with `listitem`s, or a `<dl>` if the Architect prefers); the figure and its label are read together ("USD 3, por viaje, en subte o bus local"). Not color-coded.
- **Callouts:** the "Mi pique" box is a plain `aside`-free block (no extra landmark); its eyebrow is text, so it is read.
- **Reading line length:** ≤68ch; line height 1.6; body 1.05rem.
- **Automated:** `@axe-core/playwright` on `/guias`, one guide per template variant (with facts + callouts: subte; Visa; one Barrio), the 404, and the mobile `<details>` open. Manual keyboard pass by QA. The frozen footer's known `color-contrast` exception (Sobre mí AC 20) continues to apply and is not this feature's finding.

## Data Dependencies

| Read / write | Entity | Contract |
|---|---|---|
| Read | The 12 guides, menu, photos, credits | Static data in the repo (§ Content Model). No network. |
| Write | none | No form, no cookie, no storage. |
| Navigation | `/#services` | Existing section id on the landing. The Architect must confirm the CTA lands on it from a client navigation as well as a full load. |

The backend contract is not involved: no endpoint, no Server Action, no Pre-Contract item. Nothing here goes to the backend team.

## Locale Behavior

Non-goal: i18n (user, 2026-11-01). The guides exist only in Spanish; slugs are the Spanish ones. The navbar's ES/PT/EN selector continues to behave as today on these pages (it does not translate them). The slugs are the `es` URLs for when locale routing arrives (constitution: "i18n de rotas e conteudo e decisao do Frontend Architect (ADR)"); flagged so the Architect does not paint the routes into a corner.

## Token Proposals

None. Every value in the prototype maps to an existing token (§ Responsive Behavior). If the Architect finds a raw value with no token, it comes back here as a proposal, not as a raw value in a component.

## Out of Scope

1. Blog posts and any other page type (the blog menu stays as it is).
2. Service pages (the CTA goes to the landing's Servicios section).
3. A CMS or editing UI; content changes are edits to the repo.
4. Search, filters, tags, sorting of guides, "related by topic".
5. Comments, ratings, sharing buttons, newsletter capture on the guide pages.
6. Translation to Portuguese or English; locale routing.
7. A reading-progress bar, reading-time estimate, table-of-contents animation, scroll reveals on the text.
8. Rewriting, shortening or fixing Belén's text.
9. Structured data (JSON-LD), a generated OG image, `sitemap.xml`, `robots.txt` (none exists in the repo today; adding them is a separate task, A-10).
10. Analytics instrumentation (none in the repo, A-9).
11. A print stylesheet.
12. Sourcing or licensing new photos. The user replaces them later.
13. A navbar entry to `/guias` (A-1).

## Success Criteria

The constitution defines no public-site metric. So:

**Release criteria (this spec's definition of done, verifiable by QA):**
1. All 13 routes render in production with complete text, one photo and a visible credit, at 360, 768 and 1280.
2. Zero fidelity diffs between the rendered text and `docs/content/guias.md` outside D1–D7.
3. Zero axe violations on the pages in § Accessibility (excluding the documented footer exception).
4. The 12 menu items navigate to the right guides, in both the mega-menu and the drawer.
5. Every guide's CTA reaches the landing's Servicios section.

**Proposed adoption metric (needs the user's confirmation; A-9):** click-through from guide pages to `/#services`, per guide, as a share of guide page views. No target is proposed: the repo has no analytics, so there is no baseline, and inventing a number would be fiction. When analytics exists, the user sets the target and amends the constitution (v2) as it already anticipates.

## Acceptance Criteria

Viewports: 360, 768, 1280 unless stated. "Reduced" = `reducedMotion: 'reduce'`. "Guide" = each of the 12 unless stated.

**Routes and data**
1. `/guias` and the 12 `/guias/<slug>` of § Routes return 200. Any other `/guias/<x>` returns 404 with `noindex` and shows the existing 404 page.
2. The registry is in menu order; the home, the "Más de" lists, the pager and the metadata all derive from it (changing a bajada in one place changes it everywhere).
3. Each of the 12 pages has exactly one H1 equal to the page title; the Visa page's H1 is "Visa o ESTA: qué necesitás para viajar a Estados Unidos" and its card, menu item, "Más de" entry and pager entry say "Visa a Estados Unidos".

**Menu (DDR-0012)**
4. At 1280, the Guías mega-menu lists 3 columns × 4 items with the titles and blurbs of § Routes; each item links to its route.
5. "Taxi, Uber o subte" appears nowhere in the navbar, the drawer or the site; "Caminar por New York" with "Cómo entender la ciudad y recorrerla a pie." is item 3 of "Moverte por la ciudad"; "Cómo moverte por New York" shows "Subte, Uber, bus o a pie: cuándo conviene cada uno."
6. At 360 and 768, the drawer group "Guías" lists the same items and routes; tapping an item navigates and closes the drawer.
7. On `/guias/west-village`, opening the Guías menu at 1280 places the highlight and the dot on "West Village" with no travel (DDR-0003); that item has `aria-current="page"`; in the drawer it shows the static dot and `aria-current="page"`.
8. No other navbar or drawer element changes (structure, marker behavior, other groups). The navbar tests and the screenshot baselines that include the Guías menu are updated for the swap and the blurb; the baselines are regenerated only through the approved `update-snapshots` path (DDR-0011 pattern).

**Guías home**
9. Renders, in order: eyebrow "Guías", the H1 with the marker only on "Todo lo que necesitás", the approved intro, and three stripes (white, cream, white) titled "Moverte por la ciudad", "Barrios", "Antes de viajar", each with eyebrow 01/02/03, a "4 guías" count and 4 cards.
10. Each card shows the photo of § Photos (3:2, `alt=""`), the title, the bajada and "Leer la guía →", has a 2px `ink` border and 20px radius, and links to its guide. The whole card is the link.
11. Cards: 4 columns at 1280, 2 at 768, 1 at 360. No horizontal scroll at 320.
12. Hover (pointer-fine) lifts a card by 2px; Reduced: no lift, the border change remains.

**Guide: structure**
13. Order: breadcrumb → eyebrow → H1 → dek → hero + credit → 2px rule → grid. Breadcrumb "Guías" links to `/guias`; the group crumb links to `/guias#<group-anchor>` and that anchor exists on the home.
14. The hero is 3:2, has the alt of § Photos, and the visible credit line of § Photos directly under it; the credit strings match the footer's list character for character (Wikimedia photos) or read "Foto: Vamos a NY".
15. The reading column renders blocks per § Page Structure: H2 with `id`, H3, yellow-square lists, native numbered list (Visa steps), "Mi pique" callouts (exactly 2, in the subte guide, with eyebrow "Mi pique"), small print (Cuánto cuesta, Visa).
16. Key-facts box: present on exactly 8 guides (subte, aeropuerto, caminar, cómo moverte, cuánto cuesta, qué llevar, Broadway, Visa) with the three figures of § Key Facts, positioned after the intro and before the first H2; absent on West Village, Murray Hill, Financial District and Williamsburg, with no empty element. At 360 it is one column; at ≥561, three.
17. Every key-fact `source` string appears in the guide's rendered text.
18. The closing band shows the guide's lead and a yellow pill button "Quiero mi itinerario" linking to `/#services`; on the Visa guide the band holds the H2 "Te ayudo con tu visa", its paragraph and the button "Quiero gestionar mi visa" (→ `/#services`), followed by the italic disclaimer.
19. Pager: "← Volver a Todas las guías" → `/guias`; "Siguiente guía →" → next in menu order (e.g. subte → aeropuerto; Williamsburg → Visa; Qué llevar → Broadway). On "Entradas para Broadway" there is no "Siguiente" cell and the pager has one cell.
20. The inline mentions of "El subte, explicado" in "Desde el aeropuerto" and "Cómo moverte por New York" are links to `/guias/el-subte-explicado`, with no brackets in the text. The two Visa external links open in a new tab with the hidden "(se abre en otra pestaña)".

**Guide: index and aside**
21. At 1280 and ≥720px viewport height, the aside is sticky at 110px below the top and shows "En esta guía" (one link per H2, labels per § Content Model rule 3) and "Más de <grupo>" (the 3 other guides of the group, each with its bajada, in menu order).
22. While reading, the active index item has a yellow fill, bold weight and `aria-current="location"`: the last H2 above the 120px line; first item at the top; last item at the bottom of the page. At most one item is active.
23. Clicking an index item scrolls to its H2 clear of the navbar, updates the hash and moves focus to that H2; the next Tab goes to the next focusable element after it.
24. At ≤960: the aside's index is not rendered visually and not exposed; a `<details>` "En esta guía" sits at the top of the reading column listing the same sections; choosing one navigates and closes it; "Más de <grupo>" appears below the pager. Only one of the two indexes is in the accessibility tree at any width.
25. At <720px viewport height (≥961 wide), the aside is not sticky.
26. Loading `/guias/el-subte-explicado#tope` scrolls to "El tope semanal (fare cap)" clear of the navbar with that item active; an unknown hash leaves the page at the top with the first item active.

**Fidelity**
27. For each guide, rendered plain text equals its section in `docs/content/guias.md` after D1–D7 only (automated test over the registry). Curly quotes, "¿", "×", "8,75" and bold/italic are preserved.
28. The Doc order of the two payment methods and the callout in "Cómo se paga" is the prototype's (D4); no other block is reordered.

**Photos**
29. The 12 guides use the files in § Photos; `band-bridges` appears twice with different `object-position`. No `hero-*` image is used.
30. Every Wikimedia photo used has an entry in `public/img/CREDITS.json` and a line in the footer's credit list (automated test). The footer is otherwise unchanged.
31. No layout shift from images: Lighthouse/CLS for each template ≤ the project's budget; the hero is fetched with priority on guide pages.
32. If a photo fails to load, the 3:2 box keeps its size and fill, and the credit line stays.

**Metadata**
33. Each page's `<title>` and meta description match § SEO metadata per page; guide pages have a canonical URL and Open Graph `article` data with the hero as `og:image`; the 404 has `noindex`.

**Motion, no JS, reduced**
34. Motion on (≥1280, then 360): the H1 words rise and the marker pulls in, the dek lands while the marker is still moving, then the page is static; the H1 ends as one text run; nothing else on the page animates by script (no reveals, no parallax). (Or, if the fallback in § Motion Intent is taken: the marker is static in place and the plan says so.)
35. Reduced: eyebrow, H1 with the marker, dek and body are visible immediately with no transforms; anchors jump instead of scrolling smoothly; no hover lift.
36. No JS: all text, the hero and credit, the index links (as anchors), the `<details>` (opens natively), the CTA and the pager work; no item is marked active; nothing is hidden.
37. M1 on these pages does not change the Sobre mí pages' behavior or the landing's baseline screenshots.

**Accessibility**
38. axe: no violations on `/guias`, on the subte, Visa and West Village guides, on the 404 and with the mobile `<details>` open, at 360 and 1280.
39. Keyboard: the full path of § Accessibility Acceptance works with no pointer; focus is always visible and never hidden under the navbar; Esc closes the navbar menu and returns focus to its trigger (existing behavior, unchanged).
40. One H1; heading levels never skip; "En esta guía", "Más de" and "Mi pique" are not headings; landmarks as listed.
41. Text at 200% (text-only, and browser zoom): no content loss, no horizontal scroll, no overlap; at 320px no horizontal scroll.
42. Contrast of every text/background pair on the two templates meets the ratios in § Accessibility Acceptance (axe plus a manual check of the black band and the active index item).
43. Targets: cards, index rows, "Más de" rows, pager cells and `<summary>` are ≥44×44px on a coarse pointer; the CTA button is ≥48px tall.

## Where This Spec and the Prototype Differ

1. **Photos** (hero and card thumbnails) are new; the prototype has none. The home card gains a photo on top; the guide gets a hero between the dek and the rule.
2. **Breadcrumb group crumb** is a link to `/guias#<group>` (prototype: plain text) (A-6).
3. **Sticky is conditional** on viewport height ≥720px (prototype: always sticky).
4. **Index click moves focus** to the section H2 and sets `aria-current="location"`; the prototype only highlights.
5. **Active-item rule** is fully specified (top, bottom, one at a time); the prototype's observer never cleared the highlight and never activated a short last section.
6. **Key-facts labels:** the prototype's third label "todos los días del año" becomes "funciona todos los días" so the figure and label both come from the text.
7. **Visa CTA**, the numbered steps list and the small print are specified (the prototype shows only the subte guide).
8. **Aside width** in rem (prototype: 300px) so it scales with text size.
9. The prototype's switcher bar, notes block and fake footer are not part of the site.

## Notes for the Architect

- **Routing and shell:** the pages want the same shell as the Sobre mí pages (navbar, `<main lang="es" id="contenido">`, footer). Whether that means the existing route group or a sibling is your call. Static generation for the 12 slugs; unknown slugs must 404 (the status code matters for SEO).
- **M1 reuse:** the heading entrance lives behind the `data-sm-*` attribute contract (ADR-0003) in `features/sobre-mi/motion`. Reuse it only if it can be mounted for these pages without leaking Sobre mí-specific scenes into their bundle; otherwise take the static fallback.
- **Active-section tracking** and the focus-on-index-click are small client behaviors over server-rendered anchors; the page must be complete without them.
- **Do not change the footer.** If you extract a shared photo-credit registry, the footer's output must stay identical.
- **Navbar tests:** `components/layout/__tests__/navbar.test.tsx` and `components/layout/nav-config.ts` carry the "Taxi, Uber o subte" item.
- **Photos** are `.webp` already optimized; use the framework image component with `sizes` per slot (hero ≤760px, card ≤ ~300px at 1280).

## Open Assumptions

Recorded because the user approved the scope and the visual direction but did not decide these. None blocks /plan. Each is the default this spec took; say so and the spec changes.

| # | Assumption | If the user disagrees |
|---|---|---|
| **A-1** | **No navbar entry to `/guias`** in this release (the navbar is frozen; only the 12 items get `href`s). `/guias` is reached from a guide's breadcrumb and pager, and by URL. This leaves the home without a front door. Suggested follow-up: make the "Guías" trigger/heading link to `/guias`, or add an "Todas las guías" row; both change the frozen menu, so it needs its own decision. | Add the entry; amend the menu changes and AC 4–8. |
| **A-2** | The menu blurb of "Cómo moverte por New York" changes to its bajada ("Subte, Uber, bus o a pie: cuándo conviene cada uno.") so menu, cards, "Más de" and dek are one string. | Keep "A pie, en subte, bus o ferry." in the menu only; the model then needs a separate menu blurb for that one item. |
| **A-3** | The two brand photos (`ring/vamosany3`, `ring/vamosany6`) are the brand's own, so the credit reads "Foto: Vamos a NY" and they have no `CREDITS.json` entry. The footer's sentence "Todas las fotos vienen de Wikimedia Commons" is already inexact because of the hero ring photos; the footer is frozen and is not touched here. | Change the credit text; fix the footer sentence in a separate decision. |
| **A-4** | Home card thumbnails use `alt=""`; only the hero has the descriptive alt. | Give thumbnails the same alt (longer link names). |
| **A-5** | Meta description = bajada (short, 24–55 characters). The Visa `<title>` is long (~66). | Belén supplies longer descriptions; add the optional override field. |
| **A-6** | The group crumb links to `/guias#<group-anchor>`. | Make it plain text as in the prototype. |
| **A-7** | "Tip:", "Ojo:", "Importante:", "Dato clave antes de arrancar:" and "Antes de viajar, chequeá:" stay as bold lead-ins in normal paragraphs; only "Mi pique" is a callout (the only callout the prototype designed). | Design a second callout style; it is a new component. |
| **A-8** | D4: in "Cómo se paga" the two payment methods are one list followed by the callout, as in the prototype, instead of the Doc's paragraph order (method, callout, method). | Keep the Doc order; the callout then sits between two paragraphs. |
| **A-9** | The proposed metric (click-through to `/#services` per guide) and the lack of a target; there is no analytics in the repo. The constitution is not amended by this spec. | Define the metric and the constitution v2. |
| **A-10** | `sitemap.xml`, `robots.txt` and structured data are not part of this feature (none exist today). Guides are SEO-sensitive, so a follow-up is advisable. | Add a task. |
| **A-11** | The Visa slug is `visa-a-estados-unidos` (the menu title). The H1 says "Visa o ESTA", so `visa-o-esta` is also defensible. | Rename the slug before launch; after launch it needs a redirect. |
| **A-12** | The key-facts figures and labels in § Key Facts were chosen by this spec from the guide texts (the user asked for the spec to define them). Neighborhood guides get no box. | Swap a figure (it must keep a `source` in the text). |
| **A-13** | The hero sits under the dek, max width 760px, 3:2 at every size (not full-bleed, not 16:9), so no source image is upscaled and the head keeps the prototype's single column. | Wider hero: needs bigger photos. |
| **A-14** | The pager's "next" is global menu order across groups (Williamsburg → Visa), and the last guide has no "next". | Wrap to the first guide, or scope "next" to the group. |

## Design Handoff Checklist

| Item | Where |
|---|---|
| Spec with every section filled | This file (status: Ready for /plan) |
| Screen inventory, routes, navigation per breakpoint | § Screens & Surfaces, § Routes, § Responsive Behavior |
| States matrix per screen (incl. 404, no JS, reduced motion, 200% text) | § States Matrix |
| Copy deck keyed by screen; SEO per page | § Content & Copy, § SEO metadata per page |
| Content model and fidelity rules | § Content Model, § Content Fidelity |
| Photo mapping, alt text, credits | § Photos |
| Motion intent incl. reduced motion | § Motion Intent |
| Accessibility acceptance | § Accessibility Acceptance |
| Token additions | § Token Proposals (none) |
| DDRs referenced | DDR-0012 (Accepted), DDR-0011, DDR-0004, DDR-0003, DDR-0002 |
| Pre-Contract items for the backend team | None |
| Prototype link (illustration) | https://claude.ai/artifact/UcHUFFiweoJnuvBWu9vfMA |
