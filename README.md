# Vamos a NY — landing page

Marketing landing page for a fictional New York trip-planning studio that sells
day-by-day itineraries and runs a blog. Single page only; every link is an
in-page anchor or a `#` placeholder.

- **Stack:** Next.js 15 (App Router) · React 19 · Tailwind CSS v4 · TypeScript · GSAP
- **Design system:** `vamosany-design-system.md` — near-black ink on white,
  taxi-yellow accent, Courier Prime display type, squared-off geometry.
  Tokens live in `app/globals.css` under `@theme`.
- **Photography:** real New York photographs from Wikimedia Commons, resized and
  converted to WebP in `public/img`. Attribution is rendered in the footer;
  machine-readable credits are in `public/img/CREDITS.json`.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Sections

| Component | What it is |
|---|---|
| `navbar` | Sticky header, five mega menus (~48 pages, Services shown as priced tiers), Log in / Sign up / Buy an itinerary, mobile drawer |
| `hero` | SplitText line-reveal headline with the marker highlight, tagline, CTA |
| `neighborhood-ticker` | Scroll-reactive marquee of neighbourhoods |
| `dashboard-preview` | Static mock of the traveller dashboard (kept in code, not rendered) |
| `services` | Three priced tiers — curated by Belén, custom with Belén, walk with Belén |
| `sample-day` | Day 1–5 tabs showing an hour-by-hour plan |
| `how-it-works` | Three numbered steps plus the research pitch |
| `planning-timeline` | Tabbed three-stage timeline |
| `stats` | Animated counters |
| `reviews` | Traveller review carousel |
| `blog` | Featured post plus three recent posts |
| `included` | What's in the file |
| `cta` | Full-bleed bridge band, buy + newsletter |
| `footer` | Near-black link grid, newsletter, photo credits |

## Scroll motion

`components/scroll-effects.tsx` renders nothing — it wires GSAP ScrollTriggers to
elements marked with data attributes, so every section stays a server component.

| Attribute | Effect |
|---|---|
| `data-hero-copy` | Entrance timeline: badge → masked line reveal (SplitText) → marker sweep → lede → buttons |
| `data-heading-block` | Same treatment per section heading, on scroll: eyebrow → masked lines → sweep → standfirst → actions |
| `data-split-lines` | The heading SplitText splits into masked lines |
| `overscroll` (component) | Stacked sections: full-screen sections pin at their bottom, hold readable until 60% covered, then fade as the next slides over; taller ones fake-scroll first; short sections scroll normally |
| `data-reveal` | Fade + 18px rise on enter, once |
| `data-reveal-group` | Same, staggered across children |
| `data-sweep` | The yellow marker highlight draws in left to right |
| `data-pan-band` | Ultra-wide bridge photo pans horizontally through the CTA |
| `data-count` | Stats count up |
| `data-marquee` | Ticker speeds up with scroll velocity |
| `data-nav` | Header gains its rule past 80px |

Timing and easing come from the design system's motion section (180/300ms on
`cubic-bezier(.2,.8,.2,1)` via GSAP `CustomEase`).

Reveal targets are hidden by CSS scoped to a `.gsap` class that a blocking inline
script in `app/layout.tsx` adds before first paint — no flash of content, and with
JS off or `prefers-reduced-motion: reduce` the class never appears and the page
renders fully static.

## Previous design system

`DESIGN.md` holds the Linear system this page was styled with before. Token and
utility names are generic (`canvas`, `surface-1`, `ink-subtle`, `brand`,
`display-lg`, `container-ds`), so swapping systems is mostly a `globals.css`
rewrite plus the fonts in `app/layout.tsx`.
