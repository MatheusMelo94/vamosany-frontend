"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GlobeIcon } from "./icons";
import { BrandLogo } from "./ui";

type Item = {
  title: string;
  blurb: string;
  tag?: string;
  price?: string;
  href?: string;
};
type Group = { label: string; columns: { heading: string; items: Item[] }[] };

const NAV: Group[] = [
  {
    label: "Itineraries",
    columns: [
      {
        heading: "By length",
        items: [
          {
            title: "3 Days — First Timer",
            blurb: "The greatest hits, walkable.",
          },
          {
            title: "5 Days — The Classic",
            blurb: "Icons plus real neighbourhoods.",
            tag: "Best seller",
          },
          { title: "7 Days — Deep Cut", blurb: "Five boroughs, no filler." },
          { title: "Weekend Escape", blurb: "48 hours, zero wasted minutes." },
        ],
      },
      {
        heading: "By season",
        items: [
          {
            title: "Christmas in New York",
            blurb: "Markets, windows, ice rinks.",
            tag: "New",
          },
          {
            title: "Autumn in the Parks",
            blurb: "Peak foliage, October light.",
          },
          { title: "Summer Rooftops", blurb: "Long evenings above the grid." },
          { title: "Winter on a Budget", blurb: "Warm rooms, cheap tickets." },
        ],
      },
      {
        heading: "By appetite",
        items: [
          { title: "Foodie New York", blurb: "Delis, dumplings, slices." },
          { title: "Art & Museums", blurb: "The Met to Bushwick walls." },
          { title: "Family New York", blurb: "Tested with small legs." },
          { title: "Film Locations", blurb: "Stand where the scene happened." },
        ],
      },
    ],
  },
  {
    label: "Guides",
    columns: [
      {
        heading: "Getting around",
        items: [
          {
            title: "The Subway, Explained",
            blurb: "Read the map like a local.",
          },
          { title: "From the Airport", blurb: "JFK, EWR and LGA compared." },
          { title: "Walking the Grid", blurb: "Why the numbers make sense." },
          { title: "Yellow Cab vs App", blurb: "When each one wins." },
        ],
      },
      {
        heading: "Neighbourhoods",
        items: [
          { title: "Lower East Side", blurb: "Tenements and late nights." },
          { title: "Williamsburg", blurb: "Brooklyn's front window." },
          { title: "Harlem", blurb: "Jazz, stoops and Sunday." },
          {
            title: "Chinatown & Little Italy",
            blurb: "Two blocks, two worlds.",
          },
        ],
      },
      {
        heading: "Before you fly",
        items: [
          { title: "ESTA & Entry", blurb: "Paperwork without panic." },
          { title: "Budget Calculator", blurb: "What a day really costs." },
          {
            title: "Packing for the Season",
            blurb: "It is colder than you think.",
          },
          { title: "Broadway Tickets", blurb: "Rush, lottery and TKTS." },
        ],
      },
    ],
  },
  {
    label: "Blog",
    columns: [
      {
        heading: "Latest",
        items: [
          { title: "Neighbourhood Diaries", blurb: "One block at a time." },
          { title: "Seasonal Guides", blurb: "What's on, month by month." },
          { title: "Food Crawls", blurb: "Routes built around eating." },
          { title: "Photo Spots", blurb: "Where the light lands." },
        ],
      },
      {
        heading: "Readers",
        items: [
          { title: "Reader Trips", blurb: "Real itineraries, real notes." },
          { title: "Ask Us Anything", blurb: "Your questions, answered." },
          { title: "Mistakes We Made", blurb: "So you don't repeat them." },
          { title: "Newsletter Archive", blurb: "Every issue, free." },
        ],
      },
    ],
  },
  {
    label: "Services",
    columns: [
      {
        heading: "Ready-made",
        items: [
          {
            title: "Curated by Belén",
            blurb: "Itineraries she walked and wrote. Download and go.",
            price: "from €25",
            href: "#services",
          },
        ],
      },
      {
        heading: "One to one",
        items: [
          {
            title: "Custom itinerary with Belén",
            blurb: "A call, your dates and pace, a plan built just for you.",
            price: "€149",
            tag: "Most popular",
            href: "#services",
          },
        ],
      },
      {
        heading: "In person",
        items: [
          {
            title: "Walk with Belén",
            blurb:
              "Half a day on foot with her, in the neighbourhood you pick.",
            price: "€290",
            href: "#services",
          },
        ],
      },
    ],
  },
  {
    label: "About",
    columns: [
      {
        heading: "The studio",
        items: [
          { title: "Our Story", blurb: "Why we started walking." },
          { title: "How We Research", blurb: "On foot, twice a year." },
          { title: "Press", blurb: "Where we've turned up." },
          { title: "Work With Us", blurb: "Partnerships and briefs." },
        ],
      },
      {
        heading: "Help",
        items: [
          { title: "Contact", blurb: "A human replies." },
          { title: "Refunds", blurb: "Fourteen days, no questions." },
          { title: "FAQ", blurb: "The usual suspects." },
        ],
      },
    ],
  },
];

