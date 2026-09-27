# Spec: vamosany-front-end — Mobile navigation "Índice" (drawer below 1024px) v1

- **Status:** Ready for /plan
- **Date:** 2026-09-27
- **Owner:** Matheus Melo
- **Constitution reference:** serves the **Visitor** (constitution § Users, frontend addition: pre-customer, "majoritariamente no celular") on a **360 phone, one hand**, with 768 best-effort. The constitution's public site has **no countable v1 metric yet** (§ Success Criteria), and this spec doesn't add one. Its observable proxies, which QA measures: the first level fits one panel with no scroll at 360 × 780; every menu target is ≥44px on its visible box; any item is ≤2 taps from opening the menu; and a keyboard-only path through the menu exists, with Esc and focus return. It honors Non-Goal 1 through DDR-0006, and the Experience Principles (WCAG 2.2 AA floor, reduced motion mandatory, es > pt > en).
- **Related DDRs:** **DDR-0006** (this spec implements it: phone menu "Índice", below 1024 only), DDR-0002 (Sobre mí group; amended by DDR-0006), DDR-0003 (static dot plus `aria-current` in the drawer; extended by DDR-0006), DDR-0005 (non-breaking space in "Custom itinerary with Belén"). Also ADR-0002 (`.gsap` gate), ADR-0006 (frozen landing; superseded for the drawer's open state only), ADR-0007 (height animation limited to the FAQ; see § Notes for the Architect).
- **Backend contract:** none needed. The menu reads static config (`components/layout/nav-config.ts`, `features/sobre-mi/content/nav.ts`). See § Data Dependencies.
- **Approved mockup:** `docs/design/mockups/mobile-menu-indice.html`, phone "A · Índice" (`aPanel()`, `aItems()`, `lang()`, `act()` and the `.acc`, `.row44`, `.seg`, `.pair` and `.foot` CSS). The mockup is illustration; **this text is the contract**. Where they differ, § Where This Spec and the Mockup Differ says which one wins and why.
- **Source analysis:** `docs/design/mobile-menu-analysis-2026-09-27.md` (Direction A, as changed by the user: Services is not pinned, and the desktop order is kept).

---

## Feature in One Sentence

Below 1024px, the burger opens the same floating panel as today. It now holds an index of five closed accordion groups (single-open, desktop order, each with a scent line) and a footer pinned inside the panel with the language control and Log in / Sign up. It gets real 44px rows, a managed-focus modal behavior, and an "unfold" open motion (the drawer's one expressive moment). Desktop and the closed navbar don't change at all.

## User & Trigger

- **Who:** the Visitor. Spanish-speaking, planning or dreaming about a New York trip, not a customer yet.
- **From where:** the burger in the navbar capsule, on any route: the landing `/`, the five Sobre mí pages, and future pages.
- **Device:** phone in one hand, 360 × 780 as the reference, 360 × 640 as the short-phone floor, 390 × 844 as the common large phone. Tablet (768) best-effort. At ≥1024 this feature doesn't exist (the desktop mega-menu applies, unchanged).
- **State of mind:** "Where's the thing I'm looking for?" That could be a service and its price, Belén's pages, contact or the FAQ, or "is this site in Spanish?". The Visitor wants to scan, choose and go, with no scrolling through a wall of links.

## Journey

1. The Visitor taps the burger ("Abrir menú").
   - The veil and panel appear under the capsule, and the burger shows the X ("Cerrar menú").
   - Focus moves to the first group header, "Itineraries".
2. They scan the first level: five closed groups in desktop order (Itineraries, Guides, Blog, Services, Sobre mí), each with its scent line, and the pinned footer (language, Log in, Sign up).
   - 2a. **On a Sobre mí route:** the Sobre mí group is already open, the current page's row carries the yellow dot and `aria-current`, and the Sobre mí header carries the dot too.
3. They tap a group header, and that group expands.
   - 3a. **Another group was open:** it collapses (single-open).
   - 3b. **They tap the open header:** it collapses, and the header keeps the dot if the group contains the current page.
   - 3c. **The open group is longer than the list area:** the list scrolls inside the panel, and the footer stays pinned.
4. They tap an item. The browser goes to the item's `href` (or `/#services` when it has none, as today), and the drawer closes.
   - 4a. **A Services item from any route:** they land on the landing's `#services` (RV-0010 behavior, carried over).
5. Other exits, and actions that stay in the menu:
   - 5a. **A language segment (ES, PT or EN):** the selection moves. The drawer stays open, and nothing is translated yet (as today).
   - 5b. **Log in or Sign up:** the drawer closes and the browser goes to `#login` or `#signup` (as today).
   - 5c. **X, a tap on the veil, or Esc:** the drawer closes and focus returns to the burger ("Abrir menú").
   - 5d. **The viewport grows to ≥1024 while the drawer is open** (rotation, window resize): the drawer closes silently, the page is no longer inert or scroll-locked, and the desktop navbar renders exactly as its baseline.

**Outcome:** the Visitor reaches any menu destination in ≤2 taps after opening, or closes the menu where they started, with keyboard focus back on the burger.

## Screens & Surfaces

| Screen / surface | Route (proposed) | Purpose | Entry from | Exit to |
|---|---|---|---|---|
| Closed navbar (capsule, logo, burger) | every route | Unchanged. It holds the burger. | page load | burger → drawer |
| Drawer panel "Menú" (overlay; veil plus panel) | none (an overlay on the current route) | The index of the site below 1024px | burger | an item's route; `#login` / `#signup`; closed (X, veil, Esc, resize to ≥1024) |
| · Group accordion (×5) | none (inside the panel) | Shows one group's columns and items | a tap on its header | an item's route; collapsed |
| · Pinned footer | none (inside the panel) | Language control, Log in, Sign up, always visible | always shown while the panel is open | `#login` / `#signup`; stays open on a language tap |

**Navigation pattern per breakpoint:**

| Width | Pattern |
|---|---|
| <640 (the 360 / 390 phone) | Burger → full-width floating panel (16px insets) under the capsule, accordion index plus pinned footer |
| 640–1023 (the 768 tablet) | Burger → the same panel, **420px wide**, its right edge aligned with the capsule's right edge (under the burger); top and bottom as on the phone |
| ≥1024 | Desktop capsule and mega-menu, **unchanged** (DDR-0003). The drawer never renders. |

## States Matrix

The menu reads static, bundled config and does no I/O. The data states are therefore N/A, and the matrix covers the menu's own states.

**Data states (declared N/A, with the reason):**

| State | Applies? | Why |
|---|---|---|
| Loading | N/A | The content is in the bundle and renders synchronously on open. There is no fetch, so there is no skeleton. |
| Empty | N/A | The config always has 5 groups, and every group has ≥1 item. A group with 0 items isn't a supported config: the Architect adds a unit test that fails on one. It isn't a runtime state. |
| Error | N/A | There is no I/O. A failed navigation after a tap is the browser's or the route's own error state, not the menu's. |
| Partial | N/A | No section loads independently. |
| Offline / stale | N/A | The menu works offline once the page has loaded. Its links behave like any navigation. |
| Permission denied | N/A | Public site, no gated items. |

**Menu states:**

| # | State | What the Visitor sees | Rules |
|---|---|---|---|
| S1 | **Closed** (every width) | Capsule, logo and burger (three lines), **pixel-identical to today** at 360, 768 and 1280, including under reduced motion. | The burger's name is "Abrir menú" and it has `aria-expanded="false"`. Nothing else changes. |
| S2 | **Open, all groups closed** (default on `/` and on any route not in the menu) | The veil; the panel in today's box; five closed headers with scent lines and down chevrons, separated by 1px hairlines; the pinned footer. At 360 × 780 the list area doesn't scroll. | The burger shows the X, is named "Cerrar menú" and has `aria-expanded="true"`. Focus is on the "Itineraries" header. The page behind is inert and doesn't scroll. |
| S3 | **Open, one group open** | That group's header chevron points up. Below it: column headings (eyebrow style), then ≥44px rows (title, tag if any, price if any, dot if current). The other four stay closed. | Single-open. Tapping the open header returns to S2 (or S4). The list area scrolls if needed; the footer stays pinned. |
| S4 | **Current page in a closed group** (for example on `/colaboraciones` after collapsing Sobre mí, or after opening another group) | The Sobre mí header shows the 6px yellow dot right after its label. The group is collapsed, so no rows are visible. | The dot is `aria-hidden`. Orientation for assistive tech comes from the page's own `h1` and from `aria-current` once the group is opened. |
| S5 | **Current page in an open group** (the default on the five Sobre mí routes) | Sobre mí is open on arrival. The current row has the 6px dot at its end and `aria-current="page"`. The header also shows the dot. The other groups are closed. | Only one element in the panel has `aria-current`. Services is never "current" (its `/#services` href is never equal to a pathname). |
| S6 | **Reduced motion** (`prefers-reduced-motion: reduce`, or no `.gsap` class) | The same states as S1–S5, with every transition **instant**: unfold and roll-up, veil, icon, rows, footer, dot pop, chevron and accordion. | The ADR-0002 gate. There is no crossfade, and the settled state appears on the next frame. |
| S7 | **No JS** | S1 exactly, as today. The burger does nothing: the drawer can't open without JS (a **pre-existing gap**). | **Out of scope** (§ Out of Scope 5). The closed navbar must not change in this mode either. |
| S8 | **768 tablet** | S2–S5 in a **420px-wide** panel whose right edge is aligned with the capsule's right edge. The top is under the capsule, as on the phone, and the bottom is 16px from the viewport. The veil stays full-screen. The footer's controls fill the 420px width. | The same behavior, focus and motion as the phone. The cap starts at 640px. |

**Component states inside the panel:**

| Element | Default | Hover (pointer-fine only) | Focus-visible | Active / selected |
|---|---|---|---|---|
| Group header (button) | label ink, scent `ink-muted`, chevron down | none (touch-first) | 2px ink ring, 2px offset | expanded: chevron up |
| Item row (link) | body-sm semibold ink, 1px `surface-1` rule below | title underlined (as desktop items, DDR-0003) | 2px ink ring, 2px offset | current: dot plus `aria-current` |
| Language segment | ink text on white, inside a 2px hairline track | none | 2px ink ring, 2px offset | selected: ink fill, white text; exactly one selected |
| Log in pill | ink 5% fill, ink text | ink 10% (as today) | 2px ink ring, 2px offset | — |
| Sign up pill | ink fill, white text | ink 90% | 2px ink ring, 2px offset (visible on the white panel) | — |

## Content & Copy

All menu text is **verbatim** from `components/layout/nav-config.ts` and `features/sobre-mi/content/nav.ts`. Nothing is renamed (DDR-0002; labels belong to the i18n work). `—` is an em dash. The group labels render in the card-title style (uppercase through CSS; the source text stays as below).

### Group headers and scent lines (the column headings joined with " · ", verbatim)

| Order | Header label | Scent line |
|---|---|---|
| 1 | Itineraries | By length · By season · By appetite |
| 2 | Guides | Getting around · Neighbourhoods · Before you fly |
| 3 | Blog | Latest · Readers |
| 4 | Services | Ready-made · One to one · In person |
| 5 | Sobre mí | Vamos a New York · Ayuda |

The scent line is **derived** from the config's column headings, never a second hand-typed copy. If a heading changes in the config, the scent line follows.

### Rows by group (column heading → items; tag and price where the config has them)

- **Itineraries**
  - *By length:* 3 Days — First Timer; 5 Days — The Classic `[Best seller]`; 7 Days — Deep Cut; Weekend Escape
  - *By season:* Christmas in New York `[New]`; Autumn in the Parks; Summer Rooftops; Winter on a Budget
  - *By appetite:* Foodie New York; Art & Museums; Family New York; Film Locations
- **Guides**
  - *Getting around:* The Subway, Explained; From the Airport; Walking the Grid; Yellow Cab vs App
  - *Neighbourhoods:* Lower East Side; Williamsburg; Harlem; Chinatown & Little Italy
  - *Before you fly:* ESTA & Entry; Budget Calculator; Packing for the Season; Broadway Tickets
- **Blog**
  - *Latest:* Neighbourhood Diaries; Seasonal Guides; Food Crawls; Photo Spots
  - *Readers:* Reader Trips; Ask Us Anything; Mistakes We Made; Newsletter Archive
- **Services** (all → `/#services`)
  - *Ready-made:* Curated by Belén, price **from €25**
  - *One to one:* Custom itinerary with Belén `[Most popular]`, price **€149**. The non-breaking space between "with" and "Belén" is kept (DDR-0005).
  - *In person:* Walk with Belén, price **€290**
- **Sobre mí**
  - *Vamos a New York:* Sobre mí → `/sobre-mi`; Colaboraciones → `/colaboraciones`; Trabajá conmigo → `/trabaja-conmigo`
  - *Ayuda:* Contacto → `/contacto`; FAQ → `/preguntas-frecuentes`

Blurbs are **not shown** on mobile, for any group.

### Footer

| Element | Text |
|---|---|
| Language segments (in this order) | **ES** · **PT** · **EN**. ES is selected on first open. |
| Buttons (left, then right) | **Log in** · **Sign up** (verbatim, English, as today) |

### Accessible names (new or changed)

| Element | Before | Now | Note |
|---|---|---|---|
| Burger, closed | "Toggle menu" | **"Abrir menú"** | i18n follow-up |
| Burger, open (X) | "Toggle menu" | **"Cerrar menú"** | i18n follow-up |
| Panel landmark (`nav`) | "Menu" | **"Menú"** | i18n follow-up |
| Language control (group) | "Language" (listbox; plus the visible word "Language") | **"Idioma"**. The visible word is removed; the globe is `aria-hidden`. | i18n follow-up |
| Veil | a button, "Close menu" | not exposed to assistive tech (pointer-only; the X and Esc cover keyboard and assistive tech) | — |
| Group header button | — | exactly the group label ("Itineraries" … "Sobre mí"). The scent line is exposed as its description, not as part of its name. | — |
| Logo link | "Vamos a NY — home" | unchanged | closed state |

**i18n follow-up (not in this spec):** the accessible names above are Spanish, while the visible labels (Itineraries, Guides, Blog, Services, Log in, Sign up) stay English (DDR-0002). The drawer's language control starts on ES while the desktop language menu starts on EN (frozen). The i18n ADR has to unify labels, names and the language state across both breakpoints.

No `[TBD]` copy remains.

## Motion Intent

The drawer has **one expressive moment: the "unfold" on open** (user-approved 2026-09-27, the updated mockup's `render()` `anim==='open'` block and the `act('toggle')` close timeline). The panel is pulled down out of the capsule like a blind, braking with the landing's subway ease. Everything else is functional. The unfold goes beyond `design-conventions.md § Motion Principles` (≈850ms total, more than the 800ms orchestrated-reveal limit, and a second expressive moment on pages that already have one). **DDR-0006 covers that deviation** (§ Decision › Motion), on the DDR-0004 precedent. It runs only on user action, never on load.

Values go in `lib/motion.ts` as a new `drawer` entry. `EASE.arrive` already exists and is reused. Values that aren't existing tokens are **new named values**, listed after the table, and no existing value changes. The mechanism is the Architect's call (see § Notes for the Architect).

**Open: the "unfold" timeline (t = 0 at the tap)**

| # | What moves | Motion | Starts at | What it tells the Visitor |
|---|---|---|---|---|
| M1 | Veil | Opacity 0 → 1, 0.25s, `power1.out` | 0 | The page behind is set aside. |
| M2 | Burger icon → X | The X rotates in from −90° to 0°, scales from 0.6 to 1 and fades in, 0.35s, `EASE.arrive` | 0 | The same button now closes the menu. |
| M3 | Panel | Unfolds down out of the capsule. The clip goes from `inset(0 0 100% 0 round 24px)` to fully shown, while the panel moves from y −10px to 0, 0.55s, `EASE.arrive` (the subway brake, about 2% overshoot). The clip is cleared at the end. | 0 | The menu comes out of the capsule. |
| M4 | Group rows (the five headers, with the body of a group that opens by default) | Each rises 14px and fades in, 0.35s, `power2.out`, stagger 0.05s | 0.15s | Read top to bottom: this is the index. |
| M5 | Pinned footer | Rises 24px and fades in, 0.4s, `EASE.arrive` | 0.30s | Language and account sit at the bottom. |
| M6 | Current-group header dot (the yellow dot on the header of the group that contains the current page; on open, that group is the one open by default, S5) | Pops in, scale 0 → 1, 0.4s, `back.out(3)` | 0.45s | "You are here." It lands last, after the index. |

The whole open sequence settles by about 0.85s. The row dot (on the current item) is **static**, as in DDR-0003, and only the header dot pops. Nothing travels.

**Close**

| # | What moves | Motion | Starts at |
|---|---|---|---|
| M7 | Panel | Rolls back up: the clip returns to `inset(0 0 100% 0 round 24px)` while the panel moves to y −6px, 0.25s, `power2.in` | 0 |
| M8 | Veil | Opacity to 0, 0.2s | 0.05s |
| M9 | Unmount | The panel and veil unmount when M7 and M8 finish, at about 0.25s. The X → burger icon swap is **instant** at that point, and the closed state is exactly today's pixels. | 0.25s |

**Accordion (inside the open panel)**

| # | What moves | Motion | What it tells the Visitor |
|---|---|---|---|
| M10 | Chevron | Rotates 180°, 200ms (the same as the desktop triggers), `--ease-default` | Open or closed |
| M11 | Group expand | The body reveals and the headers below slide down (they don't jump), `--duration-slow` (300ms), `power2.out` | What opened, and where the rest went |
| M12 | Group collapse (including the single-open auto-collapse) | The body closes and the headers below slide up, `--duration-base` (180ms), `power2.in`. When one group closes and another opens, the Architect may overlap them. The whole swap stays ≤500ms. | Only one group is open at a time. |
| M13 | Rows on expand | Each row fades in with a 6px rise, `--duration-base`, stagger 30ms, starting about 50ms into M11. The stagger is capped so the last row starts ≤250ms after M11 begins. | The rows belong to that header, in reading order. |

**Reduced motion / no `.gsap` (ADR-0002):** **everything is instant.** That covers the veil, icon, panel, rows, footer, dot pop, close, chevron and accordion. The settled state appears on the next frame, with no crossfade.

**New named values for `lib/motion.ts` (proposal; the Architect names and places them):**
- `MOTION.drawer.open`: veil 0.25s `power1.out`; icon 0.35s `arrive`, from rotate −90° and scale 0.6; panel 0.55s `arrive`, clip from bottom 100%, from y −10px; rows 0.35s `power2.out`, from y 14px, stagger 0.05s, at 0.15s; footer 0.4s `arrive`, from y 24px, at 0.30s; dot 0.4s, from scale 0, at 0.45s.
- `MOTION.drawer.close`: panel 0.25s `power2.in`, to y −6px; veil 0.2s at 0.05s.
- `MOTION.drawer.accordion`: expand 0.3s `power2.out`; collapse 0.18s `power2.in`; rows 0.18s, from y 6px, stagger 0.03s, at 0.05s; chevron 0.2s.
- A new named ease for the pop, `EASE.pop` = `back.out(3)`. It is the only new ease, and `EASE.arrive` is reused as is.

**Global rules:**
- Input is never blocked, including during the 0.85s unfold. A tap on a header, a row or the X mid-sequence acts at once. A close during the unfold rolls the panel back up from its current state (no queue). A tap during M10–M13 retargets from the current position. Tapping a header twice quickly leaves it collapsed.
- Focus moves into the panel at t = 0 (it doesn't wait for the unfold). On close, focus returns to the burger at once, and the panel can't receive focus during M7.
- No motion moves the capsule or page content. Only the icon inside the burger animates.
- Scroll position: when a group opens, its header stays in view. If collapsing a group above it would move the newly opened header out of the list area, the list scrolls so the header sits at the top of the list area. Scrolling is instant under reduced motion.
- Every open starts from the default state (S2 or S5), with the list scrolled to the top.

## Responsive Behavior

| Viewport | Panel box | List area | Footer | Notes |
|---|---|---|---|---|
| **360 × 780** (reference) | 328 × 684 (16px insets, top 80, bottom 16), radius 24; unchanged from today | First level (S2) fits with **no scroll** | Pinned to the panel's bottom | The Itineraries and Guides groups, open, scroll inside the list area. |
| **390 × 844** | Same rule (358px wide) | First level fits with no scroll | Pinned | No layout change from 360 |
| **360 × 640** (short phone) | 328 × 544 | The list **scrolls** once a group is open, and the first level still fits. The last row of any open group can be scrolled fully clear of the footer. | **Pinned**, visible at every scroll position | Overscroll doesn't chain to the page. |
| **320** (conventions floor) | 288px wide | No horizontal scroll. Scent lines wrap, never truncate. | The segmented control and the two pills fit side by side. | Best-effort width; tested for overflow only |
| **640–1023** (768 × 1024 tablet) | **420px wide**, right edge aligned with the capsule's right edge; top 80, bottom 16 | As at 360 | Pinned, controls span 420px | The veil stays full-screen. |
| **Landscape phone** (for example 780 × 360) | Tablet rule (≥640 wide), about 264px tall | Scrolls | Pinned | Best-effort. The list must stay reachable. |
| **≥1024** | The drawer doesn't render. If it was open when the viewport crossed 1024, it closes. | — | — | Desktop pixel-identical to its baselines |

**Layout values (existing tokens only; no token additions):**
- **Header row:** min-height 56px (it grows when the scent line wraps). The label uses `card-title`, with the 6px dot 8px after the label when applicable. The scent line uses `eyebrow` in `ink-muted` and may wrap to two lines. The 12px chevron (the desktop path, stroke 1.5) is right-aligned and centred on the row. Text inset from the panel edge is 20px, as today. There is a 1px `hairline` above the first header and below every group.
- **Open body:** column heading (`eyebrow`, `ink-muted`) with 12px above and 4px below. Rows are min-height 44px, `body-sm` semibold `ink`, with a 1px `surface-1` rule below each. The tag is the desktop `caption` semibold yellow pill, 8px after the title. The price is right-aligned in Courier Prime bold at the `body-sm` size, in the config's own case ("from €25", not uppercased). The dot sits at the row end, after the price, and never overlaps the title, tag or price (DDR-0003). The body has 12px of bottom padding.
- **Footer:** white, 1px `hairline` top border, 12px / 16px / 16px padding, 12px between its two rows. Row 1 is the globe (16px) plus the segmented control: a 48px track with a 2px `hairline` border, fully rounded, three equal segments in `label-button`. Row 2 is two 48px `label-button` pills, fully rounded, equal width, with 12px between them.

## Accessibility Acceptance

**Keyboard path (tablet with a keyboard, switch access, desktop browser narrowed below 1024):**
1. Tab to the burger ("Abrir menú") → Enter or Space opens the drawer → focus moves to the "Itineraries" header.
2. Tab moves through the headers in order. An open group's rows follow its header, and after them come the next headers.
3. After the list: ES → PT → EN → Log in → Sign up → the X ("Cerrar menú") → back to "Itineraries". Shift+Tab goes the reverse way. Focus never leaves this cycle while the drawer is open.
4. Enter or Space on a header toggles it. Focus stays on the header.
5. Enter on a row navigates, and the drawer closes.
6. Esc closes the drawer from anywhere inside it. Focus returns to the burger.

**Semantics:**
- The burger has `aria-expanded` (`false` / `true`), `aria-controls` pointing to the panel while it is open, and a name that switches between "Abrir menú" and "Cerrar menú".
- The panel is a navigation landmark named "Menú" and behaves modally. While it is open, everything outside the burger and the panel is **inert**: not focusable, and hidden from assistive tech. Whether that is done with a dialog wrapper or with `inert` siblings is the Architect's choice. The observable behavior above is the contract.
- Each group header is a `button` with `aria-expanded` and `aria-controls`, inside an **`h2`**. Each column heading is an **`h3`**. Items are links in lists. A screen-reader heading list inside the drawer shows 5 `h2`, plus the `h3` of the open group.
- Header name = the group label only. The scent line is the header's description.
- The language control is a group named "Idioma" with three toggles (or a radio group), and it exposes which one is selected.
- `aria-current="page"` is on the current row only. Every dot is `aria-hidden`. The globe and the chevrons are `aria-hidden`.
- No live region is needed. `aria-expanded` announces open and closed.

**Targets and contrast:**
- Every row's **visible** box is ≥44px tall and spans the list width. Headers are ≥56px. Pills are 48px. Each language segment's tappable area is ≥44 × 44 (the full height of the 48px track).
- The scent lines and column headings use `ink-muted` (#484846, about 9.2:1 on white). **Not `ink-tertiary`** (#A8A8A4, about 2.4:1, which fails AA).
- Tag pills (ink on #FFD800) and the selected segment and Sign up (white on ink) meet 4.5:1.
- The focus ring (2px ink, 2px offset) is ≥3:1 against the white panel, including around the ink-filled pill and the selected segment.
- At 200% text zoom and at 320 width, nothing is clipped and there is no horizontal scroll inside the panel.

**Motion:** reduced motion makes every transition instant (S6). Nothing flashes, and nothing loops.

**Automated:** run `@axe-core/playwright` on the open drawer in S2 and in S3 (Itineraries open), and in S5 on `/sobre-mi`, at phone-360 and tablet-768, with **zero violations**. QA also does a manual keyboard and screen-reader pass (VoiceOver on iOS Safari at 360; keyboard at 768).

## Data Dependencies

| Read / write | Entity & operation | Contract | Notes |
|---|---|---|---|
| Read | Nav groups, columns, items, tags, prices, hrefs | N/A: static (`nav-config.ts`, `features/sobre-mi/content/nav.ts`) | A single source for desktop and mobile. The scent line is derived from the column headings, not a new field. |
| Read | Current route | N/A: `usePathname()` (as today) | It drives S4, S5 and the default open group. |
| Write | Language selection | N/A: local UI state only, as today | Not persisted, and nothing is translated. The drawer defaults to ES, and the desktop menu keeps EN (see § Content & Copy › i18n follow-up). |

No backend endpoints. Nothing is optimistic. No Pre-Contract items.

## Out of Scope

1. **Desktop (≥1024) and the closed navbar at every width.** Pixel-identical; no work.
2. **The 32 placeholder links (Q1).** Itineraries, Guides and Blog items keep falling back to `/#services`. Hiding or re-pointing them is a separate DDR.
3. **Translation** of visible labels and the language control's real behavior (the i18n ADR). The control still changes nothing but its own selection.
4. **Where Log in and Sign up lead.** They stay `#login` and `#signup` until the traveler dashboard exists.
5. **A drawer that opens without JS.** This is a pre-existing gap (S7). **Recommendation: out of scope.** The closed navbar is frozen in every mode, and a no-JS open state (a `<details>`, `:target` or `popover` wrapper) would restructure the burger, which is more than "cheap". If, while planning, the Architect finds a mechanism that is pixel-neutral on the closed state and adds no second copy of the menu, they may propose it as a spec amendment. It isn't planned by default.
6. **Blurbs on mobile**, and the desktop "See details" CTA.
7. **Direction B ("Líneas") and Direction C ("Bolsillo").** B is the planned evolution once the placeholder pages exist.
8. **Any moving or travelling marker in the drawer**, and a dot animation when a group is opened by a tap (DDR-0003, DDR-0006 Q6). The one-time header-dot pop during the open unfold (M6) **is** in scope.
9. **The desktop mega-menu's eyebrow contrast** (`ink-tertiary`). It is frozen, pre-existing debt, not touched here.
10. **The footer, and any other part of the landing.**

## Acceptance Criteria

Unless stated otherwise, each AC runs on **phone-360** (360 × 780) and **tablet-768**, from `/`.

**Freeze (S1, ≥1024)**
1. **Desktop ≥1024 and the closed navbar are pixel-identical.** Every committed screenshot other than the four drawer files listed in DDR-0006 compares diff 0. That covers every `navbar-closed*` (360, 768 and 1280, including reduced motion), every `navbar-panel-*`, `language-menu-desktop-1280`, and every file under `tests/e2e/landing.spec.ts-snapshots/` and `tests/e2e/sobre-mi/`.
2. At desktop-1280 the drawer panel and veil never render, and the desktop language button still reads "EN".
3. Only drawer screenshots on phone-360 and tablet-768 are added or regenerated, and the PR cites DDR-0006.

**Burger (S1 → S2)**
4. S1: the burger's accessible name is "Abrir menú", with `aria-expanded="false"`.
5. Tapping the burger shows the veil and the panel. The burger then shows the X, is named "Cerrar menú", has `aria-expanded="true"`, and its `aria-controls` references the panel. The page has a navigation landmark named "Menú".

**First level (S2)**
6. On `/`, the panel shows exactly five group headers in this order: Itineraries, Guides, Blog, Services, Sobre mí. All have `aria-expanded="false"`, and no item link is visible or exposed to assistive tech.
7. Each header's scent line equals the verbatim text in § Content & Copy.
8. At 360 × 780 and 390 × 844, the list area in S2 has no scroll overflow (`scrollHeight ≤ clientHeight`).
9. At 360, the panel's box is inset 16px left, right and bottom and 80px from the top, with a 24px radius (the same box as today). The veil covers the viewport behind it.
10. The footer shows the globe and a control named "Idioma" with segments ES, PT, EN in that order and ES selected. Below it, Log in (left) and Sign up (right) sit side by side, each 48px tall.
11. Services is closed by default on every route (`/` and all five Sobre mí routes).

**One group open (S3)**
12. Tapping a closed header sets `aria-expanded="true"` and shows its column headings (as `h3`) and its items (as links) in config order.
13. Single-open: with Itineraries open, tapping Guides opens Guides and closes Itineraries.
14. Tapping the open header closes it, and the panel returns to S2 (or S4).
15. Every item row's visible bounding box is ≥44px tall and spans the list width, in every group, at 360 and at 768.
16. The tags "Best seller" (5 Days — The Classic), "New" (Christmas in New York) and "Most popular" (Custom itinerary with Belén) render as yellow pills on their rows. No other row has a tag.
17. Services opened shows exactly three rows with the right-aligned prices "from €25", "€149" and "€290" in Courier Prime bold, and no blurbs. "with Belén" never breaks across lines.
18. No row in any group shows a blurb.
19. After a group opens, its header is inside the list area's visible rect, including when a longer group above it has just collapsed.

**Current page (S4, S5)**
20. On each of `/sobre-mi`, `/colaboraciones`, `/trabaja-conmigo`, `/contacto` and `/preguntas-frecuentes`, opening the drawer shows Sobre mí expanded and the other four groups collapsed.
21. On those routes, exactly one element in the panel has `aria-current="page"` (the current row), and that row shows the static 6px yellow dot (Sobre mí AC 9, carried over).
22. On those routes, the Sobre mí header shows the 6px dot while the group is open, and it keeps the dot after the group is collapsed or after another group is opened (S4).
23. On `/`, no header and no row shows a dot, and no element has `aria-current`.
24. Closing and reopening the drawer restores the default state (S2 or S5), with the list scrolled to the top. The previously open group is not remembered.

**Navigation and closing**
25. Tapping any item goes to its `href` (or `/#services` when it has none) and the drawer closes (Sobre mí AC 3, carried over).
26. Tapping a Services item from a Sobre mí route lands on the landing with `#services` in view (RV-0010, carried over).
27. Tapping PT or EN selects it (exactly one selected). The drawer stays open, and the URL and page text don't change.
28. Log in and Sign up close the drawer and go to `#login` and `#signup`.
29. The X, a tap on the veil, and Esc each close the drawer, and in each case focus lands on the burger, named "Abrir menú".
30. Resizing from 768 to 1280 with the drawer open closes it. The page scrolls again and is not inert, and the desktop navbar renders identically to `navbar-closed-desktop-1280`.
31. While the drawer is open the page behind doesn't scroll, and scrolling past the end of the list area doesn't scroll the page.

**Keyboard and screen reader**
32. On open, the focused element is the "Itineraries" header.
33. With no group open, Tab from "Itineraries" visits, in order: Guides, Blog, Services, Sobre mí, ES, PT, EN, Log in, Sign up, Cerrar menú, and then Itineraries again. Shift+Tab visits the reverse order. With a group open, its rows are visited right after its header.
34. While the drawer is open, no element outside the burger and the panel can receive focus, and they are absent from the accessibility tree. Both are restored on close.
35. Enter and Space on a header toggle it, and focus stays on that header.
36. Each header is a button inside an `h2`, and its accessible name is exactly the group label. Each column heading inside an open group is an `h3`.
37. Every dot, the globe and the chevrons are `aria-hidden`.
38. Every control in the panel shows the 2px ink focus ring when focused from the keyboard, including Sign up (ink-filled) and the selected language segment.
39. Each language segment has a tappable area of ≥44 × 44 px.
40. axe reports zero violations on the open drawer in S2, in S3 (Itineraries open) and in S5 (on `/sobre-mi`), at 360 and at 768. Color-contrast on the scent lines and column headings is included in that check.

**Motion (S6)**
41. With motion on, opening runs the unfold: at t≈0.1s the panel is partly clipped from the bottom (its visible height is less than its box), the X is rotated between −90° and 0°, and the veil is partly transparent. By t = 0.9s everything has settled: the panel is fully shown at y 0, the X is upright at full scale, the five headers and the footer are at full opacity in place, and the current-group header dot (on Sobre mí routes) is at scale 1. The settled screenshot equals the committed drawer baseline.
42. With motion on, closing rolls the panel up and fades the veil. Both are unmounted by 0.35s, and the closed navbar then matches `navbar-closed` for that project (the icon is back to the burger, instantly).
43. During the unfold (t < 0.85s), tapping a header opens that group, tapping the X closes the drawer from its current state, and Tab moves focus inside the panel. Nothing waits for the sequence to finish.
44. With motion on, expanding a group ends in ≤500ms, including the auto-collapse of the previous group and the row stagger. Tapping the same header twice within 100ms leaves it collapsed, with no animation still running after 500ms.
45. On a Sobre mí route, only the header dot animates on open (scale from 0). The current row's dot is visible at full size from the first frame, and neither dot changes position.
46. With `reducedMotion: 'reduce'` (and, separately, with the `.gsap` class absent), a screenshot taken on the frame right after each tap (open, expand, collapse, close) equals the settled screenshot. No clip, rotation, rise, fade or pop is observable.
47. Opening, expanding and closing don't move the capsule or any page content. Only the burger's icon animates inside the capsule, and at rest it matches the baseline.

**Responsive**
48. At 360 × 640, with Itineraries open, the list scrolls inside the panel, the footer stays fully visible at every scroll position, and the last row ("Film Locations") can be scrolled fully above the footer.
49. At 768 × 1024, the panel is 420px wide and its right edge is aligned (±1px) with the capsule's right edge. Its top and bottom match the phone rule, and the veil covers the full viewport.
50. At 639px wide the panel spans the full width minus the 16px insets. At 640px it is 420px wide.
51. At 320px wide there is no horizontal scroll in the panel, scent lines wrap without truncation, and the two pills and the segmented control fit without overflow.

**No JS (S7)**
52. With JavaScript disabled, the closed navbar at 360, 768 and 1280 matches its baseline (the drawer not opening is the documented pre-existing gap).

## Where This Spec and the Mockup Differ

| Mockup | Spec | Why the spec wins |
|---|---|---|
| Scent lines and column headings in `ink-tertiary` (#A8A8A4) | `ink-muted` (#484846) | #A8A8A4 on white is about 2.4:1, below the constitution's WCAG 2.2 AA floor for new text (4.5:1). |
| Scent line at about 10.5px, tracking 0.1em | the existing `eyebrow` utility (12px, 0.14em); may wrap to two lines | 10.5px isn't a token, and the conventions don't let raw values in through a spec. If the user wants the smaller, one-line look, that is a token proposal (`eyebrow-sm`) for a later DDR. |
| Group label at about 17.6px | `card-title` (19px), as today's drawer | An existing utility. It is the same style as today's group titles. |
| Group headers wrapped in `h3`; column headings as `p` | Headers in `h2`, column headings in `h3` | A heading outline inside the menu. The coordinator asked for column headings as `h3` eyebrows. |
| Dot with a 1px ink 25% ring | 6px yellow dot with no ring, the same as today's drawer and the language menu | DDR-0003 keeps the drawer's static dot unchanged. The ring was mockup illustration. |
| Pills 46px | 48px | Today's pill height; the coordinator asked for 48px. |
| Segments 38px tall inside a 48px track | Each segment's tappable area covers the track's full height (≥44px) | The 44px target rule |
| Veil is a `div` | Pointer-only, hidden from assistive tech | The same result. Stated so QA can test it. |

## Notes for the Architect

1. **ADR-0007 limits `height` animation to the FAQ** ("escopo fechado"). M4 and M5 ask for the headers below to slide rather than jump. Choose either a new ADR that extends ADR-0007 to the drawer accordion, or a transform-based mechanism (Flip on the header list, or a clip plus translate on the siblings) that produces the same observable result. The spec only fixes the intent and the ACs.
2. **Language state:** the desktop capsule renders the shared `lang` state (`navbar.tsx`), and its default of **EN** is frozen. The drawer's control must start on **ES** without changing the desktop label. That means separate state or a breakpoint-scoped default: your call. The segment order ES · PT · EN is drawer-only. The desktop listbox keeps EN · ES · PT.
3. **Resize past 1024 while open** (AC 30): with `inert` and a scroll lock in place, a stale open state would lock the desktop. It has to be reset on crossing the breakpoint.
4. **Single source of content:** the drawer and the mega-menu keep reading the same config. The scent line is derived from the column headings, with no new field. Add the unit test from the States Matrix (no empty groups).
5. **No-JS drawer:** out of scope (§ Out of Scope 5). Raise an amendment only if a mechanism is pixel-neutral on the closed state.
6. **Tests to update** (DDR-0006 › Consequences): the "Toggle menu" and "Menu" locators; the drawer hit-region test (replaced by the visible ≥44px check in AC 15); the AC 3 drawer test (open the Sobre mí group first where it isn't the default).
7. **Motion values** go in `lib/motion.ts` as a new `drawer` entry (§ Motion Intent › New named values), reusing `EASE.arrive` and adding `EASE.pop` (`back.out(3)`).
8. **The unfold animates `clip-path`** (with `round 24px`, matching the panel radius) plus `y`. `clip-path` is paint-only, not a layout property, so ADR-0007 doesn't apply to it. Confirm whether `frontend-architecture-conventions.md § Animation` (transform and opacity only) needs an ADR for it, or whether a transform-only equivalent (for example `scaleY` on a wrapper with counter-scaled content) reproduces the mockup. The approved look is the mockup's clip. The backdrop blur of the capsule must not flicker while the panel unfolds under it.

## Design Handoff

1. **Spec:** this document. Every section is filled or explicitly N/A.
2. **Screen inventory and navigation pattern per breakpoint:** § Screens & Surfaces.
3. **States matrix:** § States Matrix (S1–S8, the data states as N/A with reasons, and the component states).
4. **Copy deck:** § Content & Copy (verbatim menu text, scent lines, footer, the new accessible names).
5. **Motion intent and reduced motion:** § Motion Intent (M1–M13, plus the new named values).
6. **Token additions:** **none in `app/globals.css`.** New *named motion values* go in `lib/motion.ts` (§ Motion Intent › New named values, including `EASE.pop`). Otherwise only existing tokens and utilities are used (`card-title`, `eyebrow`, `body-sm`, `caption`, `label-button`, `ink`, `ink-muted`, `surface-1`, `hairline`, `brand`, `--shadow-drawer`, `--duration-*`, `--ease-default`). One optional future proposal, not adopted: `eyebrow-sm`.
7. **Accepted DDRs:** DDR-0006 (implemented here), DDR-0002 (amended), DDR-0003 (extended), DDR-0005.

## Open Clarifications

None.
