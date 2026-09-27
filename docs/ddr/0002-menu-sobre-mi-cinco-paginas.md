# DDR-0002: The "About" menu becomes "Sobre mí", with five pages

- **Status:** Accepted (2026-09-26)
- **Date:** 2026-09-26
- **Deciders:** Matheus Melo (sole approver). The user approved this direction in-session on 2026-09-26, while reviewing the Direction A "Cuaderno de campo" mockup. Formally accepted by Matheus Melo on 2026-09-26.
- **Constitution / spec reference:** `docs/specs/sobre-mi/spec.md` § Menu IA; constitution v1 § Non-Goals 1 (a visual change to what is live needs a DDR); ADR-0006 § 1 and § 6 (the navbar and its open menu/drawer states are part of the frozen baseline).

## Context
The navbar's last group, "About", lists seven items (Our Story, How We Research, Press, Work With Us, Contact, Refunds, FAQ). None of them has a page: they are placeholders linking to `#services` (ADR-0006 X-4, "a mega menu with ~48 pages that don't exist"). Belén has now written the final content for this area (`tempcontentabout/ESTRUCTURA NUEVA WEB VAMOS A NY.md`). It defines five pages, not seven: there is no content for Press, Refunds or How We Research, and it adds Colaboraciones. The public is Spanish-speaking, and the content is written by Belén in the first person.

The navbar is on the landing, and ADR-0006 freezes it. Its baseline screenshots include "mega menu open (desktop)" and "drawer open (360)". Changing the group's label and items is a visual change to a frozen surface, so it needs a DDR.

## Decision
- The trigger label "About" becomes **"Sobre mí"**, in the same position (the last group, after Services).
- The group holds exactly **five items in two columns**:
  - **Vamos a New York:** Sobre mí ("Quién soy y por qué New York.") → `/sobre-mi`; Colaboraciones ("Cuadernos, agendas, cases y totes.") → `/colaboraciones`; Trabajá conmigo ("Marcas, guías, empresas y agencias.") → `/trabaja-conmigo`.
  - **Ayuda:** Contacto ("Te respondo yo.") → `/contacto`; FAQ ("Antes de viajar.") → `/preguntas-frecuentes`.
- The seven old items are removed. They are not kept anywhere in the navbar.
- The mobile drawer mirrors the same group, columns, items and routes.
- The item for the current page has `aria-current="page"`, both in the mega-menu and in the drawer.
- The other groups (Itineraries, Guides, Blog, Services) are unchanged, and so are their English labels.

## User Impact
- **Visitor (gains):** every item in this group now leads to a real page written by Belén, in Spanish. The group's name says whose site this is. "Te respondo yo." sets the expectation that a person answers.
- **Visitor (loses):** no Press, Refunds or How We Research entry. None of them existed as pages, so nothing that worked is lost. Refund information is not available anywhere until it is written.
- **What they see differently:** at ≥1024, a "Sobre mí" trigger opening a two-column panel with five items. Below 1024, the drawer shows the same five items. The navbar now mixes one Spanish label with four English ones until the i18n work lands.

## Consequences
- **Positive:** the most-visited dead links in the navbar are replaced by five real pages; the IA matches the content that exists; the group reads in the Visitor's language.
- **Negative:** the navbar is visibly bilingual until i18n is done. The footer still lists "Our story", "How we research", "Press"… and says "Made in Madrid", which now contradicts both the menu and Belén's story. The footer is also frozen, so fixing it needs its own DDR (listed as a follow-up in the spec). ADR-0006's baseline screenshots for "mega menu open" and "drawer open" must be regenerated, citing this DDR.
- **Neutral:** ADR-0006 § 6 is superseded only for the navbar's "About" group. Everything else in the navbar stays frozen, except the menu interaction covered by DDR-0003.

## Alternatives Considered
- **Keep the seven items and write the missing pages** → rejected: there is no content for Press, Refunds or How We Research, and the user decided the section has five pages.
- **One flat list of five items, no columns** → rejected: the user chose two columns. Separating "who I am / work with me" from "help" matches how the Visitor arrives: to get to know her, or to get an answer.
- **"Sobre mí" and "Contacto" as top-level links, as `docs/design/vamosany-design-system.md` § 13 recommends** → rejected for now: it changes the navbar's layout (more than the one group) and competes with the i18n work. It stays possible later. This DDR deliberately deviates from § 13 for Contacto.
- **Translate the whole navbar at the same time** → rejected: that is part of the i18n decision (Architect ADR), not of this feature.

## References
- `docs/specs/sobre-mi/spec.md` — § Screens & Surfaces, § Menu IA, acceptance criteria 1–3, 9, 51
- `components/layout/navbar.tsx:170-190` — the current "About" group
- ADR-0006 — freeze of the landing design and motion (X-4, § 1, § 6)
- DDR-0003 — the moving marker in every dropdown
- `docs/design/vamosany-design-system.md` § 13 — recommended navigation
- Approved mockup: Direction A "Cuaderno de campo" (`docs/design/mockups/sobre-mi-cuaderno.html`, 2026-09-26)
