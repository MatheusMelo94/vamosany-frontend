import { HeroRing } from "./hero-ring";
import { Button } from "./ui";

export function Hero() {
  return (
    <section className="relative isolate pt-12 pb-8 sm:pt-24 sm:pb-16">
      <div className="container-ds relative z-10">
        <div
          data-hero-copy
          className="mx-auto flex w-full max-w-6xl flex-col items-center text-center"
        >
          <h1 className="display-xl text-ink text-balance">
            {/* One span across the whole headline: with box-decoration-break
                every line gets its own marker band, and after SplitText each
                line owns a clone of the span, so GSAP can sweep them in turn. */}
            <span data-sweep className="highlight-heading">
              Seven days in New York, planned to the block.
            </span>
          </h1>

          <p
            data-hero-quote
            className="body-lg text-ink-subtle mt-5 max-w-2xl text-pretty sm:mt-8 sm:text-xl"
          >
            If you can make it here, you can make it anywhere.
          </p>

          <div data-hero-actions className="mt-6 flex justify-center sm:mt-8">
            <Button href="#services" size="lg">
              Embark on this journey
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
