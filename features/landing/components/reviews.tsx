"use client";

import type { JSX } from "react";
import { useRef } from "react";
import { ArrowRight } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

/* Reseñas reales de viajeros, del brief de contenido (oct 2026). */
const REVIEWS = [
  {
    quote:
      "¡Todo fue magnífico! Belén es increíble, está en todo. Es súper atenta y siempre está para responder nuestras preguntas. Paseamos por todos lados, conocimos muchísimo y Belén es la mejor guía lejos. ¡Volveré seguro!",
    person: "Viajero anónimo",
    service: "Viaje grupal",
    date: "setiembre 2025",
  },
  {
    quote:
      "Belén fue nuestra mejor guía en New York. Conoce la ciudad y sus lugares de interés en detalle. Excelente trato, responsable y con capacidad para manejar un grupo de distintas edades e intereses.",
    person: "Viajero anónimo",
    service: "Viaje grupal",
    date: "setiembre 2025",
  },
  {
    quote:
      "Era nuestra primera vez en la ciudad y nos sentimos acompañados cada día. La guía de horarios y los consejos para comer en cada zona fueron excelentes, y aun así tuvimos libertad para mover días por el clima. Solo nos quedaba disfrutar. ¡Belu, fuiste una integrante más en nuestro family trip!",
    person: "Leticia",
    service: "Itinerario personalizado",
    date: "julio 2026",
  },
  {
    quote:
      "Tenía todo organizado por zonas, ¡hasta planes para días de lluvia! Los paseos y los horarios cuadraban de tal forma que todo quedó increíble. Deseo que toda persona que vaya a New York lo organice con la uruguaya más neoyorquina que conozco: ¡Belu!",
    person: "Laura P.",
    service: "Itinerario personalizado",
    date: "octubre 2025",
  },
  {
    quote:
      "El itinerario fue completísimo: cómo llegar, qué transporte elegir y dónde almorzar o cenar cerca de cada lugar. Superó ampliamente nuestras expectativas.",
    person: "Tabaré",
    service: "Itinerario personalizado",
    date: "diciembre 2024",
  },
  {
    quote:
      "Soñamos este viaje durante dos años. Lo más importante fue tener la ciudad organizada para aprovechar el tiempo: cómo recorrer cada parte, qué días y horarios convienen, y hasta ayuda con el metro. Un viaje que tanto soñamos y que nunca vamos a olvidar.",
    person: "Nicole y Andrés",
    service: "Itinerario personalizado",
    date: "noviembre 2023",
  },
  {
    quote:
      "¡Espectacular! La consultoría fue específica y muy útil para organizarnos, que era lo que más nos costaba. Sus aportes desde su experiencia nos optimizaron el viaje y pudimos hacer muchísimas cosas del plan.",
    person: "Belén y familia",
    service: "Consultoría",
    date: "octubre 2023",
  },
  {
    quote:
      "Un servicio que recomiendo al 100%. New York es una ciudad inmensa, con un montón de cosas para ver, y la ayuda de Belu fue crucial para que pudiéramos disfrutar al máximo.",
    person: "Rafaella y familia",
    service: "Consultoría",
    date: "agosto 2023",
  },
  {
    quote:
      "Mi primer viaje sola no hubiera sido lo mismo sin este itinerario. Fue clave para hacer todo lo que tenía ganas de hacer. Estando allí ya solo te queda disfrutar. Nunca vas a sentirte sola.",
    person: "Julieta",
    service: "Itinerario personalizado",
    date: "mayo 2023",
  },
  {
    quote:
      "Viajamos dos parejas y la experiencia superó ampliamente nuestras expectativas. No solo conocimos todos los puntos de interés de New York: los piques de comida, bares y lugares ocultos fueron increíbles.",
    person: "Fabrizzio",
    service: "Itinerario personalizado",
    date: "febrero 2023",
  },
];

export function Reviews(): JSX.Element {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="py-16 sm:py-20">
      <div className="container-ds flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <SectionHeading
          eyebrow="Reseñas"
          title="Lo que dicen mis viajeros"
          highlight
        />
        <div className="flex items-center gap-2">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => scrollBy(dir)}
              aria-label={
                dir === -1 ? "Reseñas anteriores" : "Reseñas siguientes"
              }
              className="border-ink text-ink hover:bg-brand grid size-10 place-items-center rounded-sm border-2 transition-colors"
            >
              <ArrowRight
                className={cn("size-4", dir === -1 && "rotate-180")}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="container-ds mt-10 pr-0!">
        <div
          ref={scroller}
          data-reveal-group
          className="flex snap-x snap-mandatory [scrollbar-width:none] gap-5 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden"
        >
          {REVIEWS.map((review) => (
            <figure
              key={review.quote}
              className="border-hairline bg-surface-1 flex w-76 shrink-0 snap-start flex-col rounded-lg border p-8 sm:w-96"
            >
              <span
                className="text-brand"
                role="img"
                aria-label="5 de 5 estrellas"
              >
                {"★".repeat(5)}
              </span>
              <blockquote className="body-lg text-ink mt-5 flex-1 text-pretty">
                “{review.quote}”
              </blockquote>
              <figcaption className="border-hairline mt-8 border-t pt-5">
                <span className="body-sm text-ink block font-semibold">
                  {review.person}
                </span>
                <span className="caption text-ink-tertiary block">
                  {review.date}
                </span>
                <span className="caption bg-surface-2 text-ink-subtle mt-2 inline-block rounded-xs px-2 py-0.5">
                  {review.service}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
