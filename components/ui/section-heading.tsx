import type { JSX, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  /** Signature yellow highlight. Deliberately rare — not every heading. */
  highlight?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  highlight = false,
}: Props): JSX.Element {
  return (
    <div
      data-heading-block
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        align === "center" ? "mx-auto items-center text-center" : "items-start",
      )}
    >
      {eyebrow ? (
        <span data-heading-eyebrow className="eyebrow">
          {eyebrow}
        </span>
      ) : null}
      <h2 data-split-lines className="display-lg text-ink text-balance">
        {highlight ? (
          <span data-sweep className="highlight-heading">
            {title}
          </span>
        ) : (
          title
        )}
      </h2>
      {description ? (
        <p data-heading-lede className="body-lg text-ink-subtle text-pretty">
          {description}
        </p>
      ) : null}
    </div>
  );
}
