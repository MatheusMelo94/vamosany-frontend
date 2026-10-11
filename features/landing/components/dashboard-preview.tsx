import type { JSX } from "react";
import {
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
} from "@/components/ui/icons";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

/* Fictional account state for the preview — nothing here is live. */
const USER = { name: "Sofía", trip: "14 – 19 oct 2026", daysToGo: 23 };

const TILES = [
  {
    label: "Días para el viaje",
    value: "23",
    note: "Tu vuelo llega el 14 de octubre, 07:40.",
    meter: null,
  },
  {
    label: "Días planificados",
    value: "3 de 5",
    note: "Faltan el día 4 y el 5.",
    meter: 60,
  },
  {
    label: "Reservas confirmadas",
    value: "4 de 6",
    note: "Te faltan 2.",
    meter: 67,
  },
  {
    label: "Presupuesto usado",
    value: "USD 1.240",
    note: "de USD 2.000 previstos.",
    meter: 62,
  },
];

const TODAY = [
  ["07:10", "Cruce del puente, de Manhattan a Brooklyn", "40 min"],
  ["08:15", "Desayuno en Dumbo", "45 min"],
  ["10:30", "Brooklyn Heights Promenade", "30 min"],
  ["13:00", "Ferry de vuelta a Wall Street", "25 min"],
];

const OWNED = [
  {
    title: "Íconos y barrios",
    meta: "5 días · actualizado el 12 sep",
    state: "Descargado",
    done: true,
  },
  {
    title: "Comé de punta a punta",
    meta: "4 días · actualizado el 3 sep",
    state: "Actualización disponible",
    done: false,
  },
];

const BOOKINGS = [
  { what: "The Met — entrada con horario", when: "Día 3, 09:30", done: true },
  { what: "Entradas rush de Broadway", when: "Día 3, noche", done: true },
  { what: "Top of the Rock", when: "Día 5, 17:00 · se agota", done: false },
  { what: "Pase diario de NYC Ferry", when: "Día 2", done: false },
];

const NAV = [
  {
    heading: "Viaje",
    items: [
      { Icon: GridIcon, label: "Resumen", active: true },
      { Icon: DocIcon, label: "Mis itinerarios" },
      { Icon: LaptopIcon, label: "Plan por día" },
      { Icon: GlobeIcon, label: "Mapa" },
      { Icon: CardIcon, label: "Reservas", badge: "2 pendientes" },
      { Icon: CircleTargetIcon, label: "Presupuesto" },
    ],
  },
  {
    heading: "Belén",
    items: [{ Icon: SparkleIcon, label: "Preguntale a Belén" }],
  },
  {
    heading: "Cuenta",
    items: [{ Icon: ShieldIcon, label: "Configuración" }],
  },
];

type MeterProps = { value: number };

