"use client";

import type { JSX, RefObject } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlobeIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { LANGUAGES, NAV, type Lang } from "@/components/layout/nav-config";
import { isCurrentHref, itemHref } from "./nav-model";
import { focusables, inertOutside, wrapTab } from "./modal";

export type DrawerProps = {
  /** Logical state: false starts the close; the Navbar unmounts on onExited. */
  open: boolean;
  /** The panel landmark's id, which the burger's aria-controls points at. */
  drawerId: string;
  /** The burger stays outside the inert page (it is the X, AC 33). */
  burgerRef: RefObject<HTMLButtonElement | null>;
  lang: Lang;
  onLang: (lang: Lang) => void;
  onClose: () => void;
  /** The close has finished: the Navbar unmounts the chunk. */
  onExited: () => void;
};

/**
 * The phone drawer (below 1024px): veil plus panel. A lazy chunk, loaded
 * through next/dynamic by the Navbar (plan § 0.3), so none of it is in
 * First Load JS.
 */
export function MobileDrawer({
  open,
  drawerId,
  burgerRef,
  lang,
  onLang,
  onClose,
  onExited,
}: DrawerProps): JSX.Element {
  /* Current page is derived from the URL, never stored (DDR-0002/0003). */
  const pathname = usePathname();
  const veilRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  /** Veil and Esc: close and hand focus back to the burger (AC 29). */
  const dismiss = useCallback(() => {
    onClose();
    burgerRef.current?.focus();
  }, [onClose, burgerRef]);

  // Modality while open (AC 31, 34): the rest of the page is inert and
  // doesn't scroll, and focus moves in at t = 0 (AC 32). Released when the
  // close starts, not at unmount.
  useLayoutEffect(() => {
    const burger = burgerRef.current;
    const veil = veilRef.current;
    const panel = panelRef.current;
    if (!open || !burger || !veil || !panel) return;
    const restoreInert = inertOutside([burger, veil, panel]);
    const { style } = document.body;
    style.overflow = "hidden";
    focusables(panel)[0]?.focus({ preventScroll: true });
    return () => {
      restoreInert();
      style.overflow = "";
    };
  }, [open, burgerRef]);

  // Keyboard while open: Esc closes from anywhere; Tab wraps between the
  // last panel control and the burger, both ways (AC 29, 33).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return dismiss();
      const burger = burgerRef.current;
      const last = panelRef.current && focusables(panelRef.current).at(-1);
      if (e.key === "Tab" && burger && last) wrapTab(e, burger, last);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, dismiss, burgerRef]);

  // Reaching 1024 while open closes silently: the burger is gone (AC 30).
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (!desktop.matches) return;
      onClose();
      onExited();
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [onClose, onExited]);

  // No close motion yet: the close finishes at once, before paint.
  useLayoutEffect(() => {
    if (!open) onExited();
  }, [open, onExited]);

  return (
    <>
      {/* Mobile menu — a floating panel under the capsule, over a veil that
          hides the page beneath and closes the menu when tapped */}
      {/* Pointer-only (spec § Accessible names): the X and Esc cover the
          keyboard and assistive tech. Same box and classes as before. */}
      <div
        ref={veilRef}
        aria-hidden
        onClick={dismiss}
        className="bg-canvas/75 pointer-events-auto fixed inset-0 -z-10 lg:hidden"
      />
      {/* arbitrary: drawer abaixo da capsula = margem + altura da capsula + folga
          <nav>, not <div> (RV-0015): the drawer is its own labelled
          navigation landmark. It can't sit inside the capsule's <nav>: the
          capsule's backdrop-filter would become its containing block and
          move the fixed panel. Same box and classes, so pixels are unchanged. */}
      <nav
        ref={panelRef}
        id={drawerId}
        aria-label="Menú"
        // Can't take focus while it closes (spec § Motion Intent, M7).
        inert={!open}
        className="border-ink/[0.08] bg-canvas shadow-drawer pointer-events-auto fixed inset-x-4 top-[calc(1rem+3.5rem+0.5rem)] bottom-4 overflow-y-auto overscroll-contain rounded-3xl border px-5 pt-4 pb-8 lg:hidden"
      >
        <ul className="divide-hairline divide-y">
          {NAV.map((group) => (
            <li key={group.label} className="py-5">
              <p className="card-title text-ink">{group.label}</p>
              {group.columns.map((column) => (
                <div key={column.heading} className="mt-4">
                  <p className="eyebrow">{column.heading}</p>
                  <ul className="mt-2 space-y-2">
                    {column.items.map((item) => {
                      const current = isCurrentHref(item.href, pathname);
                      return (
                        <li key={item.title}>
                          <Link
                            href={itemHref(item)}
                            aria-current={current ? "page" : undefined}
                            onClick={onClose}
                            className={cn(
                              "body-sm text-ink-subtle flex items-center justify-between gap-3",
                              // Coarse pointers: the hit area fills the item's slot, half of the
                              // 8px gap above and below (invisible; QA-0004). 44px exclusive
                              // targets don't fit the frozen 30px pitch.
                              "pointer-coarse:relative pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:-inset-y-1",
                            )}
                          >
                            {item.title}
                            {item.price ? (
                              <span className="caption text-ink font-semibold">
                                {item.price}
                              </span>
                            ) : null}
                            {/* Static "you are here" dot, the same as the
                                language menu's selected dot (DDR-0003). */}
                            {current ? (
                              <span
                                data-current-dot
                                aria-hidden
                                className="bg-brand size-1.5 rounded-full"
                              />
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </li>
          ))}
        </ul>
        <div className="border-hairline mt-6 flex items-center justify-between border-t pt-5">
          <span className="body-sm text-ink flex items-center gap-2 font-semibold">
            <GlobeIcon className="size-4" />
            Language
          </span>
          <div className="flex gap-1.5" role="listbox" aria-label="Language">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                role="option"
                aria-selected={lang === l.code}
                onClick={() => onLang(l.code)}
                className={cn(
                  "label-button rounded-full border-2 px-3 py-1.5 transition-colors",
                  lang === l.code
                    ? "border-ink bg-ink text-inverse-ink"
                    : "border-hairline text-ink",
                )}
              >
                {l.code}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3">
          <Link
            href="#signup"
            onClick={onClose}
            className="label-button bg-ink/5 text-ink hover:bg-ink/10 flex min-h-12 items-center justify-center rounded-full px-6 transition-colors"
          >
            Sign up
          </Link>
          <Link
            href="#login"
            onClick={onClose}
            className="label-button bg-ink/5 text-ink hover:bg-ink/10 flex min-h-12 items-center justify-center rounded-full px-6 transition-colors"
          >
            Log in
          </Link>
        </div>
      </nav>
    </>
  );
}