const LANGUAGES = [
  { code: "EN", label: "English" },
  { code: "ES", label: "Español" },
  { code: "PT", label: "Português" },
] as const;
type Lang = (typeof LANGUAGES)[number]["code"];

export function Navbar() {
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("EN");
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setLangOpen(false);
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

  const active = NAV.find((g) => g.label === open);

  const textLink =
    "body-sm rounded-full px-3 py-1.5 font-semibold text-ink transition-colors hover:bg-ink/5";

  return (
    /* Sticky wrapper stays in flow (so nothing hides under it) and lets the
       page scroll underneath; only the capsule itself catches the pointer. */
    <header
      data-nav
      className="site-nav pointer-events-none sticky top-4 z-50 mt-4 px-4 sm:px-6"
    >
      <div
        className="nav-capsule border-ink/[0.08] pointer-events-auto relative mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between gap-4 rounded-full border bg-white/55 pr-2 pl-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl backdrop-saturate-150 transition-shadow duration-(--duration-slow) sm:pr-2.5 sm:pl-7"
        onMouseLeave={() => setOpen(null)}
      >
        <Link href="/" className="shrink-0" aria-label="Vamos a NY — home">
          <BrandLogo className="h-6" />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          <ul className="flex items-center gap-0.5">
            {NAV.map((group) => (
              <li key={group.label}>
                <button
                  type="button"
                  onMouseEnter={() => setOpen(group.label)}
                  onClick={() =>
                    setOpen((cur) => (cur === group.label ? null : group.label))
                  }
                  aria-expanded={open === group.label}
                  className={`${textLink} flex items-center gap-1.5 ${
                    open === group.label ? "bg-ink/5" : ""
                  }`}
                >
                  {group.label}
                  <svg
                    viewBox="0 0 12 12"
                    aria-hidden
                    className={`size-3 transition-transform duration-200 ${
                      open === group.label ? "rotate-180" : ""
                    }`}
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
              className={`${textLink} flex items-center gap-1.5 ${langOpen ? "bg-ink/5" : ""}`}
            >
              <GlobeIcon className="size-4" />
              {lang}
              <svg
                viewBox="0 0 12 12"
                aria-hidden
                className={`size-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
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
              <ul
                role="listbox"
                aria-label="Language"
                className="border-ink/[0.08] bg-canvas absolute top-[calc(100%+0.75rem)] right-0 w-44 rounded-2xl border p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.08)]"
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
                      className={`body-sm hover:bg-surface-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors ${
                        lang === l.code
                          ? "bg-surface-1 text-ink font-semibold"
                          : "text-ink-subtle"
                      }`}
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
            className={`${textLink} bg-ink/5 hover:bg-ink/10`}
          >
            Log in
          </Link>
          <Link
            href="#signup"
            className={`${textLink} bg-ink/5 hover:bg-ink/10`}
          >
            Sign up
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          className="text-ink hover:bg-ink/5 grid size-10 place-items-center rounded-full transition-colors lg:hidden"
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

        {/* Desktop mega menu — floats beneath the capsule at its width */}
        {active ? (
          <div
            className="border-ink/[0.08] bg-canvas absolute inset-x-0 top-[calc(100%+0.5rem)] hidden rounded-3xl border shadow-[0_18px_50px_rgba(0,0,0,0.08)] lg:block"
            onMouseEnter={() => setOpen(active.label)}
            onMouseLeave={() => setOpen(null)}
          >
            <div
              className="grid gap-10 px-8 py-8"
              style={{
                gridTemplateColumns: `repeat(${active.columns.length}, minmax(0,1fr))`,
              }}
            >
              {active.columns.map((column) => (
                <div key={column.heading}>
                  <p className="eyebrow">{column.heading}</p>
                  <ul className="mt-5 space-y-1">
                    {column.items.map((item) => (
                      <li key={item.title}>
                        <Link
                          href={item.href ?? "#services"}
                          className={`group hover:bg-surface-1 block rounded-xl p-3 transition-colors ${
                            item.price
                              ? "border-hairline hover:border-ink border"
                              : ""
                          }`}
                        >
                          <span className="body-sm text-ink flex items-center gap-2 font-semibold">
                            {item.title}
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
      </div>

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
        <div className="border-ink/[0.08] bg-canvas pointer-events-auto fixed inset-x-4 top-[calc(1rem+3.5rem+0.5rem)] bottom-4 overflow-y-auto rounded-3xl border px-5 pt-4 pb-8 shadow-[0_18px_50px_rgba(0,0,0,0.1)] lg:hidden">
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
                            onClick={() => setMobileOpen(false)}
                            className="body-sm text-ink-subtle flex items-center justify-between gap-3"
                          >
                            {item.title}
                            {item.price ? (
                              <span className="caption text-ink font-semibold">
                                {item.price}
                              </span>
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
                  className={`label-button rounded-full border-2 px-3 py-1.5 transition-colors ${
                    lang === l.code
                      ? "border-ink bg-ink text-white"
                      : "border-hairline text-ink"
                  }`}
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
