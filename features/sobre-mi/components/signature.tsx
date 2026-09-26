import type { JSX } from "react";
import { sm } from "@/features/sobre-mi/motion/attributes";

type Props = { text: string };

/** Belén's signature under the story (spec § Page 1 item 16); M3 writes it on. */
export function Signature({ text }: Props): JSX.Element {
  return (
    // arbitrary: 28px signature (spec § Page 1 item 16); no type-scale step
    <p
      {...sm("signature")}
      className="font-display text-ink mt-1.5 text-[1.75rem] leading-none"
    >
      {text}
    </p>
  );
}
