# ADR-0005: npm como package manager e hosting Vercel-only (sem Docker, `standalone` ou deploy workflows)

- **Status:** Accepted (2026-09-23, Matheus Melo)
- **Date:** 2026-09-23
- **Deciders:** Usuário (owner do repositório) — decisão comunicada em 2026-09-23; drafted by Frontend Architect

## Context

`frontend-architecture-conventions.md` prescreve:

- `§ Stack Baseline` — "**Package manager:** pnpm (lockfile committed; never mix managers in one repo)"; "**Containerization:** Docker (`output: 'standalone'`) — deploy target per `frontend-devops-conventions.md`".
- `§ Cross-Cutting › Multi-target Deployment` — "Every project supports from day one: `run-local.sh` (`pnpm install --frozen-lockfile && pnpm dev`); `Dockerfile` (`output: 'standalone'`) …; Deploy config for the chosen target (Vercel project or `render.yaml` / `railway.toml` / `fly.toml`)"; CI/CD em GitHub Actions com `ci.yml`, `deploy-staging.yml`, `deploy-prod.yml`.
- `§ Engineering Workflow` — suite check `pnpm typecheck && pnpm lint && pnpm test`; build check `pnpm build`.

Estado do repositório (auditoria D-01, D-09):
- `package-lock.json` (57 KB) commitado; `README.md:17-21` instrui `npm install` / `npm run dev` / `npm run build`; nenhum `pnpm-lock.yaml`.
- `next.config.ts:3` é `{}` (sem `output: 'standalone'`); não existem `Dockerfile`, `run-local.sh`, `.github/workflows/`, `vercel.json`.
- Produção roda na **Vercel** (informado pelo usuário). A Vercel detecta Next.js, faz build com o package manager do lockfile presente (npm, neste caso), gera *preview deployments* por PR e *production deployment* por merge na branch de produção — sem GitHub Actions.

Decisões do usuário (2026-09-23): **o projeto mantém npm** (não haverá migração para pnpm) e **produção permanece na Vercel**. A decisão precisa ser registrada porque as conventions tratam ambos como obrigatórios e todos os agentes (Engineer, Reviewer, QA, DevOps) precisam ler os comandos e o pipeline corretamente.

## Decision

### 1. npm é o package manager deste projeto
- `package-lock.json` é o lockfile de registro, sempre commitado; `npm ci` em CI e na Vercel (`installCommand` default já faz isso quando o lockfile existe).
- Não misturar managers: `.npmrc` com `engine-strict=true`; `pnpm-lock.yaml`/`yarn.lock`/`bun.lock` são proibidos no repo (T-26 adiciona ao `.gitignore` como salvaguarda).
- **Tradução de comandos das conventions** para este projeto — vale para todos os agentes e para o `README.md`/`CLAUDE.md` (T-25):

  | Convention | Neste projeto |
  |---|---|
  | `pnpm install --frozen-lockfile` | `npm ci` |
  | `pnpm typecheck && pnpm lint && pnpm test` | `npm run typecheck && npm run lint && npm test` |
  | `pnpm build` | `npm run build` |
  | `pnpm test:e2e` | `npm run test:e2e` |
  | `pnpm up` (upgrade de major = ADR) | `npm update` / `npm install next@latest` — continua exigindo ADR |
- Scripts obrigatórios em `package.json` após T-02/T-03/T-04/T-07b: `dev`, `build`, `start`, `typecheck`, `lint`, `format`, `test`, `test:e2e`. O script `lint` chama `eslint .` (não `next lint`, deprecated no Next 15.5).

