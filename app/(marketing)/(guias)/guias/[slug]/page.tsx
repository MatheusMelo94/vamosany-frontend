import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import { GuidePage } from "@/features/guias/components/guide-page";
import { getGuide } from "@/features/guias/content/guides";
import { guideMetadata } from "@/features/guias/content/metadata";
import { GUIDE_SLUGS } from "@/features/guias/content/slugs";

type Props = { params: Promise<{ slug: string }> };

/** Only the 12 slugs exist; anything else is a 404 (plan D-6). */
export const dynamicParams = false;

export function generateStaticParams(): Array<{ slug: string }> {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return guideMetadata(slug);
}

export default async function Page({ params }: Props): Promise<JSX.Element> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  return <GuidePage guide={guide} />;
}
