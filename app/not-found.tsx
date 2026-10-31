import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

export default function NotFound(): JSX.Element {
  return (
    <main className="container-ds flex min-h-svh flex-col justify-center py-24">
      <SectionHeading
        eyebrow="404"
        title="Esta cuadra no está en el mapa."
        description="La página que buscabas no existe o cambió de lugar. Volvé al inicio para seguir armando tu viaje."
      />
      <div className="mt-8">
        <Button href="/">Volver al inicio</Button>
      </div>
    </main>
  );
}
