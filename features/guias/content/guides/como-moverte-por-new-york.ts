import type { GuideBody } from "@/features/guias/types";

export const comoMovertePorNewYork: GuideBody = {
  intro: [
    {
      type: "p",
      text: [
        "New York es una ciudad para caminar y para moverse en transporte público. Combinando bien las opciones, llegás a todos lados rápido y sin gastar de más.",
      ],
    },
  ],
  keyFacts: [
    {
      value: "USD 3",
      label: "por viaje, en subte o bus",
      source: "USD 3 por viaje",
    },
    {
      value: "Gratis",
      label: "el Staten Island Ferry",
      source: "Staten Island Ferry (gratis)",
    },
    {
      value: "2 h",
      label: "de transbordo gratis entre bus y subte",
      source: "dentro de las dos horas",
    },
  ],
  sections: [
    {
      id: "a-pie",
      title: "A pie",
      blocks: [
        {
          type: "p",
          text: [
            "Es mi forma favorita de conocer la ciudad. Manhattan está organizada en cuadrícula: las ",
            { b: "calles" },
            " (streets) van de este a oeste y sus números crecen hacia el norte, y las ",
            { b: "avenidas" },
            " van de norte a sur. Así es muy difícil perderse.",
          ],
        },
        {
          type: "p",
          text: [
            "Una cuadra entre calles se camina en un minuto, más o menos. Entre avenidas tardás bastante más, unos tres o cuatro minutos.",
          ],
        },
        {
          type: "p",
          text: [
            { b: "Tip:" },
            " llevá zapatos cómodos. En New York es normal caminar entre 15 y 20 mil pasos por día.",
          ],
        },
      ],
    },
    {
      id: "subte",
      title: "Subte",
      blocks: [
        {
          type: "p",
          text: [
            "Es la forma más rápida de recorrer distancias largas, sobre todo de norte a sur o para ir a Brooklyn y Queens. Funciona las 24 horas y cuesta USD 3 por viaje. Todo lo que tenés que saber está en la guía ",
            { guide: "el-subte-explicado" },
            ".",
          ],
        },
      ],
    },
    {
      id: "bus",
      title: "Bus",
      blocks: [
        {
          type: "p",
          text: [
            "Es más lento que el subte por el tráfico, pero muy útil para moverte de este a oeste, donde hay menos líneas de subte, por ejemplo para cruzar Central Park. Cuesta lo mismo que el subte, se paga igual acercando la tarjeta o el celular, y el transbordo entre bus y subte es gratis dentro de las dos horas.",
          ],
        },
      ],
    },
    {
      id: "ferry",
      title: "Ferry",
      blocks: [
        { type: "h3", text: "Staten Island Ferry (gratis)" },
        {
          type: "p",
          text: [
            "Es uno de mis piques favoritos para ahorrar. Este ferry naranja une el sur de Manhattan con Staten Island, es ",
            { b: "gratis" },
            ", funciona las 24 horas y en el camino pasa frente a la Estatua de la Libertad. Sale de la terminal Whitehall, en el Financial District, y el viaje dura unos 25 minutos.",
          ],
        },
        {
          type: "p",
          text: [
            { b: "Importante:" },
            " cuando llegás a Staten Island te tenés que bajar del ferry, entrar a la terminal y subirte al siguiente para volver. No se puede quedar arriba del mismo barco.",
          ],
        },
        {
          type: "p",
          text: [
            { b: "Tip:" },
            " para ver mejor la Estatua, a la ida ubicate del lado derecho del ferry y a la vuelta, del lado izquierdo.",
          ],
        },
        { type: "h3", text: "NYC Ferry" },
        {
          type: "p",
          text: [
            "Son ferries que conectan Manhattan con Brooklyn, Queens y otros barrios por el río. Son una forma linda y distinta de moverte, con vistas increíbles del skyline. El pasaje cuesta alrededor de USD 5 y se compra en la app de NYC Ferry o en las máquinas de cada muelle.",
          ],
        },
      ],
    },
    {
      id: "uber-o-lyft",
      title: "Uber o Lyft",
      blocks: [
        {
          type: "p",
          text: [
            "Yo uso transporte público siempre. En muy pocas ocasiones me tomé un Uber o un taxi. Igual es una buena opción si viajan varias personas, con valijas o para ir a lugares donde el subte no llega fácil. El precio cambia según la demanda y el horario, así que en hora pico puede salir bastante caro y tardar más por el tráfico.",
          ],
        },
      ],
    },
    {
      id: "mi-experiencia",
      title: "Mi experiencia",
      blocks: [
        {
          type: "p",
          text: [
            "Me muevo siempre en transporte público y me siento cómoda haciéndolo. Incluso tomé el subte sola hasta tarde en la madrugada. Si te toca viajar de noche, mi consejo es el mismo que en cualquier ciudad grande: elegí vagones con gente, prestá atención a tu alrededor y tené a mano la app para saber cuándo llega el tren.",
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
            [{ b: "Distancias cortas:" }, " a pie."],
            [{ b: "Distancias largas o de norte a sur:" }, " subte."],
            [{ b: "De este a oeste:" }, " bus."],
            [{ b: "Para pasear y ver el skyline:" }, " ferry."],
            [
              {
                b: "En grupo, con valijas o si preferís no usar transporte público:",
              },
              " Uber.",
            ],
          ],
        },
      ],
    },
  ],
  cta: {
    lead: "¿Querés que te arme el recorrido de cada día para moverte lo menos posible?",
    label: "Quiero mi itinerario",
  },
};
