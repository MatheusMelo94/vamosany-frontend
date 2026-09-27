# Vamos a NY — Reverse-Engineered Design System

Source inspiration: https://vamosany.com/

> This document is a practical reverse-engineering of the site's visual language and reusable UI patterns. Values are approximate unless explicitly verified from source code.

---

## 1. Brand Direction

The visual identity combines:

- Taxi-yellow accents
- Near-black typography
- Bold typewriter / slab-serif display typography
- Editorial New York photography
- Oversized highlighted headings
- Playful travel-oriented illustrations
- Spacious layouts
- Minimal UI chrome
- Mostly squared-off interface elements rather than SaaS-style pill components

The overall feeling is:

**New York editorial travel brand + retro print language + modern responsive web layout.**

---

## 2. Color System

### Core Colors

| Token | Value | Usage |
|---|---:|---|
| `brand-yellow` | `#FFD800` | Primary accent, highlighted headings, CTAs |
| `brand-yellow-hover` | `#F1CC00` | Hover/pressed yellow |
| `ink` | `#080A0B` | Primary text, borders, buttons |
| `white` | `#FFFFFF` | Backgrounds, inverse text |
| `gray-50` | `#F7F7F5` | Soft section backgrounds |
| `gray-100` | `#EEEEEA` | Dividers, subtle backgrounds |
| `gray-400` | `#A8A8A4` | Muted text |
| `gray-700` | `#484846` | Secondary text |

### CSS Tokens

```css
:root {
  --color-brand: #FFD800;
  --color-brand-hover: #F1CC00;

  --color-ink: #080A0B;
  --color-white: #FFFFFF;

  --color-gray-50: #F7F7F5;
  --color-gray-100: #EEEEEA;
  --color-gray-400: #A8A8A4;
  --color-gray-700: #484846;
}
```

---

## 3. Typography

### Visual Character

The design uses a bold, retro, mechanical display style that feels inspired by:

- Typewriters
- Editorial headlines
- Subway signage
- Old travel guides
- Newspaper typography

### Recommended Font Stack

```css
--font-display: "Courier Prime", "Roboto Slab", Rockwell, serif;
--font-body: Montserrat, Arial, Helvetica, sans-serif;
```

Body type is **Montserrat** (DDR-0005, accepted 2026-09-27), replacing Arial. It is self-hosted via `next/font` (variable font, `latin` subset, `display: swap`), and the weights in use are 400, 600 and 700, all upright. Arial and Helvetica remain only as system fallbacks. Courier Prime is unchanged for display, labels and buttons.

### Type Scale

```css
:root {
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;

  --text-h3: clamp(1.5rem, 2vw, 2rem);
  --text-h2: clamp(2rem, 4vw, 3.5rem);
  --text-h1: clamp(3rem, 7vw, 6rem);
}
```

### Heading Rules

```css
.heading-display {
  font-family: var(--font-display);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 0.95;
}
```

### Body Rules

```css
.body-copy {
  font-family: var(--font-body);
  font-weight: 400;
  line-height: 1.6;
}
```

---

## 4. Spacing System

Use an 8px-oriented scale.

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;
  --space-10: 128px;
}
```

### Recommended Section Rhythm

Desktop:

```css
section {
  padding-block: 80px;
}
```

Large editorial sections:

```css
section.hero,
section.feature {
  padding-block: 96px;
}
```

Mobile:

```css
section {
  padding-block: 48px;
}
```

---

## 5. Layout System

### Containers

```css
:root {
  --container-xl: 1200px;
  --container-copy: 760px;

  --gutter-desktop: 32px;
  --gutter-mobile: 20px;
}
```

### Standard Container

```css
.container {
  width: min(
    calc(100% - (var(--gutter-desktop) * 2)),
    var(--container-xl)
  );
  margin-inline: auto;
}
```

### Editorial Reading Width

```css
.copy-container {
  width: min(
    calc(100% - 40px),
    var(--container-copy)
  );
  margin-inline: auto;
}
```

---

## 6. Signature Highlighted Heading

This is the most recognizable visual pattern.

### Structure

```html
<h2 class="highlight-heading">
  VAMOS A NEW YORK
