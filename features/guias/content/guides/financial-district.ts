import type { GuideBody } from "@/features/guias/types";

export const financialDistrict: GuideBody = {
  intro: [
    {
      type: "p",
      text: [
        "El Financial District, en la punta sur de Manhattan, es donde nació New York. Acá conviven calles angostas y empedradas de la época colonial con los rascacielos más modernos de la ciudad. Es la zona de Wall Street, pero también de algunos de los lugares más emotivos para visitar.",
      ],
    },
  ],
  sections: [
    {
      id: "por-que-me-gusta",
      title: "Por qué me gusta",
      blocks: [
        {
          type: "p",
          text: [
            "El Financial District tiene una energía diferente a la del resto de Manhattan, y mucha historia en cada esquina. Además, es una gran opción para alojarse: es una zona más económica sin salir de la isla, y la mayoría de los hoteles son muy nuevos.",
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
              { b: "9/11 Memorial & Museum:" },
              " las dos fuentes donde estaban las Torres Gemelas, con los nombres de las víctimas. Es un lugar muy emotivo, que vale la pena visitar con tiempo.",
            ],
            [
              { b: "The Oculus:" },
              " la estación con forma de alas blancas, diseñada por Santiago Calatrava. Adentro hay un centro comercial.",
            ],
            [
              { b: "One World Observatory:" },
              " el mirador del edificio más alto de New York.",
            ],
            [
              { b: "Wall Street:" },
              " con la Bolsa de Nueva York, Federal Hall y la estatua de George Washington.",
            ],
            [
              { b: "El Toro de Wall Street:" },
              " en Bowling Green, siempre con fila para la foto.",
            ],
            [
              { b: "Trinity Church:" },
              " una iglesia histórica rodeada de rascacielos. En su cementerio está la tumba de Alexander Hamilton.",
            ],
            [
              { b: "Battery Park:" },
              " con vista a la Estatua de la Libertad y salida de los ferries.",
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
              { b: "Stone Street:" },
              " una de las calles más antiguas de la ciudad, empedrada y llena de restaurantes con mesas afuera.",
            ],
            [
              { b: "Brookfield Place:" },
              " un centro comercial junto al río con patio de comidas y vista al puerto.",
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
            "Desde acá sale el ferry gratis a Staten Island y empieza la caminata por el Brooklyn Bridge, así que se combinan muy bien en el mismo día.",
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
            "Muchísimas líneas llegan a la zona. Las más prácticas son Fulton St (líneas A, C, J, Z, 2, 3, 4 y 5), Wall St (líneas 2, 3, 4 y 5) y WTC Cortlandt (línea 1).",
          ],
        },
      ],
    },
  ],
  cta: {
    lead: "¿Querés sumar el Financial District a tu itinerario?",
    label: "Quiero mi itinerario",
  },
};
