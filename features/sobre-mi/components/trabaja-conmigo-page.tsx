import type { JSX } from "react";
import { CuadernoMotion } from "@/features/sobre-mi/components/cuaderno-motion";
import { AudienceRows } from "@/features/sobre-mi/components/audience-rows";
import { CollaborationForm } from "@/features/sobre-mi/components/forms/collaboration-form";
import { NotesLayout } from "@/features/sobre-mi/components/notes-layout";
import { PageHeader } from "@/features/sobre-mi/components/page-header";
import { TRABAJA_CONMIGO } from "@/features/sobre-mi/content/trabaja-conmigo";
import { sm } from "@/features/sobre-mi/motion/attributes";

/**
 * /trabaja-conmigo (spec § Page 3): intro, five audience rows and the
 * cafecito section. No closing row: the form is the closing action.
 */
export function TrabajaConmigoPage(): JSX.Element {
  const { header, notes, intro, audiences, cafecito } = TRABAJA_CONMIGO;
  return (
    <div {...sm("scene", "trabaja-conmigo")} className="container-ds pb-16">
      <CuadernoMotion />
      <PageHeader {...header} />
      <NotesLayout notes={notes}>
        <p {...sm("reveal")} className="body-prose text-ink max-w-190">
          {intro}
        </p>
        <AudienceRows rows={audiences} />
      </NotesLayout>
      <section className="pt-12 md:pt-16">
        <NotesLayout heading notes={cafecito.notes}>
          <div className="grid gap-7">
            {/* arbitrary: 62ch Cierre measure (mockup); --container-prose is 65ch */}
            <p
              {...sm("reveal")}
              className="body-lg text-ink max-w-[62ch] text-pretty"
            >
              {cafecito.cierre}
            </p>
            <CollaborationForm />
          </div>
        </NotesLayout>
      </section>
    </div>
  );
}
