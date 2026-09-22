import { CheckIcon } from "./icons";
import { ArrowRight, SectionHeading } from "./ui";

const ITEMS = [
  {
    title: "A day-by-day PDF",
    body: "Printable, readable on a phone, and laid out so one day fits one screen. No login, no app to install.",
  },
  {
    title: "A live Google map",
    body: "Every stop pinned and colour-coded by day, downloadable for offline use before you get on the plane.",
  },
  {
    title: "Walking and subway times",
    body: "Real times between stops, including the transfers, so a day never quietly turns into fourteen kilometres.",
  },
  {
    title: "Rain and heat swaps",
    body: "An indoor alternative for every outdoor block, and the shaded version of each summer route.",
  },
  {
    title: "What to book ahead",
    body: "The short list of things that genuinely sell out, with how far in advance and what they cost right now.",
  },
  {
    title: "Free updates for a year",
    body: "We rewalk each route every season. When something closes or moves, your copy changes and we email you.",
  },
];

export function Included() {
  return (
    <section className="container-ds py-16 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <SectionHeading
            eyebrow="What you get"
            title="Everything in the file, nothing you have to chase"
            description="One purchase, six things in the folder. No upsells, no premium tier, no newsletter wall between you and the map."
          />
          <a
            href="#services"
            className="body-sm mt-8 inline-flex items-center gap-2 font-semibold text-ink underline-offset-4 transition-colors hover:underline hover:decoration-2"
          >
            See the itineraries <ArrowRight className="size-4" />
          </a>
        </div>

        <ul data-reveal-group className="grid gap-4 sm:grid-cols-2">
          {ITEMS.map((item) => (
            <li key={item.title} className="rounded-lg border border-hairline bg-surface-1 p-6">
              <p className="body-sm flex items-center gap-2 font-semibold text-ink">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand text-ink">
                  <CheckIcon className="size-3" />
                </span>
                {item.title}
              </p>
              <p className="body-sm mt-3 text-ink-subtle">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
