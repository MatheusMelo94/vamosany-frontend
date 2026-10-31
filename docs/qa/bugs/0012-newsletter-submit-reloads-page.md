# Bug 0012: Newsletter form (CTA): Suscribirme submits a POST to / and reloads to /#, losing the email, with no feedback

- **Severity:** MEDIUM
- **Found by:** Exploratory
- **Status:** Open
- **Posture:** Production
- **Environment:** Chromium (Playwright) via `npx playwright test` on the three configured projects (phone-360, tablet-768, desktop-1280), light theme, `next start` build of `1ead046` (+ test commit `6362de5`).

## Reproduction
On `/`, type a valid synthetic email in `#cta-email`, click Suscribirme in `#newsletter`. Playwright saw a POST to `/` and the URL become `/#`: the input is cleared, no success or error message. The button has no `type` (defaults to submit) and the form is `action="#" method="post"`. Pre-existing shape (the old CTA had the same form with "Join"); DDR-0008 §7 says the form still has no sending service.

## Expected
design-conventions § Screen States Matrix: a form needs submit/success/error states and copy; until a service exists, the button should not look functional or should say so. Spec gap, not an implementation deviation.

## Routed To
- **Owner role:** UX Strategist
- **Reason:** spec-copy-states (no defined state for an unwired form); Engineer then implements (e.g. preventDefault + message, or disabled until wired).
