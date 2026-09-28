# Bug 0006: First open after each page load: the burger turns into the X at once, but the panel appears about 340ms later, and until then the page isn't inert and focus stays outside

- **Severity:** MEDIUM
- **Found by:** Exploratory (keyboard pass, then time-sampled)
- **Status:** Open
- **Posture:** Production
- **Environment:** Chromium headless, `phone-360` (touch) and `tablet-768`, light, reduced motion off, `48e6db1` local production build (`next start -p 3417`). 3 of 3 runs on `/`, 2 of 2 on `/sobre-mi`.

## Reproduction
1. Load `/` (or any route) and wait 4s. The idle prefetch has finished by then: the chunk is in the resource list.
2. Tap the burger, then sample every animation frame.
3. Result:
   - **t ≈ 13ms:** the burger is named "Cerrar menú" and has `aria-expanded="true"`.
   - **t ≈ 13–340ms:** no veil, no panel, 0 `inert` elements, and `body.style.overflow` is `""`.
   - **t ≈ 342–352ms:** the veil and panel mount. The page becomes inert, focus moves to "Itineraries", and only then does the 0.85s unfold start.
4. Later opens on the same page reach the first panel paint in 12–146ms.
5. Keyboard variant: focus the burger, press Enter, and press Tab 50ms later.
   - Focus lands on page content ("Armá tu viaje" on `/`, "Ver itinerarios" on `/sobre-mi`).
   - About 300ms later the panel mounts and focus is pulled to "Itineraries".

Probe scripts: `docs/qa/test-passes/2026-09-27_mobile-nav_v1.qa-scripts.txt` (§ first-open, § gap).

## Expected
- Spec § Motion Intent › Global rules: "**Focus moves into the panel at t = 0** (it doesn't wait for the unfold)" and "Input is never blocked".
- AC 5 and AC 34: while the burger says "Cerrar menú", the veil and panel are shown and the page is inert.
- `design-conventions.md § Motion Principles`: "Nothing blocks input > 300 ms".
- DDR-0006 › Consequences asks QA to check that the open doesn't feel slow.

## Actual
The first open of every page load has a dead window of about 340ms. The burger already shows the X, but nothing else responds, and focus and the modality are late. The first unfold therefore settles at about 1.2s instead of 0.85s.

The cause looks like the `next/dynamic` first mount: it suspends, and React throttles the Suspense reveal (about 300ms). The T013 handoff notes the same throttle under `page.clock`. The chunk's bytes are already prefetched, so this isn't network time. The lazy chunk itself (plan § 0.3, First Load budget) is correct and should stay.

## Severity Justification
- **Likelihood:** it hits every Visitor on their first menu tap of each page load, and that's the most common tap.
- **Impact:** a visible stall of about ⅓s before an already long expressive sequence. It's also a short window where a fast keyboard or switch user's Tab goes into the page, which is supposed to be inert. The journey still completes, and nothing is lost.
- MEDIUM.

## Routed To
- **Owner role:** Frontend Engineer, with the Frontend Architect as FYI because plan § 0.3 chose `next/dynamic`.
- **Reason:** implementation. Mount the chunk's component without a suspending first render once it's prefetched. For example, resolve `loadDrawer()` into state and render the component directly, or pre-mount the drawer closed after the idle prefetch. That keeps the chunk out of First Load JS. If none of these fits the plan's boundary, the Architect decides.
