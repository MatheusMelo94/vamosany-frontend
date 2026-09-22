import { Blog } from "@/components/blog";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Included } from "@/components/included";
import { Navbar } from "@/components/navbar";
import { NeighborhoodTicker } from "@/components/neighborhood-ticker";
import { Overscroll } from "@/components/overscroll";
import { PlanningTimeline } from "@/components/planning-timeline";
import { Reviews } from "@/components/reviews";
import { SampleDay } from "@/components/sample-day";
import { Services } from "@/components/services";
import { ScrollEffects } from "@/components/scroll-effects";
import { Stats } from "@/components/stats";

export default function Home() {
  return (
    <>
      <ScrollEffects />
      <Overscroll />
      <Navbar />
      <main>
        <Hero />
        <NeighborhoodTicker />
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
