import type { JSX } from "react";
import { CuadernoMotion } from "@/features/sobre-mi/components/cuaderno-motion";
import { sm } from "@/features/sobre-mi/motion/attributes";
import { ClosingRow } from "@/features/sobre-mi/components/closing-row";
import { NotesLayout } from "@/features/sobre-mi/components/notes-layout";
import { PageHeader } from "@/features/sobre-mi/components/page-header";
import { Prose } from "@/features/sobre-mi/components/prose";
import { Timeline } from "@/features/sobre-mi/components/timeline";
import { SOBRE_MI } from "@/features/sobre-mi/content/sobre-mi";

/** /sobre-mi (spec § Page 1): Belén's story, the timeline and the closing row. */
export function SobreMiPage(): JSX.Element {
  return (
    <div {...sm("scene", "sobre-mi")} className="container-ds pb-16">
      <CuadernoMotion />
      <PageHeader {...SOBRE_MI.header} />
      <NotesLayout notes={SOBRE_MI.notes}>
        <Prose blocks={SOBRE_MI.body} />
      </NotesLayout>
      <section className="pt-12 md:pt-16">
        <NotesLayout heading notes={SOBRE_MI.timeline.notes}>
          <Timeline rows={SOBRE_MI.timeline.rows} />
        </NotesLayout>
      </section>
      <ClosingRow {...SOBRE_MI.closing} />
    </div>
  );
}
