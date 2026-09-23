# ADR-0004: Vocabulário de tokens e utilities tipográficas do design system Vamos a NY em `app/globals.css`

- **Status:** Accepted (2026-09-23, Matheus Melo)
- **Date:** 2026-09-23
- **Deciders:** Usuário (owner do repositório) — drafted by Frontend Architect

## Context

`design-conventions.md § Design Tokens` prescreve um dicionário de nomes semânticos declarado em `@theme`: `--color-surface`, `--color-surface-raised`, `--color-ink`, `--color-ink-muted`, `--color-line`, `--color-accent`, `--color-accent-ink`, `--color-focus`, `--color-success/warning/danger`; `--font-sans`/`--font-display` alimentados por `--font-body`/`--font-display` do `next/font`; `--text-xs..5xl`; `--spacing: 0.25rem`; `--radius-sm/md/lg/full`; `--shadow-1..3`; `--ease-out-quart`/`--ease-in-out-quart`; `--duration-fast/base/slow` (150/250/450 ms); `--container-prose/page`; `--z-dropdown..toast`; e `@custom-variant dark (…[data-theme="dark"]…)`. `frontend-architecture-conventions.md § Styling` exige que componentes consumam utilities semânticas geradas desses tokens.

`app/globals.css:13-69` declara outro vocabulário, herdado do sistema anterior (comentário em `:8-10`; `README.md:69-74`) e re-valorado para a marca Vamos a NY (`docs/design/vamosany-design-system.md`):

| Convention | Projeto (`globals.css`) | Nota |
|---|---|---|
| `--color-surface` | `--color-canvas` (:26) | página |
| `--color-surface-raised` | `--color-surface-1` (:27); `surface-2/3/4` (:28-30) | `surface-2 == surface-3`, `surface-1 == surface-4` (duplicatas) |
| `--color-ink` | `--color-ink` (:38) | igual |
| `--color-ink-muted` | `--color-ink-muted` (:39) e `--color-ink-subtle` (:40) | valores idênticos (duplicata); `--color-ink-tertiary` (:41) é um terceiro nível |
| `--color-line` | `--color-hairline` (:33), `hairline-strong` (:34), `hairline-tertiary` (:35) | `hairline == hairline-tertiary` (duplicata) |
| `--color-accent` | `--color-brand` (:19) | + `brand-hover` (:20), `brand-focus` (:21, == hover), `brand-secure` (:22, == ink-muted) |
| `--color-accent-ink` | `--color-on-brand` (:23) | |
| `--color-focus` | **ausente** — focus ring usa `var(--color-ink)` (:93-96) | 3:1 garantido (ink sobre canvas) |
| `--color-success/warning/danger` | `--color-success` = ink (:48); sem warning/danger | "status reads through contrast" |
| `--font-sans`/`--font-display` | `--font-sans` = Arial (:14); `--font-display` = `var(--font-courier-prime)` (:15); `--font-mono` (:16) | sem `--font-body`; Arial é decisão de marca (`vamosany-design-system.md:75-80`) |
| `--text-*` | não redeclarados (defaults do Tailwind) + `@utility display-xl/lg/md`, `headline`, `card-title`, `subhead`, `body-lg/base/sm`, `caption`, `label-button`, `eyebrow` (:112-211) | escala tipográfica por utilities compostas em vez de tokens de tamanho |
| `--radius-sm/md/lg/full` | `--radius-xs/sm/md/lg/xl/xxl` (:51-56) | `sm == md` (4 px) |
| `--shadow-1..3` | `--shadow-soft`, `--shadow-card` (:59-60) | |
| `--ease-*` | `--ease-default` (:66) | uma curva só |
| `--duration-*` | `--duration-fast/base/slow` = 120/180/300 ms (:63-65) | mesmos nomes, valores diferentes dos da convention |
| `--container-page/prose` | `@utility container-ds` com `max-width: 1200px` (:100-109) | px literal dentro de `globals.css` (permitido) |
| `--z-*` | **ausentes** — `z-50` em `navbar.tsx:211`, `zIndex` inline em `overscroll.tsx:27` | |
| `@custom-variant dark` | **ausente** — light-only (`README.md:8`) | |
| `--animate-*` | `--animate-marquee` (:68) + `@keyframes marquee` (:71-74) | |

Vinte arquivos consomem esse vocabulário (`bg-canvas`, `text-ink-subtle`, `border-hairline`, `bg-brand`, `display-lg`, `eyebrow`…). Além disso, 42 usos da paleta default do Tailwind (`text-white`, `bg-white/10`, `border-white/25`) coexistem com `--color-inverse-ink` (:45), e há arbitrary values fora de `globals.css` (auditoria D-17).

A decisão precisa ser tomada agora porque T-14 (tokenização) e T-06/T-08 (refactor de classes) precisam de um dicionário alvo, e renomear 20 arquivos para o vocabulário da convention sem ganho de produto seria custo puro.

## Decision

