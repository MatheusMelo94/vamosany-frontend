import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import type { GuideCta } from "@/features/guias/types";

/** Every guide's button goes to the landing's Servicios section (user decision 4). */
const ITINERARY_HREF = "/#services";

/**
 * Closing black band (`inverse-canvas`, `inverse-ink`, 20px radius) with a
 * yellow pill button. Standard guides: the Doc's bold question as a paragraph
 * (not a heading, to keep the outline clean) and "Quiero mi itinerario".
 * Visa: the "Te ayudo con tu visa" section is the band: its H2 keeps its id
 * and is focusable by the index (rule 4).
 */
export function CtaBand({ cta }: { cta: GuideCta }): JSX.Element {
  const button = (
    <Button
      href={ITINERARY_HREF}
      pill
      className="border-brand shrink-0 whitespace-normal"
    >
      {cta.label}
    </Button>
  );

  if ("heading" in cta) {
    return (
      <div className="bg-inverse-canvas text-inverse-ink mt-12 grid justify-items-start gap-4 rounded-lg p-6 md:p-9">
        <h2 id={cta.id} tabIndex={-1} className="headline scroll-mt-28">
          {cta.heading}
        </h2>
        <p>{cta.body}</p>
        {button}
      </div>
    );
  }

  return (
    <div className="bg-inverse-canvas text-inverse-ink mt-12 flex flex-wrap items-center justify-between gap-5 rounded-lg p-6 md:p-9">
      {/* arbitrary: 30ch keeps the question to 2-3 balanced lines (prototype .cta p) */}
      <p className="card-title max-w-[30ch]">{cta.lead}</p>
      {button}
    </div>
  );
}
