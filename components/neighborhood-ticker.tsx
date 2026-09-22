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

export function NeighborhoodTicker() {
  return (
    <section className="pb-10 pt-16">
      <div
        className="relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div data-marquee className="marquee-track flex w-max animate-marquee items-center">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {PLACES.map((place) => (
                <span key={place} className="flex items-center">
                  <span className="headline whitespace-nowrap px-7 text-ink">
                    {place}
                  </span>
                  <span className="size-2 shrink-0 rounded-full bg-brand" aria-hidden />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