</h2>
```

### CSS

```css
.highlight-heading {
  position: relative;
  display: inline-block;
  z-index: 0;

  font-family: var(--font-display);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.highlight-heading::after {
  content: "";
  position: absolute;

  left: -4%;
  right: -4%;
  bottom: 4%;

  height: 42%;

  background: var(--color-brand);
  z-index: -1;
}
```

### Usage

Best used for:

- Section titles
- Testimonials headings
- Services headings
- Contact sections
- High-emphasis labels

Do not use it for every heading.

---

## 7. Buttons

The visual language should remain graphic and relatively square.

Avoid:

- Fully rounded pills
- Soft SaaS gradients
- Excessive shadow
- Glassmorphism

### Primary Button

```css
.button-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  min-height: 48px;
  padding: 12px 22px;

  background: var(--color-brand);
  color: var(--color-ink);

  border: 2px solid var(--color-ink);
  border-radius: 4px;

  font-weight: 700;
  text-transform: uppercase;

  transition: 160ms ease;
}

.button-primary:hover {
  background: var(--color-brand-hover);
  transform: translateY(-1px);
}
```

### Secondary Button

```css
.button-secondary {
  min-height: 48px;
  padding: 12px 22px;

  background: transparent;
  color: var(--color-ink);

  border: 2px solid var(--color-ink);
  border-radius: 4px;

  font-weight: 700;
  text-transform: uppercase;
}
```

---

## 8. Border Radius

Keep radius restrained.

```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-round: 999px;
}
```

Recommended use:

- Buttons: `4px`
- Cards: `8px`
- Large image cards: `8–16px`
- Sticker/illustration elements: circular when appropriate

---

## 9. Shadows

The site is not heavily shadow-driven.

```css
:root {
  --shadow-soft: 0 8px 30px rgba(0, 0, 0, 0.08);
  --shadow-card: 0 4px 16px rgba(0, 0, 0, 0.08);
}
```

Use shadows sparingly.

Primary depth should come from:

- Photography
- Typography scale
- Contrast
- Illustration
- Layout

---

## 10. Image Direction

### Photography

Photography should feel:

- Documentary
- Real
- Travel-oriented
- Environment-first
- Naturally lit
- Editorial rather than commercial stock photography

### Preferred Subjects

- New York streets
- Parks
- Bridges
- Neighborhoods
- Public transport
- People inside the city environment
- City details

### Cropping

Preferred ratios:

```text
Hero:       16:9 or wider
Cards:      4:3
Editorial:  3:2
Portrait:   4:5
```

Use broad imagery whenever possible.

---

## 11. Illustration Direction

Illustrations work as a secondary layer.

Characteristics:

- Sticker-like
- Playful
- Slightly dimensional / 3D
- Glossy at times
- Travel / tech utility based
- Used as accents, not primary content

Good use cases:

- SIM cards
- Phones
- Contact modules
- Travel accessories
- Icons for services

---

## 12. Cards

Cards should remain simple.

### Base Card

```css
.card {
  background: var(--color-white);

  border: 1px solid var(--color-gray-100);
  border-radius: var(--radius-md);

  overflow: hidden;
}
```

### Recommended Card Structure

```text
Image
↓
Category / eyebrow
↓
Title
↓
Short description
↓
CTA
```

Avoid heavily boxed dashboards or excessive segmentation.

---

## 13. Navigation

Recommended desktop structure:

```text
Logo

Sobre mí
Tu viaje
  ├─ Services
  ├─ Planning
  ├─ Resources
  └─ Travel utilities

Reviews
Blog
Contacto

Cart / action
```

### Navigation Styling

```css
.nav-link {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-ink);
  text-decoration: none;
}

