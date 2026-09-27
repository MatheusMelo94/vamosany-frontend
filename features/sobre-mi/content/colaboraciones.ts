import type {
  ClosingAction,
  LedgerRow,
  PageHeaderContent,
  RichText,
} from "@/features/sobre-mi/types";

/**
 * /colaboraciones copy (spec § Page 2). [md] strings are verbatim from
 * docs/content/sobre-mi-source.md; the two titles without their years and
 * the quote's curly quotes are the oracle's documented exceptions.
 */
export const COLABORACIONES: {
  header: PageHeaderContent & { dek: string };
  rows: readonly LedgerRow[];
  closing: {
    headline: string;
    text: RichText;
    primary: ClosingAction;
    secondary: ClosingAction;
  };
} = {
  header: {
    // [mock]
    label: ["Colaboraciones", "7 productos", "2022 → 2026"],
    // [md: page name]
    title: "Colaboraciones",
    // [md]
    dek: "Además de itinerarios y consultorías, con los años fui creando productos para quienes aman New York tanto como yo. Todos nacieron de algo que yo quería tener y no encontraba, y casi siempre de la mano de personas y marcas que admiro. Cada uno tiene su historia, y acá te las cuento.",
  },
  rows: [
    {
      year: "2022",
      partner: { text: "Estudio Ulbia", href: "https://estudioulbia.com/" },
      title: "El cuaderno que empezó todo",
      story: [
        {
          kind: "p",
          text: [
            "A principios de 2022 le escribí a Lu, de ",
            { text: "Estudio Ulbia", href: "https://estudioulbia.com/" },
            ", con un pedido muy simple: quería un cuaderno de New York para mí. No había ninguna idea de venderlo. Un día lo mostré en una foto, casi por casualidad, y empezaron a llegar mensajes preguntando dónde se conseguía. Esos primeros pedidos me hicieron ver que había muchas personas que querían llevar un pedacito de New York en su día a día, y así nació la línea de productos de Vamos a New York.",
          ],
        },
      ],
    },
    {
      year: "2023",
      partner: { text: "Con Lu, Estudio Ulbia" },
      title: "Agenda Vamos a New York 2023",
      story: [
        {
          kind: "p",
          text: [
            "Después del cuaderno vino algo que yo misma necesitaba y no existía: una agenda pensada para quienes viven soñando con New York. La diseñamos con Lu cuidando cada detalle, con stickers, planner, un organizador personalizado y los eventos y actividades destacadas de cada mes en la ciudad, para que planificar el año también fuera una forma de estar un poco allá. La recepción de la comunidad me sorprendió muchísimo, y fue la confirmación de que este camino tenía sentido.",
          ],
        },
      ],
    },
    {
      year: "2023",
      partner: {
        text: "Mona Cases · mayo 2023",
        href: "https://monacases.com.uy/",
      },
      title: "Cápsula con Mona Cases",
      story: [
        {
          kind: "p",
          text: [
            "En mayo de 2023 llegó mi primera colaboración con otra marca: una cápsula junto a ",
            { text: "Mona Cases", href: "https://monacases.com.uy/" },
            ", referentes en accesorios para celular en Uruguay. Creamos cases, una taza, un mouse pad y stickers con diseños icónicos de New York, otra vez con Lu detrás del diseño. Fue muy especial ver esos diseños en manos de tanta gente, porque son objetos que se usan todos los días y que te recuerdan la ciudad cada vez que los mirás.",
          ],
        },
      ],
    },
    {
      year: "2023",
      partner: { text: "Colección propia" },
      title: "Cuadernos 2023",
      story: [
        {
          kind: "p",
          text: [
            "El cuaderno que empezó todo se merecía volver renovado. En 2023 lancé una nueva colección con diseños frescos, pensados para anotar ideas, planes de viaje o lo que cada una quiera. Es probablemente la colección que más me representa de punta a punta, porque cada diseño tiene algo de cómo veo y vivo New York.",
          ],
        },
      ],
    },
    {
      year: "2024",
      partner: { text: "Segunda edición" },
      title: "Agenda Vamos a New York 2024",
      story: [
        {
          kind: "p",
          text: [
            "Después de lo que fue la primera agenda, tenía muchas ganas de hacer una nueva edición. La 2024 volvió con la misma idea: acompañarte todo el año con un poco de New York, entre planes, fechas y ganas de volver.",
          ],
        },
      ],
    },
    {
      year: "2024–25",
      partner: { text: "Efe Hus · Flor", href: "https://efehus.com/" },
      title: "Tote bags con Efe Hus",
      story: [
        {
          kind: "p",
          text: [
            "La historia con Flor, de ",
            { text: "Efe Hus", href: "https://efehus.com/" },
            ", empezó con un viaje. En junio de 2023 decidimos ir juntas a New York casi sin conocernos, y volvimos siendo amigas. Nos quedamos a pocas cuadras de Columbus Circle, y esa parada de subte se volvió nuestro punto de partida de cada día. Después de desearlo mucho tiempo, en octubre de 2024 lanzamos una tote bag en su homenaje.",
          ],
        },
        {
          kind: "p",
          text: [
            "En 2025 volvimos con una segunda tote, con una frase que nos representa a las dos y a toda esta comunidad:",
          ],
        },
        {
          kind: "quote",
          text: "“I think about New York more than a normal person should.”",
          lang: "en",
        },
        {
          kind: "p",
          text: [
            "Si estás leyendo esto, probablemente sepas exactamente de qué hablamos.",
          ],
        },
      ],
    },
    {
      year: "2026",
      partner: { text: "Tercera edición" },
      title: "Agenda Vamos a New York 2026",
      story: [
        {
          kind: "p",
          text: [
            "Para la tercera edición quería que fuera más completa que nunca. Además de todo lo que ya tenía, sumé ilustraciones de New York para pintar, espacio para contar tu viaje y lugar para pegar fotos, para que no sea solo una agenda sino también un recuerdo de tu año y de tus viajes. Para mí es de los productos más especiales que hago, porque sé que va a estar con muchas personas todos los días, llevando un pedacito de New York a su rutina.",
          ],
        },
      ],
    },
  ],
  closing: {
    // [md]
    headline: "¿Querés crear algo juntos?",
    // [md]
    text: [
      "Cada una de estas colaboraciones nació de una conversación y de las ganas compartidas de hacer algo lindo. Si tenés una marca o un proyecto y te gustaría colaborar con Vamos a New York, escribime a ",
      { text: "hola@vamosany.com", href: "mailto:hola@vamosany.com" },
      ". Me encanta crear cosas con personas que comparten este amor por la ciudad.",
    ],
    // [mock]
    primary: { label: "Escribime", href: "mailto:hola@vamosany.com" },
    secondary: { label: "Trabajá conmigo", href: "/trabaja-conmigo" },
  },
};
