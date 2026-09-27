/**
 * The split point for the phone drawer's lazy chunk (plan § 0.3). The Navbar
 * warms it on idle and on the burger's pointerdown/focus, and resolves it into
 * state before the first open (QA-0006). A failed fetch is retried by the
 * next call (webpack forgets a failed chunk).
 */
export function loadDrawer(): Promise<typeof import("./mobile-drawer")> {
  return import("./mobile-drawer");
}
