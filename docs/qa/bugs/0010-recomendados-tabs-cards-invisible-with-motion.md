# Bug 0010: Mis recomendados: the Broadway and Internet tabs render their cards at opacity 0 when motion is on

- **Severity:** HIGH
- **Found by:** E2E
- **Status:** Open
- **Posture:** Production
- **Environment:** Chromium (Playwright) via `npx playwright test` on the three configured projects (phone-360, tablet-768, desktop-1280), light theme, `next start` build of `1ead046` (+ test commit `6362de5`).

## Reproduction
Open `/` with motion on (default), scroll to `#recomendados`, click the Broadway tab (or Internet). The panel is empty: both `<li>` have computed opacity 0. Reduced motion is fine. Spec: `tests/e2e/landing-estructura.spec.ts` "every recommendations tab shows its cards" (fixme'd with this ID). Cause: `app/globals.css:295` hides `.gsap [data-reveal-group] > *`; GSAP (`scroll-effects.tsx` §revealGroup) reveals only the `<li>` present at mount; the new `<li>` that React mounts on a tab change never get an inline opacity, so the CSS hides them for good. The first tab works only because its `<li>` existed at mount.

## Expected
DDR-0008 §4: three tabs, each showing its cards. Two of the three tabs are blank for every visitor with motion on (the default). Journey blocked. Note `key` is the pick title, so the <li> is remounted per tab.

## Routed To
- **Owner role:** Frontend Engineer
- **Reason:** implementation (reveal group bound once at mount; tab content must be revealed on change, or the group must not use data-reveal-group). Possible Architect input on the motion pattern.