function Meter({ value }: MeterProps) {
  return (
    <div
      className="bg-surface-2 mt-3 h-1.5 w-full rounded-full"
      role="presentation"
    >
      <div
        className="bg-brand h-full rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

type StatusPillProps = { done: boolean; label: string };

function StatusPill({ done, label }: StatusPillProps) {
  return (
    <span className="caption border-hairline bg-canvas text-ink inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 whitespace-nowrap">
      <span
        className={cn(
          "grid size-3.5 place-items-center rounded-full",
          done
            ? "bg-brand text-ink"
            : "border-hairline-strong border text-transparent",
        )}
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
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full"
      role="img"
      aria-label="Bosquejo del recorrido del día en el mapa"
    >
      <rect width="100" height="100" fill="var(--color-canvas)" />
      {Array.from({ length: 9 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={10 + i * 10}
          y1="0"
          x2={10 + i * 10}
          y2="100"
          stroke="var(--color-hairline)"
          strokeWidth="0.8"
        />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <line
          key={`h${i}`}
          x1="0"
          y1={10 + i * 10}
          x2="100"
          y2={10 + i * 10}
          stroke="var(--color-hairline)"
          strokeWidth="0.8"
        />
      ))}
      <path
        d="M0 82 Q 30 90 100 78"
        fill="none"
        stroke="var(--color-map-water)"
        strokeWidth="5"
      />
      <polyline
        points="38,74 52,58 61,44 70,30"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="1.4"
        strokeDasharray="2.5 2"
        strokeLinecap="round"
      />
      {pins.map(([x, y], i) => (
        <g key={i}>
          <circle
            cx={x}
            cy={y}
            r="4.2"
            fill="var(--color-brand)"
            stroke="var(--color-ink)"
            strokeWidth="1.2"
          />
          <text
            x={x}
            y={y + 1.6}
            textAnchor="middle"
            fontSize="4.2"
            fontFamily="var(--font-display)"
            fontWeight="700"
            fill="var(--color-ink)"
          >
            {i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function DashboardPreview(): JSX.Element {
  return (
    <section
      id="dashboard"
      className="bg-surface-2 min-h-screen px-4 py-14 sm:px-8 sm:py-20 lg:px-14"
    >
      {/* Call to action above the app window */}
      <div className="mx-auto mb-10 flex max-w-3xl flex-col items-center text-center sm:mb-14">
        <SectionHeading
          eyebrow="Tu viaje, en un solo lugar"
          title="Tu próximo viaje a New York empieza acá"
          description="Armá tu viaje conmigo o sumate a la newsletter para recibir piques, lugares que vale la pena conocer y ser la primera en enterarte de los próximos viajes acompañados y lanzamientos."
          align="center"
          highlight
        />
        <div data-reveal className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="#services" size="lg">
            Armá tu viaje
          </Button>
          <Button href="#how" variant="secondary" size="lg">
            Ver viajes acompañados
          </Button>
        </div>
      </div>

      {/* The app window sits inside the tinted section with breathing room on
          every side; the section itself still fills the viewport, so nothing
          reads as empty while it scrolls. */}
      {/* arbitrary: painel ocupa a viewport menos o padding do palco; varia por breakpoint */}
      <div
        data-reveal
        className="border-hairline bg-canvas max-w-dashboard shadow-panel mx-auto flex min-h-[calc(100vh-3rem)] w-full flex-col overflow-hidden rounded-xl border sm:min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-7rem)]"
        aria-label="Vista previa del panel del viajero"
      >
        <div className="border-hairline bg-surface-1 flex items-center gap-2 border-b px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="border-hairline-strong size-2.5 rounded-full border"
              />
            ))}
          </span>
          <span className="caption text-ink-tertiary ml-2">
            vamosany.com/cuenta
          </span>
        </div>

        {/* arbitrary: sidebar fixa de 240px + conteudo fluido */}
        <div className="grid flex-1 md:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="border-hairline bg-surface-1 hidden flex-col border-r p-5 md:flex">
            <div className="flex items-center justify-between px-1">
              <BrandLogo className="h-6" />
              <span className="caption border-hairline bg-canvas text-ink-subtle rounded-sm border px-1.5 py-0.5">
                Beta
              </span>
            </div>

            <nav className="mt-7 flex-1 space-y-6" aria-label="Menú del panel">
              {NAV.map((group) => (
                <div key={group.heading}>
                  <p className="eyebrow px-2">{group.heading}</p>
                  <ul className="mt-2 space-y-0.5">
                    {group.items.map((item) => (
                      <li key={item.label}>
                        <span
                          className={cn(
                            "body-sm flex items-center gap-2.5 rounded-sm px-2 py-1.5",
                            item.active
                              ? "bg-canvas text-ink shadow-inset-hairline font-semibold"
                              : "text-ink-subtle",
                          )}
                        >
                          <item.Icon className="size-4 shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {item.badge ? (
                            <span className="caption bg-brand text-ink rounded-sm px-1.5 py-0.5 font-semibold">
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

            <div className="border-hairline bg-canvas mt-6 rounded-sm border p-3">
              <p className="caption text-ink-tertiary">Próximo viaje</p>
              <p className="body-sm text-ink mt-1 font-semibold">New York</p>
              <p className="caption text-ink-subtle">{USER.trip}</p>
            </div>
            <div className="mt-3 flex items-center gap-2.5 px-1">
              <span className="bg-brand font-display text-ink grid size-8 place-items-center rounded-full text-xs font-bold">
                S
              </span>
              <div className="min-w-0">
                <p className="body-sm text-ink truncate font-semibold">
                  {USER.name} Ibáñez
                </p>
                <p className="caption text-ink-tertiary truncate">
                  sofia@email.com
                </p>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="min-w-0 p-5 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Resumen</p>
                <h3 className="headline text-ink mt-2">
                  ¡Buen día, {USER.name}!
                </h3>
              </div>
              <span className="label-button bg-brand text-ink rounded-sm px-3 py-2">
                Faltan {USER.daysToGo} días para New York
              </span>
            </div>

            {/* KPI row */}
            <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TILES.map((tile) => (
                <div
                  key={tile.label}
                  className="border-hairline bg-surface-1 rounded-lg border p-4"
                >
                  <dt className="caption text-ink-subtle">{tile.label}</dt>
                  <dd className="display-md text-ink mt-1">{tile.value}</dd>
                  <dd className="caption text-ink-tertiary mt-1">
                    {tile.note}
                  </dd>
                  {tile.meter !== null ? (
                    <dd>
                      <Meter value={tile.meter} />
                    </dd>
                  ) : null}
                </div>
              ))}
            </dl>

            {/* arbitrary: proporcao 1.3:1 entre plano do dia e mapa */}
            <div className="mt-6 grid gap-3 lg:grid-cols-[1.3fr_1fr]">
              {/* Today's plan */}
              <div className="border-hairline rounded-lg border p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="caption text-ink-subtle">Día 2 · Martes</p>
                    <p className="card-title text-ink mt-1">
                      Brooklyn Bridge antes que la multitud
                    </p>
                  </div>
                  <span className="caption border-hairline text-ink-subtle shrink-0 rounded-sm border px-2 py-0.5">
                    4 paradas · 6,1 km
                  </span>
                </div>
                <ol className="border-hairline mt-4 border-t">
                  {TODAY.map(([time, what, howLong]) => (
                    // arbitrary: coluna de horario fixa + texto + acao
                    <li
                      key={time}
                      className="border-hairline grid grid-cols-[3.5rem_1fr_auto] items-baseline gap-3 border-b py-2.5"
                    >
                      <span className="caption text-ink-tertiary font-mono">
                        {time}
                      </span>
                      <span className="body-sm text-ink">{what}</span>
                      <span className="caption text-ink-tertiary">
                        {howLong}
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="caption text-ink-tertiary mt-3">
                  Mañana llueve: la versión bajo techo del día 3 ya está lista.
                </p>
              </div>

              {/* Map */}
              <div className="border-hairline overflow-hidden rounded-lg border">
                <div className="border-hairline flex items-center justify-between border-b px-4 py-2.5">
                  <span className="body-sm text-ink font-semibold">
                    Mapa del recorrido
                  </span>
                  <span className="caption text-ink-subtle inline-flex items-center gap-1.5">
                    <span
                      className="bg-brand size-1.5 rounded-full"
                      aria-hidden
                    />
                    Copia sin conexión guardada
                  </span>
                </div>
                <div className="aspect-4/3">
                  <MapSketch />
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {/* Owned itineraries */}
              <div className="border-hairline rounded-lg border p-4 sm:p-5">
                <p className="body-sm text-ink font-semibold">
                  Mis itinerarios
                </p>
                <ul className="divide-hairline mt-3 divide-y">
                  {OWNED.map((it) => (
                    <li
                      key={it.title}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <CountryTag code="NY" />
                        <div className="min-w-0">
                          <p className="body-sm text-ink truncate font-semibold">
                            {it.title}
                          </p>
                          <p className="caption text-ink-tertiary">{it.meta}</p>
                        </div>
                      </div>
                      <StatusPill done={it.done} label={it.state} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* To book */}
              <div className="border-hairline rounded-lg border p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <p className="body-sm text-ink font-semibold">
                    Reservar con tiempo
                  </p>
                  <span className="caption text-ink-tertiary">Faltan 2</span>
                </div>
                <ul className="divide-hairline mt-3 divide-y">
                  {BOOKINGS.map((bk) => (
                    <li
                      key={bk.what}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "body-sm truncate",
                            bk.done
                              ? "text-ink-subtle line-through"
                              : "text-ink font-semibold",
                          )}
                        >
                          {bk.what}
                        </p>
                        <p className="caption text-ink-tertiary">{bk.when}</p>
                      </div>
                      <StatusPill
                        done={bk.done}
                        label={bk.done ? "Reservado" : "Pendiente"}
                      />
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
