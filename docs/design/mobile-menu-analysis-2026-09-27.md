# Mobile navigation (drawer below 1024px): design direction exploration

- **Status:** Exploration (pre-DDR, pre-spec). Not a DDR and not a `/specify` output. Nothing in the repo was edited.
- **Date:** 2026-09-27
- **Branch read:** `feat/typography-montserrat` (Montserrat body per DDR-0005)
- **Scope:** the burger, the drawer, the veil, the language chips and Log in / Sign up **below 1024px**. The desktop capsule and mega-menu (≥1024) are out of scope and must stay pixel-identical.
- **Anchors read:** `components/layout/navbar.tsx`, `components/layout/nav-config.ts`, `features/sobre-mi/content/nav.ts`, `app/globals.css`, `lib/motion.ts`, DDR-0002, DDR-0003, DDR-0005, ADR-0006, ADR-0007, `docs/qa/bugs/0004-navbar-touch-targets-below-44.md`, `docs/reviews/2026-09-26_sobre-mi_v1.md` (RV-0006, RV-0015), `docs/specs/sobre-mi/spec.md` (drawer parts, AC 3/5/9/51, clarification at line 624), `docs/specs/constitution.md`, `docs/design/vamosany-design-system.md` §§ 1, 2, 13, 15, 19, the committed drawer baselines (`tests/e2e/navbar.spec.ts-snapshots/drawer-*-phone-360-linux.png`).
- **Mobbin:** worked. 10 searches (screens on web + iOS, one flow search). Mobbin's **web** corpus is desktop-width only, so the phone patterns come from its **iOS** corpus. They transfer to mobile web: same thumb, same screen. All references below are real Mobbin entries.

---

## 0. Readiness gate

| Check | State | Consequence |
|---|---|---|
| Project | `vamosany-front-end` | — |
| Constitution | v1 Accepted (inherits backend v2.3). User: **Visitor**, pre-customer, "majoritariamente no celular". 360 is first-class. Language order: **es > pt > en**. Motion stance: expressive. Floor: WCAG 2.2 AA. | Binding. Every direction below is judged against the Visitor on a 360 phone, one hand. |
| Non-Goal 1 / ADR-0006 | The landing, **including the navbar, the open drawer and its motion**, is frozen. Baselines: `drawer-top` and `drawer-last-group` at 360 and 768. | **Any direction here needs a DDR** before a spec. See § 6. |
| Backend contract | None needed. The menu reads static config. Log in / Sign up point at `#login` / `#signup`, which don't exist yet. | No Pre-Contract data. Auth is a **product question** (§ 5, Q3), not an API one. |
| Spec-Kit | Specs live in `docs/specs/` by convention | A future spec would go in `docs/specs/mobile-navigation/spec.md`. |

---

## 1. The current mobile menu, exactly as the code renders it

### 1.1 Structure (top to bottom, 360 × 780)

```
[capsule 56px, sticky top 16px]  logo (24px tall) ........................ burger/X (40px circle)
[veil: white 75%, full screen, behind the panel, tap = close]
[panel: fixed, 16px from left/right/bottom, top 80px, radius 24px, scrolls inside]
  ITINERARIES                       <- card-title, Courier Prime 19px caps
    BY LENGTH                       <- eyebrow, 12px caps, #a8a8a4, tracking .14em
      3 Days — First Timer          <- body-sm 14px, #484846, 22px tall rows, 8px apart
      5 Days — The Classic
      7 Days — Deep Cut
      Weekend Escape
    BY SEASON  (4 items)
    BY APPETITE (4 items)
  ─────────
  GUIDES  (3 columns × 4 items)
  ─────────
  BLOG    (2 columns × 4 items)
  ─────────
  SERVICES
    READY-MADE   Curated by Belén ................................. from €25
    ONE TO ONE   Custom itinerary with Belén ........................... €149
    IN PERSON    Walk with Belén ....................................... €290
  ─────────
  SOBRE MÍ
    VAMOS A NEW YORK  Sobre mí · Colaboraciones · Trabajá conmigo
    AYUDA             Contacto · FAQ
  ─────────
  (globe) Language                              [EN] [ES] [PT]
  [ SIGN UP ]   <- 48px grey pill, full width
  [ LOG IN  ]   <- 48px grey pill, full width
```

### 1.2 Counts

| | Count |
|---|---|
| Group titles | 5 |
| Column eyebrows | 14 |
| Links | **40** (12 + 12 + 8 + 3 + 5) |
| Links that go to a real page | **5** (the Sobre mí group) |
| Links that go to `/#services` because they have no `href` | **32** (every Itineraries, Guides and Blog item) |
| Links that go to `/#services` on purpose | 3 (the Services items) |
| Visible without scrolling at 360 × 780 | ~14 links: all of Itineraries and the first 2 Guides (see `drawer-top` baseline) |
| Total panel content height (estimate from the baselines and paddings) | ~2,200px, which is **~3.2 panel heights** (visible panel area is 684px) |
| Where Services (the only priced, sellable items) starts | ~1,600px down, roughly the **third screen** |
| Where Sign up / Log in are | the last ~130px, after 40 links |

### 1.3 Concrete problems

**Hierarchy and priority**
1. **Everything is expanded, all the time.** The drawer is the desktop mega-menu poured into one column: 5 groups, 14 eyebrows and 40 links, all at once. There is no first level. A phone Visitor has to scroll through all of it to find anything that isn't an itinerary.
2. **What sells is buried.** Services (from €25, €149, €290) is the Visitor's path to becoming a customer, and it's the only group with prices, but it sits on the third screen, after 32 placeholder links.
3. **The order is the desktop's left-to-right order, which doesn't work on a phone.** On desktop, all 5 triggers are visible side by side, so order barely matters. In a vertical list, order is priority, and the current order puts content first and commerce and "who is Belén" last.
4. **Three levels of type for two levels of meaning.** Group title (19px Courier caps), eyebrow (12px Courier caps, light grey) and item (14px Montserrat, dark grey) all stack. Eyebrows like "LATEST", "READERS" and "READY-MADE" add scroll depth without helping anyone choose on a phone.

**Content**
5. **32 of 40 links are dead ends.** Every Itineraries, Guides and Blog item falls back to `/#services` (`href ?? "/#services"`). A Visitor who taps "Harlem" or "The Subway, Explained" lands on the Services section of the home page. That is part of why the menu feels disorganised: most of what it offers doesn't exist yet (ADR-0006 X-4, "~48 pages that don't exist"). **This is the root cause, and layout alone can't fix it** (Q1).
6. **What the Visitor needs to decide is dropped on mobile.** Blurbs, the tags "Best seller", "New" and "Most popular", and the desktop's "See details" all disappear. Services shows a bare title and price, so "Curated by Belén — from €25" loses "Itineraries she walked and wrote. Download and go."
7. **Labels mix languages.** Four English group labels, one Spanish ("Sobre mí"), and the English "Language / Sign up / Log in" (DDR-0002 accepted this until i18n lands). In a single vertical list the switch is more jarring than across a desktop bar.

