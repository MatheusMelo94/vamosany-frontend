# Gap Report: Project Setup — Vamos a NY (mobbin-front-text)

- **Data:** 2026-09-22 (rev. 2 em 2026-09-23 após decisões D1/D3/D4)
- **Autor:** Frontend DevOps Engineer (agente), a pedido de Matheus Melo
- **Touchpoint:** project setup (onboarding de projeto legado já em produção — passo 4 do plano)
- **Repo:** `mobbin-front-text` — remote `https://github.com/MatheusMelo94/vamosany-frontend.git`
- **Baseline comparada:** `.claude/conventions/frontend-devops-conventions.md` (§ Scope Posture, § Project Setup, § Dockerfile Baseline, § Environment Model, § CI Pipeline Shape, § Secrets Integration, § Rollback Policy), mais as seções que o DevOps deve consultar: `frontend-architecture-conventions.md` (§ Stack Baseline, § Configuration & Environment, § Performance Budgets, § Cross-Cutting: Documentation / Multi-target Deployment / Repository Hygiene), `frontend-security-conventions.md` (§ Default Headers, § Content Security Policy, § Secrets & Environment, § Supply Chain, § Project Posture) e `frontend-qa-conventions.md` (§ Framework Defaults, § Accessibility & Performance Gates).
- **Escopo do inspecionado:** raiz do repo (incl. dotfiles), `.github/`, `package.json`, `next.config.ts`, `.gitignore`, `.env*`, `README.md`, `tsconfig.json`, `app/layout.tsx`, `git log` / `git branch -a`. `node_modules/` e `.next/` ignorados. Nenhum `npm install`, build ou commit executado; nenhum código-fonte alterado.
- **Status deste documento:** Reviewed — decisões D1, D3 e D4 registradas; D2, D5 e D6 ainda abertas (ver § 1).

---

## 0. DevOps Scope Gate (resultado)

| Item do gate | Resultado |
|---|---|
| Projeto Next.js App Router | Sim — `app/` com `layout.tsx` + `page.tsx`, Next `^15.5.4` (instalado 15.5.25), React 19, TS 5, Tailwind 4, GSAP 3 |
| Package manager | **npm, mantido por decisão do usuário (D3)** — `package-lock.json`, sem campo `packageManager`, sem `engines` / `.nvmrc`. Desvio aceito de `§ Stack Baseline` / `§ Supply Chain` (pnpm); **ADR a cargo do Frontend Architect**. Consequência prática: `npm ci` substitui `pnpm install --frozen-lockfile` em todos os drafts (`npm ci` já falha se o lockfile divergir) |
| Touchpoint | Project setup (legado) |
| Hosting target | **Vercel (D1)** — produção já roda lá; domínio real **ainda desconhecido** (fica como placeholder `NEXT_PUBLIC_SITE_URL`). O repo não tem `vercel.json` nem `.vercel/`; presume-se Vercel Git integration (preview por branch, prod no branch de produção) — confirmar no dashboard (D6) |
| Posture (Prototype / MVP / Production / Regulated) | **Desconhecido (D2 aberta)** — default das conventions para produto próprio em produção: **Production** (`frontend-security-build-vs-buy.md § Default Leans`) |
| Backend pairing | **Nenhum por enquanto (D4)** — landing page estática, zero `process.env`, zero `fetch`; links são âncoras ou `#`. `docker-compose.yml` e `API_BASE_URL` ficam N/A |

---

## 1. Decisões — registradas e pendentes

| # | Decisão | Status | Registro / efeito |
|---|---|---|---|
| D1 | Hosting target | **Decidido: Vercel.** Domínio real pendente | Artefatos Vercel-specific marcados com **[Vercel]** na tabela. Deploy de preview/prod é da Git integration; workflows viram smoke (staging) e promote (prod). `Dockerfile` continua exigido pelas conventions como fallback portátil, mas cai para o fim do backlog |
| D2 | Posture | **Pendente** | Recomendado **Production** (está no ar). Decide Lighthouse CI, `npm audit` bloqueante e matrix mobile |
| D3 | Package manager | **Decidido: manter npm** (desvio aceito) | ADR pelo Frontend Architect. Aqui: `npm ci` / `npm run` em tudo; `packageManager` pinado em **npm** (corepack suporta); `engines.node = 22.x`. Risco residual para o ADR: npm executa lifecycle scripts por default (pnpm bloqueia) — mitigação sugerida: `.npmrc` com `ignore-scripts=true` **se** o `npm run build` continuar passando (validar; `sharp`/Next podem precisar de postinstall) |
| D4 | Backend pairing | **Decidido: nenhum** | `.env.example` só com `NEXT_PUBLIC_SITE_URL`; `docker-compose.yml` N/A; revisar quando houver backend (local→local, preview→staging, prod→prod) |
| D5 | Domínio canônico | **Pendente** | `app/layout.tsx` tem `metadataBase: new URL("https://vamosany.example.com")` (placeholder em produção → canonical/OG errados). Vira `NEXT_PUBLIC_SITE_URL` por ambiente na Vercel; Engineer troca o hardcode |
| D6 | **Modelo de produção na Vercel** (nova) | **Pendente** | Hoje, se o *production branch* do projeto Vercel é `main`, cada merge vai direto para prod (rebuild), o que contraria `§ CI Pipeline Shape` ("prod é **promovido** do artefato que passou staging, nunca rebuildado"). Opções: (a) manter auto-prod em `main` como desvio aceito (documentar), ou (b) apontar o production branch para um branch que ninguém pusha (ex.: `production`) e promover via `deploy-prod.yml` (`vercel promote`). Draft § 4.9c assume (b) |

