import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Compoe classes Tailwind: condicionais via clsx, conflitos resolvidos por tailwind-merge (a ultima vence). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
