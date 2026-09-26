# Spec: vamosany-front-end — Sobre mí (5 pages + navbar menu) v1.1

- **Status:** Ready for /plan — all open clarifications resolved by the user on 2026-09-26 (§ Resolved Clarifications). DDR-0002/0003/0004 are *Accepted*.
- **Amended:** v1.1, 2026-09-26: UI-only release. The forms make no network request; backend delivery moves to § When the Backend Is Connected (user scope change + Security G1 R-01). Also fixes from Engineer findings (§ Amendment Log).
- **Date:** 2026-09-26
- **Owner:** Matheus Melo
- **Constitution reference:** serves the **Visitor** (constitution § Users, frontend addition: pre-customer, mostly on a phone) on 360 first, 1280 second; advances the public-site success criterion **confirmed Contacto + Trabajá conmigo submissions per month, counted at the delivery endpoint** (accepted 2026-09-26; target set by the user after 30 days of baseline). **It can't be measured in this release, because nothing is sent;** measurement starts when the backend is connected. Constitution § Success Criteria says the first marketing spec defines this metric; recording it in constitution v2 is a follow-up (§ Out of Scope 10), the constitution is not edited here.
- **Related DDRs:** DDR-0002 (About → "Sobre mí", 5 pages), DDR-0003 (navbar mega-menu moving marker on all dropdowns), DDR-0004 (motion on the Sobre mí pages beyond one expressive moment). All *Accepted*. Also ADR-0002 (`.gsap` gate), ADR-0003 (headless motion controller), ADR-0006 (frozen landing).
- **Backend contract:** none in this release. The forms are UI-only and send nothing (§ Data Dependencies). The future delivery contract is Pre-Contract (§ When the Backend Is Connected). All other content is static.
- **Content source:** `tempcontentabout/ESTRUCTURA NUEVA WEB VAMOS A NY.md` (final, verbatim).
- **Approved mockup:** Direction A "Cuaderno de campo", `docs/design/mockups/sobre-mi-cuaderno.html` (2026-09-26). Its images use relative paths (`img/…`, `logo-pretzel-dark.png`) and don't resolve from `docs/`; the files are in `public/img/` and `public/`. The mockup is illustration; **this text is the contract**. Where they differ, this spec says which one wins and why.

> **Scope note (Spec Quality Bar: multi-journey).** Five pages usually means five specs. They ship as one spec because they share one page structure, one menu, and one journey (a Visitor deciding whether to trust Belén and then reaching her). The Architect may split `/tasks` per page; the acceptance criteria are already keyed per page.

---

## Feature in One Sentence

Replace the navbar's "About" menu (7 dead links) with "Sobre mí" (5 real pages written by Belén), built on one shared "Cuaderno de campo" page structure, with two contact forms that ship as UI only (no delivery in this release).

## User & Trigger

- **Who:** the Visitor. Spanish-speaking, planning or dreaming about a New York trip, not a customer yet. Also a smaller second audience on Trabajá conmigo: brands, New York businesses, guides, companies and travel agencies (still the Visitor role, B2B intent).
- **From where:** the navbar "Sobre mí" menu on any page (desktop mega-menu at ≥1024, drawer below), links between these pages (closing rows, success copy), and later from search and Instagram links.
- **Device:** phone in one hand first (360 floor), laptop second.
- **State of mind:** "Who is behind this, and can I trust her with my trip?" Then: "I have a question" or "I have a proposal".

## Journey

1. The Visitor opens the navbar menu "Sobre mí" (desktop: hover or click; phone: burger → drawer).
   - 1a. Desktop: the grey highlight and yellow dot follow the pointer/focus between items (DDR-0003).
2. They choose a page:
   - 2a. **Sobre mí** → reads Belén's story → closing row → "Ver itinerarios" (`/#services`) or "Viajes grupales" (FAQ group-trips section).
   - 2b. **Colaboraciones** → reads the product history, 2022 → 2026 → closing row → "Escribime" (email) or "Trabajá conmigo".
   - 2c. **Trabajá conmigo** → finds their audience row → fills the cafecito form → is told to write to hola@vamosany.com, with what they typed kept on screen (this release).
   - 2d. **FAQ** → opens one or more questions → if not answered, closing row → "Escribime" → Contacto.
   - 2e. **Contacto** → fills the form → is told to write to hola@vamosany.com, with what they typed kept on screen (this release).
3. Outcome: the Visitor has (a) read enough to trust Belén, and/or (b) knows to write to hola@vamosany.com and has their message text ready to copy. (When the backend is connected: (b) becomes a sent message.)

## Screens & Surfaces

| Screen / surface | Route (proposed) | Purpose | Entry from | Exit to |
|---|---|---|---|---|
| Navbar › "Sobre mí" mega-menu (≥1024) | global | Reach the 5 pages; replaces "About" | Any page | The 5 routes |
| Navbar › drawer group "Sobre mí" (<1024) | global | Same, on phone/tablet | Burger | The 5 routes |
| Sobre mí | `/sobre-mi` | Who Belén is and why New York | Menu | `/#services`, `/preguntas-frecuentes#viajes-grupales` |
| Colaboraciones | `/colaboraciones` | Product line history, 7 products | Menu | `mailto:hola@vamosany.com`, `/trabaja-conmigo`, partner sites (new tab) |
| Trabajá conmigo | `/trabaja-conmigo` | B2B: five audiences + cafecito form | Menu, Colaboraciones | Form success in place |
| Contacto | `/contacto` | Contact form + other channels | Menu, FAQ closing row | Form success in place → `/preguntas-frecuentes` |
| FAQ | `/preguntas-frecuentes` | 14 questions in 3 groups | Menu, Contacto success | `/contacto` |

Slugs are Spanish and accent-free. They become the `es` URLs when i18n routing lands (§ Locale Behavior).

**Navigation pattern per breakpoint:** unchanged from today. ≥1024 (`lg`): capsule with dropdown triggers + mega-menu. <1024: burger → floating drawer listing every group. The only changes are the "Sobre mí" group content (DDR-0002) and the moving marker in the desktop mega-menu (DDR-0003).

### Menu IA (DDR-0002)

Trigger label: **Sobre mí** (same position as "About": last group, after Services). Two columns:

| Column heading | Item title | Blurb | Route |
|---|---|---|---|
| Vamos a New York | Sobre mí | Quién soy y por qué New York. | `/sobre-mi` |
| Vamos a New York | Colaboraciones | Cuadernos, agendas, cases y totes. | `/colaboraciones` |
| Vamos a New York | Trabajá conmigo | Marcas, guías, empresas y agencias. | `/trabaja-conmigo` |
| Ayuda | Contacto | Te respondo yo. | `/contacto` |
| Ayuda | FAQ | Antes de viajar. | `/preguntas-frecuentes` |

The old items (Our Story, How We Research, Press, Work With Us, Contact, Refunds, FAQ) are removed. Other groups (Itineraries, Guides, Blog, Services) keep their content and English labels.

## Shared Page Structure ("Cuaderno de campo")

Every page fills the same five slots, in this order. Only the content changes.

| # | Slot | Rule |
|---|---|---|
| 01 | **Label line** | Mono (display family, regular weight), 13px, `ink-muted`. 1–3 short items separated by spacing (no middle-dot glyphs between items). The only small text above the title. |
| 02 | **H1 + train marker** | `display-xl`, the six-car train marker (`highlight-heading` pattern, `--train`) behind the title. One H1 per page. `text-wrap: balance`. Max ~18ch. |
| 03 | **Dek** | `body-lg` (18px), `ink-muted`, max 52ch, `text-wrap: pretty`. The md's "Bajada" / first paragraph. |
| 04 | **Body** | Notes column (200px, mono 13px, `ink-muted`, first item bold `ink`) + main column (prose max 760px, 17px / 1.7). Two columns at ≥860px container width; stacked (notes first) below. |
| 05 | **Closing row** | One `headline` sentence (max 26ch) + one primary (yellow) button, optional secondary (outline) button, between two 2px `ink` rules. Pages whose main action is a form (Trabajá conmigo, Contacto) have no closing row. |

Page chrome: existing Navbar and Footer, unchanged except DDR-0002/0003. The footer stays as it is today (see § Out of Scope).

## States Matrix

These are static pages. Content is rendered on the server; there is no content loading, empty, partial or permission state. What remains:

