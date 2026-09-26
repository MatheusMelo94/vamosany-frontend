import type { JSX, ReactNode } from "react";
import { FORM_COPY } from "@/features/sobre-mi/content/forms";
import { sm } from "@/features/sobre-mi/motion/attributes";

type Props = {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
};

/** Error element id for a field (the control's aria-describedby target). */
export const errorId = (id: string): string => `${id}-error`;

/**
 * Label + control + error line shared by the form fields (spec § Form States,
 * Field error): a visible label bound with htmlFor ("(opcional)" inside it),
 * and, on error, a bold line with a round ink "!" badge. The wrapper is the
 * M8 shake target (`data-sm-field`).
 */
export function FieldShell({
  id,
  label,
  optional = false,
  error,
  children,
}: Props): JSX.Element {
  return (
    <div {...sm("field")} className="grid content-start gap-1.5">
      <label htmlFor={id} className="label-button text-label-sm text-ink">
        {label}
        {optional ? (
          <>
            {" "}
            <small className="body-sm text-ink-muted font-normal tracking-normal normal-case">
              {FORM_COPY.optional}
            </small>
          </>
        ) : null}
      </label>
      {children}
      {error ? (
        <p
          id={errorId(id)}
          className="body-sm text-ink flex items-center gap-1.5 font-semibold"
        >
          <span
            aria-hidden
            className="bg-ink text-canvas caption grid size-4.5 flex-none place-items-center rounded-full font-bold"
          >
            !
          </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}
