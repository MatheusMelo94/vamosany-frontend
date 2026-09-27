import { gsap } from "@/lib/gsap";
import { SplitText } from "gsap/SplitText";
import { CustomEase, getEases } from "@/lib/gsap-ease";

/** Plugins de texto, registrados uma vez; importados apenas pelo ScrollEffects (chunk dinamico). */
gsap.registerPlugin(SplitText);

export { CustomEase, SplitText, getEases };
