import Image from "next/image";
import { BuildingIcon, DocIcon, GlobeIcon } from "./icons";
import { ArrowRight, Button, SectionHeading } from "./ui";

const STEPS = [
  {
    Icon: DocIcon,
    title: "Buy and download",
    body: "Checkout takes a minute. The PDF and the live map land in your inbox straight away — no account, no app.",
  },
  {
    Icon: GlobeIcon,
    title: "Open it offline",
    body: "Everything works without data. Pinned maps, walking times, subway lines and the opening hours we checked last month.",
  },
  {
    Icon: BuildingIcon,
    title: "Walk out and use it",
    body: "Each day is a route, not a list. You always know the next stop, how far it is, and what to do if it's raining.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="container-ds py-16 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="How it works"
            title="Written on foot, twice a year"
            description="We walk every route ourselves before it ships, and again each season to check what closed, what moved and what stopped being worth your morning. When something changes, your copy updates for free."
          />
          <Button href="#services" className="mt-9">
            Browse itineraries
          </Button>
        </div>

        <figure
          data-reveal
          className="relative aspect-[4/3] overflow-hidden rounded-lg"
        >
          <Image
            src="/img/how-subway.webp"
            alt="A New York City subway platform"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </figure>
      </div>

      <ul data-reveal-group className="mt-20 grid gap-6 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="border-ink border-t-2 pt-6">
            <div className="flex items-center justify-between">
              <span className="bg-brand text-ink grid size-10 place-items-center rounded-sm">
                <step.Icon className="size-5" />
              </span>
              <span className="display-md text-ink-tertiary">0{i + 1}</span>
            </div>
            <h3 className="card-title text-ink mt-5">{step.title}</h3>
            <p className="body-sm text-ink-subtle mt-3">{step.body}</p>
            <a
              href="#services"
              className="body-sm text-ink mt-4 inline-flex items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
            >
              Learn more <ArrowRight className="size-3.5" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
