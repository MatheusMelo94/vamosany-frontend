# Auditoria de conformidade: Vamos a NY landing × `frontend-architecture-conventions.md`

- **Data:** 2026-09-23
- **Autor:** Frontend Architect (agent) — aprovação exclusiva do usuário
- **Projeto:** `mobbin-front-text` (remote `MatheusMelo94/vamosany-frontend`), branch `fix/nav-auth-buttons`, commit `29f5546`
- **Conventions de referência:** `.claude/conventions/frontend-architecture-conventions.md` e `.claude/conventions/design-conventions.md` (ambas *Last updated 2026-09-22*)
- **Escopo:** `app/`, `components/`, `app/globals.css`, `next.config.ts`, `tsconfig.json`, `package.json`, `postcss.config.mjs`, `.gitignore`, `README.md`, `public/`. Ignorados: `node_modules/`, `.next/`.
- **Método:** leitura integral do source (23 arquivos, ~4.900 linhas), greps de padrões, inspeção do lockfile e das versões instaladas. Nenhum código foi alterado, nenhum comando de build/install foi executado.
- **Status do projeto:** legado, em produção. As conventions descrevem o alvo; este documento transforma cada diferença em (a) um ADR proposto ou (b) uma migração incremental. Nada fica implícito.
- **Decisões do usuário já tomadas (2026-09-23), incorporadas neste relatório:**
  1. **O projeto mantém npm** — não há migração para pnpm. A deviation vira ADR-0005 (aceitar).
  2. **Produção roda na Vercel** — Docker/`output: 'standalone'`/deploy workflows são tratados no ADR-0005 (aceitar Vercel-only).
  3. **Nenhuma mudança no design da landing em produção** — toda deviation que toque output visual ou de motion é (a) aceita por ADR (ADR-0006) ou (b) migrada preservando o resultado renderizado. Consequência prática: **T-04 (baseline de screenshots Playwright em 360/768/1280, com e sem reduced-motion) é pré-requisito das Fases 2–4**, e todo PR dessas fases compara contra o baseline.

> **Onde estão os artefatos.** As conventions não prescrevem local para auditorias (o `docs/` canônico tem `adr/ tech-design/ specs/ ddr/ security/ qa/`). Este relatório fica em `docs/architecture/` conforme pedido; os ADRs seguem a convention em `docs/adr/NNNN-slug.md`.

---

## 1. Sumário executivo

O projeto é uma landing page de rota única, sem leitura ou escrita de dados, construída sobre a stack correta (Next 15.5 App Router, React 19, TS 5.9 `strict`, Tailwind 4 CSS-first, GSAP 3.15, `next/font`, `next/image`). O que existe está, em geral, bem feito: Server Components por padrão, `'use client'` apenas onde há interação, motion desativada sem JS e sob `prefers-reduced-motion`, tokens em `@theme`, commits convencionais. As deviations concentram-se em quatro áreas:

1. **Ferramental e baseline ausentes** — sem ESLint/Prettier, sem Vitest/Playwright, sem `@gsap/react`, sem `cn()`, sem CI, runtime Node não fixado (npm e hosting Vercel-only são deviations aceitas por decisão do usuário, ADR-0005).
2. **Mecanismo de motion** — GSAP em `useEffect` (não `useGSAP`), plugins registrados em três lugares, sem `gsap.matchMedia()`, controlador headless global por data-attributes, durações hard-coded, loops e pin/scrub sem spec de motion intent.
3. **Estrutura e estilo** — `components/` plano com múltiplos componentes por arquivo, arbitrary values e hex fora de `globals.css`, classes concatenadas por template literal, vocabulário de tokens divergente do prescrito.
4. **Lacunas funcionais** — formulários de newsletter sem Server Action (postam em `#`), `not-found.tsx`/`global-error.tsx` ausentes, `metadataBase` placeholder, drawer mobile sem focus trap.

**Contagem:** 31 deviations. Recomendação: **6 ADRs** (aceitar) cobrindo 10 deviations (D-01, D-06, D-07, D-09, D-14, D-18, D-20, D-21, D-22, D-24), **21 migrações** incrementais em 24 tasks, todas *render-preserving*; 4 itens de nível de design (X-1..X-4) ficam como estão por decisão do usuário e são formalizados em DDR pelo UX Strategist.

### Tabela-resumo

| ID | § da convention | Deviation | Rec. | Artefato |
|----|-----------------|-----------|------|----------|
| D-01 | Stack Baseline | Package manager npm (`package-lock.json`) em vez de pnpm | a | ADR-0005 |
| D-02 | Stack Baseline / Animation | `@gsap/react` ausente; GSAP roda em `useEffect` | b | T-05 |
| D-03 | Stack Baseline | Sem ESLint 9 flat config, `eslint-config-next`, `jsx-a11y`, Prettier, `prettier-plugin-tailwindcss`; script `next lint` sem ESLint instalado | b | T-02 |
| D-04 | Stack Baseline | Sem Vitest/RTL/jest-dom/jsdom, sem Playwright/axe, sem `tests/` | b | T-03, T-04 |
| D-05 | Stack Baseline / Styling | Sem `clsx`+`tailwind-merge` (`cn()`); 21 pontos concatenam classes por template literal | b | T-06 |
| D-06 | Stack Baseline | Icon set SVG próprio em vez de `lucide-react` | a | ADR-0001 |
| D-07 | Stack Baseline / Data Fetching / Auth / Error Handling | Sem camada de dados (`lib/api/`, zod schemas, MSW, `openapi-typescript`, `server-only`, `lib/api/errors.ts`, `session.ts`) | a | ADR-0001 |
| D-08 | Stack Baseline | Runtime Node não fixado (sem `engines`, sem `.nvmrc`; ambiente roda Node 24.16) vs Node 22 LTS | b | T-07 (+ Q2) |
| D-09 | Stack Baseline / Multi-target Deployment | Sem `output: 'standalone'`, Dockerfile, `run-local.sh`, `.github/workflows`, deploy config | a (Docker/deploy) + b (CI, `run-local.sh`) | ADR-0005, T-20, T-21 |
| D-10 | App Router Layout | `components/` plano; sem `ui/`, `layout/`, `features/`, `lib/`, `hooks/`, `types/`, `tests/`; `ui.tsx` com 5 componentes, `icons.tsx` com 14 | b (+ a para icons) | T-08, ADR-0001 |
| D-11 | Component Model | Seções inteiras marcadas `'use client'` por um estado de tab/scroll (`navbar`, `sample-day`, `planning-timeline`, `reviews`); dados estáticos vão para o bundle client | b | T-10 |
| D-12 | Component Model | Props inline em vez de `type Props`; `Readonly<{…}>` no layout | b | T-09 |
| D-13 | Routing, Layouts & Boundaries / Error Handling | `app/not-found.tsx` e `app/global-error.tsx` ausentes | b | T-11 |
| D-14 | Routing (hand-rolled `<head>`) / Animation | Inline script `dangerouslySetInnerHTML` no `<head>` que adiciona `.gsap` ao `<html>` | a | ADR-0002 |
| D-15 | Routing (navigation) | `<a>` para âncoras internas em 4 pontos; resto usa `next/link` | b | T-12 (+ Q8) |
| D-16 | Forms & Validation | Dois formulários de newsletter com `action="#" method="post"`, sem Server Action, sem zod, sem `useFormStatus`, sem `role="alert"`; markup duplicado | b (Pre-Contract) | T-13 (+ Q4) |
| D-17 | Styling | Arbitrary values (`max-w-[1200px]`, `shadow-[…]`, `text-[0.8125rem]`, `w-[19rem]`…) e hex cru (`#ffd800`, `#080a0b`, `#eeeeea`) fora de `globals.css`; 42 usos da paleta default (`white`) | b | T-14 |
| D-18 | Styling / design-conventions § Design Tokens | Vocabulário de tokens (`brand`, `canvas`, `surface-1..4`, `hairline`, `ink-subtle`…) diverge do prescrito (`accent`, `surface`, `line`, `ink-muted`, `focus`…); sem `--color-focus`, `--z-*`, `--container-*`; tokens duplicados; sem `@custom-variant dark` | a | ADR-0004 (+ Q7) |
| D-19 | Animation | Plugins registrados em 3 módulos; sem `lib/gsap.ts` | b | T-05 |
| D-20 | Animation | Sem `gsap.matchMedia()`; reduced-motion via gate `.gsap` + `matchMedia` direto em `hero-ring.tsx` | a + b | ADR-0002, T-16 |
| D-21 | Animation | Initial state via `.gsap [data-reveal]{opacity:0}` em vez de classe token `opacity-0` + `useGSAP` | a | ADR-0002 |
| D-22 | Animation / Component Model | Controlador de motion headless (`ScrollEffects`, `Overscroll`) consulta o `document` inteiro por data-attributes e muta inline styles das seções | a + b | ADR-0003, T-05, T-18b |
| D-23 | Animation / design-conventions § Motion Principles | Durações e easings hard-coded (0.45, 0.4, 1.2, 44 s, 46 s…) e `CustomEase` recriado de string; tokens `--duration-*`/`--ease-default` existem mas o GSAP não os lê | b | T-17 |
| D-24 | Animation / design-conventions § Motion Principles | Loops infinitos (marquee, ring), pin+scrub (overscroll), scrub (band), reveal em toda seção, timeline do hero > 800 ms com stagger > 60 ms — sem spec de motion intent | a | ADR-0006 (+ T-18 retro-spec documental, T-18b) |
| D-25 | Animation / hygiene | Dead code: `components/hero-ribbon.tsx`, CSS `.hero-ribbon…` (`globals.css:296-383`), `@utility panel-edge`, `StatusBadge` | b | T-15 |
| D-26 | Performance Budgets | `<picture><img>` nativo no hero ring (24 cards, `700×1000`, JPG+WebP duplicados) em vez de `next/image`; `BrandLogo` com `priority` em 3 instâncias; logo em PNG 1196×395 | b | T-19 |
| D-27 | Performance Budgets | First Load JS não medido; GSAP core + ScrollTrigger + SplitText + CustomEase no bundle inicial sem `next/dynamic` | b | T-19b |
| D-28 | TypeScript Rules | Sem `noUncheckedIndexedAccess`/`noImplicitOverride`; 2 non-null assertions; index access sem guard; sem script `typecheck`; componentes exportados sem return type | b | T-07b |
| D-29 | Configuration & Environment | Sem `lib/env.ts`, sem `.env.example`; `metadataBase` hard-coded em `https://vamosany.example.com` | b | T-23 |
| D-30 | Accessibility (engineering rules) | Drawer mobile sem focus trap/restore, sem Escape; `role="listbox"` em botões sem navegação por setas; `aria-label` em `<span>`/`<div>` sem role | b | T-24 |
| D-31 | Documentation / Repository Hygiene | README sem env table, routes table, test commands, Docker; sem `CLAUDE.md`; `.gitignore` incompleto; 37 MB de JPG/PNG untracked na raiz + 3 PNG tracked duplicando `public/`; `DESIGN.md` (sistema anterior) e `Melius page.png` na raiz; `package.json.name = "deel-landing"` | b | T-25, T-26 |

