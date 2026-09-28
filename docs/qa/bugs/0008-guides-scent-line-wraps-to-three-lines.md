# Bug 0008: At 360, the Guides scent line wraps to three lines, leaving "FLY" alone; the spec says scent lines may wrap to two

- **Severity:** LOW
- **Found by:** Visual (review of the new drawer frames)
- **Status:** Open
- **Posture:** Production
- **Environment:** Chromium `phone-360` (360 × 780) and 320 × 780, light, `48e6db1` local build. At 768 every scent line but Guides fits on one line, and Guides takes two.

## Reproduction
1. Open the drawer on `/` at 360 × 780.
2. Guides' scent line renders as "GETTING AROUND · / NEIGHBOURHOODS · BEFORE YOU / FLY" (three lines).
3. Itineraries ("… BY / APPETITE") and Services ("… IN / PERSON") take two lines, each with a single orphaned word.

Capture: `test-results-qa/visual/…-phone-360/drawer-top-actual.png` (local, not committed; it's the frame the CI bot will commit as `drawer-top-phone-360-linux.png`).

## Expected
Spec § Responsive Behavior › Layout values › Header row: "The scent line uses `eyebrow` in `ink-muted` and **may wrap to two lines**."

AC 7 and AC 8 still pass. The text is verbatim and S2 fits with no scroll at 360 × 780 and 390 × 844.

## Actual
The implementation uses exactly the mandated `eyebrow` token (12px, 0.14em tracking, uppercase Courier Prime). With that token, the Guides line can't fit in two lines at 360 (the text column is about 250px wide). The spec's own "Where This Spec and the Mockup Differ" row saw this coming: the mockup's one-line look needs a smaller `eyebrow-sm` token, and that is a DDR.

## Severity Justification
Cosmetic. It doesn't affect reading, the ACs or targets, and S2 still fits with no scroll. It does make the index taller and more ragged than the spec's "two lines" expectation. LOW.

## Routed To
- **Owner role:** UX Strategist
- **Reason:** spec/token decision, not an implementation error. Either amend the layout note to allow three lines at ≤360, or propose `eyebrow-sm` (or `text-wrap: balance` on the scent line) through a DDR. Then the Engineer applies it and the four drawer baselines are regenerated.
