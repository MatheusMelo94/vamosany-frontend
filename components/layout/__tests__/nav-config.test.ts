import { NAV } from "../nav-config";

describe("NAV titles (DDR-0005)", () => {
  it('keeps "with Belén" together so the name never sits alone on a line', () => {
    const titles = NAV.flatMap((g) =>
      g.columns.flatMap((c) => c.items.map((i) => i.title)),
    );
    const custom = titles.find((t) => t.startsWith("Custom itinerary"));
    expect(custom).toBe("Custom itinerary with Belén");
  });
});