### 2. Hosting Vercel-only
- **Não** serão produzidos: `Dockerfile`, `docker-compose.yml`, `output: 'standalone'` em `next.config.ts`, `deploy-staging.yml`, `deploy-prod.yml`.
- **Serão** produzidos (Frontend DevOps Engineer):
  - `run-local.sh` — `npm ci && npm run dev` (T-20);
  - `.github/workflows/ci.yml` — typecheck + lint + test + build + e2e em todo push e PR, com `npm ci` (T-21). A Vercel faz build/deploy, mas não executa a suíte; o CI é a única barreira de qualidade antes do merge;
  - configuração do projeto Vercel documentada no `README.md` (§ Deploy): branch de produção, preview por PR, variáveis de ambiente por ambiente (`NEXT_PUBLIC_SITE_URL` para preview e produção — T-23), versão de Node em *Project Settings* igual a `engines.node`/`.nvmrc` (Q2);
  - `vercel.json` apenas se um header/redirect/rewrite exigir (por exemplo, CSP com nonce vem de `middleware.ts`, não de `vercel.json`).
- Preview deployments da Vercel são o ambiente de medição de `§ Performance Budgets` e o `preview URL` do Reviewer/QA handoff.

### 3. Gatilhos de revisão (Superseded)
- Necessidade de um segundo alvo (self-hosting, ambiente on-premises de cliente, saída da Vercel) → novo ADR que adicione `Dockerfile` + `standalone` e os deploy workflows.
- Adoção de pnpm em outros projetos da organização com monorepo/workspaces que incluam este → novo ADR de migração.

## Consequences

- **Positive:** zero churn de lockfile/pipeline num projeto em produção; deploy contínuo já funciona (preview por PR, produção por merge) sem manutenção de workflows de deploy; o time lê uma tabela de tradução em vez de improvisar comandos; o CI passa a existir (T-21) sem depender da mudança de manager.
- **Negative:** o projeto diverge do baseline em dois pontos visíveis — quem vier de outro projeto da organização precisa da tabela de tradução; sem `Dockerfile`, não há como reproduzir o build de produção fora da Vercel (mitigação: `npm run build && npm run start` local reproduz o output do Next, não o runtime da Vercel); `npm ci` é mais lento que `pnpm install --frozen-lockfile` em CI (irrelevante para o tamanho deste projeto); lock-in operacional na Vercel.
- **Neutral:** `§ Multi-target Deployment` continua a ser o default das conventions para projetos novos; este ADR é uma exceção de projeto legado. `frontend-devops-conventions.md` deve ser lido com a mesma tradução (owner: DevOps Engineer, `docs/devops/`).

## Alternatives Considered

- **Migrar para pnpm (`pnpm import` a partir do `package-lock.json`)** — rejeitada por decisão do usuário. Custo técnico seria baixo (~30 min), mas toca README, CI futuro e Project Settings da Vercel; o usuário preferiu não alterar.
- **Manter npm sem ADR ("é só o manager")** — rejeitada: as conventions exigem justificar deviations explicitamente, e os comandos prescritos (`pnpm …`) apareceriam em commits, reviews e handoffs, gerando ruído.
- **Adicionar `Dockerfile` + `standalone` mesmo na Vercel ("from day one")** — rejeitada por decisão do usuário: sem segundo alvo previsto, seria código de infraestrutura não exercitado (e `output: 'standalone'` muda o layout do build, o que a Vercel não usa).
- **GitHub Actions para deploy (`vercel deploy` via CLI) em vez da integração Git** — rejeitada: duplica o que a integração já faz, exige tokens no GitHub e não traz controle adicional para uma landing de rota única. Pode ser revisitada se surgir necessidade de *deploy manual gated* (`deploy-prod.yml` manual, como a convention sugere).

## References

- `docs/architecture/conventions-audit.md` — D-01, D-09, T-20, T-21, T-23, T-25, T-26, Q1 (resolvida), Q2, Q3 (resolvida)
- `frontend-architecture-conventions.md` — § Stack Baseline, § Cross-Cutting › Multi-target Deployment, § Engineering Workflow, § Performance Budgets
- `frontend-devops-conventions.md` — § Environment Model (a ser lido com a tradução npm/Vercel)
- `package.json:5-10`, `README.md:15-21`, `next.config.ts`
- Relacionados: ADR-0001 (baseline incremental), ADR-0006 (design congelado)
