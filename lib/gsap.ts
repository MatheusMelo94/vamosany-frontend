import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/** Unico ponto de registro de plugins (frontend-architecture-conventions § Animation). */
gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase, SplitText);

export { gsap, useGSAP, ScrollTrigger, CustomEase, SplitText };
