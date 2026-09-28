# DDR-0006: The phone menu becomes an index ("Índice"): five closed accordion groups and a pinned footer, below 1024px only

- **Status:** Accepted (2026-09-27)
- **Date:** 2026-09-27
- **Deciders:** Matheus Melo (sole approver). The user made this decision in-session on 2026-09-27: build Direction A "Índice" from `docs/design/mobile-menu-analysis-2026-09-27.md`, **mobile only (below 1024px)**, in the shape of the approved mockup `docs/design/mockups/mobile-menu-indice.html` (phone "A · Índice"). The user explicitly asked that Services **not** be pinned and **not** be open by default. Later the same day the user approved the open and close "unfold" motion from the updated mockup (§ Decision › Motion, items 13–17). The analysis's open questions Q1–Q6 were settled by the coordinator in the same session with the defaults listed under § Decision › Defaults. Each default is reversible by the user through a DDR that supersedes this one.
- **Constitution / spec reference:** constitution v1 § Users (Visitor, "majoritariamente no celular"), § Non-Goals 1 (a visual change to what is live needs a DDR), § Experience Principles (360 first-class, WCAG 2.2 AA floor, motion stance expressive, es > pt > en); ADR-0006 § 1, § 2 and § 6; DDR-0002; DDR-0003; `docs/specs/sobre-mi/spec.md` § Resolved Clarifications (QA-0004 / RV-0006 line) and AC 3, 9, 51; spec `docs/specs/mobile-navigation/spec.md` (implements this DDR).

## Context
Below 1024px the navbar opens a floating panel that is the desktop mega-menu poured into one column. It shows 5 groups, 14 column headings and 40 links all at once. That is about 3.2 panel heights of scrolling at 360 × 780, with language and account after all 40 links. Rows are 22px tall with a 30px hit area, so the spec's 44px target is not met (QA-0004 Open, RV-0006 unresolved). Esc does not close the panel, focus is neither moved in nor trapped, the page behind stays reachable by Tab, and group titles are `<p>`, so a screen reader hears 40 links with no structure. The full diagnosis, measured from the code, is in `docs/design/mobile-menu-analysis-2026-09-27.md` § 1.

ADR-0006 freezes the landing, including the navbar, the open drawer and their baselines (`drawer-top`, `drawer-last-group` at phone-360 and tablet-768). Any visible change to the open drawer needs a DDR. ADR-0006 § 6 lets a user decision to redesign part of the landing supersede the freeze for that scope. This DDR is that decision, and its scope is the drawer's open state below 1024px.

## Decision

### Scope
1. **In scope:** the open state of the phone and tablet menu (below 1024px): the panel's contents, its motion, its keyboard and screen-reader behavior, and the burger's accessible name and state.
2. **Unchanged, pixel for pixel:** everything at ≥1024 (capsule, mega-menu, DDR-0003 marker, language menu, Log in / Sign up), and the **closed navbar at every width** (capsule, logo, burger icon, sticky behavior). The burger's visible icons (three lines / X) and their instant swap stay as today. Only the burger's accessible name and ARIA state change, which move no pixels.

### Shape (the approved mockup, phone "A · Índice")
3. **Same panel box:** fixed under the capsule, 16px from left, right and bottom, top 80px, radius 24px, white, 1px ink-8% border, `--shadow-drawer`. The same white 75% veil sits behind it. The panel now has two regions: a scrolling list and a footer pinned to its bottom edge.
4. **Five groups as closed accordion rows, in desktop order:** Itineraries, Guides, Blog, Services, Sobre mí. The order is **not** changed on mobile, and nothing is renamed.
5. **Single-open.** Opening a group closes the one that was open. Tapping the open group's header closes it.
6. **Each header** shows the group label (card-title style), a **scent line** made of the group's column headings joined with " · " (verbatim from `nav-config.ts`; no new copy), and a chevron that points down when closed and up when open.
7. **Services is an ordinary group:** not pinned, not open by default. Opened, it shows its three items, each with its price right-aligned in Courier Prime bold ("from €25", "€149", "€290") and the "Most popular" tag. No blurbs on mobile, for Services or any other group.
8. **Default state on every open:** all groups closed, **except the group that contains the current page, which opens by default**. Today that only happens on the five Sobre mí routes. No group is remembered from a previous open.
9. **Expanded rows are real ≥44px rows** on their visible box, not only on their hit area. Text is body-sm semibold ink, with tags ("Best seller", "New", "Most popular") shown where the config has them, as the desktop's yellow pill. Column headings stay visible inside an open group as eyebrow-style headings.
10. **Pinned footer inside the panel:** a globe icon plus a **segmented control ES · PT · EN with ES selected**, and **Log in** (ink 5%) and **Sign up** (ink fill, white text) side by side, each 48px tall. The visible word "Language" goes away, and the control is named "Idioma" for assistive tech.

