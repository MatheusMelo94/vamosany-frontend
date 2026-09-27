# ADR-0009: `height` animation on the mobile drawer accordion (extends ADR-0007's scope to the drawer's group bodies)

- **Status:** Proposed
- **Date:** 2026-09-27
- **Deciders:** Matheus Melo (sole approver). Drafted by the Frontend Architect.

## Context

`frontend-architecture-conventions.md § Animation (GSAP 3)`: "never animate `width`/`height`/`top`/`left`/`margin`; use Flip for layout changes." ADR-0007 allowed `height` for the FAQ disclosure only, and closed its scope: "any other accordion or expand … returns to the convention (Flip or transform), unless a new ADR includes it."

DDR-0006 (Accepted) and `docs/specs/mobile-navigation/spec.md` § Motion Intent M11–M13 ask the phone drawer's accordion for this:
- when a group expands, its body reveals and **the headers below slide down, they don't jump** (M11, 300ms);
- when a group collapses, including the single-open auto-collapse, the headers below slide up (M12, 180ms). "When one group closes and another opens, the Architect may overlap them. The whole swap stays ≤500ms." (AC 44);
- a tap mid-animation retargets from the current position, and a double tap within 100ms ends collapsed with nothing running after 500ms (AC 44);
- after a group opens, its header stays inside the list area's visible rect, even when a longer group above it has just collapsed (AC 19);
- everything is instant under reduced motion and without the `.gsap` gate (AC 46).

The list is a scrolling region inside a `position: fixed` panel. The approved mockup (`docs/design/mockups/mobile-menu-indice.html`, `act('acc')` and `render('acc:…')`) animates `height`. The spec's Note 1 leaves the mechanism to the Architect: either this ADR, or a transform-based equivalent.

## Decision

Allow GSAP to animate `height` on **the drawer accordion's body wrapper only** (`[data-drawer-body]`, `overflow: hidden`, in `components/layout/drawer/drawer-motion.ts`), under ADR-0007's conditions, restated for this scope:

1. **User action only.** A body opened by default on open (S5, a Sobre mí route) renders already open, with no height tween. It is part of the open unfold's `opacity`/`y` reveal instead.
2. **`.gsap` gate (ADR-0002), checked at call time.** With no `.gsap` class (no JS, reduced motion, or the class removed), expand and collapse are instant, and the settled state appears on the next frame.
3. **No stuck state.** Tweens end with `clearProps: "height"`. The source of truth is React state (`expanded`, plus `shown` for a body that is collapsing). A new tap retargets the running tween from its current height (`overwrite: true`), with no queue.
4. **Values in `lib/motion.ts`** (`MOTION.drawer.accordion`).
5. **Closed scope.** Only `[data-drawer-body]` in `drawer-motion.ts`. The Reviewer treats `height` anywhere else (apart from ADR-0007's FAQ file) as a finding.

## Consequences

- **Positive:** the approved motion ships as designed. The overlapping single-open swap, retargeting and the "keep the header in view" rule come from normal layout, with no bookkeeping of sibling transforms. The reduced-motion path needs no code (the state simply changes).
- **Negative:** this is a second documented exception to § Animation. Layout runs every frame for ≤0.3s per tap. It is bounded because the panel is `position: fixed`, so the work stays inside it, and the lists are short (≤12 rows). The shift happens inside a fixed overlay after an input, so it doesn't count toward CLS; QA confirms on the preview.
- **Neutral:** ADR-0007 stays Accepted and unchanged. A future third accordion needs its own ADR, or a convention amendment if the pattern recurs (for example, native `interpolate-size` once Safari and Firefox support it; see ADR-0007).

## Alternatives Considered

- **GSAP Flip on the header list plus a `clip-path` reveal of the body** (convention-compliant): rejected. The collapsing body must stay in the DOM while every header below it is translated. In an overlapping swap, headers between the two groups get two competing offsets. The translated positions disagree with the scroll container's `scrollTop`, which AC 19 has to correct mid-animation, and retargeting on a double tap means re-capturing Flip state mid-flight. It also adds the Flip plugin (about 4–5 kB gzip) to the drawer chunk. It is about two more tasks, for the same pixels.
- **`clip-path` or `scaleY` on the body alone, with no height change:** rejected for the same reason ADR-0007 gave. The headers below would jump at the start or the end, and the spec forbids that (M11, "they don't jump").
- **CSS `interpolate-size: allow-keywords` with a height transition:** rejected for now. There's no Safari or Firefox support, and the spec's GSAP eases and retargeting would be lost.
- **No accordion motion (instant always):** rejected. Spec M11–M13 and DDR-0006 item 15 ask for it.

## References

- `docs/specs/mobile-navigation/spec.md`: § Motion Intent M10–M13 and Global rules; § Notes for the Architect 1; AC 19, 44, 46
- `docs/specs/mobile-navigation/plan.md` § 7.4 and § 13
- DDR-0006 items 15–16; ADR-0007 (FAQ height; closed scope); ADR-0002 (`.gsap` gate)
- `frontend-architecture-conventions.md` § Animation (GSAP 3); `design-conventions.md` § Motion Principles
- Approved mockup: `docs/design/mockups/mobile-menu-indice.html` (`act('acc')`, `render('acc:…')`)
