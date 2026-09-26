# Tech Design: Sobre mí (5 pages, navbar menu, forms, motion)

- **Status:** Draft (2026-09-26). Accepted together with `docs/specs/sobre-mi/plan.md`.
- **Spec:** `docs/specs/sobre-mi/spec.md` v1 (Ready for /plan). **DDRs:** 0002, 0003, 0004 (Accepted). **ADRs:** 0002 (`.gsap` gate), 0003 (headless controller), 0006 (frozen landing), 0007 (FAQ height, *Proposed*).
- **Why this doc exists** (`frontend-architecture-conventions.md § Tech Design Doc`): more than one ScrollTrigger per page (Sobre mí alone has 3 scrubbed or once scenes plus reveals); 3+ modules touched (`features/sobre-mi`, `components/layout`, `lib/api`, `lib/motion`); a new integration boundary (Server Action → external delivery endpoint).

## 1. Goal

Ship the five "Cuaderno de campo" pages as static Server Components, with one shared template, a headless motion controller (the landing's pattern, ADR-0003) for page choreography, two Pre-Contract forms, and the navbar changes. Nothing the landing renders changes, except what DDR-0002 and DDR-0003 allow.

## 2. Component tree

`[S]` = Server Component, `[C]` = `'use client'`, `[C·dyn]` = client, loaded with `next/dynamic({ ssr: false })` (zero First Load JS).

```
app/(marketing)/(cuaderno)/layout.tsx                        [S] Navbar, <main lang="es" id="contenido">, Footer
├─ components/layout/navbar.tsx                              [C] (existing leaf; gains usePathname, aria-current, reading-bar slot)
│  └─ components/layout/nav-marker.tsx                       [C·dyn] moving highlight + dot, only inside an open desktop panel
├─ app/(marketing)/(cuaderno)/<slug>/page.tsx                [S] metadata + <XxxPage/> (glue only)
│  └─ features/sobre-mi/components/<page>-page.tsx           [S] fills the template slots from content/<page>.tsx
│     ├─ CuadernoMotion                                      [C] tiny wrapper → [C·dyn] CuadernoScrollEffects (headless, returns null)
│     ├─ PageHeader (label · H1 + train · dek)               [S]
│     ├─ NotesLayout (notes column + main column)            [S] @container, stacks below the gutter breakpoint
│     │  ├─ Prose, PullLine, PhotoFigure (next/image), Signature, Timeline          [S] (Sobre mí)
│     │  ├─ ProductLedger                                    [S] (Colaboraciones)
│     │  ├─ AudienceRows                                     [S] (Trabajá conmigo)
│     │  ├─ ChannelList                                      [S] (Contacto)
│     │  ├─ FaqGroup → FaqItem (<details>/<summary>)         [S] (FAQ), plus FaqDeepLink [C] (hash → open + scroll)
│     │  └─ ContactForm / CollaborationForm                  [C] useActionState + client zod + form feedback motion (useGSAP scoped)
│     └─ ClosingRow                                          [S] (Sobre mí, Colaboraciones, FAQ)
└─ components/layout/footer.tsx                              [S] unchanged (frozen; it already credits the subway photo)
```

What crosses the server/client boundary:
- Navbar: nothing new (it computes `pathname` itself).
- Forms: `action` (the Server Action), serializable `copy` / `options` from the content module. Nothing else.
- FaqDeepLink: nothing. It reads `location.hash`.
- Motion controller: nothing. It reads DOM attributes (the ADR-0003 contract).

## 3. Data flow

> **v1.1 (2026-09-26): the forms are UI-only.** There is no Server Action and no request. Client zod validation leads to Field error or the Not-configured banner; with no JS, the `noscript:` block; before hydration, the button is `type="button"` and the inputs have no `name`. M8 runs in the lazy controller through `CustomEvent`s. See plan § 0.1. The delivery flow below is **Deferred (backend)**.

- **Reads:** none at runtime. The content is typed TS/TSX modules in `features/sobre-mi/content/`, compiled into static HTML. All five routes are prerendered (`○` in the build output).
- **Writes:** two Server Actions (`features/sobre-mi/actions.ts`) → `lib/api/forms.ts` (`server-only`) → `POST {FORMS_API_BASE_URL}/v1/...`. See `contract-request.md`.

```
<form action={formAction}>  (useActionState, progressive: works without JS)
  └─ client: zod safeParse on submit → invalid? preventDefault, show errors, focus first, shake
  └─ Server Action sendContactMessage(prev, formData)
        1. contactSchema.safeParse(formData)                 → invalid: { status: "field-errors", errors, values }
        2. deliver("/v1/contact-messages", data)             (lib/api/forms.ts)
             env.server.FORMS_API_BASE_URL unset             → { ok: false, reason: "not-configured" }   (no fetch)
             fetch(..., { signal: AbortSignal.timeout(T) })
               2xx                                           → { ok: true }
               422 + known fieldErrors                       → { ok: false, reason: "invalid", fieldErrors }
               anything else / timeout / network / bad body  → { ok: false, reason: "unavailable" }  (logged once, no payload)
        3. map → FormState: success{email} | field-errors{errors,values} | failed{reason,values}
  (no revalidatePath: nothing on the site reads these writes)
```

`values` are echoed back so React 19's post-action form reset puts the typed text back via `defaultValue` (spec: "Nothing already typed is lost"). They are rendered as text only.

## 4. Motion design

### 4.1 Mechanism

| Concern | Mechanism | Why |
|---|---|---|
| Page choreography (M1–M7 except the FAQ toggle state) | **Headless controller** `CuadernoScrollEffects`, mounted once per page by the template via `next/dynamic({ ssr:false })`; scenes in `features/sobre-mi/motion/scenes/*.ts` as pure `(root, eases) => void` functions called inside one `useGSAP` | ADR-0003 (static content pages stay RSC); splits by scene as ADR-0003 recommends; one page = one mount, so client navigation between pages remounts it (no stale triggers) |
| Initial state | `.gsap [data-sm-…]` rules in `globals.css` (new selectors only) | ADR-0002: no flash, no-JS and reduced motion stay visible |
| Reduced motion / no JS | `motionEnabled()` gate (moved to `lib/gsap.ts`), early return → everything stays in its final CSS state | ADR-0002 single decision point |
| Form feedback (M8) | Inside the form leaf, `useGSAP({ scope: formRef })` + `contextSafe` handlers | stateful client leaf (ADR-0003 criterion) |
| Navbar marker (M9) | `NavMarker` [C·dyn] with `useGSAP({ scope: panelRef })`; highlight = a panel-sized `surface-1` layer whose `clip-path: inset(… round 12px)` is tweened; dot = `x/y/scaleX/scaleY` | Spec global rule and `§ Animation`: no `width`/`height` tweens (the mockup's `moveMarker()` tweens width/height; same pixels, compositor-friendlier) |
| FAQ open/close | Controller intercepts `summary` click (only under `.gsap`), tweens `height` (ADR-0007), toggles `details.open` | native `<details>` is the fallback |
| Eases | `lib/gsap-ease.ts` (`CustomEase` + `getEases()` split out of `lib/gsap-text.ts`) so the navbar marker gets `arrive` without SplitText | First Load JS |

### 4.2 Timelines and triggers (values → `lib/motion.ts`; new keys in plan § Motion)

| # | Scene | Targets (attribute) | Trigger | Values |
|---|---|---|---|---|
| M1 | Heading entrance: label → words rise (SplitText `words`, mask) → train → dek; `split.revert()` on complete | `[data-sm-heading]` › `[data-sm-label]`, `[data-sm-split]`, `[data-sm-dek]` | load, after `document.fonts.ready` | `MOTION.heading.{eyebrow,lines,sweep}`, `MOTION.page.dekOffset` (`-=0.85`) |
| M1b | Count-up "20" | `[data-sm-count]` (aria-hidden twin) | in the M1 timeline at 0.1 s | `MOTION.count.duration`, `MOTION.page.count` |
| M2 | Notes column children | `[data-sm-notes] > *` | `top 88%`, once | `MOTION.page.notes` |
| M2 | Prose paragraphs, figures | `[data-sm-reveal]` | `top 88%`, once | `MOTION.reveal` |
| M2 | Closing row headline, then buttons | `[data-sm-closing] [data-sm-closing-item]` | `top 88%`, once | `MOTION.page.closing` |
| M2 | Form fields + submit row | `[data-sm-form] [data-sm-field]` | `top 88%`, once | `MOTION.page.formFields` |
| M3 | Pull-line train | `[data-sm-sweep]` | `top 85%`, once | `MOTION.sweep`, `MOTION.trigger.sweep` |
| M3 | Photo parallax, scrubbed | `[data-sm-parallax] img` | box `top bottom` → `bottom top`, scrub 0.4 | `MOTION.sobreMi.parallax` |
| M3 | Signature write-on (`clip-path`) | `[data-sm-signature]` | `top 92%`, once | `MOTION.sobreMi.signature` |
| M3 | Timeline rail `scaleY`, scrubbed | `[data-sm-rail]` | list `top 80%` → `bottom 55%`, scrub 0.4 | `MOTION.sobreMi.rail` |
| M3 | Timeline rows | `[data-sm-timeline] li` | `top 88%`, once | `MOTION.sobreMi.timelineRows` |
| M4 | Reading bar `scaleX`, scrubbed | `[data-reading-bar]` (v1.1: created by the scene inside the navbar capsule; the navbar is not edited) | ledger `top 70%` → `bottom 60%`, scrub 0.3 | `MOTION.colaboraciones.readingBar` |
| M4 | Year tick (4-digit; prev → own; first from 2021) or fade | `[data-sm-year]` (aria-hidden twin) | row `top 82%`, once | `MOTION.colaboraciones.yearTick` |
| M4 | Partner line, row body | `[data-sm-partner]`, `[data-sm-row-body] > *` | same row timeline (at 0.1 / 0.05) | `MOTION.colaboraciones.{partner,body}` |
| M5 | Audience rule `scaleX`, then H2 + text | `[data-sm-audience] [data-sm-rule]` | row `top 90%`, once | `MOTION.trabajaConmigo` |
| M6 | Contact channels | `[data-sm-channels] li` | load + delay 0.9 | `MOTION.contacto.channels` |
| M7 | FAQ rows per group | `[data-sm-faq-group] details` | group `top 88%`, once | `MOTION.faq.rows` |
| M7 | Open / close (user action) | `[data-sm-faq-answer]` | click on `summary` | `MOTION.faq.{open,close}` (ADR-0007) |
| M8 | v1.1: shake + not-configured banner (no success) | `[data-sm-field]`, `[data-sm-banner]` via `sm:*` events | form events | `MOTION.form.{shake,banner}` |
| M9 | Menu highlight + dot | `[data-nav-item]` in open panel | pointerover / focusin / pointerleave | `MOTION.menuMarker` |
| — | Nav `is-scrolled` shadow (parity with the landing) | `[data-nav]` | `MOTION.nav.start` | existing `MOTION.nav` |

The M1 H1 markup keeps the accessible name fixed: `<h1><span class="sr-only">{title}</span><span aria-hidden data-sm-split class="highlight-heading" data-sm-train>{title}</span></h1>`. SplitText runs with `aria: "none"`. Counters and years use the same pattern: an animated `aria-hidden` twin plus an `sr-only` final value.

### 4.3 Reduced motion / no JS

Without `.gsap`: no controller work, no `NavMarker` travel (`gsap.set` jump), no reading bar (`hidden` unless `.gsap`), native `<details>`, no shake. Every `[data-sm-*]` target is visible, `--train: 0%`, the rail is full (`scaleY` 1 in CSS), the signature is unclipped, and counters show their final values from server HTML.

## 5. Risks and open questions

| Risk | Mitigation / owner |
|---|---|
| LCP: the H1 is the likely LCP element and starts hidden under `.gsap` until the dynamic chunk and `document.fonts.ready` (same as the landing hero) | Measure on preview (task T041). If LCP > 2.5 s at 360: import the controller statically on these routes, or leave the label/dek visible pre-split. Architect decides with the numbers. |
| Soft navigation between Sobre mí pages leaves ScrollTriggers from the previous page | Controller mounted per page (not in the layout); `useGSAP` reverts on unmount; `ScrollTrigger.refresh()` after fonts |
| Navbar is a frozen landing component (ADR-0006) | Characterization snapshots first (T002); marker and reading bar are separate, dynamically loaded nodes that only exist in the open panel or on `/colaboraciones` |
| Server Action → external endpoint cannot be mocked with `page.route()` | Mock HTTP server as a Playwright `webServer` (T031), plus a second `next start` without the env var for the not-configured path |
| SplitText and the train background: word masks inside a `box-decoration-break: clone` span | E2E asserts the H1 ends as one text run with no transforms (as the landing's `split-text.spec.ts` does) |
| `height` tween (FAQ) | ADR-0007 (Proposed); T038 blocked until Accepted |

## 6. Task outline

See `docs/specs/sobre-mi/tasks.md` (milestones M0–M5).
