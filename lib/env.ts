import { z } from "zod";

/**
 * Unico lugar que le process.env (frontend-architecture-conventions § Configuration & Environment).
 * NEXT_PUBLIC_SITE_URL tem default enquanto o dominio de producao nao e informado
 * (docs/decisions-2026-09-23.md #6); quando for, remover o default para o build falhar sem a var.
 */
const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url()
    .default("https://vamosany.example.com"),
});

export const env = schema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});
