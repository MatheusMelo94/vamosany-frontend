"use client";

import type { FormEvent, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import type { z } from "zod";
import { validate } from "@/features/sobre-mi/schemas";

export type UiOnlyStatus = "idle" | "field-errors" | "not-configured";

type Options<F extends string> = {
  schema: z.ZodType;
  /** Field order = [md] order = focus order for the first invalid field. */
  fields: readonly F[];
  /** Control id per field (label htmlFor, error ids, M8 event detail). */
  ids: Record<F, string>;
};

export type UiOnlyForm<F extends string> = {
  rootRef: RefObject<HTMLDivElement | null>;
  hydrated: boolean;
  values: Record<F, string>;
  errors: Partial<Record<F, string>>;
  status: UiOnlyStatus;
  /** Re-keys the banner on every valid submit, so it is re-announced. */
  announceKey: number;
  change: (field: F) => (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

/**
 * State and behaviour shared by the two UI-only forms (plan § 0.1 F1–F8;
 * spec v1.1 § Form States):
 * - values/errors/status in React state only — no storage APIs (R-02);
 * - `hydrated` flips after mount, so the button is `type="button"` in the
 *   server HTML and until the leaf is interactive (R-01, F3);
 * - submit always preventDefault; invalid → errors, focus on the first
 *   invalid field, one `sm:field-errors` event; valid → NOTHING is sent,
 *   the Not-configured banner shows and takes focus, one `sm:banner` event
 *   (the M8 motion hooks, F8);
 * - a field's error is re-checked while typing and cleared once valid.
 */
export function useUiOnlyForm<F extends string>({
  schema,
  fields,
  ids,
}: Options<F>): UiOnlyForm<F> {
  const rootRef = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const [values, setValues] = useState<Record<F, string>>(
    () => Object.fromEntries(fields.map((f) => [f, ""])) as Record<F, string>,
  );
  const [errors, setErrors] = useState<Partial<Record<F, string>>>({});
  const [status, setStatus] = useState<UiOnlyStatus>("idle");
  const [announceKey, setAnnounceKey] = useState(0);
  /** What to focus after a submit; `seq` makes a repeat request a new value. */
  const [focusRequest, setFocusRequest] = useState<{
    target: string;
    seq: number;
  } | null>(null);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!focusRequest) return;
    const el =
      focusRequest.target === "banner"
        ? rootRef.current?.querySelector<HTMLElement>("[data-sm-banner]")
        : document.getElementById(focusRequest.target);
    el?.focus();
  }, [focusRequest]);

  const emit = (type: string, detail?: unknown) =>
    rootRef.current?.dispatchEvent(
      new CustomEvent(type, { bubbles: true, detail }),
    );

  const requestFocus = (target: string) =>
    setFocusRequest((r) => ({ target, seq: (r?.seq ?? 0) + 1 }));

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = validate(schema, values);
    if (!result.ok) {
      const next = result.errors as Partial<Record<F, string>>;
      const invalid = fields.filter((f) => next[f]);
      setErrors(next);
      setStatus("field-errors");
      const first = invalid[0];
      if (first) requestFocus(ids[first]);
      emit("sm:field-errors", { fields: invalid.map((f) => ids[f]) });
      return;
    }
    setErrors({});
    setStatus("not-configured");
    setAnnounceKey((k) => k + 1);
    requestFocus("banner");
    emit("sm:banner");
  };

  const change = (field: F) => (value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (errors[field]) {
      const result = validate(schema, next);
      const fieldError = result.ok
        ? undefined
        : (result.errors as Partial<Record<F, string>>)[field];
      setErrors((prev) => ({ ...prev, [field]: fieldError }));
    }
  };

  return {
    rootRef,
    hydrated,
    values,
    errors,
    status,
    announceKey,
    change,
    onSubmit,
  };
}