**Conforme (sem deviation):** App Router only; `next.config.ts` em TS; Tailwind 4 via `@tailwindcss/postcss` sem `tailwind.config.js` (`postcss.config.mjs:2`); `@import "tailwindcss"` + `@theme` no topo de `globals.css:1-13`; `@apply` ausente em componentes; `next/font` com `display: 'swap'` e subsets (`app/layout.tsx:7-12`); `metadata` export em vez de `<head>` manual para meta (`app/layout.tsx:14-19`); `next/image` com `sizes` explícito em todas as fotos de conteúdo; `alt` presente em toda imagem (decorativas com `alt=""`); labels visíveis ou `sr-only` ligados por `htmlFor`; `focus-visible` nunca removido (`globals.css:93-96`); responsivo mobile-first; `app/page.tsx` só compõe seções; sem `middleware.ts`, sem `app/api/` (nada os exige); path alias `@/` (`tsconfig.json:17`); branch `fix/…` e conventional commits (`fix(nav):`, `feat(dashboard):`); `.gitignore` cobre `.env*.local`, `.next`, `node_modules`; `loading.tsx`/`error.tsx` **não** são exigidos (a rota não faz fetch).

---

## 2. Deviations em detalhe

Cada item: o que a convention diz → o que o repo faz (arquivo:linha) → impacto → recomendação. Tasks (T-xx) estão consolidadas no § 4.

### D-01 · Package manager npm em vez de pnpm
- **Convention:** § Stack Baseline — "pnpm (lockfile committed; never mix managers)".
- **Atual:** `package-lock.json` (57 KB) na raiz; `README.md:17-21` instrui `npm install`/`npm run dev`; nenhum `pnpm-lock.yaml`.
- **Impacto:** baixo em runtime; em processo, os comandos das conventions (`pnpm typecheck && pnpm lint && pnpm test`, `pnpm build`) passam a ser lidos como `npm run typecheck && npm run lint && npm test`, `npm run build`; CI usa `npm ci`.
- **Recomendação:** **(a) ADR-0005** — decisão do usuário: o projeto mantém npm. Condições no ADR: `package-lock.json` sempre commitado, `npm ci` em CI/Vercel, nunca misturar managers (`.npmrc` com `engine-strict`), README e `CLAUDE.md` declaram npm.

### D-02 · `@gsap/react` ausente; GSAP em `useEffect`
- **Convention:** § Stack Baseline ("GSAP 3.13+ with `@gsap/react` (`useGSAP`)"); § Version Notes ("`useGSAP()` … is the only sanctioned way"); § Animation ("Never `useEffect` + raw `gsap` calls").
- **Atual:** `package.json:12` só `gsap ^3.15.0`; `node_modules/@gsap` inexistente. `useEffect` + `gsap` em `components/scroll-effects.tsx:19`, `components/overscroll.tsx:17`, `components/hero-ring.tsx:51`, `components/hero-ribbon.tsx:55`. O projeto mitiga manualmente com `gsap.context()` + `ctx.revert()` (`scroll-effects.tsx:34,308`; `hero-ribbon.tsx:59,69`) e cleanup explícito (`hero-ring.tsx:117-124`), mas `overscroll.tsx` cria o context dentro de `document.fonts.ready.then(rAF)` (`overscroll.tsx:90-94`) — sob StrictMode o revert e o setup adiado podem cruzar.
- **Recomendação:** **(b) T-05** — instalar `@gsap/react`, trocar os quatro `useEffect` por `useGSAP(() => {…}, { scope, dependencies })`. Combinar com D-19.

### D-03 · Lint e format ausentes
- **Convention:** § Stack Baseline — ESLint 9 flat (`eslint.config.mjs`) + `eslint-config-next` + `eslint-plugin-jsx-a11y`; Prettier + `prettier-plugin-tailwindcss` (`tailwindStylesheet: "./app/globals.css"`); § Accessibility — "`eslint-plugin-jsx-a11y` runs in CI".
- **Atual:** nenhum arquivo de config; `package.json:17-24` sem ESLint/Prettier; `package.json:9` declara `"lint": "next lint"`, que hoje pediria para instalar o ESLint interativamente.
- **Recomendação:** **(b) T-02**. Nota: com Next 15.5, `next lint` está deprecated em favor de `eslint .` — o script deve chamar o ESLint diretamente.

### D-04 · Sem testes
- **Convention:** § Stack Baseline (Vitest + RTL + jest-dom + jsdom; Playwright + `@axe-core/playwright`); § App Router Layout (`tests/e2e`, `tests/fixtures`, `tests/setup.ts`); § Engineering Workflow (TDD).
- **Atual:** nada instalado; nenhum `tests/`, nenhum `__tests__/`, nenhum config.
- **Recomendação:** **(b) T-03** (Vitest/RTL: `Button`, `SectionHeading`, tabs de `SampleDay`/`PlanningTimeline`, `Navbar` open/close/Escape) e **T-04** (Playwright: jornada única da landing, `@axe-core` em 360/768/1280, `prefers-reduced-motion` emulado verificando que tudo renderiza visível). MSW não é necessário (ADR-0001).

### D-05 · Sem `cn()`; classes concatenadas
- **Convention:** § Stack Baseline (`clsx` + `tailwind-merge`); § Styling — "Class composition goes through `cn()`; conditional classes are never string-concatenated".
- **Atual:** template literals em `components/ui.tsx:45,79,136,151`; `navbar.tsx:231,239,266,270,290,305,308,348,435`; `dashboard-preview.tsx:85,186,325`; `sample-day.tsx:111`; `services.tsx:74-76`; `planning-timeline.tsx:75,95`; `reviews.tsx:63`; `hero-ribbon.tsx:21`. Em `ui.tsx:45` o `className` externo é apenas anexado — sem `tailwind-merge`, `className="border-white bg-transparent"` em `cta.tsx:38` depende da ordem do CSS gerado para vencer `border-ink bg-brand` do variant.
- **Recomendação:** **(b) T-06** — `lib/utils.ts` com `cn()`; substituir os 21 pontos; regra ESLint opcional para template literal em `className`.

