import { cn } from "@/lib/utils";

/**
 * Field control look (spec § Form States): 2px ink border, 4px radius; an
 * error adds the inset 3px brand bar under the value, keeping the border.
 */
export function controlClasses(invalid: boolean): string {
  return cn(
    "border-ink bg-canvas text-ink w-full rounded-sm border-2 px-3 py-2.5 text-base",
    // arbitrary: inset 3px brand bar for Field error (spec); no shadow token draws it
    invalid && "shadow-[inset_0_-3px_0_var(--color-brand)]",
  );
}
