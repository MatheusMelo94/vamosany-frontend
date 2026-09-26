import type { JSX } from "react";
import type { FaqGroupContent } from "@/features/sobre-mi/content/faq";
import { sm } from "@/features/sobre-mi/motion/attributes";
import { slugify } from "@/lib/utils";
import { FaqItem } from "@/features/sobre-mi/components/faq-item";
import { NotesLayout } from "@/features/sobre-mi/components/notes-layout";

type Props = { group: FaqGroupContent };

/** A FAQ group: its name (h2) and count in the notes column, questions beside. */
export function FaqGroup({ group }: Props): JSX.Element {
  const count = group.questions.length;
  return (
    <section id={slugify(group.name)} {...sm("anchor")}>
      <NotesLayout
        heading
        notes={[
          group.name,
          `${count} ${count === 1 ? "pregunta" : "preguntas"}`,
        ]}
      >
        <div {...sm("faqGroup")}>
          {group.questions.map((item) => (
            <FaqItem key={item.question} item={item} />
          ))}
        </div>
      </NotesLayout>
    </section>
  );
}
