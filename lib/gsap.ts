import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Registro do nucleo (frontend-architecture-conventions § Animation). Todo modulo importa
 * gsap daqui, nunca de "gsap" direto. Os plugins de texto (SplitText) ficam em
 * lib/gsap-text.ts e o CustomEase em lib/gsap-ease.ts, para nao entrarem no First Load JS
 * de quem so precisa do ScrollTrigger.
 */
gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Gate global: o inline script em app/layout.tsx poe `.gsap` no <html> quando ha JS e motion nao esta reduzido (ADR-0002). */
export const motionEnabled = (): boolean =>
  document.documentElement.classList.contains("gsap");

export { gsap, useGSAP, ScrollTrigger };
