# ADR-0001: Adoção incremental do Stack Baseline em projeto legado (landing estática)

- **Status:** Accepted (2026-09-23, Matheus Melo)
- **Date:** 2026-09-23
- **Deciders:** Usuário (owner do repositório) — drafted by Frontend Architect

## Context

`mobbin-front-text` (Vamos a NY landing) é um projeto legado em produção: uma única rota (`app/page.tsx`) que compõe 12 seções de marketing, sem leitura nem escrita de dados, sem autenticação, sem secrets. Foi criado antes de `frontend-architecture-conventions.md` existir e o `§ Stack Baseline` não foi aplicado integralmente.

Auditoria completa em `docs/architecture/conventions-audit.md` (D-01..D-09). Estado do setup em `package.json:11-24`, `next.config.ts:3`, `tsconfig.json`, `postcss.config.mjs`:

| Item do § Stack Baseline | Baseline | Atual | Decisão |
|---|---|---|---|
| Framework | Next.js 15.x App Router | Next 15.5 (`^15.5.4`, instalado 15.5.25), App Router only | Conforme |
| UI runtime | React 19 | React `^19.1.1` (instalado 19.3.0) | Conforme |
| Language | TS 5.x `strict: true` | TS `^5.9.2`, `strict: true` (`tsconfig.json:7`); faltam `noUncheckedIndexedAccess`/`noImplicitOverride` | **Migrar** (T-07b) |
| Styling | Tailwind 4 via `@tailwindcss/postcss`, CSS-first | `tailwindcss ^4.1.13`, `@theme` em `app/globals.css:13`, sem `tailwind.config.js` | Conforme |
| Animation | GSAP 3.13+ com `@gsap/react` | `gsap ^3.15.0`; **sem** `@gsap/react` | **Migrar** (T-05) |
| Validation | zod | ausente | **Aceito temporariamente** (ver Decision) — zod entra com `lib/env.ts` (T-23) |
| Runtime | Node 22 LTS | não fixado (sem `engines`/`.nvmrc`) | **Migrar** (T-07; versão via Q2) |
| Package manager | pnpm | npm (`package-lock.json`) | **Aceito** por decisão do usuário → ADR-0005 |
| Lint/format | ESLint 9 flat + `eslint-config-next` + `jsx-a11y`; Prettier + plugin Tailwind | ausentes; `"lint": "next lint"` sem ESLint instalado | **Migrar** (T-02) |
| Unit/component tests | Vitest + RTL + jest-dom + jsdom; MSW | ausentes | **Migrar** (T-03); MSW **aceito ausente** até haver HTTP |
| E2E | Playwright + `@axe-core/playwright` | ausentes | **Migrar** (T-04) |
| Utilities | `clsx` + `tailwind-merge` (`cn()`) | ausentes; classes por template literal | **Migrar** (T-06) |
| Utilities | `server-only` | ausente | **Aceito** — nenhum módulo lê secrets ou dados |
| Utilities | `next/font`, `next/image` | usados (`app/layout.tsx:7-12`; todas as fotos de conteúdo) exceto hero ring | Conforme; ring → T-19 |
| Utilities | `lucide-react` | icon set SVG próprio (`components/icons.tsx`) | **Aceito permanentemente** |
| Backend | HTTP para API companheira ou Server Actions | nenhum | **Aceito** até a primeira dependência de dados |
| Containerization | Docker, `output: 'standalone'` | ausente; produção na Vercel | **Aceito** (Vercel-only) → ADR-0005; CI (`ci.yml`) e `run-local.sh` continuam como **Migrar** (T-20, T-21) |

Ligados ao baseline, os seguintes elementos de `§ App Router Layout`, `§ Data Fetching & Mutations`, `§ Authentication & Session` e `§ Error Handling` também não existem: `lib/api/`, `lib/api/schemas/`, `lib/api/errors.ts` (`AppError`), `lib/api/session.ts` (`getSession`/`requireSession`), `types/` gerados por `openapi-typescript`, `tests/fixtures/msw/`.

A decisão precisa ser tomada agora porque o time de agentes (Engineer, Reviewer, QA, DevOps) opera sob as conventions e precisa saber o que é deviation aceita e o que é dívida com task.

## Decision

Adotar o `§ Stack Baseline` **incrementalmente**, distinguindo três categorias:

