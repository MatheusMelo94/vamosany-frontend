import type { PageHeaderContent } from "@/features/sobre-mi/types";

/**
 * /trabaja-conmigo copy (spec § Page 3). [md] strings are verbatim from
 * docs/content/sobre-mi-source.md; the form (T030) takes its copy from the
 * forms content module.
 */
export const TRABAJA_CONMIGO: {
  header: PageHeaderContent & { title: string; dek: string };
  notes: readonly string[];
  intro: string;
  audiences: readonly { title: string; text: string }[];
  cafecito: { notes: readonly string[]; cierre: string };
} = {
  header: {
    // [mock]
    label: [
      "Trabajá conmigo",
      "marcas · servicios · guías · empresas · agencias",
    ],
    // [md] Título
    title: "¿Nos tomamos un cafecito?",
    // [md] Bajada
    dek: "Si tenés una marca, un proyecto o un servicio relacionado con New York, me encantaría conocerte.",
  },
  // [mock]
  notes: [
    "Desde 2021",
    "+20 visitas",
    "6 viajes grupales",
    "Muchísimos itinerarios",
  ],
  // [md] Intro
  intro:
    "Desde 2021 construyo Vamos a New York con una comunidad de personas que sueñan con esta ciudad, la planifican y la viven. Después de más de 20 visitas, seis viajes grupales y muchísimos itinerarios, sé lo que buscan quienes viajan a New York y cómo hablarles. Si creés que podemos crear algo juntos, esta página es para vos.",
  // [md]
  audiences: [
    {
      title: "Marcas que quieran colaborar",
      text: "Me encanta crear productos y contenidos con marcas que comparten este amor por New York o los viajes. Ya lo hice con cuadernos, agendas, cases y tote bags, siempre cuidando que cada colaboración tenga una historia real detrás. Si tenés una idea, desde una cápsula de productos hasta una campaña en redes, hablemos.",
    },
    {
      title: "Empresas de servicios en New York",
      text: "Hoteles, restaurantes, tiendas, experiencias, tours: si tu negocio está en New York y querés llegar a viajeros de habla hispana, puedo ayudarte a hacerlo de forma auténtica. Recomiendo solo lo que conozco y me gusta, y por eso mi comunidad confía en lo que comparto.",
    },
    {
      title: "Guías turísticos",
      text: "Si sos guía en New York y te gustaría trabajar con viajeros latinos, me encantaría conocerte. Siempre estoy buscando personas con quienes sumar experiencias a mis itinerarios y viajes grupales.",
    },
    {
      title: "Empresas que quieran contratar mis itinerarios",
      text: "Si tu empresa organiza viajes de incentivo, beneficios para colaboradores o experiencias para clientes, puedo diseñar itinerarios a medida de tu equipo o de tu propuesta.",
    },
    {
      title: "Agencias de viaje",
      text: "Si tenés una agencia y querés sumar itinerarios personalizados, consultorías o viajes temáticos a New York a lo que ofrecés, podemos armar una propuesta en conjunto.",
    },
  ],
  cafecito: {
    // [mock]
    notes: ["El cafecito", "Virtual", "En Montevideo", "O en New York"],
    // [md] Cierre
    cierre:
      "Contame quién sos, qué hacés y qué te imaginás que podemos hacer juntos. El cafecito puede ser virtual, en Montevideo o, si coincidimos, en New York.",
  },
};
