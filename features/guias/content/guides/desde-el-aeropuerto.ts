import type { GuideBody } from "@/features/guias/types";

export const desdeElAeropuerto: GuideBody = {
  intro: [
    {
      type: "p",
      text: [
        "Después de tantas horas de vuelo, lo último que querés es complicarte para llegar al hotel. New York tiene tres aeropuertos y cada uno tiene sus opciones: acá te cuento cuáles son, cuánto cuestan y cuál conviene según tu viaje.",
      ],
    },
    {
      type: "p",
      text: [
        { b: "Dato clave antes de arrancar:" },
        " casi todo el transporte público se paga acercando tu tarjeta contactless o tu celular, igual que en el subte. Si todavía no leíste la guía ",
        { guide: "el-subte-explicado" },
        ", te va a servir.",
      ],
    },
  ],
  keyFacts: [
    { value: "USD 8,75", label: "el AirTrain de JFK", source: "USD 8,75" },
    {
      value: "USD 70",
      label: "taxi de JFK a Manhattan, tarifa fija",
      source: "tarifa fija de USD 70",
    },
    {
      value: "Gratis",
      label: "el bus Q70 de LaGuardia",
      source: "Bus Q70 + subte (gratis + USD 3)",
    },
  ],
  sections: [
    {
      id: "jfk",
      title: "JFK",
      blocks: [
        {
          type: "p",
          text: [
            "Es el aeropuerto más grande y al que llegan la mayoría de los vuelos desde Sudamérica. Está en Queens, a unos 25 km de Manhattan.",
          ],
        },
        { type: "h3", text: "AirTrain + subte (la opción más económica)" },
        {
          type: "p",
          text: [
            "El AirTrain conecta todas las terminales con las estaciones Jamaica y Howard Beach, donde tomás el subte. Desde Jamaica, la línea E te lleva directo a Midtown; desde Howard Beach, la línea A va a Lower Manhattan y al West Side.",
          ],
        },
        {
          type: "ul",
          items: [
            [{ b: "Costo:" }, " USD 8,75 el AirTrain + USD 3 el subte"],
            [{ b: "Tiempo:" }, " entre 60 y 75 minutos"],
            [
              { b: "Ideal si:" },
              " viajás con poco equipaje y no te importa tardar un poco más",
            ],
          ],
        },
        {
          type: "p",
          text: [
            { b: "Tip:" },
            " si viajan en grupo, el AirTrain tiene tarifa grupal: la primera persona paga USD 8,75 y cada acompañante USD 4,50, hasta 5 personas. Para eso tienen que pasar todos con la misma tarjeta.",
          ],
        },
        {
          type: "h3",
          text: "AirTrain + tren LIRR (la opción más rápida en transporte público)",
        },
        {
          type: "p",
          text: [
            "En Jamaica, en vez del subte, podés tomar el tren Long Island Rail Road hasta Penn Station o Grand Central. Es más rápido y más cómodo con valijas.",
          ],
        },
        {
          type: "ul",
          items: [
            [
              { b: "Costo:" },
              " USD 8,75 el AirTrain + USD 5,25 el tren (USD 7,25 en hora pico)",
            ],
            [{ b: "Tiempo:" }, " entre 45 y 50 minutos"],
            [
              { b: "Ideal si:" },
              " tu hotel queda cerca de Penn Station o Grand Central",
            ],
          ],
        },
        { type: "h3", text: "Uber o Lyft" },
        {
          type: "p",
          text: [
            "No tienen tarifa fija: el precio cambia según la demanda y el horario. Te llevan directo a la puerta del hotel.",
          ],
        },
        {
          type: "ul",
          items: [
            [
              { b: "Ideal si:" },
              " viajan varias personas, con valijas, o llegás muy cansada",
            ],
          ],
        },
        { type: "h3", text: "Taxi amarillo" },
        {
          type: "p",
          text: [
            "Desde JFK a cualquier punto de Manhattan, el taxi tiene ",
            { b: "tarifa fija de USD 70" },
            ", más recargos, peajes y propina.",
          ],
        },
        {
          type: "ul",
          items: [
            [{ b: "Tiempo:" }, " entre 45 y 90 minutos, según el tráfico"],
          ],
        },
        {
          type: "p",
          text: [
            "Tomalo siempre en la parada oficial de taxis de tu terminal, nunca con alguien que te ofrezca un viaje adentro del aeropuerto.",
          ],
        },
      ],
    },
    {
      id: "newark-ewr",
      title: "Newark (EWR)",
      blocks: [
        {
          type: "p",
          text: [
            "Está en New Jersey, pero queda cerca de Manhattan y muchas veces tiene vuelos más baratos.",
          ],
        },
        { type: "h3", text: "AirTrain + tren NJ Transit (la mejor opción)" },
        {
          type: "p",
          text: [
            "El AirTrain te lleva de tu terminal a la estación de tren del aeropuerto, y desde ahí tomás el tren de NJ Transit hasta Penn Station, en Midtown. Comprás un solo pasaje que incluye los dos tramos, en las máquinas de la estación o en la app de NJ Transit.",
          ],
        },
        {
          type: "ul",
          items: [
            [{ b: "Tiempo:" }, " unos 45 minutos en total"],
            [
              { b: "Ideal si:" },
              " tu hotel está en Midtown o cerca de Penn Station",
            ],
          ],
        },
        { type: "h3", text: "Uber o Lyft" },
        {
          type: "p",
          text: [
            "Igual que en JFK, el precio varía según la demanda y el horario.",
          ],
        },
        { type: "h3", text: "Taxi" },
        {
          type: "p",
          text: [
            "Desde Newark no hay tarifa fija: va por taxímetro, más un recargo de USD 20, peajes y propina.",
          ],
        },
      ],
    },
    {
      id: "laguardia-lga",
      title: "LaGuardia (LGA)",
      blocks: [
        {
          type: "p",
          text: [
            "Es el más cercano a Manhattan, aunque recibe sobre todo vuelos de cabotaje y desde algunas ciudades de América.",
          ],
        },
        { type: "h3", text: "Bus Q70 + subte (gratis + USD 3)" },
        {
          type: "p",
          text: [
            "El bus Q70, LaGuardia Link, es ",
            { b: "gratis" },
            " y sale de todas las terminales. Va directo hasta la estación Jackson Heights–Roosevelt Av, donde tomás el subte (líneas E, F, M, R o 7) hacia Manhattan.",
          ],
        },
        {
          type: "ul",
          items: [
            [{ b: "Costo:" }, " USD 3 (solo pagás el subte)"],
            [{ b: "Tiempo:" }, " entre 40 y 50 minutos"],
            [{ b: "Ideal si:" }, " querés ahorrar y viajás liviana"],
          ],
        },
        { type: "h3", text: "Bus M60" },
        {
          type: "p",
          text: [
            "Te deja en el norte de Manhattan, sobre la calle 125, con conexión a varias líneas de subte. Conviene si te alojás en Harlem o el Upper West Side.",
          ],
        },
        { type: "h3", text: "Uber o taxi" },
        {
          type: "p",
          text: [
            "El Uber varía según la demanda. El taxi va por taxímetro, más un recargo de USD 5 y propina.",
          ],
        },
      ],
    },
    {
      id: "mi-recomendacion",
      title: "Mi recomendación",
      blocks: [
        {
          type: "p",
          text: [
            "Yo casi siempre llego a JFK, y cuando viajo sola voy y vuelvo del aeropuerto en tren: tomo el AirTrain hasta Jamaica y ahí el tren LIRR, que me deja en Penn Station o en Grand Central. Es rápido, cómodo con la valija y mucho más barato que un auto.",
          ],
        },
      ],
    },
    {
      id: "cual-conviene",
      title: "¿Cuál conviene?",
      blocks: [
        {
          type: "ul",
          items: [
            [
              { b: "Si querés ahorrar:" },
              " desde JFK, AirTrain + subte; desde LaGuardia, bus Q70 gratis + subte.",
            ],
            [
              { b: "Si querés llegar rápido en transporte público:" },
              " desde JFK, AirTrain + tren LIRR; desde Newark, AirTrain + tren NJ Transit.",
            ],
            [
              { b: "Si viajan varias personas o con mucho equipaje:" },
              " Uber. Entre varios, el costo se divide y llegan directo a la puerta del hotel.",
            ],
            [{ b: "Si llegás de noche o muy cansada:" }, " Uber, sin dudarlo."],
          ],
        },
        {
          type: "p",
          text: [
            { b: "Antes de viajar, chequeá:" },
            " que no haya obras o cambios de servicio en el AirTrain o en los trenes. A veces se reemplazan por buses gratuitos durante algunas noches.",
          ],
        },
      ],
    },
  ],
  cta: {
    lead: "¿Querés que te arme el traslado desde el aeropuerto según tu vuelo y tu hotel?",
    label: "Quiero mi itinerario",
  },
};
