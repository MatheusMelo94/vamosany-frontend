import type { GuideBody } from "@/features/guias/types";

export const queLlevarSegunLaTemporada: GuideBody = {
  intro: [
    {
      type: "p",
      text: [
        "New York tiene cuatro estaciones muy marcadas, y armar bien la valija hace toda la diferencia. Acá te cuento qué esperar en cada época y qué no te puede faltar.",
      ],
    },
  ],
  keyFacts: [
    {
      value: "3 o 5 °C",
      label: "máximas típicas en invierno",
      source: "3 o 5 °C",
    },
    {
      value: "Más de 28 °C",
      label: "máximas en verano",
      source: "pasan los 28 °C",
    },
    {
      value: "110 V",
      label: "la corriente en Estados Unidos",
      source: "110 V",
    },
  ],
  sections: [
    {
      id: "invierno-diciembre-a-febrero",
      title: "Invierno (diciembre a febrero)",
      blocks: [
        {
          type: "p",
          text: [
            "Hace mucho frío: las máximas suelen rondar los 3 o 5 °C y de noche baja de cero. Puede nevar, y el viento entre los edificios hace que la sensación térmica sea todavía menor.",
          ],
        },
        {
          type: "ul",
          items: [
            ["Campera abrigada, de las que llegan a la cadera o más largas"],
            ["Gorro, guantes y bufanda"],
            ["Botas impermeables y cómodas para caminar"],
            ["Ropa interior térmica, que ocupa poco y abriga muchísimo"],
            [
              "Varias capas: adentro de los museos y las tiendas la calefacción está fuerte, y vas a estar sacándote y poniéndote ropa todo el día",
            ],
          ],
        },
      ],
    },
    {
      id: "primavera-marzo-a-mayo",
      title: "Primavera (marzo a mayo)",
      blocks: [
        {
          type: "p",
          text: [
            "El clima es cambiante. En marzo todavía puede hacer frío, y en mayo ya hay días de calor. Es una de las épocas más lindas, con los parques en flor.",
          ],
        },
        {
          type: "ul",
          items: [
            ["Campera liviana o trench"],
            ["Un abrigo extra para la noche"],
            ["Paraguas: llueve bastante"],
            ["Calzado cómodo que aguante algún día de lluvia"],
          ],
        },
      ],
    },
    {
      id: "verano-junio-a-agosto",
      title: "Verano (junio a agosto)",
      blocks: [
        {
          type: "p",
          text: [
            "Hace calor y mucha humedad: las máximas pasan los 28 °C y en olas de calor pueden superar los 35 °C.",
          ],
        },
        {
          type: "ul",
          items: [
            ["Ropa fresca y liviana"],
            [
              "Un buzo o abrigo liviano: el aire acondicionado del subte, los museos y los restaurantes está muy fuerte",
            ],
            ["Protector solar, lentes de sol y gorra"],
            ["Botella reutilizable para tomar agua"],
            [
              "Calzado cómodo y fresco, pero que sirva para caminar todo el día",
            ],
          ],
        },
      ],
    },
    {
      id: "otono-septiembre-a-noviembre",
      title: "Otoño (septiembre a noviembre)",
      blocks: [
        {
          type: "p",
          text: [
            "Para muchos, la mejor época. En septiembre todavía hace calor, en octubre el clima es ideal y en noviembre ya empieza el frío. Los árboles cambian de color y la ciudad queda preciosa.",
          ],
        },
        {
          type: "ul",
          items: [
            ["Ropa en capas: remeras, buzos y una campera"],
            ["Abrigo más grueso si viajás en noviembre"],
            ["Paraguas"],
          ],
        },
      ],
    },
    {
      id: "lo-que-no-puede-faltar-en-cualquier-epoca",
      title: "Lo que no puede faltar, en cualquier época",
      blocks: [
        {
          type: "ul",
          items: [
            [
              { b: "Zapatos cómodos:" },
              " vas a caminar entre 15 y 20 mil pasos por día.",
            ],
            [
              { b: "Adaptador de enchufe:" },
              " en Estados Unidos los enchufes son de patas planas y la corriente es de 110 V. La mayoría de los cargadores de celular y computadora funcionan igual, pero el secador de pelo o la planchita pueden no funcionar.",
            ],
            [
              { b: "Cargador portátil:" },
              " con tantas fotos y mapas, el celular no llega al final del día.",
            ],
            [
              { b: "Una mochila o cartera cómoda" },
              " para llevar todo mientras recorrés.",
            ],
          ],
        },
      ],
    },
    {
      id: "mi-pique-de-valija",
      title: "Mi pique de valija",
      blocks: [
        {
          type: "p",
          text: [
            "Viajo liviana y llevo lo justo y necesario. Estas son mis reglas:",
          ],
        },
        {
          type: "ul",
          items: [
            [
              { b: "Armo los conjuntos antes de viajar." },
              " Así sé exactamente qué me voy a poner cada día y no cargo ropa de más.",
            ],
            [
              { b: "No llevo cosas “por las dudas”." },
              " En New York se puede comprar todo y, en definitiva, siempre termino comprándome algo.",
            ],
            [
              { b: "Paso todos mis productos a frasquitos chicos." },
              " No cargo con los envases originales, que pesan y ocupan lugar.",
            ],
          ],
        },
        {
          type: "p",
          text: ["Así me queda espacio en la valija para lo que compro allá."],
        },
      ],
    },
  ],
  cta: {
    lead: "¿Querés que tu itinerario tenga en cuenta el clima de tu fecha de viaje?",
    label: "Quiero mi itinerario",
  },
};