### "You are here" (DDR-0003 kept and extended)
11. DDR-0003's drawer rule stays: no moving marker below 1024. The current-page item keeps `aria-current="page"` and the **static 6px yellow dot**, unchanged from today.
12. **Extension:** a group header whose group contains the current page shows the same 6px dot right after its label, whether that group is open or closed (as in the mockup). The header dot **pops in once** as the last beat of the open unfold (item 13). It never travels, and it doesn't animate when a group is opened or closed by a tap. The row dot on the current item stays fully static.

### Motion (intent; the mechanism belongs to the Architect)
13. **Open: the "unfold"** (approved by the user on 2026-09-27 in the updated mockup; it replaces the first draft's fade and 8px rise). The veil fades in over 0.25s. The burger icon turns into the X by rotating in from −90° and scaling from 0.6 with a fade, 0.35s, `EASE.arrive`. The panel unfolds down out of the capsule: the clip goes from `inset(0 0 100% 0 round 24px)` to fully shown, while the panel moves from y −10px to 0, 0.55s, `EASE.arrive` (the subway brake, with about 2% overshoot). The group rows rise 14px and fade in, 0.35s, stagger 0.05s, from 0.15s. The pinned footer rises 24px and fades in, 0.4s, `EASE.arrive`, at 0.3s. The current-group header dot pops in (scale 0 → 1, `back.out`), 0.4s, at 0.45s. The sequence settles by about 0.85s.
14. **Close:** the panel rolls back up (the clip returns to the bottom and the panel moves to y −6px), 0.25s, ease-in. The veil fades over 0.2s. Then the panel unmounts and the icon swaps back to the burger instantly, so the closed state is today's pixels.
15. **Inside the panel:** the chevron rotates. A group's body reveals, and the headers below slide rather than jump. Rows fade in with a short stagger. Exact values are in the spec § Motion Intent. They go in `lib/motion.ts` as a new `drawer` entry, reusing `EASE.arrive` and adding one named ease for the pop. No existing value changes.
16. **Reduced motion, and no `.gsap` (ADR-0002):** every step above is instant.
17. **This is an expressive moment, and this DDR covers it.** Like DDR-0004 for the Sobre mí pages, it goes beyond `design-conventions.md § Motion Principles`. It is a second orchestrated moment on pages that already have one (the landing hero, the Sobre mí moments), its total of about 0.85s exceeds the 800ms reveal limit, and it animates `clip-path`. It is accepted because the constitution's motion stance is *expressive*, it reuses the brand's own `arrive` ease instead of adding a new motion language, and it runs only on a user's tap: never on load, never looping, and never blocking input (a tap mid-sequence acts at once).

### Accessibility
18. **Modal disclosure:** on open, focus moves into the panel. Tab and Shift+Tab cycle inside the panel and the burger. The rest of the page is inert. Esc, the veil and the X close the panel, and focus returns to the burger. The burger exposes `aria-expanded`, `aria-controls` and an open or close label.
19. Group headers are buttons inside headings. Column headings are headings one level down. `aria-current` stays. The dots are `aria-hidden`.
20. New text meets the constitution's floor. The scent lines and the drawer's column headings use `ink-muted`, not the mockup's `ink-tertiary`, because #A8A8A4 on white is about 2.4:1 and AA needs 4.5:1 at that size. This applies the floor. It is not a new taste decision. The desktop mega-menu's eyebrows are untouched, since they are frozen and out of scope.

### Accessible names (new copy, Spanish, consistent with the mockup)
21. Burger closed: **"Abrir menú"** (was "Toggle menu"). Burger open: **"Cerrar menú"**. Panel landmark: **"Menú"** (was "Menu"). Language control: **"Idioma"** (was "Language"). These are flagged for the i18n follow-up, because the rest of the navbar's labels are still English (DDR-0002).

### Defaults for the analysis's open questions (set by the coordinator on 2026-09-27; reversible by the user)
- **Q1, the 32 placeholder links:** kept as today. Every Itineraries, Guides and Blog item still falls back to `/#services`. This is a separate decision, to be taken later.
- **Q2, the language control:** ES · PT · EN with **ES selected** in the drawer, as in the approved mockup. The desktop language menu keeps showing **EN** (it is frozen). Neither control translates anything yet.
- **Q3, auth:** both Log in and Sign up are kept, as in the mockup. They still point to `#login` and `#signup`.
- **Q4, tablet:** at ≥640px (and below 1024) the panel is capped at **420px** wide, with its right edge aligned under the burger (the capsule's right edge). Top and bottom stay as on the phone.
- **Q5, price style:** Courier Prime bold, as in the mockup.
- **Q6, dot "arrive" animation when a group opens:** no. It isn't in the approved mockup. The later user-approved unfold (item 13) adds a one-time **pop** of the header dot during the panel's open sequence. That is not the Q6 travel or "arrive" flourish, and the dot still never moves.

### Deliberate deviation from `design-conventions.md § Anti-Patterns`
22. The scent lines are uppercase, tracked eyebrow text joined by middle dots, which is the "tracked-out ALL-CAPS eyebrow labels, middle-dot meta strings" pattern. It is accepted here because it is the brand's existing eyebrow voice (ADR-0006 § 1; § 5 still owes the "Direção tipográfica" DDR) and it is what the approved mockup shows. The scope is limited to these five scent lines.

## User Impact
- **Visitor on a phone (gains):** the menu opens as a short index of five groups that fits one screen at 360 × 780 with no scroll, instead of a wall of 40 links. Language and account are always in thumb reach. Every row is a real 44px target. Services shows its prices and "Most popular" tag, which phones never showed. On a Sobre mí page, the menu opens on that group with the page marked.
- **Visitor on a phone (costs):** every item is now one extra tap away (open the group, then tap the item), where today a scroll might reach it. Services is no more prominent than today: it is one closed group among five, by the user's choice.
- **Keyboard, switch and screen-reader users (gain):** Esc works, focus is managed and trapped, the page behind is inert, and the menu has headings to jump between.
- **Tablet (768):** a 420px panel under the burger instead of a 736px-wide single column.
- **Everyone opening the menu with motion on:** the menu now visibly unfolds out of the capsule in the brand's subway-brake rhythm, where today it pops in. Close is quicker (0.25s) than open (about 0.85s). Nothing waits for it: taps and focus work from the first frame. With reduced motion the menu simply appears, as today.
- **Desktop:** nothing changes.

## Consequences
- **Positive:**
  - It closes the phone half of QA-0004 and RV-0006 honestly, on visible rows.
  - It fixes the Esc and focus gaps, and it removes the scroll wall.
  - It keeps the panel shape, the veil, the type styles and the dot, so the DDR stays narrow.
  - Its group → column → item structure moves unchanged to Direction B ("Líneas") if the placeholder pages are ever built.
- **Negative:**
  - The 32 placeholder links are still there, one tap deeper (Q1 is open).
  - The navbar now mixes English visible labels with Spanish accessible names, and the drawer's language control says ES while the desktop one says EN. Both belong to the i18n work.
  - Height-affecting motion on the accordion is outside ADR-0007's closed scope. The Architect has to amend it (new ADR) or use another mechanism (see the spec).
  - The drawer gets more client JS (focus trap, inert, accordion state, the open and close timelines).
  - The navbar gets a second expressive element (after the DDR-0003 desktop marker), on every page, with a longer sequence (about 0.85s) than the 800ms guideline. It is mitigated by running only on tap and never blocking input, but QA should check on purpose that repeated open and close taps don't feel slow.
  - `clip-path` isn't a transform or opacity property. The Architect confirms whether `frontend-architecture-conventions.md § Animation` needs an ADR for it.
- **Neutral, and what this record supersedes:**
  - **ADR-0006** § 1 and § 6 are superseded **for the drawer's open state below 1024px only**. The Render-Preserving "diff = 0" check still applies everywhere else.
  - **DDR-0002 is amended:** "The mobile drawer mirrors the same group, columns, items and routes" still holds for content, labels, routes and **order** (the desktop order is kept). What changes on mobile is **visibility**: groups are collapsed until opened, blurbs stay hidden, and tags now show. "Other groups unchanged" still holds for content and labels.
  - **DDR-0003 is kept** (static dot plus `aria-current` in the drawer, no moving marker) and **extended** to group headers (item 12).
  - **`docs/specs/sobre-mi/spec.md` § Resolved Clarifications, the QA-0004 / RV-0006 line** ("44 px through invisible hit-area extensions only … no visual change"), is **superseded for the drawer**. Drawer rows now reach 44px on their visible box. The line still stands for the closed navbar's burger and logo, whose pixels stay frozen and which keep their invisible 44px hit areas. Sobre mí AC 3 and AC 9 carry over into the new spec. AC 51's "drawer states covered by DDR-0002 and DDR-0003" now also cites this DDR.
- **Baselines. Exactly these regenerate, citing DDR-0006, through the `update-snapshots` PR label:**
  - `tests/e2e/navbar.spec.ts-snapshots/drawer-top-phone-360-linux.png`
  - `tests/e2e/navbar.spec.ts-snapshots/drawer-last-group-phone-360-linux.png`
  - `tests/e2e/navbar.spec.ts-snapshots/drawer-top-tablet-768-linux.png`
  - `tests/e2e/navbar.spec.ts-snapshots/drawer-last-group-tablet-768-linux.png`

  They may be renamed or replaced by drawer-state screenshots **on the same two projects only** (phone-360, tablet-768), for example "first level" and "one group open". **Every other screenshot must stay diff 0**: all `navbar-closed*` (phone, tablet and desktop, including reduced motion), all `navbar-panel-*` and `language-menu` at desktop-1280, and every file under `tests/e2e/landing.spec.ts-snapshots/` and `tests/e2e/sobre-mi/`. A diff anywhere else is BLOCKING.
- **Test assertions to update (not baselines):** locators that use the name "Toggle menu" or the landmark "Menu" (`tests/e2e/navbar.spec.ts`, `tests/e2e/sobre-mi/tap-targets.spec.ts`). The drawer part of the "each drawer item owns its whole slot" hit-region test is replaced by a visible ≥44px row check. The AC 3 drawer test now has to open the group first on routes where it isn't open by default.

## Alternatives Considered
- **Keep today's drawer, and only extend hit areas** (the sobre-mi clarification) → rejected. The code shows the frozen 30px pitch can't give 44px exclusive targets, and it doesn't touch the scroll wall, Esc or focus.
- **Direction A as analysed: Services pinned first and always open, with blurbs, reordered on mobile** → rejected by the user. Services stays an ordinary closed group in the desktop order, and there are no blurbs.
- **Direction B "Líneas" (two-level push panel)** → not now. It needs the most JS and focus work, has a weak no-JS story, and gives a full panel to 32 placeholder links. Its markup remains the planned evolution once those pages exist.
- **Direction C "Bolsillo" (bottom sheet)** → rejected. It breaks the "panel hangs from the capsule" shape, and it brings the most device risk (dvh, safe areas, drag).
- **Hide the placeholder links on mobile (Q1 b/c)** → deferred to its own decision.
- **Keep EN · ES · PT with EN selected (Q2)** → not chosen. The mockup was approved with ES · PT · EN, which matches the constitution's es > pt > en.
- **Full-width panel at tablet (Q4)** → not chosen. A 420px panel under the burger avoids a 736px single column.
- **Panel height that hugs its content at tablet** → not chosen. Keeping top and bottom the same as on the phone keeps one box and one pinned footer at every width below 1024.
- **Price in Montserrat `caption`, as today (Q5)** → not chosen. The mockup used Courier.
- **The dot "arrives" when the current group opens (Q6)** → rejected. It isn't in the mockup. It is replaced by the one-time pop inside the open unfold.
- **A plain fade plus 8px rise for open and close** (this DDR's first draft, from the analysis) → superseded by the user on 2026-09-27 in favor of the unfold. The fade was functional but didn't say "it comes out of the capsule", and the site's motion stance is expressive.
- **The mockup's `ink-tertiary` scent lines and column headings** → not buildable under the WCAG 2.2 AA floor (about 2.4:1). Keeping them would need an accessibility exception, which this DDR does not grant.

## References
- `docs/design/mobile-menu-analysis-2026-09-27.md` (diagnosis, Mobbin references R1–R18, Directions A/B/C, Q1–Q6)
- `docs/design/mockups/mobile-menu-indice.html` (approved, updated 2026-09-27; phone "A · Índice": `aPanel()`, `aItems()`, `lang()`, `act()`, the `render()` `anim==='open'` unfold and the `act('toggle')` close timeline, CSS `.acc`, `.row44`, `.seg`, `.pair`, `.foot`)
- DDR-0004 (precedent for motion beyond one expressive moment); `lib/motion.ts` (`EASE.arrive`)
- `docs/specs/mobile-navigation/spec.md` (implements this DDR)
- `components/layout/navbar.tsx` (drawer, lines 373–482; burger, 344–370; desktop language state, 30 and 271), `components/layout/nav-config.ts`, `features/sobre-mi/content/nav.ts`
- ADR-0002 (`.gsap` gate), ADR-0006 (freeze), ADR-0007 (height animation only on the FAQ)
- DDR-0002, DDR-0003, DDR-0005 (non-breaking space in "with Belén")
- `docs/qa/bugs/0004-navbar-touch-targets-below-44.md`, `docs/reviews/2026-09-26_sobre-mi_v1.md` (RV-0006, RV-0015)
