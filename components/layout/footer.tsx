import type { JSX } from "react";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { BrandLogo } from "@/components/ui/brand-logo";

const TOP_LINKS = [
  "Our story",
  "How we research",
  "Press",
  "Work with us",
  "Contact",
];

const COLUMNS = [
  {
    heading: "Itineraries",
    links: [
      "3 Days — First Timer",
      "5 Days — The Classic",
      "7 Days — Deep Cut",
      "Weekend Escape",
      "Christmas in New York",
      "Foodie New York",
      "Family New York",
      "New York on a Budget",
    ],
  },
  {
    heading: "Guides",
    links: [
      "The Subway, Explained",
      "From the Airport",
      "Neighbourhood Guides",
      "Broadway Tickets",
      "Best Viewpoints",
      "Budget Calculator",
      "Packing List",
      "ESTA & Entry",
    ],
  },
  {
    heading: "Blog",
    links: [
      "Neighbourhood Diaries",
      "Seasonal Guides",
      "Food Crawls",
      "Photo Spots",
      "Reader Trips",
      "Mistakes We Made",
      "Newsletter Archive",
      "Live Updates",
    ],
  },
  {
    heading: "Help",
    links: [
      "Contact",
      "Refunds",
      "FAQ",
      "What's included",
      "Gift an itinerary",
      "Affiliate programme",
      "Accessibility",
    ],
  },
];

const SOCIALS = ["X", "in", "f", "IG"];

/* CC BY / CC BY-SA photography requires visible attribution. */
const PHOTO_CREDITS = [
  [
    "Brooklyn, Manhattan & Williamsburg Bridges",
    "Axel Tschentscher",
    "CC BY-SA 4.0",
  ],
  ["Central Park in autumn", "Ed Yourdon", "CC BY-SA 2.0"],
  ["451 Broome Street, SoHo", "Axel Tschentscher", "CC BY-SA 4.0"],
  ["Chinatown, Manhattan", "Derek Jensen", "Public domain"],
  ["Grand Central Terminal", "Diliff", "CC BY 2.5"],
  ["The High Line", "King of Hearts", "CC BY-SA 4.0"],
  ["Union Square subway", "TLK in 3", "CC BY-SA 3.0"],
  ["Brooklyn Bridge at sunset", "MusikAnimal", "CC BY-SA 4.0"],
  ["Mott Street at night", "MusikAnimal", "CC BY-SA 4.0"],
  ["Central Park & Midtown", "Gzzz", "CC BY-SA 3.0"],
  ["Yellow cab after the snow", "Corentin Villemeur", "CC BY-SA 4.0"],
];

const LEGAL = ["Terms", "Privacy Policy", "Cookie Settings", "Photo credits"];

export function Footer(): JSX.Element {
  return (
    <footer className="bg-ink text-white">
      <div className="container-ds py-16">
        <ul className="flex flex-wrap gap-x-7 gap-y-3">
          {TOP_LINKS.map((link) => (
            <li key={link}>
              <Link
                href="#"
                className="body-sm text-white/80 transition-colors hover:text-white"
              >
                {link}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="label-button text-white">{column.heading}</p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="body-sm inline-flex items-center gap-1.5 text-white/55 transition-colors hover:text-white"
                    >
                      {link}
                      {link === "Live Updates" ? (
                        <span
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
        </div>

        <div className="mt-14 grid gap-8 border-t border-white/15 pt-12 lg:grid-cols-3 lg:items-start">
          <div>
            <BrandLogo tone="light" className="h-8" />
            <ul className="mt-5 flex gap-2.5">
              {SOCIALS.map((s) => (
                <li key={s}>
                  <Link
                    href="#"
                    aria-label={s}
                    className="caption grid size-8 place-items-center rounded-sm border border-white/25 text-white/70 transition-colors hover:border-white hover:bg-white/10 hover:text-white"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <p className="subhead text-balance text-white">
            One email a month: a route, a place to eat, and something worth
            walking to.
          </p>

          <form
            className="w-full"
            action="#"
            method="post"
            aria-label="Newsletter signup"
          >
            <div className="flex items-center gap-2 rounded-sm border-2 border-white/25 bg-white/10 p-1 pl-3 focus-within:border-white">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="you@email.com"
                className="body-sm h-10 min-w-0 flex-1 bg-transparent text-white placeholder:text-white/45 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="bg-brand text-ink hover:bg-brand-hover grid size-10 shrink-0 place-items-center rounded-sm transition-colors"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
            <p className="caption mt-3 text-white/45">
              I confirm that I have read the{" "}
              <Link
                href="#"
                className="text-white/70 underline underline-offset-2 hover:text-white"
              >
                Privacy Policy
              </Link>{" "}
              and agree with it.
            </p>
          </form>
        </div>

        <details className="caption mt-12 border-t border-white/15 pt-8 text-white/45">
          <summary className="cursor-pointer transition-colors hover:text-white">
            Photography credits
          </summary>
          <ul className="mt-4 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {PHOTO_CREDITS.map(([subject, author, license]) => (
              <li key={subject}>
                {subject} — {author},{" "}
                <span className="text-white/35">{license}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-white/35">
            All photographs via Wikimedia Commons, used under their respective
            licences.
          </p>
        </details>

        <div className="caption mt-8 flex flex-col gap-4 border-t border-white/15 pt-8 text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Vamos a NY. Made in Madrid, walked in New York.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL.map((item) => (
              <li key={item}>
                <Link href="#" className="transition-colors hover:text-white">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
