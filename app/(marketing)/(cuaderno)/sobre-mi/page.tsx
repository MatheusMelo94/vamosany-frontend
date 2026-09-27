import type { Metadata } from "next";
import type { JSX } from "react";
import { SobreMiPage } from "@/features/sobre-mi/components/sobre-mi-page";
import { PAGE_METADATA } from "@/features/sobre-mi/content/metadata";

export const metadata: Metadata = PAGE_METADATA.sobreMi;

export default function Page(): JSX.Element {
  return <SobreMiPage />;
}
