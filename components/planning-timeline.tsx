"use client";

import { useState } from "react";
import { CardIcon, CircleTargetIcon, GridIcon, LaptopIcon } from "./icons";
import { cn } from "@/lib/utils";

const TRACKS = [
  {
    id: "Before you fly",
    Icon: CircleTargetIcon,
    steps: [
      { when: "Tonight", what: "Buy the plan and skim the whole week" },
      { when: "This weekend", what: "Book the three things that sell out" },
      { when: "Day before", what: "Download the offline map and go" },
    ],
  },
  {
    id: "Landing day",
    Icon: GridIcon,
    steps: [
      {
        when: "On arrival",
        what: "Follow the airport route we picked for your terminal",
      },
      { when: "An hour later", what: "Bags down, first walk already mapped" },
      { when: "That evening", what: "Eat somewhere ten minutes from your bed" },
    ],
  },
  {
    id: "While you're there",
    Icon: LaptopIcon,
    steps: [
      { when: "Each morning", what: "One route, timed to opening hours" },
      { when: "If it rains", what: "Swap to the indoor version of the day" },
      {
        when: "Each evening",
        what: "Three dinner options near where you end up",
      },
    ],
  },
  {
    id: "After the trip",
    Icon: CardIcon,
    steps: [
      { when: "Back home", what: "Your copy keeps updating for a year" },
      { when: "Next season", what: "New routes land in the same file" },
      { when: "Whenever", what: "Send us what we missed — we walk it" },
    ],
  },
];

export function PlanningTimeline() {
  const [active, setActive] = useState(TRACKS[0].id);
  const track = TRACKS.find((t) => t.id === active)!;

  return (
    <section className="container-ds py-16 sm:py-20">
      <div
        data-heading-block
        className="flex flex-col items-center gap-4 text-center"
      >
        <span data-heading-eyebrow className="eyebrow">
          The easy part
        </span>
        <h2 data-split-lines className="display-lg text-ink text-balance">
          Planning takes one evening
        </h2>
      </div>

      <div
        role="tablist"
        aria-label="Trip stages"
        className="border-ink mx-auto mt-10 flex w-fit max-w-full [scrollbar-width:none] gap-1 overflow-x-auto rounded-sm border-2 p-1 [&::-webkit-scrollbar]:hidden"
      >
        {TRACKS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={t.id === active}
            onClick={() => setActive(t.id)}
            className={cn(
              "label-button inline-flex shrink-0 items-center gap-2 rounded-xs px-3.5 py-2 transition-colors",
              t.id === active
                ? "bg-brand text-ink"
                : "text-ink-subtle hover:text-ink",
            )}
          >
            <t.Icon className="size-4" />
            {t.id}
          </button>
        ))}
      </div>

      <div className="relative mt-16">
        <div
          aria-hidden
          className="border-hairline-strong absolute inset-x-[16.666%] top-1 hidden border-t-2 border-dashed md:block"
        />
        <ol data-reveal-group className="grid gap-4 md:grid-cols-3">
          {track.steps.map((step, i) => (
            <li key={step.when} className="flex flex-col items-center">
              <span
                aria-hidden
                className={cn(
                  "ring-canvas relative z-10 size-3 rounded-full ring-4",
                  i === 0 ? "bg-brand" : "bg-hairline-strong",
                )}
              />
              <p className="body-sm text-ink mt-5 font-semibold">{step.when}</p>
              <p className="body-sm border-hairline bg-surface-1 text-ink-subtle mt-3 w-full rounded-lg border px-5 py-4 text-center">
                {step.what}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