.nav-link:hover {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}
```

---

## 14. Component Inventory

A reusable component library inspired by the site should include:

### Navigation

- Header
- Desktop navigation
- Dropdown menu
- Mobile menu
- Cart indicator

### Hero

- Hero image
- Intro copy
- Hero CTA
- Hero carousel

### Editorial

- Highlighted heading
- Intro text block
- Article section
- Pull quote
- Image gallery

### Services

- Service card
- Resource card
- Feature row
- CTA block

### Social Proof

- Testimonial card
- Review section
- Rating summary

### Conversion

- Newsletter form
- Contact block
- Primary CTA
- Secondary CTA

### Content

- Blog card
- Article preview
- Category label
- Metadata row

### Footer

- Footer navigation
- Social links
- Legal links
- Newsletter teaser

---

## 15. Responsive Rules

### Desktop

```text
1200px max content width
32px side gutters
64–96px section spacing
Large editorial typography
Broad image layouts
```

### Tablet

```text
24px gutters
48–72px vertical spacing
2-column cards where possible
Reduced hero scale
```

### Mobile

```text
20px gutters
40–56px vertical spacing
Single-column layouts
Buttons may become full-width
Headings should use clamp()
Navigation collapses
```

---

## 16. Motion

Motion should feel subtle.

### Recommended Timing

```css
:root {
  --duration-fast: 120ms;
  --duration-base: 180ms;
  --duration-slow: 300ms;

  --ease-default: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

### Good Motion

- Small image zoom on hover
- Button lift
- Underline animation
- Carousel transitions
- Subtle fade/translate reveal

Avoid:

- Heavy parallax
- Excessive spring motion
- Complex dashboard animation

---

## 17. Tailwind Theme Example

```js
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#FFD800",
          hover: "#F1CC00",
        },

        ink: "#080A0B",

        neutral: {
          50: "#F7F7F5",
          100: "#EEEEEA",
          400: "#A8A8A4",
          700: "#484846",
        },
      },

      fontFamily: {
        display: ["Courier Prime", "Roboto Slab", "serif"],
        body: ["Montserrat", "Arial", "Helvetica", "sans-serif"], // DDR-0005
      },

      maxWidth: {
        container: "1200px",
        copy: "760px",
      },

      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "16px",
      },

      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,.08)",
        card: "0 4px 16px rgba(0,0,0,.08)",
      },
    },
  },
};
```

---

## 18. Base CSS Token File

```css
:root {
  /* Colors */
  --color-brand: #FFD800;
  --color-brand-hover: #F1CC00;

  --color-ink: #080A0B;
  --color-white: #FFFFFF;

  --color-gray-50: #F7F7F5;
  --color-gray-100: #EEEEEA;
  --color-gray-400: #A8A8A4;
  --color-gray-700: #484846;

  /* Fonts */
  --font-display: "Courier Prime", "Roboto Slab", Rockwell, serif;
  --font-body: Montserrat, Arial, Helvetica, sans-serif; /* DDR-0005 */

  /* Layout */
  --container-xl: 1200px;
  --container-copy: 760px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-round: 999px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;
  --space-10: 128px;

  /* Shadows */
  --shadow-soft: 0 8px 30px rgba(0, 0, 0, 0.08);
  --shadow-card: 0 4px 16px rgba(0, 0, 0, 0.08);

  /* Motion */
  --duration-fast: 120ms;
  --duration-base: 180ms;
  --duration-slow: 300ms;

  --ease-default: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

---

## 19. Design Principles

### 1. Photography carries the experience

Use real-world imagery as the emotional anchor.

### 2. Yellow is a punctuation mark

Do not flood the interface with yellow.

Use it selectively for:

- Highlights
- Buttons
- Labels
- Visual emphasis

### 3. Typography should feel editorial

Avoid generic startup typography everywhere.

The display font should contribute personality.

### 4. Keep UI simple

The experience should feel like a travel magazine, not a dashboard.

### 5. Use contrast instead of decoration

Prefer:

- Scale
- White space
- Black
- Yellow
- Strong imagery

over:

- Gradients
- Blur
- Glass
- Excessive shadows

### 6. Keep geometry slightly raw

Perfectly polished SaaS components would weaken the visual character.

Small irregularities and strong graphic blocks fit the brand better.

---

## 20. Quick Visual Formula

When recreating this aesthetic, use:

```text
Near-black
+
Taxi yellow
+
Bold mechanical display type
+
Large NYC photography
+
Highlighted headings
+
Simple layout
+
Quirky travel illustrations
+
Minimal UI decoration
```

That combination is more important than reproducing any one exact component.

---

## 21. Suggested Foundation for a New Product

If adapting the system instead of cloning it directly:

```text
60% editorial photography
20% typography
10% yellow accent
5% illustration
5% interface decoration
```

This keeps the design expressive without becoming visually noisy.

---

## 22. Reference

Original website:

https://vamosany.com/

This design system is an independent visual analysis intended for inspiration, implementation planning, and UI consistency.
