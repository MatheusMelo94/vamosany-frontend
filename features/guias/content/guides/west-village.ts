import type { GuideBody } from "@/features/guias/types";

export const westVillage: GuideBody = {
  intro: [
    {
      type: "p",
      text: [
        "Si hay un barrio de New York que se siente como un pueblo dentro de la ciudad, es el West Village. Acá la cuadrícula de Manhattan se rompe: las calles son más angostas, se cruzan en ángulos raros y están llenas de árboles, casas de ladrillo con escalinatas y cafecitos con mesas en la vereda. Es ideal para caminar sin apuro y perderse un rato.",
      ],
    },
  ],
  sections: [
    {
      id: "por-que-lo-amo",
      title: "Por qué lo amo",
      blocks: [
        {
          type: "p",
          text: [
            "El West Village es mi barrio favorito de New York. Amo todo de esta zona: cada esquina tiene algo para ver y alguna curiosidad para contar. Recorrerlo con mis viajeros es mi parte favorita de cada viaje, porque siempre descubrimos algo nuevo juntos.",
          ],
        },
      ],
    },
    {
      id: "que-ver",
      title: "Qué ver",
      blocks: [
        {
          type: "ul",
          items: [
            [
              { b: "Bleecker Street:" },
              " la calle principal del barrio, con tiendas, cafés y pastelerías.",
            ],
            [
              { b: "Cornelia Street:" },
              " una calle cortita y encantadora que sale de Bleecker Street. Es la que inspiró la canción de Taylor Swift del mismo nombre, del álbum ",
              { i: "Lover" },
              ", y hoy es parada obligada para las swifties.",
            ],
            [
              { b: "El edificio de Friends:" },
              " la fachada del departamento de la serie está en la esquina de Bedford y Grove Street.",
            ],
            [
              { b: "El departamento de Carrie:" },
              " la escalinata de ",
              { i: "Sex and the City" },
              " está en 66 Perry Street. Es una casa particular, así que se mira desde la vereda, sin sentarse en la escalera.",
            ],
            [
              { b: "Jefferson Market Library:" },
              " una biblioteca en un edificio de ladrillo con torre que parece un castillo.",
            ],
            [
              { b: "Stonewall Inn:" },
              " el bar donde nació el movimiento por los derechos LGBTQ+ en 1969, hoy monumento nacional.",
            ],
            [
              { b: "Hudson River Park:" },
              " a pocas cuadras, el parque junto al río es perfecto para ver el atardecer.",
            ],
          ],
        },
      ],
    },
    {
      id: "donde-comer",
      title: "Dónde comer",
      blocks: [
        {
          type: "ul",
          items: [
            [
              { b: "Magnolia Bakery:" },
              " la pastelería famosa por sus cupcakes y su banana pudding, sobre Bleecker Street.",
            ],
            [
              { b: "Joe’s Pizza:" },
              " un clásico de la porción neoyorquina, en Carmine Street.",
            ],
          ],
        },
      ],
    },
    {
      id: "cerca",
      title: "Cerca",
      blocks: [
        {
          type: "p",
          text: [
            "El West Village queda pegado a Washington Square Park, el Meatpacking District y el comienzo del High Line, así que se combina muy bien con esos paseos en el mismo día.",
          ],
        },
      ],
    },
    {
      id: "como-llegar",
      title: "Cómo llegar",
      blocks: [
        {
          type: "p",
          text: [
            "La estación más cómoda es Christopher St–Stonewall, de la línea 1. También podés bajar en West 4 St–Washington Sq (líneas A, C, E, B, D, F y M) y caminar unas cuadras.",
          ],
        },
      ],
    },
  ],
  cta: {
    lead: "¿Querés recorrer el West Village en tu viaje?",
    label: "Quiero mi itinerario",
  },
};
