"use client";

import type { JSX } from "react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DAYS = [
  {
    id: "Day 1",
    title: "Land, drop bags, walk downtown",
    blurb:
      "A deliberately soft first day. Nothing ticketed, nothing far, everything walkable while the jet lag wears off.",
    img: "/img/trip-soho.webp",
    alt: "A SoHo street of cast-iron buildings",
    stops: [
      ["14:00", "Drop bags, walk to Washington Square", "20 min"],
      ["15:30", "SoHo and Prince Street on foot", "1 hr"],
      ["17:00", "Early slice at Prince St Pizza", "30 min"],
      ["19:00", "Sunset from the Manhattan Bridge walkway", "45 min"],
    ],
  },
  {
    id: "Day 2",
    title: "Brooklyn Bridge before the crowds",
    blurb:
      "Out the door at seven. You get the bridge almost to yourself, then Dumbo for breakfast while everyone else is queueing.",
    img: "/img/trip-central-park.webp",
    alt: "Central Park in autumn",
    stops: [
      ["07:10", "Bridge crossing, Manhattan → Brooklyn", "40 min"],
      ["08:15", "Breakfast in Dumbo", "45 min"],
      ["10:30", "Brooklyn Heights Promenade", "30 min"],
      ["13:00", "Ferry back to Wall Street", "25 min"],
    ],
  },
  {
    id: "Day 3",
    title: "Uptown, museums and the park",
    blurb:
      "The one day you book ahead. Timed museum entry, then the park on foot from the top down as the light drops.",
    img: "/img/trip-grand-central.webp",
    alt: "The concourse at Grand Central Terminal",
    stops: [
      ["09:30", "The Met — timed entry", "2.5 hrs"],
      ["12:30", "Lunch on Lexington", "1 hr"],
      ["14:00", "Central Park, Bethesda to the Ramble", "2 hrs"],
      ["17:30", "Grand Central at rush hour", "30 min"],
    ],
  },
  {
    id: "Day 4",
    title: "Eat across Chinatown",
    blurb:
      "Built around opening hours rather than a map. Five small plates across nine blocks, with the queues timed in.",
    img: "/img/trip-chinatown.webp",
    alt: "Shopfronts on a Chinatown street",
    stops: [
      ["11:00", "Soup dumplings, Mott Street", "45 min"],
      ["12:30", "Bakery stop, Bayard", "20 min"],
      ["14:00", "Little Italy on the way north", "1 hr"],
      ["18:00", "Lower East Side, last light", "1.5 hrs"],
    ],
  },
  {
    id: "Day 5",
    title: "High Line, Chelsea, then home",
    blurb:
      "A flexible last day sized to your flight. Everything on the route is within twenty minutes of a direct airport link.",
    img: "/img/trip-high-line.webp",
    alt: "Rooftops seen from the High Line",
    stops: [
      ["10:00", "High Line, Gansevoort to 30th", "1 hr"],
      ["11:30", "Chelsea Market", "1 hr"],
      ["13:30", "Hudson Yards or Little Island", "1 hr"],
      ["16:00", "Airport link from Penn", "1 hr"],
    ],
  },
];

export function SampleDay(): JSX.Element {
  const [active, setActive] = useState(DAYS[1].id);
  const day = DAYS.find((d) => d.id === active)!;

  return (
    <section className="border-ink border-y-2 py-16 sm:py-20">
      <div className="container-ds">
        <div
          data-heading-block
          className="flex flex-col items-center gap-4 text-center"
        >
          <span data-heading-eyebrow className="eyebrow">
            A look inside
          </span>
          <h2 data-split-lines className="display-lg text-ink text-balance">
            This is what a day looks like
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="Sample days"
          className="border-ink mx-auto mt-10 flex w-fit max-w-full [scrollbar-width:none] gap-1 overflow-x-auto rounded-sm border-2 p-1 [&::-webkit-scrollbar]:hidden"
        >
          {DAYS.map((d) => (
            <button
              key={d.id}
              role="tab"
              type="button"
              aria-selected={d.id === active}
              onClick={() => setActive(d.id)}
              className={cn(
                "label-button shrink-0 rounded-xs px-4 py-2 transition-colors",
                d.id === active
                  ? "bg-brand text-ink"
                  : "text-ink-subtle hover:text-ink",
              )}
            >
              {d.id}
            </button>
          ))}
        </div>

        <div data-reveal className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col justify-center">
            <h3 className="headline text-ink text-balance">{day.title}</h3>
            <p className="body-base text-ink-subtle mt-4">{day.blurb}</p>

            <ol className="border-hairline mt-8 border-t">
              {day.stops.map(([time, what, howLong]) => (
                <li
                  key={time}
                  className="border-hairline grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-4 border-b py-3.5"
                >
                  <span className="caption text-ink-tertiary font-mono">
                    {time}
                  </span>
                  <span className="body-sm text-ink">{what}</span>
                  <span className="caption text-ink-tertiary">{howLong}</span>
                </li>
              ))}
            </ol>

            <Button href="#services" className="mt-8 w-fit">
              Get the full plan
            </Button>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-lg lg:aspect-auto lg:min-h-[28rem]">
            <Image
              key={day.img}
              src={day.img}
              alt={day.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
