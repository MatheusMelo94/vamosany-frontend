"use client";

import type { ComponentType, JSX } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { GlobeIcon } from "@/components/ui/icons";
import { BrandLogo } from "@/components/ui/brand-logo";
import { cn } from "@/lib/utils";
import { LANGUAGES, NAV, type Lang } from "@/components/layout/nav-config";
import type { DrawerProps } from "./drawer/mobile-drawer";
import { loadDrawer, prefetchDrawer } from "./drawer/load-drawer";

/* Desktop-only, pointer/focus-driven: loaded on first panel open, never in
   First Load JS (plan § 11). Until it mounts, items keep their CSS hover. */
const NavMarker = dynamic(
  () => import("./nav-marker").then((m) => m.NavMarker),
  { ssr: false },
);

/** Set by the drawer loader's catch: the tap that hit the failure closes. */
let drawerLoadFailed = false;

/**
 * What next/dynamic renders once the drawer chunk failed to load (plan § 9):
 * no error boundary takes the page. React.lazy caches the loader's result, so
 * this fallback retries by itself: the failing tap closes the burger, and
 * every later tap imports the chunk again.
 */
function DrawerRetry(props: DrawerProps): JSX.Element | null {
  const { onClose, onExited } = props;
  const [Loaded, setLoaded] = useState<ComponentType<DrawerProps> | null>(null);
  useEffect(() => {
    const giveUp = () => {
      onClose();
      onExited();
    };
    if (drawerLoadFailed) {
      drawerLoadFailed = false;
      giveUp();
      return;
    }
    let live = true;
    loadDrawer().then(
      (m) => live && setLoaded(() => m.MobileDrawer),
      () => live && giveUp(),
    );
    return () => {
      live = false;
    };
  }, [onClose, onExited]);
  return Loaded ? <Loaded {...props} /> : null;
}

/* The phone drawer: a lazy chunk, never in First Load JS (plan § 0.3),
   prefetched on idle below 1024 and on the burger's pointerdown/focus. */
const MobileDrawer = dynamic<DrawerProps>(
  () =>
    loadDrawer()
      .then((m) => m.MobileDrawer)
      .catch(() => {
        drawerLoadFailed = true;
        return DrawerRetry;
      }),
  { ssr: false },
);

