import type { GuideBody } from "@/features/guias/types";

export const cuantoCuestaUnDiaEnNewYork: GuideBody = {
  intro: [
    {
      type: "p",
      text: [
        "New York tiene fama de cara, y es verdad que puede serlo. Pero con un poco de organización podés disfrutarla sin gastar de más. Acá te dejo una idea de cuánto cuesta un día, sin contar el alojamiento, para que armes tu presupuesto.",
      ],
    },
  ],
  keyFacts: [
    {
      value: "USD 50 a 70",
      label: "día económico",
      source: "entre USD 50 y 70",
    },
    {
      value: "USD 120 a 160",
      label: "día intermedio",
      source: "entre USD 120 y 160",
    },
    {
      value: "Más de USD 200",
      label: "día completo",
      source: "más de USD 200",
    },
  ],
  keyFactsLabel: "Datos clave, precios aproximados",
  sections: [
    {
      id: "lo-que-tenes-que-saber-antes",
      title: "Lo que tenés que saber antes",
      blocks: [
        {
          type: "ul",
          items: [
            [
              { b: "Los precios no incluyen impuestos." },
              " En New York se suma un 8,875% al precio de casi todo lo que comprás.",
            ],
            [
              { b: "La propina es obligatoria en la práctica." },
              " En restaurantes con servicio a la mesa se deja entre 18% y 20% de la cuenta (a veces ya viene sugerida en el ticket).",
            ],
            [{ b: "Todo se paga con tarjeta," }, " incluso montos chicos."],
          ],
        },
      ],
    },
    {
      id: "transporte",
      title: "Transporte",
      blocks: [
        {
          type: "ul",
          items: [
            [
              { b: "Subte o bus:" },
              " USD 3 por viaje. Con el tope semanal, nunca pagás más de USD 35 en 7 días.",
            ],
          ],
        },
      ],
    },
    {
      id: "comida",
      title: "Comida",
      blocks: [
        {
          type: "ul",
          items: [
            [{ b: "Café:" }, " USD 4 a 7"],
            [{ b: "Desayuno:" }, " USD 12 a 20"],
            [{ b: "Porción de pizza o comida al paso:" }, " USD 4 a 12"],
            [{ b: "Almuerzo en un lugar casual:" }, " USD 15 a 25"],
            [
              { b: "Cena en restaurante, con propina:" },
              " USD 50 a 90 por persona",
            ],
          ],
        },
      ],
    },
    {
      id: "atracciones",
      title: "Atracciones",
      blocks: [
        {
          type: "ul",
          items: [
            [{ b: "Miradores:" }, " entre USD 40 y 50 cada uno"],
            [
              { b: "Museos:" },
              " alrededor de USD 30 los más conocidos, como el MET o el MoMA. Algunos tienen días u horarios gratis.",
            ],
            [
              { b: "Planes gratis:" },
              " caminar el High Line, cruzar el Brooklyn Bridge, recorrer Central Park o tomar el ferry a Staten Island no cuestan nada.",
            ],
          ],
        },
      ],
    },
    {
      id: "un-dia-de-ejemplo",
      title: "Un día de ejemplo",
      blocks: [
        {
          type: "ul",
          items: [
            [
              { b: "Día económico:" },
              " entre USD 50 y 70, comiendo al paso y con planes gratis.",
            ],
            [
              { b: "Día intermedio:" },
              " entre USD 120 y 160, con una atracción paga y una cena en restaurante.",
            ],
            [
              { b: "Día completo:" },
              " más de USD 200, con mirador, museo y cena especial.",
            ],
          ],
        },
        {
          type: "fine",
          text: [
            "Los precios son aproximados y pueden variar según la zona y la época del año.",
          ],
        },
      ],
    },
    {
      id: "mis-tips-para-ahorrar",
      title: "Mis tips para ahorrar",
      blocks: [
        {
          type: "ul",
          items: [
            [
              { b: "Equilibrá las comidas." },
              " Si un día comés al paso o en lugares más económicos, te podés dar el gusto de una cena especial otro día.",
            ],
            [
              { b: "Comprá las entradas con anticipación." },
              " Muchas actividades son más baratas online y así evitás pagar de más en el momento.",
            ],
            [
              { b: "Armá tu itinerario conmigo." },
              " Organizando bien cada día, aprovechás tu tiempo y tu presupuesto al máximo, sin gastar en traslados ni planes que no valen la pena.",
            ],
          ],
        },
      ],
    },
  ],
  cta: {
    lead: "¿Querés que tu itinerario se adapte a tu presupuesto?",
    label: "Quiero mi itinerario",
  },
};