---

## 2. Tabela de gaps

Legenda de status: **Presente** · **Parcial** · **Ausente** · **N/A** (não se aplica, com justificativa). **[Vercel]** = item específico do target decidido em D1.

### 2.1 Artefatos de `§ Project Setup` (frontend-devops-conventions.md)

| # | Item | Exigido por | Status | Evidência (path) | Ação recomendada |
|---|---|---|---|---|---|
| 1 | `run-local.sh` | devops `§ Project Setup`; arch `§ Multi-target Deployment` | **Ausente** | raiz não contém o arquivo | Criar (draft § 4.2) com `npm ci && npm run dev` |
| 2 | `.env.example` anotado public/secret | devops `§ Project Setup`, `§ Environment Model`; security `§ Secrets & Environment`; arch `§ Configuration & Environment` | **Ausente** | nenhum `.env*` na raiz; `grep process.env app components` → 0 ocorrências; sem `lib/env.ts` | Criar `.env.example` (draft § 4.3) só com `NEXT_PUBLIC_SITE_URL` (D4); Engineer cria `lib/env.ts` (zod) e troca o `metadataBase`. Valores por ambiente em **Vercel env vars** (Preview / Production) |
| 3 | `Dockerfile` standalone | devops `§ Project Setup` ("all targets; required for PaaS"), `§ Dockerfile Baseline`; arch `§ Stack Baseline` | **Ausente — baixa prioridade [Vercel]** | raiz não contém `Dockerfile` | Vercel não usa. Conventions ainda exigem como fallback portátil (anti lock-in). Criar por último (draft § 4.6, versão npm) + `.dockerignore` (§ 4.7) |
| 4 | `docker-compose.yml` | devops `§ Project Setup` ("quando backend/DB rodam localmente") | **N/A** (D4) | sem backend, sem DB, sem `fetch` | Não criar. Revisar quando D4 mudar |
| 5 | Hosting config — `vercel.json` **[Vercel]** | devops `§ Project Setup`, `§ Scope Posture` | **Ausente** | sem `vercel.json`, sem `.vercel/` | Com Git integration a config vive no dashboard; `vercel.json` mínimo (draft § 4.8) serve para versionar `framework`, `installCommand: npm ci` e região. Headers ficam no `next.config.ts` (fonte única) |
| 6 | `next.config.ts` — `output: 'standalone'` | devops `§ Dockerfile Baseline` | **Ausente — só importa para o item 3** | `next.config.ts` = `{}` | Adicionar junto com o Dockerfile (inofensivo na Vercel, que ignora o modo de output) |
| 7 | `next.config.ts` — `headers()` de segurança | security `§ Default Headers` | **Ausente** | idem; nenhum header configurado | Adicionar HSTS, nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options, COOP (draft § 4.5). Na Vercel os headers do `next.config.ts` são aplicados na edge — verificar com `curl -I` no preview. **CSP nonce-based fica com o Security Engineer**: `app/layout.tsx` tem `<script dangerouslySetInnerHTML>` inline (classe `.gsap` antes do first paint) que uma CSP `script-src 'nonce-…' 'strict-dynamic'` bloqueia sem `middleware.ts` + nonce |
| 8 | `next.config.ts` — `images.remotePatterns` | agent Project Setup step 1 | **N/A** | todas as imagens são locais em `public/img/*.webp` | Nada a fazer |
| 9 | `app/api/health/route.ts` | devops `§ Dockerfile Baseline`, `§ CI Pipeline Shape` (post-deploy smoke) | **Ausente** | `app/` tem só `globals.css`, `layout.tsx`, `page.tsx` | Criar (draft § 4.4). Na Vercel é o alvo do smoke pós-deploy (item 11) e expõe `VERCEL_GIT_COMMIT_SHA` para conferir o SHA promovido |
| 10 | `.github/workflows/ci.yml` | devops `§ Project Setup`, `§ CI Pipeline Shape`; arch `§ Multi-target Deployment` | **Ausente** | `.github/` não existe | Criar em duas fases (draft § 4.9a): fase 1 typecheck → lint → build → bundle guard → secret grep → audit; fase 2 test/e2e/lhci quando QA/Engineer entregarem as suítes |
| 11 | `.github/workflows/deploy-staging.yml` **[Vercel]** | devops `§ CI Pipeline Shape` | **Ausente — reduzido a smoke** | idem | Deploy em si é **N/A** (conventions: "Vercel target: deploy via Vercel Git integration (no workflow step needed)"). Fica o pós-deploy: `on: deployment_status` → `curl` `/api/health` + Playwright `@smoke` na `environment_url` (draft § 4.9b). Auto-rollback só faz sentido para prod (item 12) |
| 12 | `.github/workflows/deploy-prod.yml` **[Vercel]** | devops `§ CI Pipeline Shape`, `§ Rollback Policy` | **Ausente** | idem; `git tag` vazio | `workflow_dispatch` com input de release tag → `vercel promote <deployment>` do preview de `main` que passou + smoke + tag (draft § 4.9c). Depende de D6. Secrets `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` em GitHub Actions secrets (permitido por `§ Secrets Integration`: deploy tokens only) |
| 13 | `lighthouserc.json` | devops `§ Project Setup` (MVP+); qa `§ Framework Defaults`, `§ Accessibility & Performance Gates` | **Ausente** | raiz não contém o arquivo | Depende de D2. Se Production: criar (draft § 4.10) e rodar contra o build local no CI; opcionalmente contra a `environment_url` do preview no job de smoke |
| 14 | `.github/dependabot.yml` | devops `§ Project Setup`; security `§ Supply Chain` | **Ausente** | `.github/` não existe | Criar (draft § 4.11); ecossistema `npm` cobre `package-lock.json` |
| 15 | `package.json` scripts of record (`dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:watch`, `test:e2e`, `lhci`, `analyze`) | devops `§ Project Setup`; arch `§ TypeScript Rules`, `§ Engineering Workflow`; qa `§ Framework Defaults` | **Parcial** | `package.json` tem só `dev`, `build`, `start`, `lint` | Adicionar (draft § 4.1). Comandos de record passam a ser `npm run <script>` (D3); QA e Engineer devem ser avisados, pois as conventions citam `pnpm test` etc. |
| 16 | `lint` funcional | arch `§ Stack Baseline` (ESLint 9 flat config + `eslint-config-next` + `eslint-plugin-jsx-a11y`; Prettier + `prettier-plugin-tailwindcss`) | **Parcial / quebrado** | `lint: "next lint"`, mas `node_modules/eslint` e `node_modules/eslint-config-next` não existem; sem `eslint.config.*`, sem `.prettierrc*`. `next lint` está deprecated a partir do Next 15.5 | Engineer adiciona devDeps + `eslint.config.mjs`; script vira `eslint .` (draft § 4.1). O DevOps só precisa que o comando exista para o CI |
| 17 | `packageManager` pinado + lockfile | security `§ Supply Chain`; arch `§ Stack Baseline` | **Desvio aceito (D3) — pin ausente** | sem `packageManager`; `package-lock.json` presente | Manter npm, mas **pinar**: `"packageManager": "npm@11.x.y"` (versão exata; corepack honra npm) e `npm ci` no CI/Docker/Vercel. ADR do Architect registra o desvio e o risco de lifecycle scripts |
| 18 | Runtime Node 22 LTS declarado | arch `§ Stack Baseline`; devops `§ Dockerfile Baseline` | **Ausente** | sem `engines`, `.nvmrc` ou `.node-version`; máquina local roda Node 24.16 | `"engines": { "node": "22.x" }` + `.nvmrc` = `22`. **[Vercel]**: conferir *Node.js Version* = 22.x nas settings do projeto (a Vercel lê `engines.node`) |

