import type { GuideBody } from "@/features/guias/types";

export const caminarPorNewYork: GuideBody = {
  intro: [
    {
      type: "p",
      text: [
        "Caminar es mi forma favorita de conocer New York. Es la mejor manera de descubrir rincones que no aparecen en las guías, sentir la energía de cada barrio y, de paso, ahorrar en transporte. Y una vez que entendés cómo está organizada, es muy difícil perderse.",
      ],
    },
  ],
  keyFacts: [
    {
      value: "1 min",
      label: "por cuadra entre calles, más o menos",
      source: "se camina en un minuto",
    },
    {
      value: "3 a 4 min",
      label: "por cuadra entre avenidas",
      source: "tres o cuatro minutos",
    },
    {
      value: "15 a 20 mil",
      label: "pasos por día es lo normal",
      source: "entre 15 y 20 mil pasos por día",
    },
  ],
  sections: [
    {
      id: "como-leer-las-calles-y-avenidas",
      title: "Cómo leer las calles y avenidas",
      blocks: [
        {
          type: "p",
          text: ["La mayor parte de Manhattan está organizada en cuadrícula:"],
        },
        {
          type: "ul",
          items: [
            [
              { b: "Las calles (streets)" },
              " van de este a oeste y están numeradas. Los números crecen a medida que vas hacia el norte: la calle 42 está más al norte que la 34.",
            ],
            [
              { b: "Las avenidas" },
              " van de norte a sur. Algunas tienen número (1st Avenue, 5th Avenue) y otras nombre (Park Avenue, Lexington, Madison).",
            ],
            [
              { b: "La Quinta Avenida" },
              " divide la ciudad en este y oeste. Por eso las direcciones dicen “East 34th Street” o “West 34th Street”, según de qué lado de la Quinta estén.",
            ],
            [
              { b: "Broadway" },
              " es la excepción: cruza Manhattan en diagonal y, donde se cruza con las avenidas, forma plazas como Times Square, Herald Square o Union Square.",
            ],
          ],
        },
        {
          type: "p",
          text: [
            { b: "Ojo:" },
            " al sur de la calle 14, en zonas como el West Village, el SoHo o el Financial District, la cuadrícula se rompe. Las calles tienen nombre, se cruzan en ángulos raros y ahí sí conviene tener el mapa a mano.",
          ],
        },
      ],
    },
    {
      id: "como-calcular-distancias",
      title: "Cómo calcular distancias",
      blocks: [
        {
          type: "ul",
          items: [
            [
              { b: "Entre calles" },
              " las cuadras son cortas: unas 20 cuadras equivalen a 1,6 km, y cada una se camina en un minuto, más o menos.",
            ],
            [
              { b: "Entre avenidas" },
              " las cuadras son mucho más largas: tardás unos tres o cuatro minutos en cada una.",
            ],
          ],
        },
        {
          type: "p",
          text: [
            "Por eso, ir de la calle 34 a la 42 por la misma avenida es un paseo corto, pero cruzar de la 1st a la 8th Avenue lleva bastante más tiempo.",
          ],
        },
      ],
    },
    {
      id: "mis-recorridos-a-pie-favoritos",
      title: "Mis recorridos a pie favoritos",
      blocks: [
        { type: "h3", text: "High Line" },
        {
          type: "p",
          text: [
            "Un parque elevado construido sobre una antigua vía de tren, con plantas, arte y vistas de la ciudad entre los edificios. Va desde el Meatpacking District hasta Hudson Yards, a lo largo de unos 2 km.",
          ],
        },
        {
          type: "p",
          text: [
            { b: "Tip:" },
            " arrancá en el Meatpacking y terminá en Hudson Yards, así podés seguir con The Vessel o el mirador Edge.",
          ],
        },
        { type: "h3", text: "Brooklyn Bridge" },
        {
          type: "p",
          text: [
            "Cruzar el puente caminando es uno de los grandes clásicos. Son unos 2 km y se tarda entre 30 y 40 minutos, sin contar las paradas para las fotos.",
          ],
        },
        {
          type: "p",
          text: [
            { b: "Tip:" },
            " tomá el subte hasta Brooklyn y cruzá caminando hacia Manhattan, así vas con el skyline de frente todo el recorrido.",
          ],
        },
        { type: "h3", text: "Central Park" },
        {
          type: "p",
          text: [
            "Tiene tantos rincones que podés volver varias veces y descubrir algo nuevo. No te pierdas The Mall, Bethesda Terrace, Bow Bridge y Strawberry Fields.",
          ],
        },
        {
          type: "p",
          text: [
            { b: "Tip:" },
            " entrá por la calle 59 y caminá hacia el norte, recorriendo el parque sin apuro.",
          ],
        },
      ],
    },
    {
      id: "tips-para-caminar-como-local",
      title: "Tips para caminar como local",
      blocks: [
        {
          type: "ul",
          items: [
            [
              { b: "Caminá por la derecha" },
              " y no te frenes de golpe en medio de la vereda. Si querés sacar una foto o mirar el mapa, correte a un costado.",
            ],
            [
              { b: "Respetá los semáforos peatonales:" },
              " la figura blanca te indica que podés cruzar y la mano roja, que no. Muchos tienen cuenta regresiva.",
            ],
            [
              { b: "Llevá zapatos cómodos." },
              " En New York es normal caminar entre 15 y 20 mil pasos por día.",
            ],
          ],
        },
      ],
    },
  ],
  cta: {
    lead: "¿Querés que tu itinerario esté pensado para recorrer cada zona a pie?",
    label: "Quiero mi itinerario",
  },
};
