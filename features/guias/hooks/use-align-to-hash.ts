import { useEffect } from "react";

/** Anchor ids are short slugs; anything longer can't match. */
const MAX_HASH = 200;

/** Decodes the URL fragment; a malformed escape or an oversized one is no match. */
function hashId(): string {
  const raw = window.location.hash.slice(1);
  if (!raw || raw.length > MAX_HASH) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return "";
  }
}

/** What counts as the visitor taking over the scroll. */
const TAKEOVER = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

/**
 * Spec § States Matrix, "Hash on load" (AC 26): `/guias/x#tope` opens with the
 * section clear of the navbar. On a direct load the browser runs its own
 * fragment scroll late and smoothly (html { scroll-behavior: smooth }), and the
 * page's layout work (webfont reflow, the motion controller's ScrollTrigger
 * refresh) can cut that scroll short. So the section is aligned once on mount
 * and again when the fonts are ready, when the browser's scroll ends and on
 * `load`, instantly and honouring the heading's scroll margin, until the
 * visitor scrolls or types, and drops the focus the browser gave the heading. The hash is only a lookup key for getElementById
 * among the guide's own section ids; it is never used as a selector or written
 * to the DOM, and an unknown, malformed or oversized hash does nothing.
 */
export function useAlignToHash(ids: readonly string[]): void {
  useEffect(() => {
    let active = true;
    const align = () => {
      if (!active) return;
      const id = hashId();
      if (!id || !ids.includes(id)) return;
      const target = document.getElementById(id);
      if (!target) return;
      target.scrollIntoView({ block: "start", behavior: "instant" });
      // The browser focuses a tabindex=-1 fragment target, and the global
      // :focus-visible ring would then show on a page the visitor merely
      // opened (spec: "focus does not jump"). Let go of it; the sequential
      // focus starting point stays there, so Tab continues after the heading.
      if (document.activeElement === target) target.blur();
    };
    const stop = () => {
      active = false;
    };

    align();
    void document.fonts?.ready.then(align);
    window.addEventListener("scrollend", align, { once: true });
    if (document.readyState !== "complete") {
      window.addEventListener("load", align, { once: true });
    }
    for (const type of TAKEOVER) {
      window.addEventListener(type, stop, { once: true, passive: true });
    }
    return () => {
      active = false;
      window.removeEventListener("scrollend", align);
      window.removeEventListener("load", align);
      for (const type of TAKEOVER) window.removeEventListener(type, stop);
    };
  }, [ids]);
}
