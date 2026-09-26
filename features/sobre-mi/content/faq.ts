import type {
  ClosingContent,
  PageHeaderContent,
} from "@/features/sobre-mi/types";

export type FaqQuestion = {
  question: string;
  /** A paragraph, or a bulleted list. */
  answer: string | readonly string[];
};

export type FaqGroupContent = {
  name: string;
  questions: readonly FaqQuestion[];
};

/**
 * /preguntas-frecuentes copy (spec § Page 5). Questions and answers are [md],
 * verbatim and in md order; the three groups are the accepted mockup grouping.
 */
export const FAQ: {
  header: PageHeaderContent & { title: string };
  groups: readonly FaqGroupContent[];
  closing: ClosingContent;
} = {
  header: {
    // [md] "Preguntas frecuentes" + [mock] count (corrected to 14)
    label: ["Preguntas frecuentes", "14 preguntas"],
    // [md] Título
    title: "Lo que más me preguntan antes de viajar",
    // [mock]
    dek: "Itinerarios, consultorías, viajes grupales y productos.",
  },
  groups: [
    {
      name: "Itinerarios y consultorías",
      questions: [
        {
          question: "¿Qué es un itinerario personalizado?",
          answer:
            "Es un plan de viaje armado especialmente para vos, según tus fechas, tus intereses y tu ritmo. Empezamos con una reunión virtual para conocernos y conversar sobre tus gustos y lo que querés vivir. A partir de ahí armo un itinerario para cada día con actividades, tips y recomendaciones.",
        },
        {
          question: "¿Qué incluye el itinerario personalizado?",
          answer: [
            "Reunión virtual para conocernos y hablar de tus gustos y objetivos de viaje",
            "Itinerario para cada día con actividades, tips y recomendaciones",
            "Recomendaciones para comer según cada día y zona",
            "Guía virtual con el itinerario de cada día",
            "Asistencia para comprar entradas y opciones para reservar hotel y traslados",
          ],
        },
        {
          question: "¿Qué es la consultoría de viaje?",
          answer:
            "Es una videollamada privada de una hora para resolver todas tus dudas sobre el viaje. Vemos juntas una idea de itinerario y te comparto una curaduría de restaurantes, tiendas y atracciones según tu perfil. Después de la reunión te envío un mail de seguimiento con los puntos principales que hablamos y links importantes para que termines de planificar, incluyendo cómo y dónde hacer reservas y comprar atracciones.",
        },
        {
          question:
            "¿Qué diferencia hay entre un itinerario y una consultoría?",
          answer:
            "En el itinerario personalizado armo tu viaje completo, día a día. En la consultoría te asesoro para que organices tu propio viaje: vemos juntas una idea de itinerario y te doy recomendaciones personalizadas, pero no incluye un plan detallado por día ni contacto por WhatsApp.",
        },
        {
          question: "¿Cómo es el proceso después de comprar?",
          answer:
            "Cuando se registra tu compra te llega un mail de confirmación. Después te envío otro mail con un cuestionario para empezar a armar tu itinerario o tu consultoría, y con opciones de fechas para agendar nuestra reunión.",
        },
        {
          question: "¿Con cuánta anticipación tengo que reservar?",
          answer:
            "Para el itinerario personalizado te recomiendo reservar con 2 meses de anticipación, así hay tiempo para armarlo con calma y conseguir entradas para lo que se agota. Si preferís hacerlo con más tiempo también se puede, aunque no recomiendo más de 6 meses antes, para que las recomendaciones estén lo más actualizadas posible. La consultoría se puede hacer en los días previos al viaje, idealmente con un mínimo de 5 días de anticipación.",
        },
        {
          question: "¿Las entradas y reservas están incluidas?",
          answer:
            "Te ayudo a elegir y te digo cómo y dónde comprar entradas, reservar hotel y traslados, pero las compras las hacés vos directamente.",
        },
        {
          question: "¿Cómo se pagan los itinerarios y las consultorías?",
          answer:
            "El pago se hace online, con tarjeta de crédito internacional o por transferencia bancaria en Uruguay.",
        },
      ],
    },
    {
      name: "Viajes grupales",
      questions: [
        {
          question: "¿Cómo funcionan los viajes grupales?",
          answer:
            "Son viajes temáticos a New York en los que viajamos en grupo, con todo organizado y conmigo acompañándolos durante la experiencia. Cada viaje tiene su propia temática y un itinerario pensado para vivir la ciudad de una forma distinta, y todos cuentan con la garantía de Jetmar Viajes Uruguay.",
        },
        {
          question: "¿Los viajes grupales son para todos?",
          answer:
            "Sí. Pueden sumarse desde niños hasta adultos. Todos son bienvenidos.",
        },
        {
          question: "¿Puedo sumarme a un viaje grupal si viajo sin compañía?",
          answer:
            "¡Sí, claro! Si querés compartir habitación, nosotros nos encargamos de buscarte compañero o compañera de cuarto. Y si preferís tener tu propio espacio, podés pagar el suplemento para habitación single.",
        },
        {
          question: "¿Cómo se pagan los viajes grupales?",
          answer:
            "Para reservar tu lugar se abonan USD 300, y una vez confirmado el viaje empezás a pagar el resto. Podés hacerlo por transferencia o con tarjeta, y la cantidad de cuotas depende de la tarjeta. También se puede pagar con millas Itaú.",
        },
        {
          question: "¿Cómo me entero de los próximos viajes grupales?",
          answer:
            "Los anuncio primero en Instagram y en la newsletter, así que suscribite para enterarte antes que nadie.",
        },
      ],
    },
    {
      name: "Productos",
      questions: [
        {
          question: "¿Dónde puedo comprar los productos de Vamos a New York?",
          answer:
            "Los productos salen a la venta en momentos puntuales y los anuncio siempre en mis redes. Seguime en Instagram para enterarte cuando se lanza algo nuevo.",
        },
      ],
    },
  ],
  // [mock]
  closing: {
    headline: "¿No está tu pregunta? Escribime y te respondo yo.",
    primary: { label: "Escribime", href: "/contacto" },
  },
};
