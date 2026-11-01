import type { JSX } from "react";
const PLACES = [
  "Lower East Side",
  "Williamsburg",
  "Harlem",
  "SoHo",
  "Chinatown",
  "Dumbo",
  "West Village",
  "Astoria",
  "Bushwick",
  "Upper West Side",
  "Bed-Stuy",
  "Koreatown",
];

export function NeighborhoodTicker(): JSX.Element {
  return (
    // Yellow neighbourhood band with hearts (DDR-0011); the marquee is untouched.
    <section className="bg-brand border-ink border-y-2 py-4">
      <div
        className="relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div
          data-marquee
          className="marquee-track animate-marquee flex w-max items-center"
        >
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex shrink-0 items-center"
              aria-hidden={copy === 1}
            >
              {PLACES.map((place) => (
                <span key={place} className="flex items-center">
                  <span className="headline text-on-brand px-7 whitespace-nowrap uppercase">
                    {place}
                  </span>
                  <span className="text-on-brand shrink-0 text-sm" aria-hidden>
                    ♥
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
