# Bug 0007: At 200% text size, the "Custom itinerary with Belén" row pushes its "€149" price out of the panel, and the list scrolls sideways

- **Severity:** MEDIUM
- **Found by:** Exploratory (viewport and zoom)
- **Status:** Open
- **Posture:** Production
- **Environment:** Chromium headless, non-mobile context (the `tablet-768` project resized) at 360 × 780 and 390 × 844, `html { font-size: 200% }` (text-only zoom), light, reduced motion on, `48e6db1` local build.

## Reproduction
1. Open `/` at 360 × 780 with the root font size at 200%.
2. Tap "Abrir menú", then tap "Services".
3. Measure the row "Custom itinerary with Belén · Most popular · €149".

| Width | Text size | "€149" right edge | Row text limit (list right − 20px inset) | List horizontal overflow |
|---|---|---|---|---|
| 360 | 200% | **373** | 307 | **46px** |
| 390 | 200% | **373** | 337 | **16px** |
| 360 | 175% | 328 (panel edge) | 311 | 0 (into the inset) |
| 320 | 150% | 279 | 275 | 0 (into the inset) |
| 360 | 150% | fits | — | 0 |
| 768 | 200% | fits | — | 0 |

Every other row in every group fits at every size tested.

The Engineer's AC 51 check (320 at 100%) and the `phone-360` project don't catch this. With `isMobile`, Chromium widens the layout viewport to the page's own 537px overflow at 200% (a pre-existing landing issue, out of scope), so the panel gets wider too.

Probe: `docs/qa/test-passes/2026-09-27_mobile-nav_v1.qa-scripts.txt` (§ zoom); spec case "QA overflow › 360 × 780 at 200% text" (`tablet-768` project).

## Expected
- Spec § Accessibility Acceptance › Targets and contrast: "At **200% text zoom** and at 320 width, **nothing is clipped and there is no horizontal scroll inside the panel**."
- WCAG 2.2 AA 1.4.4 Resize Text and 1.4.10 Reflow.
- Spec § Content & Copy / AC 17: "with Belén" never breaks (DDR-0005). That rules out wrapping inside that phrase, not wrapping the row.

## Actual
The row is one non-wrapping flex line. Four things sit on it, and together they need about 406px at 2× text, while the row has 288px:
- the title, whose unbreakable NBSP pair "with Belén" sets its minimum width;
- the "Most popular" pill (`shrink-0 whitespace-nowrap`);
- the price wrapper (`ml-auto shrink-0`);
- the gaps between them.

The price overflows. The list is `overflow-y-auto`, so it also gains a horizontal scroll, and the price of the most popular service is cut off at the panel's right edge.

## Severity Justification
- **Impact:** an AA failure the spec calls out explicitly. It affects low-vision Visitors who use large system text, on the feature's highest-value row (the most popular paid service, with its price).
- **Likelihood:** limited to about 175% text and above on narrow phones.
- It isn't axe-detectable, and the content is still reachable by scrolling sideways.
- MEDIUM.

## Routed To
- **Owner role:** Frontend Engineer
- **Reason:** implementation deviates from the spec's 200% rule. Let the row wrap: `flex-wrap`, with the tag and price flowing to a second line when they don't fit, and the price kept right-aligned. Also add a 200%-text overflow case to `mobile-nav.spec.ts` on a non-mobile context. If the Engineer finds that wrapping changes the 100% layout, that's a DDR-0006 visual change: go to the UX Strategist first.