### 2.2 Documentação e contexto (arch `§ Cross-Cutting: Documentation`)

| # | Item | Exigido por | Status | Evidência (path) | Ação recomendada |
|---|---|---|---|---|---|
| 19 | `CLAUDE.md` (posture, package manager, deploy target, backend contract) | arch `§ Documentation`; devops `§ Scope Posture`; security `§ Project Posture` | **Ausente** | nem `mobbin-front-text/CLAUDE.md` nem `vamosany-front-end/CLAUDE.md` | Criar já com D1/D3/D4 (draft § 4.12); D2/D5/D6 entram quando decididas |
| 20 | `README.md` com purpose, stack, setup local **+ Docker**, tabela de env vars (name / public? / purpose), tabela de rotas, comandos de teste | arch `§ Documentation`; security `§ Secrets & Environment` | **Parcial** | `README.md` tem purpose, stack, run local (`npm`), seções e efeitos de scroll. Falta: tabela de env, rotas (`/` pública, `/api/health`), comandos de teste/CI, deploy (Vercel) e rollback | Completar por fase; a seção Docker entra só quando o Dockerfile existir (fase 9) |
| 21 | `docs/` com `adr/`, `tech-design/`, `specs/`, `ddr/`, `security/`, `qa/` (+ `docs/deploys/` e `docs/deploys/rollbacks/` para o DevOps) | arch `§ Documentation`; agent Output Format | **Ausente** | `docs/` não existia até este relatório (`docs/devops/` criado agora) | Criar a árvore com `.gitkeep`. `docs/adr/` recebe o ADR do npm (D3) e o de D6 se for desvio; o primeiro Deploy Checklist vai em `docs/deploys/YYYY-MM-DD_<tag>_v1.md` |

### 2.3 Hygiene do repositório (arch `§ Repository Hygiene`; devops `§ Secrets Integration`)

