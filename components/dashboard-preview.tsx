import {
  BuildingIcon,
  CardIcon,
  CheckIcon,
  CircleTargetIcon,
  CountryTag,
  DocIcon,
  GlobeIcon,
  GridIcon,
  LaptopIcon,
  ShieldIcon,
  SparkleIcon,
} from "./icons";
import { BrandLogo, Button, SectionHeading } from "./ui";

/* Fictional account state for the preview — nothing here is live. */
const USER = { name: "Marta", trip: "14 – 19 Oct 2026", daysToGo: 23 };

const TILES = [
  { label: "Days to go", value: "23", note: "Flight lands 14 Oct, 07:40", meter: null },
  { label: "Days planned", value: "3 of 5", note: "Day 4 and 5 still open", meter: 60 },
  { label: "Bookings confirmed", value: "4 of 6", note: "Two still to book", meter: 67 },
  { label: "Budget used", value: "€1,240", note: "of €2,000 planned", meter: 62 },
];

const TODAY = [
  ["07:10", "Bridge crossing, Manhattan → Brooklyn", "40 min"],
  ["08:15", "Breakfast in Dumbo", "45 min"],
  ["10:30", "Brooklyn Heights Promenade", "30 min"],
  ["13:00", "Ferry back to Wall Street", "25 min"],
];

const OWNED = [
  { title: "Icons & Neighbourhoods", meta: "5 days · updated 12 Sep", state: "Downloaded", done: true },
  { title: "Eat Your Way Down", meta: "4 days · updated 3 Sep", state: "Update available", done: false },
];

const BOOKINGS = [
  { what: "The Met — timed entry", when: "Day 3, 09:30", done: true },
  { what: "Broadway rush tickets", when: "Day 3, evening", done: true },
  { what: "Top of the Rock", when: "Day 5, 17:00 · sells out", done: false },
  { what: "NYC Ferry day pass", when: "Day 2", done: false },
];

const NAV = [
  {
    heading: "Trip",
    items: [
      { Icon: GridIcon, label: "Overview", active: true },
      { Icon: DocIcon, label: "My itineraries", badge: "2" },
      { Icon: LaptopIcon, label: "Day plans" },
      { Icon: GlobeIcon, label: "Map" },
      { Icon: CardIcon, label: "Bookings", badge: "2 left" },
      { Icon: CircleTargetIcon, label: "Budget" },
    ],
  },
  {
    heading: "Belén",
    items: [
      { Icon: SparkleIcon, label: "Ask Belén" },
      { Icon: BuildingIcon, label: "Walk with Belén" },
    ],
  },
  {
    heading: "Account",
    items: [
      { Icon: ShieldIcon, label: "Settings" },
      { Icon: DocIcon, label: "Receipts" },
    ],
  },
];

function Meter({ value }: { value: number }) {
  return (
    <div className="mt-3 h-1.5 w-full rounded-full bg-surface-2" role="presentation">
      <div className="h-full rounded-full bg-brand" style={{ width: `${value}%` }} />
    </div>
  );
}

function StatusPill({ done, label }: { done: boolean; label: string }) {
  return (
    <span className="caption inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border border-hairline bg-canvas px-2 py-0.5 text-ink">
      <span
        className={`grid size-3.5 place-items-center rounded-full ${
          done ? "bg-brand text-ink" : "border border-hairline-strong text-transparent"
        }`}
        aria-hidden
      >
        <CheckIcon className="size-2.5" />
      </span>
      {label}
    </span>
  );
}

