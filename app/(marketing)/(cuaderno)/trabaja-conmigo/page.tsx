import type { Metadata } from "next";
import type { JSX } from "react";
import { TrabajaConmigoPage } from "@/features/sobre-mi/components/trabaja-conmigo-page";
import { PAGE_METADATA } from "@/features/sobre-mi/content/metadata";

export const metadata: Metadata = PAGE_METADATA.trabajaConmigo;

export default function Page(): JSX.Element {
  return <TrabajaConmigoPage />;
}
