import type { JSX } from "react";
import { HeroRing } from "./hero-ring";
import { Button } from "@/components/ui/button";

export function Hero(): JSX.Element {
  return (
    // Hero ground stays white; the marker is a full-height block (DDR-0011).
    <section className="relative isolate pt-12 pb-8 sm:pt-24 sm:pb-16">
      <div className="container-ds relative z-10">
        <div
          data-hero-copy
          className="mx-auto flex w-full max-w-6xl flex-col items-center text-center"
        >
          <h1 className="display-xl text-on-brand text-balance">
            {/* One span across the whole headline: with box-decoration-break
                every line gets its own marker band, and after SplitText each
                line owns a clone of the span, so GSAP can sweep them in turn. */}
            <span data-sweep className="highlight-heading highlight-block">
              {/* Each phrase is a nowrap unit of two or more words, so no line
                  ever holds a single word at any viewport width. SplitText
                  collapses &nbsp; into plain spaces, hence spans, not &nbsp;. */}
              <span className="whitespace-nowrap">Tu viaje</span>{" "}
              <span className="whitespace-nowrap">a New York,</span>{" "}
              <span className="whitespace-nowrap">resuelto antes</span>{" "}
              <span className="whitespace-nowrap">de subirte</span>{" "}
              <span className="whitespace-nowrap">al avión.</span>
            </span>
          </h1>

          <p
            data-hero-quote
            className="body-lg text-ink-subtle mt-5 max-w-2xl text-balance sm:mt-8 sm:text-xl"
          >
            Todo lo que aprendí en más de 20 visitas, para que la disfrutes{" "}
            <span className="whitespace-nowrap">a tu manera.</span>
          </p>

          <div data-hero-actions className="mt-6 flex justify-center sm:mt-8">
            <Button href="#services" size="lg">
              Armá tu viaje
            </Button>
          </div>

          {/* Decorative 3D ring below the CTA. The ring is
              full-width, so it breaks out of the centred column. */}
          <div className="mt-8 w-full self-stretch sm:mt-12" data-hero-ring>
            <HeroRing
              count={24}
              radius={780}
              speed={60}
              images={[
                { src: "/img/ring/vamosany2", position: "50% 45%" },
                { src: "/img/ring/vamosany3", position: "50% 55%" },
                { src: "/img/ring/vamosany5", position: "50% 60%" },
                { src: "/img/ring/vamosany6", position: "50% 50%" },
                { src: "/img/ring/vamosany4", position: "50% 50%" },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
