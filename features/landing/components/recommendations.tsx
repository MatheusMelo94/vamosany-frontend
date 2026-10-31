"use client";

import type { JSX, KeyboardEvent } from "react";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

type Pick = {
  kicker: string;
  title: string;
  blurb: string;
  /** Opinion de Belen, entre comillas. */
  quote?: string;
  /** Codigo de descuento; se muestra en un recuadro punteado. */
  code?: string;
  cta: string;
};

type Tab = { id: string; label: string; picks: Pick[] };

/* Contenido provisorio: los textos entre corchetes, los codigos y los links
   los completa el equipo de contenido (DDR-0008). Los botones no tienen destino. */
const TABS: Tab[] = [
  {
    id: "pases",
    label: "Pases y atracciones",
    picks: [
      {
        kicker: "Pase de atracciones",
        title: "[Nombre del pase]",
        blurb:
          "[Una o dos líneas sobre por qué lo recomendás y para quién conviene]",
        code: "[Código]",
        cta: "Usar mi código",
      },
      {
        kicker: "Museo",
        title: "[Nombre del museo]",
        blurb: "[Por qué vale la pena y cómo conviene sacar la entrada]",
        cta: "Comprar entradas",
      },
      {
        kicker: "Mirador",
        title: "[Nombre del mirador]",
        blurb: "[Qué lo hace especial y a qué hora conviene ir]",
        cta: "Comprar entradas",
      },
    ],
  },
  {
    id: "broadway",
    label: "Broadway",
    picks: [
      {
        kicker: "Entradas",
        title: "[Dónde comprar entradas]",
        blurb: "[Por qué conviene comprar acá y cuándo hacerlo]",
        cta: "Comprar entradas",
      },
      {
        kicker: "Entradas",
        title: "[Otra opción para comprar]",
        blurb: "[Para quién conviene esta opción]",
        cta: "Comprar entradas",
      },
    ],
  },
  {
    id: "internet",
    label: "Internet",
    picks: [
      {
        kicker: "eSIM",
        title: "Holafly",
        blurb: "eSIM con datos ilimitados.",
        quote:
          "La uso en cada viaje para tener internet desde que aterrizo, sin cambiar de chip ni buscar wifi.",
        code: "[Tu código]",
        cta: "Usar mi código",
      },
    ],
  },
];

export function Recommendations(): JSX.Element {
  const [active, setActive] = useState(TABS[0].id);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  /* Tabs WAI-ARIA: flechas, Inicio y Fin mueven el foco y activan la pestaña. */
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = TABS.length - 1;
    const next =
      e.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : e.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    setActive(TABS[next].id);
    tabs.current[next]?.focus();
  };

  return (
    <section id="recomendados" className="container-ds py-16 sm:py-20">
      <SectionHeading
        eyebrow="Mis recomendados"
        title="Lo que no puede faltar en tu viaje"
        description="Después de más de 20 visitas, estas son las cosas que uso y recomiendo de verdad. Algunas tienen descuento con mi código."
        align="center"
        highlight
      />

      <div
        role="tablist"
        aria-label="Categorías de recomendados"
        className="border-ink mx-auto mt-10 flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-sm border-2 p-1"
      >
        {TABS.map((t, i) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              id={`${base}-tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${base}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "label-button rounded-xs px-3.5 py-2 transition-colors duration-(--duration-base) ease-(--ease-default)",
                selected
                  ? "bg-brand text-ink"
                  : "text-ink-subtle hover:text-ink",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        id={`${base}-panel`}
        role="tabpanel"
        aria-labelledby={`${base}-tab-${tab.id}`}
        /* El panel persiste entre pestañas: se revela una vez, entero. Un
           data-reveal-group en la lista dejaria ocultas las tarjetas que
           aparecen despues de cambiar de pestaña (RV-0024). */
        data-reveal
        className="mt-12"
      >
        <ul className="grid gap-4 md:grid-cols-3">
          {tab.picks.map((pick) => (
            <li key={pick.title}>
              <article className="border-hairline bg-surface-1 flex h-full flex-col rounded-lg border p-6">
                <p className="eyebrow">{pick.kicker}</p>
                <h3 className="card-title text-ink mt-3">{pick.title}</h3>
                <p className="body-sm text-ink-subtle mt-3">{pick.blurb}</p>
                {pick.quote ? (
                  <blockquote className="body-sm text-ink mt-3 text-pretty">
                    “{pick.quote}”
                  </blockquote>
                ) : null}
                <div className="mt-auto pt-6">
                  {pick.code ? (
                    <p className="border-ink mb-3 flex items-center justify-between gap-3 rounded-sm border-2 border-dashed px-3 py-2">
                      <span className="caption text-ink-subtle">Mi código</span>
                      <span className="label-button text-ink">{pick.code}</span>
                    </p>
                  ) : null}
                  <Button type="button" variant="secondary" className="w-full">
                    {pick.cta}
                  </Button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-12 max-w-2xl text-center">
        <p className="body-sm text-ink">
          ¿Necesitás algo más que no está en la lista? Escribime a{" "}
          <a
            href="mailto:hola@vamosany.com"
            className="font-semibold underline underline-offset-4"
          >
            hola@vamosany.com
          </a>
          .
        </p>
        <p className="caption text-ink-subtle mt-3 text-pretty">
          Algunos de estos links son de afiliados: si comprás a través de ellos,
          recibo una pequeña comisión sin costo extra para vos. Solo recomiendo
          lo que uso y me gusta.
        </p>
      </div>
    </section>
  );
}
