import type { GuideBody } from "@/features/guias/types";

export const williamsburg: GuideBody = {
  intro: [
    {
      type: "p",
      text: [
        "Williamsburg es el barrio más cool de Brooklyn. Antiguas fábricas convertidas en tiendas y restaurantes, murales en cada esquina, tiendas vintage y una costanera con una de las mejores vistas del skyline de Manhattan. Es ideal para pasar una tarde distinta, lejos de los rascacielos.",
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
            "Desde casi cualquier punto del barrio tenés unas vistas del skyline de Manhattan perfectas. Y cada año se repite acá Smorgasburg, la feria de comida que amo, justamente porque las vistas desde ahí son espectaculares.",
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
              { b: "Domino Park:" },
              " un parque junto al río, en el lugar de una antigua refinería de azúcar, con vista al skyline y al Williamsburg Bridge.",
            ],
            [
              { b: "Bedford Avenue:" },
              " la calle principal, con tiendas, cafés y vintage.",
            ],
            [
              { b: "Murales y arte urbano:" },
              " el barrio está lleno; caminar sin rumbo es la mejor forma de encontrarlos.",
            ],
            [
              { b: "Williamsburg Bridge:" },
              " se puede cruzar caminando desde el Lower East Side.",
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
              { b: "Smorgasburg:" },
              " el mercado de comida al aire libre más famoso de New York, frente al río y con el skyline de fondo. Funciona los sábados durante la temporada cálida; chequeá las fechas antes de ir.",
            ],
            [
              { b: "Peter Luger Steak House:" },
              " un clásico de carnes desde hace más de un siglo.",
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
            "Williamsburg está pegado a Greenpoint, otro barrio con mucho encanto, y se combina muy bien con el Lower East Side cruzando el puente.",
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
            "La estación más cómoda es Bedford Av, de la línea L, a una parada de Manhattan. También podés llegar en el NYC Ferry, que para en North Williamsburg y South Williamsburg.",
          ],
        },
      ],
    },
  ],
  cta: {
    lead: "¿Querés sumar Brooklyn a tu itinerario?",
    label: "Quiero mi itinerario",
  },
};
