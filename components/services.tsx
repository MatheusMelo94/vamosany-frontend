import { CheckIcon } from "./icons";
import { Button, SectionHeading } from "./ui";

const TIERS = [
  {
    kicker: "Ready-made",
    title: "Curated by Belén",
    price: "from €25",
    per: "per itinerary",
    blurb:
      "The itineraries in the shop: routes she walked and wrote herself, with the offline map and a year of updates.",
    features: [
      "Day-by-day PDF and live map",
      "Real walking and subway times",
      "Rain and heat swaps for every day",
      "Free updates for a year",
    ],
    cta: "Browse itineraries",
    href: "#services",
    featured: false,
  },
  {
    kicker: "One to one",
    title: "Custom itinerary with Belén",
    price: "€149",
    per: "per trip",
    blurb:
      "A 45-minute call about your dates, your pace and what you actually like, then a plan built around it, delivered in five days.",
    features: [
      "45-minute planning call",
      "Day-by-day plan written for you",
      "Bookings list with what sells out",
      "Two rounds of changes",
      "WhatsApp line during the trip",
    ],
    cta: "Book a call",
    href: "#services",
    featured: true,
    tag: "Most popular",
  },
  {
    kicker: "In person",
    title: "Walk with Belén",
    price: "€290",
    per: "half day, up to 4 people",
    blurb:
      "Four hours on foot with her in the neighbourhood you pick: the places, the shortcuts and the food she would never put in a PDF.",
    features: [
      "Four hours, one neighbourhood",
      "Up to four people",
      "Lunch stop included in the route",
      "Notes sent the same evening",
    ],
    cta: "Check dates",
    href: "#services",
    featured: false,
  },
];

export function Services() {
  return (
    <section id="services" className="container-ds py-16 sm:py-20">
      <SectionHeading
        eyebrow="Services"
        title="Three ways to travel with Belén"
        description="Pick how much of the planning you want to do yourself. Everything is walked before it is sold."
        align="center"
      />

      <ul data-reveal-group className="mt-14 grid gap-4 lg:grid-cols-3">
        {TIERS.map((tier) => (
          <li key={tier.title}>
            <article
              className={`flex h-full flex-col rounded-lg border bg-canvas p-7 ${
                tier.featured ? "border-2 border-ink" : "border-hairline"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow">{tier.kicker}</p>
                {tier.tag ? (
                  <span className="caption rounded-sm bg-brand px-2 py-1 font-semibold text-ink">
                    {tier.tag}
                  </span>
                ) : null}
              </div>
              <h3 className="card-title mt-3 text-ink">{tier.title}</h3>
              <p className="mt-5 flex items-baseline gap-2">
                <span className="display-md text-ink">{tier.price}</span>
                <span className="caption text-ink-tertiary">{tier.per}</span>
              </p>
              <p className="body-sm mt-4 text-ink-subtle">{tier.blurb}</p>

              <ul className="mt-6 space-y-2.5 border-t border-hairline pt-6">
                {tier.features.map((f) => (
                  <li key={f} className="body-sm flex items-start gap-2.5 text-ink">
                    <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-brand text-ink">
                      <CheckIcon className="size-2.5" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                href={tier.href}
                variant={tier.featured ? "primary" : "secondary"}
                className="mt-8 w-full"
              >
                {tier.cta}
              </Button>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
