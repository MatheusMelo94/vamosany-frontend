import type { JSX } from "react";
import { FORM_COPY } from "@/features/sobre-mi/content/forms";
import { sm } from "@/features/sobre-mi/motion/attributes";

/**
 * Not configured (spec v1.1 § Form States): shown above the form after a
 * valid submit, since nothing is sent in this release. Rendered inside the
 * shell's persistent polite status region (RV-0012); the form focuses it
 * (tabIndex -1); M8 animates it (`data-sm-banner`). `mb-4.5` is the gap to
 * the form, which the shell no longer puts between region and form;
 * scroll-mt-24 keeps it below the sticky capsule when focused (RV-0013).
 */
export function NotConfiguredBanner(): JSX.Element {
  const { before, email, after } = FORM_COPY.notConfigured;
  return (
    <div
      tabIndex={-1}
      {...sm("banner")}
      className="border-ink body-base text-ink mb-4.5 scroll-mt-24 rounded-sm border-2 px-4 py-3.5"
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
