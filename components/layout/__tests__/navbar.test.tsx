import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "@/components/layout/navbar";
import { NAV, READING_BAR_ROUTES } from "@/components/layout/nav-config";

/** Menu content rendered by the desktop mega-menu (DDR-0002: "About" became "Sobre mí"). */
const EXPECTED: Record<string, Array<[heading: string, titles: string[]]>> = {
  Itineraries: [
    [
      "By length",
      [
        "3 Days — First Timer",
        "5 Days — The Classic",
        "7 Days — Deep Cut",
        "Weekend Escape",
      ],
    ],
    [
      "By season",
      [
        "Christmas in New York",
        "Autumn in the Parks",
        "Summer Rooftops",
        "Winter on a Budget",
      ],
    ],
    [
      "By appetite",
      ["Foodie New York", "Art & Museums", "Family New York", "Film Locations"],
    ],
  ],
  Guides: [
    [
      "Getting around",
      [
        "The Subway, Explained",
        "From the Airport",
        "Walking the Grid",
        "Yellow Cab vs App",
      ],
    ],
    [
      "Neighbourhoods",
      ["Lower East Side", "Williamsburg", "Harlem", "Chinatown & Little Italy"],
    ],
    [
      "Before you fly",
      [
        "ESTA & Entry",
        "Budget Calculator",
        "Packing for the Season",
        "Broadway Tickets",
      ],
    ],
  ],
  Blog: [
    [
      "Latest",
      [
        "Neighbourhood Diaries",
        "Seasonal Guides",
        "Food Crawls",
        "Photo Spots",
      ],
    ],
    [
      "Readers",
      [
        "Reader Trips",
        "Ask Us Anything",
        "Mistakes We Made",
        "Newsletter Archive",
      ],
    ],
  ],
  Services: [
    ["Ready-made", ["Curated by Belén"]],
    ["One to one", ["Custom itinerary with Belén"]],
    ["In person", ["Walk with Belén"]],
  ],
  "Sobre mí": [
    ["Vamos a New York", ["Sobre mí", "Colaboraciones", "Trabajá conmigo"]],
    ["Ayuda", ["Contacto", "FAQ"]],
  ],
};

/** spec § Menu IA (DDR-0002): title, blurb, route. */
const SOBRE_MI_ITEMS = [
  ["Sobre mí", "Quién soy y por qué New York.", "/sobre-mi"],
  ["Colaboraciones", "Cuadernos, agendas, cases y totes.", "/colaboraciones"],
  [
    "Trabajá conmigo",
    "Marcas, guías, empresas y agencias.",
    "/trabaja-conmigo",
  ],
  ["Contacto", "Te respondo yo.", "/contacto"],
  ["FAQ", "Antes de viajar.", "/preguntas-frecuentes"],
] as const;

/** The old "About" items and blurb that DDR-0002 removes (AC 2). */
const REMOVED = [
  "Our Story",
  "How We Research",
  "Press",
  "Work With Us",
  "Contact",
  "Refunds",
  "The usual suspects.",
];

/** The open desktop panel (the rounded block holding the columns). */
function panelIn(container: HTMLElement): HTMLElement {
  const panel = container.querySelector(".nav-capsule div.rounded-3xl");
  if (!(panel instanceof HTMLElement)) throw new Error("no open panel");
  return panel;
}

/** Opens a dropdown the keyboard way: a pointer click fires mouseenter (open) then click (toggle). */
async function openPanel(label: string) {
  const user = userEvent.setup();
  const trigger = screen.getByRole("button", { name: label });
  trigger.focus();
  await user.keyboard("{Enter}");
  expect(trigger).toHaveAttribute("aria-expanded", "true");
}

describe("nav-config", () => {
  it("is the single source of the five groups, in navbar order", () => {
    expect(NAV.map((g) => g.label)).toEqual(Object.keys(EXPECTED));
  });

  it("lists the routes that get the navbar reading bar", () => {
    expect(READING_BAR_ROUTES).toEqual(["/colaboraciones"]);
  });
});

describe("Navbar", () => {
  it("renders the five dropdown triggers", () => {
    render(<Navbar />);
    for (const label of Object.keys(EXPECTED)) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it.each(Object.entries(EXPECTED))(
    "opens %s with its column headings and item titles",
    async (label, columns) => {
      const { container } = render(<Navbar />);
      await openPanel(label);
      const panel = panelIn(container);
      for (const [heading, titles] of columns) {
        expect(within(panel).getByText(heading)).toBeInTheDocument();
        for (const title of titles) {
          expect(within(panel).getByText(title)).toBeInTheDocument();
        }
      }
    },
  );

  it("puts Sobre mí last, where About was (DDR-0002)", () => {
    expect(NAV.at(-1)?.label).toBe("Sobre mí");
  });

  it("links each Sobre mí item, with its blurb, to its route (AC 1)", async () => {
    const { container } = render(<Navbar />);
    await openPanel("Sobre mí");
    const panel = panelIn(container);
    for (const [title, blurb, href] of SOBRE_MI_ITEMS) {
      // jsdom applies no CSS, so the block-level blurb span adds no space to
      // the accessible name; assert the link's href and content instead.
      const link = within(panel).getByText(title).closest("a");
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveTextContent(blurb);
    }
  });

  it("no longer shows the old About items in any panel or the drawer (AC 2)", async () => {
    const user = userEvent.setup();
    const { container } = render(<Navbar />);
    for (const label of Object.keys(EXPECTED)) {
      await openPanel(label);
      for (const text of REMOVED) {
        expect(within(panelIn(container)).queryByText(text)).toBeNull();
      }
    }
    await user.click(screen.getByRole("button", { name: "Toggle menu" }));
    for (const text of REMOVED) {
      expect(screen.queryByText(text)).toBeNull();
    }
  });

  it("mirrors the Sobre mí group in the drawer; tapping an item closes it (AC 3)", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const toggle = screen.getByRole("button", { name: "Toggle menu" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Vamos a New York")).toBeInTheDocument();
    expect(screen.getByText("Ayuda")).toBeInTheDocument();
    for (const [title, , href] of SOBRE_MI_ITEMS) {
      expect(screen.getByRole("link", { name: title })).toHaveAttribute(
        "href",
        href,
      );
    }
    await user.click(screen.getByRole("link", { name: "Colaboraciones" }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Vamos a New York")).toBeNull();
  });
});
