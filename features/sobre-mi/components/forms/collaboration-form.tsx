"use client";

import type { JSX } from "react";
import { FIELD_LIMITS, collaborationSchema } from "@/features/sobre-mi/schemas";
import type { CollaborationField } from "@/features/sobre-mi/schemas";
import {
  COLLABORATION_OPTIONS,
  FORM_COPY,
} from "@/features/sobre-mi/content/forms";
import { useUiOnlyForm } from "@/features/sobre-mi/hooks/use-ui-only-form";
import { FormField } from "@/features/sobre-mi/components/forms/form-field";
import { SelectField } from "@/features/sobre-mi/components/forms/select-field";
import { UiOnlyFormShell } from "@/features/sobre-mi/components/forms/ui-only-form-shell";

const FIELDS: readonly CollaborationField[] = [
  "name",
  "company",
  "collaborationType",
  "email",
  "idea",
];

const ID: Record<CollaborationField, string> = {
  name: "collab-name",
  company: "collab-company",
  collaborationType: "collab-type",
  email: "collab-email",
  idea: "collab-idea",
};

/**
 * Trabajá conmigo "cafecito" form, UI-only release (spec v1.1 § Form States,
 * § Page 3; plan § 0.1). Same behaviour as ContactForm (useUiOnlyForm).
 */
export function CollaborationForm(): JSX.Element {
  const form = useUiOnlyForm({
    schema: collaborationSchema,
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
      buttonLabel={FORM_COPY.buttons.collaboration}
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
          id={ID.company}
          label={L.company}
          value={values.company}
          onChange={change("company")}
          error={errors.company}
          autoComplete="organization"
          maxLength={FIELD_LIMITS.company}
        />
      </div>
      <div className="@fields:grid-cols-2 grid gap-4.5">
        <SelectField
          id={ID.collaborationType}
          label={L.collaborationType}
          options={COLLABORATION_OPTIONS}
          value={values.collaborationType}
          onChange={change("collaborationType")}
          error={errors.collaborationType}
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
      <FormField
        id={ID.idea}
        label={L.idea}
        multiline
        value={values.idea}
        onChange={change("idea")}
        error={errors.idea}
        maxLength={FIELD_LIMITS.idea}
      />
    </UiOnlyFormShell>
  );
}
