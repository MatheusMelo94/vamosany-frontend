import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { ContactForm } from "@/features/sobre-mi/components/forms/contact-form";

/** Synthetic values only (frontend-qa-conventions § Test Data Fixtures). */
/** The banner inside the persistent live region: the element that takes focus. */
function bannerIn(region: HTMLElement): HTMLElement {
  const el = region.querySelector<HTMLElement>("[data-sm-banner]");
  if (!el) throw new Error("no banner in the live region");
  return el;
}

const VALID = {
  Nombre: "Persona Sintética",
  Email: "sintetico-7f3a@ejemplo.test",
  Mensaje: "Mensaje de prueba.",
};

function setup() {
  const user = userEvent.setup();
  const utils = render(<ContactForm />);
  const root = utils.container.querySelector("[data-sm-form]") as HTMLElement;
  const events: CustomEvent[] = [];
  for (const type of ["sm:field-errors", "sm:banner"]) {
    root.addEventListener(type, (e) => events.push(e as CustomEvent));
  }
  const submit = () =>
    user.click(screen.getByRole("button", { name: "Enviar mensaje" }));
  const fillValid = async () => {
    await user.type(screen.getByLabelText("Nombre"), VALID.Nombre);
    await user.type(screen.getByLabelText("Email"), VALID.Email);
    await user.selectOptions(
      screen.getByLabelText("¿Sobre qué me escribís?"),
      "consultoria",
    );
    await user.type(screen.getByLabelText("Mensaje"), VALID.Mensaje);
  };
  return { ...utils, user, root, events, submit, fillValid };
}

describe("ContactForm — Idle (AC 36, 37; plan § 0.1 F2)", () => {
  it("renders the five fields in md order, selects on the prompt, and the button", () => {
    const { container } = setup();
    const labels = Array.from(container.querySelectorAll("form label")).map(
      (l) => l.textContent,
    );
    expect(labels).toEqual([
      "Nombre",
      "Email",
      "¿Sobre qué me escribís?",
      "¿Cuándo viajás? (opcional)",
      "Mensaje",
    ]);
    expect(screen.getByLabelText("¿Sobre qué me escribís?")).toHaveValue("");
    expect(
      screen.getByRole("button", { name: "Enviar mensaje" }),
    ).toBeInTheDocument();
    expect(container.textContent).not.toContain("Uso tu email");
  });

  it("has no action, method or named fields, and a no-JS sibling", () => {
    const { container, root } = setup();
    const form = container.querySelector("form") as HTMLFormElement;
    expect(form).not.toHaveAttribute("action");
    expect(form).not.toHaveAttribute("method");
    expect(container.querySelectorAll("[name]")).toHaveLength(0);
    expect(root).toHaveClass("noscript:hidden");
    const noJs = root.nextElementSibling;
    expect(noJs).toHaveClass("hidden", "noscript:block");
    expect(noJs).toHaveTextContent(
      "Para escribirme, mandame un mail a hola@vamosany.com. Te respondo yo.",
    );
  });

  it("lays the fields two per row from the @fields breakpoint", () => {
    const { container } = setup();
    const rows = container.querySelectorAll("form .\\@fields\\:grid-cols-2");
    expect(rows).toHaveLength(2);
  });
});