### D-06 · Icon set próprio em vez de `lucide-react`
- **Convention:** § Stack Baseline — "`lucide-react` (icons)".
- **Atual:** `components/icons.tsx:1-169`, 13 ícones SVG desenhados à mão (`viewBox 0 0 20 20`, `currentColor`, `aria-hidden`) + `CountryTag`; mais `ArrowRight` em `ui.tsx:106-118` e dois chevrons inline em `navbar.tsx:237-252,271-272`.
- **Impacto:** zero dependência, coerente com o design system ("geometry slightly raw", `vamosany-design-system.md:786-790`). Lucide traria um look de kit genérico, contra `design-conventions.md § Anti-Patterns`.
- **Recomendação:** **(a) ADR-0001** aceita o icon set próprio como registry único (`components/ui/icons.tsx`), com condições (`IconProps` padrão, `aria-hidden`, `currentColor`, chevrons inline do navbar migram para o registry).

### D-07 · Sem camada de dados
- **Convention:** § Data Fetching & Mutations, § Authentication & Session, § Error Handling, § App Router Layout (`lib/api/`, `lib/api/schemas/`, `lib/api/errors.ts`, `lib/api/session.ts`, `types/` gerados por `openapi-typescript`, MSW em `tests/fixtures`).
- **Atual:** nenhuma leitura ou escrita de dados; todo conteúdo é constante em módulo (`navbar.tsx:11-160`, `services.tsx:4-58`, `sample-day.tsx:7-78`, `reviews.tsx:6-35`, `blog.tsx:4-36`, `dashboard-preview.tsx:17-71`…). Nenhum secret, nenhum `process.env`.
- **Recomendação:** **(a) ADR-0001** aceita a ausência enquanto a landing não tiver leitura/escrita; gatilho de supersessão: primeira dependência de dados (o newsletter de D-16 é o primeiro candidato).

### D-08 · Runtime Node não fixado
- **Convention:** § Stack Baseline — Node.js 22 LTS.
- **Atual:** sem `engines` em `package.json`, sem `.nvmrc`/`.node-version`; o ambiente de auditoria roda Node 24.16.0 (`node -v`).
- **Recomendação:** **(b) T-07** — `engines.node` + `.nvmrc`. Versão exata depende de Q2 (22 vs 24 — Node 24 é Active LTS desde out/2025; Node 22 entra em maintenance em out/2026).

### D-09 · Sem containerização, CI e deploy config
- **Convention:** § Stack Baseline (Docker, `output: 'standalone'`); § Multi-target Deployment (`run-local.sh`, `Dockerfile`, deploy config, `ci.yml`/`deploy-staging.yml`/`deploy-prod.yml`).
- **Atual:** `next.config.ts:3` é `{}`; nenhum dos arquivos existe; `.github/` ausente. `docs/devops/` foi criado (vazio) durante esta auditoria — indício de trabalho paralelo do DevOps Engineer. Produção roda na **Vercel** (decisão do usuário).
- **Recomendação:** dividida.
  - **(a) ADR-0005** aceita hosting **Vercel-only**: sem `Dockerfile`, sem `output: 'standalone'`, sem `deploy-staging.yml`/`deploy-prod.yml` (a integração Git da Vercel faz preview por PR e produção por merge). A convention exige multi-target "from day one"; o ADR registra a exceção e o gatilho de revisão (necessidade de segundo alvo).
  - **(b) T-20** (`run-local.sh` com `npm ci && npm run dev`) e **T-21** (`.github/workflows/ci.yml`: typecheck + lint + test + build + e2e em todo push — a Vercel não roda testes). Owner: Frontend DevOps Engineer; `vercel.json` só se necessário (a Vercel detecta Next.js).

### D-10 · Estrutura de pastas e "one component per file"
- **Convention:** § App Router Layout (árvore com `components/ui`, `components/layout`, `features/<feature>/`, `lib/`, `hooks/`, `types/`, `tests/`, `docs/`); "One component per file; named exports".
- **Atual:** `components/` plano com 20 arquivos: primitives (`ui.tsx`, `icons.tsx`), shell (`navbar.tsx`, `footer.tsx`), seções (12) e controladores de motion (2). `ui.tsx` exporta `Button` (:36), `SectionHeading` (:62), `ArrowRight` (:106), `BrandLogo` (:122), `StatusBadge` (:142, não usado). `dashboard-preview.tsx` define `Meter` (:73), `StatusPill` (:81), `MapSketch` (:98) — privados, aceitável. Sem `lib/`, `features/`, `hooks/`, `types/`, `tests/`. Imports relativos ficam em um nível (`./ui`) — conforme.
- **Recomendação:** **(b) T-08** — alvo:
  ```
  app/{layout,page,not-found,global-error}.tsx
  components/ui/{button,section-heading,brand-logo,icons}.tsx
  components/layout/{navbar,footer}.tsx
  features/landing/components/{hero,hero-ring,neighborhood-ticker,…,cta}.tsx
  features/landing/motion/{scroll-effects,overscroll,attributes}.ts(x)
  features/newsletter/{components/newsletter-form.tsx,actions.ts,schemas.ts}
  lib/{gsap,motion,utils,env}.ts
  ```
  `icons.tsx` como registry único fica coberto por ADR-0001. Depende de Q5 (se a landing crescer para multi-rota, usar route group `(marketing)`).

### D-11 · `'use client'` em seções inteiras
- **Convention:** § Component Model — "Add `'use client'` only at the interactive leaf"; § Performance — dados estáticos não deveriam ir ao bundle client.
- **Atual:** `navbar.tsx:1` (464 linhas; `NAV` com 150 linhas de conteúdo estático em `:11-160`); `sample-day.tsx:1` (78 linhas de `DAYS` para um `useState` de tab, `:81`); `planning-timeline.tsx:1` (`TRACKS`, `useState` `:46`); `reviews.tsx:1` (`useRef` só para dois botões de scroll, `:38-44`). `hero.tsx` está correto: seção server, `HeroRing` leaf client.
- **Recomendação:** **(b) T-10** — extrair leaves: `Tabs` (recebe painéis como `children`/`ReactNode`, serializáveis), `ScrollButtons` (recebe `targetId`), `NavMenu`/`MobileDrawer` (recebem `NAV` como prop serializável de um módulo server `features/landing/nav-data.ts`). As seções voltam a ser Server Components.

### D-12 · Tipagem de props
- **Convention:** § Component Model — "Props are declared with `type Props = { … }`; no `React.FC`. Exported components have explicit prop types."
- **Atual:** `app/layout.tsx:23` usa `Readonly<{ children: React.ReactNode }>` inline; `ui.tsx:68-75,125-128,145-148`, `dashboard-preview.tsx:74,82`, `hero-ribbon.tsx:19` usam object types inline. `hero-ring.tsx:9-17` e `ui.tsx:8-16` estão conformes. Nenhum `React.FC`.
- **Recomendação:** **(b) T-09** — normalizar para `type Props`; adicionar return types (`: ReactElement`/`JSX.Element`) por D-28. Executar junto com T-08.

### D-13 · `not-found.tsx` e `global-error.tsx` ausentes
- **Convention:** § Routing — "`not-found.tsx` at root"; § Error Handling — "`global-error.tsx` exists at the root for layout-level failures".
- **Atual:** `app/` contém apenas `layout.tsx`, `page.tsx`, `globals.css`. Qualquer URL inválida cai no 404 default do Next, fora do design system.
- **Recomendação:** **(b) T-11** — `app/not-found.tsx` (server, com `Navbar`/`Footer` e CTA de volta) e `app/global-error.tsx` (`'use client'`, copy genérica, botão retry). `loading.tsx`/`error.tsx` não são exigidos: a rota não faz fetch. São **superfícies novas**, não alterações da landing: copy e layout vêm do UX Strategist antes da implementação.

