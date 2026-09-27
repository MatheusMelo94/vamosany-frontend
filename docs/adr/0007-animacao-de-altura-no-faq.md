# ADR-0007: Animação de `height` no disclosure do FAQ (`<details>` nativo + GSAP)

- **Status:** Accepted (2026-09-26, Matheus Melo)
- **Date:** 2026-09-26
- **Deciders:** Matheus Melo (único aprovador) — drafted by Frontend Architect

## Context

`frontend-architecture-conventions.md § Animation` diz: "Animate `transform` and `opacity` (use `autoAlpha`); never animate `width`/`height`/`top`/`left`/`margin` — use Flip for layout changes." `design-conventions.md § Motion Principles` põe "Layout change (reorder, expand)" em GSAP Flip.

A spec `docs/specs/sobre-mi/spec.md` § Motion Intent M7 (aceita pelo DDR-0004) pede para o FAQ: abrir = altura da resposta 0 → auto, 0.4 s, `ds`; fechar = altura → 0, 0.3 s, `power2.inOut`; tudo sobre `<details>`/`<summary>` nativos, que precisam funcionar sem JS (AC 49) e abrir/fechar instantaneamente em reduced motion (AC 47). A spec já registra esta animação como "the one layout-affecting exception, and only runs on user action" (§ Motion Intent › Global rules). O usuário decidiu o mecanismo ("native `<details>` with GSAP height animation") ao aprovar o mockup (`toggleDetails()` em `docs/design/mockups/sobre-mi-cuaderno.html`).

Por que a alternativa da convention não serve:
- **Flip** anima um container que muda de tamanho aplicando `scaleY` e corrigindo depois. Numa resposta de texto isso achata as letras durante o movimento (a menos que cada filho receba uma contra-escala, o que é frágil com listas e parágrafos que quebram linha).
- **CSS nativo** (`interpolate-size: allow-keywords` + `::details-content`) não é GSAP, não permite as curvas `ds`/`power2.inOut` da spec de forma consistente e ainda não tem suporte em Safari e Firefox.

## Decision

Permitir, **somente** para o disclosure do FAQ em `/preguntas-frecuentes`, que o GSAP anime `height` do wrapper da resposta (`[data-sm-faq-answer]`, `overflow: hidden`), com estas condições:

1. **Só por ação do usuário.** Nenhuma animação de altura no load; o deep link (`#pergunta`) abre sem animação (spec M7).
2. **Gate `.gsap` (ADR-0002).** Sem `.gsap` (sem JS ou reduced motion) o controlador não intercepta o `summary`, e o `<details>` nativo abre e fecha instantaneamente.
3. **Nenhum estado preso.** Ao terminar, `clearProps: "height"`; o estado de verdade continua sendo `details.open`. Se chegar um novo clique durante a animação, ela é revertida para o estado alvo, sem fila.
4. **Valores em `lib/motion.ts`** (`MOTION.faq.open`, `MOTION.faq.close`).
5. **Escopo fechado.** Qualquer outro accordion ou expand futuro volta à convention (Flip ou transform), a menos que um novo ADR o inclua.

## Consequences

- **Positive:** a spec aprovada é entregue como foi desenhada; o conteúdo abaixo desliza em vez de pular; o fallback nativo cobre sem-JS e reduced motion sem nenhum código.
- **Negative:** é uma exceção documentada a `§ Animation`: animar `height` força layout a cada frame durante 0.3–0.4 s. O custo é aceitável para um único bloco de texto por clique, mas não se deve generalizar. O deslocamento do conteúdo abaixo não conta como CLS (acontece até 500 ms depois de uma entrada do usuário), o que o QA deve confirmar no Lighthouse.
- **Neutral:** o Reviewer passa a aceitar `height` apenas em `features/sobre-mi/motion/scenes/faq.ts`; em qualquer outro arquivo continua sendo finding.

## Alternatives Considered

- **Flip no `<details>`** — rejeitada: distorce o texto (scaleY) ou exige contra-escala por filho.
- **`clip-path` / `scaleY` na resposta, sem mexer na altura** — rejeitada: o conteúdo abaixo pularia de uma vez no início ou no fim da animação (a spec pede que ele deslize).
- **CSS `interpolate-size` + `::details-content`** — rejeitada por ora: sem suporte em Safari/Firefox e fora do vocabulário GSAP da spec. Reavaliar quando houver suporte amplo; se for adotado, este ADR vira *Superseded*.
- **Sem animação (toggle nativo sempre)** — rejeitada: a spec M7 e o DDR-0004 pedem a animação.

## References

- `docs/specs/sobre-mi/spec.md` — § Motion Intent (Global rules, M7), AC 47–49
- `docs/specs/sobre-mi/plan.md` — § Motion strategy; `docs/tech-design/sobre-mi.md`
- DDR-0004 (motion das páginas Sobre mí); ADR-0002 (gate `.gsap`); ADR-0003 (controlador headless)
- `frontend-architecture-conventions.md` § Animation (GSAP 3); `design-conventions.md` § Motion Principles
- Mockup aprovado: `toggleDetails()` em `docs/design/mockups/sobre-mi-cuaderno.html`
