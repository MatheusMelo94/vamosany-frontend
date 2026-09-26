import { z } from "zod";
import {
  COLLABORATION_OPTIONS,
  FORM_COPY,
  TOPIC_OPTIONS,
} from "@/features/sobre-mi/content/forms";

/**
 * One zod schema per form (frontend-architecture-conventions § Forms &
 * Validation). This release validates on the client only: nothing is sent
 * (plan § 0.1 F1). The limits are also the inputs' `maxLength`, so an
 * over-length error isn't reachable from the UI (plan § 5, § 14 Q2).
 */
export const FIELD_LIMITS = {
  name: 100,
  email: 254,
  company: 120,
  travelDate: 60,
  message: 5000,
  idea: 5000,
} as const;

const E = FORM_COPY.errors;

const required = (message: string, max: number) =>
  z.string().trim().min(1, { error: message }).max(max);

const email = z
  .string()
  .trim()
  .min(1, { error: E.emailEmpty })
  .max(FIELD_LIMITS.email)
  .pipe(z.email({ error: E.emailMalformed }));

const slugs = <T extends readonly { value: string }[]>(options: T) =>
  options.map((o) => o.value) as [T[number]["value"], ...T[number]["value"][]];

export const contactSchema = z.object({
  name: required(E.name, FIELD_LIMITS.name),
  email,
  topic: z.enum(slugs(TOPIC_OPTIONS), { error: E.topic }),
  travelDate: z
    .string()
    .trim()
    .max(FIELD_LIMITS.travelDate)
    .transform((v) => (v === "" ? null : v)),
  message: required(E.message, FIELD_LIMITS.message),
});

export const collaborationSchema = z.object({
  name: required(E.name, FIELD_LIMITS.name),
  company: required(E.company, FIELD_LIMITS.company),
  collaborationType: z.enum(slugs(COLLABORATION_OPTIONS), {
    error: E.collaborationType,
  }),
  email,
  idea: required(E.idea, FIELD_LIMITS.idea),
});

export type ContactField = keyof z.input<typeof contactSchema>;
export type CollaborationField = keyof z.input<typeof collaborationSchema>;

export type ValidationResult<S extends z.ZodType> =
  | { ok: true; data: z.output<S> }
  | { ok: false; errors: Partial<Record<string, string>> };

/** Parses form values; on failure, the first message per field. */
export function validate<S extends z.ZodType>(
  schema: S,
  values: Record<string, string>,
): ValidationResult<S> {
  const result = schema.safeParse(values);
  if (result.success) return { ok: true, data: result.data };
  const errors: Partial<Record<string, string>> = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !(field in errors)) errors[field] = issue.message;
  }
  return { ok: false, errors };
}
