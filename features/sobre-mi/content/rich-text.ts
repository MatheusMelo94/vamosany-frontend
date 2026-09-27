import type { HttpsUrl, RichText } from "@/features/sobre-mi/types";

/** The text a reader sees, without link markup (for the verbatim oracle). */
export function plainText(text: RichText): string {
  return text.map((s) => (typeof s === "string" ? s : s.text)).join("");
}

/** Narrows an outbound href to https (new-tab ExternalLink) vs mailto. */
export function isHttpsUrl(href: string): href is HttpsUrl {
  return href.startsWith("https://");
}
