# Bug 0003: The Contacto channel links (17px) and the Colaboraciones partner-line links (14px) are below the 44px touch target

- **Severity:** MEDIUM
- **Found by:** Exploratory (mobile tap-target probe)
- **Status:** Open
- **Posture:** Production
- **Environment:** Chromium `phone-360` (360x780, `isMobile`, `hasTouch`), light, reduced motion off, `1ae0c4e` local build

## Reproduction
Measure `getBoundingClientRect()` of the links at 360:

| Page | Link | Size (w x h) |
|---|---|---|
| `/contacto` notes | `hola@vamosany.com` (mailto) | 153 x 17 |
| `/contacto` notes | Instagram `@vamosany` | 99 x 17 |
| `/contacto` notes | TikTok `@vamosany` | 99 x 17 |
| `/colaboraciones` partner line | "Estudio Ulbia ↗" | 120 x 14 |
| `/colaboraciones` partner line | "Mona Cases · mayo 2023 ↗" | 192 x 14 |
| `/colaboraciones` partner line | "Efe Hus · Flor ↗" | 128 x 14 |

(The in-text partner links and the Colaboraciones closing-paragraph mailto are inline in running prose, which is exempt.)

## Expected
Spec § Accessibility Acceptance, **Targets:** "menu items, FAQ summaries, buttons, **contact links** ≥44×44px on coarse pointers." The Contacto channel list is the spec's "contact links", and M6 exists so that a Visitor who doesn't want the form reaches the email first. The partner-line links aren't named in that list; they're included here because they are standalone (not inline) links on the same pages.

## Actual
Hit areas equal the text box. The channel rows are visually about 44px tall (padding and a hairline), but only the 17px text is tappable.

## Severity Justification
The spec's own acceptance line is not met for the page's primary non-form action on phone (the posture is phone-first). WCAG 2.2 AA 2.5.8 (24px minimum) is still met through its spacing exception, so this is not an AA failure. MEDIUM.

## Suggested direction
Let the link fill its row, e.g. `block`/`inline-flex` with `min-h-11` and the row's padding moved onto the link. Keep "hola@vamosany.com" on one line at ≥860 and the "break only after @" rule (AC 35; `responsive.spec.ts` covers it). There should be no visual change beyond the hit area. Check it against the mockup.

## Routed To
- **Owner role:** Frontend Engineer (Contacto channels: implementation against the spec). If UX decides the partner-line links should stay text-sized, that part moves to the UX Strategist.
- **Reason:** implementation
