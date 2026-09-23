import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

export default function NotFound(): JSX.Element {
  return (
    <main className="container-ds flex min-h-svh flex-col justify-center py-24">
      <SectionHeading
        eyebrow="404"
        title="This block is not on the map."
        description="The page you were looking for does not exist or has moved. Head back to the itineraries."
      />
      <div className="mt-8">
        <Button href="/">Back to the start</Button>
      </div>
    </main>
  );
}
