import type { JSX } from "react";
import { FORM_COPY } from "@/features/sobre-mi/content/forms";

/**
 * No JS (spec v1.1 § Form States; plan § 0.1 F2): shown instead of the form
 * when scripting is off, in the banner's style, with the address as a
 * prominent mailto link. The break opportunity after "@" keeps the address
 * from breaking mid-word at narrow widths.
 */
export function NoJsBlock(): JSX.Element {
  const { before, email, after } = FORM_COPY.noJs;
  const [user, domain] = email.split("@");
  return (
    <p className="border-ink body-base text-ink rounded-sm border-2 px-4 py-3.5">
      {before}
      <a
        href={`mailto:${email}`}
        className="headline font-mono font-bold tracking-normal normal-case underline underline-offset-3"
      >
        {user}@<wbr />
        {domain}
      </a>
      {after}
    </p>
  );
}
