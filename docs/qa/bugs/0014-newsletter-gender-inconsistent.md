# Bug 0014: Copy: "la newsletter" in the CTA vs "al newsletter" in the footer

- **Severity:** LOW
- **Found by:** Exploratory
- **Status:** Open
- **Posture:** Production
- **Environment:** Chromium (Playwright) via `npx playwright test` on the three configured projects (phone-360, tablet-768, desktop-1280), light theme, `next start` build of `1ead046` (+ test commit `6362de5`).

## Reproduction
Compare the aria-labels: CTA form "Suscripción a la newsletter", footer form "Suscripción al newsletter". English scan otherwise clean: remaining English is proper names (The Met, Top of the Rock, The High Line) and the verbatim quote on /colaboraciones (guarded by verbatim.test.ts); `<html lang="es">` on every route including the 404.

## Expected
design-conventions § UX Writing: one term, one gender across the product.

## Routed To
- **Owner role:** UX Strategist
- **Reason:** copy decision; Engineer applies.
