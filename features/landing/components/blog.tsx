import type { JSX } from "react";
import Image from "next/image";
import { ArrowRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

const FEATURED = {
  img: "/img/post-dumbo.webp",
  alt: "El puente de Brooklyn visto desde la costanera de Dumbo",
  category: "Dónde comer",
  title: "Comer como en casa: La Gran Uruguaya en Jackson Heights 🇺🇾",
  excerpt:
    "Si estás en New York y te dan ganas de una comida bien uruguaya, de esas que te reconfortan, tenés que ir a La Gran Uruguaya. Fui especialmente hasta Jackson Heights, en Queens, para probarlo… ¡y superó todas mis expectativas!",
  meta: "4 min de lectura · junio 2025",
};

const POSTS = [
  {
    img: "/img/post-night.webp",
    alt: "Una calle de Chinatown iluminada de noche",
    category: "Cine y series",
    title: "New York de película: spots de series y películas",
    meta: "3 min de lectura",
  },
  {
    img: "/img/post-autumn.webp",
    alt: "El lago de Central Park con los edificios de Midtown atrás",
    category: "Tips prácticos",
    title: "Qué hacer en un día de lluvia en New York",
    meta: "4 min de lectura",
  },
  {
    img: "/img/quote-street.webp",
    alt: "Torres de oficinas de Manhattan vistas desde abajo, en blanco y negro",
    category: "Barrios",
    title: "Jardín Botánico de New York: todo lo que tenés que saber",
    meta: "5 min de lectura",
  },
];

export function Blog(): JSX.Element {
  return (
    // Cream stripe (DDR-0011).
    <section id="blog" className="bg-surface-1 py-16 sm:py-20">
      <div className="container-ds">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Blog"
            title="Diario de Belu en New York"
            description="Mi rincón de New York: experiencias reales, lugares favoritos y piques para que descubras la ciudad a tu manera."
          />
          <Button href="#blog" variant="secondary" className="w-fit shrink-0">
            Ver todos los posts
          </Button>
        </div>

        {/* Featured */}
        <article
          data-reveal
          className="group border-ink mt-14 grid gap-8 border-b-2 pb-14 lg:grid-cols-2 lg:items-center lg:gap-12"
        >
          <div className="border-ink rounded-xxl relative aspect-3/2 overflow-hidden border-2">
            <Image
              src={FEATURED.img}
              alt={FEATURED.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-(--duration-slow) ease-(--ease-default) group-hover:scale-104"
            />
          </div>
          <div>
            <p className="eyebrow">{FEATURED.category}</p>
            <h3 className="text-ink mt-4 font-sans text-2xl leading-snug font-bold text-balance">
              {FEATURED.title}
            </h3>
            <p className="body-base text-ink-subtle mt-4">{FEATURED.excerpt}</p>
            <div className="mt-6 flex items-center gap-4">
              <a
                href="#blog"
                className="label-button text-ink inline-flex items-center gap-2 underline-offset-4 hover:underline"
              >
                Leer el post
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <span className="caption text-ink-tertiary">{FEATURED.meta}</span>
            </div>
          </div>
        </article>

        {/* Recent */}
        <ul data-reveal-group className="mt-14 grid gap-8 md:grid-cols-3">
          {POSTS.map((post) => (
            <li key={post.title}>
              <article className="group flex h-full flex-col">
                <div className="border-ink rounded-xxl relative aspect-3/2 overflow-hidden border-2">
                  <Image
                    src={post.img}
                    alt={post.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-(--duration-slow) ease-(--ease-default) group-hover:scale-104"
                  />
                </div>
                <p className="eyebrow mt-5">{post.category}</p>
                <h3 className="text-ink mt-3 flex-1 font-sans text-lg leading-snug font-bold text-balance">
                  {/* arbitrary: o subrayado amarillo do sistema, 6px */}
                  <a
                    href="#blog"
                    className="decoration-brand underline-offset-4 hover:underline hover:decoration-[6px]"
                  >
                    {post.title}
                  </a>
                </h3>
                <p className="caption text-ink-tertiary mt-4">{post.meta}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
