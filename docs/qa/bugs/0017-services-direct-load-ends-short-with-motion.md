# Bug 0017: Direct load of `/#services` with motion on does not land on the Servicios section

- **Severity:** MEDIUM
- **Found by:** Exploratory (confirms the engineer's known issue 1 in `docs/qa/guias-handoff.md`)
- **Status:** Open
- **Posture:** Production
- **Environment:** chromium, 1280x800 and 360x780, motion on, `next start`, e2885e5

## Reproduction
1. Open `http://localhost:3100/#services` as a full page load (new tab, pasted link). Wait 3.5 s.
2. Read `#services` bounding rect.

Measured, 3 loads per viewport: 1280 -> section top at 1466, 2653, 2524 px (viewport 800, so off-screen every time); 360 -> top at 3254, 3488, 3144 px (viewport 780). 6/6 miss.

## Expected
Spec release criterion 5 and AC 18: the guide CTA reaches the Servicios section; Data Dependencies: "from a client navigation as well as a full load".

## Actual
Client navigation from a guide lands in view (covered by menu.spec, passes). Full load with motion on, and the same URL shared or opened in a new tab, ends well above the section (landing ScrollTrigger pin/layout shifts after the browser's hash scroll). Reduced motion and no-JS full loads land correctly (tests pass).

## Severity Justification
The CTA's own click path works, so the journey is not blocked; but the link `/#services` is the feature's conversion target and any full load of it misses. Pre-existing landing behavior, not caused by Guías. MEDIUM.

## Routed To
- **Owner role:** Frontend Architect
- **Reason:** structure: the landing's ScrollTrigger layout settles after the hash scroll; needs a decision on how the landing resolves initial hashes (ADR-0006 freezes visual/motion, so the fix must not change them).
