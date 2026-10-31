import type { JSX } from "react";
import { Blog } from "@/features/landing/components/blog";
import { CTA } from "@/features/landing/components/cta";
import { DashboardPreview } from "@/features/landing/components/dashboard-preview";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/features/landing/components/hero";
import { MotionControllers } from "@/features/landing/motion/motion-controllers";
import { Navbar } from "@/components/layout/navbar";
import { NeighborhoodTicker } from "@/features/landing/components/neighborhood-ticker";
import { Recommendations } from "@/features/landing/components/recommendations";
import { Reviews } from "@/features/landing/components/reviews";
import { Services } from "@/features/landing/components/services";
import { Stats } from "@/features/landing/components/stats";

export default function Home(): JSX.Element {
  return (
    <>
      <MotionControllers />
      <Navbar />
      <main>
        <Hero />
        <NeighborhoodTicker />
        <DashboardPreview />
        <Services />
        <Recommendations />
        <Stats />
        <Reviews />
        <Blog />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
