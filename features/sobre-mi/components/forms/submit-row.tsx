import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { sm } from "@/features/sobre-mi/motion/attributes";

type Props = { label: string; hydrated: boolean };

/**
 * The form's only button, 220px min (spec § Form States). Until the leaf has
 * hydrated it is `type="button"`, so a tap before the page is interactive
 * submits nothing (plan § 0.1 F3; Security G1 R-01). No helper line in this
 * release (spec v1.1).
 */
export function SubmitRow({ label, hydrated }: Props): JSX.Element {
  return (
    // data-sm-field: the button row reveals with the fields (TDD § 4.2, M2).
    <div {...sm("field")} className="flex flex-wrap items-center gap-3">
      <Button type={hydrated ? "submit" : "button"} className="min-w-55">
        {label}
      </Button>
    </div>
  );
}
