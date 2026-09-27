/**
 * DOM helpers for the drawer's modality (plan § 8). Not a native <dialog>:
 * showModal() would make the burger inert, and the burger (the X) stays in
 * the drawer's focus cycle (AC 33).
 */

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
