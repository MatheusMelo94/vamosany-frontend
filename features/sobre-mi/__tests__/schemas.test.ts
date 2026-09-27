import { readFileSync } from "node:fs";
import path from "node:path";
import * as FORMS from "@/features/sobre-mi/content/forms";
import {
  collaborationSchema,
  contactSchema,
  FIELD_LIMITS,
  validate,
} from "@/features/sobre-mi/schemas";

const EMPTY_CONTACT = {
  name: "",
  email: "",
  topic: "",
  travelDate: "",
  message: "",
};
const VALID_CONTACT = {
  name: "Persona Sintética",
  email: "sintetico-7f3a@ejemplo.test",
  topic: "consultoria",
  travelDate: "",
  message: "Mensaje de prueba.",
};
const EMPTY_COLLABORATION = {
  name: "",
  company: "",
  collaborationType: "",
  email: "",
  idea: "",
};

describe("contactSchema (spec § Form copy)", () => {
  it("gives each empty required field its own copy (AC 38)", () => {
    expect(validate(contactSchema, EMPTY_CONTACT)).toEqual({
      ok: false,
      errors: {
        name: "Falta tu nombre.",
        email: "Falta tu email para poder responderte.",
        topic: "Elegí sobre qué me escribís.",
        message: "Contame en qué te puedo ayudar.",
      },
    });
  });

  it("treats whitespace-only input as empty", () => {
    const result = validate(contactSchema, { ...VALID_CONTACT, name: "   " });
    expect(result).toEqual({ ok: false, errors: { name: "Falta tu nombre." } });
  });

  it.each(["sintetico", "sintetico@", "sintetico@ejemplo"])(
    "flags a malformed email %s (AC 39)",
    (email) => {
      expect(validate(contactSchema, { ...VALID_CONTACT, email })).toEqual({
        ok: false,
        errors: { email: "Revisá tu email, parece que le falta algo." },
      });
    },
  );

  it("lets an empty ¿Cuándo viajás? through as null (AC 40)", () => {
    expect(validate(contactSchema, VALID_CONTACT)).toEqual({
      ok: true,
      data: { ...VALID_CONTACT, travelDate: null },
    });
  });

  it("rejects a topic outside the options with the select copy", () => {
    expect(
      validate(contactSchema, { ...VALID_CONTACT, topic: "cualquier-cosa" }),
    ).toEqual({ ok: false, errors: { topic: "Elegí sobre qué me escribís." } });
  });

  it("trims values and strips unknown keys", () => {
    const result = validate(contactSchema, {
      ...VALID_CONTACT,
      name: "  Persona Sintética ",
      extra: "x",
    });
    expect(result).toEqual({
      ok: true,
      data: { ...VALID_CONTACT, travelDate: null },
    });
  });
});

describe("collaborationSchema (spec § Form copy)", () => {
  it("gives each empty required field its own copy (AC 38)", () => {
    expect(validate(collaborationSchema, EMPTY_COLLABORATION)).toEqual({
      ok: false,
      errors: {
        name: "Falta tu nombre.",
        company: "Falta el nombre de tu empresa o marca.",
        collaborationType: "Elegí qué tipo de colaboración te interesa.",
        email: "Falta tu email para poder responderte.",
        idea: "Contame tu idea, aunque sea en dos líneas.",
      },
    });
  });

  it("accepts a complete request", () => {
    const valid = {
      name: "Persona Sintética",
      company: "Estudio Ejemplo",
      collaborationType: "marca",
      email: "sintetico-7f3a@ejemplo.test",
      idea: "Una idea de prueba.",
    };
    expect(validate(collaborationSchema, valid)).toEqual({
      ok: true,
      data: valid,
    });
  });
});

describe("FIELD_LIMITS (plan § 5 Schemas)", () => {
  it("caps each field; the inputs carry the same maxLength", () => {
    expect(FIELD_LIMITS).toEqual({
      name: 100,
      email: 254,
      company: 120,
      travelDate: 60,
      message: 5000,
      idea: 5000,
    });
    expect(
      validate(contactSchema, { ...VALID_CONTACT, name: "a".repeat(101) }).ok,
    ).toBe(false);
  });
});

describe("this release's form copy only (AC 43; plan § 0.1 F6)", () => {
  const CONNECTED_ONLY = [
    "Enviando…",
    "¡Recibido!",
    "No se pudo enviar tu mensaje.",
    "Uso tu email solo para responderte.",
  ];

  it("keeps the connected-release strings out of the content module and the schemas", () => {
    const sources = ["../content/forms.ts", "../schemas.ts"].map((p) =>
      readFileSync(path.resolve(__dirname, p), "utf8"),
    );
    const exported = JSON.stringify(FORMS);
    for (const text of CONNECTED_ONLY) {
      expect(exported).not.toContain(text);
      for (const source of sources) expect(source).not.toContain(text);
    }
  });

  it("carries the not-configured banner and the no-JS block copy", () => {
    expect(FORMS.FORM_COPY.notConfigured).toEqual({
      before: "Por ahora, escribime a ",
      email: "hola@vamosany.com",
      after: ". Lo que escribiste sigue acá.",
    });
    expect(FORMS.FORM_COPY.noJs).toEqual({
      before: "Para escribirme, mandame un mail a ",
      email: "hola@vamosany.com",
      after: ". Te respondo yo.",
    });
    expect(FORMS.FORM_COPY.selectPrompt).toBe("Elegí una opción");
  });
});