### D-14 · Inline script no `<head>` (`dangerouslySetInnerHTML`)
- **Convention:** § Routing — "Metadata via `generateMetadata`/`metadata` export — never hand-rolled `<head>` tags"; § Animation — initial state via classe token + `useGSAP`; reduced-motion via `gsap.matchMedia()`.
- **Atual:** `app/layout.tsx:26-35` injeta `<script>` bloqueante que adiciona `gsap` ao `<html>` quando há JS e `prefers-reduced-motion` não está ativo. `globals.css:262-285` esconde alvos de reveal só sob `.gsap`; os módulos de motion saem cedo sem a classe (`scroll-effects.tsx:20`, `overscroll.tsx:18`, `hero-ribbon.tsx:57`).
- **Impacto:** mecanismo único, sem flash, sem JS renderiza tudo, reduced-motion custa zero JS. Custos: script inline exige nonce/hash quando houver CSP (`frontend-security-conventions.md`); mudança de preferência em sessão não é honrada; regra da convention sobre `<head>` visa metadata, mas o texto é absoluto.
- **Recomendação:** **(a) ADR-0002** aceita o gate com condições (nonce quando CSP chegar; todo módulo respeita o gate — ver D-20; avaliar `@media (scripting)` como substituto sem inline script em T-16b).

### D-15 · `<a>` para âncoras internas
- **Convention:** § Routing — "Navigation uses `next/link` and `next/navigation`; `<a>` is for external links only".
- **Atual:** `blog.tsx:74,102`, `how-it-works.tsx:60`, `included.tsx:41` usam `<a href="#…">`; todo o resto (inclusive `Button` com `href`, `ui.tsx:47-52`) usa `Link` para os mesmos fragmentos. Inconsistência, não risco.
- **Recomendação:** **(b) T-12** — unificar em `Link` (4 substituições). Sugestão de esclarecimento da convention em Q8 (fragment links same-document são legítimos em `<a>`; a convention deveria dizer qual dos dois o time prefere).

### D-16 · Formulários de newsletter sem Server Action (Pre-Contract)
- **Convention:** § Forms & Validation (schema zod em `features/<feature>/schemas.ts`, `<form action={serverAction}>`, `useFormStatus`, `aria-describedby`/`aria-invalid`, `role="alert"`); § Data Fetching & Mutations (uma Server Action por mutação, result union).
- **Atual:** `components/cta.tsx:44-62` e `components/footer.tsx:146-178`: `action="#" method="post"`, `required` nativo apenas, sem estado pending, sem região de erro, sem confirmação; markup duplicado com estilos diferentes. Em produção, submeter recarrega a página em `/#`. Copy "Join" em `cta.tsx:61` viola `design-conventions.md § UX Writing` (CTA deve dizer o que acontece).
- **Recomendação:** **(b) T-13 (Pre-Contract)** — `features/newsletter/schemas.ts` (zod: email), `actions.ts` (`subscribeToNewsletter`, result union, sem throw), `components/newsletter-form.tsx` (client leaf com `useActionState` + `useFormStatus`, `aria-live`, erro inline), usado em ambos os lugares. Sem contrato de backend: MSW handler em `tests/fixtures/msw/handlers/newsletter.ts` e **Contract Request** ao usuário (Q4: qual provider — Mailchimp/Resend/Buttondown/backend próprio?). **Restrição de design:** o estado idle dos dois formulários permanece pixel-idêntico ao atual (mesmo markup visual, mesmas classes); os estados *pending*/*error*/*success* são **novos** (hoje não existem) e precisam de copy e tratamento visual do UX Strategist antes de entrar — até lá, T-13 pode ser entregue só com schema + action + testes, sem alterar o render.

### D-17 · Arbitrary values e hex fora de `globals.css`
- **Convention:** § Styling — "Raw hex, raw px, and arbitrary values (`bg-[#…]`, `w-[317px]`) are forbidden outside `globals.css` — a one-off needs a code comment justifying it."
- **Atual (sem comentário justificando):**
  - `navbar.tsx:213` — `max-w-[1200px]` (já existe `container-ds`/1200 px em `globals.css:103`), `border-ink/[0.08]`, `bg-white/55`, `shadow-[0_8px_30px_rgba(0,0,0,0.06)]` (≈ `--shadow-soft`, `globals.css:59`); `:278`, `:332`, `:393` — `shadow-[0_18px_50px_rgba(0,0,0,0.08)]`, `top-[calc(100%+0.75rem)]`, `top-[calc(1rem+3.5rem+0.5rem)]`.
  - `ui.tsx:31` — `text-[0.8125rem]`; `icons.tsx:166` — `text-[0.5625rem]`.
  - `dashboard-preview.tsx:156` — `max-w-[1400px]`, `min-h-[calc(100vh-3rem)]`, `shadow-[0_24px_60px_rgba(0,0,0,0.08)]`; `:168,251` — `grid-cols-[240px_1fr]`, `lg:grid-cols-[1.3fr_1fr]`; `:188` — `shadow-[inset_0_0_0_1px_var(--color-hairline)]`; `:108-121` — hex cru em SVG (`#fff`, `#eeeeea`, `#e1e6ea`, `#080a0b`, `#ffd800`) onde `currentColor`/`var(--color-*)` funcionam.
  - `reviews.tsx:78` — `w-[19rem] sm:w-[24rem]`; `sample-day.tsx:122,131,145` — `lg:grid-cols-[1.1fr_1fr]`, `grid-cols-[4.5rem_1fr_auto]`, `lg:min-h-[28rem]`; `blog.tsx:64,97` — `group-hover:scale-[1.04]`; `cta.tsx:9` — `w-[130%]`; `planning-timeline.tsx:88` — `inset-x-[16.666%]`; `neighborhood-ticker.tsx:21-25` — `maskImage` em `style` inline.
  - Paleta default do Tailwind: 42 usos de `white`/`black` (`text-white`, `bg-white/10`, `border-white/25`…) que não são tokens do projeto (`--color-inverse-ink` existe em `globals.css:45`).
- **Recomendação:** **(b) T-14** — tokenizar (`--shadow-nav`, `--container-page`, `--text-2xs`, `--color-glass`…) ou justificar com comentário; desligar a paleta default com `--color-*: initial` dentro de `@theme` e mapear `white`→`inverse-ink`/`canvas`. Executar após ADR-0004 (define o vocabulário).

### D-18 · Vocabulário de tokens divergente; sem dark variant
- **Convention:** § Styling + `design-conventions.md § Design Tokens` (nomes semânticos `surface`, `surface-raised`, `ink`, `ink-muted`, `line`, `accent`, `accent-ink`, `focus`, `success/warning/danger`, `--font-body/--font-display`, `--radius-sm/md/lg/full`, `--shadow-1..3`, `--ease-out-quart/--ease-in-out-quart`, `--container-prose/page`, `--z-*`; `@custom-variant dark`).
- **Atual:** `globals.css:13-69` — `brand/brand-hover/brand-focus/brand-secure/on-brand`, `canvas/surface-1..4`, `hairline/hairline-strong/hairline-tertiary`, `ink/ink-muted/ink-subtle/ink-tertiary`, `inverse-canvas/inverse-ink`, `success` (= ink), `radius-xs..xxl`, `shadow-soft/card`, `duration-fast/base/slow` (120/180/300 ms), `ease-default`, `animate-marquee`. Sem `--color-focus` (focus ring usa `ink`, `globals.css:93-96`), sem `--z-*` (z-index literal `z-50` em `navbar.tsx:211`, inline `zIndex` em `overscroll.tsx:27`), sem `--container-*` (utility `container-ds`, `globals.css:100-109`). Duplicatas com o mesmo valor: `surface-2`=`surface-3`, `surface-1`=`surface-4`, `hairline`=`hairline-tertiary`, `ink-muted`=`ink-subtle`, `brand-hover`=`brand-focus`. Nomes herdados do sistema anterior (`globals.css:8-10`, `README.md:69-74`). Light-only; sem `@custom-variant dark`.
- **Recomendação:** **(a) ADR-0004** aceita o vocabulário Vamos a NY como dicionário do projeto (com tabela de mapeamento para o vocabulário da convention), exige consolidação das duplicatas (grep de zero usos, per `design-conventions.md § Design Tokens`) e adição de `--color-focus`/`--z-*`. Dark mode: DDR de deferimento (Q7) — decisão de design, não de arquitetura.

### D-19 · Plugins registrados em três módulos
- **Convention:** § Animation — "Plugins register once in `lib/gsap.ts`; client modules import `gsap` from there".
- **Atual:** `scroll-effects.tsx:22` (`ScrollTrigger, CustomEase, SplitText`), `overscroll.tsx:19`, `hero-ring.tsx:66`; `CustomEase.create("ds", …)` em `scroll-effects.tsx:25` recria de string o `--ease-default` de `globals.css:66`.
- **Recomendação:** **(b) T-05** — `lib/gsap.ts` registra `useGSAP, ScrollTrigger, SplitText, CustomEase` e exporta `gsap`, `ScrollTrigger`, `SplitText`, `EASE_DEFAULT`, `EASE_ARRIVE`.

