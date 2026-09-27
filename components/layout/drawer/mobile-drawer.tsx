"use client";

import type { JSX, RefObject } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlobeIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { LANGUAGES, NAV, type Lang } from "@/components/layout/nav-config";
import { defaultOpenGroup, groupHasCurrent } from "./nav-model";
import { DrawerGroup } from "./drawer-group";
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
  /* Single-open accordion, initialized on every mount from the current
     page, so a reopen always starts from the default (AC 20, 24). */
  const [expanded, setExpanded] = useState(() =>
    defaultOpenGroup(NAV, pathname),
  );
  const toggle = (label: string) =>
    setExpanded((cur) => (cur === label ? null : label));

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
          move the fixed panel. A flex column: the list scrolls, the footer
          is pinned. From 640 the panel is 420px, right-aligned with the
          capsule (right-6 = the header's sm:px-6; the capsule's max width
          is wider than any sub-1024 viewport). */}
      <nav
        ref={panelRef}
        id={drawerId}
        aria-label="Menú"
        // Can't take focus while it closes (spec § Motion Intent, M7).
        inert={!open}
        className="border-ink/[0.08] bg-canvas shadow-drawer pointer-events-auto fixed inset-x-4 top-[calc(1rem+3.5rem+0.5rem)] bottom-4 flex flex-col overflow-hidden rounded-3xl border sm:right-6 sm:left-auto sm:w-105 lg:hidden"
      >
        <div
          data-drawer-list
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-1 pb-4"
        >
          <div className="border-hairline border-t">
            {NAV.map((group) => (
              <DrawerGroup
                key={group.label}
                group={group}
                expanded={expanded === group.label}
                hasCurrent={groupHasCurrent(group, pathname)}
                pathname={pathname}
                onToggle={() => toggle(group.label)}
                onNavigate={onClose}
              />
            ))}
          </div>
        </div>
        <div
          data-drawer-footer
          className="border-hairline bg-canvas flex flex-col gap-3 border-t px-4 pt-3 pb-4"
        >
          <div className="flex items-center justify-between">
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
          <div className="flex flex-col gap-3">
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
        </div>
      </nav>
    </>
  );
}
