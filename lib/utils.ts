import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Compoe classes Tailwind: condicionais via clsx, conflitos resolvidos por tailwind-merge (a ultima vence). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Stable, lowercase ASCII anchor from Spanish text: accents and ñ fold to
 * their base letter, "¿", "¡" and punctuation drop, runs become one "-".
 * "¿Qué es un itinerario personalizado?" → "que-es-un-itinerario-personalizado".
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
