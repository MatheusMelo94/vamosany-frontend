import { readFileSync } from "node:fs";
import path from "node:path";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { NAV } from "@/components/layout/nav-config";

vi.mock("next/navigation", () => ({ usePathname: vi.fn(() => "/") }));

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
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    await screen.findByRole("navigation", { name: "Menú" });
    for (const text of REMOVED) {
      expect(screen.queryByText(text)).toBeNull();
    }
  });

  it("puts the phone drawer's links inside a labelled navigation landmark (RV-0015)", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    const menu = await screen.findByRole("navigation", { name: "Menú" });
    await user.click(within(menu).getByRole("button", { name: "Sobre mí" }));
    for (const [title] of SOBRE_MI_ITEMS) {
      expect(within(menu).getByRole("link", { name: title })).toBeVisible();
    }
    expect(within(menu).getByRole("link", { name: "Log in" })).toBeVisible();
  });

  it("mirrors the Sobre mí group in the drawer; tapping an item closes it (AC 3)", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const toggle = screen.getByRole("button", { name: "Abrir menú" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    // On "/" every group starts closed (mobile-navigation S2): open Sobre mí.
    const menu = await screen.findByRole("navigation", { name: "Menú" });
    await user.click(within(menu).getByRole("button", { name: "Sobre mí" }));
    expect(await screen.findByText("Vamos a New York")).toBeInTheDocument();
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

describe("Navbar item destinations (RV-0010)", () => {
  const titles = NAV.flatMap((g) =>
    g.columns.flatMap((c) => c.items.map((i) => i.title)),
  );
  /** hrefs of the rendered links that come from NAV items. */
  const itemHrefs = (): string[] =>
    screen
      .getAllByRole("link")
      .filter((a) => titles.some((t) => a.textContent?.startsWith(t)))
      .map((a) => a.getAttribute("href") ?? "");

  it("points every mega-menu item at a path, never a bare fragment", async () => {
    render(<Navbar />);
    for (const label of Object.keys(EXPECTED)) {
      await openPanel(label);
      for (const href of itemHrefs()) expect(href).toMatch(/^\//);
    }
    await openPanel("Services");
    expect(
      screen.getByRole("link", { name: /Custom itinerary with\sBelén/ }),
    ).toHaveAttribute("href", "/#services");
  });

  it("points every drawer item at a path, never a bare fragment", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    const menu = await screen.findByRole("navigation", { name: "Menú" });
    // Single-open accordion: open each group in turn and read its links.
    const hrefs: string[] = [];
    for (const group of NAV) {
      await user.click(within(menu).getByRole("button", { name: group.label }));
      hrefs.push(...itemHrefs());
    }
    expect(hrefs.length).toBeGreaterThan(30);
    for (const href of hrefs) expect(href).toMatch(/^\//);
  });
});

describe("Navbar disclosure keyboard path (AC 10)", () => {
  it("renders each open panel right after its trigger and points aria-controls at it", async () => {
    render(<Navbar />);
    for (const label of Object.keys(EXPECTED)) {
      await openPanel(label);
      const trigger = screen.getByRole("button", { name: label });
      const controls = trigger.getAttribute("aria-controls");
      expect(controls).toBeTruthy();
      const panel = document.getElementById(controls ?? "");
      expect(panel).not.toBeNull();
      expect(trigger.nextElementSibling).toBe(panel);
    }
  });

  it("moves Tab from an open trigger to the panel's first item", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    await openPanel("Sobre mí");
    await user.tab();
    expect(document.activeElement).toHaveAttribute("href", "/sobre-mi");
  });

  it("closes the dropdown on Escape and returns focus to its trigger", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    await openPanel("Sobre mí");
    await user.tab();
    await user.tab();
    expect(document.activeElement).toHaveAttribute("href", "/colaboraciones");
    await user.keyboard("{Escape}");
    const trigger = screen.getByRole("button", { name: "Sobre mí" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Vamos a New York")).toBeNull();
    expect(trigger).toHaveFocus();
  });
});

describe("Navbar focus leaving a dropdown (RV-0005)", () => {
  it("stays open while Tab walks its items", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    await openPanel("Sobre mí");
    for (let i = 0; i < 5; i += 1) await user.tab();
    expect(document.activeElement).toHaveAttribute(
      "href",
      "/preguntas-frecuentes",
    );
    expect(screen.getByRole("button", { name: "Sobre mí" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("closes when Tab moves focus past its last item", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    await openPanel("Sobre mí");
    for (let i = 0; i < 6; i += 1) await user.tab();
    const trigger = screen.getByRole("button", { name: "Sobre mí" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when Shift+Tab moves focus back before its trigger", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    await openPanel("Sobre mí");
    await user.tab({ shift: true });
    const trigger = screen.getByRole("button", { name: "Sobre mí" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Navbar pointer open (QA-0002)", () => {
  it("keeps a panel open when the pointer clicks the trigger that hovering just opened", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const trigger = screen.getByRole("button", { name: "Sobre mí" });
    await user.hover(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("closes it on the next pointer click", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const trigger = screen.getByRole("button", { name: "Sobre mí" });
    await user.click(trigger);
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps Enter a toggle on a hovered trigger", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const trigger = screen.getByRole("button", { name: "Sobre mí" });
    await user.hover(trigger);
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Navbar current page (AC 5, AC 9)", () => {
  afterEach(() => {
    vi.mocked(usePathname).mockReturnValue("/");
  });

  it("marks only the current route's item with aria-current in the mega-menu", async () => {
    vi.mocked(usePathname).mockReturnValue("/colaboraciones");
    const { container } = render(<Navbar />);
    await openPanel("Sobre mí");
    const current = panelIn(container).querySelectorAll(
      '[aria-current="page"]',
    );
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAttribute("href", "/colaboraciones");
  });

  it("marks it in the drawer too, with a decorative dot", async () => {
    vi.mocked(usePathname).mockReturnValue("/colaboraciones");
    const user = userEvent.setup();
    const { container } = render(<Navbar />);
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    await screen.findByRole("navigation", { name: "Menú" });
    const current = container.querySelectorAll('[aria-current="page"]');
    expect(current).toHaveLength(1);
    const link = screen.getByRole("link", { name: "Colaboraciones" });
    expect(link).toHaveAttribute("aria-current", "page");
    const dot = link.querySelector("[data-current-dot]");
    expect(dot).toHaveAttribute("aria-hidden", "true");
    expect(dot).toHaveClass("bg-brand", "size-1.5", "rounded-full");
    expect(container.querySelectorAll("[data-current-dot]")).toHaveLength(1);
  });

  it("marks nothing on the landing", async () => {
    const user = userEvent.setup();
    const { container } = render(<Navbar />);
    await openPanel("Sobre mí");
    expect(container.querySelector('[aria-current="page"]')).toBeNull();
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    await screen.findByRole("navigation", { name: "Menú" });
    expect(container.querySelector('[aria-current="page"]')).toBeNull();
    expect(container.querySelector("[data-current-dot]")).toBeNull();
  });
});

describe("Navbar burger (mobile-navigation AC 4, 5)", () => {
  it("is named Abrir menú, collapsed and controls nothing while closed", () => {
    render(<Navbar />);
    const burger = screen.getByRole("button", { name: "Abrir menú" });
    expect(burger).toHaveAttribute("aria-expanded", "false");
    expect(burger).not.toHaveAttribute("aria-controls");
  });

  it("becomes Cerrar menú and controls the Menú landmark once tapped", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    const menu = await screen.findByRole("navigation", { name: "Menú" });
    const burger = screen.getByRole("button", { name: "Cerrar menú" });
    expect(burger).toHaveAttribute("aria-expanded", "true");
    expect(menu.id).not.toBe("");
    expect(burger).toHaveAttribute("aria-controls", menu.id);
  });

  it("returns to Abrir menú and drops the drawer when tapped again", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    await screen.findByRole("navigation", { name: "Menú" });
    await user.click(screen.getByRole("button", { name: "Cerrar menú" }));
    const burger = screen.getByRole("button", { name: "Abrir menú" });
    expect(burger).toHaveAttribute("aria-expanded", "false");
    expect(burger).not.toHaveAttribute("aria-controls");
    expect(screen.queryByRole("navigation", { name: "Menú" })).toBeNull();
  });

  it("imports no GSAP: motion lives in the lazy drawer chunk (plan § 7.1)", () => {
    const source = readFileSync(
      path.resolve(__dirname, "../navbar.tsx"),
      "utf8",
    );
    expect(source).not.toMatch(/from\s+["'](gsap|@gsap\/|@\/lib\/gsap)/);
  });
});

describe("Navbar drawer chunk failure (plan § 9)", () => {
  const LOADER = "@/components/layout/drawer/load-drawer";

  afterEach(() => {
    vi.doUnmock(LOADER);
    vi.resetModules();
  });

  it("closes the burger when the chunk fails to load, and retries on the next tap", async () => {
    vi.resetModules();
    const actual =
      await vi.importActual<typeof import("../drawer/load-drawer")>(LOADER);
    const loadDrawer = vi
      .fn(actual.loadDrawer)
      .mockRejectedValueOnce(new Error("ChunkLoadError"));
    vi.doMock(LOADER, () => ({
      loadDrawer,
      prefetchDrawer: () => undefined,
    }));
    const { Navbar: FreshNavbar } = await import("@/components/layout/navbar");
    const user = userEvent.setup();
    render(<FreshNavbar />);

    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Abrir menú" }),
      ).toHaveAttribute("aria-expanded", "false"),
    );
    const burger = screen.getByRole("button", { name: "Abrir menú" });
    expect(burger).not.toHaveAttribute("aria-controls");
    // Nothing else unmounted: no error boundary replaced the page.
    expect(
      screen.getByRole("link", { name: "Vamos a NY — home" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Itineraries" }),
    ).toBeInTheDocument();

    await user.click(burger);
    expect(
      await screen.findByRole("navigation", { name: "Menú" }),
    ).toBeInTheDocument();
    expect(loadDrawer).toHaveBeenCalledTimes(2);
  });
});
