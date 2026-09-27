"use client";

import type { JSX } from "react";
import { FIELD_LIMITS, contactSchema } from "@/features/sobre-mi/schemas";
import type { ContactField } from "@/features/sobre-mi/schemas";
import { FORM_COPY, TOPIC_OPTIONS } from "@/features/sobre-mi/content/forms";
import { useUiOnlyForm } from "@/features/sobre-mi/hooks/use-ui-only-form";
import { FormField } from "@/features/sobre-mi/components/forms/form-field";
import { SelectField } from "@/features/sobre-mi/components/forms/select-field";
import { UiOnlyFormShell } from "@/features/sobre-mi/components/forms/ui-only-form-shell";

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

/**
 * Contacto form, UI-only release (spec v1.1 § Form States; plan § 0.1).
 * Behaviour lives in useUiOnlyForm; a valid submit sends nothing and shows
 * the Not-configured banner. Imports no GSAP (F8).
 */
export function ContactForm(): JSX.Element {
  const form = useUiOnlyForm({
    schema: contactSchema,
    fields: FIELDS,
    ids: ID,
  });
  const { values, errors, change } = form;
  const L = FORM_COPY.labels;
  return (
    <UiOnlyFormShell
      rootRef={form.rootRef}
      showBanner={form.status === "not-configured"}
      announceKey={form.announceKey}
      onSubmit={form.onSubmit}
      buttonLabel={FORM_COPY.buttons.contact}
      hydrated={form.hydrated}
    >
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
    </UiOnlyFormShell>
  );
}
