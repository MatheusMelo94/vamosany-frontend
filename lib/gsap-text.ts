import { gsap } from "@/lib/gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { EASE } from "@/lib/motion";

/** Plugins de texto, registrados uma vez; importados apenas pelo ScrollEffects (chunk dinamico). */
gsap.registerPlugin(CustomEase, SplitText);

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

export { CustomEase, SplitText };
