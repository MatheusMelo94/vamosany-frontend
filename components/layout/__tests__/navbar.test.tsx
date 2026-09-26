import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "@/components/layout/navbar";
import { NAV, READING_BAR_ROUTES } from "@/components/layout/nav-config";

/** Today's menu content (pre-DDR-0002), as rendered by the desktop mega-menu. */
const TODAY: Record<string, Array<[heading: string, titles: string[]]>> = {
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
  About: [
    ["The studio", ["Our Story", "How We Research", "Press", "Work With Us"]],
    ["Help", ["Contact", "Refunds", "FAQ"]],
  ],
};

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
    expect(NAV.map((g) => g.label)).toEqual(Object.keys(TODAY));
  });

  it("lists the routes that get the navbar reading bar", () => {
    expect(READING_BAR_ROUTES).toEqual(["/colaboraciones"]);
  });
});

describe("Navbar", () => {
  it("renders the five dropdown triggers", () => {
    render(<Navbar />);
    for (const label of Object.keys(TODAY)) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it.each(Object.entries(TODAY))(
    "opens %s with its column headings and item titles",
    async (label, columns) => {
      const { container } = render(<Navbar />);
      await openPanel(label);
      const capsule = container.querySelector(".nav-capsule");
      if (!(capsule instanceof HTMLElement)) throw new Error("no capsule");
      for (const [heading, titles] of columns) {
        expect(within(capsule).getByText(heading)).toBeInTheDocument();
        for (const title of titles) {
          expect(within(capsule).getByText(title)).toBeInTheDocument();
        }
      }
    },
  );
});