export function Navbar(): JSX.Element {
  const [open, setOpen] = useState<string | null>(null);
  /* drawerOpen drives the burger's name and aria-expanded at once;
     drawerMounted keeps the chunk (and the X icon) until the close ends. */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const drawerId = useId();
  const burgerRef = useRef<HTMLButtonElement>(null);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const onDrawerExited = useCallback(() => setDrawerMounted(false), []);
  const [lang, setLang] = useState<Lang>("EN");
  const [langOpen, setLangOpen] = useState(false);
  /* Current page is derived from the URL, never stored (DDR-0002/0003). */
  const pathname = usePathname();
  const isCurrent = (href: string | undefined): boolean =>
    href !== undefined && href === pathname;
  const panelIdBase = useId();
  /** Trigger per group label, so Escape can hand focus back (disclosure pattern). */
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const openRef = useRef(open);
  /** Group whose panel the pointer opened by hovering, until a click claims it (QA-0002). */
  const hoverOpenedRef = useRef<string | null>(null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  /* Warm the drawer chunk on idle, only where the burger is visible. */
  useEffect(() => {
    if (!window.matchMedia("(max-width: 1023.98px)").matches) return;
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(prefetchDrawer);
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(prefetchDrawer, 1);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const openGroup = openRef.current;
        setOpen(null);
        setLangOpen(false);
        if (openGroup) triggerRefs.current.get(openGroup)?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-lang-menu]"))
        setLangOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, []);

  const textLink =
    "body-sm rounded-full px-3 py-1.5 font-semibold text-ink transition-colors hover:bg-ink/5";

  return (
    /* Sticky wrapper stays in flow (so nothing hides under it) and lets the
       page scroll underneath; only the capsule itself catches the pointer. */
    <header
      data-nav
      className="site-nav pointer-events-none sticky top-4 z-50 mt-4 px-4 sm:px-6"
    >
      {/* <nav>, not <div>: the site's navigation landmark at every width
          (same box and classes as before, so the render is unchanged). */}
      <nav
        className="nav-capsule border-ink/[0.08] max-w-page bg-canvas/55 shadow-nav pointer-events-auto relative mx-auto flex h-14 w-full items-center justify-between gap-4 rounded-full border pr-2 pl-5 backdrop-blur-xl backdrop-saturate-150 transition-shadow duration-(--duration-slow) sm:pr-2.5 sm:pl-7"
        onMouseLeave={() => setOpen(null)}
      >
        {/* tap-target: ≥ 44 × 44 px invisible hit area on coarse pointers
            (QA-0004); nothing drawn changes */}
        <Link
          href="/"
          className="tap-target shrink-0"
          aria-label="Vamos a NY — home"
        >
          <BrandLogo className="h-6" priority />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          <ul className="flex items-center gap-0.5">
            {NAV.map((group, index) => (
              <li
                key={group.label}
                // Keyboard focus leaving trigger + panel closes it (RV-0005). A null
                // relatedTarget (a click on the panel's unfocusable padding, the
                // window losing focus) keeps it; the pointer path owns that case.
                onBlur={(e) => {
                  const next = e.relatedTarget;
                  if (
                    openRef.current === group.label &&
                    next instanceof Node &&
                    !e.currentTarget.contains(next)
                  )
                    setOpen(null);
                }}
              >
                <button
                  ref={(el) => {
                    if (el) triggerRefs.current.set(group.label, el);
                    else triggerRefs.current.delete(group.label);
                  }}
                  type="button"
                  aria-controls={`${panelIdBase}-panel-${index}`}
                  onMouseEnter={() => {
                    if (openRef.current !== group.label)
                      hoverOpenedRef.current = group.label;
                    setOpen(group.label);
                  }}
                  onClick={(e) => {
                    // A pointer click (detail > 0) on the trigger that hovering just
                    // opened keeps it open: "hover or click" opens (QA-0002). The next
                    // click, and Enter/Space (detail 0), toggle as before.
                    const claimsHover =
                      e.detail > 0 && hoverOpenedRef.current === group.label;
                    hoverOpenedRef.current = null;
                    if (claimsHover) setOpen(group.label);
                    else
                      setOpen((cur) =>
                        cur === group.label ? null : group.label,
                      );
                  }}
                  aria-expanded={open === group.label}
                  className={cn(
                    textLink,
                    "flex items-center gap-1.5",
                    open === group.label && "bg-ink/5",
                  )}
                >
                  {group.label}
                  <svg
                    viewBox="0 0 12 12"
                    aria-hidden
                    className={cn(
                      "size-3 transition-transform duration-200",
                      open === group.label && "rotate-180",
                    )}
                  >
                    <path
                      d="m3 4.5 3 3 3-3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {/* Desktop mega menu — rendered right after its trigger
                    (disclosure pattern: DOM order = tab order) but still
                    positioned against the capsule, its nearest positioned
                    ancestor, so it floats beneath the capsule as before. */}
                {open === group.label ? (
                  // arbitrary: offset do dropdown = altura do trigger + 8px
                  <div
                    id={`${panelIdBase}-panel-${index}`}
                    className={cn(
                      "border-ink/[0.08] bg-canvas shadow-menu absolute inset-x-0 top-[calc(100%+0.5rem)] hidden rounded-3xl border lg:block",
                      // Hover bridge (QA-0001): an unpainted strip over the 8px gap, 4px into the
                      // capsule, so a pointer on its way to the items never leaves the panel.
                      "before:absolute before:inset-x-0 before:-top-3 before:h-3",
                    )}
                    onMouseEnter={() => setOpen(group.label)}
                    onMouseLeave={() => setOpen(null)}
                  >
                    <NavMarker />
                    {/* relative: the items paint above the marker's highlight */}
                    <div
                      className="relative grid gap-10 px-8 py-8"
                      style={{
                        gridTemplateColumns: `repeat(${group.columns.length}, minmax(0,1fr))`,
                      }}
                    >
                      {group.columns.map((column) => (
                        <div key={column.heading}>
                          <p className="eyebrow">{column.heading}</p>
                          <ul className="mt-5 space-y-1">
                            {column.items.map((item) => (
                              <li key={item.title}>
                                <Link
                                  href={item.href ?? "/#services"}
                                  data-nav-item
                                  aria-current={
                                    isCurrent(item.href) ? "page" : undefined
                                  }
                                  className={cn(
                                    // Once the marker is ready it is the hover highlight (DDR-0003).
                                    "group hover:bg-surface-1 block rounded-xl p-3 transition-colors in-data-marker-ready:hover:bg-transparent",
                                    item.price &&
                                      "border-hairline hover:border-ink border",
                                  )}
                                >
                                  {/* pr-4: room for the marker dot, which sits
                                      24px in from the item's right edge (DDR-0003) */}
                                  <span className="body-sm text-ink flex items-center gap-2 pr-4 font-semibold">
                                    <span
                                      data-nav-title
                                      className="underline-offset-4 group-hover:underline"
                                    >
                                      {item.title}
                                    </span>
                                    {item.tag ? (
                                      <span className="caption bg-brand text-ink shrink-0 rounded-full px-2 py-0.5 font-semibold whitespace-nowrap">
                                        {item.tag}
                                      </span>
                                    ) : null}
                                  </span>
                                  <span className="body-sm text-ink-subtle mt-0.5 block">
                                    {item.blurb}
                                  </span>
                                  {item.price ? (
                                    <span className="mt-3 flex items-center justify-between">
                                      <span className="headline text-ink">
                                        {item.price}
                                      </span>
                                      <span className="label-button text-ink underline-offset-4 group-hover:underline">
                                        See details
                                      </span>
                                    </span>
                                  ) : null}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>

          <span aria-hidden className="bg-ink/10 mx-2 h-5 w-px" />

          <div data-lang-menu className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-label="Change language"
              className={cn(
                textLink,
                "flex items-center gap-1.5",
                langOpen && "bg-ink/5",
              )}
            >
              <GlobeIcon className="size-4" />
              {lang}
              <svg
                viewBox="0 0 12 12"
                aria-hidden
                className={cn(
                  "size-3 transition-transform duration-200",
                  langOpen && "rotate-180",
                )}
              >
                <path
                  d="m3 4.5 3 3 3-3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {langOpen ? (
              // arbitrary: offset do dropdown = altura do trigger + 12px, nao e um step da escala
              <ul
                role="listbox"
                aria-label="Language"
                className="border-ink/[0.08] bg-canvas shadow-menu absolute top-[calc(100%+0.75rem)] right-0 w-44 rounded-2xl border p-1.5"
              >
                {LANGUAGES.map((l) => (
                  <li key={l.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={lang === l.code}
                      onClick={() => {
                        setLang(l.code);
                        setLangOpen(false);
                      }}
                      className={cn(
                        "body-sm hover:bg-surface-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors",
                        lang === l.code
                          ? "bg-surface-1 text-ink font-semibold"
                          : "text-ink-subtle",
                      )}
                    >
                      <span>
                        <span className="text-ink font-mono">{l.code}</span>
                        <span className="ml-2">{l.label}</span>
                      </span>
                      {lang === l.code ? (
                        <span
                          aria-hidden
                          className="bg-brand size-1.5 rounded-full"
                        />
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <Link
            href="#login"
            className={cn(textLink, "bg-ink/5 hover:bg-ink/10")}
          >
            Log in
          </Link>
          <Link
            href="#signup"
            className={cn(textLink, "bg-ink/5 hover:bg-ink/10")}
          >
            Sign up
          </Link>
        </div>

        <button
          ref={burgerRef}
          type="button"
          onClick={() => {
            if (!drawerOpen) setDrawerMounted(true);
            setDrawerOpen(!drawerOpen);
          }}
          onPointerDown={prefetchDrawer}
          onFocus={prefetchDrawer}
          aria-label={drawerOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={drawerOpen}
          aria-controls={drawerMounted ? drawerId : undefined}
          className="tap-target text-ink hover:bg-ink/5 grid size-10 place-items-center rounded-full transition-colors lg:hidden"
        >
          <svg viewBox="0 0 20 20" aria-hidden className="size-5">
            {drawerMounted ? (
              <path
                d="m5 5 10 10M15 5 5 15"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3 6h14M3 10h14M3 14h14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </nav>

      {drawerMounted ? (
        <MobileDrawer
          open={drawerOpen}
          drawerId={drawerId}
          burgerRef={burgerRef}
          lang={lang}
          onLang={setLang}
          onClose={closeDrawer}
          onExited={onDrawerExited}
        />
      ) : null}
    </header>
  );
}
