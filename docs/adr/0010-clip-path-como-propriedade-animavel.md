# ADR-0010: `clip-path: inset()` is an animatable paint property (amends `§ Animation (GSAP 3)`)

- **Status:** Proposed
- **Date:** 2026-09-27
- **Deciders:** Matheus Melo (sole approver). Drafted by the Frontend Architect.

## Context

`frontend-architecture-conventions.md § Animation (GSAP 3)` says: "Animate `transform` and `opacity`; never animate `width`/`height`/`top`/`left`/`margin`: use Flip for layout changes (ADR-0008)." The positive half reads as an allow-list, and `clip-path` is on neither list.

`clip-path` doesn't trigger layout. It changes only what paints, and Chromium can composite `clip-path` animations. It therefore keeps the rule's intent (no layout thrash, no CLS) but not its letter. The project already animates it in two places **without a record**:
- the DDR-0003 desktop menu marker (`components/layout/nav-marker.tsx`, tweens `clip-path: inset(… round var(--radius-xl))`; `docs/specs/sobre-mi/plan.md` § 8.7 calls it "a spec-listed property");
- the Sobre mí signature write-on (`.gsap [data-sm-signature] { clip-path: inset(0 100% 0 0) }`, spec M3).

DDR-0006 (Accepted) makes it the drawer's signature motion: the panel "unfolds down out of the capsule" through `clip-path: inset(0 0 100% 0 round 24px)` → fully shown, and rolls back up on close (`docs/specs/mobile-navigation/spec.md` M3, M7). DDR-0006's Consequences and the spec's Note 8 ask the Architect whether this needs an ADR. It does: the convention is ambiguous, and a third, signature use shouldn't rest on an unrecorded reading.

## Decision

**Amend `§ Animation (GSAP 3)`** (the ADR-0008 pattern). This ADR doesn't edit the convention file. After acceptance, the amendment is applied in its own `docs:` commit citing this ADR.

Conditions that apply now, to the drawer and to the two existing uses:

1. **Shape: `inset()` only** (with an optional `round <radius>` that reads the element's radius token). No `polygon()`, `path()` or `url()`: those aren't in scope and paint more expensively.
2. **No stuck clip.** A reveal that ends fully shown uses `clearProps: "clipPath"`, so the settled element carries no clip (the drawer's M3).
3. **Motion gate (ADR-0002).** Without the gate, the settled state renders with no clip, and nothing is clipped under reduced motion or without JS.
4. **Not on an element that has, or contains, `backdrop-filter`.** The drawer panel is a sibling of the capsule, never its ancestor, so the capsule's blur isn't re-sampled every frame.
5. **Values in `lib/motion.ts`**; the radius comes from the token (`getComputedStyle`), as in `nav-marker.tsx`.

### Proposed amendment (to apply to `frontend-architecture-conventions.md § Animation (GSAP 3)` after acceptance)

```diff
  - Animate `transform` and `opacity`; never animate `width`/`height`/`top`/`left`/`margin` — use Flip for layout changes (ADR-0008).
+ - `clip-path: inset(…)` (optionally `round <radius token>`) is also allowed: it is paint-only, never layout. Use it for reveals and
+   highlights that change an element's visible extent (unfold, wipe, marker). End a full reveal with `clearProps: "clipPath"`;
+   never animate it on an element that has or contains `backdrop-filter`; other `clip-path` shapes need an ADR (ADR-0010).
```

## Consequences

- **Positive:** the approved unfold ships exactly as the user saw it. The two existing uses become compliant on record. Reviewers get one rule instead of a per-feature reading.
- **Negative:** a shared convention changes, and every role follows it. `clip-path` animation is paint-heavy on low-end devices when the clipped area is large. The drawer panel is about 328 × 684 px for 0.55s, which is acceptable; QA spot-checks INP and frame pacing at 360 on the preview. Safari doesn't composite it, so it paints on the main thread.
- **Neutral:** no pixel change anywhere. The DDR-0003 marker and the Sobre mí signature keep working as they are.

## Alternatives Considered

- **Transform-only unfold: `scaleY` on a wrapper with counter-scaled content:** rejected. It isn't pixel-equivalent to the approved mockup (the 24px radius and the 1px border squash during the scale, and counter-scaling every child each frame is fragile with wrapping text). Adopting it would need a DDR-0006 amendment by the UX Strategist.
- **A scoped exception for the drawer only:** rejected. The ambiguity is in the rule, not in the feature. It would leave the two existing uses unrecorded, and every future `clip-path` would need its own ADR (the reasoning of ADR-0008 option A).
- **Treat `clip-path` as already allowed, and record nothing:** rejected. The convention's wording is an allow-list, and the DDR and spec explicitly asked for a decision.

## References

- `docs/specs/mobile-navigation/spec.md`: § Motion Intent M3, M7; § Notes for the Architect 8; AC 41, 42
- `docs/specs/mobile-navigation/plan.md` § 7.2, § 7.3 and § 13
- DDR-0006 item 13, item 17 and Consequences; DDR-0003 (marker); ADR-0002; ADR-0006; ADR-0008 (amendment pattern)
- `components/layout/nav-marker.tsx`; `app/globals.css` (`.gsap [data-sm-signature]`); `docs/specs/sobre-mi/plan.md` § 8.7
- `frontend-architecture-conventions.md` § Animation (GSAP 3); `design-conventions.md` § Motion Principles
