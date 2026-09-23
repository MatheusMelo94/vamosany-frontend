import type { JSX } from "react";
import { Blog } from "@/features/landing/components/blog";
import { CTA } from "@/features/landing/components/cta";
import { DashboardPreview } from "@/features/landing/components/dashboard-preview";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/features/landing/components/hero";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { Included } from "@/features/landing/components/included";
import { Navbar } from "@/components/layout/navbar";
import { NeighborhoodTicker } from "@/features/landing/components/neighborhood-ticker";
import { Overscroll } from "@/features/landing/motion/overscroll";
import { PlanningTimeline } from "@/features/landing/components/planning-timeline";
import { Reviews } from "@/features/landing/components/reviews";
import { SampleDay } from "@/features/landing/components/sample-day";
import { Services } from "@/features/landing/components/services";
import { ScrollEffects } from "@/features/landing/motion/scroll-effects";
import { Stats } from "@/features/landing/components/stats";

export default function Home(): JSX.Element {
  return (
    <>
      <ScrollEffects />
      <Overscroll />
      <Navbar />
      <main>
        <Hero />
        <NeighborhoodTicker />
        <DashboardPreview />
        <Services />
        <SampleDay />
        <HowItWorks />
        <PlanningTimeline />
        <Stats />
        <Reviews />
        <Blog />
        <Included />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
