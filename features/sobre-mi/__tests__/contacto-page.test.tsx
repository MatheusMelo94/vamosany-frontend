import { render, screen, within } from "@testing-library/react";
import { ContactoPage } from "@/features/sobre-mi/components/contacto-page";
import { CONTACTO } from "@/features/sobre-mi/content/contacto";
import { smSel } from "@/features/sobre-mi/motion/attributes";
import { isVerbatim } from "./verbatim";

describe("Contacto content (spec § Page 4)", () => {
  it("takes the [md] strings verbatim (AC 12)", () => {
    expect(isVerbatim(CONTACTO.header.title)).toBe(true);
    // The dek is the documented exception: brackets dropped, wording kept.
    expect(isVerbatim(CONTACTO.header.dek)).toBe(true);
    // The md writes these as "label:" lines; the spec's H2 drops the colon.
    expect(isVerbatim(`${CONTACTO.channels.heading}:`)).toBe(true);
    for (const channel of CONTACTO.channels.items) {
      expect(isVerbatim(`${channel.label}: ${channel.value}`)).toBe(true);
    }
  });
});

describe("ContactoPage", () => {
  it("says a couple of days, with no brackets anywhere (AC 34)", () => {
    const { container } = render(<ContactoPage />);
    expect(container.querySelector(smSel("dek"))).toHaveTextContent(
      "puede que tarde un par de días en contestarte",
    );
    expect(container.textContent).not.toMatch(/[[\]]/);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Escribime, te respondo yo.",
      }),
    ).toBeInTheDocument();
  });

  it("lists the other channels as links under their h2 (AC 35)", () => {
    const { container } = render(<ContactoPage />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Otras formas de encontrarme",
      }),
    ).toBeInTheDocument();
    const channels = container.querySelector(smSel("channels")) as HTMLElement;
    const rows = within(channels).getAllByRole("listitem");
    expect(rows.map((r) => r.firstElementChild?.textContent)).toEqual([
      "Email",
      "Instagram",
      "TikTok",
    ]);
    const email = within(channels).getByRole("link", {
      name: "hola@vamosany.com",
    });
    expect(email).toHaveAttribute("href", "mailto:hola@vamosany.com");
    expect(email).not.toHaveAttribute("target");
    const [instagram] = within(channels).getAllByRole("link", {
      name: "@vamosany (se abre en otra pestaña)",
    });
    expect(
      within(channels)
        .getAllByRole("link", { name: "@vamosany (se abre en otra pestaña)" })
        .map((l) => [l.getAttribute("href"), l.getAttribute("target")]),
    ).toEqual([
      ["https://www.instagram.com/vamosany/", "_blank"],
      ["https://www.tiktok.com/@vamosany", "_blank"],
    ]);
    expect(instagram).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("has no closing row, and puts the contact form in the main column (T029)", () => {
    const { container } = render(<ContactoPage />);
    expect(container.querySelector(smSel("closing"))).toBeNull();
    const notes = container.querySelector(smSel("notes"));
    const form = container.querySelector(smSel("form"));
    expect(form).not.toBeNull();
    expect(notes?.compareDocumentPosition(form as Node)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(
      screen.getByRole("button", { name: "Enviar mensaje" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
    ).toEqual(["Otras formas de encontrarme"]);
  });
});
