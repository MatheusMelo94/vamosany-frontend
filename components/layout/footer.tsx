import type { JSX } from "react";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { BrandLogo } from "@/components/ui/brand-logo";
import { GUIDE_META } from "@/features/guias/content/meta";
import { guideHref } from "@/features/guias/content/queries";

const TOP_LINKS = [
  "Mi historia",
  "Cómo investigo",
  "Prensa",
  "Trabajá conmigo",
  "Contacto",
];

const COLUMNS = [
  {
    heading: "Guías",
    links: [
      "El subte, explicado",
      "Desde el aeropuerto",
      "Caminar por New York",
      "Cómo moverte por New York",
      "Visa a Estados Unidos",
      "Cuánto cuesta un día en New York",
      "Qué llevar según la temporada",
      "Entradas para Broadway",
    ],
  },
  {
    heading: "Blog",
    links: [
      "Dónde comer",
      "Cine y series",
      "Tips prácticos",
      "Barrios",
      "Archivo de la newsletter",
      "Novedades en vivo",
    ],
  },
  {
    heading: "Ayuda",
    links: [
      "Contacto",
      "Reembolsos",
      "Preguntas frecuentes",
      "Qué incluye",
      "Programa de afiliados",
      "Accesibilidad",
    ],
  },
];

/** The Guías column's entries are links to their guide and read like the menu ("Caminar por New York"): DDR-0014. Every other footer link is still a placeholder. */
const GUIDE_HREFS = new Map(
  GUIDE_META.map((meta) => [meta.menuTitle, guideHref(meta.slug)]),
);

const SOCIALS = ["X", "in", "f", "IG"];

/* CC BY / CC BY-SA photography requires visible attribution. */
const PHOTO_CREDITS = [
  [
    "Puentes de Brooklyn, Manhattan y Williamsburg",
    "Axel Tschentscher",
    "CC BY-SA 4.0",
  ],
  ["Central Park en otoño", "Ed Yourdon", "CC BY-SA 2.0"],
  ["451 Broome Street, SoHo", "Axel Tschentscher", "CC BY-SA 4.0"],
  ["Chinatown, Manhattan", "Derek Jensen", "Dominio público"],
  ["Grand Central Terminal", "Diliff", "CC BY 2.5"],
  ["The High Line", "King of Hearts", "CC BY-SA 4.0"],
  ["Subte de Union Square", "TLK in 3", "CC BY-SA 3.0"],
  ["Puente de Brooklyn al atardecer", "MusikAnimal", "CC BY-SA 4.0"],
  ["Mott Street de noche", "MusikAnimal", "CC BY-SA 4.0"],
  ["Central Park y Midtown", "Gzzz", "CC BY-SA 3.0"],
  ["Taxi amarillo después de la nieve", "Corentin Villemeur", "CC BY-SA 4.0"],
];

const LEGAL = [
  "Términos",
  "Política de privacidad",
  "Configuración de cookies",
  "Créditos de fotos",
];

export function Footer(): JSX.Element {
  return (
    <footer className="bg-ink text-inverse-ink">
      <div className="container-ds py-16">
        <ul className="flex flex-wrap gap-x-7 gap-y-3">
          {TOP_LINKS.map((link) => (
            <li key={link}>
              <Link
                href="#"
                className="body-sm text-inverse-ink/80 hover:text-inverse-ink transition-colors"
              >
                {link}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="label-button text-inverse-ink">{column.heading}</p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href={
                        column.heading === "Guías"
                          ? (GUIDE_HREFS.get(link) ?? "#")
                          : "#"
                      }
                      className="body-sm text-inverse-ink/55 hover:text-inverse-ink inline-flex items-center gap-1.5 transition-colors"
                    >
                      {link}
                      {link === "Novedades en vivo" ? (
                        <span
                          aria-hidden
                          className="bg-brand size-1.5 rounded-full"
                        />
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-inverse-ink/15 mt-14 grid gap-8 border-t pt-12 lg:grid-cols-3 lg:items-start">
          <div>
            <BrandLogo tone="light" className="h-8" />
            <ul className="mt-5 flex gap-2.5">
              {SOCIALS.map((s) => (
                <li key={s}>
                  <Link
                    href="#"
                    aria-label={s}
                    className="caption border-inverse-ink/25 text-inverse-ink/70 hover:border-inverse-ink hover:bg-inverse-ink/10 hover:text-inverse-ink grid size-8 place-items-center rounded-sm border transition-colors"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <p className="subhead text-inverse-ink text-balance">
            Un mail por mes: un recorrido, un lugar para comer y algo que vale
            la pena caminar.
          </p>

          <form
            className="w-full"
            action="#"
            method="post"
            aria-label="Suscripción a la newsletter"
          >
            <div className="border-inverse-ink/25 bg-inverse-ink/10 focus-within:border-inverse-ink flex items-center gap-2 rounded-sm border-2 p-1 pl-3">
              <label htmlFor="newsletter-email" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="tu@email.com"
                className="body-sm text-inverse-ink placeholder:text-inverse-ink/45 h-10 min-w-0 flex-1 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Suscribirme"
                className="bg-brand text-ink hover:bg-brand-hover grid size-10 shrink-0 place-items-center rounded-sm transition-colors"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
            <p className="caption text-inverse-ink/45 mt-3">
              Confirmo que leí la{" "}
              <Link
                href="#"
                className="text-inverse-ink/70 hover:text-inverse-ink underline underline-offset-2"
              >
                Política de privacidad
              </Link>{" "}
              y estoy de acuerdo.
            </p>
          </form>
        </div>

        <details className="caption border-inverse-ink/15 text-inverse-ink/45 mt-12 border-t pt-8">
          <summary className="hover:text-inverse-ink cursor-pointer transition-colors">
            Créditos de fotografía
          </summary>
          <ul className="mt-4 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {PHOTO_CREDITS.map(([subject, author, license]) => (
              <li key={subject}>
                {subject} — {author},{" "}
                <span className="text-inverse-ink/35">{license}</span>
              </li>
            ))}
          </ul>
          <p className="text-inverse-ink/35 mt-4">
            Todas las fotos vienen de Wikimedia Commons y se usan bajo sus
            respectivas licencias.
          </p>
        </details>

        <div className="caption border-inverse-ink/15 text-inverse-ink/45 mt-8 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Vamos a NY. Hecho en Montevideo, caminado en New York.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL.map((item) => (
              <li key={item}>
                <Link
                  href="#"
                  className="hover:text-inverse-ink transition-colors"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
