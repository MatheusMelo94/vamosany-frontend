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
