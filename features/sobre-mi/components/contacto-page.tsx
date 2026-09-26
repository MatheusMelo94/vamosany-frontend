import type { JSX } from "react";
import { ChannelList } from "@/features/sobre-mi/components/channel-list";
import { ContactForm } from "@/features/sobre-mi/components/forms/contact-form";
import { NotesLayout } from "@/features/sobre-mi/components/notes-layout";
import { PageHeader } from "@/features/sobre-mi/components/page-header";
import { CONTACTO } from "@/features/sobre-mi/content/contacto";

/**
 * /contacto (spec § Page 4): the other channels in the notes column, the
 * form in the main column. No closing row: the form is the closing action.
 */
export function ContactoPage(): JSX.Element {
  const { header, channels } = CONTACTO;
  return (
    <div className="container-ds pb-16">
      <PageHeader {...header} />
      <NotesLayout
        heading
        notes={[
          channels.heading,
          <ChannelList key="channels" channels={channels.items} />,
        ]}
      >
        <ContactForm />
      </NotesLayout>
    </div>
  );
}
