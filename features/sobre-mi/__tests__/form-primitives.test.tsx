import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormField } from "@/features/sobre-mi/components/forms/form-field";
import { SelectField } from "@/features/sobre-mi/components/forms/select-field";
import { SubmitRow } from "@/features/sobre-mi/components/forms/submit-row";
import { NotConfiguredBanner } from "@/features/sobre-mi/components/forms/not-configured-banner";
import { NoJsBlock } from "@/features/sobre-mi/components/forms/no-js-block";
import { TOPIC_OPTIONS } from "@/features/sobre-mi/content/forms";
import { smSel } from "@/features/sobre-mi/motion/attributes";

const noop = () => {};

describe("FormField", () => {
  it("has a visible label bound to a controlled control with no name (AC 36; R-01)", () => {
    render(
      <FormField
        id="contact-name"
        label="Nombre"
        value="Persona Sintética"
        onChange={noop}
        autoComplete="name"
        maxLength={100}
      />,
    );
    const input = screen.getByLabelText("Nombre");
    expect(input).toHaveValue("Persona Sintética");
    expect(input).toHaveAttribute("id", "contact-name");
    expect(input).toHaveAttribute("autocomplete", "name");
    expect(input).toHaveAttribute("maxlength", "100");
    expect(input).not.toHaveAttribute("name");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("puts '(opcional)' inside the label", () => {
    render(
      <FormField
        id="contact-travel"
        label="¿Cuándo viajás?"
        optional
        value=""
        onChange={noop}
      />,
    );
    expect(
      screen.getByLabelText("¿Cuándo viajás? (opcional)"),
    ).toBeInTheDocument();
  });

  it("reports changes", async () => {
    const onChange = vi.fn();
    render(<FormField id="f" label="Nombre" value="" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Nombre"), "A");
    expect(onChange).toHaveBeenCalledWith("A");
  });

  it("ties an error to the field: aria-invalid, describedby, badge, bar (AC 38)", () => {
    const { container } = render(
      <FormField
        id="contact-email"
        label="Email"
        type="email"
        value=""
        onChange={noop}
        error="Falta tu email para poder responderte."
      />,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      "Falta tu email para poder responderte.",
    );
    const badge = screen.getByText("!");
    expect(badge).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(smSel("field"))).toContainElement(input);
  });

  it("renders a textarea when multiline", () => {
    render(
      <FormField id="m" label="Mensaje" multiline value="" onChange={noop} />,
    );
    expect(screen.getByLabelText("Mensaje").tagName).toBe("TEXTAREA");
  });

  it("renders typed markup as text, never as elements (R-06)", () => {
    const { container } = render(
      <FormField
        id="x"
        label="Nombre"
        value="<b>x</b>"
        onChange={noop}
        error="Falta tu nombre."
      />,
    );
    expect(screen.getByLabelText("Nombre")).toHaveValue("<b>x</b>");
    expect(container.querySelector("b")).toBeNull();
  });
});

describe("SelectField", () => {
  it("starts on the empty prompt option, lists the options, has no name (AC 37)", () => {
    render(
      <SelectField
        id="contact-topic"
        label="¿Sobre qué me escribís?"
        options={TOPIC_OPTIONS}
        value=""
        onChange={noop}
      />,
    );
    const select = screen.getByLabelText("¿Sobre qué me escribís?");
    expect(select).toHaveValue("");
    expect(select).not.toHaveAttribute("name");
    expect(
      Array.from((select as HTMLSelectElement).options).map((o) => o.text),
    ).toEqual([
      "Elegí una opción",
      "Itinerario personalizado",
      "Consultoría",
      "Viajes grupales",
      "Productos",
      "Colaboraciones",
      "Otro",
    ]);
  });

  it("shows an error like FormField", () => {
    render(
      <SelectField
        id="t"
        label="¿Sobre qué me escribís?"
        options={TOPIC_OPTIONS}
        value=""
        onChange={noop}
        error="Elegí sobre qué me escribís."
      />,
    );
    const select = screen.getByLabelText("¿Sobre qué me escribís?");
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select).toHaveAccessibleDescription("Elegí sobre qué me escribís.");
  });
});

describe("SubmitRow (AC 37, 43, 44; R-01)", () => {
  it("is a plain button until hydrated, then a submit button, with no helper line", () => {
    const { rerender, container } = render(
      <SubmitRow label="Enviar mensaje" hydrated={false} />,
    );
    const button = screen.getByRole("button", { name: "Enviar mensaje" });
    expect(button).toHaveAttribute("type", "button");
    rerender(<SubmitRow label="Enviar mensaje" hydrated />);
    expect(button).toHaveAttribute("type", "submit");
    expect(container.textContent).toBe("Enviar mensaje");
  });
});

describe("NotConfiguredBanner (AC 41)", () => {
  it("says to write by email, keeps the typed text, and takes focus (the live region is the shell's, RV-0012)", () => {
    const { container } = render(<NotConfiguredBanner />);
    expect(screen.queryByRole("status")).toBeNull();
    const banner = container.firstElementChild as HTMLElement;
    expect(banner).toHaveTextContent(
      "Por ahora, escribime a hola@vamosany.com. Lo que escribiste sigue acá.",
    );
    expect(banner).toHaveAttribute("tabindex", "-1");
    expect(banner).toHaveAttribute("data-sm-banner");
    const link = screen.getByRole("link", { name: "hola@vamosany.com" });
    expect(link).toHaveAttribute("href", "mailto:hola@vamosany.com");
  });
});

describe("NoJsBlock (AC 44)", () => {
  it("gives the email as a prominent mailto link", () => {
    render(<NoJsBlock />);
    const block = screen.getByText(/^Para escribirme, mandame un mail a/);
    expect(block).toHaveTextContent(
      "Para escribirme, mandame un mail a hola@vamosany.com. Te respondo yo.",
    );
    const link = screen.getByRole("link", { name: "hola@vamosany.com" });
    expect(link).toHaveAttribute("href", "mailto:hola@vamosany.com");
  });
});
