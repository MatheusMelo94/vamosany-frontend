# Bug 0004: On phone, the navbar drawer items (22px), the burger (40px) and the logo link (24px) are below the spec's 44px touch target

- **Severity:** MEDIUM
- **Found by:** Exploratory (mobile tap-target probe)
- **Status:** Open
- **Posture:** Production
- **Environment:** Chromium `phone-360` and `tablet-768`, light, reduced motion off, `1ae0c4e` local build. The burger, logo and drawer item styles are the same on `main` (**pre-existing, frozen by ADR-0006**). The "Sobre mí" drawer group is new content in that frozen style.

## Reproduction
1. At 360, tap "Toggle menu" and measure the drawer links.
2. Every item in every group is **286 x 22** at 360 (694 x 22 at 768), including Sobre mí / Colaboraciones / Trabajá conmigo / Contacto / FAQ. Sign up and Log in are 48px tall.
3. The burger "Toggle menu" is **40 x 40**; the logo link "Vamos a NY — home" is **73 x 24**.

## Expected
Spec § Accessibility Acceptance, **Targets:** "**menu items**, FAQ summaries, **buttons**, contact links ≥44×44px on coarse pointers." At <1024 the drawer is how a phone Visitor reaches the five pages (Journey 1, AC 3).

## Actual
Items are 22px tall with `space-y-2` (8px) between them. WCAG 2.2 AA 2.5.8 is met through its spacing exception, but the spec's 44px bar is not.

## Severity Justification
This is the phone entry to the whole feature on a phone-first site, and small, closely stacked targets cause mis-taps. It isn't blocking (the targets work and AA is met). MEDIUM.

## Why UX first
The spec's Targets line and ADR-0006 (frozen landing design; visual change needs a DDR) conflict. Enlarging drawer rows or the burger changes pixels on `/` (the drawer-top and drawer-last-group baselines). Someone has to decide: either a DDR that enlarges the drawer rows and burger to 44px, or a spec amendment that scopes "menu items" to the desktop mega-menu until a navbar redesign. This pass doesn't choose between them.

## Routed To
- **Owner role:** UX Strategist (decide: DDR or spec amendment), then Frontend Engineer
- **Reason:** spec vs frozen-design conflict (spec-copy-states)
