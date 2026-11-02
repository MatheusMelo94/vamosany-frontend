import type { CSSProperties, JSX } from "react";
import { sm } from "@/features/sobre-mi/motion/attributes";
import { cn } from "@/lib/utils";

type Props = {
  /** "Guías" on the home, the group name on a guide. */
  eyebrow: string;
  /** The whole title: the H1's accessible name. */
  title: string;
  /** The words carrying the yellow marker; the whole title by default. */
  marked?: string;
  dek: string;
  /** Home head is centered; the guide head is left-aligned (spec § Responsive Behavior). */
  align: "center" | "start";
  className?: string;
};

/**
 * Eyebrow, H1 and dek of a Guías page, as one `data-sm-heading` block for the
 * M1 entrance (plan D-5, D-11). The breadcrumb is NOT part of it: the block
 * starts at opacity 0 under `.gsap`, and links inside would be focusable
 * while invisible.
 *
 * The H1's accessible name is the sr-only copy; the visual copy is
 * aria-hidden, so splitting it into words never changes what assistive tech
 * reads (AC 3, 40). The split target also carries the train variable; the
 * marked words inherit it, so only part of the title can hold the marker while
 * every word still rises. Without motion the train rests at 0% (marker in place).
 */
export function GuideHeading({
  eyebrow,
  title,
  marked = title,
  dek,
  align,
  className,
}: Props): JSX.Element {
  const at = title.indexOf(marked);
  if (at < 0)
    throw new Error(`"${marked}" is not part of the title "${title}"`);
  const before = title.slice(0, at);
  const after = title.slice(at + marked.length);
  const center = align === "center";

  return (
    <header
      {...sm("heading")}
      className={cn(
        // arbitrary: 47.5rem (760px) head measure for the guide head, spec § Page Structure G2
        center ? "mx-auto text-center" : "max-w-[47.5rem]",
        className,
      )}
    >
      <p {...sm("label")} className="eyebrow">
        {eyebrow}
      </p>
      <h1
        className={cn(
          "text-ink mt-3.5 text-balance",
          center ? "display-xl" : "display-lg",
        )}
      >
        <span className="sr-only">{title}</span>
        <span
          aria-hidden
          {...sm("split")}
          {...sm("train")}
          className="[--train:0%]"
        >
          {before}
          <span
            className="highlight-heading"
            style={{ "--train": "inherit" } as CSSProperties}
          >
            {marked}
          </span>
          {after}
        </span>
      </h1>
      <p
        {...sm("dek")}
        className={cn(
          "text-ink-muted text-pretty",
          // arbitrary: 56ch (home intro) and 52ch (guide dek) measures, spec § Page Structure; --container-prose is 65ch
          center
            ? "body-lg mx-auto mt-4.5 max-w-[56ch]"
            : "subhead mt-4 max-w-[52ch]",
        )}
      >
        {dek}
      </p>
    </header>
  );
}
