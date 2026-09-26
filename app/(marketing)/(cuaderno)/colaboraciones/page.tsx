import type { Metadata } from "next";
import type { JSX } from "react";
import { ColaboracionesPage } from "@/features/sobre-mi/components/colaboraciones-page";
import { PAGE_METADATA } from "@/features/sobre-mi/content/metadata";

export const metadata: Metadata = PAGE_METADATA.colaboraciones;

export default function Page(): JSX.Element {
  return <ColaboracionesPage />;
}