| # | Item | Exigido por | Status | Evidência (path) | Ação recomendada |
|---|---|---|---|---|---|
| 22 | `.gitignore` cobre `.env*.local`, `.next/`, `node_modules/`, `playwright-report/`, `test-results/`, coverage, IDE | arch `§ Repository Hygiene` | **Parcial** | `.gitignore` = `node_modules`, `.next`, `out`, `.DS_Store`, `*.tsbuildinfo`, `next-env.d.ts`, `.env*.local`. Faltam `playwright-report/`, `test-results/`, `coverage/`, `.lighthouseci/`, `.vercel`, `.env` (com `!.env.example`), `.idea/` | Completar (draft § 4.13). `.vercel/` **[Vercel]** é gerado por `vercel link`/`vercel env pull` e nunca deve ser commitado |
| 23 | Sem binários fora de `public/` / sem originais pesados no repo | arch `§ Repository Hygiene` | **Parcial** | **Untracked e não ignorados** na raiz: `Melius page.png`, `beautiful-view-new-york-city.jpg`, `manhattan.jpg`, `new-york-city-manhattan-skyline-aerial-view.jpg`, `new-york-city.jpg`, `vamosany2–6.jpg`, `vamosnay1.jpg` — **37 MB** que um `git add -A` commitaria. **Tracked** na raiz: `logo-pretzel.png`, `logo-pretzel-dark.png`, `logos-01.png` (duplicados de `public/`). **Tracked** em `public/img/ring/`: `.jpg` originais ao lado dos `.webp` (108–176 kB cada; na Vercel vão para o output do deploy sem uso) | Mover originais para fora do repo (ou `assets-src/` ignorado), remover os PNG da raiz e os `.jpg` de `public/img/ring/` se não referenciados |
| 24 | Branch naming `<type>/<slug>` | arch `§ Repository Hygiene` | **Presente** | `feat/vamosany-landing`, `fix/nav-auth-buttons` | Manter |
| 25 | Conventional commits | arch `§ Repository Hygiene`, `§ Engineering Workflow` | **Presente** | `git log`: `feat(hero): …`, `fix(nav): …`; PRs #1 e #2 mergeados via merge commit | Manter. Corpos não citam seções das conventions — item do Engineer |
| 26 | Releases taggeadas (input de `deploy-prod.yml`; last-known-good) | devops `§ CI Pipeline Shape`, `§ Rollback Policy` | **Ausente** | `git tag` vazio; `version: "0.1.0"`; `name: "deel-landing"` | Taggear o SHA em produção hoje como `v0.1.0` e anotar o **deployment id** atual da Vercel como last-known-good inicial; renomear `name` para `vamosany-landing` |
| 27 | Branch protection / CI required to pass before merge | devops `§ CI Pipeline Shape` | **Não verificável** | `gh` sem credenciais nesta sessão; 2 PRs mergeados sem checks | Após `ci.yml` verde: branch protection em `main` exigindo o job `ci` (e, se D6 = (b), também no branch `production`) |
| 28 | `main` local sincronizado | — (operacional) | **Desatualizado** | `main` local = `3053ad0`; `origin/main` = `f831e7a`. Branch atual `fix/nav-auth-buttons` = `origin/main` + 1 commit | `git checkout main && git pull --ff-only` antes dos PRs `chore:` |

### 2.4 Checks que o CI deve provar (devops `§ CI Pipeline Shape`, `§ Secrets Integration`; arch `§ Performance Budgets`)

| # | Item | Status | Evidência | Ação |
|---|---|---|---|---|
| 29 | Bundle guard: First Load JS ≤ 180 kB por rota | **Ausente** (não medido) | 8 componentes `'use client'` + GSAP com plugins (SplitText, ScrollTrigger, CustomEase). Risco real de estourar na rota `/` | Script no `ci.yml` (draft § 4.9a). Se estourar, **rota ao Architect** (nunca subir o budget) |
| 30 | Secret grep em `.next/static` | **Ausente** | nenhum CI | Step no `ci.yml`. Trivial hoje, guard permanente |
| 31 | `npm audit --audit-level=high` bloqueante (MVP+) | **Ausente** | nenhum CI | Depende de D2; incluído no draft |
| 32 | Playwright job (`test:e2e`, `@smoke`, axe) | **Ausente** | sem `playwright.config.ts`, sem `tests/` | Fase 2 do `ci.yml`, após QA. O smoke pós-deploy (item 11) precisa de ≥ 1 journey `@smoke` |
| 33 | Lighthouse CI (MVP+) | **Ausente** | sem `lighthouserc.json` | Depende de D2 (item 13) |
| 34 | Actions pinadas em SHA, cache npm + `.next/cache`, Playwright browsers cacheados | **Ausente** | nenhum CI | Draft § 4.9a. **SHAs nos drafts são placeholders `<sha>` — resolver com `gh api repos/<owner>/<repo>/git/ref/tags/<tag>` antes de commitar; nunca commitar SHA inventado** |

---

## 3. Backlog incremental (ordem de execução)

Ordenado por: (a) destrava outros itens, (b) risco zero para a produção atual, (c) dependência de decisão pendente. Cada fase = 1 PR `chore:` citando as seções.

