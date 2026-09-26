import type { ReactNode } from "react";
import type {
  ClosingContent,
  PageHeaderContent,
  ProseBlock,
  TimelineRow,
} from "@/features/sobre-mi/types";
import { sm } from "@/features/sobre-mi/motion/attributes";

/**
 * /sobre-mi copy (spec § Page 1). Provenance per the spec: [md] strings are
 * verbatim from docs/content/sobre-mi-source.md (checked by the verbatim
 * oracle); [mock]/[new] strings are the spec's.
 */
export const SOBRE_MI: {
  header: PageHeaderContent & { dek: string };
  notes: readonly ReactNode[];
  body: readonly ProseBlock[];
  timeline: { notes: readonly string[]; rows: readonly TimelineRow[] };
  closing: ClosingContent;
} = {
  header: {
    // [mock] label; the "20" is an animated visual twin plus a final value
    // for assistive tech (AC 21).
    label: [
      "Sobre mí",
      "Montevideo → New York",
      <>
        +
        <span aria-hidden {...sm("count")}>
          20
        </span>
        <span className="sr-only">20</span> visitas
      </>,
    ],
    // [md: page name]
    title: "Sobre mí",
    // [md]
    dek: "Soy Belén, comunicadora, estratega digital y, sobre todo, una persona profundamente enamorada de New York.",
  },
  // [mock]
  notes: [
    "Belén",
    "Lic. en Comunicación",
    "Máster en Marketing Digital",
    <span key="independiente" className="mt-2.5 block">
      Independiente desde 2020
    </span>,
  ],
  body: [
    {
      kind: "p",
      text: "Soy Licenciada en Comunicación y tengo un Máster en Marketing Digital. Trabajo de forma independiente desde 2020 y, a fines de 2021, encontré la manera de unir mi profesión con uno de mis grandes amores: New York.",
    },
    { kind: "pull", text: "¿Se pueden amar lugares con locura?" },
    {
      kind: "p",
      text: "Me lo pregunto seguido y creo que sí. Aunque, si soy sincera, no sé si amo solamente la ciudad. Amo cómo me siento cuando estoy ahí: lo que me transmite, lo que descubro cada vez que vuelvo y todo lo que soy cuando camino por sus calles.",
    },
    {
      kind: "p",
      text: "La conocí a los 20 años y todavía me acuerdo de esa primera vez. Llegué sin grandes expectativas, porque había viajado para visitar a mi novio, que estaba en una ciudad cercana. Pero cuando subí las escaleras del subte y salí a la calle, empecé a escuchar sus ruidos, sentir sus olores y ver esa mezcla de personas, idiomas y energía. Y algo hizo clic.",
    },
    {
      kind: "photo",
      src: "/img/how-subway.webp",
      // [new]
      alt: "Salida de una estación de subte en Union Square, New York",
      // [new]
      caption: "Union Square, New York.",
    },
    { kind: "p", text: "Sentí que ese lugar tenía algo que ver conmigo." },
    {
      kind: "p",
      text: "Desde entonces volví más de 20 veces, y cada visita me confirma lo mismo: por más que la recorras, New York siempre guarda algo por descubrir.",
    },
    { kind: "headline", text: "Así nació Vamos a New York." },
    {
      kind: "p",
      text: "Lo que empezó como un espacio para contar mis experiencias se convirtió en una comunidad de personas que también sueñan con esta ciudad. Hoy comparto lugares, consejos y todo lo que aprendí en tantos viajes, pero también acompaño a quienes están por vivir el suyo.",
    },
    {
      kind: "p",
      text: "Porque para mí no se trata solo de conocer New York. Se trata de vivirla.",
    },
    {
      kind: "p",
      text: "Por eso, además de crear contenido, ayudo a organizar viajes con itinerarios personalizados y consultorías, pensados según tus intereses, tus tiempos y tu forma de viajar.",
    },
    {
      kind: "p",
      text: "Y hay una parte de este proyecto que me hace especialmente feliz: los viajes grupales.",
    },
    {
      kind: "p",
      text: "En 2024 acompañé mi primer grupo a New York y desde entonces ya van seis viajes. Cada uno tuvo su propia temática, su propia energía y una manera distinta de vivir la ciudad. Recorrerla juntos, descubrir lugares en grupo y ver a cada persona cumplir su sueño de conocer New York se convirtió en una de mis partes favoritas de Vamos a New York.",
    },
    {
      kind: "p",
      text: "Después de tantos viajes, tengo algo cada vez más claro: New York siempre tiene algo nuevo para mostrar.",
    },
    {
      kind: "p",
      text: "Y yo sigo feliz de volver, descubrirla y, sobre todo, compartirla con vos.",
    },
    // [mock]
    { kind: "signature", text: "Belén" },
  ],
  // [mock]
  timeline: {
    notes: ["En el camino", "20 años → hoy"],
    rows: [
      {
        time: "20 años",
        title: "La primera vez",
        line: "Subí las escaleras del subte y algo hizo clic.",
        tag: "New York",
      },
      {
        time: "2020",
        title: "Independiente",
        line: "Comunicación y estrategia digital, por mi cuenta.",
      },
      {
        time: "2021",
        title: "Nace Vamos a New York",
        line: "Mi profesión y la ciudad, juntas.",
      },
      {
        time: "2024",
        title: "Primer viaje grupal",
        line: "Desde entonces, seis viajes.",
        tag: "6 grupos",
      },
      { time: "Hoy", title: "+20 visitas", line: "Y sigo volviendo." },
    ],
  },
  // [mock, edited by the user]
  closing: {
    headline: "¿Armamos tu viaje juntos?",
    primary: { label: "Ver itinerarios", href: "/#services" },
    secondary: {
      label: "Viajes grupales",
      href: "/preguntas-frecuentes#viajes-grupales",
    },
  },
};
