import type { Metadata } from "next";
import type { JSX } from "react";
import { GuiasHomePage } from "@/features/guias/components/guias-home-page";
import { homeMetadata } from "@/features/guias/content/metadata";

export const metadata: Metadata = homeMetadata;

export default function Page(): JSX.Element {
  return <GuiasHomePage />;
}
