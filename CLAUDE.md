# vamosany-front-end

Landing page de Vamos a NY, em producao na Vercel. Vai crescer para o produto completo
(muitas paginas e, depois, o dashboard do viajante). Idiomas: es, pt, en.

## Stack
Next.js 15 App Router · React 19 · TypeScript 5 · Tailwind CSS 4 (CSS-first, tokens em `app/globals.css`) · GSAP 3.
npm (nao pnpm, ADR-0005). Node 24 (`.nvmrc`).

## Regras que valem sempre
- **O design e o motion da landing atual sao congelados** (ADR-0006). Refactors devem passar
  no baseline de screenshots (`npm run test:e2e`). Mudanca visual exige DDR.
- Toda feature passa pelo pipeline em `.claude/README.md`: constitution → spec → plan → implement → review → QA → security → deploy.
- Constituicao: `docs/specs/constitution.md` (herda `vamosany-back/CONSTITUTION.md`).
- ADRs em `docs/adr/`, decisoes de onboarding em `docs/decisions-2026-09-23.md`.
- Backlog de migracao: `docs/architecture/conventions-audit.md` § 4.

## Comandos
```bash
npm run dev            # http://localhost:3000
npm run typecheck && npm run lint && npm test
npm run build && npm run test:e2e   # e2e sobe `next start` na porta 3100
npm run test:e2e:update             # so quando uma mudanca visual foi aprovada por DDR
```
