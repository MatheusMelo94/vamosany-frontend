import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Registro do nucleo (frontend-architecture-conventions § Animation). Todo modulo importa
 * gsap daqui, nunca de "gsap" direto. Os plugins de texto (SplitText, CustomEase) ficam em
 * lib/gsap-text.ts para nao entrar no First Load JS de quem so precisa do ScrollTrigger.
 */
gsap.registerPlugin(useGSAP, ScrollTrigger);

export { gsap, useGSAP, ScrollTrigger };
