# DDR-0004: Motion on the Sobre mí pages beyond "one expressive moment per screen"

- **Status:** Accepted (2026-09-26)
- **Date:** 2026-09-26
- **Deciders:** Matheus Melo (sole approver). The user approved this direction in-session on 2026-09-26: everything in the approved mockup ships. Formally accepted by Matheus Melo on 2026-09-26.
- **Constitution / spec reference:** constitution v1 § Experience Principles, Motion stance: "expressive… New pages follow `design-conventions.md § Motion Principles` (one expressive moment per screen) unless a DDR says otherwise". `design-conventions.md § Motion Principles`. `docs/specs/sobre-mi/spec.md` § Motion Intent M1–M8.

## Context
The constitution keeps the landing's expressive motion frozen (ADR-0006) and requires new pages to follow the Motion Principles unless a DDR says otherwise. Those rules say: one orchestrated reveal per page, ≤ 800 ms, stagger ≤ 60 ms; no fade-and-slide-up on every section; scroll-driven motion only when the spec asks for it.

The approved mockup for the five Sobre mí pages goes beyond that on purpose, so the pages feel like the landing rather than a quieter second site:
- **Heading entrance (all pages):** label → words rise (stagger 80 ms) → train marker pulls in → dek. About 1.7–2.1 s depending on title length. It reuses `MOTION.heading`, except for the dek offset.
- **Scroll reveals on every section:** notes columns, paragraphs, closing rows, form fields.
- **One signature scene per page:** Sobre mí (pull-line marker, photo parallax, signature written in, a timeline rail filling as you scroll, and a 0 → 20 count-up); Colaboraciones (years ticking like a departure board, a reading bar inside the navbar capsule); Trabajá conmigo (audience rules drawing in); Contacto (contact channels slide in); FAQ (rows rise, animated open/close).
- **Form feedback:** error shake, failed banner, success marker.

Taken together this breaks four rules: more than one expressive moment, a reveal longer than 800 ms, staggers above 60 ms, and reveals on every section. Scroll-driven motion is fine once this spec asks for it.

## Decision
Accept all the motion in `docs/specs/sobre-mi/spec.md` § Motion Intent M1–M8 for these five pages, as specified there, with the landing's vocabulary (`EASE.ds`, `EASE.arrive`, `MOTION.heading`, `MOTION.reveal`, `MOTION.sweep`, `MOTION.count`, the train marker). New values go in `lib/motion.ts` as new entries (spec § Token Proposals). No existing value changes.

What stays binding:
- **Reduced motion and no JS:** everything static and visible in its final state. This is mandatory for every module (ADR-0002).
- **No loops.** Nothing blocks input. No layout shift. The accordion height animation runs only on user action.
- **Every animation has a stated job** in the spec. Anything added later without one is cut.
- **Content stays readable:** parallax only moves the photo inside a fixed box, never text. Counters and year ticks expose only final values to assistive tech. The H1's accessible name never changes.
- **The Colaboraciones reading bar** is drawn inside the navbar capsule, only on that page. It is decorative and not rendered under reduced motion. It is the one page-level touch to the frozen navbar; it adds an element and changes nothing that exists (see ADR-0006 and DDR-0003).

This is the exception mechanism the constitution provides ("unless a DDR says otherwise"), so no constitution amendment is needed. It applies to these five pages only. Future pages start from the Motion Principles again unless they reference this DDR or another one.

## User Impact
- **Visitor (gains):** the Sobre mí pages feel like the same product as the landing. Each page's motion says something specific: time passing (Sobre mí), a journey through the years (Colaboraciones), "find your door" (Trabajá conmigo), "here's my email first" (Contacto), "where the answer came from" (FAQ).
- **Visitor (costs):** the H1 needs about 1.4 s to fully settle and the marker about 2 s. More elements animate as they scroll into view, which some readers find busy.
- **Visitor with reduced motion:** the same pages, fully static, with nothing missing.

## Consequences
- **Positive:** consistent with the landing's expressive stance and brand; the signature moments are tied to the content, not generic fade-ups.
- **Negative:** a documented deviation from `design-conventions.md § Motion Principles` (as the landing already is, per ADR-0006). The pages load the landing's motion stack (ScrollTrigger, CustomEase, SplitText), so the Architect must check the bundle budget and LCP (the H1 is likely the LCP element and starts clipped). Performance cost of multiple ScrollTriggers per page. More motion states for QA (motion on, reduced, no JS) at three viewports.
- **Neutral:** the Architect decides the mechanism: extending the headless attribute controllers (ADR-0003) where values match, and page-scoped modules for the signature scenes.

## Alternatives Considered
- **Follow the Motion Principles literally** (only the heading entrance, ≤ 800 ms, no scroll reveals) → rejected by the user: the pages would feel like a different site from the landing.
- **Heading entrance + the one signature per page, no shared scroll reveals** → considered as the smaller deviation. Rejected by the user: the mockup ships whole.
- **Reuse only the landing's existing `data-reveal` attributes, with no new scenes** → rejected: it gives the generic fade-up on every section that the conventions warn against, without the per-page meaning.

## References
- `docs/specs/sobre-mi/spec.md` — § Motion Intent, § Token Proposals, acceptance criteria 15–17, 21–25, 29–30, 32, 35, 38, 42–43, 47
- `design-conventions.md` — § Motion Principles, § Anti-Patterns
- `docs/specs/constitution.md` — § Experience Principles (Motion stance)
- `lib/motion.ts` — `EASE`, `MOTION`
- ADR-0002, ADR-0003, ADR-0006
- DDR-0003 — navbar marker (the navbar's own motion)
- Approved mockup: Direction A "Cuaderno de campo", `entrance()`, `reveals()`, `SCENES` (`docs/design/mockups/sobre-mi-cuaderno.html`, 2026-09-26)
