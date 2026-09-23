# ADR-0002: Gate de motion pela classe `gsap` no `<html>` (inline script) como estratégia de initial-state e reduced-motion

- **Status:** Accepted (2026-09-23, Matheus Melo)
- **Date:** 2026-09-23
- **Deciders:** Usuário (owner do repositório) — drafted by Frontend Architect

## Context

`frontend-architecture-conventions.md § Animation` prescreve dois mecanismos:

1. "Every animation module declares reduced-motion behavior with `gsap.matchMedia()` — `(prefers-reduced-motion: reduce)` branch either skips motion or uses instant `set()`; this is mandatory."
2. "Elements that animate *in* start hidden via a token class (`opacity-0` / `invisible`) and `useGSAP` (layout-effect timing) sets the tween; hydration never shows the pre-animation frame."

`§ Routing, Layouts & Boundaries` acrescenta: "Metadata via `generateMetadata` / `metadata` export — never hand-rolled `<head>` tags."

O projeto resolve os mesmos três problemas (flash de conteúdo pré-animação, reduced-motion, ausência de JS) com **um único gate**:

- `app/layout.tsx:26-35` — `<script dangerouslySetInnerHTML>` bloqueante no `<head>`:
  `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('gsap')}}catch(e){}`
- `app/globals.css:262-285` — alvos de reveal ficam ocultos **somente** sob `.gsap`:
  `.gsap [data-reveal], .gsap [data-reveal-group] > * { opacity: 0 }`, `.gsap [data-hero-copy], .gsap [data-heading-block] { opacity: 0 }`, `.gsap [data-sweep] { --train: 100% }`, `.gsap .hero-ribbon { opacity: 0 }`.
- Os módulos de motion saem cedo sem a classe: `components/scroll-effects.tsx:20`, `components/overscroll.tsx:18`, `components/hero-ribbon.tsx:57`. Exceção: `components/hero-ring.tsx:57` consulta `window.matchMedia` diretamente (auditoria D-20).
- `README.md:64-67` documenta o comportamento.

Propriedades do mecanismo atual:
- **Sem JS:** a classe nunca é adicionada; a página renderiza completa e estática. Com a abordagem da convention (`opacity-0` no markup), usuários sem JS veriam conteúdo invisível.
- **Reduced-motion:** custo zero de JS — nenhum módulo chega a registrar plugins ou criar ScrollTriggers.
- **Sem flash:** o script roda antes do primeiro paint, então o CSS já esconde os alvos quando o HTML é pintado; a hidratação não mostra o frame pré-animação.
- **Custos:** (a) é um `<head>` manual, o que o texto do § Routing veta (a regra visa metadata, mas é absoluta); (b) inline script exige `nonce` ou hash quando uma CSP for adotada (`frontend-security-conventions.md § Next.js Surface Map`); (c) uma mudança de `prefers-reduced-motion` durante a sessão não é honrada (o `gsap.matchMedia()` reagiria); (d) existem dois mecanismos (gate + `matchMedia` direto no ring).

A decisão precisa ser tomada agora porque T-05 (migração para `useGSAP`) e T-16 dependem de saber se o gate é o mecanismo oficial ou se cada módulo deve ganhar `gsap.matchMedia()`.

## Decision

Aceitar o gate `html.gsap` como o **mecanismo oficial e único** deste projeto para initial-state, reduced-motion e ausência de JS, substituindo `gsap.matchMedia()` por módulo e as classes `opacity-0` no markup. Condições:

1. **Um único ponto de decisão.** O script em `app/layout.tsx` é o único lugar que avalia `prefers-reduced-motion` para fins de motion. Nenhum módulo chama `window.matchMedia` por conta própria; `hero-ring.tsx:57` migra para checar a classe (T-16), mantendo o `set()` estático do hemisfério traseiro como branch reduced-motion.
2. **Todo módulo de motion respeita o gate** com a mesma guarda (`if (!document.documentElement.classList.contains('gsap')) return;`) — extraída para `lib/gsap.ts` como `motionEnabled()` no T-05.
3. **CSS de ocultação só sob `.gsap`.** Nenhuma regra fora do prefixo `.gsap` pode esconder conteúdo que uma animação revele. Isso é verificável no E2E de T-04: com `reducedMotion: 'reduce'`, todo `[data-reveal]`/`[data-heading-block]` tem `opacity: 1` sem JS de motion.
4. **CSP.** Quando uma Content-Security-Policy for introduzida (Frontend Security Engineer), o script recebe `nonce` gerado por request em `middleware.ts`/`headers()` — a exceção à regra "no hand-rolled `<head>`" cobre **apenas** este script, que deve permanecer de uma linha, sem dependências, com `try/catch`.
5. **Mudança de preferência em sessão** é aceita como não suportada (o usuário recarrega). Se algum módulo futuro precisar reagir ao vivo, ele adiciona `gsap.matchMedia()` **além** do gate, não em substituição.
6. **Revisão programada:** T-16b avalia substituir o inline script por CSS puro — `@media (scripting: enabled) and (prefers-reduced-motion: no-preference)` — o que eliminaria o `<head>` manual e a preocupação de CSP. Se o suporte de browsers do público-alvo for adequado, este ADR é *Superseded*.

## Consequences

- **Positive:** um mecanismo em vez de N; página funcional sem JS e sob reduced-motion com zero custo; sem flash; menos código por módulo (nenhum `matchMedia` boilerplate); comportamento já em produção e testado.
- **Negative:** exceção explícita a "never hand-rolled `<head>` tags"; dependência de nonce quando a CSP chegar; preferência não reativa em sessão; o gate é global — um módulo futuro que esqueça a guarda (condição 2) roda sob reduced-motion sem que o CSS o denuncie (mitigação: `motionEnabled()` centralizado + teste E2E).
- **Neutral:** a convention `§ Animation` continua a valer para tudo o mais (transform/opacity, `once: true`, durações por token, sem loops sem propósito); o `useGSAP` continua obrigatório (T-05) — este ADR não o dispensa.

## Alternatives Considered

- **`gsap.matchMedia()` por módulo + `opacity-0` no markup (a convention literal)** — rejeitada: sem JS o conteúdo fica invisível a menos que se adicione `<noscript>` CSS ou `@media (scripting: none)`; sob reduced-motion cada módulo ainda executa e registra plugins; código repetido em cada módulo.
- **`next/script` com `strategy="beforeInteractive"`** — rejeitada por ora: continua sendo um script inline (mesma exigência de nonce), é injetado após o `<head>` gerado pelo Next e não garante execução antes do primeiro paint em todos os casos; não remove o custo, só o move.
- **CSS-only via `@media (scripting: enabled)`** — considerada e **preferida a médio prazo** (condição 6); não adotada já porque o suporte de browsers do público-alvo não foi verificado e porque os módulos JS ainda precisariam de uma guarda (`matchMedia`), reintroduzindo o segundo mecanismo.
- **Remover o gate e aceitar flash/ausência sem JS** — rejeitada: regressão de acessibilidade e de qualidade percebida.

## References

- `docs/architecture/conventions-audit.md` — D-14, D-20, D-21, T-05, T-16, T-16b
- `frontend-architecture-conventions.md` — § Animation, § Routing, Layouts & Boundaries
- `frontend-security-conventions.md` — § Next.js Surface Map (CSP nonce)
- `design-conventions.md` — § Motion Principles (reduced-motion mandatory)
- `app/layout.tsx:26-35`, `app/globals.css:262-285`, `README.md:64-67`
- Relacionados: ADR-0003 (controlador headless), ADR-0001
