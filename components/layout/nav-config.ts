/**
 * Navbar information architecture: the single source for the desktop
 * mega-menu and the mobile drawer (one concern per file, split out of
 * navbar.tsx in T007).
 */
export type NavItem = {
  title: string;
  blurb: string;
  tag?: string;
  price?: string;
  href?: string;
};

export type NavColumn = { heading: string; items: NavItem[] };

export type NavGroup = { label: string; columns: NavColumn[] };

export const NAV: NavGroup[] = [
  {
    label: "Itineraries",
    columns: [
      {
        heading: "By length",
        items: [
          {
            title: "3 Days — First Timer",
            blurb: "The greatest hits, walkable.",
          },
          {
            title: "5 Days — The Classic",
            blurb: "Icons plus real neighbourhoods.",
            tag: "Best seller",
          },
          { title: "7 Days — Deep Cut", blurb: "Five boroughs, no filler." },
          { title: "Weekend Escape", blurb: "48 hours, zero wasted minutes." },
        ],
      },
      {
        heading: "By season",
        items: [
          {
            title: "Christmas in New York",
            blurb: "Markets, windows, ice rinks.",
            tag: "New",
          },
          {
            title: "Autumn in the Parks",
            blurb: "Peak foliage, October light.",
          },
          { title: "Summer Rooftops", blurb: "Long evenings above the grid." },
          { title: "Winter on a Budget", blurb: "Warm rooms, cheap tickets." },
        ],
      },
      {
        heading: "By appetite",
        items: [
          { title: "Foodie New York", blurb: "Delis, dumplings, slices." },
          { title: "Art & Museums", blurb: "The Met to Bushwick walls." },
          { title: "Family New York", blurb: "Tested with small legs." },
          { title: "Film Locations", blurb: "Stand where the scene happened." },
        ],
      },
    ],
  },
  {
    label: "Guides",
    columns: [
      {
        heading: "Getting around",
        items: [
          {
            title: "The Subway, Explained",
            blurb: "Read the map like a local.",
          },
          { title: "From the Airport", blurb: "JFK, EWR and LGA compared." },
          { title: "Walking the Grid", blurb: "Why the numbers make sense." },
          { title: "Yellow Cab vs App", blurb: "When each one wins." },
        ],
      },
      {
        heading: "Neighbourhoods",
        items: [
          { title: "Lower East Side", blurb: "Tenements and late nights." },
          { title: "Williamsburg", blurb: "Brooklyn's front window." },
          { title: "Harlem", blurb: "Jazz, stoops and Sunday." },
          {
            title: "Chinatown & Little Italy",
            blurb: "Two blocks, two worlds.",
          },
        ],
      },
      {
        heading: "Before you fly",
        items: [
          { title: "ESTA & Entry", blurb: "Paperwork without panic." },
          { title: "Budget Calculator", blurb: "What a day really costs." },
          {
            title: "Packing for the Season",
            blurb: "It is colder than you think.",
          },
          { title: "Broadway Tickets", blurb: "Rush, lottery and TKTS." },
        ],
      },
    ],
  },
  {
    label: "Blog",
    columns: [
      {
        heading: "Latest",
        items: [
          { title: "Neighbourhood Diaries", blurb: "One block at a time." },
          { title: "Seasonal Guides", blurb: "What's on, month by month." },
          { title: "Food Crawls", blurb: "Routes built around eating." },
          { title: "Photo Spots", blurb: "Where the light lands." },
        ],
      },
      {
        heading: "Readers",
        items: [
          { title: "Reader Trips", blurb: "Real itineraries, real notes." },
          { title: "Ask Us Anything", blurb: "Your questions, answered." },
          { title: "Mistakes We Made", blurb: "So you don't repeat them." },
          { title: "Newsletter Archive", blurb: "Every issue, free." },
        ],
      },
    ],
  },
  {
    label: "Services",
    columns: [
      {
        heading: "Ready-made",
        items: [
          {
            title: "Curated by Belén",
            blurb: "Itineraries she walked and wrote. Download and go.",
            price: "from €25",
            href: "#services",
          },
        ],
      },
      {
        heading: "One to one",
        items: [
          {
            title: "Custom itinerary with Belén",
            blurb: "A call, your dates and pace, a plan built just for you.",
            price: "€149",
            tag: "Most popular",
            href: "#services",
          },
        ],
      },
      {
        heading: "In person",
        items: [
          {
            title: "Walk with Belén",
            blurb:
              "Half a day on foot with her, in the neighbourhood you pick.",
            price: "€290",
            href: "#services",
          },
        ],
      },
    ],
  },
  {
    label: "About",
    columns: [
      {
        heading: "The studio",
        items: [
          { title: "Our Story", blurb: "Why we started walking." },
          { title: "How We Research", blurb: "On foot, twice a year." },
          { title: "Press", blurb: "Where we've turned up." },
          { title: "Work With Us", blurb: "Partnerships and briefs." },
        ],
      },
      {
        heading: "Help",
        items: [
          { title: "Contact", blurb: "A human replies." },
          { title: "Refunds", blurb: "Fourteen days, no questions." },
          { title: "FAQ", blurb: "The usual suspects." },
        ],
      },
    ],
  },
];

/** Routes whose navbar capsule renders the reading bar (DDR-0004, M4). */
export const READING_BAR_ROUTES: readonly string[] = ["/colaboraciones"];
