import { NAV } from "../nav-config";

describe("NAV titles (DDR-0005)", () => {
  it('keeps "Belén" bound to the word before it so the name never sits alone on a line', () => {
    const titles = NAV.flatMap((g) =>
      g.columns.flatMap((c) => c.items.map((i) => i.title)),
    );
    for (const title of titles.filter((t) => /\sBelén/.test(t))) {
      expect(title).toMatch(/\u00a0Belén/);
    }
  });

  it("lists the four services of the brief (DDR-0008)", () => {
    const services = NAV.find((g) => g.label === "Servicios");
    expect(services?.columns.map((c) => [c.heading, c.items[0].title])).toEqual(
      [
        ["Asesoramiento", "Consultoría de viaje"],
        ["A medida", "Itinerario personalizado"],
        ["En grupo", "Viajes grupales"],
        ["Trámites", "Visa de Estados Unidos"],
      ],
    );
  });
});
