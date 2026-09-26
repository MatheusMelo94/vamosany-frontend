import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { CollaborationForm } from "@/features/sobre-mi/components/forms/collaboration-form";

/** Synthetic values only (frontend-qa-conventions § Test Data Fixtures). */
const VALID = {
  Nombre: "Persona Sintética",
  "Empresa o marca": "Estudio Ejemplo",
  Email: "sintetico-7f3a@ejemplo.test",
  "Contame tu idea": "Una idea de prueba.",
};

function setup() {
  const user = userEvent.setup();
  const utils = render(<CollaborationForm />);
  const root = utils.container.querySelector("[data-sm-form]") as HTMLElement;
  const events: CustomEvent[] = [];
  for (const type of ["sm:field-errors", "sm:banner"]) {
    root.addEventListener(type, (e) => events.push(e as CustomEvent));
  }
  const submit = () =>
    user.click(screen.getByRole("button", { name: "Agendemos un cafecito" }));
  const fillValid = async () => {
    for (const [label, value] of Object.entries(VALID)) {
      await user.type(screen.getByLabelText(label), value);
    }
    await user.selectOptions(
      screen.getByLabelText("¿Qué tipo de colaboración te interesa?"),
      "marca",
    );
  };
  return { ...utils, user, root, events, submit, fillValid };
}

describe("CollaborationForm — Idle (AC 33, 37)", () => {
  it("renders the fields in md order, the prompt, the button and the no-JS sibling", () => {
    const { container, root } = setup();
    expect(
      Array.from(container.querySelectorAll("form label")).map(
        (l) => l.textContent,
      ),
    ).toEqual([
      "Nombre",
      "Empresa o marca",
      "¿Qué tipo de colaboración te interesa?",
      "Email",
      "Contame tu idea",
    ]);
    expect(
      screen.getByLabelText("¿Qué tipo de colaboración te interesa?"),
    ).toHaveValue("");
    expect(screen.getByLabelText("Contame tu idea").tagName).toBe("TEXTAREA");
    expect(container.querySelector("form")).not.toHaveAttribute("action");
    expect(container.querySelectorAll("[name]")).toHaveLength(0);
    expect(root).toHaveClass("noscript:hidden");
    expect(root.nextElementSibling).toHaveClass("hidden", "noscript:block");
    expect(container.textContent).not.toContain("Uso tu email");
  });
});

describe("CollaborationForm — Field error (AC 38, 39)", () => {
  it("shows the five errors, focuses Nombre and reports the fields", async () => {
    const { submit, events } = setup();
    await submit();
    for (const [label, copy] of [
      ["Nombre", "Falta tu nombre."],
      ["Empresa o marca", "Falta el nombre de tu empresa o marca."],
      [
        "¿Qué tipo de colaboración te interesa?",
        "Elegí qué tipo de colaboración te interesa.",
      ],
      ["Email", "Falta tu email para poder responderte."],
      ["Contame tu idea", "Contame tu idea, aunque sea en dos líneas."],
    ]) {
      expect(
        screen.getByLabelText(label as string),
      ).toHaveAccessibleDescription(copy as string);
    }
    expect(screen.getByLabelText("Nombre")).toHaveFocus();
    expect(events.map((e) => [e.type, e.detail])).toEqual([
      [
        "sm:field-errors",
        {
          fields: [
            "collab-name",
            "collab-company",
            "collab-type",
            "collab-email",
            "collab-idea",
          ],
        },
      ],
    ]);
  });

  it("clears the malformed-email error while typing", async () => {
    const { submit, user } = setup();
    await user.type(screen.getByLabelText("Email"), "sintetico@");
    await submit();
    const email = screen.getByLabelText("Email");
    expect(email).toHaveAccessibleDescription(
      "Revisá tu email, parece que le falta algo.",
    );
    await user.type(email, "ejemplo.test");
    expect(email).not.toHaveAttribute("aria-invalid");
  });
});

describe("CollaborationForm — Not configured (AC 41, 42; R-01, R-03)", () => {
  it("sends nothing and keeps exactly one focused banner across submits", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const xhrOpen = vi.spyOn(XMLHttpRequest.prototype, "open");
    const beacon = vi.fn(() => true);
    Object.defineProperty(navigator, "sendBeacon", {
      value: beacon,
      configurable: true,
    });
    const href = window.location.href;
    const { submit, fillValid, events } = setup();
    await fillValid();
    await submit();
    const first = screen.getByRole("status");
    expect(first).toHaveFocus();
    await submit();
    const banners = screen.getAllByRole("status");
    expect(banners).toHaveLength(1);
    expect(banners[0]).not.toBe(first);
    expect(banners[0]).toHaveFocus();
    for (const [label, value] of Object.entries(VALID)) {
      expect(screen.getByLabelText(label)).toHaveValue(value);
    }
    expect(window.location.href).toBe(href);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrOpen).not.toHaveBeenCalled();
    expect(beacon).not.toHaveBeenCalled();
    expect(events.map((e) => e.type)).toEqual(["sm:banner", "sm:banner"]);
    fetchSpy.mockRestore();
    xhrOpen.mockRestore();
  });
});

describe("CollaborationForm — storage, hydration and markup (R-01, R-02, R-06)", () => {
  it("never writes to storage or cookies, and renders typed markup as text", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const cookie = vi.spyOn(document, "cookie", "set");
    const { submit, user, container } = setup();
    await user.type(screen.getByLabelText("Nombre"), "<b>x</b>");
    await submit();
    expect(container.querySelector("b")).toBeNull();
    expect(setItem).not.toHaveBeenCalled();
    expect(cookie).not.toHaveBeenCalled();
    setItem.mockRestore();
    cookie.mockRestore();
  });

  it("server-renders the button as type=button and makes it a submit after mount", async () => {
    const html = renderToString(<CollaborationForm />);
    expect(html).toMatch(
      /<button[^>]*type="button"[^>]*>Agendemos un cafecito/,
    );
    const { container } = render(<CollaborationForm />);
    await act(async () => {});
    expect(container.querySelector("button")).toHaveAttribute("type", "submit");
  });
});
