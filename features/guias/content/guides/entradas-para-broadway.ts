import type { GuideBody } from "@/features/guias/types";

export const entradasParaBroadway: GuideBody = {
  intro: [
    {
      type: "p",
      text: [
        "Ver un musical en Broadway es uno de esos planes que no pueden faltar en New York. Las entradas pueden ser caras, pero hay varias formas de conseguirlas a mejor precio si sabés dónde buscar.",
      ],
    },
  ],
  keyFacts: [
    {
      value: "2×1",
      label: "en Broadway Week",
      source: "dos entradas por el precio de una",
    },
    {
      value: "Hasta 50%",
      label: "de descuento en TKTS, el mismo día",
      source: "hasta 50% de descuento",
    },
    {
      value: "USD 8",
      label: "de cargo por entrada en TKTS",
      source: "cargo de USD 8 por entrada",
    },
  ],
  sections: [
    {
      id: "mi-recomendacion",
      title: "Mi recomendación",
      blocks: [
        {
          type: "p",
          text: [
            "Si tenés muchas ganas de ver una obra en particular, comprala. No esperes a ganar la lotería o conseguir un descuento de último momento: es difícil ganar, y en un viaje de una semana necesitás tener todo planeado para poder hacer todo lo que querés.",
          ],
        },
      ],
    },
    {
      id: "comprar-con-anticipacion",
      title: "Comprar con anticipación",
      blocks: [
        {
          type: "p",
          text: [
            "Si hay un show que no te querés perder, sobre todo los más populares, conviene comprar antes de viajar. Así elegís fecha y ubicación con tranquilidad.",
          ],
        },
        {
          type: "ul",
          items: [
            [
              "Comprá en la web oficial del teatro o del show, o en las plataformas oficiales de venta.",
            ],
            [
              "Desconfiá de las reventas con precios muy por encima del original.",
            ],
          ],
        },
      ],
    },
    {
      id: "broadway-week",
      title: "Broadway Week",
      blocks: [
        {
          type: "p",
          text: [
            "Dos veces al año, entre fines de enero y principios de febrero, y en septiembre, se hace Broadway Week: durante esas semanas muchos shows venden ",
            { b: "dos entradas por el precio de una" },
            ". Las entradas salen a la venta unas semanas antes y no todos los shows participan, así que si tu viaje coincide, conviene estar atenta y comprar apenas se lanzan.",
          ],
        },
      ],
    },
    {
      id: "tkts-descuentos-para-el-mismo-dia",
      title: "TKTS: descuentos para el mismo día",
      blocks: [
        {
          type: "p",
          text: [
            "TKTS son boleterías con entradas con hasta ",
            { b: "50% de descuento" },
            " para funciones del mismo día. La más famosa está en Times Square, bajo las escalinatas rojas, y hay otra en Lincoln Center.",
          ],
        },
        {
          type: "ul",
          items: [
            [
              "Venden entradas para las funciones de ese mismo día, y para las matinés del día siguiente.",
            ],
            [
              "Aceptan tarjetas y efectivo, y cobran un cargo de USD 8 por entrada.",
            ],
            ["En la app de TKTS ves en tiempo real qué shows hay disponibles."],
          ],
        },
        {
          type: "p",
          text: [
            { b: "Tip:" },
            " no siempre están los shows más populares, así que andá con una lista de varias opciones.",
          ],
        },
      ],
    },
    {
      id: "loteria-digital",
      title: "Lotería digital",
      blocks: [
        {
          type: "p",
          text: [
            "Muchos shows sortean entradas a precios muy bajos para la función del día o de los días siguientes. Te anotás gratis desde el celular, en las plataformas de lotería de cada show, y si ganás te avisan por mail. Anotate en varios para tener más chances, pero no cuentes con ganar.",
          ],
        },
      ],
    },
    {
      id: "rush",
      title: "Rush",
      blocks: [
        {
          type: "p",
          text: [
            "Algunos shows venden entradas baratas el mismo día, a primera hora, en la boletería del teatro o por app. Son pocas y se agotan rápido, así que hay que estar temprano.",
          ],
        },
      ],
    },
    {
      id: "mas-tips-para-ahorrar",
      title: "Más tips para ahorrar",
      blocks: [
        {
          type: "ul",
          items: [
            [
              { b: "Martes, miércoles y jueves" },
              " suele haber más disponibilidad y mejores precios que el fin de semana.",
            ],
            [
              { b: "Las matinés" },
              " (de miércoles, sábado o domingo) a veces son más baratas.",
            ],
            [
              { b: "Si viajás en grupo," },
              " comprando juntos pueden conseguir mejores ubicaciones.",
            ],
          ],
        },
      ],
    },
  ],
  cta: {
    lead: "¿Querés que el show encaje perfecto en tu itinerario?",
    label: "Quiero mi itinerario",
  },
};
