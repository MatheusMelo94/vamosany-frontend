# Bug 0001: Desktop mega-menu closes when the pointer crosses the 7px gap between the capsule and the panel

- **Severity:** HIGH
- **Found by:** Exploratory (the Engineer flagged the question; QA confirmed it with a probe)
- **Status:** Open
- **Posture:** Production
- **Environment:** Chromium (Playwright `desktop-1280`, 1280x800), light theme, reduced motion off, local `next start` production build of `1ae0c4e` (port 3400). The same result on `main` @ `c3809d2` (port 3401), so it is **pre-existing**, not a regression.

## Reproduction
1. Open `/sobre-mi` (or `/`) at 1280.
2. Hover the "Sobre mí" trigger (or any trigger). The panel opens (`aria-expanded="true"`).
3. Move the pointer straight down toward the first item at an ordinary speed.
4. The panel closes as the pointer passes the strip between the capsule's bottom edge and the panel's top edge (measured gap: **7.0px**).

Measured with `page.mouse.move(..., { steps })`, 4 runs per speed, starting phase varied:

| Pointer travel per mousemove sample | Panel closed |
|---|---|
| 2, 4, 6 px | 4/4 |
| 8, 10 px | 2/4 |
| 12 px | 1/4 |
| 16 px | 2/4 |
| 24 px | 1/4 |

At 60 Hz, 6px per sample is 360 px/s, which is ordinary deliberate pointing speed. Probe: `test-passes/2026-09-26_sobre-mi_v1.qa-spec.ts.txt`, tests "8px gap: slow pointer travel…" and "gap threshold".

## Expected
Spec Journey step 1 ("desktop: hover or click") and AC 1/AC 4: a pointer user can open "Sobre mí" and move onto its items. The panel stays open while the pointer travels from its trigger to the panel.

## Actual
`components/layout/navbar.tsx` puts `onMouseLeave={() => setOpen(null)}` on both the `<nav>` capsule and the panel. The panel sits at `top-[calc(100%+0.5rem)]`. In the gap, the element under the pointer is page content (the `<header>` is `pointer-events-none`), so `mouseleave` fires on the `<nav>` and the panel unmounts. The user has to go back to the trigger and try again, faster.

## Severity Justification
This blocks a journey step. The desktop mega-menu is the only desktop entry to the five new pages (the drawer is below 1024 only), and with normal-speed pointer travel it fails on most attempts. Before this feature every item in that menu was a dead `#` link, so the defect had no user-visible cost. Now the menu is the feature's front door. Workarounds exist (fast flick, keyboard), so this is HIGH, not CRITICAL.

## Suggested direction (the Engineer's call)
A pixel-neutral fix is enough, so ADR-0006 needs no DDR, and it still has to pass the navbar characterization baseline. For example:
- a transparent hover bridge covering the gap (e.g. a `before:` pseudo-element on the panel, `-top-2 h-2 inset-x-0`), or
- a short close grace period (about 150–250 ms) that is cancelled on re-entry.

Add an E2E case that travels at ≤ 4px per sample and asserts the panel stays open.

## Routed To
- **Owner role:** Frontend Engineer
- **Reason:** implementation. The structure supports the fix, and the spec is clear.
