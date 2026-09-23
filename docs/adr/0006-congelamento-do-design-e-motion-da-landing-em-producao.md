# ADR-0006: Congelamento do design e da motion da landing em produção — toda migração é *render-preserving*

- **Status:** Accepted (2026-09-23, Matheus Melo)
- **Date:** 2026-09-23
- **Deciders:** Usuário (owner do repositório) — decisão comunicada em 2026-09-23; drafted by Frontend Architect

## Context

A auditoria `docs/architecture/conventions-audit.md` encontrou deviations cujo alvo de convention implicaria **mudar o que o usuário final vê** na landing em produção:

- **Motion (D-23, D-24)** — `frontend-architecture-conventions.md § Animation`: "none may run on a loop without a purpose stated in the spec"; "pinning/scrubbing only when the spec's motion intent asks for it"; "Durations and easings come from `design-conventions.md § Motion Principles`". `design-conventions.md § Motion Principles`: "Orchestrated reveal (one per page) … ≤ 800 ms total; stagger ≤ 60 ms"; "Fade-and-slide-up on every section … is the generic default — do not ship it"; "Spend expressiveness in one place per screen". O projeto tem marquee infinito (`app/globals.css:68,71-74`; `components/scroll-effects.tsx:103-108`), ring em rotação contínua (`components/hero-ring.tsx:85`), seções empilhadas com `pin`+`scrub` (`components/overscroll.tsx:67-84`), band com `scrub` (`scroll-effects.tsx:158-174`), reveal em praticamente toda seção (`[data-reveal]`, `[data-reveal-group]`, `[data-heading-block]` em todo `SectionHeading`, `components/ui.tsx:78`) e timeline do hero de ~2,5 s com staggers de 0.08–0.16 s (`scroll-effects.tsx:181-225`).
- **Tipografia e cor (X-1, X-3)** — `design-conventions.md § Typography`: "Sentence case everywhere. No all-caps labels, no tracked-out eyebrow labels"; "not the default sans you would reach for on any project". O projeto usa display e eyebrows em ALL-CAPS tracked-out (`globals.css:112-211`) e Arial como body (`globals.css:14`), conforme `vamosany-design-system.md § 3`. Light-only, sem dark variant.
- **Copy e placeholders (X-4)** — `design-conventions.md § UX Writing`: CTAs dizem o que acontece. O projeto tem "Join" (`components/cta.tsx:61`), "Learn more" (`components/how-it-works.tsx:64`), links `href="#"` (`components/footer.tsx:87,104,129,173,204`) e um mega menu com ~48 páginas inexistentes (`components/navbar.tsx:11-160`).
- **Tokens e imagens (D-17, D-18, D-26)** — as migrações propostas (tokenizar arbitrary values, `--color-*: initial`, `next/image` no ring, logo em SVG) são refactors que *poderiam* alterar pixels se feitos sem cuidado.

Decisão do usuário (2026-09-23): **nenhuma mudança no design existente da landing em produção**. Qualquer deviation que toque output visual ou de motion deve ser (a) aceita por ADR ou (b) migrada preservando o resultado renderizado.

A decisão precisa ser registrada agora porque ela redefine o critério de aceite de ~20 tasks do plano de migração e resolve as questões Q6 e Q7 da auditoria.

## Decision

1. **O output atual é o baseline de referência.** O que a landing renderiza no commit `29f5546` — layout, tipografia, cores, copy, imagens, estados de interação visíveis (hover, tabs, menus) e toda a motion (timelines, ScrollTriggers, loops, pin/scrub, durações, easings, staggers, comportamento sob `prefers-reduced-motion` e sem JS) — é aceito como está, inclusive onde contraria `design-conventions.md § Motion Principles / § Typography / § UX Writing` e `frontend-architecture-conventions.md § Animation` (loops sem spec, pin/scrub sem spec, durações fora de token).

2. **Oráculo de regressão obrigatório (T-04, pré-requisito das Fases 2–4).** Playwright gera e commita um baseline a partir do commit atual:
   - screenshots full-page em 360 / 768 / 1280, em três condições: *idle* (topo, antes de qualquer scroll), *scrolled* (após scroll completo, com todos os reveals disparados) e *reduced-motion* (`reducedMotion: 'reduce'`, que também cobre o caminho sem `.gsap`);
   - screenshots dos estados de interação: cada tab de `SampleDay` e `PlanningTimeline`, mega menu aberto (desktop), drawer aberto (360), menu de idioma aberto;
   - um trace de scroll (`page.screenshot` a intervalos fixos de `scrollY` ou `video`) do hero e da sequência de overscroll, como oráculo da motion.
   Todo PR das Fases 2–4 executa a comparação; **diff esperado = 0** (tolerância apenas para anti-aliasing, definida no `playwright.config.ts`).

3. **Rótulo *Render-Preserving*.** Tasks que tocam componentes, CSS ou motion carregam este rótulo ao lado de *Pre-Contract*/*Draft*/*ADR-NNNN*; o commit body cita o resultado da comparação ("Visual diff: 0 px em 27 screenshots"). O Reviewer trata diff ≠ 0 como **BLOCKING**.

