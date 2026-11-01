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
    // Black stripe, yellow figures, vertical rules between them (DDR-0011).
    <section className="theme-ink bg-inverse-canvas py-16 sm:py-20">
      <dl
        data-reveal-group
        className="container-ds grid gap-y-12 sm:grid-cols-3"
      >
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="border-hairline flex flex-col gap-2 sm:border-l sm:px-7 sm:first:border-l-0 sm:first:pl-0"
          >
            <dt className="sr-only">{stat.label}</dt>
            {/* arbitrary: escala "Números" do design system, 2,6–4rem (DDR-0011) */}
            <dd
              className="font-display text-brand text-[clamp(2.6rem,5vw,4rem)] leading-none font-bold tabular-nums"
              data-count={stat.count}
              data-prefix={stat.prefix}
              data-suffix={stat.suffix}
            >
              {`${stat.prefix}${stat.count.toLocaleString("es")}${stat.suffix}`}
            </dd>
            <dd className="body-base text-ink-subtle">{stat.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
