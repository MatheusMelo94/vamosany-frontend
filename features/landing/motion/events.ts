/**
 * Window event a section fires when it changes its own height after load
 * (e.g. "Mis recomendados" switching tabs). ScrollEffects listens and
 * refreshes ScrollTrigger, so triggers below the section move with it.
 * No imports on purpose: sections can fire it without pulling in GSAP.
 */
export const LAYOUT_CHANGE_EVENT = "landing:layout-change";

export function announceLayoutChange(): void {
  window.dispatchEvent(new Event(LAYOUT_CHANGE_EVENT));
}
