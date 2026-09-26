import "@testing-library/jest-dom/vitest";

// jsdom has no matchMedia; GSAP's ScrollTrigger calls it when the plugin is
// registered (lib/gsap.ts). Nothing matches: tests decide the motion gate
// through the `.gsap` class on <html> (ADR-0002), never through media queries.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
