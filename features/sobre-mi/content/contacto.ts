import type { HttpsUrl, PageHeaderContent } from "@/features/sobre-mi/types";

export type Channel = {
  label: string;
  value: string;
  href: HttpsUrl | `mailto:${string}`;
};

/**
 * /contacto copy (spec § Page 4). [md] Título and Texto (brackets dropped,
 * Resolved Clarification 1) and the "Otras formas de encontrarme" list;
 * social URLs accepted by the user (Resolved Clarification 7).
 */
export const CONTACTO: {
  header: PageHeaderContent & { title: string; dek: string };
  channels: { heading: string; items: readonly Channel[] };
} = {
  header: {
    // [mock]
    label: ["Contacto", "respondo yo"],
    // [md] Título
    title: "Escribime, te respondo yo.",
    // [md] Texto, documented exception
    dek: "¿Estás planificando tu viaje a New York, tenés una duda sobre algún servicio o querés proponerme una colaboración? Contame lo que necesites. Cada mensaje lo leo y lo respondo yo, así que puede que tarde un par de días en contestarte, pero siempre respondo.",
  },
  channels: {
    // [md] (the md line ends with ":")
    heading: "Otras formas de encontrarme",
    items: [
      {
        label: "Email",
        value: "hola@vamosany.com",
        href: "mailto:hola@vamosany.com",
      },
      {
        label: "Instagram",
        value: "@vamosany",
        href: "https://www.instagram.com/vamosany/",
      },
      {
        label: "TikTok",
        value: "@vamosany",
        href: "https://www.tiktok.com/@vamosany",
      },
    ],
  },
};
