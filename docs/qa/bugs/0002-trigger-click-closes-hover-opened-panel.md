# Bug 0002: A mouse click on a mega-menu trigger closes the panel that hovering just opened

- **Severity:** MEDIUM
- **Found by:** Exploratory (manual keyboard/pointer pass)
- **Status:** Open
- **Posture:** Production
- **Environment:** Chromium `desktop-1280`, light, reduced motion off, `1ae0c4e` local build. The same on `main` @ `c3809d2` (**pre-existing**).

## Reproduction
1. At 1280, move the mouse onto "Sobre mí" and click it (Playwright `trigger.click()`, a real pointer move followed by a click).
2. `mouseenter` opens the panel, then `onClick` toggles it (`cur === label ? null : label`), so it closes.
3. Result: `aria-expanded="false"` 300 ms after the click. The visitor sees a flash, and a second click reopens it.

## Expected
Spec Journey 1: "desktop: hover **or click**". A click on a closed-looking trigger leaves the panel open.

## Actual
The click undoes the hover. The existing E2E suite works around this: `navbar.spec.ts:119-121` hovers instead of clicking, with the comment "A real click fires mouseenter (open) then click (toggle closed)".

## Severity Justification
The journey step is not blocked (hover works, and a second click works), but the "click" path the spec names behaves the opposite of what the user asked for, on the feature's entry point. Pointer users who click menus are common. MEDIUM.

## Suggested direction
When the click comes from a pointer and the same trigger was opened by hover within the last few hundred ms, keep it open. Keyboard activation (Enter/Space) keeps toggling. The fix is pixel-neutral.

## Routed To
- **Owner role:** Frontend Engineer
- **Reason:** implementation, against spec Journey step 1
