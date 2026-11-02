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

  it("lists the four services, with short titles (DDR-0010)", () => {
    const services = NAV.find((g) => g.label === "Servicios");
    expect(services?.columns.map((c) => [c.heading, c.items[0].title])).toEqual(
      [
        ["Asesoramiento", "Consultoría"],
        ["A medida", "Itinerario"],
        ["En grupo", "Viaje grupal"],
        ["Trámites", "Visa EE.\u00a0UU."],
      ],
    );
  });

  it("shows Servicios as equal boxes, with no prices or tags (DDR-0010)", () => {
    const services = NAV.find((g) => g.label === "Servicios");
    expect(services?.cards).toBe(true);
    for (const item of services?.columns.flatMap((c) => c.items) ?? []) {
      expect(item.price).toBeUndefined();
      expect(item.tag).toBeUndefined();
    }
  });
});

describe("NAV › Guías (DDR-0012)", () => {
  const guias = NAV.find((g) => g.label === "Guías");

  it("comes from the Guías registry: 3 columns of 4 linked items", () => {
    expect(guias?.columns.map((c) => c.items.length)).toEqual([4, 4, 4]);
    for (const item of guias?.columns.flatMap((c) => c.items) ?? []) {
      expect(item.href).toMatch(/^\/guias\/[a-z0-9-]+$/);
    }
  });

  it('has no "Taxi, Uber o subte" item (AC 5)', () => {
    const titles = NAV.flatMap((g) =>
      g.columns.flatMap((c) => c.items.map((i) => i.title)),
    );
    expect(titles).not.toContain("Taxi, Uber o subte");
    expect(titles).toContain("Caminar por New York");
  });
});

describe("NAV › footer links (DDR-0013)", () => {
  it("only the Guías group has one", () => {
    expect(
      NAV.filter((g) => g.footerLink).map((g) => [g.label, g.footerLink?.href]),
    ).toEqual([["Guías", "/guias"]]);
  });
});
