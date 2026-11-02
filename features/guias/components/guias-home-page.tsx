import type { JSX } from "react";
import { GroupStripe } from "@/features/guias/components/group-stripe";
import { GuideHeading } from "@/features/guias/components/guide-heading";
import { GROUPS } from "@/features/guias/content/groups";
import { HOME_INTRO } from "@/features/guias/content/home";

/**
 * /guias (spec § Page Structure › Guías home): a centered head and the 12
 * guides in their 3 menu groups. Static; no state.
 */
export function GuiasHomePage(): JSX.Element {
  return (
    <div>
      <div className="container-ds pt-12 pb-8 md:pt-20 md:pb-12">
        <GuideHeading
          eyebrow="Guías"
          title="Todo lo que necesitás para moverte por New York"
          marked="Todo lo que necesitás"
          dek={HOME_INTRO}
          align="center"
        />
      </div>
      {GROUPS.map((group, index) => (
        <GroupStripe key={group.id} group={group} index={index} />
      ))}
    </div>
  );
}
