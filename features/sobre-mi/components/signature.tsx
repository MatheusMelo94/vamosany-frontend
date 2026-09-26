import type { JSX } from "react";
import { sm } from "@/features/sobre-mi/motion/attributes";
import { signatureItalic } from "@/features/sobre-mi/fonts";
import { cn } from "@/lib/utils";

type Props = { text: string };

/** Belén's signature under the story (spec § Page 1 item 16), in the real
    Courier Prime italic (plan D7); M3 writes it on. */
export function Signature({ text }: Props): JSX.Element {
  return (
    // arbitrary: 28px signature (spec § Page 1 item 16); no type-scale step
    <p
      {...sm("signature")}
      className={cn(
        signatureItalic.className,
        "text-ink mt-1.5 text-[1.75rem] leading-none italic",
      )}
    >
      {text}
    </p>
  );
}
