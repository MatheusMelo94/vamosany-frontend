import type { JSX } from "react";
import { sm } from "@/features/sobre-mi/motion/attributes";

type Props = { text: string; lang?: string };

/**
 * A display pull line with its own train marker (spec § Page 1 item 2,
 * § Page 2 Efe Hus quote). The marker sits in place without motion; M3/M4
 * sweep it in on scroll (`data-sm-sweep`).
 */
export function PullLine({ text, lang }: Props): JSX.Element {
  return (
    // arbitrary: 26ch pull-line measure (spec § Page 1); no measure token
    <p lang={lang} className="display-pull text-ink max-w-[26ch] text-balance">
      <span {...sm("sweep")} className="highlight-heading">
        {text}
      </span>
    </p>
  );
}