| Fase | O quê | Itens | Depende de | Risco p/ prod |
|---|---|---|---|---|
| **0** | `git checkout main && git pull --ff-only`; taggear o SHA em produção como `v0.1.0`; anotar o deployment id Vercel atual (last-known-good); Architect abre o ADR do npm (D3) | 26, 28, 17 | — | nenhum |
| **1** | Hygiene: `.gitignore` completo, tirar as 37 MB de imagens da raiz, remover PNGs duplicados e `.jpg` do ring, `.nvmrc`, `engines`, renomear `name`; `docs/` skeleton; `CLAUDE.md` com Vercel / npm / sem backend | 18, 19, 21, 22, 23 | — | nenhum |
| **2** | `package.json`: `packageManager: npm@x.y.z`, scripts of record; Engineer: ESLint 9 flat config + Prettier; validar local `npm run typecheck && npm run lint && npm run build` | 15, 16, 17 | — | nenhum |
| **3** | `run-local.sh`; `.env.example` + `lib/env.ts` (Engineer) + `metadataBase` via `NEXT_PUBLIC_SITE_URL`; **cadastrar `NEXT_PUBLIC_SITE_URL` nos scopes Preview e Production na Vercel antes do merge** (placeholder até D5); README: env + comandos | 1, 2, 20 | D5 (só o valor) | baixo — build falha se a var faltar na Vercel; cadastrar antes |
| **4** | `ci.yml` fase 1: typecheck → lint → build (cache) → bundle guard → secret grep → audit; branch protection em `main` | 10, 27, 29, 30, 31, 34 | fase 2 | nenhum |
| **5** | `next.config.ts`: `headers()` sem CSP; `app/api/health/route.ts`; validar `curl -I` no preview Vercel. **Paralelo:** Security Engineer define CSP nonce-based + `middleware.ts` | 7, 9 | fase 2 | baixo (headers aditivos; validar no preview) |
| **6** | **[Vercel]** `vercel.json` mínimo; conferir no dashboard: Node 22, `npm ci`, production branch (D6), env vars; `deploy-staging.yml` = smoke em `deployment_status` | 5, 11, 18 | fases 4–5, D6 | baixo — não muda o deploy, só observa |
| **7** | **[Vercel]** `deploy-prod.yml` (`workflow_dispatch` → `vercel promote` + smoke + tag); rollback documentado (`vercel rollback`); primeiro deploy via `docs/deploys/…_v1.md` | 12 | D6, fase 6 | médio — primeira promoção pelo pipeline |
| **8** | `dependabot.yml` | 14 | fase 4 | nenhum |
| **9** | `lighthouserc.json` + job `lhci` + `analyze`; Playwright job quando QA entregar `tests/e2e` com `@smoke` | 13, 32, 33 | D2, QA | nenhum |
| **10** | `Dockerfile` + `.dockerignore` + `output: 'standalone'` (fallback portátil exigido pelas conventions; não usado na Vercel); validar `docker build` + `wget /api/health` no container; README § Docker | 3, 6 | fase 5 | nenhum |

Fases 0, 1, 2, 4 e 8 não dependem de nenhuma decisão pendente.

---

## 4. Drafts propostos (NÃO criados no repo — o usuário decide)

Todos assumem: **npm** (D3), Node 22, **Vercel com Git integration** (D1), sem backend (D4), posture Production (D2 pendente). Placeholders `<sha>` devem ser resolvidos para o commit SHA completo da tag antes de commitar (`§ Supply Chain`).

### 4.1 `package.json` (só os campos afetados)

```jsonc
{
  "name": "vamosany-landing",
  "version": "0.1.0",
  "private": true,
  "packageManager": "npm@11.6.0",             // D3: npm mantido, mas PINADO (versão exata; confirmar a última 11.x no dia)
  "engines": { "node": "22.x" },              // Vercel lê engines.node
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",                      // `next lint` está deprecated no 15.5; ESLint 9 flat config
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "lhci": "lhci autorun",
    "analyze": "ANALYZE=true next build"
  }
}
```

devDependencies a adicionar (por dono): **DevOps** — `@lhci/cli`, `@next/bundle-analyzer`; **Engineer** — `eslint`, `eslint-config-next`, `eslint-plugin-jsx-a11y`, `prettier`, `prettier-plugin-tailwindcss`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `zod`; **QA** — `@playwright/test`, `@axe-core/playwright`.

Comandos de record deste projeto (registrar no `CLAUDE.md` e avisar QA/Engineer): `npm run typecheck && npm run lint && npm test`; `npm run build`; `npm run test:e2e`; `npm run lhci`.

### 4.2 `run-local.sh`

```bash
#!/usr/bin/env bash
# One-command local dev — frontend-devops-conventions.md § Project Setup (npm por decisão D3)
set -euo pipefail
cd "$(dirname "$0")"
if [ ! -f .env.local ] && [ -f .env.example ]; then
  cp .env.example .env.local
  echo "→ .env.local criado a partir de .env.example; revise os valores."
fi
npm ci
npm run dev
```

`chmod +x run-local.sh`. Alternativa quando o projeto estiver linkado à Vercel: `vercel env pull .env.local` (nunca commitar o resultado).

### 4.3 `.env.example`

```bash
# Vamos a NY — environment template (frontend-devops-conventions.md § Environment Model)
# Copie para .env.local (gitignored) ou rode `vercel env pull .env.local`.
# Tabela name / public? / purpose no README.
#
# Convenção: NEXT_PUBLIC_* é PUBLIC FOREVER (inlined no bundle do client no build).
# Secrets de servidor NUNCA levam prefixo NEXT_PUBLIC_ e nunca entram como build arg.

# [public] Origem canônica do site; alimenta metadataBase (canonical / Open Graph).
#   local   → http://localhost:3000
#   preview → Vercel env var (scope Preview); lib/env.ts pode cair para https://${VERCEL_URL}
#   prod    → Vercel env var (scope Production) = https://<dominio-real>   (D5 pendente)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# [secret] — nenhum por enquanto (landing estática, sem backend — D4).
# Quando houver: API_BASE_URL=<backend do MESMO ambiente> (local→local, preview→staging, prod→prod).
```

### 4.4 `app/api/health/route.ts`

```ts
// Minimal liveness endpoint — frontend-devops-conventions.md § CI Pipeline Shape (post-deploy smoke)
// and § Dockerfile Baseline (HEALTHCHECK). No secrets, no dependencies.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { status: "ok", sha: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_SHA ?? "unknown" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
```

O campo `sha` permite ao `deploy-prod.yml` confirmar que o deployment promovido é o SHA esperado.

### 4.5 `next.config.ts`

