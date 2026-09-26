import type { ReactNode } from "react";

/** Outbound links are https only (S§ Input & Output Handling: URLs). */
export type HttpsUrl = `https://${string}`;

/** Slots 01–03 of the shared page structure (spec § Shared Page Structure). */
export type PageHeaderContent = {
  /** 1–3 short label items, separated by spacing (no "·" glyphs). */
  label: readonly ReactNode[];
  /** The H1 text; also the accessible name while the visual copy animates. */
  title: string;
  dek: ReactNode;
};

/** An internal route, an in-page anchor on another route, or a mailto: link. */
export type ClosingAction = { label: string; href: string };

/** Slot 05: one headline, one primary and an optional secondary action. */
export type ClosingContent = {
  headline: ReactNode;
  primary: ClosingAction;
  secondary?: ClosingAction;
};

/** Main-column prose blocks (spec § Page 1 styling notes). */
export type ProseBlock =
  /** A paragraph, 17px / 1.7. */
  | { kind: "p"; text: string }
  /** A display pull line with its own train marker. */
  | { kind: "pull"; text: string; lang?: string }
  /** A sentence set in the `headline` style. */
  | { kind: "headline"; text: string }
  /** A 3:2 photo with a mono caption under a hairline. */
  | { kind: "photo"; src: string; alt: string; caption: string }
  /** Belén's signature, written on at the end of the story. */
  | { kind: "signature"; text: string };

/** One row of the "En el camino" timetable. */
export type TimelineRow = {
  time: string;
  title: string;
  line: string;
  tag?: string;
};
