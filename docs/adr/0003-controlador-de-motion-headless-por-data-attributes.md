# ADR-0003: Controlador de motion headless por data-attributes (`ScrollEffects`, `Overscroll`) mantendo as seções como Server Components

- **Status:** Accepted (2026-09-23, Matheus Melo)
- **Date:** 2026-09-23
- **Deciders:** Usuário (owner do repositório) — drafted by Frontend Architect

## Context

`frontend-architecture-conventions.md § Animation` diz: "GSAP runs only in client components, only inside `useGSAP(() => { … }, { scope: containerRef, dependencies: [...] })`." `§ Component Model` diz: "Add `'use client'` only at the interactive leaf that needs state, effects, browser APIs, or GSAP." A leitura direta é: cada seção animada é (ou contém) um client component com um `ref` de container e seu próprio `useGSAP` escopado.

O projeto usa outro desenho, descrito em `README.md:42-67`:

- `app/page.tsx:21-22` monta dois client components que **retornam `null`**: `ScrollEffects` (`components/scroll-effects.tsx`, 312 linhas) e `Overscroll` (`components/overscroll.tsx`, 110 linhas).
- Eles varrem o `document` por um **contrato de data-attributes**: `[data-reveal]`, `[data-reveal-group]`, `[data-count]`, `[data-marquee]`, `[data-nav]`, `[data-sweep]`, `[data-pan-band]`, `[data-hero-copy]`, `[data-hero-quote]`, `[data-hero-actions]`, `[data-heading-block]`, `[data-heading-eyebrow]`, `[data-split-lines]`, `[data-heading-lede]`, `[data-heading-actions]` (`scroll-effects.tsx:36-303`) e `main > section` (`overscroll.tsx:21`).
- Resultado: as 12 seções (`hero`, `neighborhood-ticker`, `dashboard-preview`, `services`, `how-it-works`, `stats`, `blog`, `included`, `cta`, `footer` e os wrappers de `sample-day`/`planning-timeline`) permanecem **Server Components** e não enviam JS de motion próprio. `SectionHeading` (`components/ui.tsx:62-104`) é server e só emite atributos.

Custos observados na auditoria (D-22):
- Seletores globais sem `scope`; um typo no atributo falha em silêncio (o contrato só existe em prosa no README).
- `Overscroll` muta inline styles das seções (`position`, `zIndex`, `backgroundColor`, `transformOrigin`, `marginBottom` — `overscroll.tsx:24-28,39,61`) e depende da ordem do DOM (`main > section`), com `pin: true, pinSpacing: false` — risco de CLS a medir.
- `SplitText` reescreve o DOM de headings renderizados no servidor (`scroll-effects.tsx:187-221,242-298`); a hidratação já ocorreu, então não há mismatch, mas testes RTL das seções não veem o resultado final.
- Ambos usam `useEffect` + `gsap.context()` manual em vez de `useGSAP` (D-02), e registram plugins localmente (D-19).
- O sistema tem mais de um `ScrollTrigger` — critério de `§ Tech Design Doc` — e não existe Tech Design Doc.

A decisão precisa ser tomada agora porque T-05 (migração para `useGSAP`), T-08 (reestruturação de pastas) e T-10 (leaves client) mudam de forma dependendo de o padrão ser mantido ou substituído por leaves por seção.

## Decision

Aceitar o padrão **"controlador de motion headless por data-attributes"** para esta landing, como forma sancionada de aplicar `§ Animation` em páginas de conteúdo estático, com as condições abaixo. A regra "GSAP em client leaf com `useGSAP`" continua valendo para componentes interativos com estado próprio (`HeroRing` já é um leaf assim).

Condições:

