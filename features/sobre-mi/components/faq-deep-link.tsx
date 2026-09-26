"use client";

import { useEffect } from "react";

/** Decodes the URL fragment; a malformed escape is treated as no match. */
function hashId(): string {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return "";
  }
}

/**
 * FAQ deep links (spec § States Matrix, FAQ; AC 48). On load and on
 * `hashchange`: a hash naming a question opens it (instantly, no animation)
 * and scrolls it into view; a hash naming a group just scrolls to it. Anchors
 * carry `data-sm-anchor` (scroll-margin), so they land below the sticky
 * navbar. The hash is only a lookup key for getElementById — never used as a
 * selector or written to the DOM (S§ Input & Output Handling). Unknown hash:
 * nothing opens, nothing scrolls. Renders nothing.
 */
export function FaqDeepLink(): null {
  useEffect(() => {
    const follow = () => {
      const id = hashId();
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      if (target instanceof HTMLDetailsElement) target.open = true;
      target.scrollIntoView({ block: "start", behavior: "instant" });
    };
    follow();
    // On a direct load the browser runs its own fragment scroll late (around
    // `load`) and smoothly (html { scroll-behavior: smooth }), toward a target
    // computed before the webfonts reflowed the text above, which leaves the
    // anchor under the navbar. Align once more after it: on its `scrollend`,
    // on `load` (no scrollend in Safari) and when the fonts are ready.
    let active = true;
    const settle = () => {
      if (active) follow();
    };
    void document.fonts?.ready.then(settle);
    window.addEventListener("scrollend", settle, { once: true });
    if (document.readyState !== "complete") {
      window.addEventListener("load", settle, { once: true });
    }
    window.addEventListener("hashchange", follow);
    return () => {
      active = false;
      window.removeEventListener("scrollend", settle);
      window.removeEventListener("load", settle);
      window.removeEventListener("hashchange", follow);
    };
  }, []);

  return null;
}
