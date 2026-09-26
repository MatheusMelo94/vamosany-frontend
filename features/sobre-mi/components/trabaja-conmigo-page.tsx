import type { JSX, ReactNode } from "react";
import { AudienceRows } from "@/features/sobre-mi/components/audience-rows";
import { NotesLayout } from "@/features/sobre-mi/components/notes-layout";
import { PageHeader } from "@/features/sobre-mi/components/page-header";
import { TRABAJA_CONMIGO } from "@/features/sobre-mi/content/trabaja-conmigo";
import { sm } from "@/features/sobre-mi/motion/attributes";

type Props = {
  /** The cafecito form, placed right after the Cierre (T030). */
  form?: ReactNode;
};

/**
 * /trabaja-conmigo (spec § Page 3): intro, five audience rows and the
 * cafecito section. No closing row: the form is the closing action.
 */
export function TrabajaConmigoPage({ form }: Props): JSX.Element {
  const { header, notes, intro, audiences, cafecito } = TRABAJA_CONMIGO;
  return (
    <div className="container-ds pb-16">
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
            {form}
          </div>
        </NotesLayout>
      </section>
    </div>
  );
}
