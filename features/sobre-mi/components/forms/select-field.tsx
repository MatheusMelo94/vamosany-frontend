import type { JSX } from "react";
import { FORM_COPY } from "@/features/sobre-mi/content/forms";
import { controlClasses } from "@/features/sobre-mi/components/forms/control-classes";
import {
  errorId,
  FieldShell,
} from "@/features/sobre-mi/components/forms/field-shell";

type Props = {
  id: string;
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

/**
 * A select starting on the empty "Elegí una opción" prompt (an option, not a
 * label, spec § Accessibility). Controlled, no `name` (R-01).
 */
export function SelectField({
  id,
  label,
  options,
  value,
  onChange,
  error,
}: Props): JSX.Element {
  const a11y = error
    ? { "aria-invalid": true, "aria-describedby": errorId(id) }
    : {};
  return (
    <FieldShell id={id} label={label} error={error}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={controlClasses(Boolean(error))}
        {...a11y}
      >
        <option value="">{FORM_COPY.selectPrompt}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
