import type { GuideSlug } from "@/features/guias/content/slugs";
import type { HttpsUrl } from "@/features/sobre-mi/types";

export type GuideGroupId =
  "moverte-por-la-ciudad" | "barrios" | "antes-de-viajar";

export type GuideGroup = {
  id: GuideGroupId;
  title: string;
  /** Id of the group's stripe on the home (`/guias#<anchor>`). */
  anchor: string;
  /** "01" … "03", the stripe's eyebrow. */
  eyebrow: string;
};

/** A run of text inside a paragraph or list item (spec § Content Model). */
export type Inline =
  | string
  | { b: string }
  | { i: string }
  /** Link to another guide; the label is that guide's menu title. */
  | { guide: GuideSlug }
  /** External link (https only, by type and by test). */
  | { href: HttpsUrl; text: string };

export type Block =
  | { type: "p"; text: Inline[] }
  | { type: "h3"; text: string }
  | { type: "ul"; items: Inline[][] }
  /** Visa steps only: a real sequence, native numbers. */
  | { type: "ol"; items: Inline[][] }
  /** "Mi pique" callout. */
  | { type: "tip"; text: Inline[] }
  /** Small print. */
  | { type: "fine"; text: Inline[] };

export type KeyFact = {
  value: string;
  label: string;
  /** The exact string that must occur in the guide's text. */
  source: string;
};

export type GuideSection = {
  /** Explicit, unique within the guide (spec § Content Model rule 2). */
  id: string;
  title: string;
  /** Index label when it differs from the title (rule 3). */
  tocLabel?: string;
  blocks: Block[];
};

export type GuideCta =
  /** 11 guides: the Doc's bold question and the button label. */
  | { lead: string; label: string }
  /** Visa: the "Te ayudo con tu visa" section is the band. */
  | { id: string; heading: string; body: string; label: string };

/** The lean part of a guide: imported by the navbar, so it stays small. */
export type GuideMeta = {
  slug: GuideSlug;
  group: GuideGroupId;
  /** Cards, menu, "Más de", pager. */
  menuTitle: string;
  /** H1 and `<title>`; differs from `menuTitle` only for Visa. */
  title: string;
  /** Dek = card blurb = menu blurb = meta description. */
  bajada: string;
};

export type GuideBody = {
  intro: Block[];
  keyFacts?: KeyFact[];
  /** Accessible name of the key-facts box; defaults to "Datos clave". */
  keyFactsLabel?: string;
  sections: GuideSection[];
  cta: GuideCta;
  afterCta?: Block[];
};

export type PhotoKind = "wikimedia" | "brand";

export type Photo = {
  /** File under `public/img`, e.g. "how-subway.webp". */
  file: string;
  /** Spanish subject, as the footer's credit list shows it. */
  subject: string;
  author: string;
  license: string;
  kind: PhotoKind;
};

export type GuidePhoto = {
  photo: string;
  alt: string;
  /** CSS `object-position`, e.g. "50% 45%". */
  focal: string;
};

export type Guide = GuideMeta & GuideBody & { photo: GuidePhoto };
