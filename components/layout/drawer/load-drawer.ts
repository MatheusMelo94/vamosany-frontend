/**
 * The split point for the phone drawer's lazy chunk (plan § 0.3). The Navbar
 * renders the chunk through next/dynamic and warms it with prefetchDrawer();
 * both go through loadDrawer(), so a failed fetch is retried by the next call
 * (webpack forgets a failed chunk).
 */
export function loadDrawer(): Promise<typeof import("./mobile-drawer")> {
  return import("./mobile-drawer");
}

/** Fire-and-forget warm-up: a failure here is retried by the tap that needs it. */
export function prefetchDrawer(): void {
  loadDrawer().catch(() => undefined);
}
