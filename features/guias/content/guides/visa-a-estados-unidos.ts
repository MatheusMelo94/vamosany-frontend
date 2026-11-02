import type { GuideBody } from "@/features/guias/types";

export const visaAEstadosUnidos: GuideBody = {
  intro: [
    {
      type: "p",
      text: [
        "Antes de reservar vuelos, lo primero es saber qué documento necesitás para entrar a Estados Unidos. Depende de tu pasaporte: algunas personas necesitan visa y otras pueden viajar con un permiso electrónico llamado ESTA. Acá te explico la diferencia.",
      ],
    },
  ],
  keyFacts: [
    { value: "USD 185", label: "tasa consular de la visa", source: "USD 185" },
    {
      value: "5×5 cm",
      label: "foto para la entrevista",
      source: "foto de 5×5 cm",
    },
    { value: "90 días", label: "de estadía con ESTA", source: "hasta 90 días" },
  ],
  sections: [
    {
      id: "visa",
      title: "Si tenés pasaporte uruguayo o argentino: necesitás visa",
      blocks: [
        {
          type: "p",
          text: [
            "Uruguay y Argentina no forman parte del Programa de Exención de Visas de Estados Unidos, así que para viajar como turista necesitás la ",
            { b: "visa de turista (B1/B2)" },
            ".",
          ],
        },
        { type: "p", text: [{ b: "Cómo es el trámite:" }] },
        {
          type: "ol",
          items: [
            [
              { b: "Completás el formulario DS-160" },
              " online, con tus datos personales y del viaje.",
            ],
            [
              { b: "Pagás la tasa consular" },
              ", que actualmente es de USD 185.",
            ],
            [{ b: "Agendás tu entrevista" }, " en la Embajada."],
            [
              { b: "Vas a la entrevista" },
              " con tu pasaporte, la confirmación del formulario y una foto de 5×5 cm.",
            ],
            [
              "Si te la aprueban, ",
              { b: "te devuelven el pasaporte con la visa" },
              " pegada.",
            ],
          ],
        },
        {
          type: "p",
          text: [
            { b: "Tip:" },
            " los turnos para la entrevista pueden demorar, así que empezá el trámite con varios meses de anticipación.",
          ],
        },
      ],
    },
    {
      id: "esta",
      title:
        "Si tenés pasaporte europeo, chileno u otro país del programa: podés usar ESTA",
      blocks: [
        {
          type: "p",
          text: [
            "Muchos uruguayos y argentinos tienen también ciudadanía italiana, española u otra europea. Si viajás con ese pasaporte, no necesitás visa: alcanza con el ",
            { b: "ESTA" },
            ", una autorización electrónica que se tramita online.",
          ],
        },
        {
          type: "ul",
          items: [
            [
              "Se pide en la web oficial del gobierno de Estados Unidos y se responde en pocos días.",
            ],
            ["Tiene un costo que se paga online al hacer el trámite."],
            ["Sirve para estadías de hasta 90 días, por turismo o negocios."],
            ["Necesitás un pasaporte electrónico, con chip."],
          ],
        },
        {
          type: "p",
          text: [
            { b: "Ojo:" },
            " si viajaste a Cuba desde 2021, o a otros países como Irán o Corea del Norte, no podés usar el ESTA aunque tengas pasaporte europeo, y vas a necesitar visa.",
          ],
        },
        {
          type: "p",
          text: [
            { b: "Importante:" },
            " usá siempre el mismo pasaporte con el que tramitaste el ESTA para el vuelo y para entrar a Estados Unidos.",
          ],
        },
      ],
    },
    {
      id: "la-diferencia-en-resumen",
      title: "La diferencia, en resumen",
      blocks: [
        {
          type: "ul",
          items: [
            [
              { b: "Visa:" },
              " trámite más largo, con entrevista en la Embajada. Suele durar varios años.",
            ],
            [
              { b: "ESTA:" },
              " trámite online y rápido, sin entrevista. Solo para pasaportes de los países del programa.",
            ],
          ],
        },
        {
          type: "p",
          text: [
            "En los dos casos, el oficial de migraciones decide al llegar si podés entrar y por cuánto tiempo.",
          ],
        },
      ],
    },
    {
      id: "no-sabes-cual-te-corresponde",
      title: "¿No sabés cuál te corresponde?",
      blocks: [
        {
          type: "p",
          text: [
            "Fijate si tu pasaporte está en la ",
            {
              href: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html",
              text: "lista oficial de países del Programa de Exención de Visas",
            },
            ". Si está, podés usar ESTA, y lo tramitás en la ",
            { href: "https://esta.cbp.dhs.gov/", text: "web oficial del ESTA" },
            ". Si no está, necesitás visa.",
          ],
        },
        {
          type: "p",
          text: [
            { b: "Ojo con las webs no oficiales:" },
            " hay muchas páginas que tramitan el ESTA cobrando bastante más. La única oficial termina en “.gov”.",
          ],
        },
      ],
    },
  ],
  cta: {
    id: "te-ayudo-con-tu-visa",
    heading: "Te ayudo con tu visa",
    body: "Si sos de Uruguay y tenés que sacar la visa, me encargo de todo el proceso con vos: el formulario DS-160, la cita en la Embajada, buscar una fecha más cercana y prepararte para la entrevista.",
    label: "Quiero gestionar mi visa",
  },
  afterCta: [
    {
      type: "fine",
      text: [
        "Esta guía es informativa. Los requisitos y costos pueden cambiar, así que siempre chequeá la información oficial antes de viajar.",
      ],
    },
  ],
};