**Language and auth**
8. **Language is on the last screen, and EN is selected by default** on a site whose constitution says Spanish first. The chips are in EN / ES / PT order, which is the reverse of the constitution's es > pt > en. They're about **33px** tall (label-button 17px + 12px padding + 4px border), which is under 44. And the switch only sets local state; nothing gets translated yet.
9. **Sign up and Log in are two full-width grey pills with equal weight, at the very bottom, and they lead nowhere** (`#signup`, `#login`). They take 108px of the Visitor's thumb zone for a feature that doesn't exist yet (the traveler dashboard is "depois"). Sign up comes before Log in on mobile, while desktop has Log in first.

**Touch, reach and closing**
10. **Rows are 22px tall with a 30px pitch.** The invisible hit area only reaches 30px (`pointer-coarse:before:-inset-y-1`). The code comment says so: "44px exclusive targets don't fit the frozen 30px pitch". That means the spec's clarification (line 624, "reach 44px through invisible hit-area extensions only") is **not actually met** for drawer items. QA-0004 is still Open and RV-0006 is unresolved.
11. **Close is top-right only** (the X that replaces the burger in the capsule), which is the hardest spot for a one-handed right thumb on a 6"+ phone. The veil also closes, but only its visible sliver (above the panel, and the 16px gutters) can be tapped.
12. **Esc does not close the drawer.** The key handler closes the desktop panel and the language menu only (`navbar.tsx:54-62`); `mobileOpen` is never reset. That matters for keyboard use on tablets and with switch access.

**Accessibility**
13. **No focus management.** Focus isn't moved into the panel on open or returned to the burger on close. There's no focus trap, and the page behind isn't `inert`, so Tab walks out of the menu into the hidden page. The burger has no `aria-controls` and a static `aria-label="Toggle menu"`.
14. **Group and column titles are `<p>`.** A screen-reader user gets 40 links in a row with no headings or lists-of-lists to jump between. The drawer is a landmark ("Menu", RV-0015 done), but inside it there's no structure.
15. **No JS means no menu.** The burger is client state only. Without JS, a phone Visitor has no navigation at all. (Desktop at least has CSS hover.)

**Motion**
16. **The drawer has no motion of its own.** It pops in and out (conditional render) and the burger icon swaps instantly. That's fine functionally, but on a site whose motion stance is *expressive* and whose desktop menu has the subway marker (DDR-0003), the phone menu is the least considered surface.

**Tablet (768)**
17. The panel is 736px wide with one column of 14px links. That's a lot of empty width, and the same 3.2-screen scroll.