1. **`useGSAP` obrigatório.** `ScrollEffects` e `Overscroll` migram de `useEffect` + `gsap.context()` para `useGSAP(() => { … }, { dependencies: [] })` (T-05). Sem `scope` de container (o alvo é o documento), mas com o `revert` automático do hook. O setup adiado por `document.fonts.ready` em `overscroll.tsx:90-94` passa a usar `ScrollTrigger.refresh()` dentro do mesmo `useGSAP` em vez de criar o context tarde.
2. **Plugins em `lib/gsap.ts`** (`ScrollTrigger`, `SplitText`, `CustomEase`, `useGSAP`) — nenhum `registerPlugin` fora dele (T-05).
3. **Contrato de atributos tipado.** `features/landing/motion/attributes.ts` exporta os nomes (`export const MOTION = { reveal: 'data-reveal', revealGroup: 'data-reveal-group', … } as const`) e helpers de spread (`{...motion.reveal()}`); as seções usam os helpers em vez de literais, e o controlador seleciona a partir das mesmas constantes. Um typo passa a ser erro de tipo. O README referencia o módulo em vez de duplicar a tabela.
4. **Localização.** Controladores e contrato vivem em `features/landing/motion/` (T-08); são montados por `app/page.tsx` (glue de rota) e nunca por seções.
5. **Sem mutação de layout fora do GSAP.** `Overscroll` deixa de escrever `position`/`zIndex`/`backgroundColor` via `style` — esses valores viram classes/tokens aplicados nas seções (`relative`, `bg-canvas`, `z-*` de `--z-*`, ADR-0004) e o controlador só cria os ScrollTriggers. `marginBottom` para compensar `pinSpacing: false` fica documentado no Tech Design Doc como exceção e é medido (CLS) em T-19b.
6. **Tech Design Doc obrigatório:** `docs/tech-design/landing-motion.md` (T-18b) com timeline, triggers, contrato de atributos, branch reduced-motion (ADR-0002), riscos e o resultado do spike T-17b.
7. **Escopo do que é aceito:** o *mecanismo*. O *intent* (loops, pin/scrub, reveal em toda seção, durações) está congelado por decisão do usuário (ADR-0006) e é documentado, não alterado, pela retro-spec T-18 e pelo DDR de formalização. Toda mudança de mecanismo (condições 1–5, spike T-17b) tem como critério de aceite **resultado renderizado idêntico** — screenshots e trace de scroll contra o baseline de T-04; o spike T-17b só é adotado se a curva e o timing forem indistinguíveis.

## Consequences

- **Positive:** seções permanecem Server Components (zero JS por seção; conteúdo indexável e legível sem JS); um lugar para ler/depurar toda a coreografia da página; adicionar motion a uma seção nova é adicionar um atributo, não um client component; compatível com o gate do ADR-0002.
- **Negative:** contrato implícito por atributos (mitigado pela condição 3); seletores globais impedem testes unitários do motion por seção (o teste é E2E, T-04); acoplamento à estrutura `main > section` no `Overscroll`; `SplitText` altera DOM server-rendered; um único módulo grande (312 linhas) tende a crescer — o Tech Design Doc deve definir quando dividir por cena (`reveals.ts`, `headings.ts`, `hero.ts`, `overscroll.ts`).
- **Neutral:** `HeroRing` continua sendo um leaf client com `useGSAP` escopado (padrão da convention) — os dois padrões coexistem, com critério claro: estado próprio → leaf; coreografia de conteúdo estático → controlador.

## Alternatives Considered

- **Um client leaf com `useGSAP` escopado por seção (convention literal)** — rejeitada: 12 seções virariam client components ou ganhariam wrappers client (`<Reveal>`), enviando JS e props por seção; a coreografia inter-seções (`Overscroll`, nav `is-scrolled`, marquee por velocidade) não cabe em escopos isolados.
- **Wrappers client genéricos (`<Reveal>`, `<StaggerGroup>`) envolvendo children server** — considerada: mantém as seções server e dá `scope`; rejeitada por ora porque duplica o que os atributos já fazem e não resolve `Overscroll`/`SplitText`. Pode ser reavaliada no Tech Design Doc se o controlador ultrapassar ~400 linhas.
- **CSS scroll-driven animations (`animation-timeline: view()`) para reveals** — não substitui o padrão (SplitText, pin, marquee por velocidade continuam em GSAP), mas pode reduzir sua superfície; encaminhada ao spike T-17b.
- **Remover ou reduzir a motion de scroll** — rejeitada por decisão do usuário (design e motion em produção não mudam; ADR-0006).

## References

- `docs/architecture/conventions-audit.md` — D-02, D-19, D-22, D-23, D-24, T-05, T-08, T-10, T-17, T-17b, T-18, T-18b, T-19b
- `frontend-architecture-conventions.md` — § Animation, § Component Model, § Tech Design Doc, § Performance Budgets
- `design-conventions.md` — § Motion Principles
- `components/scroll-effects.tsx`, `components/overscroll.tsx`, `app/page.tsx:21-22`, `README.md:42-67`
- Relacionados: ADR-0002 (gate `.gsap`), ADR-0001, ADR-0006 (design e motion congelados — critério render-preserving)
