# ADR-0008: Reveals de entrada usam `opacity`, não `autoAlpha`, quando o alvo é ou contém conteúdo focável ou legível

- **Status:** Accepted (2026-09-26, Matheus Melo)
- **Date:** 2026-09-26
- **Deciders:** Matheus Melo (único aprovador) — drafted by Frontend Architect

## Context

`frontend-architecture-conventions.md § Animation (GSAP 3)` diz: "Animate `transform` and `opacity` (use `autoAlpha`)", e sobre o initial state: "elements that animate *in* start hidden via a token class (`opacity-0` / `invisible`)". A spec `docs/specs/sobre-mi/spec.md` § Motion Intent M1–M7 também descreve os reveals como `autoAlpha: 0`.

`autoAlpha` é `opacity` mais `visibility: hidden` enquanto a opacidade é 0. Com `visibility: hidden`, o elemento e seus descendentes **saem da ordem de tabulação e da árvore de acessibilidade**. Num reveal disparado por scroll (`once: true`, `top 88%`), isso significa que:

- um usuário de teclado que tabula página abaixo **pula** campos de formulário, botões e links que ainda não foram revelados (o foco vai direto para o footer, ou fica preso antes do bloco);
- leitores de tela em modo de navegação não encontram parágrafos, notas e o formulário até que o scroll visual aconteça (o que pode nunca ocorrer para quem navega sem scroll visual);
- o gêmeo `sr-only` do contador "+20 visitas" saiu da árvore de forma intermitente durante a entrada (observado pelo Engineer).

O Engineer usou `opacity` em todos os reveals das páginas Sobre mí (`features/sobre-mi/motion/scenes/{reveals,entrance,sobre-mi,colaboraciones,trabaja-conmigo,contacto,faq,form-feedback}.ts`), com a razão documentada em `reveals.ts` e nos commits. O Reviewer concorda no mérito, mas registrou RV-0003 (`docs/reviews/2026-09-26_sobre-mi_v1.md`): a regra é quebrada na feature inteira e só há registro em commit bodies.

A landing em produção (congelada, ADR-0006) já faz o mesmo: `.gsap [data-reveal] { opacity: 0 }` e tweens de `opacity` em `features/landing/motion/scroll-effects.tsx`. Ou seja, a prática real do projeto já diverge da convention desde antes desta feature.

A decisão precisa ser tomada agora porque o M4 está implementado com `opacity`, e a próxima feature com reveals vai esbarrar na mesma regra.

## Opções

**A. Exceção escopada** (este projeto, features Sobre mí e landing): mantém a convention como está e registra que estes módulos usam `opacity`.
- A favor: mudança mínima; não mexe em convention compartilhada.
- Contra: o problema não é desta feature, e sim de **qualquer** reveal por scroll de conteúdo focável ou legível. Toda feature futura com reveals precisaria de outro ADR, ou repetiria o bug de acessibilidade seguindo a convention ao pé da letra. Uma regra que o próprio projeto não consegue seguir sem violar WCAG (2.1.1 Keyboard, 1.3.1/4.1.2 via árvore de acessibilidade, 2.4.3 Focus Order) é um defeito da convention, não uma exceção.

**B. Emenda da convention** (recomendada): `§ Animation` passa a dizer quando usar cada propriedade. `opacity` para reveals de entrada de conteúdo que existe e deve ser alcançável; `autoAlpha` para elementos que de fato **não devem** ser alcançáveis enquanto invisíveis (saídas, overlays fechados, camadas decorativas, conteúdo que só existe após uma ação do usuário).
- A favor: corrige a regra na fonte, para todos os projetos que usam a convention; alinha a convention à prática já aprovada (landing, ADR-0006) e ao `design-conventions.md § Accessibility Baseline` ("A full keyboard path exists for every journey").
- Contra: altera uma convention compartilhada (o usuário aprova); `opacity: 0` deixa um elemento focável enquanto invisível. Isso exige a salvaguarda de foco abaixo, para não violar WCAG 2.4.7 (Focus Visible).

## Decision

**Opção B: emendar `frontend-architecture-conventions.md § Animation (GSAP 3)`**, com o texto proposto abaixo. Este ADR não edita o arquivo de convention; após a aceitação, a emenda é aplicada num commit `docs:` próprio, citando este ADR.

Condições que valem já, para as páginas Sobre mí, e passam a valer para qualquer reveal futuro:

1. **Reveal de entrada de conteúdo focável ou legível → `opacity`** (mais transform). O initial state continua `opacity: 0` sob o gate `.gsap` (ADR-0002; nas páginas Sobre mí, `.gsap [data-sm-scene] …`). Nunca `visibility: hidden`, `invisible`, `display: none` nem `aria-hidden` num alvo de reveal.
2. **Salvaguarda de foco (obrigatória):** o elemento pode receber foco enquanto está em `opacity: 0`, e focar nem sempre cruza o `start` do ScrollTrigger (um campo alto pode parar logo abaixo de `top 88%`). Cada controlador que faz reveals registra um listener de `focusin` no escopo da cena (`contextSafe`). Quando o alvo focado, ou um ancestral, é um alvo de reveal ainda não revelado, o listener completa a animação imediatamente (`tween.progress(1)` / `scrollTrigger` + `timeline.progress(1)`), para que o foco nunca fique num elemento invisível. O E2E cobre isso: tabular do topo até o último campo do formulário, com motion ligado, deixa cada elemento focado com opacidade computada 1.
3. **`autoAlpha` continua sendo o padrão para:** saídas (fade-out de algo que deixa de existir para o usuário); overlays, menus e diálogos fechados; camadas puramente decorativas (`aria-hidden`); e conteúdo que só deve ser alcançável depois de uma ação do usuário.
4. **Aplicação retroativa:** nenhum código muda. As páginas Sobre mí já seguem as condições 1 e 3. A condição 2 vira item de verificação do Reviewer no fechamento de RV-0003; se o `focusin` ainda não existir, vira task do Engineer. A landing (congelada) já usa `opacity` e não é alterada; a salvaguarda de foco na landing fica como item de backlog *Render-Preserving* (sem mudança de pixel).
5. **Spec:** o texto da spec (M1–M7, "autoAlpha") descreve intenção visual, e o resultado visual é idêntico. O UX Strategist é informado, e numa próxima emenda da spec "autoAlpha" vira "opacity" nesses itens.

