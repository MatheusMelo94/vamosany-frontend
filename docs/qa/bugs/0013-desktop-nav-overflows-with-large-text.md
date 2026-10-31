# Bug 0013: Desktop navbar overflows the page horizontally with larger text: 1024 px at 150% and 1280 px at 200% root font size

- **Severity:** MEDIUM
- **Found by:** Exploratory
- **Status:** Open
- **Posture:** Production
- **Environment:** Chromium (Playwright) via `npx playwright test` on the three configured projects (phone-360, tablet-768, desktop-1280), light theme, `next start` build of `1ead046` (+ test commit `6362de5`).

## Reproduction
Set `html{font-size:150%}` at 1024 (or 200% at 1280) on `/`. The inline group bar (`div.hidden.lg:flex`) stays visible and the document scrolls sideways (+133 px at 1024/150%, +504 at 1024/200%, +248 at 1280/200%). 360 and 768 (drawer) are clean at 200%. Not verified on main; the bar has fewer groups now (4), so likely pre-existing and not worse.

## Expected
WCAG 1.4.4 / QA exploratory checklist (viewport & zoom, 200% text): no horizontal scroll; the header should fall back to the drawer when the bar does not fit.

## Routed To
- **Owner role:** Frontend Engineer
- **Reason:** implementation (breakpoint is fixed at lg; consider a fit-based switch). Architect only if the nav switch pattern changes.
