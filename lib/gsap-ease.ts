import { gsap } from "@/lib/gsap";
import { CustomEase } from "gsap/CustomEase";
import { EASE } from "@/lib/motion";

/**
 * CustomEase and the brand eases, split out of lib/gsap-text.ts so modules that
 * need `arrive`/`ds` but not SplitText (the navbar marker) don't pull SplitText
 * into their chunk (TDD sobre-mi § 4.1, plan § 8.3).
 */
gsap.registerPlugin(CustomEase);

let eases: { ds: gsap.EaseFunction; arrive: gsap.EaseFunction } | undefined;
/** Cria as CustomEases uma vez, no cliente, quando o primeiro modulo precisa delas. */
export function getEases(): {
  ds: gsap.EaseFunction;
  arrive: gsap.EaseFunction;
} {
  eases ??= {
    ds: CustomEase.create("ds", EASE.ds),
    arrive: CustomEase.create("arrive", EASE.arrive),
  };
  return eases;
}

export { CustomEase };