### Emenda proposta (para aplicar em `frontend-architecture-conventions.md § Animation (GSAP 3)` após a aceitação)

```diff
- - Animate `transform` and `opacity` (use `autoAlpha`); never animate `width`/`height`/`top`/`left`/`margin` — use Flip for layout changes.
+ - Animate `transform` and `opacity`; never animate `width`/`height`/`top`/`left`/`margin` — use Flip for layout changes.
+   - **Entrance reveals of content that is, or contains, focusable or readable elements** (text, links, buttons, form fields) animate `opacity`, **not** `autoAlpha`: `autoAlpha`'s `visibility: hidden` removes not-yet-revealed content from the tab order and the accessibility tree, which breaks the keyboard path and screen-reader browsing.
+   - Such reveals must never leave focus on an invisible element: the controller listens for `focusin` in its scope and completes the reveal of the focused target (or its revealed ancestor) at once.
+   - Use `autoAlpha` for exits, closed overlays/menus/dialogs, decorative layers (`aria-hidden`), and content that must not be reachable until a user action reveals it.
- - Initial state is set to avoid flash-of-unstyled/unanimated content: elements that animate *in* start hidden via a token class (`opacity-0` / `invisible`) and `useGSAP` (layout-effect timing) sets the tween; hydration never shows the pre-animation frame.
+ - Initial state is set to avoid flash-of-unstyled/unanimated content: elements that animate *in* start at `opacity: 0` (never `invisible`/`visibility: hidden` for focusable or readable content — see above) and `useGSAP` (layout-effect timing) sets the tween; hydration never shows the pre-animation frame. Where the project uses a motion gate (e.g. ADR-0002's `.gsap` class), the hidden initial state applies only under the gate, so no-JS and reduced motion render content visible.
```

## Consequences

- **Positive:** usuários de teclado e de leitor de tela alcançam todo o conteúdo e os formulários, independentemente da posição de scroll; a convention passa a refletir a prática em produção (landing) e a implementação Sobre mí; features futuras não precisam de um ADR por reveal; RV-0003 fecha sem mudança de código.
- **Negative:** muda uma convention compartilhada (todos os papéis passam a segui-la); elementos em `opacity: 0` são focáveis e legíveis antes de ficarem visíveis, então a salvaguarda de `focusin` vira uma obrigação nova de todo controlador de reveal, e esquecê-la é finding de review. Usuários de leitor de tela podem ouvir o conteúdo antes de ele aparecer visualmente, o que é intencional.
- **Neutral:** nenhuma mudança de pixel; o resultado visual de `opacity` e `autoAlpha` é idêntico durante a entrada. A verificação do Reviewer deixa de ser "usa autoAlpha" e passa a ser "usa a propriedade certa das duas".

## Alternatives Considered

- **A. Exceção escopada (só Sobre mí e landing)** — rejeitada: o defeito está na regra, não na feature; cada novo reveal exigiria outro ADR ou repetiria o mesmo bug de acessibilidade.
- **Manter `autoAlpha` e revelar tudo no primeiro `Tab`, ou ao detectar leitor de tela** — rejeitada: leitores de tela não são detectáveis de forma confiável, uma heurística de teclado não cobre a navegação por cursor virtual, e acrescenta estado global para um problema que `opacity` resolve.
- **Manter `autoAlpha` com `inert`/`visibility` tratados por elemento** — rejeitada: continua escondendo o conteúdo da árvore de acessibilidade antes do scroll, que é justamente o problema.
- **Não animar conteúdo focável** (só texto não interativo) — rejeitada: o DDR-0004 aceitou reveals em campos de formulário e closing rows, e a motion congelada da landing faz o mesmo.

## References

- `docs/reviews/2026-09-26_sobre-mi_v1.md` — RV-0003 (and its drift note)
- `features/sobre-mi/motion/scenes/reveals.ts` — the Engineer's rationale; also `entrance.ts`, `sobre-mi.ts`, `colaboraciones.ts`, `trabaja-conmigo.ts`, `contacto.ts`, `faq.ts`, `form-feedback.ts`
- `features/landing/motion/scroll-effects.tsx`, `app/globals.css` (`.gsap [data-reveal] { opacity: 0 }`) — existing practice, frozen by ADR-0006
- `frontend-architecture-conventions.md` § Animation (GSAP 3), § Accessibility (engineering rules); `design-conventions.md` § Accessibility Baseline, § Motion Principles
- ADR-0002 (`.gsap` gate), ADR-0003 (headless controller), ADR-0006 (frozen landing); DDR-0004 (Sobre mí motion)
- `docs/specs/sobre-mi/spec.md` § Motion Intent M1–M7 (written as `autoAlpha`)
- WCAG 2.2: 2.1.1 Keyboard, 2.4.3 Focus Order, 2.4.7 Focus Visible, 4.1.2 Name, Role, Value