describe("ContactForm — Field error (AC 38, 39, 40)", () => {
  it("shows each error, focuses the first invalid field and reports the fields", async () => {
    const { submit, events } = setup();
    await submit();
    expect(screen.getByLabelText("Nombre")).toHaveAccessibleDescription(
      "Falta tu nombre.",
    );
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription(
      "Falta tu email para poder responderte.",
    );
    expect(
      screen.getByLabelText("¿Sobre qué me escribís?"),
    ).toHaveAccessibleDescription("Elegí sobre qué me escribís.");
    expect(screen.getByLabelText("Mensaje")).toHaveAccessibleDescription(
      "Contame en qué te puedo ayudar.",
    );
    expect(
      screen.getByLabelText("¿Cuándo viajás? (opcional)"),
    ).not.toHaveAttribute("aria-invalid");
    expect(screen.getByLabelText("Nombre")).toHaveFocus();
    expect(events.map((e) => [e.type, e.detail])).toEqual([
      [
        "sm:field-errors",
        {
          fields: [
            "contact-name",
            "contact-email",
            "contact-topic",
            "contact-message",
          ],
        },
      ],
    ]);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("keeps what was typed and clears an error as soon as the value is valid", async () => {
    const { submit, user } = setup();
    await user.type(screen.getByLabelText("Email"), "sintetico");
    await submit();
    const email = screen.getByLabelText("Email");
    expect(email).toHaveValue("sintetico");
    expect(email).toHaveAccessibleDescription(
      "Revisá tu email, parece que le falta algo.",
    );
    await user.type(email, "-7f3a@ejemplo.test");
    expect(email).not.toHaveAttribute("aria-invalid");
    // Other errors stay until their field is fixed.
    expect(screen.getByLabelText("Nombre")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});

describe("ContactForm — Not configured (AC 41, 42; R-01, R-03)", () => {
  it("sends nothing, shows one focused banner above the form and keeps the values", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const xhrOpen = vi.spyOn(XMLHttpRequest.prototype, "open");
    const beacon = vi.fn(() => true);
    Object.defineProperty(navigator, "sendBeacon", {
      value: beacon,
      configurable: true,
    });
    const href = window.location.href;
    const { submit, fillValid, events, root } = setup();
    await fillValid();
    await submit();

    const region = screen.getByRole("status");
    expect(region).toHaveTextContent(
      "Por ahora, escribime a hola@vamosany.com. Lo que escribiste sigue acá.",
    );
    const banner = bannerIn(region);
    expect(banner).toHaveFocus();
    expect(
      banner.compareDocumentPosition(root.querySelector("form") as Node),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.getByLabelText("Nombre")).toHaveValue(VALID.Nombre);
    expect(screen.getByLabelText("Email")).toHaveValue(VALID.Email);
    expect(screen.getByLabelText("Mensaje")).toHaveValue(VALID.Mensaje);
    expect(window.location.href).toBe(href);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrOpen).not.toHaveBeenCalled();
    expect(beacon).not.toHaveBeenCalled();
    expect(events.map((e) => e.type)).toEqual(["sm:banner"]);
    fetchSpy.mockRestore();
    xhrOpen.mockRestore();
  });

  it("keeps one live region mounted and re-mounts only the banner inside it to re-announce (RV-0012)", async () => {
    const { submit, fillValid, events } = setup();
    const region = screen.getByRole("status");
    expect(region).toBeEmptyDOMElement();
    await fillValid();
    await submit();
    const first = bannerIn(region);
    await submit();
    expect(screen.getAllByRole("status")).toEqual([region]);
    const second = bannerIn(region);
    expect(second).not.toBe(first);
    expect(second).toHaveFocus();
    expect(events.map((e) => e.type)).toEqual(["sm:banner", "sm:banner"]);
  });

  it("removes the banner when a later submit has errors (AC 42)", async () => {
    const { submit, fillValid, user } = setup();
    await fillValid();
    await submit();
    const region = screen.getByRole("status");
    await user.clear(screen.getByLabelText("Nombre"));
    await submit();
    expect(screen.getByRole("status")).toBe(region);
    expect(region).toBeEmptyDOMElement();
    expect(screen.getByLabelText("Nombre")).toHaveFocus();
  });
});

describe("ContactForm — storage, hydration and markup (R-01, R-02, R-06)", () => {
  it("never writes to storage or cookies", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const cookie = vi.spyOn(document, "cookie", "set");
    const { submit, fillValid } = setup();
    await fillValid();
    await submit();
    await submit();
    expect(setItem).not.toHaveBeenCalled();
    expect(cookie).not.toHaveBeenCalled();
    setItem.mockRestore();
    cookie.mockRestore();
  });

  it("server-renders the button as type=button and makes it a submit after mount", async () => {
    const html = renderToString(<ContactForm />);
    expect(html).toMatch(/<button[^>]*type="button"[^>]*>Enviar mensaje/);
    expect(html).not.toMatch(/type="submit"/);
    const { container } = render(<ContactForm />);
    await act(async () => {});
    expect(container.querySelector("button")).toHaveAttribute("type", "submit");
  });

  it("renders typed markup as text in every state", async () => {
    const { submit, user, container } = setup();
    await user.type(screen.getByLabelText("Nombre"), "<b>x</b>");
    await submit();
    expect(container.querySelector("b")).toBeNull();
    await user.type(screen.getByLabelText("Email"), VALID.Email);
    await user.selectOptions(
      screen.getByLabelText("¿Sobre qué me escribís?"),
      "otro",
    );
    await user.type(screen.getByLabelText("Mensaje"), "<b>y</b>");
    await submit();
    expect(screen.getByRole("status")).not.toBeEmptyDOMElement();
    expect(container.querySelector("b")).toBeNull();
  });
});
