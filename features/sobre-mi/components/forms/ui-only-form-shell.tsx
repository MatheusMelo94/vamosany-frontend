import type { FormEvent, JSX, ReactNode, RefObject } from "react";
import { sm } from "@/features/sobre-mi/motion/attributes";
import { NoJsBlock } from "@/features/sobre-mi/components/forms/no-js-block";
import { NotConfiguredBanner } from "@/features/sobre-mi/components/forms/not-configured-banner";
import { SubmitRow } from "@/features/sobre-mi/components/forms/submit-row";

type Props = {
  rootRef: RefObject<HTMLDivElement | null>;
  showBanner: boolean;
  announceKey: number;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  buttonLabel: string;
  hydrated: boolean;
  children: ReactNode;
};

/**
 * The form area both forms share (plan § 0.1 F2, F3, F5): the form root
 * (`noscript:hidden`, data-sm-form, the M8 event target) holding the
 * persistent `role="status"` region with the banner slot above a <form>
 * with no action/method, and the NoJsBlock sibling
 * (`hidden noscript:block`). The @container sizes the two-per-row field rows.
 */
export function UiOnlyFormShell({
  rootRef,
  showBanner,
  announceKey,
  onSubmit,
  buttonLabel,
  hydrated,
  children,
}: Props): JSX.Element {
  return (
    <div className="@container">
      <div ref={rootRef} {...sm("form")} className="grid noscript:hidden">
        {/* One polite live region, mounted for the page's life; only the
            banner inside it is (re-)keyed, so a repeat submit re-announces
            (RV-0012). The banner carries the 18px gap to the form, so an
            empty region adds no space. */}
        <div role="status">
          {showBanner ? <NotConfiguredBanner key={announceKey} /> : null}
        </div>
        <form noValidate onSubmit={onSubmit} className="grid gap-4.5">
          {children}
          <SubmitRow label={buttonLabel} hydrated={hydrated} />
        </form>
      </div>
      <div className="hidden noscript:block">
        <NoJsBlock />
      </div>
    </div>
  );
}
