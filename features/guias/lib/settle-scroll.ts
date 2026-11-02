/** What counts as the visitor taking over the scroll. */
const TAKEOVER = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

/** Corrections per click; a page that keeps cancelling gets no more than this. */
const MAX_CORRECTIONS = 3;
/** Within this many px of the scroll margin counts as aligned. */
const TOLERANCE = 2;
/** No scroll activity for this long means the scroll is over (or never began). */
const QUIET_MS = 250;

/**
 * After an index click, makes sure the section heading ends at its scroll
 * margin (RV-0049). The click itself relies on the browser's smooth anchor
 * scroll, and any instant scroll that lands while it runs cancels it: the
 * motion controller's `ScrollTrigger.refresh()` scrolls to 0 and back to where
 * the page was, which freezes the smooth scroll partway or before it moves
 * (the hash and focus are right, the heading is not). So once the scroll ends
 * (`scrollend`, or a quiet period where that event does not exist or the
 * scroll never started) the heading is checked, and aligned again if it is
 * off. `behavior: "auto"` follows the page's CSS: smooth, or instant under
 * reduced motion. A page too short to bring the heading up is left alone, and
 * the visitor scrolling or typing ends it at once.
 *
 * @returns cancel, for unmount.
 */
export function settleAtMargin(target: HTMLElement): () => void {
  let corrections = 0;
  let timer = 0;
  let done = false;

  const aligned = () => {
    const margin =
      Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - TOLERANCE;
    return (
      atBottom ||
      Math.abs(target.getBoundingClientRect().top - margin) <= TOLERANCE
    );
  };

  const arm = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(settle, QUIET_MS);
  };

  function settle() {
    if (done) return;
    if (aligned() || corrections >= MAX_CORRECTIONS) return finish();
    corrections += 1;
    target.scrollIntoView({ block: "start", behavior: "auto" });
    arm();
  }

  function finish() {
    if (done) return;
    done = true;
    window.clearTimeout(timer);
    window.removeEventListener("scrollend", settle);
    window.removeEventListener("scroll", arm);
    for (const type of TAKEOVER) window.removeEventListener(type, finish);
  }

  window.addEventListener("scrollend", settle);
  window.addEventListener("scroll", arm, { passive: true });
  for (const type of TAKEOVER) {
    window.addEventListener(type, finish, { passive: true });
  }
  arm();
  return finish;
}