/* An abstract Manhattan grid with the day's route and pins — a stand-in for the live map. */
function MapSketch() {
  const pins = [
    [38, 74],
    [52, 58],
    [61, 44],
    [70, 30],
    [46, 22],
  ];
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="Sketch of the day's route across the map">
      <rect width="100" height="100" fill="#fff" />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`v${i}`} x1={10 + i * 10} y1="0" x2={10 + i * 10} y2="100" stroke="#eeeeea" strokeWidth="0.8" />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={10 + i * 10} x2="100" y2={10 + i * 10} stroke="#eeeeea" strokeWidth="0.8" />
      ))}
      <path d="M0 82 Q 30 90 100 78" fill="none" stroke="#e1e6ea" strokeWidth="5" />
      <polyline points="38,74 52,58 61,44 70,30" fill="none" stroke="#080a0b" strokeWidth="1.4" strokeDasharray="2.5 2" strokeLinecap="round" />
      {pins.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4.2" fill="#ffd800" stroke="#080a0b" strokeWidth="1.2" />
          <text x={x} y={y + 1.6} textAnchor="middle" fontSize="4.2" fontFamily="var(--font-display)" fontWeight="700" fill="#080a0b">
            {i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function DashboardPreview() {
  return (
    <section id="dashboard" className="min-h-screen bg-surface-2 px-4 py-14 sm:px-8 sm:py-20 lg:px-14">
      {/* Call to action above the app window */}
      <div className="mx-auto mb-10 flex max-w-3xl flex-col items-center text-center sm:mb-14">
        <SectionHeading
          eyebrow="Your trip, in one place"
          title="Plan it once. Carry it everywhere."
          description="Every itinerary you buy lands in your dashboard: the countdown, each day's route, what still needs booking and the map that works offline. This is what it looks like."
          align="center"
          highlight
        />
        <div data-reveal className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="#services" size="lg">
            Get your itinerary
          </Button>
          <Button href="#how" variant="secondary" size="lg">
            See how it works
          </Button>
        </div>
      </div>

      {/* The app window sits inside the tinted section with breathing room on
          every side; the section itself still fills the viewport, so nothing
          reads as empty while it scrolls. */}
      <div
        data-reveal
        className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[1400px] flex-col overflow-hidden rounded-xl border border-hairline bg-canvas shadow-[0_24px_60px_rgba(0,0,0,0.08)] sm:min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-7rem)]"
        aria-label="Preview of the traveller dashboard"
      >
        <div className="flex items-center gap-2 border-b border-hairline bg-surface-1 px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-2.5 rounded-full border border-hairline-strong" />
            ))}
          </span>
          <span className="caption ml-2 text-ink-tertiary">vamosany.com/account</span>
        </div>

        <div className="grid flex-1 md:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="hidden flex-col border-r border-hairline bg-surface-1 p-5 md:flex">
            <div className="flex items-center justify-between px-1">
              <BrandLogo className="h-6" />
              <span className="caption rounded-sm border border-hairline bg-canvas px-1.5 py-0.5 text-ink-subtle">
                Beta
              </span>
            </div>

            <nav className="mt-7 flex-1 space-y-6" aria-label="Dashboard menu">
              {NAV.map((group) => (
                <div key={group.heading}>
                  <p className="eyebrow px-2">{group.heading}</p>
                  <ul className="mt-2 space-y-0.5">
                    {group.items.map((item) => (
                      <li key={item.label}>
                        <span
                          className={`body-sm flex items-center gap-2.5 rounded-sm px-2 py-1.5 ${
                            item.active
                              ? "bg-canvas font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-hairline)]"
                              : "text-ink-subtle"
                          }`}
                        >
                          <item.Icon className="size-4 shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {item.badge ? (
                            <span className="caption rounded-sm bg-brand px-1.5 py-0.5 font-semibold text-ink">
                              {item.badge}
                            </span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            <div className="mt-6 rounded-sm border border-hairline bg-canvas p-3">
              <p className="caption text-ink-tertiary">Next trip</p>
              <p className="body-sm mt-1 font-semibold text-ink">New York</p>
              <p className="caption text-ink-subtle">{USER.trip}</p>
            </div>
            <div className="mt-3 flex items-center gap-2.5 px-1">
              <span className="grid size-8 place-items-center rounded-full bg-brand font-display text-xs font-bold text-ink">
                M
              </span>
              <div className="min-w-0">
                <p className="body-sm truncate font-semibold text-ink">{USER.name} Ibáñez</p>
                <p className="caption truncate text-ink-tertiary">marta@email.com</p>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="min-w-0 p-5 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Overview</p>
                <h3 className="headline mt-2 text-ink">Good morning, {USER.name}.</h3>
              </div>
              <span className="label-button rounded-sm bg-brand px-3 py-2 text-ink">
                {USER.daysToGo} days to New York
              </span>
            </div>

            {/* KPI row */}
            <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TILES.map((tile) => (
                <div key={tile.label} className="rounded-lg border border-hairline bg-surface-1 p-4">
                  <dt className="caption text-ink-subtle">{tile.label}</dt>
                  <dd className="display-md mt-1 text-ink">{tile.value}</dd>
                  <dd className="caption mt-1 text-ink-tertiary">{tile.note}</dd>
                  {tile.meter !== null ? (
                    <dd>
                      <Meter value={tile.meter} />
                    </dd>
                  ) : null}
                </div>
              ))}
            </dl>

            <div className="mt-6 grid gap-3 lg:grid-cols-[1.3fr_1fr]">
              {/* Today's plan */}
              <div className="rounded-lg border border-hairline p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="caption text-ink-subtle">Day 2 · Tuesday</p>
                    <p className="card-title mt-1 text-ink">Brooklyn Bridge before the crowds</p>
                  </div>
                  <span className="caption shrink-0 rounded-sm border border-hairline px-2 py-0.5 text-ink-subtle">
                    4 stops · 6.1 km
                  </span>
                </div>
                <ol className="mt-4 border-t border-hairline">
                  {TODAY.map(([time, what, howLong]) => (
                    <li
                      key={time}
                      className="grid grid-cols-[3.5rem_1fr_auto] items-baseline gap-3 border-b border-hairline py-2.5"
                    >
                      <span className="caption font-mono text-ink-tertiary">{time}</span>
                      <span className="body-sm text-ink">{what}</span>
                      <span className="caption text-ink-tertiary">{howLong}</span>
                    </li>
                  ))}
                </ol>
                <p className="caption mt-3 text-ink-tertiary">
                  Rain tomorrow — the indoor version of Day 3 is ready.
                </p>
              </div>

              {/* Map */}
              <div className="overflow-hidden rounded-lg border border-hairline">
                <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
                  <span className="body-sm font-semibold text-ink">Route map</span>
                  <span className="caption inline-flex items-center gap-1.5 text-ink-subtle">
                    <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                    Offline copy saved
                  </span>
                </div>
                <div className="aspect-[4/3]">
                  <MapSketch />
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {/* Owned itineraries */}
              <div className="rounded-lg border border-hairline p-4 sm:p-5">
                <p className="body-sm font-semibold text-ink">My itineraries</p>
                <ul className="mt-3 divide-y divide-hairline">
                  {OWNED.map((it) => (
                    <li key={it.title} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <CountryTag code="NY" />
                        <div className="min-w-0">
                          <p className="body-sm truncate font-semibold text-ink">{it.title}</p>
                          <p className="caption text-ink-tertiary">{it.meta}</p>
                        </div>
                      </div>
                      <StatusPill done={it.done} label={it.state} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* To book */}
              <div className="rounded-lg border border-hairline p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <p className="body-sm font-semibold text-ink">Book ahead</p>
                  <span className="caption text-ink-tertiary">2 left</span>
                </div>
                <ul className="mt-3 divide-y divide-hairline">
                  {BOOKINGS.map((bk) => (
                    <li key={bk.what} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className={`body-sm truncate ${bk.done ? "text-ink-subtle line-through" : "font-semibold text-ink"}`}>
                          {bk.what}
                        </p>
                        <p className="caption text-ink-tertiary">{bk.when}</p>
                      </div>
                      <StatusPill done={bk.done} label={bk.done ? "Booked" : "To do"} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
