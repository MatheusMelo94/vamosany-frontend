import type { JSX } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** Brand mark — the v-pretzel-ny wordmark. `tone="light"` is the
    knock-out version for dark surfaces and photography. */
type Props = {
  className?: string;
  tone?: "dark" | "light";
};

export function BrandLogo({
  className = "",
  tone = "dark",
}: Props): JSX.Element {
  return (
    <Image
      src={tone === "dark" ? "/logo-pretzel-dark.png" : "/logo-pretzel.png"}
      alt="Vamos a NY"
      width={1196}
      height={395}
      priority
      className={cn("h-7 w-auto", className)}
    />
  );
}