### D-20 · Sem `gsap.matchMedia()`; `hero-ring` fora do gate
- **Convention:** § Animation — "Every animation module declares reduced-motion behavior with `gsap.matchMedia()` … mandatory".
- **Atual:** nenhum módulo usa `gsap.matchMedia()`. Reduced-motion é honrado pelo gate `.gsap` (D-14) em três módulos, mas `hero-ring.tsx:57` consulta `window.matchMedia` diretamente e **não** checa o gate — funciona, porém é um segundo mecanismo. Sob reduced-motion o ring ainda executa JS para esconder o hemisfério traseiro (`hero-ring.tsx:58-63`), o que é correto (é `set`, não motion).
- **Recomendação:** **(a) ADR-0002** aceita o gate como substituto de `gsap.matchMedia()`; **(b) T-16** alinha `hero-ring.tsx` ao gate (mantendo o `set` estático como branch reduced-motion).

### D-21 · Initial state via CSS scoped em `.gsap`
- **Convention:** § Animation — "elements that animate in start hidden via a token class (`opacity-0`/`invisible`) and `useGSAP` (layout-effect timing) sets the tween".
- **Atual:** `globals.css:269-285` — `.gsap [data-reveal], .gsap [data-reveal-group] > *, .gsap [data-hero-copy], .gsap [data-heading-block] { opacity: 0 }`; `.gsap [data-sweep] { --train: 100% }`. Mesmo objetivo (sem flash), mais seguro sem JS.
- **Recomendação:** **(a) ADR-0002** (mesmo ADR de D-14 — é o mesmo mecanismo).

### D-22 · Controlador de motion headless por data-attributes
- **Convention:** § Animation — "GSAP runs only in client components, only inside `useGSAP(() => {…}, { scope: containerRef })`"; § Component Model — interatividade no leaf.
- **Atual:** `app/page.tsx:21-22` monta `<ScrollEffects />` e `<Overscroll />` (retornam `null`) que varrem o `document`: `[data-reveal]`, `[data-reveal-group]`, `[data-count]`, `[data-marquee]`, `[data-nav]`, `[data-sweep]`, `[data-pan-band]`, `[data-hero-copy]`, `[data-heading-block]` (`scroll-effects.tsx:36-303`) e `main > section` (`overscroll.tsx:21`). `Overscroll` muta inline styles das seções (`overscroll.tsx:24-28,39,61`) e depende da ordem do DOM. O contrato de atributos está só no `README.md:42-67`; um typo em `data-revael` falha silenciosamente. `SplitText` reescreve o DOM de headings renderizados no servidor (`scroll-effects.tsx:187-221,242-298`). Benefício real: 12 seções permanecem Server Components, zero JS por seção.
- **Recomendação:** **(a) ADR-0003** aceita o padrão com condições: `useGSAP` (T-05), contrato de atributos tipado em `features/landing/motion/attributes.ts`, Tech Design Doc `docs/tech-design/landing-motion.md` (T-18b — obrigatório pela convention § Tech Design Doc: "GSAP scene with more than one ScrollTrigger"), CLS medido (T-19b). Alternativa a avaliar em T-17b: CSS scroll-driven animations (`animation-timeline: view()`) para `data-reveal`/`data-reveal-group`/`data-sweep`, reduzindo a superfície GSAP a SplitText/pin/marquee.

### D-23 · Durações e easings hard-coded
- **Convention:** § Animation — "Durations and easings come from `design-conventions.md § Motion Principles`. Hard-coded magic numbers are a review finding."
- **Atual:** `scroll-effects.tsx:43` (0.45), `:63,65` (0.4, stagger 0.06), `:86` (1.2), `:105` (44 s), `:122,126` (0.18, 0.6), `:150-151` (1.0, delay 0.12), `:198` (0.8, stagger 0.09), `:204` (1.15, stagger 0.16), `:210,216` (0.5, 0.45), `:257,261` (0.35, 0.7/0.08), `:280,290`; `hero-ring.tsx:85` (`speed`), `:88-89` (0.6), `:109,112` (0.3, 0.8), `:113` (150 ms timeout); `overscroll.tsx:83-84` (0.6, 0.4); `hero-ribbon.tsx:64-66` (46 s, 1.4). Os tokens `--duration-*`/`--ease-default` (`globals.css:63-66`) existem, mas o GSAP nunca os lê; o comentário em `scroll-effects.tsx:12-13` afirma usar 180/300 ms, e os valores reais são 400–1 200 ms.
- **Recomendação:** **(b) T-17** — `lib/motion.ts` como fonte única (`DURATION = { fast: 0.12, base: 0.18, slow: 0.3, reveal: …, hero: … }`, `STAGGER`, `EASE`), consumido pelo GSAP; teste Vitest que lê `globals.css` e afirma paridade com `@theme`. Quais valores são corretos é decisão de design (D-24).

### D-24 · Motion sem spec: loops, pin/scrub, reveal em toda seção
- **Convention:** § Animation — "none may run on a loop without a purpose stated in the spec"; "pinning/scrubbing only when the spec's motion intent asks for it"; `design-conventions.md § Motion Principles` — "One hero moment; stagger ≤ 60 ms; ≤ 800 ms total"; "Fade-and-slide-up on every section … is the generic default — do not ship it"; "Spend expressiveness in one place per screen".
- **Atual:** marquee infinito (`globals.css:68,71-74`; `scroll-effects.tsx:103-108`), ring em rotação infinita (`hero-ring.tsx:85`), overscroll com `pin: true, scrub: true` em toda seção elegível (`overscroll.tsx:67-78`), band com `scrub: 0.4` (`scroll-effects.tsx:166-172`), `data-reveal`/`data-reveal-group` em praticamente todas as seções, `data-heading-block` em todo `SectionHeading` (`ui.tsx:78`). Timeline do hero: 0.8 s + stagger 0.09 → sweep 1.15 s + stagger 0.16 → quote 0.5 → actions 0.45/0.08 ≈ 2,5 s totais. Não há spec, constitution ou DDR que declare o motion intent. `vamosany-design-system.md:604-633` pede "subtle", "avoid heavy parallax".
- **Recomendação:** **(a) ADR-0006** — decisão do usuário: o design e a motion da landing em produção **não mudam**. O ADR aceita o output atual (loops, pin/scrub, reveals por seção, durações e staggers como implementados) como baseline de referência e obriga toda migração a preservá-lo (screenshots + vídeo/trace de scroll como oráculo). **T-18** continua, mas como retro-spec *documental* de Motion Intent (UX Strategist descreve o que existe e o porquê, sem cortes) para que o DDR formalize a exceção a `design-conventions.md § Motion Principles`; T-18b (Tech Design Doc) descreve o mecanismo. Nenhuma task de remoção deriva disto.

### D-25 · Dead code
- **Atual:** `components/hero-ribbon.tsx` (78 linhas, `'use client'`, nunca importado — `hero.tsx:1` importa só `HeroRing`); CSS `.hero-ribbon`, `.ribbon-*` em `globals.css:296-383` (88 linhas); `@utility panel-edge` (`globals.css:248-250`, sem uso); `StatusBadge` (`ui.tsx:142-161`, sem uso); `logos-01.png`, `logo-pretzel*.png` na raiz duplicando `public/`.
- **Recomendação:** **(b) T-15** — remover; o Tailwind 4 não emite utilities sem uso, mas o CSS de `.hero-ribbon` é global e vai para produção.

### D-26 · Imagens fora de `next/image`; `priority` repetido
- **Convention:** § Performance — "`next/image` for all raster images with explicit `sizes`"; § Accessibility — "Every `<img>` uses `next/image`".
- **Atual:** `hero-ring.tsx:154-163` — `<picture><source srcSet=…webp><img src=…jpg width={700} height={1000} loading=…>` para 24 cards de 200×282 px (110×156 no mobile); `public/img/ring/` mantém JPG + WebP (1,26 MB, ~40 % do `public/`). O comentário `:153` ("real `<img>` so lazy loading applies; WebP with JPEG fallback") descreve algo que `next/image` já faz (lazy default, formatos negociados, `sizes`). `BrandLogo` tem `priority` fixo (`ui.tsx:135`) e é renderizado 3× (`navbar.tsx:218`, `footer.tsx:125`, `dashboard-preview.tsx:172`) — 3 preloads do mesmo PNG 1196×395 (`public/logo-pretzel*.png`), que deveria ser SVG.
- **Recomendação:** **(b) T-19** — `next/image` com `sizes="(max-width: 480px) 110px, (max-width: 768px) 120px, 200px"` no ring (o `<img>` do `next/image` aceita `style`/`className`; `object-position` via CSS var continua funcionando); `priority` como prop opt-in só no navbar; converter logo para SVG; apagar os JPG do ring se `next/image` servir WebP/AVIF a partir de uma única fonte.

