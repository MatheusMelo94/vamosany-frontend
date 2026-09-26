import { render, screen, within } from "@testing-library/react";
import { TrabajaConmigoPage } from "@/features/sobre-mi/components/trabaja-conmigo-page";
import { TRABAJA_CONMIGO } from "@/features/sobre-mi/content/trabaja-conmigo";
import { smSel } from "@/features/sobre-mi/motion/attributes";
import { isVerbatim } from "./verbatim";

const AUDIENCES = [
  "Marcas que quieran colaborar",
  "Empresas de servicios en New York",
  "Guías turísticos",
  "Empresas que quieran contratar mis itinerarios",
  "Agencias de viaje",
];

describe("Trabajá conmigo content (spec § Page 3)", () => {
  it("takes every [md] string verbatim (AC 12)", () => {
    const md = [
      TRABAJA_CONMIGO.header.title,
      TRABAJA_CONMIGO.header.dek,
      TRABAJA_CONMIGO.intro,
      ...TRABAJA_CONMIGO.audiences.flatMap((a) => [a.title, a.text]),
      TRABAJA_CONMIGO.cafecito.cierre,
    ];
    expect(md).toHaveLength(14);
    for (const text of md) {
      expect({ text, verbatim: isVerbatim(text) }).toEqual({
        text,
        verbatim: true,
      });
    }
  });
});

describe("TrabajaConmigoPage", () => {
  it("renders the H1, dek, notes and intro (AC 11)", () => {
    const { container } = render(<TrabajaConmigoPage />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "¿Nos tomamos un cafecito?",
      }),
    ).toBeInTheDocument();
    const notes = Array.from(container.querySelectorAll(smSel("notes")));
    expect(
      notes.map((n) => Array.from(n.children).map((c) => c.textContent)),
    ).toEqual([
      [
        "Desde 2021",
        "+20 visitas",
        "6 viajes grupales",
        "Muchísimos itinerarios",
      ],
      ["El cafecito", "Virtual", "En Montevideo", "O en New York"],
    ]);
    expect(screen.getByText(TRABAJA_CONMIGO.intro)).toBeInTheDocument();
  });

  it("renders five audience rows, each an h2 and its text over a drawn rule (AC 32)", () => {
    const { container } = render(<TrabajaConmigoPage />);
    const list = container.querySelector(smSel("audience")) as HTMLElement;
    const rows = within(list).getAllByRole("listitem");
    expect(rows).toHaveLength(5);
    rows.forEach((row, i) => {
      expect(
        within(row).getByRole("heading", { level: 2, name: AUDIENCES[i] }),
      ).toBeInTheDocument();
      expect(row).toHaveTextContent(TRABAJA_CONMIGO.audiences[i]?.text ?? "");
      const rule = row.querySelector(smSel("rule"));
      expect(rule).toHaveAttribute("aria-hidden", "true");
    });
    expect(rows[0]?.querySelector(smSel("rule"))).toHaveClass(
      "h-0.5",
      "bg-ink",
    );
    expect(rows[1]?.querySelector(smSel("rule"))).toHaveClass(
      "h-px",
      "bg-hairline",
    );
  });

  it("closes with the cafecito section as body-lg, and no closing row (AC 33)", () => {
    const { container } = render(<TrabajaConmigoPage />);
    expect(
      screen.getByRole("heading", { level: 2, name: "El cafecito" }),
    ).toBeInTheDocument();
    expect(screen.getByText(TRABAJA_CONMIGO.cafecito.cierre)).toHaveClass(
      "body-lg",
    );
    expect(container.querySelector(smSel("closing"))).toBeNull();
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
    ).toEqual([...AUDIENCES, "El cafecito"]);
  });

  it("reserves the form slot right after the Cierre", () => {
    render(<TrabajaConmigoPage form={<form aria-label="Cafecito" />} />);
    const cierre = screen.getByText(TRABAJA_CONMIGO.cafecito.cierre);
    expect(cierre.nextElementSibling).toBe(
      screen.getByRole("form", { name: "Cafecito" }),
    );
  });
});