4. **Regras de migração derivadas** (detalhadas na auditoria § 4):
   - Tokens (ADR-0004, T-14): novos tokens recebem exatamente os valores hoje literais; `--color-*: initial` só entra com diff 0; consolidar duplicatas não muda valores.
   - Motion (ADR-0002, ADR-0003, T-05, T-16, T-17): `useGSAP`, `lib/gsap.ts`, `lib/motion.ts` copiam os valores atuais 1:1; nenhuma duração, easing, stagger, `start`/`end` de ScrollTrigger ou ordem de timeline muda; o spike de CSS scroll-driven animations (T-17b) só é adotado se indistinguível.
   - Imagens (T-19): `next/image` no ring mantém `object-position` e crop; logo SVG deve ser pixel-equivalente nos três tamanhos usados; `priority` opt-in não altera render, só preload.
   - Leaves client (T-10) e a11y (T-24): mudam semântica, foco e ARIA, não pixels; `<dialog>` nativo só se os UA styles forem neutralizados ou o markup atual for mantido com focus trap manual.
   - Formulários (T-13): estado *idle* pixel-idêntico; estados *pending/error/success* não existem hoje e **só entram com copy e visual aprovados** pelo UX Strategist (são adições, não alterações — o usuário decide se as quer).
   - Páginas novas (T-11: `not-found.tsx`, `global-error.tsx`): não alteram a landing; precisam de spec do UX Strategist.
   - `next/dynamic` (T-19b): só se não atrasar perceptivelmente o primeiro frame animado; caso contrário, manter import estático e registrar a exceção de budget.

5. **Formalização de design (owner: UX Strategist).** Este ADR não substitui os DDRs; ele os exige:
   - DDR "Motion intent da landing" — retro-spec documental (T-18) descrevendo cada cena e seu propósito, registrando a exceção a § Motion Principles;
   - DDR "Direção tipográfica Vamos a NY" (ALL-CAPS display/eyebrows, Arial body) e, se ainda não houver, Constitution › Experience Principles com *Motion stance: expressive*;
   - DDR "Dark mode deferido";
   - DDR (ou item de dívida de produto) para copy/placeholders (X-4), a revisitar quando a landing crescer (Q5).

6. **Gatilhos de supersessão.** Uma decisão do usuário de redesenhar (parcial ou totalmente) a landing, ou a chegada de uma spec *Ready for /plan* do UX Strategist que altere seções existentes, supersede este ADR para o escopo alterado; as tasks afetadas perdem o rótulo *Render-Preserving* e passam pelo fluxo normal (`/specify` → `/plan` → `/tasks`).

## Consequences

- **Positive:** o usuário final não percebe a modernização; risco de regressão visual em produção cai para o que o oráculo não cobre; cada refactor tem critério de aceite objetivo (diff = 0) em vez de julgamento; os agentes têm resposta única para "isso pode mudar o visual?" — não.
- **Negative:** o projeto carrega, documentadamente, deviations de design que as conventions consideram anti-patterns (motion em todas as seções, loops, ALL-CAPS, copy genérica); melhorias óbvias de UX (CTA "Join", links mortos, estados de erro do formulário) ficam bloqueadas até nova decisão; o baseline de screenshots é sensível a fontes/renderização (mitigação: rodar no container do CI com fonte auto-hospedada via `next/font`, e a Arial do sistema fixada no runner — ou aceitar tolerância em texto Arial, documentada no `playwright.config.ts`); manter o trace de motion como oráculo exige disciplina (timing de ScrollTrigger depende de viewport e de `document.fonts.ready`).
- **Neutral:** as conventions continuam sendo o alvo para *conteúdo novo*; este ADR congela o *existente*. `frontend-architecture-conventions.md § Animation` e `design-conventions.md § Motion Principles` permanecem válidas para qualquer seção ou cena futura.

## Alternatives Considered

- **Aplicar `design-conventions.md` literalmente** (uma cena de hero ≤ 800 ms, cortar reveals por seção, remover loops, sentence case, CTAs explícitos) — rejeitada por decisão do usuário: alteraria o produto em produção sem demanda de negócio.
- **Aceitar só a motion e migrar tipografia/copy** — rejeitada: a decisão do usuário cobre todo o design; além disso, tipografia e copy são as mudanças mais visíveis.
- **Congelar sem oráculo automatizado (revisão visual manual por PR)** — rejeitada: não escala para ~20 tasks e não detecta regressões de 1–2 px em tokens/sombras; o baseline Playwright custa uma task (T-04) que o plano já exige.
- **Congelar tudo, inclusive semântica e a11y** — rejeitada: focus trap, ARIA correta e leaves client não mudam pixels e são exigências de `§ Accessibility`; a decisão do usuário é sobre design, não sobre engenharia invisível.

## References

- `docs/architecture/conventions-audit.md` — D-13, D-16, D-17, D-18, D-23, D-24, D-26, D-27, D-30, X-1..X-4, T-04, T-10, T-11, T-13, T-14, T-16, T-17, T-17b, T-18, T-18b, T-19, T-19b, T-24, Q6 e Q7 (resolvidas)
- `frontend-architecture-conventions.md` — § Animation, § Styling, § Performance Budgets, § Accessibility, § Engineering Workflow (labels), § Review Report Template (BLOCKING)
- `design-conventions.md` — § Motion Principles, § Typography, § Color, § UX Writing, § Anti-Patterns, § DDR Template
- `vamosany-design-system.md` — §§ 3, 16, 19
- Relacionados: ADR-0002 (gate `.gsap`), ADR-0003 (controlador headless), ADR-0004 (tokens), ADR-0005 (npm/Vercel)
