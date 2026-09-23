import type { JSX } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function CTA(): JSX.Element {
  return (
    <section id="newsletter" className="relative overflow-hidden">
      {/* Ultra-wide band — GSAP pans it horizontally as the section passes */}
      <div className="absolute inset-0" aria-hidden>
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
          <h2 data-split-lines className="display-lg text-balance text-white">
            Your week in New York, already figured out
          </h2>
          <p
            data-heading-lede
            className="body-lg mt-5 text-pretty text-white/75"
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
              className="border-white bg-transparent text-white hover:bg-white/10"
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
              className="body-sm h-12 min-w-0 flex-1 rounded-sm border-2 border-white bg-white/10 px-4 text-white placeholder:text-white/55 focus:bg-white/20 focus:outline-none"
            />
            <Button size="lg">Join</Button>
          </form>
          <p className="caption mt-3 text-white/55">
            No spam. Unsubscribe in one click.
          </p>
        </div>
      </div>
    </section>
  );
}
