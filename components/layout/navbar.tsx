"use client";

import type { JSX } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { GlobeIcon } from "@/components/ui/icons";
import { BrandLogo } from "@/components/ui/brand-logo";
import { cn } from "@/lib/utils";
import { NAV } from "@/components/layout/nav-config";

/* Desktop-only, pointer/focus-driven: loaded on first panel open, never in
   First Load JS (plan § 11). Until it mounts, items keep their CSS hover. */
const NavMarker = dynamic(
  () => import("./nav-marker").then((m) => m.NavMarker),
  { ssr: false },
);

const LANGUAGES = [
  { code: "EN", label: "English" },
  { code: "ES", label: "Español" },
  { code: "PT", label: "Português" },
] as const;
type Lang = (typeof LANGUAGES)[number]["code"];

export function Navbar(): JSX.Element {
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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
              <li key={group.label}>
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
                                  href={item.href ?? "#services"}
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
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          className="tap-target text-ink hover:bg-ink/5 grid size-10 place-items-center rounded-full transition-colors lg:hidden"
        >
          <svg viewBox="0 0 20 20" aria-hidden className="size-5">
            {mobileOpen ? (
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

      {/* Mobile menu — a floating panel under the capsule, over a veil that
          hides the page beneath and closes the menu when tapped */}
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="bg-canvas/75 pointer-events-auto fixed inset-0 -z-10 lg:hidden"
        />
      ) : null}
      {mobileOpen ? (
        // arbitrary: drawer abaixo da capsula = margem + altura da capsula + folga
        <div className="border-ink/[0.08] bg-canvas shadow-drawer pointer-events-auto fixed inset-x-4 top-[calc(1rem+3.5rem+0.5rem)] bottom-4 overflow-y-auto rounded-3xl border px-5 pt-4 pb-8 lg:hidden">
          <ul className="divide-hairline divide-y">
            {NAV.map((group) => (
              <li key={group.label} className="py-5">
                <p className="card-title text-ink">{group.label}</p>
                {group.columns.map((column) => (
                  <div key={column.heading} className="mt-4">
                    <p className="eyebrow">{column.heading}</p>
                    <ul className="mt-2 space-y-2">
                      {column.items.map((item) => (
                        <li key={item.title}>
                          <Link
                            href={item.href ?? "#services"}
                            aria-current={
                              isCurrent(item.href) ? "page" : undefined
                            }
                            onClick={() => setMobileOpen(false)}
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
                            {isCurrent(item.href) ? (
                              <span
                                data-current-dot
                                aria-hidden
                                className="bg-brand size-1.5 rounded-full"
                              />
                            ) : null}
                          </Link>
                        </li>
                      ))}
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
                  onClick={() => setLang(l.code)}
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
              onClick={() => setMobileOpen(false)}
              className="label-button bg-ink/5 text-ink hover:bg-ink/10 flex min-h-12 items-center justify-center rounded-full px-6 transition-colors"
            >
              Sign up
            </Link>
            <Link
              href="#login"
              onClick={() => setMobileOpen(false)}
              className="label-button bg-ink/5 text-ink hover:bg-ink/10 flex min-h-12 items-center justify-center rounded-full px-6 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
