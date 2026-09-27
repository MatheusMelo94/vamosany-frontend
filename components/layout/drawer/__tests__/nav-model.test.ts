import { NAV, type NavGroup } from "@/components/layout/nav-config";
import {
  assertNavConfig,
  defaultOpenGroup,
  groupHasCurrent,
  isCurrentHref,
  itemHref,
  scentLine,
} from "../nav-model";

const SOBRE_MI_PATHS = [
  "/sobre-mi",
  "/colaboraciones",
  "/trabaja-conmigo",
  "/contacto",
  "/preguntas-frecuentes",
] as const;

function group(label: string): NavGroup {
  const found = NAV.find((g) => g.label === label);
  if (!found) throw new Error(`no group ${label}`);
  return found;
}

describe("scentLine (spec § Content & Copy)", () => {
  it.each([
    ["Itineraries", "By length · By season · By appetite"],
    ["Guides", "Getting around · Neighbourhoods · Before you fly"],
    ["Blog", "Latest · Readers"],
    ["Services", "Ready-made · One to one · In person"],
    ["Sobre mí", "Vamos a New York · Ayuda"],
  ])("gives %s the spec's scent line", (label, expected) => {
    expect(scentLine(group(label))).toBe(expected);
  });

  it("is derived from the column headings, not a copy of them", () => {
    const fixture: NavGroup = {
      label: "Fixture",
      columns: [
        { heading: "Alpha", items: [{ title: "a", blurb: "a" }] },
        { heading: "Beta", items: [{ title: "b", blurb: "b" }] },
      ],
    };
    expect(scentLine(fixture)).toBe("Alpha · Beta");
    const renamed: NavGroup = {
      ...fixture,
      columns: fixture.columns.map((c, i) =>
        i === 0 ? { ...c, heading: "Gamma" } : c,
      ),
    };
    expect(scentLine(renamed)).toBe("Gamma · Beta");
  });
});

describe("current page (DDR-0002/0003: derived from the URL)", () => {
  it.each(SOBRE_MI_PATHS)("opens Sobre mí by default on %s", (path) => {
    expect(defaultOpenGroup(NAV, path)).toBe("Sobre mí");
  });

  it.each(["/", "/#services", "/no-such-page"])(
    "opens no group by default on %s",
    (path) => {
      expect(defaultOpenGroup(NAV, path)).toBeNull();
    },
  );

  it("never marks Services as current, whatever the path", () => {
    for (const path of ["/", "/#services", ...SOBRE_MI_PATHS]) {
      expect(groupHasCurrent(group("Services"), path)).toBe(false);
    }
  });

  it("marks the Sobre mí group as current on its own routes only", () => {
    expect(groupHasCurrent(group("Sobre mí"), "/colaboraciones")).toBe(true);
    expect(groupHasCurrent(group("Sobre mí"), "/")).toBe(false);
  });

  it("matches an href only when it equals the pathname", () => {
    expect(isCurrentHref("/contacto", "/contacto")).toBe(true);
    expect(isCurrentHref("/contacto", "/sobre-mi")).toBe(false);
    expect(isCurrentHref(undefined, "/")).toBe(false);
  });
});

describe("itemHref", () => {
  it("uses the item's href when it has one", () => {
    expect(itemHref({ title: "t", blurb: "b", href: "/sobre-mi" })).toBe(
      "/sobre-mi",
    );
  });

  it("falls back to /#services", () => {
    expect(itemHref({ title: "t", blurb: "b" })).toBe("/#services");
  });
});

describe("config invariant (spec § States Matrix › Empty)", () => {
  it("accepts the shipped NAV", () => {
    expect(() => assertNavConfig(NAV)).not.toThrow();
  });

  it("fails on a group with no columns", () => {
    expect(() => assertNavConfig([{ label: "Empty", columns: [] }])).toThrow(
      /Empty/,
    );
  });

  it("fails on a column with no items", () => {
    expect(() =>
      assertNavConfig([
        { label: "Hollow", columns: [{ heading: "Nothing", items: [] }] },
      ]),
    ).toThrow(/Hollow.*Nothing/);
  });
});
