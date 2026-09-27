/**
 * Form copy for THIS release only (spec v1.1 § Form copy; plan § 0.1 F6).
 * The connected-release strings (submitting, success, connection failure and
 * the email-use helper) live only in the spec, never in code, so no chunk can
 * carry them (AC 43).
 */

/** Contacto "¿Sobre qué me escribís?" options, slug → label ([md]). */
export const TOPIC_OPTIONS = [
  { value: "itinerario", label: "Itinerario personalizado" },
  { value: "consultoria", label: "Consultoría" },
  { value: "viajes-grupales", label: "Viajes grupales" },
  { value: "productos", label: "Productos" },
  { value: "colaboraciones", label: "Colaboraciones" },
  { value: "otro", label: "Otro" },
] as const;

/** Trabajá conmigo "¿Qué tipo de colaboración te interesa?" options ([md]). */
export const COLLABORATION_OPTIONS = [
  { value: "marca", label: "Marca" },
  { value: "servicio", label: "Servicio en New York" },
  { value: "guia", label: "Guía turístico" },
  { value: "empresa", label: "Empresa" },
  { value: "agencia", label: "Agencia de viajes" },
  { value: "otro", label: "Otro" },
] as const;

export const FORM_COPY = {
  // [new]
  selectPrompt: "Elegí una opción",
  // [md] labels
  labels: {
    name: "Nombre",
    email: "Email",
    topic: "¿Sobre qué me escribís?",
    travelDate: "¿Cuándo viajás?",
    message: "Mensaje",
    company: "Empresa o marca",
    collaborationType: "¿Qué tipo de colaboración te interesa?",
    idea: "Contame tu idea",
  },
  // [md] "(opcional)", inside the label
  optional: "(opcional)",
  // [md] buttons
  buttons: {
    contact: "Enviar mensaje",
    collaboration: "Agendemos un cafecito",
  },
  // [mock]/[new] field errors
  errors: {
    name: "Falta tu nombre.",
    emailEmpty: "Falta tu email para poder responderte.",
    emailMalformed: "Revisá tu email, parece que le falta algo.",
    topic: "Elegí sobre qué me escribís.",
    message: "Contame en qué te puedo ayudar.",
    company: "Falta el nombre de tu empresa o marca.",
    collaborationType: "Elegí qué tipo de colaboración te interesa.",
    idea: "Contame tu idea, aunque sea en dos líneas.",
  },
  // [new, approved 2026-09-26] shown after a valid submit
  notConfigured: {
    before: "Por ahora, escribime a ",
    email: "hola@vamosany.com",
    after: ". Lo que escribiste sigue acá.",
  },
  // [new] shown instead of the form when JS is off
  noJs: {
    before: "Para escribirme, mandame un mail a ",
    email: "hola@vamosany.com",
    after: ". Te respondo yo.",
  },
} as const;
