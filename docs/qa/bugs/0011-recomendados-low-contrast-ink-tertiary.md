# Bug 0011: Mis recomendados: eyebrow, card kickers, "Mi código" and the affiliate disclosure are 2.2-2.4:1 (axe serious color-contrast)

- **Severity:** HIGH
- **Found by:** Accessibility
- **Status:** Open
- **Posture:** Production
- **Environment:** Chromium (Playwright) via `npx playwright test` on the three configured projects (phone-360, tablet-768, desktop-1280), light theme, `next start` build of `1ead046` (+ test commit `6362de5`).

## Reproduction
axe on `#recomendados` (any tab, motion on or off, 3 viewports): color-contrast serious on `.eyebrow` (2.38:1 on white, 2.22:1 on surface-1), `.caption.text-ink-tertiary` ("Mi código"), and the `text-ink-tertiary` disclosure paragraph. Token: `--color-ink-tertiary: #a8a8a4`. The existing `landing.spec.ts` allowlists `color-contrast` for the whole page (KNOWN_A11Y), so it can't catch this. Spec: `landing-estructura.spec.ts` "text meets 4.5:1" (fixme'd with this ID); the tabs axe test disables only that rule.

## Expected
design-conventions § Accessibility Baseline / WCAG 1.4.3: 4.5:1 for 12px text. At Production posture, axe serious = HIGH. The affiliate disclosure is a legal-style note and is the hardest to read. The token is shared with the frozen design (ADR-0006), so the fix is a DDR (darker tertiary token, or use ink-subtle for these elements), not a local tweak.

## Routed To
- **Owner role:** UX Strategist
- **Reason:** spec-token decision (DDR needed to change a frozen token or its use); Frontend Engineer applies it. Pre-existing for other sections using the token; new section adds instances.
