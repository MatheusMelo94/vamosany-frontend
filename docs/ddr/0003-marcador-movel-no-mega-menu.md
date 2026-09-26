# DDR-0003: A moving marker (yellow dot + grey highlight) in every navbar dropdown

- **Status:** Accepted (2026-09-26)
- **Date:** 2026-09-26
- **Deciders:** Matheus Melo (sole approver). The user approved this direction in-session on 2026-09-26 and asked for it to apply to **all** dropdowns, not only "Sobre mí". Formally accepted by Matheus Melo on 2026-09-26.
- **Constitution / spec reference:** `docs/specs/sobre-mi/spec.md` § Motion Intent M9, acceptance criteria 4–10; constitution v1 § Non-Goals 1 and § Experience Principles (Motion stance: expressive); ADR-0006 § 1 (visible interaction states and motion of the landing are frozen, including the open mega menu).

## Context
Today each mega-menu item gets its own grey background on hover (`hover:bg-surface-1`, a CSS transition). Nothing tells the Visitor which page they are on, and the menu has no motion of its own. The approved Sobre mí mockup introduced a marker that rides between items: a grey highlight that slides and resizes to the target item, and a yellow dot, the subway "you are here" stop, that travels with a small stretch, using the same `arrive` ease as the train markers. The user wants it in every dropdown so the navbar behaves the same everywhere.

The navbar is part of the landing, which is frozen by ADR-0006, including its hover states and the "mega menu open" screenshot. Changing that behavior needs a DDR.

## Decision
In the desktop mega-menu (≥1024), for **Itineraries, Guides, Blog, Services and Sobre mí**:
- One **grey highlight** (`surface-1`, 12px radius) and one **yellow dot** (10px, `brand`, 2px `ink` ring, at the item's top-right) per open panel. They replace the per-item hover background.
- They follow the **pointer or keyboard focus**. The highlight slides and resizes in 0.55s with `EASE.arrive`. The dot travels in 0.75s with `EASE.arrive` and stretches along the way (scaleX up to `min(2.6, 1 + distance/160)`, scaleY 0.8, `power1.inOut`).
- **On open:** if the current route is in the panel, the marker is placed on it with no travel. Otherwise it appears (fade, `--duration-fast`) on the first item hovered or focused.
- **Pointer leaves the items but stays in the panel:** the marker returns to the current-route item if there is one, and otherwise stays on the last item.
- Switching panels does not animate across panels. A new target mid-flight retargets from the current position (no queueing).
- Item titles underline on hover, as in design system § 13 nav links.
- **Reduced motion:** the marker jumps with no travel and no stretch. **No JS:** the old per-item hover background stays.
- **Drawer (<1024):** no moving marker. The current-route item shows a static 6px yellow dot (the same as the language menu's selected dot) and `aria-current="page"`.
- The dot never overlaps item text or tags ("Best seller", "New", "Most popular") or the Services price rows.
- The new values go in `lib/motion.ts` as a new entry. No existing value changes.
- The mechanism (GSAP, FLIP, CSS anchor positioning) is the Architect's choice.

## User Impact
- **Visitor on desktop (gains):** a clear "you are pointing here" signal that travels with the pointer, and a "you are here" signal on pages that are in the menu. The navbar now uses the same subway-train language as the headings.
- **Visitor on phone:** only the static current-page dot. Nothing moves.
- **Keyboard and screen-reader users:** the marker follows focus. `aria-current` gives assistive tech the "you are here" signal that the dot gives sighted users. The marker itself is `aria-hidden`.
- **Visitor with reduced motion:** the same information, with no travel.

## Consequences
- **Positive:** one consistent interaction in all five dropdowns; current-page orientation that didn't exist before; it reuses the brand's `arrive` ease instead of adding a new motion language.
- **Negative:** a second expressive element on every page (the navbar), beyond the one-moment rule in `design-conventions.md § Motion Principles` (see DDR-0004 for the pages). Hover-driven motion can feel busy when the pointer sweeps across many items quickly; retargeting without a queue mitigates it, and QA should check it on purpose. The Itineraries tags and Services price cards need right padding reserved for the dot. The navbar's client component gets a small amount of extra JS.
- **Neutral:** ADR-0006's "mega menu open" baseline screenshots (desktop) and "drawer open" (360) are regenerated, citing this DDR and DDR-0002. ADR-0006 is superseded only for this interaction.

## Alternatives Considered
- **Keep today's per-item CSS hover** → rejected: the user wants the effect, and CSS hover can't show "you are here".
- **Only in the Sobre mí dropdown** → rejected by the user: one navbar, one behavior.
- **Highlight follows the pointer, dot fixed on the current page** → considered, because it gives the two elements different jobs. Rejected to stay faithful to the approved mockup, where both move together. `aria-current` and the marker's resting position carry "you are here".
- **Moving marker in the drawer too** → rejected: the drawer is a vertical list for touch, where there is no hover to follow. A static dot is enough.

## References
- `docs/specs/sobre-mi/spec.md` — § Motion Intent M9, § Token Proposals 1, acceptance criteria 4–10, 51
- `components/layout/navbar.tsx:408-465` — the current mega-menu; `:356-361` — the language menu's selected dot
- `lib/motion.ts` — `EASE.arrive`
- ADR-0006 — freeze of the landing; ADR-0002 — `.gsap` gate for reduced motion and no-JS
- DDR-0002 — the Sobre mí menu IA; DDR-0004 — page motion
- Approved mockup: Direction A "Cuaderno de campo", `moveMarker()` (`docs/design/mockups/sobre-mi-cuaderno.html`, 2026-09-26)
