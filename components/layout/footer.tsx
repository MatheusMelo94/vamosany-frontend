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
    <footer className="bg-ink text-inverse-ink">
      <div className="container-ds py-16">
        <ul className="flex flex-wrap gap-x-7 gap-y-3">
          {TOP_LINKS.map((link) => (
            <li key={link}>
              <Link
                href="#"
                className="body-sm text-inverse-ink/80 hover:text-inverse-ink transition-colors"
              >
                {link}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="label-button text-inverse-ink">{column.heading}</p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="body-sm text-inverse-ink/55 hover:text-inverse-ink inline-flex items-center gap-1.5 transition-colors"
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

        <div className="border-inverse-ink/15 mt-14 grid gap-8 border-t pt-12 lg:grid-cols-3 lg:items-start">
          <div>
            <BrandLogo tone="light" className="h-8" />
            <ul className="mt-5 flex gap-2.5">
              {SOCIALS.map((s) => (
                <li key={s}>
                  <Link
                    href="#"
                    aria-label={s}
                    className="caption border-inverse-ink/25 text-inverse-ink/70 hover:border-inverse-ink hover:bg-inverse-ink/10 hover:text-inverse-ink grid size-8 place-items-center rounded-sm border transition-colors"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <p className="subhead text-inverse-ink text-balance">
            One email a month: a route, a place to eat, and something worth
            walking to.
          </p>

          <form
            className="w-full"
            action="#"
            method="post"
            aria-label="Newsletter signup"
          >
            <div className="border-inverse-ink/25 bg-inverse-ink/10 focus-within:border-inverse-ink flex items-center gap-2 rounded-sm border-2 p-1 pl-3">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="you@email.com"
                className="body-sm text-inverse-ink placeholder:text-inverse-ink/45 h-10 min-w-0 flex-1 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="bg-brand text-ink hover:bg-brand-hover grid size-10 shrink-0 place-items-center rounded-sm transition-colors"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
            <p className="caption text-inverse-ink/45 mt-3">
              I confirm that I have read the{" "}
              <Link
                href="#"
                className="text-inverse-ink/70 hover:text-inverse-ink underline underline-offset-2"
              >
                Privacy Policy
              </Link>{" "}
              and agree with it.
            </p>
          </form>
        </div>

        <details className="caption border-inverse-ink/15 text-inverse-ink/45 mt-12 border-t pt-8">
          <summary className="hover:text-inverse-ink cursor-pointer transition-colors">
            Photography credits
          </summary>
          <ul className="mt-4 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {PHOTO_CREDITS.map(([subject, author, license]) => (
              <li key={subject}>
                {subject} — {author},{" "}
                <span className="text-inverse-ink/35">{license}</span>
              </li>
            ))}
          </ul>
          <p className="text-inverse-ink/35 mt-4">
            All photographs via Wikimedia Commons, used under their respective
            licences.
          </p>
        </details>

        <div className="caption border-inverse-ink/15 text-inverse-ink/45 mt-8 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Vamos a NY. Made in Madrid, walked in New York.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL.map((item) => (
              <li key={item}>
                <Link
                  href="#"
                  className="hover:text-inverse-ink transition-colors"
                >
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