### D-27 · First Load JS não medido; sem `next/dynamic`
- **Convention:** § Performance — First Load JS ≤ 180 kB por rota; "`next/dynamic` for heavy client-only components (… GSAP-plugin-heavy scenes)".
- **Atual:** `scroll-effects.tsx:4-7` importa `gsap`, `CustomEase`, `ScrollTrigger`, `SplitText` estaticamente; `page.tsx:15,10` importa os controladores estaticamente; `hero-ring.tsx:4-5` idem. Sem medição registrada (a auditoria não executou `next build`).
- **Recomendação:** **(b) T-19b** — `pnpm build` e registrar First Load JS no README; se > 180 kB, `next/dynamic(() => import(…), { ssr: false })` para `ScrollEffects`, `Overscroll` e `HeroRing` (os três dependem do gate `.gsap`, que só existe no client). Medir LCP/CLS/INP no preview (overscroll com `pinSpacing: false` + `marginBottom` inline é candidato a CLS).

### D-28 · TypeScript
- **Convention:** § TypeScript Rules — `noUncheckedIndexedAccess`, `noImplicitOverride`; sem `!`; exported functions com return type; `pnpm typecheck` = `tsc --noEmit`.
- **Atual:** `tsconfig.json:2-18` só `strict`; `sample-day.tsx:82` e `planning-timeline.tsx:47` usam `!`; `sample-day.tsx:81` (`DAYS[1].id`), `planning-timeline.tsx:46` (`TRACKS[0].id`), `hero-ring.tsx:130` (`images[idx]`) quebrariam sob `noUncheckedIndexedAccess`; nenhum componente exportado declara return type; `package.json:5-10` sem `typecheck`. `target: ES2017` (`tsconfig.json:3`) é o default do `create-next-app`; conforme.
- **Recomendação:** **(b) T-07b** — ligar as flags, corrigir os 5 pontos (usar `DAYS[0]` com fallback tipado ou `as const` + tipo derivado), adicionar script.

### D-29 · Sem `lib/env.ts`; `metadataBase` placeholder
- **Convention:** § Configuration & Environment — `lib/env.ts` com zod; `.env.example` commitado; componentes nunca leem `process.env`.
- **Atual:** nenhum env; `app/layout.tsx:15` — `metadataBase: new URL("https://vamosany.example.com")` hard-coded com domínio de exemplo: em produção, OG/canonical apontam para `example.com`.
- **Recomendação:** **(b) T-23** — `lib/env.ts` (zod `client: { NEXT_PUBLIC_SITE_URL }`), `.env.example`, `metadataBase` lido de `env.client.NEXT_PUBLIC_SITE_URL`. Traz o zod para o projeto (compatível com ADR-0001, que aceita só a ausência da camada de *dados*).

### D-30 · Acessibilidade (engineering rules)
- **Convention:** § Accessibility — "Dialogs trap focus and restore it on close; Escape closes"; "Every interactive element is keyboard reachable and operable"; ARIA só para preencher lacunas.
- **Atual:** drawer mobile (`navbar.tsx:393-461`) não prende foco, não devolve foco ao botão, e o handler de Escape (`navbar.tsx:183-188`) fecha só mega menu e idioma, não o drawer; `document.body.style.overflow` mutado manualmente (`:176`). `role="listbox"` com `<button role="option">` (`navbar.tsx:276-303`, `:427-442`) sem navegação por setas nem `aria-activedescendant` — a semântica de listbox promete o que não entrega (um `menu`/botões simples seriam mais honestos). `aria-label="Five out of five"` em `<span>` sem role (`reviews.tsx:80`) não é anunciado de forma confiável; `aria-label` em `<div>` sem role (`dashboard-preview.tsx:157-158`) é ARIA inválido (`jsx-a11y` acusaria). Mega menu abre por `onMouseEnter` (`:227`) e por click — teclado funciona via click; conforme. Positivo: `aria-expanded`, `aria-selected`, labels `sr-only`, `tablist`/`tab` (sem `tabpanel` associado — completar em T-10).
- **Recomendação:** **(b) T-24** — drawer como `<dialog>` nativo ou focus trap + restore + Escape; trocar listbox por `menu`/grupo de botões ou implementar o padrão completo; `role="img"` + `aria-label` nas estrelas; `role="region"`/`<section aria-label>` no preview; `tabpanel` com `aria-labelledby`.

### D-31 · Documentação e hygiene
- **Convention:** § Cross-Cutting › Documentation (README com env table, routes table, test commands, setup Docker; `CLAUDE.md`; `docs/{adr,tech-design,specs,ddr,security,qa}`); § Repository Hygiene (`.gitignore` com `playwright-report/`, `test-results/`, coverage, IDE files).
- **Atual:** `README.md` cobre propósito, stack, run e o contrato de atributos, mas não env/rotas/testes/Docker; `CLAUDE.md` ausente; `docs/` está sendo criado agora (`adr/`, `architecture/`, `devops/`, `security/`, `specs/`); `.gitignore:1-7` sem `playwright-report/`, `test-results/`, `coverage/`, `.idea/`; `.vscode/` commitado com `settings.json` vazio e um `.gitignore` interno; 11 arquivos JPG/PNG untracked na raiz (37 MB: `manhattan.jpg` 9,7 MB, `beautiful-view-new-york-city.jpg` 9,3 MB, `new-york-city*.jpg`, `vamosany*.jpg`, `Melius page.png`) e 3 PNG tracked na raiz duplicando `public/`; `DESIGN.md` (sistema Linear anterior, 548 linhas) na raiz; `package.json:2` — `"name": "deel-landing"`.
- **Recomendação:** **(b) T-25** (README/CLAUDE.md/docs) e **T-26** (`.gitignore`, mover fontes de imagem para fora do repo ou para `design-assets/` ignorado, remover PNG duplicados, arquivar `DESIGN.md` em `docs/ddr/` ou apagar, renomear o pacote).

---

## 3. Deviations de nível de design (fora da alçada deste ADR set — formalizar em DDR pelo UX Strategist)

Listadas para que nada fique implícito. Por decisão do usuário (design da landing congelado), **todas ficam como estão**; o ADR-0006 registra o compromisso de engenharia (render-preserving) e o UX Strategist emite os DDRs que formalizam as exceções a `design-conventions.md`.

| ID | design-conventions § | Observação | Rota |
|----|----------------------|------------|------|
| X-1 | Typography / Anti-Patterns | Display type e eyebrows em ALL-CAPS tracked-out (`globals.css:112-211`, `eyebrow` 0.14 em); body em Arial (`globals.css:14`) — "not the default sans". É a direção de marca explícita do design system (`vamosany-design-system.md:63-118`), o que a convention admite ("where the brand direction asks for one explicitly, follow the brand"), mas não há constitution que a registre. | Mantido. Constitution › Experience Principles + DDR de formalização |
| X-2 | Motion Principles | Ver D-24 / ADR-0006. | Mantido. DDR + retro-spec documental (T-18) |
| X-3 | Color | Light-only; sem `[data-theme="dark"]`. | Mantido. DDR de deferimento de dark mode |
| X-4 | UX Writing / Anti-Patterns | CTAs "Join" (`cta.tsx:61`), "Learn more" (`how-it-works.tsx:64`); `href="#"` placeholders (`footer.tsx:87,104,129,173,204`) e ~48 páginas de mega menu que não existem (`navbar.tsx:11-160`); seletor de idioma sem efeito (`navbar.tsx:173,287,434`). Em produção isso é promessa sem entrega. | Mantido (copy é output visual). Registrar no DDR como dívida de produto; revisitar quando a landing crescer (Q5) |

---

## 4. Plano de migração incremental

Ordem pensada para (1) não alterar comportamento em produção antes de existir rede de segurança, (2) cada task = um conventional commit, testável isoladamente, (3) tasks que tocam `app/`, `'use client'`, `next.config.ts` ou env carregam **build check required**, (4) **nenhuma task altera o resultado renderizado** (ADR-0006): as Fases 2–4 só começam depois de T-04 gerar o baseline visual, e cada PR anexa o diff de screenshots (esperado: zero).