| Screen | Loading | Empty | Error | Partial | Success | Offline |
|---|---|---|---|---|---|---|
| All 5 pages | No skeleton (static). Images reserve their box (3:2, `surface-2` fill) so nothing moves when they load. | N/A (static content) | Unknown route → existing `not-found.tsx`; render failure → existing `global-error.tsx` | Image fails to load → the reserved box stays with its `surface-2` fill; alt text remains available | Page as specified | N/A |
| Navbar menu | N/A | N/A | N/A | N/A | Open/closed as today | N/A |
| FAQ | N/A | N/A | Hash that matches no question → page loads at top, all closed | N/A | All questions closed on load; a matching `#hash` opens that question (or group) and scrolls it below the sticky navbar; several can be open at once | N/A |
| Contacto form | see Form States | | | | | |
| Trabajá conmigo form | see Form States | | | | | |

### Form States (Contacto and Trabajá conmigo)

| State | What the Visitor sees | Rules |
|---|---|---|
| **Idle** | All fields empty, labels visible above fields, primary button ("Enviar mensaje" / "Agendemos un cafecito"). No helper line in this release (see below). | Selects start on an empty prompt option (§ Copy). |
| **Field error** | The field keeps its 2px ink border and gets a yellow bottom bar (inset 3px `brand`); below it, an error line in bold with a round ink "!" badge. Focus moves to the first invalid field. | Validated on submit. Once an error shows, it clears as soon as the value becomes valid. Color is never the only signal (text + badge). Nothing already typed is lost. |
| **Not configured** (after a valid submit) | A banner appears above the form (2px ink border, same style as the connected-state Failed banner): "Por ahora, escribime a hola@vamosany.com. Lo que escribiste sigue acá." The email is a `mailto:` link in mono bold. Every field keeps its value. The button label doesn't change. | **No network request of any kind.** Focus moves to the banner (focusable programmatically), which is announced politely. A later valid submit keeps the single banner (no duplicates; it is re-announced). A later submit with errors removes the banner and shows Field error. |
| **No JS** | In place of the form: a block in the same banner style, [new] "Para escribirme, mandame un mail a hola@vamosany.com. Te respondo yo.", where the address is a `mailto:` link in mono bold at `headline` size, so it is prominent. The form fields are not shown: a form that can't respond shouldn't invite typing. | Nothing can be submitted, so nothing leaves the browser (Security R-01). The Architect picks the mechanism. |
| **Before hydration** | The form is visible (server-rendered). A tap on the button before the page is interactive does nothing visible: no navigation, no URL change, no reload. | R-01: no field value leaves the browser. After hydration, the next submit behaves as above. |

**Helper line decision.** "Uso tu email solo para responderte." is **hidden in this release.** On a form that sends nothing, a promise about how the email will be used implies that it is sent, which isn't honest. The banner already gives the real path (the email address). The line returns, unchanged, when the backend is connected.

Submitting, Success and connection-Failed are **not in this release**. Their spec is kept in § When the Backend Is Connected.

## Content & Copy

Provenance tags: **[md]** verbatim from the content file (do not edit); **[md-derived]** built from an md heading, with case or accent normalized; **[mock]** written in the approved mockup and accepted with it; **[new]** drafted in this spec and accepted by the user on 2026-09-26. Product language: Spanish (Rioplatense, voseo). Belén in first person.

### Navbar
- Trigger: "Sobre mí" [mock, decided]. Column headings, items and blurbs: § Menu IA [decided].

### Page metadata [new]
| Route | `<title>` | Meta description |
|---|---|---|
| `/sobre-mi` | Sobre mí — Vamos a NY | Soy Belén, comunicadora, estratega digital y, sobre todo, una persona profundamente enamorada de New York. |
| `/colaboraciones` | Colaboraciones — Vamos a NY | Además de itinerarios y consultorías, con los años fui creando productos para quienes aman New York tanto como yo. |
| `/trabaja-conmigo` | Trabajá conmigo — Vamos a NY | Si tenés una marca, un proyecto o un servicio relacionado con New York, me encantaría conocerte. |
| `/contacto` | Contacto — Vamos a NY | ¿Estás planificando tu viaje a New York, tenés una duda sobre algún servicio o querés proponerme una colaboración? Contame lo que necesites. |
| `/preguntas-frecuentes` | Preguntas frecuentes — Vamos a NY | Itinerarios, consultorías, viajes grupales y productos: lo que más me preguntan antes de viajar a New York. |

(Descriptions reuse [md] sentences except the FAQ one.)

### Page 1 — Sobre mí (`/sobre-mi`)

**01 Label** [mock]: `Sobre mí` · `Montevideo → New York` · `+20 visitas` (three items; "20" counts up, § Motion)

**02 H1** [md-derived: from the heading "PÁGINA: SOBRE MI", sentence-cased with the accent restored; the file has no "Título"]: **Sobre mí**

**03 Dek** [md]: Soy Belén, comunicadora, estratega digital y, sobre todo, una persona profundamente enamorada de New York.

**04 Body — notes column** [mock]: **Belén** / Lic. en Comunicación / Máster en Marketing Digital / Independiente desde 2020

**04 Body — main column** [md, in order; styling notes in brackets]:

