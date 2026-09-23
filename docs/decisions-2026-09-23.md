# Decisoes de onboarding — 2026-09-23

Decididas por Matheus Melo, ou delegadas ("decide voce") e resolvidas pela recomendacao dos relatorios.

| # | Decisao | Valor | Origem |
|---|---------|-------|--------|
| 1 | ADR-0001..0006 | **Accepted** | usuario |
| 2 | Constitution v1 (`specs/constitution.md`) | **Accepted** | usuario |
| 3 | Package manager | npm | usuario (ADR-0005) |
| 4 | Hosting | Vercel, deploy automatico de `main` (sem `vercel promote` em v1) | usuario + recomendacao devops D6 |
| 5 | Node | **24.x** na Vercel; `engines.node = ">=24 <25"`, `.nvmrc = 24` | usuario |
| 6 | Dominio de producao | ainda nao informado; `NEXT_PUBLIC_SITE_URL` fica com placeholder ate o usuario passar | pendente |
| 7 | CSP | estatica, `script-src 'self' 'unsafe-inline'` documentado (pagina prerenderizada); nonce quando houver feature dinamica | security decisao 1 |
| 8 | Newsletter | forms ficam como estao (render congelado); Pre-Contract; provider decidido na spec da feature | security decisao 5 + ADR-0006 |
| 9 | Monitoramento de erros | adiado ate a primeira feature dinamica; registrado como skip documentado | security decisao 4 |
| 10 | postcss vulneravel dentro do next | `overrides` no package.json agora | security decisao 2 |
| 11 | Next 16 | nao migrar agora; patch para 15.5.x mais recente | security decisao 3 |
| 12 | Fotos soltas na raiz | gitignored, nao apagadas | usuario |
| 13 | Metrica de sucesso do site publico | nenhuma em v1; definida na primeira spec de marketing | recomendacao |
| 14 | Multi-rota | sim, o repo vira o produto completo com dashboard | usuario |
| 15 | Idiomas | es, pt, en | usuario |

## Status das fases (atualizado 2026-09-23)

| Fase | Status | Onde |
|---|---|---|
| 0 Governanca | ADRs e constituicao aceitos; DDRs de formalizacao (motion, tipografia, dark mode, copy) pendentes com o UX Strategist | `docs/adr/`, `docs/specs/` |
| 1 Ferramental | concluida, PR #4 | `main` |
| 2 Estrutura e estilo | concluida: T-15, T-06, T-08, T-09, T-11, T-23, T-14; T-12 cancelada (Q8) | PR da branch `refactor/phase-2-structure` |
| 3 Motion | concluida: T-05, T-16, T-17, T-18b, T-19 (parcial: priority opt-in; anel fica em `<picture>`), T-19b; spikes T-16b/T-17b nao executados | PR da branch `refactor/phase-3-motion`, `docs/tech-design/landing-motion.md` |
| 4 Interacao, a11y e formularios | depois da 3 | idem |
| 5 DevOps | parcial: CI, headers, health, Dependabot ja em `main`; Lighthouse CI e smoke pos-deploy pendentes | `docs/devops/setup-gap-report.md` |
