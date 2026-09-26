import type { Metadata } from "next";
import type { JSX } from "react";
import { FaqPage } from "@/features/sobre-mi/components/faq-page";
import { PAGE_METADATA } from "@/features/sobre-mi/content/metadata";

export const metadata: Metadata = PAGE_METADATA.faq;

export default function Page(): JSX.Element {
  return <FaqPage />;
}
