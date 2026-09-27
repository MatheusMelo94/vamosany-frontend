# DDR-0005: Montserrat replaces Arial as the body typeface

- **Status:** Accepted (2026-09-27)
- **Date:** 2026-09-27
- **Deciders:** Matheus Melo (sole approver). The user made this decision in-session on 2026-09-27: "replace Arial with Montserrat everywhere Arial is used". Formally accepted by Matheus Melo on 2026-09-27.
- **Constitution / spec reference:** constitution v1 § Non-Goals 1 (a visual change to what is live needs a DDR); ADR-0006 § 1 (typography is part of the frozen baseline), § 5 (pending DDR "Direção tipográfica Vamos a NY") and § 6 (supersession for the changed scope); `design-conventions.md § Typography`; `docs/design/vamosany-design-system.md` § 3.

## Context
The whole product uses Arial as its sans face: the landing, the five Sobre mí pages and the last-resort error page. It comes from the `--font-sans` token in `app/globals.css` (`Arial, Helvetica, sans-serif`), which feeds `body.font-sans` and the `subhead`, `body-lg`, `body-base`, `body-sm`, `caption` and `body-prose` utilities. `app/global-error.tsx` has its own inline `fontFamily: "Arial, sans-serif"`, because it replaces the root layout and cannot rely on it.

ADR-0006 freezes the landing's design, and that includes typography. ADR-0006 § 6 lets a user decision to redesign part of the landing supersede the freeze for that scope. This DDR is that decision, and its scope is the body typeface.

ADR-0006 § 5 also asks for a DDR titled "Direção tipográfica Vamos a NY", covering the ALL-CAPS display and eyebrows **and** the Arial body. This DDR **partly** covers it: it settles the body face and nothing else. It does not formalize the ALL-CAPS, tracked-out display and eyebrow style, the choice of Courier Prime, or the type scale. Those stay frozen as they are, and that part of the § 5 DDR is still pending.

`design-conventions.md § Typography` asks for families "chosen for this product — not the default sans you would reach for on any project", loaded through `next/font`. Montserrat fixes the second point: it is self-hosted through `next/font`, while Arial was a system font. On the first point it helps only partly. It is a deliberate brand choice, but it is also one of the most widely used Google Fonts. This DDR records it as the user's brand choice. It does not claim the pick is distinctive.

## Decision
**Montserrat becomes the sans (body) typeface everywhere Arial is used today:**

1. **`--font-sans`** in `app/globals.css` puts Montserrat first. Its name, and the utilities that consume it, stay the same. Arial or Helvetica may remain later in the stack only as a system fallback. They are no longer a design face.
2. **`app/global-error.tsx`**: the inline stack names Montserrat first, with Arial as the fallback. Caveat for the Architect: `next/font` hashes the family name. On a page that doesn't get the `next/font` class, the literal `"Montserrat"` only matches a locally installed copy, so most visitors would still see Arial. The Architect decides whether `global-error` applies the same `next/font` instance. That has to square with its rule of "no dependency on anything that might have failed" (fonts, tokens). The other option is to accept the fallback there.
3. **Weights:** 400, 600 and 700, all upright. This is what the code uses on sans text today:
   - **400:** every body utility (`subhead`, `body-*`, `caption`, `body-prose`), plus the `font-normal` "(opcional)" in `field-shell.tsx`.
   - **600 (`font-semibold`):** navbar links and mega-menu items, the menu badges, the active tab state, `SampleDay`/`dashboard-preview` labels, `included`, `how-it-works` and `reviews` links and names, `planning-timeline` "when", Sobre mí `timeline` titles, the FAQ `summary`, and form error lines.
   - **700 (`font-bold`):** the form-error "!" badge (`caption`) and the `global-error` "Try again" button (`fontWeight: 700`, `font: inherit`).
   - No sans italic is used. The only italic is the Courier Prime signature (plan D7).
