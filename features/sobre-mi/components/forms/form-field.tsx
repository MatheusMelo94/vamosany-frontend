import type { JSX } from "react";
import { cn } from "@/lib/utils";
import { controlClasses } from "@/features/sobre-mi/components/forms/control-classes";
import {
  errorId,
  FieldShell,
} from "@/features/sobre-mi/components/forms/field-shell";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
  error?: string;
  type?: "text" | "email";
  multiline?: boolean;
  autoComplete?: string;
  maxLength?: number;
};

/**
 * A text field (or textarea). Controlled and deliberately without `name`:
 * a native submit — JS off or before hydration — can serialize nothing
 * (plan § 0.1 F3; Security G1 R-01). Values are React text only (R-06).
 */
export function FormField({
  id,
  label,
  value,
  onChange,
  optional,
  error,
  type = "text",
  multiline = false,
  autoComplete,
  maxLength,
}: Props): JSX.Element {
  const a11y = error
    ? { "aria-invalid": true, "aria-describedby": errorId(id) }
    : {};
  return (
    <FieldShell id={id} label={label} optional={optional} error={error}>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={cn(controlClasses(Boolean(error)), "min-h-30 resize-y")}
          {...a11y}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={controlClasses(Boolean(error))}
          {...a11y}
        />
      )}
    </FieldShell>
  );
}
