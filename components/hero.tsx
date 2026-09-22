import { HeroRing } from "./hero-ring";
import { Button } from "./ui";

export function Hero() {
  return (
    <section className="relative isolate pb-12 pt-16 sm:pb-16 sm:pt-24">
      <div className="container-ds relative z-10">
        <div
          data-hero-copy
          className="mx-auto flex w-full max-w-6xl flex-col items-center text-center"
        >
          <h1 className="display-xl text-balance text-ink">
            {/* One span across the whole headline: with box-decoration-break
                every line gets its own marker band, and after SplitText each
                line owns a clone of the span, so GSAP can sweep them in turn. */}
            <span data-sweep className="highlight-heading">
              Seven days in New York, planned to the block.
            </span>
          </h1>

          <p
            data-hero-quote
            className="body-lg mt-7 max-w-2xl text-pretty text-ink-subtle sm:mt-8 sm:text-xl"
          >
            If you can make it here, you can make it anywhere.
          </p>

          <div data-hero-actions className="mt-7 flex justify-center sm:mt-8">
            <Button href="#services" size="lg">
              Embark on this journey
            </Button>
          </div>

          {/* Decorative 3D ring below the CTA. The ring is
              full-width, so it breaks out of the centred column. */}
          <div className="mt-10 w-full self-stretch sm:mt-12" data-hero-ring>
            <HeroRing
              images={[
                { src: "/img/ring/murray-hill", position: "50% 55%" },
                { src: "/img/ring/east-river", position: "60% 55%" },
                { src: "/img/ring/empire-haze", position: "55% 40%" },
                { src: "/img/ring/aerial-downtown", position: "50% 45%" },
                { src: "/img/ring/midtown-rooftops", position: "40% 70%" },
              ]}
            />
          </div>


        </div>
      </div>

    </section>
  );
}
