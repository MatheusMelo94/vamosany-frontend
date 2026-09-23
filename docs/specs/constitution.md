# Constitution: vamosany-front-end v1

- **Status:** Accepted
- **Accepted:** 2026-09-23 by Matheus Melo
- **Date:** 2026-09-23
- **Owner:** Matheus Melo
- **Inherits:** `vamosany-back/CONSTITUTION.md` v2.3 (Accepted, 2026-06-06). Users, Problem, Why Now, Success Criteria, Non-Goals e Constraints do produto sao os do backend e nao sao repetidos aqui. Este documento so adiciona o que e exclusivo do frontend.

> Binding para toda feature spec em `vamosany-front-end`. Imutavel apos *Accepted*; mudancas criam v2.

## Users
Herdado do backend § Users: **Curator** (Backoffice) e **Traveler** (app do viajante, read-only, self-scoped).
Adicao do frontend: **Visitor** — pessoa que chega ao site publico antes de ser cliente, majoritariamente no celular. A landing atual serve este papel.

## Problem
Herdado do backend § Problem.

## Why Now / Why This Way
Herdado do backend § Why Now / Why This Way.
Adicao do frontend: o site hoje e uma landing single-page em producao. O produto vai crescer para muitas paginas e, depois, para o dashboard do Traveler no mesmo repo. Esta constituicao existe para que cada feature nova passe pelo gate de spec sem reescrever o que ja esta no ar.

## Success Criteria (v1)
Herdado do backend § Success Criteria. Site publico: nenhuma metrica propria em v1. A primeira feature spec de marketing define a metrica de conversao e amenda esta constituicao (v2).

## Non-Goals
Herdado do backend § Non-Goals.
Adicao do frontend:
1. Nao redesenhar o que esta em producao hoje. O design atual (tokens, tipografia, layout, motion) e a baseline; mudancas visuais na landing existente exigem DDR.
2. Nao expor conteudo de itinerario nao publicado nem dados de outro Traveler (espelha o backend § Two-Frontend Model).

## Constraints
Herdado do backend § Constraints.
Adicao do frontend:
- Stack: Next.js 15 App Router, React 19, TypeScript 5, Tailwind CSS 4, GSAP 3.
- Design system de record: `vamosany-design-system.md` e os tokens em `app/globals.css`.
- Contrato de API: o `/plan` e `SPECIFICATION.md` do `vamosany-back`.

## Experience Principles
- **Promise:** Um itinerario de Nova York que parece feito por alguem que mora la, nao por um algoritmo.
- **Voice:** editorial, direta, calorosa — nunca generica de agencia.
- **Devices & breakpoints of record:** 360 (phone) e 1280 (desktop) como primeira classe; 768 best-effort. Reflete o uso atual de `sm:` e `lg:` no codigo.
- **Motion stance:** expressive. O hero atual (SplitText, CustomEase, ScrollTrigger) e a referencia e permanece como esta. Novas paginas seguem `design-conventions.md § Motion Principles` (um momento expressivo por tela) salvo DDR.
- **Accessibility floor:** WCAG 2.2 AA. `prefers-reduced-motion` obrigatorio em todo modulo de animacao (ja presente no codigo atual).
- **Language(s):** espanhol primeiro, portugues segundo, ingles terceiro. Copy de produto e escrito nos tres. i18n de rotas e conteudo e decisao do Frontend Architect (ADR).