Comandos: o projeto usa npm (ADR-0005); onde as conventions dizem `pnpm typecheck && pnpm lint && pnpm test`, leia `npm run typecheck && npm run lint && npm test`.

### Fase 0 — Governança (sem código)
| Task | O quê | Owner | Depende de |
|------|-------|-------|------------|
| G-01 | Aprovar/rejeitar ADR-0001..0006 (`docs/adr/`) | Usuário | — |
| G-02 | Responder Q2, Q4, Q8, Q9, Q10 (§ 5; Q1/Q3/Q5/Q6/Q7 já resolvidas) | Usuário | — |
| T-18 | Retro-spec **documental** de Motion Intent (descreve o que existe e o porquê; sem cortes) + DDR de motion formalizando a exceção a § Motion Principles | UX Strategist | ADR-0006 |
| T-18b | Tech Design Doc `docs/tech-design/landing-motion.md` (timeline, triggers, contrato de atributos, reduced-motion branch, riscos CLS, oráculo de regressão) | Frontend Architect | T-18 |
| — | DDRs de formalização: brand typography (X-1), dark mode deferido (X-3), copy/placeholders como dívida de produto (X-4) | UX Strategist | ADR-0006 |

### Fase 1 — Ferramental (zero mudança de runtime)
| Task | O quê | Arquivos | Aceite | Label |
|------|-------|----------|--------|-------|
| T-02 | ESLint 9 flat (`eslint-config-next` + `jsx-a11y`) + Prettier + `prettier-plugin-tailwindcss`; scripts `lint`, `format` (chamando `eslint .`, não `next lint`) | `eslint.config.mjs`, `prettier.config.mjs`, `package.json` | `npm run lint` roda; findings a11y iniciais registrados como issues, não corrigidos aqui; Prettier **não** reordena JSX de forma que altere render (só classes) | — |
| T-07 | `engines.node` + `.nvmrc` + `.npmrc` (`engine-strict=true`) | `package.json`, `.nvmrc`, `.npmrc` | npm recusa versão errada | Q2 |
| T-07b | `noUncheckedIndexedAccess`, `noImplicitOverride`; script `typecheck`; remover `!` e index access sem guard; return types | `tsconfig.json`, `sample-day.tsx`, `planning-timeline.tsx`, `hero-ring.tsx`, `package.json` | `npm run typecheck` limpo; tab inicial continua "Day 2"/"Before you fly" | — |
| T-03 | Vitest + RTL + jest-dom + jsdom; `tests/setup.ts`; primeiros testes: `Button`, `SectionHeading`, tabs | `vitest.config.ts`, `tests/setup.ts`, `**/__tests__/` | `npm test` verde com ≥ 6 testes | — |
| T-04 | Playwright + `@axe-core/playwright`; jornada da landing em 360/768/1280; run com `reducedMotion: 'reduce'`; **baseline de screenshots** (idle, após scroll completo, com/sem reduced-motion) commitado como oráculo do ADR-0006 | `playwright.config.ts`, `tests/e2e/landing.spec.ts`, `tests/e2e/__screenshots__/` | axe sem violações *serious/critical*; com reduced-motion todo `[data-reveal]` tem `opacity: 1`; baseline gerado a partir do commit atual (`29f5546`) | pré-requisito das Fases 2–4 |
| T-26 | `.gitignore` completo; remover/mover 14 assets da raiz; apagar `DESIGN.md`/`Melius page.png` ou arquivar em `docs/ddr/`; renomear pacote | `.gitignore`, raiz, `package.json` | `git status` limpo; raiz sem binários | — |
| T-25 | README (env table, routes table, test commands, Docker), `CLAUDE.md`, `docs/{tech-design,ddr,qa}/` | `README.md`, `CLAUDE.md`, `docs/` | Seções da convention presentes | — |

### Fase 2 — Estrutura e estilo (refactors sem mudança visual — gate: diff de screenshots = 0 contra o baseline de T-04)
| Task | O quê | Arquivos | Aceite | Label |
|------|-------|----------|--------|-------|
| T-06 | `lib/utils.ts` com `cn()`; substituir 21 template literals | `lib/utils.ts`, 9 componentes | grep `className={\`` = 0; snapshot visual igual (Playwright screenshot) | — |
| T-08 | Reestruturar pastas (§ D-10); um componente por arquivo; named exports | tudo em `components/` → `components/ui`, `components/layout`, `features/landing` | build verde; imports sem `../..` | build check; Q5 |
| T-09 | `type Props` em todos os componentes; return types | idem | `pnpm typecheck` | — |
| T-11 | `app/not-found.tsx`, `app/global-error.tsx` | `app/` | e2e: `/nao-existe` renderiza 404 no design system | build check |
| T-12 | `<a href="#…">` → `Link` (4 pontos) | `blog.tsx`, `how-it-works.tsx`, `included.tsx` | grep `<a ` = 0 fora de links externos | Q8 |
| T-14 | Tokenizar arbitrary values e hex (D-17); `--color-*: initial` + mapear `white`; adicionar `--color-focus`, `--z-*`; consolidar tokens duplicados (grep de zero usos) | `app/globals.css`, 10 componentes | grep `\[[^]]*(px|rem|rgba|calc)` em componentes = 0 sem comentário; screenshots iguais | ADR-0004 |
| T-15 | Remover dead code (D-25) | `hero-ribbon.tsx`, `globals.css:248-250,296-383`, `ui.tsx:142-161`, PNGs da raiz | build verde; CSS de produção menor | — |
| T-23 | `lib/env.ts` (zod) + `.env.example`; `metadataBase` de `NEXT_PUBLIC_SITE_URL` | `lib/env.ts`, `.env.example`, `app/layout.tsx` | build falha sem a var; OG URL correta no preview | build check |

### Fase 3 — Motion (comportamento preservado, mecanismo alinhado — gate: screenshots + trace de scroll idênticos; durações/easings/staggers copiados 1:1 para `lib/motion.ts`)
| Task | O quê | Arquivos | Aceite | Label |
|------|-------|----------|--------|-------|
| T-05 | `@gsap/react`; `lib/gsap.ts` registra plugins uma vez; `useEffect` → `useGSAP` nos 3 módulos vivos | `lib/gsap.ts`, `features/landing/motion/*`, `hero-ring.tsx` | grep `registerPlugin` só em `lib/gsap.ts`; StrictMode sem tween duplicado (teste RTL do ring) | ADR-0002/0003; build check |
| T-16 | `hero-ring` respeita o gate `.gsap` (mantém `set` estático sob reduced-motion); contrato de atributos tipado `attributes.ts` usado pelas seções | `hero-ring.tsx`, `attributes.ts`, seções | e2e reduced-motion: ring parado e hemisfério traseiro oculto | ADR-0002/0003 |
| T-16b | Spike: substituir o inline script por `@media (scripting: enabled) and (prefers-reduced-motion: no-preference)` | `globals.css`, `app/layout.tsx` | Relatório: suporte de browsers do público-alvo; se OK, ADR-0002 é superseded | ADR-0002 |
| T-17 | `lib/motion.ts` (durations/staggers/eases) como fonte única, com os **valores atuais copiados 1:1** (0.45, 0.4/0.06, 1.2, 44 s, 0.8/0.09, 1.15/0.16…); teste de paridade com `@theme` para os que coincidem | `lib/motion.ts`, `globals.css`, módulos de motion | grep de números mágicos em `duration:`/`stagger:` = 0; trace de scroll idêntico | ADR-0006 |
| T-17b | Spike: CSS scroll-driven animations para `data-reveal`/`data-reveal-group`/`data-sweep` | `globals.css` | Relatório de redução de JS; **só adotar se o resultado for indistinguível** (mesma curva, mesmo timing); decisão no Tech Design Doc | T-18b, ADR-0006 |
| T-19 | `next/image` no hero ring; `priority` opt-in no `BrandLogo`; logo em SVG; apagar JPG duplicados | `hero-ring.tsx`, `brand-logo.tsx`, `public/` | Lighthouse: sem "preload não usado"; `public/img/ring` sem JPG; crop/`object-position` dos cards idêntico (screenshot do ring parado sob reduced-motion); logo SVG pixel-equivalente nos 3 tamanhos | ADR-0006 |
| T-19b | Medir First Load JS/LCP/CLS/INP; `next/dynamic({ ssr:false })` para `ScrollEffects`, `Overscroll`, `HeroRing` se > 180 kB | `app/page.tsx`, `hero.tsx` | Números no README; ≤ 180 kB ou ADR justificando; **o primeiro frame animado não pode atrasar visivelmente** (o gate `.gsap` já esconde os alvos, então o chunk dinâmico só posterga o início da timeline — medir e, se perceptível, manter import estático e registrar a exceção de budget) | build check; ADR-0006 |