**What already works and should be kept:** the floating panel under the capsule (it's on-brand and keeps the logo and X visible), the white veil, `aria-current` plus the static yellow 6px dot on the current page (DDR-0003), a tap on an item closing the drawer (AC 3), body scroll lock, and the 48px auth buttons.

---

## 2. Mobbin references

All links open on Mobbin. "(iOS)" means a native-app screen whose pattern transfers to mobile web.

| # | App | Link | What it shows | Used in |
|---|---|---|---|---|
| R1 | **The Infatuation** (NYC food guide), side navigation | [flow](https://mobbin.com/flows/9e3341a7-0267-43b7-8cb3-48f9a60e0533) · [menu screen](https://mobbin.com/screens/979b7e97-c5aa-464d-921e-ffe7a76cca57) | White full-screen menu, X top-right. **Condensed-caps rows** ("NEIGHBORHOODS", "PERFECT FOR", "CUISINES", "OTHER CITIES", "TRAVEL") with chevrons, grouped under bold sentence-case section heads ("For You", "New York", "Explore") separated by a heavy rule. Only 5 rows at the first level, and every row drills down. It's the closest brand match: NYC, editorial, typewriter/condensed caps, black on white. | B (first level), A (header style) |
| R2 | **Bloomberg**, menu | [flow](https://mobbin.com/flows/aeb97b0c-a98c-45ef-9e27-e3a90790063d) | Grey eyebrow section bands (MAGAZINE, MARKETS, WATCHLISTS, MEDIA), each with ~48px rows split by 1px rules. Saved / Settings / Search are pinned in the top bar. An editorial IA with many sections shown flat, but with **tall rows and clear section breaks**, unlike ours. | A (row rhythm) |
| R3 | **Blue Bottle Coffee**, menu (iOS) | [screen](https://mobbin.com/screens/f842fe90-ecc5-42cf-9bfa-55e1578ca162) | **An accordion menu for a boutique brand.** Tracked uppercase section rows (INSTANT, BREW TOOLS, MERCHANDISE, EXTRAS) with a chevron. One section is open and shows **product cards with a title and a one-line blurb**, and the others stay collapsed. There's a tab strip "Menu / Reorder" at the top. It's the closest pattern to "content + shop in one menu". | A |
| R4 | **On** (running), menu sheet (iOS) | [screen](https://mobbin.com/screens/ff0ebe8f-4a10-4871-a8fd-ba4286fbfe9d) | A sheet with a "Menu" title and X, audience chips (All / Women / Men / Kids), then **one featured image card**, then an eyebrow "ACTIVITIES" and ~44px rows with chevrons. It shows how a commerce-first block can sit above a plain list. | A (Services block), C |
| R5 | **H&M**, menu (iOS) | [screen](https://mobbin.com/screens/78f16a3d-5a4d-4a49-960a-c8d8db128f60) | Search, then tabs (WOMEN / MEN / KIDS / HOME / BEAUTY), then a short uppercase list of primary links, a rule, and **secondary uppercase links** (Customer service, Store locator, Gift card, App settings). It separates "shop" from "service/about" clearly. | A (order), B |
| R6 | **H&M**, drill-down panel (web) | [screen](https://mobbin.com/screens/d11f4b2f-7dbc-4f1b-9ba8-eef0b5ec481d) | A second-level panel with a **← back arrow and a centred title "CLOTHING"**, then "Categories" and "Collections" lists. It's the classic push-panel drill-down. | B |
| R7 | **Hims**, drill-down drawer (web) | [screen](https://mobbin.com/screens/cada6a66-06dd-4b1e-b97f-1cc09a6b4b2c) | Side drawer at level 2: ‹ back, account/cart/X icons, a large title "Everyday Health", eyebrow "EXPLORE", rows with →, and a **"Popular reads" strip of article cards** at the bottom. It mixes commerce with editorial in a drill-down. | B |
| R8 | **SKIMS**, category list (iOS) | [screen](https://mobbin.com/screens/f53e758a-a7d1-4805-b205-01a4d3a5a5d0) | Full-width **uppercase condensed rows, ~56px, with hairline dividers**, under an image banner. It shows that caps display type in tall rows reads as "brand", not "admin". | A, B (row style) |
| R9 | **Panera Bread**, navigation sidebar (iOS) | [flow](https://mobbin.com/flows/7803ad49-4a98-4f9b-becc-7d3f1ac28b6e) | Brand-colour drawer with **7 very large condensed caps links** (MENU, FIND A CAFE, REWARDS & OFFERS…) and small underlined legal links at the bottom. It's a strong example of a short, loud first level. | B (first level) |
| R10 | **Open** (meditation), full-screen menu (web) | [screen](https://mobbin.com/screens/c59ad58b-6c05-4fae-a3ec-18897e0fbae1) | Black full-screen menu with **4 huge links with →** (In Person, Digital, Start Trial, About), a newsletter field, and a row of tiny secondary links (blog, shop, press, faq…). The first level is reduced to 4 intents. | B |
| R11 | **Scoot** (airline), more menu (iOS) | [screen](https://mobbin.com/screens/2d81cf0d-8cff-4ac3-8f63-c63f4255077a) | **Yellow** background, eyebrow sections "COMPLETE YOUR TRIP" and "ABOUT", then white rounded rows with an external-link icon. It's the only yellow travel reference, and it shows how much yellow is too much for us (design system § 19.2: yellow is punctuation). | — (cautionary) |
| R12 | **Booking.com**, account menu (iOS) | [screen](https://mobbin.com/screens/b25360d0-33e1-4c44-8a02-730c7b34b7d7) | Grouped rounded sections (Travel activity / Help and support / Legal and privacy / Discover), with icon rows and chevrons, and a tab bar. The grouping is clear and each row is 44px or more. | A (footer grouping) |
| R13 | **Yami**, "Quick Access" bottom sheet (iOS) | [screen](https://mobbin.com/screens/21da08d8-3bfd-4f53-91fb-4841fb2bca36) | A bottom sheet with a title and X, **3 stat tiles, then a 2-column grid of quick actions**, a promo card, and a help row. It's commerce shortcuts in thumb reach. | C |
| R14 | **Opera**, browser menu sheet (iOS) | [screen](https://mobbin.com/screens/f97e72c1-9313-4d08-ad4b-3732740f1894) | A bottom sheet with **4 square quick actions** on top and a list of rows below, ending with "Show More Options ›". It's the canonical "quick actions + full list" sheet. | C |
| R15 | **Instagram**, sheet (iOS) | [screen](https://mobbin.com/screens/5cb69cee-c11f-42fa-ac6b-fffcdee938e8) | Grabber, 3 square actions, then a grouped list. It's the pattern phone users know best. | C |
| R16 | **The Infatuation**, home sheet (iOS) | [screen](https://mobbin.com/screens/14d3a696-6be0-4419-a510-bed6b852baa5) | A sheet over a NYC map with a burger inside it, tabs "FOR YOU / NEW YORK", and a featured guide card. The editorial brand puts navigation **inside a bottom sheet**. | C |
| R17 | **Stake**, accordion categories (iOS) | [screen](https://mobbin.com/screens/680e0448-c4de-46fd-9401-3ec02151e4ca) | Section headings with **single-open accordion rows**, one expanded into an indented list. It shows accordion density at 360. | A |
| R18 | **Amazon**, side drawer (web) | [screen](https://mobbin.com/screens/7f893de6-ae13-47dd-aa53-bce9158ee0f8) | Bold section heads ("Trending", "Digital Content & Devices", "Shop by Department") with rows and › for drill-down, split by rules. It's a large catalogue kept scannable through section breaks and short visible lists. | B |

**What the references agree on, and where we are the outlier:**
- **The first level is short.** It has 4–8 entries (R1, R4, R5, R9, R10). None of them shows 40 links at once.
- **Rows are tall.** They're 44–56px everywhere (R2, R3, R8, R12, R17), against our 22px.
- **Commerce goes first or gets a card** (R3, R4, R7, R13). Service/about/help goes last and is quieter (R5, R10, R12).
- **Account and language sit at the top bar or in a quiet footer** (R2, R5, R7). None of them puts two full-width pills at the bottom of a long scroll.
- **The brand shows in type, not decoration.** R1 and R8 get character from caps display type in tall rows. That fits Courier Prime caps plus the yellow dot better than cards or icons.

---

## 3. Three directions

All three keep:
- the **closed state untouched**: capsule, logo and burger stay the same, so the landing "idle/scrolled" baselines at 360 and 768 remain diff 0
- **desktop untouched**: ≥1024 baselines stay diff 0
- the **content of `nav-config.ts`**: same items and routes. What changes is visibility, order and row design on mobile.
- the static 6px yellow "you are here" dot plus `aria-current="page"` (DDR-0003)
- the item-tap-closes behavior (AC 3).

### Direction A — "Índice" (accordion index, Services first)

**Thesis:** the panel stays where it is, but it opens as a **table of contents** instead of the whole book. What sells comes first, everything else is one tap away, and account and language are always in reach.

**Structure (first level, nothing expanded, 360 × 780):**
```
[capsule unchanged: logo ... X]
[panel: same box: 16px inset, top 80px, radius 24px, white, shadow-drawer]
  ┌ scroll area ───────────────────────────────────────────┐
  │ SERVICES                                  <- eyebrow   │
  │ ┌ Curated by Belén ......................... from €25 ┐ │  <- 3 service rows, 1px hairline
  │ │ Itineraries she walked and wrote. Download and go.  │ │     border, radius 12px, p 12px
  │ └─────────────────────────────────────────────────────┘ │     (the desktop price-card style,
  │ ┌ Custom itinerary with Belén  [MOST POPULAR] ... €149 ┐ │      compacted)
  │ │ A call, your dates and pace, a plan built just…     │ │
  │ └─────────────────────────────────────────────────────┘ │
  │ ┌ Walk with Belén ................................ €290 ┐ │
  │ │ Half a day on foot with her, in the neighbourhood…  │ │
  │ └─────────────────────────────────────────────────────┘ │
  │ ─────────────────────────────────────────────────────── │
  │ ITINERARIES                                        ⌄    │  <- 56px accordion header,
  │ By length · By season · By appetite                     │     card-title 19px + optional
  │ ─────────────────────────────────────────────────────── │     scent line (eyebrow style),
  │ GUIDES                                             ⌄    │     built from the column headings
  │ Getting around · Neighbourhoods · Before you fly        │     (verbatim, no new copy)
  │ ─────────────────────────────────────────────────────── │
  │ BLOG                                               ⌄    │
  │ Latest · Readers                                        │
  │ ─────────────────────────────────────────────────────── │
  │ SOBRE MÍ                                           ⌄    │
  │ Vamos a New York · Ayuda                                │
  └─────────────────────────────────────────────────────────┘
  ┌ sticky footer (inside the panel, hairline top) ─────────┐
  │ (globe) [ ES | PT | EN ]  <- 44px segmented control     │
  │ [ LOG IN ]  [ SIGN UP ]   <- two 48px pills, side by side│
  └─────────────────────────────────────────────────────────┘
```
Height budget at 360 × 780 (684px panel): 16 top + 28 eyebrow + 3 × ~68 service rows + 16 + 4 × 64 headers + ~136 sticky footer ≈ **660px, so the whole first level fits with no scroll.** On shorter phones (360 × 640) the list scrolls and the footer stays pinned.

**Expanded group (single-open: opening one closes the other):**
```
  ITINERARIES                                        ⌃
    BY LENGTH
    3 Days — First Timer                              <- 44px rows, body-sm semibold ink
    5 Days — The Classic                [BEST SELLER] <- tag pill, same as desktop
    7 Days — Deep Cut
    Weekend Escape
    BY SEASON
    Christmas in New York               [NEW]
    ...
```
- **Order:** Services (pinned, always open), Itineraries, Guides, Blog, Sobre mí. **The reorder is mobile-only** (§ 4).
- **Default state:** everything collapsed. **If the current route belongs to a group, that group opens by default** and its item shows the dot. Today that only happens for the 5 Sobre mí pages.
- **Collapsed "you are here":** a collapsed group that contains the current page shows the 6px yellow dot next to its title, so orientation doesn't need a tap.
- **Blurbs:** shown **only on the 3 Services rows** (clamped to 2 lines at 360), because they're what a buyer reads. Items in Itineraries, Guides, Blog and Sobre mí are **title-only**, as today. Room for blurbs isn't worth doubling the list length.
- **Tags:** shown everywhere they exist ("Best seller", "New", "Most popular"), as the desktop's yellow `caption` pill. They're cheap and they help choice.
- **Prices:** on the Services rows, right-aligned, `caption` semibold ink (as today) or `label-button` (**decision for the mockup**; see open question Q5).
- **Language:** moves to the sticky footer as a **segmented control ES | PT | EN** (constitution order; **ordering is a decision**, Q2), each segment ≥44px, selected = ink fill + white text (today's selected chip style).
- **Auth:** two pills side by side in the sticky footer, **Log in** (secondary, `bg-ink/5`) and **Sign up**. It's the same button style as today, half the vertical cost, and always visible. **Whether they should exist at all while they lead nowhere is Q3.**
- **Motion** (intent; the mechanism is the Architect's call):
  - Panel open: fade in, plus 8px of rise from under the capsule, `--duration-base` (180ms) `--ease-default`. Close: fade, `--duration-fast` (120ms). The veil fades with it.
  - Burger to X: the icon crossfades (or the lines morph), 180ms.
  - Accordion: the chevron rotates 180° in 200ms (same as the desktop triggers). The group body reveals (height) in ≤300ms, and the rows fade in with a stagger of ≤40ms. **Height animation is only allowed for the FAQ (ADR-0007 § 5, "closed scope")**, so this needs either an ADR amendment or a transform/Flip mechanism. That's the Architect's call.
  - The yellow dot does **not** travel on mobile (DDR-0003 keeps the drawer static). One small touch that could be allowed: when a group opens and contains the current page, the dot "arrives" once with `EASE.arrive`, 0.4s. It's optional and would need the DDR.
  - **Reduced motion / no `.gsap`:** everything is instant (panel, accordion, chevron). This is the ADR-0002 gate.
- **Accessibility:**
  - The burger gets `aria-controls` and `aria-expanded`, and its label changes between open and close states (copy in § 5).
  - The panel behaves as a **modal disclosure**. On open, focus moves to the first focusable element; Tab and Shift-Tab are trapped inside the panel; the page behind is `inert`. **Esc closes** the drawer and returns focus to the burger, and so does the veil tap or X.
  - Accordion headers are `<button aria-expanded aria-controls>`, wrapped in `<h2>` (or they're list items with headings) so a screen reader can jump by heading. Column eyebrows become `<h3>`, or `aria-labelledby` on each `<ul>`.
  - **Every row is ≥44px on its visible box**, not just the hit area, as are the segmented control and the auth buttons. This closes QA-0004 and RV-0006 properly.
  - `aria-current="page"` stays. The dot stays `aria-hidden`.
  - No JS: the accordion headers should work as native `<details>/<summary>` (as the FAQ does) once the drawer can open without JS. That second part is a separate, pre-existing gap (§ 1.3 #15).
- **Inspired by:** R3 Blue Bottle (accordion inside a brand menu, products on top), R4 On (commerce block above the list), R17 Stake (single-open density), R8 SKIMS / R1 The Infatuation (caps rows, 56px, rules), R2 Bloomberg (row rhythm), R12 Booking (quiet grouped footer).
- **Pros:**
  - It's the smallest departure from the frozen visual language: same panel, same position, radius, shadow, veil and type styles. Only rhythm and order change.
  - Scroll depth drops from ~3.2 screens to **0 at the first level**, and at most one expanded group (≤ ~560px for Itineraries/Guides).
  - Services goes from the third screen to the **first thing you see**, with blurbs, the tag and prices.
  - Language and auth are always in reach, and targets are really 44px.
  - It's the pattern phone users know best. No context is lost, and siblings are still visible.
  - There's one surface, one state (which group is open) and little JS.
- **Cons:**
  - Opening Itineraries or Guides still produces a long list (15 rows). Accordions push the later groups off screen, which is mitigated by single-open.
  - The Services block always takes ~220px, even for someone who came for Sobre mí.
  - The 32 placeholder links are still there, just hidden one tap deeper (Q1).
  - Height animation needs an ADR decision.
- **Risk vs the freeze:** medium. The drawer-open baselines (360, 768) change completely. Closed state and desktop stay at diff 0. It needs **DDR-0006** (§ 6).

### Direction B — "Líneas" (two-level push panel, subway lines)

**Thesis:** the first level is a **subway line map**: 5 big stations, nothing else. Tapping a station pushes a clean full panel with everything in that group, with room for blurbs.

**Structure, level 1:**
```
[panel, same box]
  ITINERARIES                                   →   <- headline style, Courier Prime
  By length · By season · By appetite                  ~24px caps, 72px rows, hairline
  ────────────────────────────────────────────────     rules (R1, R9)
  GUIDES                                        →
  Getting around · Neighbourhoods · Before you fly
  ────────────────────────────────────────────────
  BLOG                                          →
  Latest · Readers
  ────────────────────────────────────────────────
  SERVICES                          from €25    →   <- the lowest price from config, verbatim
  Ready-made · One to one · In person
  ────────────────────────────────────────────────
  SOBRE MÍ                               ●      →   <- yellow dot = you are in this line
  Vamos a New York · Ayuda
  [sticky footer: ES | PT | EN · LOG IN · SIGN UP]
```
**Level 2 (for example Itineraries), pushed in from the right:**
```
  ← ITINERARIES                                      <- 44px back button, label = group label
  BY LENGTH
  3 Days — First Timer                               <- 56px rows: title (body-sm semibold)
  The greatest hits, walkable.                          + blurb (caption, ink-subtle)
  5 Days — The Classic                [BEST SELLER]
  Icons plus real neighbourhoods.
  ...
```
Services at level 2 renders the **3 desktop price cards** (title, tag, blurb, price in `headline`, "See details"), which are verbatim desktop content.

- **Order:** keep today's order (Itineraries, Guides, Blog, Services, Sobre mí), or apply A's mobile-only Services-first reorder. With only 5 rows visible at once, order matters less, which is B's advantage.
- **Blurbs, tags and prices:** all shown at level 2, because each group gets a whole panel. Level 1 shows only the column headings as the scent line and the Services "from €25".
- **Language and auth:** the same sticky footer as A, visible on both levels.
- **Motion:**
  - Level 1 → 2: the level-1 list slides out 24% left and fades, and level 2 slides in from the right. 300ms (`--duration-slow`), `--ease-default`. Back reverses it.
  - A subway flourish (optional): the yellow dot on the tapped station "departs" with `EASE.arrive` as the panel pushes. It's the train leaving the platform. Keep it ≤0.5s, and it's the one expressive moment.
  - Panel open/close as in A.
  - **Reduced motion:** instant swap, no slide, no dot travel.
- **Accessibility:**
  - Level-1 rows are buttons (`aria-expanded` isn't the right model; use a button that moves focus). On push, focus goes to the level-2 heading or back button. On back, focus returns to the station row that was tapped. Level 1 is `inert`/hidden while level 2 shows.
  - Esc on level 2 goes back one level, and Esc on level 1 closes (this needs to be announced; it's a common pattern). The focus trap, `inert` page and 44px rule are the same as A.
  - A live region or heading change so screen-reader users know the view changed.
  - No JS: level 2 can't exist without JS. The fallback would be a stacked list (today's drawer) or level-1 rows linking to group index pages, **which don't exist**.
- **If the drawer opens on a page inside a group:** open on level 1 with the dot on that station (predictable). Opening straight into level 2 is also possible but disorients; don't do it.
- **Inspired by:** R1 The Infatuation (first level of 5 caps rows plus drill-down, NYC editorial), R6 H&M web (back-arrow push panel), R7 Hims (drill-down mixing products and reads), R9 Panera and R10 Open (short, loud first level), R18 Amazon (section breaks plus ›).
- **Pros:**
  - It's the most **editorial and on-brand**. Big Courier caps as "stations" is a direct extension of the subway language (the highlight train, DDR-0003's dot).
  - The first level is always 5 rows, whatever content grows to, so it scales best when the 32 placeholders become real pages with real blurbs.
  - There's room for blurbs and tags at level 2.
  - Level 1 never scrolls.
- **Cons:**
  - Each group becomes a separate place: **you lose sight of the other groups** and you need a back action.
  - It's 2 taps to any item, the same as A, but 3 to change groups (back, then station, then item) against A's 2.
  - Focus management across views is the most complex of the three. It's the most JS and the most e2e surface.
  - No-JS fallback is weak.
  - It's the biggest visual departure (headline-size rows, new panel choreography).
  - With 32 placeholder links, level 2 gives a lot of real estate to dead ends: it makes their emptiness *more* visible.
- **Risk vs the freeze:** medium-high. Same baselines as A, plus a new motion (the slide and dot), which needs to be in the DDR and in `lib/motion.ts`.

### Direction C — "Bolsillo" (bottom sheet: quick actions plus full menu)

**Thesis:** move the menu to where the thumb is. The burger opens a **sheet from the bottom**, with the few things a Visitor acts on as big tiles in the thumb zone, and the full index below.

**Structure:**
```
[capsule unchanged at top; burger still top-right]
[veil white 75%]
[sheet: 8px from left/right/bottom, radius 24px, max-height ~88dvh, grabber bar on top]
  ▬▬▬                                            ✕   <- 44px close, top-right of the sheet
  ┌──────────────┬──────────────┬──────────────┐
  │ Curated by   │ Custom itin. │ Walk with    │    <- 3 service tiles (horizontal row or
  │ Belén        │ with Belén   │ Belén        │       swipe), title + price, tag on #2
  │ from €25     │ €149 [MOST…] │ €290         │
  └──────────────┴──────────────┴──────────────┘
  [ Contacto ]  [ FAQ ]                              <- 2 quick chips (real pages)
  ──────────────────────────────────────────────
  ITINERARIES   ⌄      <- the same accordion as A, scrolls inside the sheet
  GUIDES        ⌄
  BLOG          ⌄
  SOBRE MÍ      ⌄
  ──────────────────────────────────────────────
  ES | PT | EN        LOG IN   SIGN UP              <- footer row, pinned
```
- **Order:** services tiles, then help chips, then the index, then the footer. It's the same mobile-only reorder as A, and the quick chips duplicate Contacto and FAQ from Sobre mí (a deliberate shortcut; flag it).
- **Blurbs:** none on the tiles (too narrow at 360 / 3). Titles, tags and prices only. The index behaves as in A.
- **Language and auth:** a single compact footer row. At 360 the 3-way control plus 2 buttons is tight: auth may need to become text links (**Q3**).
- **Motion:**
  - The sheet slides up from off-screen, 300ms `--ease-default`. Close slides down 180ms.
  - Drag-to-dismiss on the grabber is optional, and there must always be a button alternative (WCAG 2.5.7).
  - Reduced motion: fade only, no slide, no drag physics.
- **Accessibility:**
  - `role="dialog" aria-modal="true"` with a label. Focus goes to the sheet title or close button, with a trap, Esc and focus return to the burger.
  - The grabber is decorative (`aria-hidden`), so close is a real button.
  - The tiles are links ≥44px. The same 44px rule applies everywhere.
  - Watch **iOS Safari's dynamic toolbar** (`dvh`, safe-area inset at the bottom), and don't let the sheet's own scroll fight drag-to-dismiss.
- **Inspired by:** R13 Yami (quick-access sheet), R14 Opera and R15 Instagram (actions on top, list below), R16 The Infatuation (an editorial brand's nav in a sheet), R4 On (featured block above a list).
- **Pros:**
  - The best **one-hand reach**: services, chips, language and close are all in the lower two thirds.
  - Purchase is one tap from opening.
  - It feels native and modern.
- **Cons:**
  - The **spatial disconnect**: you tap top-right and the menu appears at the bottom, which breaks the "panel hangs from the capsule" relationship the brand has now.
  - Tiles at 360/3 ≈ 100px wide are cramped with Montserrat titles like "Custom itinerary with Belén".
  - It duplicates Contacto and FAQ.
  - Drag physics, `dvh` and safe-area handling mean the most engineering and the most device QA.
  - The design system's "minimal UI chrome, squared-off, not SaaS" (§ 1, § 19.4/6) pulls against an app-like sheet with tiles.
  - A persistent **bottom tab bar** was considered and rejected: it would change every page's closed state (a landing-wide freeze break, and it covers content and the footer) for a site with no logged-in app yet.
- **Risk vs the freeze:** high. The drawer baselines change, the open-state geometry is completely new, and there's new motion. The DDR would also need to supersede the "floating panel under the capsule" shape.

### Side by side

| | A · Índice | B · Líneas | C · Bolsillo |
|---|---|---|---|
| Rows visible at first level | 3 services + 4 groups | 5 stations | 3 tiles + 2 chips + 4 groups |
| Scroll at first level (360 × 780) | none | none | none |
| Taps to an itinerary item | 2 | 2 | 2 |
| Taps to a service | **1** | 2 | **1** |
| Taps to switch groups | 2 | 3 | 2 |
| Blurbs on mobile | Services only | all (level 2) | none on tiles |
| One-hand reach | good (sticky footer) | good (sticky footer) | best |
| Keeps the frozen panel shape | **yes** | yes | no |
| New motion | small | medium (push + dot) | medium (sheet) |
| JS / focus complexity | low | high | medium-high |
| No-JS story | good (`<details>`) | weak | medium |
| Scales when the 32 placeholders become real pages | OK | **best** | OK |

---

## 4. Recommendation

**Direction A, "Índice".** Keep B as the planned evolution once Itineraries, Guides and Blog have real pages.

**Why A:**
1. **It fixes what the user feels with the least change to what's frozen.** The panel, its position, radius, shadow, veil, type styles, the dot and the auth button style all stay. What changes is rhythm (22px rows become 44–64px rows), visibility (collapsed groups) and order (Services first). The DDR is narrow and easy to reason about.
2. **It puts the Visitor's purchase path first.** The constitution's Visitor is pre-customer, and Services is the only thing on the menu that turns them into one. Today it's on the third screen. In A it's the first thing you see, with the blurb, the "Most popular" tag and the prices that the phone currently hides.
3. **It removes the scroll wall.** The first level goes from ~2,200px to about one panel height, with language and auth pinned instead of 40 links away.
4. **It makes the 44px rule real** on the visible box, which closes QA-0004 and RV-0006 honestly and retires the hit-area-only clarification (spec line 624), which the code shows doesn't reach 44 on the drawer rows.
5. **It has the lowest engineering and a11y risk.** One disclosure pattern, which the site already ships (the FAQ), is enough, and it degrades to `<details>` without JS.
6. **B is better only once there's content behind the links.** With 32 of 40 items pointing at `/#services`, a full-panel level 2 would make the placeholders more visible, not less. Revisit B when the Itineraries, Guides and Blog pages exist. A's markup (group → columns → items) moves to B without an IA change.

**Borrowed into A from the others:** B's **scent line** under each group header (the column headings, verbatim) and B's **yellow dot on a collapsed group that contains the current page**. The sticky footer comes from the reach concern behind C.

**IA changes: mobile only for now.**
- **Reorder (mobile only):** Services, then Itineraries, Guides, Blog, Sobre mí. Desktop keeps Itineraries, Guides, Blog, Services, Sobre mí, because ADR-0006 freezes it and a horizontal bar doesn't carry priority the same way. Put the reorder in `nav-config.ts` as a mobile order (or an order field) and not as a second copy of the content, so the single source stays single. That's the Architect's mechanism.
- **Services is pinned, not an accordion,** on mobile.
- **No renaming** of groups, columns or items. Labels are the i18n decision's territory (DDR-0002 already accepted the bilingual bar), and the design system § 13 IA ("Sobre mí / Tu viaje / Reviews / Blog / Contacto") is a **both-breakpoints** decision to take with the i18n work, not now.
- **Not recommended:** dropping column eyebrows on mobile. Inside an expanded group they're the only structure for 12 items. Keep them, as `<h3>`.

---

## 5. Open questions for you (not decided here)

- **Q1 — The 32 placeholder links (the real root cause).** Every Itineraries, Guides and Blog item goes to `/#services`. Options:
  - (a) keep them, as today (DDR-0002 left the other groups "unchanged")
  - (b) hide them on mobile only until their pages exist, so the drawer becomes Services plus Sobre mí plus language and auth (tiny, honest, but the desktop and phone IA diverge)
  - (c) keep the group headers but make each point to the one real destination for now.

  This is a content/product decision, and it deserves its own DDR because it removes visible items from a frozen surface. My recommendation is (a) for this redesign, with Q1 decided separately. A works either way.
- **Q2 — The language control's order and default.** The constitution says es > pt > en, but the UI shows EN / ES / PT with EN selected, and the control changes nothing yet. Should the mobile redesign already order it ES | PT | EN, or stay as-is until i18n? Changing the order is visible, so it goes in the same DDR if yes.
- **Q3 — Log in / Sign up while they lead nowhere.** Keep both (as in A: side by side, pinned), keep only one, or hide them until the traveler dashboard exists? Removing them is a visible change and a product call.
- **Q4 — Tablet (768).** Same single-column panel as the phone (simplest), or cap the panel at ~420px and anchor it right under the burger? Recommendation: cap it, but that's a second decision in the same DDR.
- **Q5 — The price style in the Services rows.** Keep today's `caption` semibold (12px), or use `label-button` (Courier 14px caps) so prices read as the brand's voice? This is a mockup call.
- **Q6 — The optional motion flourish** (the dot "arrives" when the current group opens). Yes or no? If yes, it's the drawer's one expressive moment and goes in the DDR and `lib/motion.ts`.

**New visible copy that A needs (drafts; product language rule applies):**

| Where | Today | Draft | Status |
|---|---|---|---|
| Burger `aria-label` (closed) | "Toggle menu" | "Abrir menú" | `[TBD]`: depends on the i18n decision. The site's aria labels are English today ("Close menu", "Change language"). |
| Burger `aria-label` (open) | "Toggle menu" | "Cerrar menú" | `[TBD]`, same |
| Drawer landmark | "Menu" | "Menú" (RV-0015 suggested it) | `[TBD]`, same |
| Services eyebrow in the drawer | "Services" (group label) | unchanged | verbatim |
| Scent lines | — | column headings joined with " · " | verbatim, no new copy |

No other new copy. B would add nothing beyond the back button (which reuses the group label). C would add a sheet title `[TBD]`.

---

## 6. Governance: what's needed before this can be built

1. **DDR-0006 (new): "Mobile drawer becomes an accordion index with Services first".**
   - **Supersedes ADR-0006 § 1 / § 6 for the drawer's open state below 1024 only.** Closed state and ≥1024 stay frozen (diff 0).
   - **Amends DDR-0002:** its "drawer mirrors the same group, columns, items and routes" still holds for content, but the **order** on mobile changes, and "other groups unchanged" is kept for content and labels.
   - **Keeps DDR-0003's** static dot and `aria-current`, and extends the dot to collapsed group headers.
   - **Supersedes the sobre-mi spec's clarification (line 624)** for the drawer: real 44px rows. It closes QA-0004 and RV-0006 once implemented.
   - **Baselines regenerated, citing DDR-0006:** `drawer-top` and `drawer-last-group` at phone-360 and tablet-768 (likely renamed, for example `drawer-index` and `drawer-group-open`). All other navbar and landing baselines must stay diff 0.
   - Includes whatever you decide on Q2–Q6 (visible changes).
2. **ADR (Frontend Architect):** the accordion reveal mechanism. ADR-0007 limits `height` animation to the FAQ ("closed scope"), so either amend it to cover the drawer accordion or use Flip/transform. Plus the focus-trap/`inert` approach and the mobile ordering mechanism in `nav-config.ts`.
3. **Then `/specify`**, at `docs/specs/mobile-navigation/spec.md`. It needs:
   - the journey (Visitor on a 360 phone: burger, then find, then tap)
   - the states matrix: closed, open at the first level, one group open, current page inside a collapsed group, current page inside an open group, reduced motion, no JS, 768
   - the copy deck (§ 5), motion intent and reduced motion
   - a11y acceptance (focus trap, Esc, focus return, 44px, headings)
   - no data dependencies
   - AC 3, 5 and 9 of the Sobre mí spec carried over.
4. **Separate, not blocking A:** a Q1 DDR (placeholder links) and the i18n ADR (labels, language control).

---

## 7. Mockup kit: exact content and the current styling

### 7.1 Every nav label, verbatim from `nav-config.ts` and `features/sobre-mi/content/nav.ts`

Current order (desktop and today's drawer): **Itineraries, Guides, Blog, Services, Sobre mí**. `—` in titles is an em dash. `href` is noted where it exists; everything else falls back to `/#services`.

**ITINERARIES** (label "Itineraries")
| Column heading | Item title | Blurb | Tag |
|---|---|---|---|
| By length | 3 Days — First Timer | The greatest hits, walkable. | — |
| | 5 Days — The Classic | Icons plus real neighbourhoods. | Best seller |
| | 7 Days — Deep Cut | Five boroughs, no filler. | — |
| | Weekend Escape | 48 hours, zero wasted minutes. | — |
| By season | Christmas in New York | Markets, windows, ice rinks. | New |
| | Autumn in the Parks | Peak foliage, October light. | — |
| | Summer Rooftops | Long evenings above the grid. | — |
| | Winter on a Budget | Warm rooms, cheap tickets. | — |
| By appetite | Foodie New York | Delis, dumplings, slices. | — |
| | Art & Museums | The Met to Bushwick walls. | — |
| | Family New York | Tested with small legs. | — |
| | Film Locations | Stand where the scene happened. | — |

**GUIDES** (label "Guides")
| Column heading | Item title | Blurb |
|---|---|---|
| Getting around | The Subway, Explained | Read the map like a local. |
| | From the Airport | JFK, EWR and LGA compared. |
| | Walking the Grid | Why the numbers make sense. |
| | Yellow Cab vs App | When each one wins. |
| Neighbourhoods | Lower East Side | Tenements and late nights. |
| | Williamsburg | Brooklyn's front window. |
| | Harlem | Jazz, stoops and Sunday. |
| | Chinatown & Little Italy | Two blocks, two worlds. |
| Before you fly | ESTA & Entry | Paperwork without panic. |
| | Budget Calculator | What a day really costs. |
| | Packing for the Season | It is colder than you think. |
| | Broadway Tickets | Rush, lottery and TKTS. |

**BLOG** (label "Blog")
| Column heading | Item title | Blurb |
|---|---|---|
| Latest | Neighbourhood Diaries | One block at a time. |
| | Seasonal Guides | What's on, month by month. |
| | Food Crawls | Routes built around eating. |
| | Photo Spots | Where the light lands. |
| Readers | Reader Trips | Real itineraries, real notes. |
| | Ask Us Anything | Your questions, answered. |
| | Mistakes We Made | So you don't repeat them. |
| | Newsletter Archive | Every issue, free. |

**SERVICES** (label "Services"; all `href: "/#services"`)
| Column heading | Item title | Blurb | Price | Tag |
|---|---|---|---|---|
| Ready-made | Curated by Belén | Itineraries she walked and wrote. Download and go. | from €25 | — |
| One to one | Custom itinerary with Belén (non-breaking space between "with" and "Belén", DDR-0005) | A call, your dates and pace, a plan built just for you. | €149 | Most popular |
| In person | Walk with Belén | Half a day on foot with her, in the neighbourhood you pick. | €290 | — |

Desktop price cards also show the CTA **"See details"** (`label-button`), right of the price.

**SOBRE MÍ** (label "Sobre mí")
| Column heading | Item title | Blurb | href |
|---|---|---|---|
| Vamos a New York | Sobre mí | Quién soy y por qué New York. | `/sobre-mi` |
| | Colaboraciones | Cuadernos, agendas, cases y totes. | `/colaboraciones` |
| | Trabajá conmigo | Marcas, guías, empresas y agencias. | `/trabaja-conmigo` |
| Ayuda | Contacto | Te respondo yo. | `/contacto` |
| | FAQ | Antes de viajar. | `/preguntas-frecuentes` |

**Other drawer strings:** "Language" (with globe icon); language codes **EN**, **ES**, **PT** (desktop listbox also shows the names English, Español, Português); **Sign up** (`#signup`); **Log in** (`#login`). Aria: burger "Toggle menu"; veil "Close menu"; drawer landmark "Menu"; language group "Language"; logo link "Vamos a NY — home".

Scent lines for A/B (verbatim column headings): "By length · By season · By appetite" / "Getting around · Neighbourhoods · Before you fly" / "Latest · Readers" / "Ready-made · One to one · In person" / "Vamos a New York · Ayuda".

### 7.2 Current drawer styling (from `navbar.tsx` and `globals.css`)

**Header and capsule (closed and open, unchanged in every direction)**
| Part | Value |
|---|---|
| Header wrapper | `sticky top-4` (16px) `mt-4` (16px); side padding `px-4` = **16px** (`sm:` 24px); `z-50` |
| Capsule | height **56px** (`h-14`); `rounded-full`; padding left **20px** (`pl-5`; `sm:` 28px), right **8px** (`pr-2`; `sm:` 10px); background **white at 55%** (`bg-canvas/55`) + `backdrop-blur-xl` (**24px**) + `backdrop-saturate-150`; border **1px `ink` at 8%** (`rgba(8,10,11,.08)`); shadow `--shadow-nav` = `0 8px 30px rgb(0 0 0 / .06)`; after scrolling (`.is-scrolled`) `0 12px 40px rgb(0 0 0 / .1)`; max-width `--container-page` 1200px |
| Logo | `BrandLogo` **24px** tall (`h-6`), 73 × 24 box at 360; 44px hit area on coarse pointers (`tap-target`) |
| Burger | **40 × 40** circle (`size-10 rounded-full`), 44px invisible hit area on coarse pointers; icon **20 × 20** (`size-5`), viewBox 20; burger = three lines `M3 6h14 M3 10h14 M3 14h14`; X = `m5 5 10 10 M15 5 5 15`; stroke **1.6**, round caps, `currentColor` = ink; hover `bg-ink/5`; no animation between icons |

**Veil**
| Part | Value |
|---|---|
| Veil | full-screen `fixed inset-0`, **white at 75%** (`bg-canvas/75`), **no blur**, behind the panel (`-z-10` inside the header), a `<button aria-label="Close menu">` |

**Panel**
| Part | Value |
|---|---|
| Position | `fixed`, left/right **16px**, top **80px** (16 + 56 + 8), bottom **16px** → at 360 × 780: **328 × 684px** |
| Box | background **#FFFFFF**; radius **24px** (`rounded-3xl`); border **1px ink at 8%**; shadow `--shadow-drawer` = `0 18px 50px rgb(0 0 0 / .1)`; `overflow-y: auto` |
| Padding | left/right **20px** (`px-5`), top **16px** (`pt-4`), bottom **32px** (`pb-8`) |
| Group separators | `divide-y` **1px `hairline` #EEEEEA**; each group `py-5` (**20px** top and bottom) |
| Group title | `card-title`: Courier Prime **700, 19px** (1.1875rem), line-height 1.2, tracking 0.03em, **UPPERCASE**, colour **ink #080A0B** |
| Column block | `mt-4` (**16px**) above each column |
| Column heading | `eyebrow`: Courier Prime **700, 12px**, line-height 1.3, tracking **0.14em**, UPPERCASE, colour **#A8A8A4** (`ink-tertiary`) |
| Item list | `mt-2` (**8px**) after the eyebrow; `space-y-2` (**8px**) between items |
| Item | `body-sm`: Montserrat **400, 14px**, line-height 1.6 → **22.4px** tall row, colour **#484846** (`ink-subtle`); flex, `justify-between`, gap **12px**; coarse-pointer hit area ±4px → 30px |
| Price (Services) | `caption` **12px** Montserrat, **semibold 600**, line-height 1.5, colour **ink** |
| Current-page dot | **6px** circle (`size-1.5`), **#FFD800**, `aria-hidden`, right end of the row; `aria-current="page"` on the link |
| Language row | `mt-6` (**24px**), top border **1px hairline**, `pt-5` (**20px**); left: globe icon **16px** + "Language" `body-sm` **semibold** ink, gap 8px; right: chips gap **6px** (`gap-1.5`) |
| Language chip | `label-button` (Courier Prime **700, 14px**, lh 1.2, tracking **0.06em**, caps); `rounded-full`; padding **12px × 6px** (`px-3 py-1.5`); border **2px**; ≈ **33px** tall. Selected: border ink, **fill ink #080A0B, text white**. Unselected: border **#EEEEEA**, text ink |
| Auth block | `mt-5` (**20px**), column, gap **12px**; each button `label-button`, **min-height 48px**, `rounded-full`, padding x **24px**, background **ink at 5%** (`rgba(8,10,11,.05)`), hover ink at 10%, text ink, centred. Order: **Sign up**, then **Log in** |
| Tags (desktop only today; for A/B mockups) | `caption` **12px semibold**, background **#FFD800**, text ink, `rounded-full`, padding **8px × 2px** (`px-2 py-0.5`), `nowrap` |
| Desktop price card (for the Services rows in A/B) | `rounded-xl` (Tailwind default **12px** — the project's `--radius-xl` token is also 12px), padding **12px**, **1px `hairline`** border (hover: ink); title `body-sm` semibold ink; blurb `body-sm` ink-subtle, 2px top margin; price row 12px top margin: price in `headline` (Courier Prime 700, **22–26px** clamp, caps) + "See details" `label-button` |
| Motion today | none on the drawer (conditional render); capsule shadow transitions over `--duration-slow` 300ms; desktop chevrons rotate over 200ms |
| Body | `overflow: hidden` while open |

### 7.3 Tokens (from `app/globals.css`)

| Token | Value |
|---|---|
| `--color-brand` | **#FFD800** (taxi yellow; punctuation only) |
| `--color-brand-hover` / `--color-brand-focus` | #F1CC00 |
| `--color-ink` / `--color-on-brand` / `--color-inverse-canvas` | **#080A0B** |
| `--color-ink-muted` / `--color-ink-subtle` | #484846 |
| `--color-ink-tertiary` / `--color-hairline-strong` | #A8A8A4 |
| `--color-canvas` / `--color-inverse-ink` | #FFFFFF |
| `--color-surface-1` / `--color-surface-4` | #F7F7F5 |
| `--color-surface-2` / `--color-surface-3` / `--color-hairline` | #EEEEEA |
| `--font-sans` | Montserrat → Arial, Helvetica, sans-serif (DDR-0005) |
| `--font-display` | Courier Prime → "Roboto Slab", Rockwell, serif |
| `--font-mono` | Courier Prime → ui-monospace |
| Radii | `--radius-xs` 2px · `sm` 4px · `md` 4px · `lg` 8px · `xl` 12px · `xxl` 16px (drawer uses Tailwind's `rounded-3xl` = 24px, capsule and pills `rounded-full`) |
| Shadows | `--shadow-nav` 0 8px 30px rgb(0 0 0/.06) · `--shadow-menu` 0 18px 50px rgb(0 0 0/.08) · `--shadow-drawer` 0 18px 50px rgb(0 0 0/.1) · `--shadow-card` 0 4px 16px rgb(0 0 0/.08) |
| Durations | `--duration-fast` 120ms · `--duration-base` 180ms · `--duration-slow` 300ms |
| Ease | `--ease-default` cubic-bezier(0.2, 0.8, 0.2, 1) (= `EASE.ds`) |
| Brand ease | `EASE.arrive` (subway pulling in, ~2% overshoot): `M0,0 C0.06,0.42 0.14,0.82 0.4,0.965 0.55,1.02 0.66,1.022 0.76,1.006 0.86,0.995 0.93,1 1,1` |
| Desktop marker (DDR-0003, reference only) | highlight 0.55s, dot 0.75s, `arrive`; dot **10px** yellow with a **2px ink ring** |
| Type utilities | `card-title` 19px · `headline` clamp(22px, 1.7vw, 26px) · `label-button` 14px · `eyebrow` 12px · `body-base` 16px · `body-sm` 14px · `caption` 12px (see § 7.2 for weights and tracking) |
| Touch | `tap-target` utility: an invisible hit area ≥44 × 44px on `(pointer: coarse)` only; spacing unit `--spacing` × 11 = 44px |

### 7.4 Proposed values for Direction A mockups (proposal only; these go in the DDR, not the code)

| Element | Proposal | Uses existing tokens? |
|---|---|---|
| Panel box, veil, capsule | unchanged | yes |
| Services eyebrow | `eyebrow`, 16px top, 12px below | yes |
| Service row | desktop price-card style: 12px radius, 1px hairline, padding 12px, gap 8px between cards; title `body-sm` semibold ink + tag pill; price right-aligned (`caption` semibold, or `label-button`, Q5); blurb `caption` ink-subtle, 2 lines max | yes |
| Accordion header | min-height **56px** (64px with a scent line); `card-title` ink; chevron 12px (desktop's `m3 4.5 3 3 3-3` path, stroke 1.5) right, rotates 180° when open; scent line `eyebrow` (#A8A8A4); dividers 1px hairline | yes |
| Collapsed-group current dot | 6px #FFD800 right after the group title | yes (DDR-0003 dot) |
| Expanded item row | min-height **44px**, `body-sm` **semibold ink** (up from ink-subtle regular: bigger rows need stronger labels; mockup call), tag pill after the title; eyebrows as today with 12px top / 4px bottom | yes |
| Sticky footer | white, 1px hairline top, padding 12px 20px 16px; row 1: globe 16px + segmented control (3 × ≥44px, `label-button`, radius full, selected ink/white, unselected 2px hairline border); row 2: two 48px pills side by side, gap 12px, **Log in** (ink 5%) left and **Sign up** right; whether Sign up gets the ink fill is a mockup call. Don't use yellow here: design system § 19.2 says yellow is punctuation. | yes |
| Motion | panel fade + 8px rise, 180ms `ease-default`; close 120ms; chevron 200ms; group reveal ≤300ms, row stagger ≤40ms; reduced motion instant | yes (durations); the group reveal mechanism needs an ADR |

No new tokens are required for A. B's level-2 push would reuse `--duration-slow`. C would need a sheet radius and a safe-area inset, and it would add no new colour.
