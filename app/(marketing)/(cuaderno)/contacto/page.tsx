import type { Metadata } from "next";
import type { JSX } from "react";
import { ContactoPage } from "@/features/sobre-mi/components/contacto-page";
import { PAGE_METADATA } from "@/features/sobre-mi/content/metadata";

export const metadata: Metadata = PAGE_METADATA.contacto;

export default function Page(): JSX.Element {
  return <ContactoPage />;
}
