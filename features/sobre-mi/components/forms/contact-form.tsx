"use client";

import type { FormEvent, JSX } from "react";
import { useEffect, useRef, useState } from "react";
import {
  FIELD_LIMITS,
  contactSchema,
  validate,
} from "@/features/sobre-mi/schemas";
import type { ContactField } from "@/features/sobre-mi/schemas";
import { FORM_COPY, TOPIC_OPTIONS } from "@/features/sobre-mi/content/forms";
import { sm } from "@/features/sobre-mi/motion/attributes";
import { FormField } from "@/features/sobre-mi/components/forms/form-field";
import { NoJsBlock } from "@/features/sobre-mi/components/forms/no-js-block";
import { NotConfiguredBanner } from "@/features/sobre-mi/components/forms/not-configured-banner";
import { SelectField } from "@/features/sobre-mi/components/forms/select-field";
import { SubmitRow } from "@/features/sobre-mi/components/forms/submit-row";

/** Field order = [md] order = focus order for "first invalid field". */
const FIELDS: readonly ContactField[] = [
  "name",
  "email",
  "topic",
  "travelDate",
  "message",
];

const ID: Record<ContactField, string> = {
  name: "contact-name",
  email: "contact-email",
  topic: "contact-topic",
  travelDate: "contact-travel-date",
  message: "contact-message",
};

type Values = Record<ContactField, string>;
type Errors = Partial<Record<ContactField, string>>;
type Status = "idle" | "field-errors" | "not-configured";

const EMPTY: Values = {
  name: "",
  email: "",
  topic: "",
  travelDate: "",
  message: "",
};

/**
 * Contacto form, UI-only release (spec v1.1 § Form States; plan § 0.1):
 * - validates with zod on submit; errors under their fields, focus on the
 *   first invalid one, cleared as soon as a value becomes valid;
 * - a valid submit sends NOTHING (no action, no fetch) and shows the
 *   Not-configured banner above the form, focused, values kept;
 * - values live in React state only (no storage, R-02); controls have no
 *   `name` and the button is `type="button"` until mounted (R-01);
 * - with JS off, CSS swaps the form for the no-JS block (F2);
 * - motion (M8) listens to `sm:field-errors` / `sm:banner` on the root, so
 *   this leaf imports no GSAP (F8).
 */
export function ContactForm(): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [announceKey, setAnnounceKey] = useState(0);
  /** What to focus after a submit; `seq` makes a repeat request a new value. */
  const [focusRequest, setFocusRequest] = useState<{
    target: string;
    seq: number;
  } | null>(null);

  useEffect(() => setHydrated(true), []);

  // After each submit: focus the banner or the first invalid field.
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

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = validate(contactSchema, values);
    if (!result.ok) {
      const next = result.errors as Errors;
      const first = FIELDS.find((f) => next[f]) ?? FIELDS[0];
      setErrors(next);
      setStatus("field-errors");
      setFocusRequest((r) => ({ target: ID[first], seq: (r?.seq ?? 0) + 1 }));
      emit("sm:field-errors", {
        fields: FIELDS.filter((f) => next[f]).map((f) => ID[f]),
      });
      return;
    }
    setErrors({});
    setStatus("not-configured");
    setAnnounceKey((k) => k + 1);
    setFocusRequest((r) => ({ target: "banner", seq: (r?.seq ?? 0) + 1 }));
    emit("sm:banner");
  };

  const change = (field: ContactField) => (value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (errors[field]) {
      const result = validate(contactSchema, next);
      const fieldError = result.ok
        ? undefined
        : (result.errors as Errors)[field];
      setErrors((prev) => ({ ...prev, [field]: fieldError }));
    }
  };

  const L = FORM_COPY.labels;
  return (
    <div className="@container">
      <div
        ref={rootRef}
        {...sm("form")}
        className="grid gap-4.5 noscript:hidden"
      >
        {status === "not-configured" ? (
          <NotConfiguredBanner key={announceKey} />
        ) : null}
        <form noValidate onSubmit={onSubmit} className="grid gap-4.5">
          <div className="@fields:grid-cols-2 grid gap-4.5">
            <FormField
              id={ID.name}
              label={L.name}
              value={values.name}
              onChange={change("name")}
              error={errors.name}
              autoComplete="name"
              maxLength={FIELD_LIMITS.name}
            />
            <FormField
              id={ID.email}
              label={L.email}
              type="email"
              value={values.email}
              onChange={change("email")}
              error={errors.email}
              autoComplete="email"
              maxLength={FIELD_LIMITS.email}
            />
          </div>
          <div className="@fields:grid-cols-2 grid gap-4.5">
            <SelectField
              id={ID.topic}
              label={L.topic}
              options={TOPIC_OPTIONS}
              value={values.topic}
              onChange={change("topic")}
              error={errors.topic}
            />
            <FormField
              id={ID.travelDate}
              label={L.travelDate}
              optional
              value={values.travelDate}
              onChange={change("travelDate")}
              maxLength={FIELD_LIMITS.travelDate}
            />
          </div>
          <FormField
            id={ID.message}
            label={L.message}
            multiline
            value={values.message}
            onChange={change("message")}
            error={errors.message}
            maxLength={FIELD_LIMITS.message}
          />
          <SubmitRow label={FORM_COPY.buttons.contact} hydrated={hydrated} />
        </form>
      </div>
      <div className="hidden noscript:block">
        <NoJsBlock />
      </div>
    </div>
  );
}
