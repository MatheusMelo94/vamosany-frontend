import { Courier_Prime } from "next/font/google";

/**
 * Courier Prime italic 400 for Belén's signature only (plan D7; spec § Token
 * Proposals 2: real italic instead of a faux one). A second next/font instance
 * so the root layout and the landing are untouched; `preload: false`, so the
 * face is fetched only when a page that uses it renders the signature.
 */
export const signatureItalic = Courier_Prime({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
  preload: false,
});