```ts
import type { NextConfig } from "next";

// frontend-security-conventions.md § Default Headers — CSP intencionalmente FORA deste draft:
// o layout tem um <script> inline (classe .gsap antes do first paint) que exige nonce por request
// (middleware.ts + x-nonce). Escopo do Frontend Security Engineer; adicionar aqui quando definido.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "X-Frame-Options", value: "DENY" },           // até a CSP trazer frame-ancestors 'none'
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" }, // Production+
];

const nextConfig: NextConfig = {
  // output: "standalone",   // só necessário para o Dockerfile (fase 10); a Vercel ignora este modo
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  // images.remotePatterns: N/A — todas as imagens são locais (public/img/*.webp)
};

export default nextConfig;
```

`analyze` envolve o config com `withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })` — adicionar junto com a devDep.

### 4.6 `Dockerfile` (fase 10 — fallback portátil, não usado na Vercel)

```dockerfile
# frontend-devops-conventions.md § Dockerfile Baseline — npm por decisão D3
# NOTA: next/font/google (Courier Prime) baixa a fonte no build → o stage `build` precisa de rede.

FROM node:22-alpine AS base
RUN corepack enable            # honra packageManager: npm@x.y.z
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* é público e build-time; nunca passar secret como ARG.
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/api/health || exit 1
CMD ["node", "server.js"]
```

Requer `output: "standalone"` descomentado no `next.config.ts` (§ 4.5).

### 4.7 `.dockerignore` (fase 10)

```
.git
.github
.next
node_modules
docs
*.md
!README.md
*.jpg
*.png
!public/**
.env*
!.env.example
.vercel
playwright-report
test-results
coverage
.lighthouseci
.vscode
```

### 4.8 `vercel.json` **[Vercel]**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "installCommand": "npm ci",
  "buildCommand": "npm run build",
  "regions": ["gru1"],
  "github": { "silent": false }
}
```

Com Git integration, tudo isso também pode viver no dashboard; o arquivo existe para versionar o que `§ Project Setup` chama de "deploy config". Headers **não** vão aqui (fonte única = `next.config.ts`). Checklist do dashboard (fase 6): Node.js Version 22.x; Production Branch conforme D6; env `NEXT_PUBLIC_SITE_URL` nos scopes Preview e Production; Deployment Protection conforme Security.

### 4.9a `.github/workflows/ci.yml` (fase 1 + hooks para fase 2)

```yaml
# frontend-devops-conventions.md § CI Pipeline Shape · frontend-security-conventions.md § Supply Chain
# npm ci por decisão D3 (equivale a --frozen-lockfile: falha se package-lock.json divergir)
name: ci
on:
  push:
  pull_request:
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
permissions:
  contents: read

env:
  NEXT_TELEMETRY_DISABLED: 1
  NEXT_PUBLIC_SITE_URL: http://localhost:3000   # público; valor de CI, não de deploy

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<sha>              # v4.x — resolver SHA da tag
      - uses: actions/setup-node@<sha>            # v4.x
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      # - run: npm test                           # fase 2: habilitar quando o Engineer entregar Vitest
      - uses: actions/cache@<sha>                 # v4.x — .next/cache
        with:
          path: .next/cache
          key: next-${{ runner.os }}-${{ hashFiles('package-lock.json') }}-${{ hashFiles('**/*.ts', '**/*.tsx') }}
          restore-keys: next-${{ runner.os }}-${{ hashFiles('package-lock.json') }}-
      - run: npm run build

      - name: Bundle guard (First Load JS ≤ 180 kB por rota — arch § Performance Budgets)
        run: |
          node - <<'EOF'
          const fs = require('fs');
          const budgetKb = 180;
          const manifest = JSON.parse(fs.readFileSync('.next/app-build-manifest.json', 'utf8'));
          let failed = false;
          for (const [route, files] of Object.entries(manifest.pages)) {
            const kb = files
              .filter(f => f.endsWith('.js'))
              .reduce((sum, f) => sum + fs.statSync(`.next/${f}`).size, 0) / 1024;
            const over = kb > budgetKb;
            failed ||= over;
            console.log(`${over ? '✗' : '✓'} ${route}: ${kb.toFixed(1)} kB`);
          }
          if (failed) { console.error(`First Load JS acima de ${budgetKb} kB — rota ao Architect, não suba o budget.`); process.exit(1); }
          EOF

      - name: Client-bundle secret grep (security § Secrets & Environment)
        run: |
          if grep -rEl "sk_(live|test)_|-----BEGIN [A-Z ]*PRIVATE KEY|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}" .next/static; then
            echo "::error::possível secret no bundle do client"; exit 1; fi

      - name: Audit (bloqueante em MVP+ — D2)
        run: npm audit --audit-level=high

  # e2e:                                            # fase 2 — quando QA entregar tests/e2e (@smoke, axe)
  #   needs: ci
  #   runs-on: ubuntu-latest
  #   steps:
  #     - uses: actions/checkout@<sha>
  #     - uses: actions/setup-node@<sha>
  #       with: { node-version-file: .nvmrc, cache: npm }
  #     - run: npm ci
  #     - uses: actions/cache@<sha>
  #       with: { path: ~/.cache/ms-playwright, key: pw-${{ runner.os }}-${{ hashFiles('package-lock.json') }} }
  #     - run: npx playwright install --with-deps chromium
  #     - run: npm run build && npm run test:e2e
  #     - uses: actions/upload-artifact@<sha>
  #       if: failure()
  #       with: { name: playwright-report, path: playwright-report/ }

  # lhci:                                           # MVP+ — junto com lighthouserc.json (§ 4.10)
  #   needs: ci
  #   runs-on: ubuntu-latest
  #   steps: [checkout, setup-node, npm ci, npm run build, npm run lhci]
