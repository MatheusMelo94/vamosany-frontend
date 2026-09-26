import type { JSX } from "react";
import type { FaqQuestion } from "@/features/sobre-mi/content/faq";
import { sm } from "@/features/sobre-mi/motion/attributes";
import { slugify } from "@/lib/utils";

type Props = { item: FaqQuestion };

/**
 * One question as a native disclosure (spec § Page 5; AC 47, 49): works
 * without JS, Enter/Space toggle it, opening doesn't move focus. The id is
 * the slug of the question (deep links, T022) and scrolls clear of the
 * sticky navbar (`data-sm-anchor`). "+" turns to "×" with a CSS rotation,
 * only when motion is allowed.
 */
export function FaqItem({ item }: Props): JSX.Element {
  return (
    <details
      id={slugify(item.question)}
      {...sm("anchor")}
      className="group border-hairline border-b first-of-type:border-t"
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3.5 font-semibold [&::-webkit-details-marker]:hidden">
        <span>{item.question}</span>
        {/* arbitrary: 22px glyph (mockup .pm); no type-scale step */}
        <span
          aria-hidden
          className="font-display flex-none text-[1.375rem] leading-none font-bold group-open:rotate-45 motion-safe:transition-transform motion-safe:duration-(--duration-slow) motion-safe:ease-(--ease-default)"
        >
          +
        </span>
      </summary>
      <div {...sm("faqAnswer")} className="overflow-hidden">
        {typeof item.answer === "string" ? (
          // arbitrary: 62ch answer measure (mockup); --container-prose is 65ch
          <p className="text-ink-muted max-w-[62ch] pb-4">{item.answer}</p>
        ) : (
          <ul className="mt-1 mb-4 grid gap-1">
            {item.answer.map((line) => (
              <li
                key={line}
                className="text-ink-muted flex items-baseline gap-2.5"
              >
                <span
                  aria-hidden
                  className="bg-brand size-2 flex-none -translate-y-px rounded-full"
                />
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
