const STATS = [
  { count: 24000, suffix: "", label: "itineraries downloaded" },
  { count: 91, suffix: "", label: "neighbourhoods walked" },
  { count: 4, suffix: ".9", label: "average rating, 1,200 reviews", raw: "4.9" },
  { count: 14, suffix: "-day", label: "refund, no questions asked" },
];

export function Stats() {
  return (
    <section className="border-y-2 border-ink py-16">
      <dl
        data-reveal-group
        className="container-ds grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4"
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-2">
            <dt className="sr-only">{stat.label}</dt>
            <dd
              className="display-md text-ink tabular-nums"
              {...(stat.raw
                ? {}
                : { "data-count": stat.count, "data-prefix": "", "data-suffix": stat.suffix })}
            >
              {stat.raw ?? `${stat.count.toLocaleString("en-US")}${stat.suffix}`}
            </dd>
            <dd className="body-sm text-ink-subtle">{stat.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