```

O caminho do manifesto (`.next/app-build-manifest.json`) é o do App Router no Next 15; validar o cálculo contra a coluna "First Load JS" do output de `next build` no primeiro run.

### 4.9b `.github/workflows/deploy-staging.yml` **[Vercel — só smoke; o deploy é da Git integration]**

```yaml
# frontend-devops-conventions.md § CI Pipeline Shape — deploy-staging (Vercel target):
# "deploy via Vercel Git integration (no workflow step needed)"; fica só o post-deploy smoke.
name: smoke-preview
on:
  deployment_status:            # emitido pela Vercel GitHub App a cada deployment
permissions:
  contents: read
  deployments: read

jobs:
  smoke:
    if: github.event.deployment_status.state == 'success' && github.event.deployment.environment != 'Production'
    runs-on: ubuntu-latest
    env:
      BASE_URL: ${{ github.event.deployment_status.environment_url }}
    steps:
      - uses: actions/checkout@<sha>
        with: { ref: ${{ github.event.deployment.sha }} }
      - name: Health
        run: curl --fail --silent --show-error --retry 5 --retry-delay 5 "$BASE_URL/api/health"
      - name: Security headers (security § Default Headers)
        run: |
          curl -sI "$BASE_URL/" | tee headers.txt
          for h in strict-transport-security x-content-type-options referrer-policy permissions-policy; do
            grep -qi "^$h:" headers.txt || { echo "::error::header ausente: $h"; exit 1; }; done
      # fase 2 — quando existir tests/e2e com @smoke:
      # - uses: actions/setup-node@<sha>
      #   with: { node-version-file: .nvmrc, cache: npm }
      # - run: npm ci && npx playwright install --with-deps chromium
      # - run: npm run test:e2e -- --grep @smoke
      #   env: { PLAYWRIGHT_BASE_URL: "${{ env.BASE_URL }}" }
```

Se o projeto Vercel tiver *Deployment Protection* ligada nos previews, o smoke precisa de um bypass token (`x-vercel-protection-bypass`) em GitHub Actions secrets — deploy token, permitido por `§ Secrets Integration`.

### 4.9c `.github/workflows/deploy-prod.yml` **[Vercel — assume D6 = (b), promote]**

```yaml
# frontend-devops-conventions.md § CI Pipeline Shape — deploy-prod: manual, promove o artefato que
# passou staging (o deployment de `main`), NUNCA rebuilda. Requer Deploy Checklist GO no run summary.
name: deploy-prod
on:
  workflow_dispatch:
    inputs:
      release_tag: { description: "Release tag (ex.: v0.2.0)", required: true }
      deployment_url: { description: "URL do deployment de main que passou o smoke", required: true }
      checklist: { description: "Path do Deploy Checklist com GO (docs/deploys/...)", required: true }
permissions:
  contents: write            # para criar a tag
concurrency: { group: deploy-prod, cancel-in-progress: false }

jobs:
  promote:
    runs-on: ubuntu-latest
    environment: production  # GitHub Environment com required reviewer = o usuário (deploy authority)
    steps:
      - uses: actions/checkout@<sha>
      - uses: actions/setup-node@<sha>
        with: { node-version-file: .nvmrc }
      - name: Last-known-good (para rollback)
        run: |
          npx vercel@<versão-exata> ls --prod --token "$VERCEL_TOKEN" --scope "$VERCEL_ORG_ID" | head -5 | tee lkg.txt
          echo "### Deploy $RELEASE_TAG — checklist: $CHECKLIST" >> "$GITHUB_STEP_SUMMARY"
          echo '```' >> "$GITHUB_STEP_SUMMARY"; cat lkg.txt >> "$GITHUB_STEP_SUMMARY"; echo '```' >> "$GITHUB_STEP_SUMMARY"
      - name: Promote (sem rebuild)
        run: npx vercel@<versão-exata> promote "$DEPLOYMENT_URL" --token "$VERCEL_TOKEN" --scope "$VERCEL_ORG_ID" --yes
      - name: Smoke prod
        run: |
          curl --fail --silent --retry 5 --retry-delay 5 "$NEXT_PUBLIC_SITE_URL/api/health"
      - name: Tag
        run: |
          git config user.name "github-actions[bot]"; git config user.email "github-actions[bot]@users.noreply.github.com"
          git tag -a "$RELEASE_TAG" -m "Release $RELEASE_TAG — checklist $CHECKLIST"; git push origin "$RELEASE_TAG"
    env:
      VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}          # deploy token only (§ Secrets Integration)
      VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
      RELEASE_TAG: ${{ inputs.release_tag }}
      DEPLOYMENT_URL: ${{ inputs.deployment_url }}
      CHECKLIST: ${{ inputs.checklist }}
      NEXT_PUBLIC_SITE_URL: ${{ vars.PROD_SITE_URL }}     # placeholder até D5
