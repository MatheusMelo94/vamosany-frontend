import type { GuideBody } from "@/features/guias/types";

export const murrayHill: GuideBody = {
  intro: [
    {
      type: "p",
      text: [
        "Murray Hill es un barrio residencial en el corazón de Manhattan, entre Midtown y el East Side. No tiene grandes atracciones propias, pero esa es justamente su ventaja: es más tranquilo que Times Square, las opciones de alojamiento suelen ser más accesibles y en pocos minutos llegás caminando a muchos de los lugares más icónicos de la ciudad.",
      ],
    },
  ],
  sections: [
    {
      id: "por-que-lo-recomiendo",
      title: "Por qué lo recomiendo",
      blocks: [
        {
          type: "p",
          text: [
            "Es el barrio que más recomiendo para alojarse: está cerca de todo, pero sin estar en el caos. Estás a pasos de las principales atracciones y, al mismo tiempo, se siente como vivir en New York como una local. Me quedé acá en uno de mis primeros viajes con mis hermanos y la experiencia fue increíble.",
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
              { b: "The Morgan Library & Museum:" },
              " la biblioteca privada de J.P. Morgan, con salas de madera y libros antiguos que te dejan sin palabras.",
            ],
            [
              { b: "Sniffen Court:" },
              " un pasaje escondido de casitas de ladrillo, sobre la calle 36, que parece de otra época.",
            ],
            [
              { b: "Grand Central Terminal:" },
              " a unas cuadras, la estación más linda de New York, con su techo de estrellas.",
            ],
            [
              { b: "Empire State Building:" },
              " también a pocos minutos caminando.",
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
              { b: "Curry Hill:" },
              " sobre Lexington Avenue, unas cuadras al sur, hay muchos restaurantes indios.",
            ],
            [
              { b: "Koreatown:" },
              " sobre la calle 32, para comer barbacoa coreana o probar algo distinto.",
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
            "Desde Murray Hill llegás caminando a Grand Central, el Empire State, Bryant Park, la New York Public Library y Koreatown.",
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
            "Las estaciones más cómodas son 33 St (línea 6) y Grand Central–42 St (líneas 4, 5, 6 y 7).",
          ],
        },
      ],
    },
  ],
  cta: {
    lead: "¿Querés alojarte en una zona céntrica y tranquila?",
    label: "Quiero mi itinerario",
  },
};
