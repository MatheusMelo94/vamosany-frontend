import type { JSX } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function CTA(): JSX.Element {
  return (
    <section id="newsletter" className="relative overflow-hidden">
      {/* Ultra-wide band — GSAP pans it horizontally as the section passes */}
      <div className="absolute inset-0" aria-hidden>
        {/* arbitrary: a faixa extravasa 15% de cada lado para o corte diagonal nao mostrar borda */}
        <div data-pan-band className="relative h-full w-[130%] max-w-none">
          <Image
            src="/img/band-bridges.webp"
            alt=""
            fill
            sizes="130vw"
            className="object-cover"
          />
        </div>
        <div className="bg-ink/65 absolute inset-0" />
      </div>

      <div className="container-ds relative py-24 text-center sm:py-32">
        <div data-heading-block className="mx-auto max-w-2xl">
          <h2
            data-split-lines
            className="display-lg text-inverse-ink text-balance"
          >
            Your week in New York, already figured out
          </h2>
          <p
            data-heading-lede
            className="body-lg text-inverse-ink/75 mt-5 text-pretty"
          >
            Buy an itinerary, or take the free version first — one email a month
            with a route, a place to eat and something worth walking to.
          </p>

          <div
            data-heading-actions
            className="mt-9 flex flex-wrap justify-center gap-3"
          >
            <Button href="#services" size="lg">
              Browse itineraries
            </Button>
            <Button
              href="#blog"
              size="lg"
              className="border-inverse-ink text-inverse-ink hover:bg-inverse-ink/10 bg-transparent"
            >
              Read the blog
            </Button>
          </div>

          <form
            action="#"
            method="post"
            aria-label="Newsletter signup"
            data-heading-actions
            className="mx-auto mt-10 flex max-w-md items-center gap-2"
          >
            <label htmlFor="cta-email" className="sr-only">
              Email address
            </label>
            <input
              id="cta-email"
              type="email"
              required
              placeholder="you@email.com"
              className="body-sm border-inverse-ink bg-inverse-ink/10 text-inverse-ink placeholder:text-inverse-ink/55 focus:bg-inverse-ink/20 h-12 min-w-0 flex-1 rounded-sm border-2 px-4 focus:outline-none"
            />
            <Button size="lg">Join</Button>
          </form>
          <p className="caption text-inverse-ink/55 mt-3">
            No spam. Unsubscribe in one click.
          </p>
        </div>
      </div>
    </section>
  );
}
