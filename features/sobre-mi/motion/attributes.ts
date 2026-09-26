/**
 * Attribute contract between the Sobre mí pages (Server Components, which
 * only write attributes) and their motion controller (client, which only
 * reads them): ADR-0003 condition 3. Markup spreads `{...sm("heading")}`
 * instead of writing literals, and the controller selects with `smSel()`,
 * so a typo is a type error. Initial states live in app/globals.css under
 * `.gsap [data-sm-scene] …` (ADR-0002).
 */
export const SM_ATTR = {
  /** Page root; set together with the motion controller mount (T032). */
  scene: "data-sm-scene",
  heading: "data-sm-heading",
  label: "data-sm-label",
  split: "data-sm-split",
  train: "data-sm-train",
  dek: "data-sm-dek",
  count: "data-sm-count",
  notes: "data-sm-notes",
  reveal: "data-sm-reveal",
  closing: "data-sm-closing",
  closingItem: "data-sm-closing-item",
  form: "data-sm-form",
  field: "data-sm-field",
  /** Not-configured banner wrapper (M8 entrance, plan § 0.1 F8). */
  banner: "data-sm-banner",
  sweep: "data-sm-sweep",
  parallax: "data-sm-parallax",
  signature: "data-sm-signature",
  rail: "data-sm-rail",
  timeline: "data-sm-timeline",
  year: "data-sm-year",
  partner: "data-sm-partner",
  rowBody: "data-sm-row-body",
  audience: "data-sm-audience",
  rule: "data-sm-rule",
  channels: "data-sm-channels",
  faqGroup: "data-sm-faq-group",
  faqAnswer: "data-sm-faq-answer",
  anchor: "data-sm-anchor",
} as const;

export type SmAttr = keyof typeof SM_ATTR;

/** Spreadable attribute: `<p {...sm("dek")}>`, or with a value: `sm("scene", "faq")`. */
export function sm(key: SmAttr, value = ""): Record<string, string> {
  return { [SM_ATTR[key]]: value };
}

/** CSS selector for a contract attribute. */
export function smSel(key: SmAttr): string {
  return `[${SM_ATTR[key]}]`;
}
