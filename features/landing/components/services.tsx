import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

type Tier = {
  kicker: string;
  title: string;
  /** Texto chico antes del precio ("Desde", "Reservá tu lugar con"). */
  pre?: string;
  price: string;
  per?: string;
  blurb: string;
  features: string[];
  cta: string;
  featured: boolean;
  tag?: string;
};

/* Los botones todavia no tienen destino: los links los define el equipo de contenido. */
const TIERS: Tier[] = [
  {
    kicker: "Asesoramiento",
    title: "Consultoría de viaje",
    price: "USD 150",
    per: "por consultoría",
    blurb:
      "Una hora por videollamada para resolver todas tus dudas y darle forma a tu viaje, con recomendaciones pensadas para tu perfil.",
    features: [
      "Videollamada privada de 1 hora",
      "Idea de itinerario que armamos juntas",
      "Restaurantes, tiendas y atracciones según tu perfil",
      "Mail de seguimiento con links y cómo reservar",
    ],
    cta: "Agendar consultoría",
    featured: false,
  },
  {
    kicker: "A medida",
    title: "Itinerario personalizado",
    pre: "Desde",
    price: "USD 160",
    blurb:
      "Nos conocemos en una reunión virtual, me contás qué te gusta y cómo querés vivir New York, y armo tu viaje día a día.",
    features: [
      "Reunión virtual para conocernos",
      "Itinerario día a día con actividades y tips",
      "Dónde comer según cada día y zona",
      "Guía virtual con el plan de cada jornada",
      "Ayuda con entradas, hotel y traslados",
    ],
    cta: "Quiero mi itinerario",
    featured: true,
    tag: "El más completo",
  },
  {
    kicker: "En grupo",
    title: "Viajes grupales",
    pre: "Reservá tu lugar con",
    price: "USD 300",
    blurb:
      "Viajes temáticos a New York con todo organizado y conmigo acompañándote. Próximas salidas en 2027: fines de abril, principios de septiembre y vacaciones de septiembre.",
    features: [
      "Te acompaño durante todo el viaje",
      "Cada viaje con su propia temática",
      "Para todas las edades, de niños a adultos",
      "Te buscamos compañero de cuarto si querés compartir",
    ],
    cta: "Ver próximas salidas",
    featured: false,
  },
];

export function Services(): JSX.Element {
  return (
    <section id="services" className="container-ds py-16 sm:py-20">
      <SectionHeading
        eyebrow="Servicios"
        title="Tres formas de viajar conmigo"
        description="Elegí cuánta ayuda querés para armar tu viaje: desde una charla para ordenar ideas hasta viajar juntos."
        align="center"
      />

      <ul data-reveal-group className="mt-14 grid gap-4 lg:grid-cols-3">
        {TIERS.map((tier) => (
          <li key={tier.title}>
            <article
              // Design system card (DDR-0011): 2px ink border, 20px radius; the
              // featured one is black, its seal riding on the top border.
              className={cn(
                "border-ink relative flex h-full flex-col rounded-lg border-2 p-7",
                tier.featured ? "theme-ink bg-inverse-canvas" : "bg-canvas",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow">{tier.kicker}</p>
                {tier.tag ? (
                  <span className="font-display bg-brand text-on-brand border-ink absolute -top-3.5 right-6 rounded-full border-2 px-3.5 py-1 text-sm font-bold">
                    {tier.tag}
                  </span>
                ) : null}
              </div>
              <h3 className="card-title text-ink mt-3">{tier.title}</h3>
              <p className="mt-5 flex flex-wrap items-baseline gap-x-2">
                {tier.pre ? (
                  <span className="caption text-ink-tertiary">{tier.pre}</span>
                ) : null}
                <span
                  className={cn(
                    "display-md tabular-nums",
                    tier.featured ? "text-brand" : "text-ink",
                  )}
                >
                  {tier.price}
                </span>
                {tier.per ? (
                  <span className="caption text-ink-tertiary">{tier.per}</span>
                ) : null}
              </p>
              <p className="body-sm text-ink-subtle mt-4">{tier.blurb}</p>

              <ul className="border-hairline mt-6 space-y-2.5 border-t pt-6">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="body-sm text-ink flex items-start gap-2.5"
                  >
                    {/* arbitrary: o "cuadradito amarillo" do sistema tem borda de 1,5px */}
                    <span
                      className="bg-brand border-on-brand mt-1.5 size-2.5 shrink-0 border-[1.5px]"
                      aria-hidden
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                type="button"
                variant={tier.featured ? "primary" : "secondary"}
                className="mt-8 w-full"
              >
                {tier.cta}
              </Button>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