4. **Loading recommendation (the Architect confirms the mechanism):** the Montserrat **variable** font through `next/font/google` with `subsets: ["latin"]`, `display: "swap"`, exposed as a CSS variable, preloaded (the `next/font` default), with no italic style. Montserrat is variable on the `wght` axis, so one woff2 covers 400–700. `next/font` cannot request a sub-range such as `400..700`: it takes either the full variable axis (weight omitted) or a static list. The static list `["400","600","700"]` means three files, so the variable file is the better trade. The `latin` subset covers Spanish and Portuguese (á é í ó ú ñ ç ã õ ü ¿ ¡). `latin-ext` isn't needed for es/pt/en.
5. **Unchanged:** Courier Prime for display, labels, buttons (`label-button`) and mono, the type scale, line heights, letter-spacing, colours and all motion. Everything in ADR-0006 other than the body face stays frozen.

## User Impact
- **Visitor (gains):** body text gets a warmer geometric voice, closer to the brand's editorial and travel tone than a system default. It also looks the same on every OS, because Arial (and Helvetica on Apple devices) no longer depends on the machine.
- **Visitor (costs):** one more font download on first visit. Before it arrives, text shows in a metric-adjusted fallback and then swaps (see Performance).
- **What they see differently:** Montserrat is a **wider** geometric sans with a **larger x-height** than Arial. At the same size, lines hold fewer characters, so text wraps sooner, blocks grow taller and the fold moves. Every `font-semibold` also becomes a real semibold (600). Today it renders in Arial Bold (Arial has only Regular and Bold, so 600 resolves to 700). Emphasis on nav links, menu items and labels will look **lighter** than it does now.

### Risk points to check on the regenerated baselines (360 / 768 / 1280, plus 320 for the hero)
1. **Hero subtitle and DDR-0001.** The hero subtitle is sans (`body-lg`, `sm:text-xl`, `max-w-2xl`, `text-balance`, with "a tu manera." kept as a `nowrap` unit). DDR-0001's rule applies: **no line in the hero holds a single word at any viewport.** The H1 and CTA are Courier and don't change. A wider face adds lines to the subtitle and pushes the CTA and ring down, on top of the 70–90 px DDR-0001 already added.
2. **Hero entrance timing.** The landing's heading timelines wait for `document.fonts.ready` (`scroll-effects.tsx`). That promise now also waits for Montserrat, so on slow connections the hero entrance can start later. The Architect measures this.
3. **Navbar capsule and mega menu.** Link and item labels are `body-sm font-semibold`, and the badges are `caption … whitespace-nowrap`. Wider labels can widen the capsule, crowd the desktop nav at 768/1280, or wrap mega-menu items. The DDR-0003 marker and the DDR-0004 Colaboraciones reading bar are measured from that geometry. Check them visually. They should follow, not break.
4. **Buttons.** No risk. `label-button` is Courier. The one exception is the `global-error` button, which inherits the body face.
5. **Form fields.** Field labels are Courier (`label-button`). The **"(opcional)"** suffix is a sans `body-sm` `<small>` with `leading-0` inside that Courier label. Montserrat's taller x-height and different ascent/descent will change how it lines up with the Courier caps. Error lines (`body-sm font-semibold` with the `caption` "!" badge) can wrap sooner. Placeholders inside fixed-height inputs can clip.
6. **Footer.** The link columns (`body-sm`), the newsletter input (`h-10 min-w-0 flex-1`, with a placeholder that can clip at 360) and the `caption` legal row can wrap or stack differently.
7. **Truncated labels.** `dashboard-preview` uses `truncate` on `body-sm font-semibold` names, which will cut sooner (more ellipses).
8. **Sobre mí prose (760 px, 17 px / 1.7).** The wider set lowers characters per line at the 760 px measure. That moves it toward the conventions' ≤ 80 ch, a neutral-to-good change. But paragraphs get taller, which shifts the timeline rail, pull lines and every scroll-reveal start (AC 17's "below the fold" test already measures this rather than assuming it). The `ch`-based measures (`52ch` dek, `62ch` FAQ answers and Trabajá conmigo lead) grow in **pixels**, because `ch` follows the font's "0". Characters per line stay about the same, but the boxes get wider.
9. **Not at risk:** display headings, eyebrows, pull lines, closing rows, the channel list values (mono) and the notes column (mono). All are Courier.