1. Soy Licenciada en Comunicación y tengo un Máster en Marketing Digital. Trabajo de forma independiente desde 2020 y, a fines de 2021, encontré la manera de unir mi profesión con uno de mis grandes amores: New York.
2. ¿Se pueden amar lugares con locura? *[display pull line, uppercase, max 26ch, own train marker]*
3. Me lo pregunto seguido y creo que sí. Aunque, si soy sincera, no sé si amo solamente la ciudad. Amo cómo me siento cuando estoy ahí: lo que me transmite, lo que descubro cada vez que vuelvo y todo lo que soy cuando camino por sus calles.
4. La conocí a los 20 años y todavía me acuerdo de esa primera vez. Llegué sin grandes expectativas, porque había viajado para visitar a mi novio, que estaba en una ciudad cercana. Pero cuando subí las escaleras del subte y salí a la calle, empecé a escuchar sus ruidos, sentir sus olores y ver esa mezcla de personas, idiomas y energía. Y algo hizo clic.
5. *[Photo figure, 3:2, radius 8px, mono caption under a hairline.]* Photo: `public/img/how-subway.webp` (the landing's subway photo; Wikimedia "14th Street Union Square BMT Canarsie Line elevator", TLK in 3, CC BY-SA 3.0, already in `public/img/CREDITS.json`). Alt [new]: "Salida de una estación de subte en Union Square, New York". Caption [new]: "Union Square, New York." No "a reemplazar" note. Attribution follows however the site credits the landing's CC images today.
6. Sentí que ese lugar tenía algo que ver conmigo.
7. Desde entonces volví más de 20 veces, y cada visita me confirma lo mismo: por más que la recorras, New York siempre guarda algo por descubrir.
8. Así nació Vamos a New York. *[`headline` style]*
9. Lo que empezó como un espacio para contar mis experiencias se convirtió en una comunidad de personas que también sueñan con esta ciudad. Hoy comparto lugares, consejos y todo lo que aprendí en tantos viajes, pero también acompaño a quienes están por vivir el suyo.
10. Porque para mí no se trata solo de conocer New York. Se trata de vivirla.
11. Por eso, además de crear contenido, ayudo a organizar viajes con itinerarios personalizados y consultorías, pensados según tus intereses, tus tiempos y tu forma de viajar.
12. Y hay una parte de este proyecto que me hace especialmente feliz: los viajes grupales.
13. En 2024 acompañé mi primer grupo a New York y desde entonces ya van seis viajes. Cada uno tuvo su propia temática, su propia energía y una manera distinta de vivir la ciudad. Recorrerla juntos, descubrir lugares en grupo y ver a cada persona cumplir su sueño de conocer New York se convirtió en una de mis partes favoritas de Vamos a New York.
14. Después de tantos viajes, tengo algo cada vez más claro: New York siempre tiene algo nuevo para mostrar.
15. Y yo sigo feliz de volver, descubrirla y, sobre todo, compartirla con vos.
16. Belén *[signature, display family, 28px, italic in the mockup; see § Token Proposals]* [mock]

**04b Timeline section** [mock] — notes column: H2 **En el camino** / 20 años → hoy. Main column: a timetable list with a yellow rail on its left edge.

| Time | Title | Line | Tag |
|---|---|---|---|
| 20 años | La primera vez | Subí las escaleras del subte y algo hizo clic. | New York |
| 2020 | Independiente | Comunicación y estrategia digital, por mi cuenta. | — |
| 2021 | Nace Vamos a New York | Mi profesión y la ciudad, juntas. | — |
| 2024 | Primer viaje grupal | Desde entonces, seis viajes. | 6 grupos |
| Hoy | +20 visitas | Y sigo volviendo. | — |

**05 Closing row** [mock, edited by user]: H2 "¿Armamos tu viaje juntos?" · primary **Ver itinerarios** → `/#services` · secondary **Viajes grupales** → `/preguntas-frecuentes#viajes-grupales`.

### Page 2 — Colaboraciones (`/colaboraciones`)

**01 Label** [mock]: `Colaboraciones` · `7 productos` · `2022 → 2026`

**02 H1** [md-derived: from the heading "PÁGINA: COLABORACIONES", sentence-cased]: **Colaboraciones**

**03 Dek** [md]: Además de itinerarios y consultorías, con los años fui creando productos para quienes aman New York tanto como yo. Todos nacieron de algo que yo quería tener y no encontraba, y casi siempre de la mano de personas y marcas que admiro. Cada uno tiene su historia, y acá te las cuento.

**04 Body — product ledger.** One row per product. Left 200px column: year (display 24px) + partner line (mono 13px; external partner names are links, new tab, with a "↗"). Main column: H2 product title (`headline`) + story. Titles are [md]; the years that the md had in parentheses moved to the year column (mockup decision; the text is otherwise untouched).

| Year [mock] | Partner line [mock] | H2 title [md] |
|---|---|---|
| 2022 | Estudio Ulbia ↗ (`https://estudioulbia.com/`) | El cuaderno que empezó todo |
| 2023 | Con Lu, Estudio Ulbia | Agenda Vamos a New York 2023 |
| 2023 | Mona Cases · mayo 2023 ↗ (`https://monacases.com.uy/`) | Cápsula con Mona Cases |
| 2023 | Colección propia | Cuadernos 2023 |
| 2024 | Segunda edición | Agenda Vamos a New York 2024 |
| 2024–25 | Efe Hus · Flor ↗ (`https://efehus.com/`) | Tote bags con Efe Hus |
| 2026 | Tercera edición | Agenda Vamos a New York 2026 |

Stories [md], one per row, in order. In-text partner names stay links as in the md (Estudio Ulbia, Mona Cases, Efe Hus):

1. A principios de 2022 le escribí a Lu, de Estudio Ulbia, con un pedido muy simple: quería un cuaderno de New York para mí. No había ninguna idea de venderlo. Un día lo mostré en una foto, casi por casualidad, y empezaron a llegar mensajes preguntando dónde se conseguía. Esos primeros pedidos me hicieron ver que había muchas personas que querían llevar un pedacito de New York en su día a día, y así nació la línea de productos de Vamos a New York.
2. Después del cuaderno vino algo que yo misma necesitaba y no existía: una agenda pensada para quienes viven soñando con New York. La diseñamos con Lu cuidando cada detalle, con stickers, planner, un organizador personalizado y los eventos y actividades destacadas de cada mes en la ciudad, para que planificar el año también fuera una forma de estar un poco allá. La recepción de la comunidad me sorprendió muchísimo, y fue la confirmación de que este camino tenía sentido.
3. En mayo de 2023 llegó mi primera colaboración con otra marca: una cápsula junto a Mona Cases, referentes en accesorios para celular en Uruguay. Creamos cases, una taza, un mouse pad y stickers con diseños icónicos de New York, otra vez con Lu detrás del diseño. Fue muy especial ver esos diseños en manos de tanta gente, porque son objetos que se usan todos los días y que te recuerdan la ciudad cada vez que los mirás.
4. El cuaderno que empezó todo se merecía volver renovado. En 2023 lancé una nueva colección con diseños frescos, pensados para anotar ideas, planes de viaje o lo que cada una quiera. Es probablemente la colección que más me representa de punta a punta, porque cada diseño tiene algo de cómo veo y vivo New York.
5. Después de lo que fue la primera agenda, tenía muchas ganas de hacer una nueva edición. La 2024 volvió con la misma idea: acompañarte todo el año con un poco de New York, entre planes, fechas y ganas de volver.
6. Three blocks:
   - La historia con Flor, de Efe Hus, empezó con un viaje. En junio de 2023 decidimos ir juntas a New York casi sin conocernos, y volvimos siendo amigas. Nos quedamos a pocas cuadras de Columbus Circle, y esa parada de subte se volvió nuestro punto de partida de cada día. Después de desearlo mucho tiempo, en octubre de 2024 lanzamos una tote bag en su homenaje.
   - En 2025 volvimos con una segunda tote, con una frase que nos representa a las dos y a toda esta comunidad:
   - *[display pull line, uppercase, `ink`, own train marker, `lang="en"`]* “I think about New York more than a normal person should.”
   - Si estás leyendo esto, probablemente sepas exactamente de qué hablamos.
7. Para la tercera edición quería que fuera más completa que nunca. Además de todo lo que ya tenía, sumé ilustraciones de New York para pintar, espacio para contar tu viaje y lugar para pegar fotos, para que no sea solo una agenda sino también un recuerdo de tu año y de tus viajes. Para mí es de los productos más especiales que hago, porque sé que va a estar con muchas personas todos los días, llevando un pedacito de New York a su rutina.

**05 Closing row.** The mockup shortened this to one line; the md has a full closing section, and **the md wins** (verbatim rule):
- H2 [md]: ¿Querés crear algo juntos?
- Text [md]: Cada una de estas colaboraciones nació de una conversación y de las ganas compartidas de hacer algo lindo. Si tenés una marca o un proyecto y te gustaría colaborar con Vamos a New York, escribime a hola@vamosany.com. Me encanta crear cosas con personas que comparten este amor por la ciudad. *(the address is a `mailto:` link)*
- Primary [mock]: **Escribime** → `mailto:hola@vamosany.com` · Secondary [mock]: **Trabajá conmigo** → `/trabaja-conmigo`

### Page 3 — Trabajá conmigo (`/trabaja-conmigo`)

**01 Label** [mock]: `Trabajá conmigo` · `marcas · servicios · guías · empresas · agencias`

**02 H1** [md Título]: **¿Nos tomamos un cafecito?**

**03 Dek** [md Bajada]: Si tenés una marca, un proyecto o un servicio relacionado con New York, me encantaría conocerte.

**04 Body — notes column** [mock]: **Desde 2021** / +20 visitas / 6 viajes grupales / Muchísimos itinerarios

**04 Body — main column:** intro [md]: Desde 2021 construyo Vamos a New York con una comunidad de personas que sueñan con esta ciudad, la planifican y la viven. Después de más de 20 visitas, seis viajes grupales y muchísimos itinerarios, sé lo que buscan quienes viajan a New York y cómo hablarles. Si creés que podemos crear algo juntos, esta página es para vos.

Then five audience rows [md]: H2 (`card-title`) left, text right at ≥760; stacked below. First row has a 2px ink top rule, the rest a hairline.

| H2 [md] | Text [md] |
|---|---|
| Marcas que quieran colaborar | Me encanta crear productos y contenidos con marcas que comparten este amor por New York o los viajes. Ya lo hice con cuadernos, agendas, cases y tote bags, siempre cuidando que cada colaboración tenga una historia real detrás. Si tenés una idea, desde una cápsula de productos hasta una campaña en redes, hablemos. |
| Empresas de servicios en New York | Hoteles, restaurantes, tiendas, experiencias, tours: si tu negocio está en New York y querés llegar a viajeros de habla hispana, puedo ayudarte a hacerlo de forma auténtica. Recomiendo solo lo que conozco y me gusta, y por eso mi comunidad confía en lo que comparto. |
| Guías turísticos | Si sos guía en New York y te gustaría trabajar con viajeros latinos, me encantaría conocerte. Siempre estoy buscando personas con quienes sumar experiencias a mis itinerarios y viajes grupales. |
| Empresas que quieran contratar mis itinerarios | Si tu empresa organiza viajes de incentivo, beneficios para colaboradores o experiencias para clientes, puedo diseñar itinerarios a medida de tu equipo o de tu propuesta. |
| Agencias de viaje | Si tenés una agencia y querés sumar itinerarios personalizados, consultorías o viajes temáticos a New York a lo que ofrecés, podemos armar una propuesta en conjunto. |

**04c Cafecito section** — notes column [mock]: H2 **El cafecito** / Virtual / En Montevideo / O en New York. Main column: Cierre [md] as `body-lg`: Contame quién sos, qué hacés y qué te imaginás que podemos hacer juntos. El cafecito puede ser virtual, en Montevideo o, si coincidimos, en New York. Then the form.

**Form — fields [md], order and labels exact.** Two columns at ≥560 (Nombre | Empresa o marca; tipo | Email), stacked below.

| Field | Label [md] | Control | Required | Autocomplete |
|---|---|---|---|---|
| name | Nombre | text | yes | `name` |
| company | Empresa o marca | text | yes (md marks nothing optional) | `organization` |
| collaborationType | ¿Qué tipo de colaboración te interesa? | select: *Elegí una opción* [new, empty value] / Marca / Servicio en New York / Guía turístico / Empresa / Agencia de viajes / Otro | yes | — |
| email | Email | email | yes | `email` |
| idea | Contame tu idea | textarea (min 120px, vertical resize) | yes | — |
| — | Button [md]: **Agendemos un cafecito** | submit | — | — |

### Page 4 — Contacto (`/contacto`)

**01 Label** [mock]: `Contacto` · `respondo yo`

**02 H1** [md Título]: **Escribime, te respondo yo.**

**03 Dek** [md Texto]: ¿Estás planificando tu viaje a New York, tenés una duda sobre algún servicio o querés proponerme una colaboración? Contame lo que necesites. Cada mensaje lo leo y lo respondo yo, así que puede que tarde un par de días en contestarte, pero siempre respondo. — *The md had "[un par de días]" in brackets; the user kept the wording and dropped the brackets (2026-09-26).*

**04 Body — notes column** [md]: H2 **Otras formas de encontrarme**, then the channel list, each value a link. The md writes "Otras formas de encontrarme:" with a colon. **The heading drops it on purpose**: headings don't end in punctuation, and this is intentional, not a copy error.

Channel list layout: **at ≥860 (the 200px notes column)**, each channel is stacked: channel name (mono, 13px, `ink-muted`) on one line, value (mono bold, 15px) below it across the full 200px. At 15px, "hola@vamosany.com" (17 characters, ≈155px) fits on one line. **Below 860**, the notes column is full width, and name and value sit side by side (5.5rem | value). A value never breaks inside a word. If it can't fit (e.g. 200% zoom), the only allowed break is right after "@" (a word-break opportunity there), so "hola@" / "vamosany.com". No hyphenation and no `overflow-wrap: anywhere`. This fixes the mid-word break found at 1280 and keeps Direction A (same column, same type, no channel moved).

| Channel | Value | Link |
|---|---|---|
| Email | hola@vamosany.com | `mailto:hola@vamosany.com` |
| Instagram | @vamosany | `https://www.instagram.com/vamosany/` |
| TikTok | @vamosany | `https://www.tiktok.com/@vamosany` |

**04 Body — main column: form [md]**. Two columns at ≥560 (Nombre | Email; ¿Sobre qué…? | ¿Cuándo viajás?), stacked below.

| Field | Label [md] | Control | Required | Autocomplete |
|---|---|---|---|---|
| name | Nombre | text | yes | `name` |
| email | Email | email | yes | `email` |
| topic | ¿Sobre qué me escribís? | select: *Elegí una opción* [new, empty value] / Itinerario personalizado / Consultoría / Viajes grupales / Productos / Colaboraciones / Otro | yes | — |
| travelDate | ¿Cuándo viajás? *(opcional)* — "(opcional)" in small body type inside the label | text, free form | no | — |
| message | Mensaje | textarea (min 120px) | yes | — |
| — | Button [md]: **Enviar mensaje** | submit | — | — |

No closing row (the form is the closing action).

### Page 5 — FAQ (`/preguntas-frecuentes`)

**01 Label** [md "Preguntas frecuentes" + mock count, corrected]: `Preguntas frecuentes` · `14 preguntas` — the mockup said "13"; the md has 14 questions (8 + 5 + 1).

**02 H1** [md Título]: **Lo que más me preguntan antes de viajar**

**03 Dek** [mock]: Itinerarios, consultorías, viajes grupales y productos.

**04 Body.** Three groups [mock grouping, accepted]; md question order kept. Each group: notes column = H2 group name + count ("8 preguntas" / "5 preguntas" / "1 pregunta"); main column = native disclosure rows (question as the summary, "+" at the right that turns into "×" when open). Each group and question has a stable anchor (slug of its text, e.g. `#viajes-grupales`, `#que-es-un-itinerario-personalizado`).

**Itinerarios y consultorías** (8)
1. **¿Qué es un itinerario personalizado?** — Es un plan de viaje armado especialmente para vos, según tus fechas, tus intereses y tu ritmo. Empezamos con una reunión virtual para conocernos y conversar sobre tus gustos y lo que querés vivir. A partir de ahí armo un itinerario para cada día con actividades, tips y recomendaciones.
2. **¿Qué incluye el itinerario personalizado?** — bulleted list (yellow 8px dots):
   - Reunión virtual para conocernos y hablar de tus gustos y objetivos de viaje
   - Itinerario para cada día con actividades, tips y recomendaciones
   - Recomendaciones para comer según cada día y zona
   - Guía virtual con el itinerario de cada día
   - Asistencia para comprar entradas y opciones para reservar hotel y traslados
3. **¿Qué es la consultoría de viaje?** — Es una videollamada privada de una hora para resolver todas tus dudas sobre el viaje. Vemos juntas una idea de itinerario y te comparto una curaduría de restaurantes, tiendas y atracciones según tu perfil. Después de la reunión te envío un mail de seguimiento con los puntos principales que hablamos y links importantes para que termines de planificar, incluyendo cómo y dónde hacer reservas y comprar atracciones.
4. **¿Qué diferencia hay entre un itinerario y una consultoría?** — En el itinerario personalizado armo tu viaje completo, día a día. En la consultoría te asesoro para que organices tu propio viaje: vemos juntas una idea de itinerario y te doy recomendaciones personalizadas, pero no incluye un plan detallado por día ni contacto por WhatsApp.
5. **¿Cómo es el proceso después de comprar?** — Cuando se registra tu compra te llega un mail de confirmación. Después te envío otro mail con un cuestionario para empezar a armar tu itinerario o tu consultoría, y con opciones de fechas para agendar nuestra reunión.
6. **¿Con cuánta anticipación tengo que reservar?** — Para el itinerario personalizado te recomiendo reservar con 2 meses de anticipación, así hay tiempo para armarlo con calma y conseguir entradas para lo que se agota. Si preferís hacerlo con más tiempo también se puede, aunque no recomiendo más de 6 meses antes, para que las recomendaciones estén lo más actualizadas posible. La consultoría se puede hacer en los días previos al viaje, idealmente con un mínimo de 5 días de anticipación.
7. **¿Las entradas y reservas están incluidas?** — Te ayudo a elegir y te digo cómo y dónde comprar entradas, reservar hotel y traslados, pero las compras las hacés vos directamente.
8. **¿Cómo se pagan los itinerarios y las consultorías?** — El pago se hace online, con tarjeta de crédito internacional o por transferencia bancaria en Uruguay.

**Viajes grupales** (5)
9. **¿Cómo funcionan los viajes grupales?** — Son viajes temáticos a New York en los que viajamos en grupo, con todo organizado y conmigo acompañándolos durante la experiencia. Cada viaje tiene su propia temática y un itinerario pensado para vivir la ciudad de una forma distinta, y todos cuentan con la garantía de Jetmar Viajes Uruguay.
10. **¿Los viajes grupales son para todos?** — Sí. Pueden sumarse desde niños hasta adultos. Todos son bienvenidos.
11. **¿Puedo sumarme a un viaje grupal si viajo sin compañía?** — ¡Sí, claro! Si querés compartir habitación, nosotros nos encargamos de buscarte compañero o compañera de cuarto. Y si preferís tener tu propio espacio, podés pagar el suplemento para habitación single.
12. **¿Cómo se pagan los viajes grupales?** — Para reservar tu lugar se abonan USD 300, y una vez confirmado el viaje empezás a pagar el resto. Podés hacerlo por transferencia o con tarjeta, y la cantidad de cuotas depende de la tarjeta. También se puede pagar con millas Itaú.
13. **¿Cómo me entero de los próximos viajes grupales?** — Los anuncio primero en Instagram y en la newsletter, así que suscribite para enterarte antes que nadie.

**Productos** (1)
14. **¿Dónde puedo comprar los productos de Vamos a New York?** — Los productos salen a la venta en momentos puntuales y los anuncio siempre en mis redes. Seguime en Instagram para enterarte cuando se lanza algo nuevo.

*(Numbering is for reference only, not rendered.)*

**05 Closing row** [mock]: H2 "¿No está tu pregunta? Escribime y te respondo yo." · primary **Escribime** → `/contacto`

### Form copy (both forms)

| Key | Copy | Tag |
|---|---|---|
| Helper next to button | Uso tu email solo para responderte. **Hidden in this release**; returns when the backend is connected. | [mock] |
| Select prompt option | Elegí una opción | [new] |
| Submitting button *(connected only)* | Enviando… | [mock] |
| Retry button (Failed) *(connected only)* | Probar de nuevo | [mock] |
| Failed banner title *(connected only)* | No se pudo enviar tu mensaje. | [mock] |
| Failed banner text *(connected only)* | Revisá tu conexión y probá de nuevo, o escribime a hola@vamosany.com. Lo que escribiste sigue acá. | [mock] |
| Not-configured banner (**this release**, after a valid submit) | Por ahora, escribime a hola@vamosany.com. Lo que escribiste sigue acá. | [new, approved 2026-09-26] |
| No-JS block (**this release**) | Para escribirme, mandame un mail a hola@vamosany.com. Te respondo yo. | [new] |
| Success H2 *(connected only)* | ¡Recibido! | [mock] |
| Success, Contacto *(connected only)* | Gracias por escribirme. Te respondo a **{email}** en un par de días. Mientras tanto, capaz tu duda ya está en las preguntas frecuentes. *("preguntas frecuentes" links to `/preguntas-frecuentes`)* | [mock] |
| Success, Trabajá conmigo *(connected only)* | Gracias por escribirme. Leo tu idea y te respondo a **{email}** para agendar el cafecito. | [mock] |
| Error: email empty | Falta tu email para poder responderte. | [mock] |
| Error: email malformed | Revisá tu email, parece que le falta algo. | [new] |
| Error: Nombre empty | Falta tu nombre. | [new] |
| Error: Mensaje empty (Contacto) | Contame en qué te puedo ayudar. | [new] |
| Error: ¿Sobre qué me escribís? empty | Elegí sobre qué me escribís. | [new] |
| Error: Empresa o marca empty | Falta el nombre de tu empresa o marca. | [new] |
| Error: tipo empty | Elegí qué tipo de colaboración te interesa. | [new] |
| Error: Contame tu idea empty | Contame tu idea, aunque sea en dos líneas. | [new] |

`{email}` is the address the Visitor typed, shown as text (never rendered as HTML). Strings are whole sentences with one interpolation, so they translate cleanly.

## Motion Intent

Values reference `lib/motion.ts` (`MOTION`, `EASE`) where they exist; values the mockup introduced are listed in § Token Proposals as new `MOTION` entries. `ds` = `EASE.ds`, `arrive` = `EASE.arrive` (the subway pulling in). All of this is accepted by DDR-0004 (pages) and DDR-0003 (navbar). **The mechanism (ScrollTrigger vs CSS scroll-driven, attribute controllers vs page modules) is the Architect's call.**

**Global rules**
- **Reduced motion** (`prefers-reduced-motion: reduce`, i.e. no `.gsap` class per ADR-0002): everything is static and visible in its final state. Train markers sit in place, counters show final values, years show final values, the timeline rail is full, the signature is fully visible, FAQ answers open and close instantly, the menu marker jumps without travel or stretch, the error shake does not run (the error text still shows), the navbar reading bar is not rendered.
- **No JS:** same as reduced motion. All content visible, FAQ works (native disclosure), menu items keep today's hover background.
- Nothing loops. Nothing blocks input. No motion causes layout shift (animations use transform/opacity/background-position/clip-path only; accordion height animation is the one layout-affecting exception and only runs on user action).
- ScrollTrigger reveals play once (`once: true`) unless marked *scrubbed*.

### M1 — Heading entrance (all 5 pages, on load)
*Job: "you arrived at a new station"; the marker is the brand's signature and the same gesture as the landing's section headings.*
Timeline (`ease: ds` unless noted), same shape as `MOTION.heading`:
1. Label line: from `y: 8`, `autoAlpha: 0`, 0.35s (`MOTION.heading.eyebrow`).
2. H1 words rise: each word from `yPercent: 115` inside its own clip, 0.7s, stagger 0.08, at `-=0.15` (`MOTION.heading.lines`). After landing, the H1 is a single text run again so the marker runs as one band.
3. Train marker pulls in: `--train` 100% → 0%, 1.0s, `ease: arrive`, at `-=0.3` (`MOTION.heading.sweep`).
4. Dek: from `y: 12`, `autoAlpha: 0`, 0.45s, at **`-=0.85`** (mockup; `MOTION.heading.lede.offset` is `-=0.42`). Intent: the dek lands while the train is still braking. New value → § Token Proposals.
5. Sobre mí only: "20" in the label counts 0 → 20, 1.2s (`MOTION.count.duration`), `power2.out`, starting at 0.1s.

### M2 — Shared scroll reveals (all pages)
*Job: pace the reading; each notes column arrives with its paragraph.*
- Notes column items: from `y: 12`, `autoAlpha: 0`, 0.4s, stagger 0.06, trigger `top 88%` (`MOTION.trigger.reveal`).
- Prose paragraphs and figures (not the pull lines, not the signature): from `y: 18`, `autoAlpha: 0`, 0.45s (`MOTION.reveal`), trigger `top 88%`.
- Closing row: headline then buttons, from `y: 14`, 0.4s, stagger 0.08.
- Form fields and button row: from `y: 16`, 0.4s, stagger 0.07.

### M3 — Sobre mí signature
*Job: the page is a story; motion marks its three beats (the question, the arrival, the signature) and the passage of time.*
- Pull line "¿Se pueden amar lugares con locura?": its own train marker sweeps in on scroll, 1.0s, delay 0.12, `arrive`, trigger `top 85%` (`MOTION.sweep`, `MOTION.trigger.sweep`).
- Photo: slow parallax inside its fixed 3:2 box, *scrubbed* (0.4): image scale 1.18 → 1.04, `yPercent` −6 → 6, from box top entering the bottom of the viewport to box bottom leaving the top. The box itself never moves.
- Signature "Belén": written left to right with `clip-path: inset(0 100% 0 0)` → none, 1.2s, `power2.inOut`, trigger `top 92%`.
- Timeline: a yellow 4px rail draws down the left edge, *scrubbed* (0.4), `scaleY` 0 → 1 from list top at 80% to list bottom at 55% of the viewport; rows slide in from `x: −14`, `autoAlpha: 0`, 0.4s, stagger 0.1.

### M4 — Colaboraciones signature
*Job: a departure board; you are travelling through the years 2022 → 2026.*
- Reading bar: a 3px `brand` bar along the bottom edge of the navbar capsule fills left to right, *scrubbed* (0.3), from ledger top at 70% to ledger bottom at 60%. Only on this page. Not rendered under reduced motion. Decorative (`aria-hidden`).
- Year tick: each row's year counts up from the previous row's year to its own (first row from 2021), 0.6s, `arrive`, trigger `top 82%`. Non-numeric year ("2024–25") fades in instead (0.3s). Same year as previous → no tick.
- Partner line: from `x: −10`, `autoAlpha: 0`, 0.4s, at 0.1s. Row body (H2 and paragraphs): from `y: 18`, 0.45s, stagger 0.06.
- The Efe Hus quote gets its own train marker sweep (as M3 pull line).

### M5 — Trabajá conmigo signature
*Job: five doors; each audience row is drawn as you reach it, so the Visitor scans for theirs.*
- Each audience row: its top rule draws left to right (`scaleX` 0 → 1, 0.6s), then H2 and text rise (`y: 14`, 0.4s, stagger 0.08, at `-=0.35`), trigger `top 90%`.
- Form fields: M2.

### M6 — Contacto signature
*Job: after the title, show the other channels, so a Visitor who does not want a form sees the email first.*
- The three contact lines slide in from `x: −14`, `autoAlpha: 0`, 0.4s, stagger 0.09, delay 0.9s after load (not scroll-triggered; they are above the fold).
- Form fields: M2.

### M7 — FAQ signature
*Job: questions are a list to scan; open/close shows where the answer came from.*
- Question rows rise group by group: from `y: 12`, `autoAlpha: 0`, 0.35s, stagger 0.05, trigger per group.
- Open: answer height 0 → auto, 0.4s, `ds`; answer content from `y: 8`, `autoAlpha: 0`, 0.35s, delay 0.08; "+" rotates 45° to read "×" (CSS, 300ms = `--duration-slow`, `--ease-default`).
- Close: height → 0, 0.3s, `power2.inOut`; icon back to "+".
- Deep link (`#question`): the question opens without animation and scrolls into view.

### M8 — Form feedback (Contacto and Trabajá conmigo)
*Job: confirm what happened, always paired with text.*
- Field error: the invalid field shakes horizontally (`x` 0, −7, 7, −4, 4, 0 over 0.4s, linear). Only on submit, not while typing.
- Not-configured banner (this release): from `y: −8`, `autoAlpha: 0`, 0.35s (the Failed banner's values). Reduced: appears instantly.
- Connected only (§ When the Backend Is Connected): Failed banner, same as above; Success: the "¡Recibido!" marker sweeps in (1.0s, `arrive`, delay 0.1), and the confirmation line rises (`y: 12`, 0.4s, stagger 0.08, delay 0.25).

### M9 — Navbar mega-menu moving marker (all dropdowns, desktop ≥1024) — DDR-0003
*Job: "you are here / you are pointing here", the subway dot riding between stations.*
- One grey highlight (`surface-1`, radius 12px) and one yellow dot (10px, `brand`, 2px `ink` ring) per open panel, placed behind/over the item under the pointer or keyboard focus. Dot sits at the item's top-right (24px from the right edge, 15px from the top).
- Moving to another item: highlight slides and resizes to it, 0.55s, `arrive`; dot travels 0.75s, `arrive`, and stretches along the way (scaleX up to `min(2.6, 1 + distance/160)`, scaleY 0.8, back to 1 on arrival; 0.75s, `power1.inOut`).
- On open: if the current route is an item in this panel, highlight and dot are placed on it with no travel; otherwise they appear (fade, `--duration-fast`) on the first item hovered/focused.
- Pointer leaves the items but stays in the panel: they return to the current-route item if there is one, otherwise stay on the last item.
- Switching panel (e.g. Guides → Blog): no travel across panels; the new panel starts per "On open".
- A new target mid-flight retargets from the current position (no queueing).
- Item titles underline on hover (4px offset), matching design system § 13 nav links.
- Reduced motion / no JS: see Global rules. Without the marker, items keep today's `hover:bg-surface-1`.
- Drawer (<1024): no moving marker. The current-route item shows a static 6px yellow dot (same as the language menu's selected dot) and `aria-current="page"`.

## Responsive Behavior

Breakpoints of record: 360 and 1280 first-class (constitution); 768 is also acceptance-tested for this feature at the user's request. The 360 layout is a complete layout, not a squeezed desktop. Horizontal padding: 20px below 768, 32px from 768.

| Element | 360 | 768 | 1280 |
|---|---|---|---|
| Navbar | Capsule + burger; drawer lists "Sobre mí" with both columns | Same as 360 (drawer until 1024) | Capsule with triggers; mega-menu with moving marker |
| Label line | Wraps to 2 lines if needed | 1 line | 1 line |
| H1 | `display-xl` at its 28px floor, balanced, no word alone on the last line where a balanced wrap can avoid it | fluid | 60px cap, max 18ch |
| Body (notes + main) | Stacked: notes column first, then main | Stacked | Two columns: 200px + main (prose max 760px), 40px gap |
| Sobre mí timeline | 2 columns (time \| title+line), tag moves under the line | 3 columns (time \| text \| tag) | 3 columns |
| Colaboraciones ledger | Stacked: year + partner above title and story | Stacked | 200px year/partner column + story |
| Trabajá conmigo audience rows | Stacked: H2 above text | 2 columns (≥760): H2 \| text | 2 columns |
| Forms | One field per row | Two per row (≥560) as listed; textarea full width | Same as 768 |
| Submit row | Button (min 220px); no helper in this release | Same | Same |
| Contacto channel list | Name and value side by side | Side by side | Stacked in the 200px notes column; no mid-word break |
| FAQ groups | Group name + count above its questions | Stacked | 200px group column + questions |
| Closing row | Headline above buttons; buttons wrap | Headline and buttons on one line when they fit | One line, space-between |
| Photo (Sobre mí) | Full column width, 3:2 | 3:2 | 3:2 within prose width |

At every width: no horizontal scroll down to 320px; text at 200% zoom stays readable without loss.

## Accessibility Acceptance

WCAG 2.2 AA floor (constitution). Beyond the baseline:

- **Language:** these pages' `<main>` declares `lang="es"` (the site root is `lang="en"`, and the navbar/footer are still English). The Efe Hus quote declares `lang="en"`.
- **Outline:** one H1 per page; H2s: Sobre mí ("En el camino", closing), Colaboraciones (each product title, closing), Trabajá conmigo (each audience, "El cafecito"), Contacto ("Otras formas de encontrarme"); "¡Recibido!" only when connected, FAQ (each group, closing). Landmarks: `header`, `nav`, `main`, `footer`.
- **H1 split:** the H1's accessible name equals the title text at every moment (word splitting is visual only).
- **Counters:** "+20 visitas" and the Colaboraciones years expose only their final value to assistive tech (no intermediate numbers announced).
- **Decorative motion elements** (train markers, menu highlight and dot, timeline rail, reading bar, audience rules, FAQ "+"/"×" glyph) are `aria-hidden` and carry no meaning that isn't in text.
- **Keyboard path, menu:** Tab to "Sobre mí" trigger → Enter/Space opens → Tab through the 5 items (marker follows focus) → Enter navigates → Esc closes and returns focus to the trigger. Current page item has `aria-current="page"`, in the mega-menu and in the drawer.
- **Keyboard path, forms (this release):** Tab through fields in md order → Enter/submit. On errors: focus moves to the first invalid field; each error is tied to its field (`aria-invalid`, `aria-describedby`). On a valid submit: focus moves to the not-configured banner, which is announced politely; the next Tab reaches its `mailto:` link; typed values remain. JS off: the email block is reachable in normal reading/Tab order. (Connected-state keyboard behavior: § When the Backend Is Connected.)
- **Labels:** every field has a visible label; the select prompt is an option, not a label; "(opcional)" is part of the label text.
- **FAQ:** native disclosure (`details`/`summary` or equivalent with `aria-expanded`); Enter/Space toggles; opening does not move focus.
- **External links** (partners, Instagram, TikTok) open in a new tab and say so to assistive tech (visually hidden "(se abre en otra pestaña)"). The "↗" glyph is `aria-hidden`.
- **Focus not obscured (2.4.11):** anchors, FAQ deep links and focused form fields scroll clear of the sticky navbar.
- **Targets:** menu items, FAQ summaries, buttons, contact links ≥44×44px on coarse pointers.
- **Contrast:** `ink-muted` (#484846) on white and on `surface-1` ≥ 4.5:1; focus ring `ink` 2px offset 2px; the yellow error bar is paired with the error text and "!" badge.
- **Reduced motion:** per § Motion Intent Global rules; checked in the reduced-motion screenshot run.
- **Automated:** `@axe-core/playwright` on each page and on each form state; manual keyboard pass by QA.

## Data Dependencies

| Read / write | Entity & operation | Contract | Notes |
|---|---|---|---|
| Read | Page content (5 pages, menu) | N/A — static, from the content file | Where the copy lives (TS module, MDX, JSON) is the Architect's call |
| Write | *None in this release.* Contact message and collaboration request are **not sent** | — | Values live only in component state: not in the URL, storage, logs or any request (Security R-01, R-02, R-03). No Server Action or Route Handler in this feature. |

The future write contract is in § When the Backend Is Connected.

## Locale Behavior (flag for the Architect)

Current code: there is no i18n. The navbar's language switcher (`components/layout/navbar.tsx:194-204`) only changes a local `useState` value ("EN" by default); it changes no content, no route, and is not persisted. `<html lang="en">` is fixed in `app/layout.tsx`. The landing is English except the hero (Spanish, DDR-0001).

Behavior for this feature, until i18n lands:
- The 5 pages render **Spanish only**, at the routes above, whatever the switcher shows. Selecting PT or EN changes nothing (as everywhere else today).
- No `hreflang` alternates are emitted (there are no pt/en versions).
- `<main lang="es">` on these pages (§ Accessibility).
- The navbar mixes "Sobre mí" (Spanish) with English labels.

**For the Architect (i18n ADR, per constitution § Language(s)):** decide the routing model (prefix `/es`, `/pt`, `/en` vs localized slugs vs domain), where these Spanish slugs land in it (redirects if they move), and how the switcher becomes functional. pt/en translations of this content are out of scope here.

## Token Proposals

No new color, spacing or type tokens. The pages use existing tokens and utilities: `brand`, `ink`, `ink-muted`, `surface-1`, `surface-2`, `hairline`, `display-xl`, `headline`, `card-title`, `body-lg`, `body-sm`, `caption`, `highlight-heading` train marker, `--duration-fast|slow`, `--ease-default`.

Proposed additions (each with its reason; values come from the approved mockup):
1. **`lib/motion.ts` entries** for values that don't exist yet: page heading dek offset (`-=0.85`); menu marker (`pill 0.55`, `dot 0.75`, `stretchMax 2.6`, `stretchDivisor 160`, `squash 0.8`); Sobre mí parallax (`scale 1.18→1.04`, `yPercent ±6`, `scrub 0.4`), signature (`1.2`), rail (`start "top 80%"`, `end "bottom 55%"`, `scrub 0.4`), timeline rows (`x −14`, `0.4`, stagger `0.1`); Colaboraciones reading bar (`start "top 70%"`, `end "bottom 60%"`, `scrub 0.3`), year tick (`0.6`, trigger `"top 82%"`); audience rule (`0.6`, trigger `"top 90%"`); form fields (`y 16`, `0.4`, stagger `0.07`), shake (`[0,−7,7,−4,4,0]`, `0.4`), banner (`y −8`, `0.35`); Contacto channels (`x −14`, `0.4`, stagger `0.09`, delay `0.9`); FAQ rows (`y 12`, `0.35`, stagger `0.05`), open (`0.4`), close (`0.3`). Reason: `lib/motion.ts` is the single source of motion values (ADR-0006, T-17); adding is allowed, changing existing values is not.
2. **Courier Prime italic 400** (`next/font` `style: ["normal","italic"]`) *or* render the signature upright. Reason: the mockup's signature is italic and the font is loaded without italic, so the browser would fake it. Trade-off: one extra font file (~20 KB) vs. a faux italic. The Architect decides between loading Courier Prime italic and rendering the signature upright; UX has a slight preference for the real italic.

## Out of Scope

1. **Footer changes** (frozen by ADR-0006): the line "© 2026 Vamos a NY. Made in Madrid, walked in New York." (Belén is in Montevideo) and the footer's top link row ("Our story", "How we research", "Press"… pointing to `#`). Follow-up: a DDR to update both to the new IA.
2. **pt and en translations** of the 5 pages and menu, and i18n routing (Architect ADR).
3. Translating the rest of the navbar (Itineraries, Guides, Blog, Services, Log in, Sign up).
4. **Any network delivery of the forms** (endpoint, Server Action, provider, anti-spam, storage) and the Submitting / Success / connection-Failed states. Kept, not deleted, in § When the Backend Is Connected.
5. Pages removed from the menu: Press, Refunds, How We Research.
6. Buying products, product photos per Colaboraciones row, newsletter signup (the FAQ mentions the newsletter, but no signup link is added).
7. FAQ search (14 questions don't need one).
8. After Success: no "send another message" action; no draft autosave; no leave-page warning.
9. Dark mode (not in the design system).
10. **Constitution v2 (follow-up):** record the accepted success metric (confirmed form submissions per month, counted at the endpoint) in constitution § Success Criteria. Not edited in this spec.

## Acceptance Criteria

Viewports: 360, 768, 1280 unless stated. "Reduced" = `reducedMotion: 'reduce'`.

**Navbar (DDR-0002, DDR-0003)**
1. At 1280, the navbar shows "Sobre mí" where "About" was; opening it shows two columns, "Vamos a New York" (Sobre mí, Colaboraciones, Trabajá conmigo) and "Ayuda" (Contacto, FAQ), each item with the blurb in § Menu IA, each linking to its route.
2. No menu or drawer anywhere shows Our Story, How We Research, Press, Work With Us, Contact, Refunds, or the old FAQ blurb.
3. At 360 and 768, the drawer lists the "Sobre mí" group with the same columns, items and routes; tapping an item navigates and closes the drawer.
4. At 1280, in every dropdown (Itineraries, Guides, Blog, Services, Sobre mí), moving the pointer from one item to another slides a single grey highlight and a single yellow dot to the new item; keyboard focus moves them the same way.
5. On `/colaboraciones`, opening "Sobre mí" places the highlight and dot on "Colaboraciones" with no travel animation; that item has `aria-current="page"`.
6. Moving the pointer off the items (still inside the panel) on a "Sobre mí" route returns the marker to the current-page item.
7. The dot never overlaps item text or tags ("Best seller", "New", "Most popular") in any dropdown.
8. Reduced: the marker jumps to the hovered/focused item with no travel and no stretch. No JS: items show today's hover background.
9. In the drawer, the current-page item shows a static yellow dot and `aria-current="page"`.
10. Esc closes an open dropdown and focus returns to its trigger.

**Shared structure (all 5 pages)**
11. Each page renders, in order: label line, one H1 with the train marker, dek, body, and (Sobre mí, Colaboraciones, FAQ) a closing row between two 2px ink rules — with the exact copy in § Content & Copy.
12. Every [md] string on the page matches the content file character for character (accents, "¿", "¡", punctuation).
13. `<title>` and meta description match § Page metadata.
14. `<main>` has `lang="es"`; the page has exactly one H1 and the H2s listed in § Accessibility.
15. On load (motion on): the label fades up, the H1 words rise in sequence, the train marker slides in from the right and settles, and the dek arrives while the marker is still moving; the whole sequence completes and leaves the H1 as a single text run.
16. Reduced and no-JS: label, H1 with marker in place, dek and all body content are visible immediately, with no transforms.
17. Scrolling to any notes column, paragraph, closing row or form reveals it once; scrolling back up does not replay it.
18. At 360: body stacks with the notes column above the main column; no horizontal scroll at 360 or 320; at 1280: notes column 200px beside main column, prose no wider than 760px.
19. No layout shift from any animation or image load (CLS 0 from these elements); images reserve a 3:2 box.
20. axe reports no violations on each page in idle state, at 360 and 1280.

**Sobre mí**
21. The label shows "+20 visitas"; with motion on, "20" counts up from 0 during the entrance; assistive tech reads "20" only; reduced shows "20".
22. The line "¿Se pueden amar lugares con locura?" renders as a display pull line whose own marker sweeps in when it enters the viewport; reduced shows the marker in place.
23. The photo drifts slowly inside a fixed 3:2 box while scrolling; the box does not move; reduced shows the photo still. The photo is `how-subway.webp` with the alt and caption "Union Square, New York." from § Page 1; the text "a reemplazar" appears nowhere.
24. The signature "Belén" is revealed left to right when reached; reduced shows it whole.
25. The "En el camino" timeline shows the five rows in § Page 1; a yellow rail fills downward with scroll and rows slide in; reduced shows the rail full and rows in place. At 360 the tag sits under the line.
26. Closing row: "¿Armamos tu viaje juntos?", "Ver itinerarios" (primary) → `/#services` and "Viajes grupales" (secondary) → `/preguntas-frecuentes#viajes-grupales`, which scrolls to that FAQ group.

**Colaboraciones**
27. Seven product rows in § Page 2 order, each with year, partner line, H2 title and the [md] story; the Efe Hus row has three paragraphs around the English quote (`lang="en"`), and the quote's marker sweeps in on scroll.
28. Partner links (Estudio Ulbia, Mona Cases, Efe Hus) open the partner site in a new tab and announce that they do.
29. With motion on, each 4-digit year ticks up from the previous row's year when the row enters; "2024–25" fades in; assistive tech reads only the final year; reduced shows final years.
30. With motion on, a 3px yellow bar in the navbar capsule's bottom edge fills as the ledger is scrolled and is empty/full before/after it; it appears only on this page; reduced does not render it.
31. Closing row shows the [md] heading and paragraph; "Escribime" opens `mailto:hola@vamosany.com`; "Trabajá conmigo" goes to `/trabaja-conmigo`.

**Trabajá conmigo**
32. Five audience rows with the [md] H2s and texts; with motion on, each row's rule draws left to right and its text rises when reached; reduced shows them in place. At 768 and 1280 H2 and text sit side by side; at 360 stacked.
33. The cafecito section shows the notes column (El cafecito / Virtual / En Montevideo / O en New York), the [md] Cierre, and the form with the five fields in [md] order and labels, and the button "Agendemos un cafecito".

**Contacto**
34. The dek reads "…puede que tarde un par de días en contestarte…" with no brackets; no "[" or "]" appears in any Contacto copy.
35. "Otras formas de encontrarme" (no colon) lists Email, Instagram and TikTok as links; at 1280 each channel is stacked in the notes column and "hola@vamosany.com" sits on one line, never broken mid-word (at 200% zoom it may break only after "@"); with motion on they slide in after the title sequence; reduced shows them in place.
36. The form shows the five fields in [md] order and labels, "(opcional)" on "¿Cuándo viajás?", and the button "Enviar mensaje".

**Forms (both pages; run each on Contacto and Trabajá conmigo)**
37. Idle: fields empty, selects on "Elegí una opción", no helper line under the button.
38. Submitting with required fields empty shows each field's error text from § Form copy under that field, sets `aria-invalid` and `aria-describedby`, moves focus to the first invalid field, and (motion on) shakes the invalid fields once; nothing typed is lost.
39. An email without "@" or domain shows "Revisá tu email, parece que le falta algo."; fixing it clears the error while typing.
40. Leaving "¿Cuándo viajás?" empty does not block a valid submit (Contacto).
41. **Not configured:** submitting valid data makes **no network request**, shows the banner "Por ahora, escribime a hola@vamosany.com. Lo que escribiste sigue acá." above the form, with the address as a `mailto:` link, moves focus to the banner and announces it; every field keeps its value; the URL doesn't change.
42. Submitting valid data again keeps exactly one banner. A later submit with an invalid field removes the banner and shows Field error (AC 38).
43. "Enviando…", "¡Recibido!", "No se pudo enviar tu mensaje." and "Uso tu email solo para responderte." appear nowhere in this release's build of the two pages.
44. **R-01 (Security G1):** with JavaScript disabled, and with a click on the submit button before hydration, a form filled with synthetic values causes **no navigation, no URL change, and no request whose URL or body contains any field value** (Playwright asserts over every request). With JS disabled, the form area shows the no-JS block "Para escribirme, mandame un mail a hola@vamosany.com. Te respondo yo." with a working `mailto:` link, and no form fields.
45. axe reports no violations in the Idle, Field error, Not configured and No-JS states, on both pages.

**FAQ**
46. Three groups (Itinerarios y consultorías 8, Viajes grupales 5, Productos 1) with the [md] questions and answers in [md] order; the second question's answer is a five-item bulleted list.
47. All questions are closed on load; clicking or Enter/Space on a question opens it (motion on: slides open, "+" turns to "×"); several can be open; closing works the same; reduced opens/closes instantly.
48. Loading `/preguntas-frecuentes#viajes-grupales` scrolls that group into view below the navbar; loading a question's anchor opens that question and scrolls it below the navbar; an unknown hash leaves everything closed at the top.
49. FAQ works with JS disabled (questions open and close).
50. Closing row "¿No está tu pregunta? Escribime y te respondo yo." with "Escribime" → `/contacto`.

**Regression**
51. The landing (`/`) renders pixel-identical to the committed baseline except the navbar's "Sobre mí" label and the mega-menu/drawer states covered by DDR-0002 and DDR-0003; the baseline update for those states cites both DDRs.

## Open Clarifications

None.

## Resolved Clarifications (user, 2026-09-26)

| # | Question | Answer | Sections updated |
|---|---|---|---|
| 1 | Reply time "[un par de días]" | Keep the wording, drop the brackets | Page 4 dek, Form copy (Success, Contacto), AC 34 |
| 2 | Sobre mí photo | The landing's subway photo `how-subway.webp` (credit in `CREDITS.json`), neutral caption, no "a reemplazar" note | Page 1 body item 5, AC 23 |
| 3 | "juntas" vs "juntos" | "¿Armamos tu viaje juntos?" | Page 1 closing, AC 26 |
| 4 | Forms before the endpoint exists | The full form UI ships. A Server Action POSTs to an endpoint set by a server-only env var; when it is unset or the call fails → Failed with the email fallback; Success only on 2xx. Pre-Contract shape defined by the Architect | Form States, Data Dependencies, AC 44 — **superseded by v1.1** (UI-only release; see § Amendment Log) |
| 5 | Success metric | Confirmed form submissions per month, counted at the endpoint; constitution v2 is a follow-up | Header, Out of Scope 10 |
| 6 | Sobre mí closing destinations | `/#services` and `/preguntas-frecuentes#viajes-grupales` | Screens, Journey, Page 1 closing, AC 26 |
| 7 | [new] copy and social URLs | Drafts accepted; Instagram `https://www.instagram.com/vamosany/`, TikTok `https://www.tiktok.com/@vamosany` | Copy provenance, Page 4 channels |
| 8 | Mockup location | Copied to `docs/design/mockups/sobre-mi-cuaderno.html` | Header |

## When the Backend Is Connected (not in this release)

Kept so the copy and states don't have to be designed again. It becomes active by a spec amendment when the user's endpoint exists; Security R-01 to R-03 must be revisited then.

**Delivery (user decision, 2026-09-26, deferred):** each form submits through the server to an endpoint whose URL comes from a **server-only environment variable** (never `NEXT_PUBLIC_`). Outcomes: env var unset → the Not configured banner (as in this release); **2xx** → Success; 4xx with field errors → Field error; any other response, timeout or network error → Failed. The request/response shape is Pre-Contract, defined by the Architect at that time:
- Contact message: `{ name, email, topic, travelDate?, message }`
- Collaboration request: `{ name, company, collaborationType, email, idea }`

Not optimistic. Field length limits and anti-spam are Security's call. The helper line "Uso tu email solo para responderte." returns.

| State | What the Visitor sees | Rules |
|---|---|---|
| **Submitting** | Button label "Enviando…", same width as before (min 220px), `aria-busy`; fields read-only with `surface-1` fill and `ink-muted` text. | No double submit. No spinner beyond the button. |
| **Success** | The form is replaced in place by a block between two 2px ink rules: H2 "¡Recibido!" with the train marker + the page-specific confirmation naming the email typed (§ Form copy). Focus moves to the H2, and the block is announced politely. | Only on a confirmed 2xx. Never simulated. |
| **Failed** | A banner above the form: "No se pudo enviar tu mensaje." + "Revisá tu conexión y probá de nuevo, o escribime a hola@vamosany.com. Lo que escribiste sigue acá." Values kept. Button reads "Probar de nuevo". Announced as an alert. | Never exposes internals. |

Motion: M8 connected items. Acceptance criteria for that release, to renumber then:
- C1. Valid submit: "Enviando…", width kept, disabled with `aria-busy`, fields read-only; a second click sends nothing.
- C2. On 2xx: "¡Recibido!" replaces the form (marker sweeps in; reduced: static) with the typed email; focus on the H2; on Contacto, "preguntas frecuentes" links to `/preguntas-frecuentes`.
- C3. On non-2xx, timeout or network error: the Failed banner, values kept, "Probar de nuevo" resubmits.
- C4. No path shows "¡Recibido!" without a 2xx.

## Amendment Log

**v1.1 (2026-09-26)**
- Scope: no backend connection in this release. The forms' states are now Idle, Field error, Not configured, No JS and Before hydration. Submitting, Success and Failed moved to § When the Backend Is Connected (copy kept). ACs 41–45 rewritten; AC 44 is Security G1 R-01. Data Dependencies has no writes. The success metric starts with the backend.
- Helper line hidden until the backend is connected (honesty).
- Contacto channel list: stacked in the 200px notes column at ≥860, so the address doesn't break mid-word; break only after "@" as a last resort (Engineer finding a).
- "Otras formas de encontrarme" drops the md's colon on purpose (finding b).
- H1s "Sobre mí" and "Colaboraciones" retagged [md-derived] (finding c).
- Engineer finding d, confirmed: the Contacto main column is only empty while the form UI isn't built. Once it is, the form (JS) or the no-JS block always fills it.
- Engineer finding e, confirmed: the middle dots in the partner lines "Mona Cases · mayo 2023" and "Efe Hus · Flor" are intended ([mock], accepted with the mockup). They join a partner name to a detail and are not a meta string.
- DDR-0004 (Accepted, immutable) cites ACs "42–43" for the success and failed motion. Those now map to C2–C3 above; the not-configured banner motion is AC 41.

---

## Design Handoff Checklist

| Item | Where |
|---|---|
| Spec with every section filled | This file (status: Ready for /plan) |
| Screen inventory + routes + navigation per breakpoint | § Screens & Surfaces, § Menu IA |
| States matrix per screen | § States Matrix, § Form States |
| Copy deck keyed by screen | § Content & Copy |
| Motion intent per screen, incl. reduced motion | § Motion Intent (M1–M9) |
| Token additions with reasons | § Token Proposals |
| DDRs referenced | DDR-0002, DDR-0003, DDR-0004 (Proposed; must be Accepted before /plan) |
