/**
 * DOM helpers for the drawer's modality (plan § 8). Not a native <dialog>:
 * showModal() would make the burger inert, and the burger (the X) stays in
 * the drawer's focus cycle (AC 33).
 */

const FOCUSABLE = "a[href], button:not([disabled])";

/** The Tab stops inside `root`, in DOM order; hidden or inert subtrees are skipped. */
export function focusables(root: Element): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => !el.closest("[hidden], [inert]"),
  );
}

/**
 * Wraps the two edges of a focus cycle (AC 33): Tab on `last` goes to
 * `first`, Shift+Tab on `first` goes to `last`. Every other Tab is native.
 */
export function wrapTab(
  event: KeyboardEvent,
  first: HTMLElement,
  last: HTMLElement,
): void {
  const active = document.activeElement;
  const target = event.shiftKey
    ? active === first && last
    : active === last && first;
  if (!target) return;
  event.preventDefault();
  target.focus();
}

/**
 * Makes everything outside `keep` inert: walking from each kept element up
 * to <body>, every sibling that holds no kept element gets `inert`. Returns
 * a disposer that removes exactly what this call set, so an element that
 * was inert before stays inert.
 */
export function inertOutside(keep: readonly Element[]): () => void {
  const set: Element[] = [];
  const holdsKept = (el: Element) => keep.some((k) => el.contains(k));
  for (const kept of keep) {
    const body = kept.ownerDocument.body;
    for (let node = kept; node !== body && node.parentElement;) {
      for (const sibling of node.parentElement.children) {
        if (holdsKept(sibling) || sibling.hasAttribute("inert")) continue;
        sibling.setAttribute("inert", "");
        set.push(sibling);
      }
      node = node.parentElement;
    }
  }
  return () => {
    for (const el of set) el.removeAttribute("inert");
  };
}