### 1. Aceito permanentemente
- **Icon set SVG próprio em vez de `lucide-react`.** `components/icons.tsx` (13 ícones, `viewBox 0 0 20 20`, `currentColor`, `aria-hidden`) é coerente com a direção de marca do design system ("keep geometry slightly raw", `vamosany-design-system.md:786-790`) e evita o look de kit genérico que `design-conventions.md § Anti-Patterns` proíbe. Condições:
  - o registry vive em `components/ui/icons.tsx` e é a **única** exceção aceita à regra "one component per file" (§ App Router Layout), por ser um conjunto homogêneo de funções puras de 8–15 linhas;
  - todo ícone usa `type IconProps = { className?: string }`, `aria-hidden`, `currentColor`, sem cor própria;
  - `ArrowRight` (`components/ui.tsx:106-118`) e os chevrons inline de `components/navbar.tsx:237-252,271-272` migram para o registry (T-08);
  - `lucide-react` pode ser adicionado no futuro **sem novo ADR** apenas para ícones que o registry não tem, desde que re-tokenizados (`size-*`, `currentColor`).

### 2. Aceito enquanto a landing não tiver leitura/escrita de dados
- Ausência de camada de dados: `lib/api/`, `lib/api/schemas/`, `lib/api/errors.ts`, `lib/api/session.ts`, `types/` (OpenAPI), MSW, `server-only`.
- **Gatilho de supersessão:** a primeira dependência de dados (leitura via HTTP, Server Action com backend, secret em env) obriga a criar os módulos correspondentes na mesma feature e a registrar um ADR *Superseded by* este. O candidato imediato é o formulário de newsletter (auditoria D-16, task T-13 *Pre-Contract*): ao ganhar backend, ele traz `features/newsletter/{schemas,actions}.ts`, `lib/api/errors.ts` e o handler MSW.
- zod **não** faz parte desta aceitação: entra já em T-23 (`lib/env.ts`) porque `metadataBase` está hard-coded com domínio placeholder (`app/layout.tsx:15`).

### 3. Dívida com task (não é deviation aceita)
ESLint/Prettier (T-02), Vitest/RTL (T-03), Playwright/axe + baseline visual (T-04), `@gsap/react` (T-05), `cn()` (T-06), Node pin (T-07), flags TS (T-07b), `run-local.sh` e CI (T-20, T-21). Prazo: **antes da próxima feature de produto** — nenhum `/plan` para feature nova é marcado *Ready for /tasks* enquanto T-02..T-07b estiverem abertas, porque `§ Engineering Workflow` (lido com npm: `npm run typecheck && npm run lint && npm test`) não pode ser executado.

Toda task desta lista é **render-preserving** (ADR-0006): nenhuma altera o resultado visual ou de motion da landing em produção.

## Consequences

- **Positive:** o time sabe exatamente o que é aceito e o que é dívida; a landing não recebe camada de dados fictícia (zero código morto "para o futuro"); o icon set mantém a identidade visual sem dependência; a dívida de tooling tem ordem e prazo.
- **Negative:** até T-02..T-04, o projeto não tem rede de segurança (sem lint, sem testes, sem baseline visual); refactors das Fases 2–4 do plano de migração ficam bloqueados atrás da Fase 1; o gatilho de supersessão exige disciplina — um Server Action "rápido" sem `lib/api/errors.ts` seria violação.
- **Neutral:** a estrutura `features/<feature>/` passa a existir só com `features/landing/` e, quando T-13 acontecer, `features/newsletter/`; `types/` continua inexistente até haver contrato OpenAPI.

## Alternatives Considered

- **Migração big-bang para o baseline completo antes de qualquer outra mudança** — rejeitada: introduz `lib/api`, MSW, `session.ts` e `openapi-typescript` sem consumidor, gerando código não testável e falsa sensação de conformidade.
- **Aceitar o setup atual integralmente por ADR ("legado é legado")** — rejeitada: sem lint/tests/typecheck, o `§ Engineering Workflow` e o `§ Review Report Template` não são executáveis; os demais agentes ficariam sem base.
- **Adotar `lucide-react` e substituir os ícones** — rejeitada: contraria a direção de marca documentada; ganho nulo para 13 ícones simples.
- **Migrar npm → pnpm (`pnpm import`)** — rejeitada por decisão do usuário (2026-09-23): o projeto mantém npm; a aceitação e suas condições estão no ADR-0005.
- **Docker + `output: 'standalone'` desde já** — rejeitada por decisão do usuário: produção é Vercel-only; ver ADR-0005.

## References

- `docs/architecture/conventions-audit.md` — D-01..D-09, T-02..T-07b, T-20..T-21, Q2
- `frontend-architecture-conventions.md` — § Stack Baseline, § App Router Layout, § Data Fetching & Mutations, § Engineering Workflow
- `design-conventions.md` — § Anti-Patterns
- `vamosany-design-system.md` — § 19 Design Principles
- Relacionados: ADR-0002, ADR-0003, ADR-0004, ADR-0005 (npm, Vercel-only), ADR-0006 (design congelado)
