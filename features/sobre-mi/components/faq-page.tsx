import type { JSX } from "react";
import { ClosingRow } from "@/features/sobre-mi/components/closing-row";
import { FaqDeepLink } from "@/features/sobre-mi/components/faq-deep-link";
import { FaqGroup } from "@/features/sobre-mi/components/faq-group";
import { PageHeader } from "@/features/sobre-mi/components/page-header";
import { FAQ } from "@/features/sobre-mi/content/faq";

/** /preguntas-frecuentes (spec § Page 5): three groups of native disclosures. */
export function FaqPage(): JSX.Element {
  return (
    <div className="container-ds pb-16">
      <FaqDeepLink />
      <PageHeader {...FAQ.header} />
      <div className="grid gap-11">
        {FAQ.groups.map((group) => (
          <FaqGroup key={group.name} group={group} />
        ))}
      </div>
      <ClosingRow {...FAQ.closing} />
    </div>
  );
}
