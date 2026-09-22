"use client";

import { useRef } from "react";
import { ArrowRight, SectionHeading } from "./ui";

const REVIEWS = [
  {
    quote:
      "We used the 5-day plan almost hour for hour and never once stood on a corner arguing about what to do next. The bridge-at-seven tip alone was worth it.",
    person: "Marta Ibáñez",
    role: "Madrid · travelled in October",
    trip: "Icons & Neighbourhoods",
  },
  {
    quote:
      "I've been to New York four times and still found three places on this list I'd never heard of. The Chinatown route is the best money I've spent on a trip.",
    person: "Tom Whelan",
    role: "Dublin · travelled in March",
    trip: "Eat Your Way Down",
  },
  {
    quote:
      "Travelling with a seven-year-old, the rest days built into the week saved us. Somebody clearly walked this with tired legs before selling it.",
    person: "Aline Costa",
    role: "Lisbon · travelled in July",
    trip: "Five Boroughs, No Filler",
  },
  {
    quote:
      "It rained for two days straight and the indoor swap version meant we barely noticed. Everything was still open when the plan said it would be.",
    person: "Jonas Vinter",
    role: "Copenhagen · travelled in December",
    trip: "Christmas in New York",
  },
];

export function Reviews() {
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
          eyebrow="Reviews"
          title="What travellers said"
          highlight
        />
        <div className="flex items-center gap-2">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => scrollBy(dir)}
              aria-label={dir === -1 ? "Previous reviews" : "Next reviews"}
              className="grid size-10 place-items-center rounded-sm border-2 border-ink text-ink transition-colors hover:bg-brand"
            >
              <ArrowRight className={`size-4 ${dir === -1 ? "rotate-180" : ""}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="container-ds mt-10 pr-0!">
        <div
          ref={scroller}
          data-reveal-group
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {REVIEWS.map((review) => (
            <figure
              key={review.person}
              className="flex w-[19rem] shrink-0 snap-start flex-col rounded-lg border border-hairline bg-surface-1 p-8 sm:w-[24rem]"
            >
              <span className="text-brand" aria-label="Five out of five">
                {"★".repeat(5)}
              </span>
              <blockquote className="body-lg mt-5 flex-1 text-pretty text-ink">
                “{review.quote}”
              </blockquote>
              <figcaption className="mt-8 border-t border-hairline pt-5">
                <span className="body-sm block font-semibold text-ink">
                  {review.person}
                </span>
                <span className="caption block text-ink-tertiary">{review.role}</span>
                <span className="caption mt-2 inline-block rounded-xs bg-surface-2 px-2 py-0.5 text-ink-subtle">
                  {review.trip}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
