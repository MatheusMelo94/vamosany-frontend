import type { JSX } from "react";
const STATS = [
  {
    count: 200,
    prefix: "+",
    suffix: "",
    label: "viajeros ya confiaron en mí",
  },
  { count: 20, prefix: "+", suffix: "", label: "viajes a NYC" },
  {
    count: 1000,
    prefix: "+",
    suffix: " km",
    label: "caminados por la ciudad",
  },
];

export function Stats(): JSX.Element {
  return (
    <section className="border-ink border-y-2 py-16">
      <dl
        data-reveal-group
        className="container-ds grid gap-x-6 gap-y-12 sm:grid-cols-3"
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-2">
            <dt className="sr-only">{stat.label}</dt>
            <dd
              className="display-md text-ink tabular-nums"
              data-count={stat.count}
              data-prefix={stat.prefix}
              data-suffix={stat.suffix}
            >
              {`${stat.prefix}${stat.count.toLocaleString("es")}${stat.suffix}`}
            </dd>
            <dd className="body-sm text-ink-subtle">{stat.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
