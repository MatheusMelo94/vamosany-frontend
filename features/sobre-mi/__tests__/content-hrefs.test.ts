import { isValidElement } from "react";
import * as colaboraciones from "@/features/sobre-mi/content/colaboraciones";
import * as contacto from "@/features/sobre-mi/content/contacto";
import * as faq from "@/features/sobre-mi/content/faq";
import * as forms from "@/features/sobre-mi/content/forms";
import * as metadata from "@/features/sobre-mi/content/metadata";
import * as nav from "@/features/sobre-mi/content/nav";
import * as richText from "@/features/sobre-mi/content/rich-text";
import * as sobreMi from "@/features/sobre-mi/content/sobre-mi";
import * as trabajaConmigo from "@/features/sobre-mi/content/trabaja-conmigo";

/**
 * G2 finding 0015 (R-05): every href in the Sobre mí content modules is
 * https:, mailto: or an internal path — never javascript:, http:, data:
 * or a protocol-relative "//host". Walks every export, including JSX
 * element props, so a cast can't slip a scheme past the types.
 */
const MODULES = {
  colaboraciones,
  contacto,
  faq,
  forms,
  metadata,
  nav,
  richText,
  sobreMi,
  trabajaConmigo,
};

const ALLOWED = /^(https:\/\/[^\s]+|mailto:[^\s]+|\/(?!\/)[^\s]*)$/;

function collectHrefs(
  value: unknown,
  path: string,
  out: Array<[string, string]>,
  seen = new Set<unknown>(),
) {
  if (value === null || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  if (isValidElement(value)) {
    collectHrefs(
      (value as { props: unknown }).props,
      `${path}<props>`,
      out,
      seen,
    );
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (key === "href" && typeof child === "string")
      out.push([`${path}.href`, child]);
    else collectHrefs(child, `${path}.${key}`, out, seen);
  }
}

describe("content hrefs (G2 0015)", () => {
  const hrefs: Array<[string, string]> = [];
  for (const [name, module] of Object.entries(MODULES)) {
    collectHrefs(module, name, hrefs);
  }

  it("finds the links the pages render", () => {
    const values = hrefs.map(([, href]) => href);
    expect(values).toEqual(
      expect.arrayContaining([
        "/sobre-mi",
        "/#services",
        "/preguntas-frecuentes#viajes-grupales",
        "mailto:hola@vamosany.com",
        "https://estudioulbia.com/",
        "https://www.instagram.com/vamosany/",
        "/contacto",
      ]),
    );
  });

  it.each(hrefs)(
    "%s is https:, mailto: or an internal path (%s)",
    (_path, href) => {
      expect(href).toMatch(ALLOWED);
    },
  );

  it("the allowlist itself rejects dangerous or ambiguous schemes", () => {
    for (const bad of [
      "javascript:alert(1)",
      "http://example.com",
      "data:text/html,x",
      "//evil.example",
      "vbscript:x",
    ]) {
      expect(bad).not.toMatch(ALLOWED);
    }
  });
});