### Fase 4 — Interação, a11y e formulários (gate: render idle idêntico; mudanças são de semântica/foco, não de pixels)
| Task | O quê | Arquivos | Aceite | Label |
|------|-------|----------|--------|-------|
| T-10 | Leaves client: `Tabs` (+ `tabpanel`), `ScrollButtons`, `NavMenu`/`MobileDrawer` com `NAV` vindo de módulo server; seções voltam a RSC | `sample-day`, `planning-timeline`, `reviews`, `navbar`, `nav-data.ts` | grep `'use client'` só em leaves; First Load JS menor que T-19b; screenshots idênticos em todos os estados de tab/menu | build check; ADR-0006 |
| T-24 | Focus trap/restore/Escape no drawer, listbox → `menu` ou padrão completo, ARIA em `reviews`/`dashboard-preview` | `mobile-drawer.tsx`, `language-menu.tsx`, `reviews.tsx`, `dashboard-preview.tsx` | axe limpo; e2e: Tab não sai do drawer aberto; Escape fecha e devolve foco; **sem `<dialog>` nativo se os UA styles alterarem o visual** — usar focus trap manual e manter o markup/classes atuais | ADR-0006 |
| T-13 | `features/newsletter/{schemas,actions}.ts`, `NewsletterForm` (`useActionState`, `useFormStatus`, `aria-live`, erro inline); MSW handler; Contract Request | `features/newsletter/*`, `cta.tsx`, `footer.tsx`, `tests/fixtures/msw/handlers/newsletter.ts` | RTL: email inválido → erro associado por `aria-describedby`; submit → pending → confirmação; **estado idle pixel-idêntico**; estados novos só com copy/visual aprovados pelo UX Strategist | **Pre-Contract**; Q4; build check; ADR-0006 |

### Fase 5 — DevOps (owner: Frontend DevOps Engineer; hosting Vercel-only por ADR-0005)
| Task | O quê | Label |
|------|-------|-------|
| T-20 | `run-local.sh` (`npm ci && npm run dev`); `vercel.json` apenas se necessário; variáveis de ambiente (`NEXT_PUBLIC_SITE_URL`) cadastradas no projeto Vercel para preview/prod | T-23 |
| T-21 | `.github/workflows/ci.yml` (typecheck + lint + test + build + e2e em todo push; `npm ci`) — a Vercel faz build/deploy, não testes | depende de T-02..T-04 |
| — | `deploy-staging.yml`/`deploy-prod.yml`, `Dockerfile`, `output: 'standalone'`: **não produzidos** (ADR-0005) | — |

---

## 5. Perguntas ao usuário (bloqueiam ou orientam tasks)

| # | Pergunta | Afeta |
|---|----------|-------|
| Q1 | ~~Pipeline atual usa npm? Migrar para pnpm?~~ **Resolvida (2026-09-23): o projeto mantém npm** → ADR-0005. | ADR-0005 |
| Q2 | Fixar Node **22** LTS (convention) ou atualizar a convention para **24** LTS (Active LTS desde out/2025; 22 entra em maintenance em out/2026)? A Vercel hoje oferece 22.x e 24.x — o valor escolhido deve ser o mesmo em `engines`, `.nvmrc` e nas Project Settings da Vercel. Pergunta de nível de convention. | T-07, conventions |
| Q3 | ~~Alvo de produção?~~ **Resolvida: Vercel** → ADR-0005 (Vercel-only; sem Docker/standalone/deploy workflows). Pendente apenas: o DevOps Engineer já está em `docs/devops/`? | ADR-0005, T-20, T-21 |
| Q4 | Newsletter: qual provider/backend (Mailchimp, Resend, Buttondown, API própria)? Sem resposta, T-13 fica Pre-Contract com MSW e **sem alteração de render** (schema + action + testes apenas). Os estados pending/error/success são novos e precisam de copy/visual do UX Strategist. | T-13, X-4 |
| Q5 | ~~A landing vai crescer para multi-rota?~~ **Resolvida (2026-09-23): sim — o repo vira o produto completo, com muitas páginas e, depois, o dashboard do Traveler.** T-08 usa route group `(marketing)` e `features/` por domínio desde já. | T-08 |
| Q6 | ~~Motion expressivo é decisão de marca a manter?~~ **Resolvida: o design/motion em produção não muda** → ADR-0006; T-18 vira retro-spec documental + DDR de formalização. | ADR-0006 |
| Q7 | ~~Confirmar light-only?~~ **Resolvida por implicação (design congelado): light-only permanece.** Falta só o DDR de deferimento de dark mode pelo UX Strategist. | X-3 |
| Q8 | Esclarecer na convention: `<a href="#fragment">` same-document é permitido ou tudo vai por `Link`? (sugestão de drift abaixo) | T-12 |
| Q9 | Se ADR-0002/0003 forem aceitos, quer que eu proponha o texto de atualização de `§ Animation` (gate `.gsap` + controlador headless como alternativas sancionadas)? | conventions |
| Q10 | Manter este audit em `docs/architecture/` (não listado no `docs/` canônico) ou mover para `docs/adr/README.md`/`docs/tech-design/`? | este arquivo |

---

## 6. Convention Drift Detection (sugestões — o usuário aprova; não editei as conventions)

1. **§ Animation — initial-state e reduced-motion sem JS.** A convention assume que `opacity-0` + `useGSAP` basta; sem JS, isso deixa conteúdo invisível. Sugerir: "elements start hidden only under a JS-and-motion gate (`html.gsap` set before first paint, or `@media (scripting: enabled) and (prefers-reduced-motion: no-preference)`)". Base: ADR-0002.
2. **§ Animation — controlador headless por data-attributes.** Reconhecer o padrão para páginas de conteúdo estático (seções RSC + um módulo client que vincula triggers por atributos tipados), com as condições do ADR-0003.
3. **§ Routing — fragment links.** Explicitar se `<a href="#id">` é aceitável para navegação same-document (Q8).
4. **§ Stack Baseline — Node.** Revisar "Node.js 22 LTS" (Q2).
4b. **§ Multi-target Deployment — Vercel-only.** Se ADR-0005 for aceito e o padrão se repetir em outros projetos, explicitar na convention que "Vercel project" satisfaz o requisito de deploy config e que `Dockerfile`/`standalone` podem ser dispensados por ADR quando não há segundo alvo previsto.
4c. **§ Engineering Workflow — projetos legados com design congelado.** Sugerir um rótulo *Render-Preserving* (ao lado de Pre-Contract/Draft) para tasks cujo critério de aceite inclui diff de screenshots = 0, como neste projeto (ADR-0006).
5. **§ Stack Baseline — `next lint`.** Registrar que a partir do Next 15.5 o script `lint` deve chamar `eslint .` (o `next lint` está deprecated).
6. **§ Performance — imagens 3D/transformadas.** Nota de que `next/image` funciona dentro de `preserve-3d` (o `<img>` gerado aceita `className`/`style`), para evitar o mito que justificou o `<picture>` em D-26.
7. **design-conventions § Design Tokens.** Permitir que o dicionário de nomes seja definido por projeto via ADR/DDR com tabela de mapeamento (como no ADR-0004), mantendo a exigência de nomes semânticos e de `--color-focus`.

---

## 7. Artefatos produzidos por esta auditoria

- `docs/architecture/conventions-audit.md` (este arquivo)
- `docs/adr/0001-adocao-incremental-do-stack-baseline.md` — *Proposed*
- `docs/adr/0002-gate-de-motion-por-classe-gsap-no-html.md` — *Proposed*
- `docs/adr/0003-controlador-de-motion-headless-por-data-attributes.md` — *Proposed*
- `docs/adr/0004-vocabulario-de-tokens-do-design-system-vamos-a-ny.md` — *Proposed*
- `docs/adr/0005-npm-e-hosting-vercel-only.md` — *Proposed* (decisões do usuário: npm e Vercel)
- `docs/adr/0006-congelamento-do-design-e-motion-da-landing-em-producao.md` — *Proposed* (decisão do usuário: nenhuma mudança visual)

Nenhum arquivo de source foi modificado. Nenhum ADR está *Accepted* — a aprovação é do usuário.