```

Rollback (`§ Rollback Policy`): `vercel rollback <deployment-id-do-lkg>` (ou dashboard → *Instant Rollback*), < 5 min; registrar em `docs/deploys/rollbacks/`. Se D6 = (a) (auto-prod em `main`), este workflow vira apenas "tag + smoke + registro" e o desvio é documentado em ADR.

### 4.10 `lighthouserc.json` (MVP+ — D2)

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run start",
      "startServerReadyPattern": "Ready",
      "url": ["http://localhost:3000/"],
      "numberOfRuns": 3,
      "settings": { "preset": "desktop" }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

Thresholds de `frontend-qa-conventions.md § Accessibility & Performance Gates`; LCP/CLS de `frontend-architecture-conventions.md § Performance Budgets`. Medir também com emulação mobile; no job de smoke (§ 4.9b) pode-se apontar `url` para a `environment_url` do preview Vercel.

### 4.11 `.github/dependabot.yml`

```yaml
# frontend-security-conventions.md § Supply Chain — grouped weekly, CI required
version: 2
updates:
  - package-ecosystem: npm            # cobre package-lock.json
    directory: /
    schedule: { interval: weekly, day: monday }
    groups:
      next-react:
        patterns: ["next", "react", "react-dom", "@types/react*", "eslint-config-next"]
      tooling:
        patterns: ["eslint*", "prettier*", "typescript", "vitest*", "@playwright/*", "@lhci/*", "tailwindcss", "@tailwindcss/*"]
      minor-patch:
        update-types: ["minor", "patch"]
    open-pull-requests-limit: 5
  - package-ecosystem: github-actions
    directory: /
    schedule: { interval: weekly, day: monday }
```

### 4.12 `CLAUDE.md` (esqueleto)

```markdown
# Vamos a NY — landing (frontend)

- **Posture:** <Production | …>            <!-- D2 pendente; default Production -->
- **Package manager:** npm (desvio aceito das conventions — ver docs/adr/ADR-000X-npm.md); `packageManager` pinado; nunca misturar com pnpm/yarn
- **Node:** 22 LTS (.nvmrc / engines)
- **Deploy target:** Vercel (Git integration) — projeto `<nome>`; preview por branch; production branch `<main | production>` (D6); domínio `<pendente — D5>`
- **Backend pairing:** nenhum (landing estática). Quando existir: local→local, preview→staging, prod→prod
- **Env vars:** ver `.env.example`; valores por ambiente em Vercel env vars (Preview / Production)
- **Comandos:** `npm run typecheck && npm run lint && npm test`; `npm run build`; `npm run test:e2e`; `npm run lhci`
- **Rollback:** `vercel rollback <deployment-id>` para o last-known-good registrado em `docs/deploys/<último>.md` (< 5 min)
- **Conventions:** `.claude/conventions/*.md` (arquitetura, design, devops, qa, security)
- **Desvios registrados:** npm em vez de pnpm (ADR); <D6 se (a)>
```

### 4.13 `.gitignore` (proposta completa)

```
# deps / build
node_modules
.next
out
*.tsbuildinfo
next-env.d.ts

# env — .env.example é o único versionado
.env
.env*.local
!.env.example

# tests / perf
playwright-report/
test-results/
coverage/
.lighthouseci/

# hosting / os / ide
.vercel
.DS_Store
.idea/
.vscode/*
!.vscode/settings.json

# originais de imagem ficam fora do repo (item 23)
/*.jpg
/*.jpeg
/*.png
```

---

## 5. Observações fora do escopo DevOps (roteadas)

| Observação | Rota | Motivo |
|---|---|---|
| **ADR "npm em vez de pnpm"** (D3): registrar desvio de `§ Stack Baseline` / `§ Supply Chain`, risco de lifecycle scripts (npm não bloqueia), mitigação (`ignore-scripts` se viável) e gatilho de revisão | Frontend Architect | Desvio de convention exige ADR (`§ Scope Posture`, `§ Convention Drift`) |
| Modelo de produção Vercel (D6): auto-prod em `main` vs promote | Usuário (decisão) → ADR se (a) | `§ CI Pipeline Shape`: prod é promovido, nunca rebuildado |
| `metadataBase: new URL("https://vamosany.example.com")` em produção | Frontend Engineer | Vira `NEXT_PUBLIC_SITE_URL` via `lib/env.ts` (fase 3) |
| Inline `<script dangerouslySetInnerHTML>` no `app/layout.tsx` vs. CSP nonce-based | Frontend Security Engineer | `§ Content Security Policy` exige nonce por request em `middleware.ts` |
| First Load JS provavelmente acima de 180 kB (GSAP + 8 client components) | Frontend Architect | Budget é do Architect; DevOps só mede e falha o CI |
| Sem `lib/env.ts`, zod, Vitest/Playwright, ESLint config; comandos de record agora são `npm run …` | Frontend Engineer / QA | DevOps só precisa que os comandos existam para o CI |
| Corpos de commit não citam seções das conventions | Frontend Engineer | `§ Engineering Workflow` |

## 6. Convention Drift Detection

Nenhum padrão de deploy fora das conventions foi encontrado (sem edge functions, cron, image CDN, monorepo). Lacunas nas próprias conventions que valem sugestão ao usuário (não alteradas por mim):

1. `§ Project Setup` não lista `.dockerignore` nem `.nvmrc`/`engines`, mas `§ Dockerfile Baseline` e `§ Stack Baseline` (Node 22) dependem deles. *Suggested convention update: adicionar ambos à tabela de artefatos.*
2. `§ CI Pipeline Shape` não descreve como conciliar Vercel Git integration (auto-prod no production branch) com "prod é promovido, nunca rebuildado" — o padrão *production branch dedicado + `vercel promote`* (D6-b) merece um parágrafo. *Suggested convention update: § Vercel promote model.*
3. `§ Project Setup` não define onde ficam relatórios de onboarding/gap como este; salvo em `docs/devops/` conforme pedido — confirmar se vira padrão.

---

*Próximo passo: decidir D2, D5 e D6; fases 0, 1, 2, 4 e 8 já podem ser executadas hoje, um PR `chore:` por fase.*
