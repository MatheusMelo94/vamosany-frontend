import type { GuideBody } from "@/features/guias/types";

export const elSubteExplicado: GuideBody = {
  intro: [
    {
      type: "p",
      text: [
        "El subte es la forma más rápida y económica de moverte por New York. Funciona las 24 horas, todos los días, y llega a casi todos los rincones de la ciudad. Al principio puede parecer un laberinto, pero en cuanto entendés cuatro cosas básicas te vas a mover como una neoyorquina.",
      ],
    },
  ],
  keyFacts: [
    {
      value: "USD 3",
      label: "por viaje, en subte o bus local",
      source: "USD 3",
    },
    {
      value: "USD 35",
      label: "tope en 7 días: después, gratis",
      source: "USD 35",
    },
    { value: "24 h", label: "funciona todos los días", source: "24 horas" },
  ],
  sections: [
    {
      id: "como-se-paga",
      title: "Cómo se paga",
      blocks: [
        {
          type: "p",
          text: [
            "Cada viaje en subte o bus local cuesta ",
            { b: "USD 3" },
            ", y tenés dos formas de pagarlo.",
          ],
        },
        {
          type: "ul",
          items: [
            [
              { b: "Con tu tarjeta o tu celular:" },
              " pasás tu tarjeta de crédito o débito contactless, tu celular o tu reloj por el lector OMNY del molinete, y listo.",
            ],
            [
              { b: "Con la tarjeta OMNY:" },
              " si preferís no usar tu tarjeta personal, podés comprar una tarjeta OMNY en las máquinas de las estaciones o en farmacias como Walgreens, CVS y 7-Eleven. Cuesta ",
              { b: "USD 5" },
              " y al comprarla tenés que cargarle saldo, que después vas recargando en las mismas máquinas.",
            ],
          ],
        },
        {
          type: "tip",
          text: [
            "yo uso Apple Pay. Acerco el celular al lector y listo, sin tener que andar sacando tarjetas de la billetera.",
          ],
        },
      ],
    },
    {
      id: "tope",
      title: "El tope semanal (fare cap)",
      blocks: [
        {
          type: "p",
          text: [
            "Es el dato que más plata te ahorra. Si en 7 días gastás ",
            { b: "USD 35" },
            " en viajes de subte y bus local, el resto de los viajes de esos 7 días son gratis. En la práctica, a partir del viaje número 12 ya no pagás más.",
          ],
        },
        { type: "h3", text: "Cómo funciona" },
        {
          type: "ul",
          items: [
            [
              { b: "Los 7 días empiezan con tu primer viaje," },
              " no es una semana de lunes a domingo. Si arrancás un jueves, el tope corre hasta el miércoles siguiente.",
            ],
            [
              { b: "Cada persona tiene que usar su propia tarjeta o celular." },
              " El tope se cuenta por medio de pago, así que si pagás el viaje de otra persona con tu tarjeta, no llegás al tope ni vos ni ella.",
            ],
            [
              { b: "Usá siempre el mismo medio de pago." },
              " Si un día pagás con Apple Pay y otro con la tarjeta física, cuentan como dos medios distintos, aunque sea la misma tarjeta. Elegí uno y usá siempre ese.",
            ],
            [
              { b: "Los transbordos gratis no cuentan" },
              " para llegar al tope, porque no los pagás.",
            ],
            [{ b: "No tenés que activar nada:" }, " se aplica solo."],
          ],
        },
        {
          type: "p",
          text: [
            "Así no necesitás calcular si te conviene un pase ilimitado: el sistema te cobra lo que sea más barato.",
          ],
        },
      ],
      tocLabel: "El tope semanal",
    },
    {
      id: "otros-datos",
      title: "Otros datos",
      blocks: [
        {
          type: "ul",
          items: [
            [
              { b: "Transbordo gratis:" },
              " tenés un transbordo gratis entre subte y bus local (o entre buses) dentro de las dos horas desde el primer viaje, pagando con el mismo medio.",
            ],
            [
              { b: "Niños:" },
              " los menores de 1,12 m viajan gratis acompañados por un adulto.",
            ],
          ],
        },
      ],
    },
    {
      id: "uptown-y-downtown",
      title: "Uptown y downtown",
      blocks: [
        {
          type: "p",
          text: [
            "Es lo primero que tenés que entender. En Manhattan, ",
            { b: "uptown" },
            " es hacia el norte (hacia Central Park y Harlem) y ",
            { b: "downtown" },
            " es hacia el sur (hacia el Financial District). Muchas estaciones tienen entradas separadas para cada dirección, así que fijate en el cartel antes de pasar el molinete. Si entrás por el lado equivocado, tenés que salir y volver a pagar.",
          ],
        },
      ],
    },
    {
      id: "las-lineas",
      title: "Las líneas",
      blocks: [
        {
          type: "p",
          text: [
            "Cada línea tiene un número o una letra y un color. Las líneas del mismo color comparten buena parte del recorrido; por ejemplo, la 1, 2 y 3 son rojas y van por el West Side.",
          ],
        },
      ],
    },
    {
      id: "express-y-local",
      title: "Express y local",
      blocks: [
        {
          type: "p",
          text: [
            "Algunas líneas son ",
            { b: "express" },
            " y paran solo en las estaciones principales. Otras son ",
            { b: "locales" },
            " y paran en todas. En el mapa, las estaciones con punto blanco son donde paran los express, y las de punto negro, solo los locales. Si vas a una estación chica, asegurate de tomar el local.",
          ],
        },
      ],
    },
    {
      id: "apps-que-te-van-a-salvar",
      title: "Apps que te van a salvar",
      blocks: [
        {
          type: "p",
          text: [
            "Google Maps funciona muy bien para el subte: te dice qué línea tomar, en qué dirección y hasta en qué vagón conviene subir. También te avisa si hay cambios en el servicio.",
          ],
        },
        {
          type: "tip",
          text: [
            "yo también uso la app Subway Time, que te dice exactamente en cuántos minutos llega cada línea a tu estación. Así sabés si te conviene correr o tomarte un café antes.",
          ],
        },
      ],
    },
    {
      id: "tips-para-moverte-como-local",
      title: "Tips para moverte como local",
      blocks: [
        {
          type: "ul",
          items: [
            [
              { b: "Los fines de semana y de noche" },
              " hay cambios de recorrido por obras. Antes de salir, chequeá la app o los carteles en la estación.",
            ],
            [
              { b: "Dejá salir antes de subir" },
              " y no te quedes parada en la puerta.",
            ],
            [
              { b: "Si un vagón está vacío" },
              " en hora pico, probablemente haya un motivo (aire acondicionado roto, por ejemplo). Mejor subite al siguiente.",
            ],
            [
              { b: "La línea 7" },
              ", que va a Queens, va elevada en parte del recorrido y tiene vistas muy lindas del skyline.",
            ],
          ],
        },
      ],
    },
  ],
  cta: {
    lead: "¿Querés que te arme el recorrido día a día, con las líneas que te convienen?",
    label: "Quiero mi itinerario",
  },
};