## Performance
- **Cost:** a webfont replaces a system font. That adds roughly 20–40 KB of woff2 for the latin variable file (confirm from the build output). It is CSS and font only, so **First Load JS doesn't change**. It is served from `/_next/static/media`, self-hosted, so `font-src 'self'` still holds and no request goes to Google at runtime. The build already needs network access for Courier Prime.
- **Preload:** `next/font` preloads it, so it competes with the Courier Prime preload and the hero ring images for early bandwidth.
- **LCP:** with `display: swap`, text first paints in the fallback, so LCP isn't blocked on the download. The real LCP risk is item 2 above, where the hero timeline waits for `fonts.ready`.
- **CLS:** `next/font` creates a size-adjusted fallback face (Arial with `size-adjust` and ascent/descent overrides) that approximates Montserrat's metrics. The swap then moves little. Size-adjust only matches **average** width, though, so long paragraphs can still re-wrap on swap. Lighthouse CI must confirm CLS stays within budget on `/` and the Sobre mí pages.

## Consequences
- **Positive:** a named body face that belongs to the brand, loaded the way the conventions require (`next/font`, self-hosted, swap, declared subset). Body text renders the same everywhere, including the CI runner and local machines. That removes the "no Arial locally" gap the Sobre mí QA pass recorded, at least for body text (rasterization can still differ between machines).
- **Negative:**
  - **Every screenshot baseline changes** (landing, Sobre mí, interaction states, reduced motion). This DDR is the approval that `npm run test:e2e:update` and the CI bot need. Baselines are regenerated through the **`update-snapshots`** label on the PR, not on local machines. For this change the ADR-0006 "diff = 0" Render-Preserving check is superseded **for the body typeface only**.
  - One more font request, with the fonts.ready and CLS risks above.
  - `font-semibold` gets lighter (600 instead of Arial Bold).
  - The part of ADR-0006 § 5 about ALL-CAPS display and eyebrows is still undocumented.
- **Neutral / follow-ups:**
  - `docs/design/vamosany-design-system.md` names Montserrat and cites this DDR (updated together with this DDR).
  - The Architect or Engineer updates the code-level references to Arial: the comment in `app/layout.tsx` ("Body type is Arial… no second webfont"), the comment in `tests/e2e/sobre-mi/motion.spec.ts` ("CI renders real Arial") and the `body-prose` row in `docs/specs/sobre-mi/plan.md` § 7.
  - Accepted records that mention Arial (ADR-0004, ADR-0006, the audit's X-1) stay as history and are not edited.
  - The token is still called `--font-sans`, not the conventions' `--font-body`. ADR-0004 governs that name, and it doesn't change here.

## Alternatives Considered
- **Keep Arial** → rejected by the user. It is the "default sans" the conventions warn about, and it renders differently across OSes.
- **Montserrat as static weights 400/600/700** → not recommended. It means three files instead of one variable file, with no gain.
- **Map `font-semibold` to 700 so today's weight is preserved** → not chosen. It would add a Montserrat-only override to keep an accident of Arial's two-weight family. The code asks for 600, and a true semibold is what it describes. The user can reverse this on the regenerated baselines if 600 reads too light.
- **Write the full "Direção tipográfica" DDR now (ALL-CAPS, Courier, body)** → out of scope. The user decided the body face only. Formalizing the display and eyebrow style needs its own decision.

## References
- `app/globals.css` — `--font-sans`, `subhead`, `body-lg`, `body-base`, `body-sm`, `caption`, `body-prose`
- `app/global-error.tsx`, `app/layout.tsx`
- `features/landing/components/hero.tsx`, `components/layout/navbar.tsx`, `components/layout/footer.tsx`, `features/sobre-mi/components/forms/field-shell.tsx`, `features/sobre-mi/components/prose.tsx`
- `features/landing/motion/scroll-effects.tsx` (`document.fonts.ready`)
- `.github/workflows/update-snapshots.yml` (the `update-snapshots` label)
- `docs/design/vamosany-design-system.md` § 3, § 17, § 18
- `design-conventions.md` § Typography, § DDR Template
- ADR-0004, ADR-0006 (§ 1, § 5, § 6)
- DDR-0001 (hero: no single-word lines), DDR-0003 (mega-menu marker), DDR-0004 (Sobre mí motion, Colaboraciones reading bar)