1. **O vocabulário atual é o dicionário oficial do projeto**, com a tabela acima como mapeamento para o vocabulário da convention (para que Reviewer/QA leiam `bg-canvas` como "`bg-surface` da convention"). Não haverá renomeação em massa nem aliases duplos.
2. **Consolidar duplicatas** (T-14c), com grep provando zero usos antes de remover, conforme `design-conventions.md § Design Tokens`: `surface-3`→`surface-2`, `surface-4`→`surface-1`, `hairline-tertiary`→`hairline`, `ink-subtle`→`ink-muted` (ou o inverso — o UX Strategist escolhe o nome que fica), `brand-focus`→`brand-hover`, `brand-secure`→`ink-muted`, `radius-md`→`radius-sm`.
3. **Adicionar os tokens ausentes que a convention exige por função, não por nome:** `--color-focus` (valor = ink; usado por `:focus-visible` e por qualquer `focus-visible:` utility), `--z-dropdown/sticky/overlay/modal/toast` (navbar sticky, veil, drawer, mega menu), `--container-page: 1200px` e `--container-copy: 760px` (substituindo os `max-w-[1200px]`/`max-w-[1400px]` de D-17), `--shadow-nav` para as sombras arbitrárias do navbar/mega menu, `--text-2xs` para `text-[0.5625rem]`/`text-[0.8125rem]`.
4. **Desligar a paleta default do Tailwind** com `--color-*: initial;` no início do `@theme`, redeclarando apenas os tokens do projeto (+ `white`/`black`? não: mapear `white`→`inverse-ink`/`canvas`, `black`→`ink`). A partir daí, `bg-white` ou `text-gray-500` deixam de existir e viram erro visível no build/CSS — enforcement mecânico de `§ Styling`. Executado em T-14b, com screenshots de regressão (T-04) antes/depois.
5. **Utilities tipográficas via `@utility` são aceitas** como a forma do projeto de expor a escala (`display-xl`… `eyebrow`). Elas vivem só em `globals.css`, o que respeita "`@apply` allowed only in `globals.css`". Regra: componentes não redeclaram `font-family`/`letter-spacing`/`text-transform`; usam a utility.
6. **Durações e easings:** os nomes `--duration-fast/base/slow` e `--ease-default` ficam com os **valores atuais** (120/180/300 ms; `cubic-bezier(0.2, 0.8, 0.2, 1)`) — o design está congelado (ADR-0006). `lib/motion.ts` (T-17) espelha esses tokens e os demais valores hoje hard-coded no GSAP, 1:1, com teste de paridade.
6b. **Critério render-preserving para todo este ADR:** consolidação de duplicatas, novos tokens e `--color-*: initial` só entram com diff de screenshots = 0 contra o baseline de T-04 (ADR-0006). Os novos tokens recebem exatamente os valores hoje literais (`--shadow-nav: 0 8px 30px rgb(0 0 0 / 0.06)`, `--text-2xs: 0.8125rem`, etc.).
7. **Dark mode:** fora deste ADR. Light-only é decisão de design → DDR de deferimento (Q7). Quando/se vier, é token swap em `[data-theme="dark"]` sem reescrita de componentes, como a convention exige — o que este vocabulário suporta.
8. **Ratificação:** o UX Strategist emite um DDR "Token dictionary Vamos a NY" que referencia este ADR; mudanças futuras no dicionário seguem `design-conventions.md § Design Tokens` (Strategist propõe → usuário aprova → Engineer adiciona em commit `style:`).

## Consequences

- **Positive:** zero churn em 20 arquivos; dicionário coerente com o design system documentado; enforcement mecânico contra cores fora do sistema (item 4); os requisitos funcionais da convention (`focus`, `z-*`, containers) passam a existir; Reviewer e QA têm tabela de tradução.
- **Negative:** o projeto fala um dialeto — quem vier de outro projeto da mesma organização precisa da tabela; `--color-*: initial` pode quebrar utilities que dependem de cores default (`ring-*` default, `divide-*`, `placeholder`) — T-14b precisa de screenshots de regressão; consolidação de duplicatas toca vários arquivos.
- **Neutral:** o dicionário continua semântico (não descritivo), como a convention pede — a divergência é de nomes, não de princípio; tamanhos de texto seguem sem tokens `--text-*` próprios (as utilities compostas cumprem o papel).

## Alternatives Considered

- **Renomear para o vocabulário da convention** (`canvas`→`surface`, `brand`→`accent`, `hairline`→`line`…) — rejeitada: ~20 arquivos e centenas de classes alteradas sem efeito para o usuário; risco de regressão visual; o design system do produto usa "brand"/"ink" como linguagem própria.
- **Aliases duplos (`--color-accent: var(--color-brand)`)** — rejeitada: dois nomes para o mesmo token viram dois estilos de código no mesmo repo; a convention proíbe justamente essa ambiguidade em `§ Design Tokens` ("removing one requires a grep proving zero usages").
- **Manter a paleta default do Tailwind disponível** — rejeitada: é a origem dos 42 `white`/`black` e permitiria `text-gray-500` amanhã; a convention proíbe raw values e a única forma barata de garantir isso é não gerar as utilities.
- **Tokens `--text-*` próprios em vez de utilities compostas** — rejeitada por ora: as utilities encapsulam família + peso + tracking + transform, que a marca exige juntos; tokens de tamanho isolados incentivariam recompor a tipografia em cada componente.

## References

- `docs/architecture/conventions-audit.md` — D-17, D-18, T-14, T-14b, T-14c, T-17, Q7
- `design-conventions.md` — § Design Tokens, § Typography, § Color, § Anti-Patterns
- `frontend-architecture-conventions.md` — § Styling (Tailwind CSS 4)
- `docs/design/vamosany-design-system.md` — §§ 2, 3, 8, 9, 16, 18
- `app/globals.css:13-69, 93-96, 100-211`
- Relacionados: ADR-0001, ADR-0003 (z-index/background das seções no `Overscroll`), ADR-0006 (design congelado — critério render-preserving)
