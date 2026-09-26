import type { JSX } from "react";
import { FORM_COPY } from "@/features/sobre-mi/content/forms";
import { sm } from "@/features/sobre-mi/motion/attributes";

/**
 * Not configured (spec v1.1 § Form States): shown above the form after a
 * valid submit, since nothing is sent in this release. A polite status the
 * form focuses (tabIndex -1); M8 animates its wrapper (`data-sm-banner`).
 */
export function NotConfiguredBanner(): JSX.Element {
  const { before, email, after } = FORM_COPY.notConfigured;
  return (
    <div
      role="status"
      tabIndex={-1}
      {...sm("banner")}
      className="border-ink body-base text-ink rounded-sm border-2 px-4 py-3.5"
    >
      {before}
      <a
        href={`mailto:${email}`}
        className="font-mono font-bold underline underline-offset-3"
      >
        {email}
      </a>
      {after}
    </div>
  );
}
