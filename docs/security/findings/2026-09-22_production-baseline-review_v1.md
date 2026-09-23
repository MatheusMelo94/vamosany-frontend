# Findings Report: Vamos a NY landing (mobbin-front-text) — Production baseline review v1

- **Data:** 2026-09-22 (verificação ao vivo concluída em 2026-09-23 UTC)
- **Projeto:** `mobbin-front-text` (`package.json` name: `deel-landing`) — landing page pública, single-page, Next.js 15 App Router / React 19 / TS 5 / Tailwind 4 / GSAP 3
- **Backend companion:** nenhum (verificado no código, ver § Verificações sem finding)
- **Postura:** **Production** (informada no plano de onboarding, passo 3). Não existe `docs/security-posture.md` nem `CLAUDE.md` no projeto — recomenda-se registrar a postura em `docs/security-posture.md`.
- **Threshold de bloqueio nesta postura:** CRITICAL + HIGH
- **Escopo:** estado atual do código (o checkout não é um repositório git; snapshot dos arquivos em 2026-09-22). Revisado: `app/`, `components/`, `next.config.ts`, `package.json`, `package-lock.json`, `.gitignore`, `public/`, `tsconfig.json`, `postcss.config.mjs`, `README.md`. Ignorado: `node_modules/`, conteúdo de `.next/` (exceto para o bundle grep e o manifest de rotas).
- **Superfícies revisadas:** Config & headers (`next.config.ts`), Env, Server Components (`app/layout.tsx`, `app/page.tsx` e 12 componentes sem `"use client"`), Client Components (8 arquivos com `"use client"`), Third-party, Dependencies.
- **Superfícies ausentes (confirmado):** Server Actions, Route Handlers, `middleware.ts`, sessão/autenticação, cookies, chamadas de rede em runtime.
- **Frameworks aplicados:** OWASP WSTG (INFO, CONF, INPV, CLNT, BUSL), ASVS 4.x (V5, V14), OWASP Top 10:2025, Cheat Sheets (CSP, Clickjacking Defense, Third-Party JavaScript, XSS Prevention), STRIDE (I, T), Next.js security guidance.
- **Bundle audit:** grep de `.next/static` (16 chunks JS do build existente, `BUILD_ID` de 2026-09-22 05:57 UTC) por `sk_(live|test)_`, `-----BEGIN`, `AKIA…`, `NEXT_PUBLIC_`, `ghp_`, `xox[bp]-`, `AIza…` → **0 hits**. 0 source maps em `.next/static`; `productionBrowserSourceMaps: false`. Não foi feito rebuild (revisão read-only); a única fonte alterada após o build é `components/navbar.tsx` (05:59 UTC), que não lê env nem contém segredos.
- **Verificação de headers/CSP:** `next start` local sobre o build existente + `curl -I http://127.0.0.1:3123/`. Resultado: **nenhum** header de segurança (sem `Strict-Transport-Security`, `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, `Cross-Origin-Opener-Policy`); `X-Powered-By: Next.js` presente; `Cache-Control: s-maxage=31536000` (página totalmente prerenderizada, `x-nextjs-prerender: 1`); nenhum `Set-Cookie`. Servidor encerrado após a sondagem.
- **Patch level do framework:** `next@15.5.25` (lockfile e `node_modules` coincidem). Advisories relevantes:
  - GHSA-2xp9-vwfh-vxw4 (Critical, 2026-08-25, RCE via AVIF no Image Optimizer) — corrigido em 15.5.24 → **patched**.
  - GHSA-vcvr-r3jv-pc5j / CVE-2026-94545 (Critical, 2026-09-22, RCE em `next/og` `ImageResponse`) — afeta apenas 16.2.0–16.3.5; o projeto não usa `next/og` → **não aplicável**. `next@15.5.26` (2026-09-22) traz "additional security hardening for `next/og`" → ver Finding 0005.
  - `npm audit` não lista nenhum advisory direto para `next@15.5.25` (o único `via` é `postcss`, ver Finding 0004).

---

## Sumário

| ID | Severidade | Bloqueante | Título | Superfície | Owner |
|----|-----------|-----------|--------|-----------|-------|
| 0001 | MEDIUM | Não | Nenhum security header configurado (HSTS, nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors/XFO, COOP) | Config | Frontend DevOps |
| 0002 | MEDIUM | Não | Ausência de Content-Security-Policy | Config | Frontend Architect (decisão) + Frontend DevOps |
| 0003 | MEDIUM | Não | Sem CI, sem gate de `npm audit`, sem Dependabot/Renovate, sem `packageManager`/`engines` pinados | Dependency | Frontend DevOps |
| 0004 | LOW (npm audit: HIGH) | Não | `postcss@8.4.31` pinado dentro de `next` com 4 advisories (2 HIGH) — exposição apenas em build time | Dependency | Frontend Engineer |
| 0005 | LOW | Não | Next.js um patch atrás (15.5.25 → 15.5.26, security hardening) e uma major atrás (16.3.6) | Dependency | Frontend Engineer / Frontend Architect (ADR) |
| 0006 | LOW | Não | `X-Powered-By: Next.js` exposto (`poweredByHeader` default) | Config | Frontend Engineer |
| 0007 | LOW | Não | `metadataBase` aponta para domínio placeholder `vamosany.example.com` em produção | Server Component | Frontend Engineer |
| 0008 | LOW | Não | Inline `<script dangerouslySetInnerHTML>` no root layout sem ADR e sem estratégia de nonce/hash | Server Component | Frontend Engineer |
| 0009 | LOW | Não | Formulários de newsletter "mortos" fazem POST do e-mail do visitante para `/` sem consumidor, sem Privacy Policy, sem bot protection | Client/Server (design) | UX Strategist (escopo) + Frontend Architect |
| 0010 | LOW | Não | `.gitignore` cobre apenas `.env*.local`; `.env` / `.env.production` seriam commitados | Env | Frontend Engineer |
| 0011 | INFO | Não | Sem error monitoring nem CSP reporting (lean Production = BUY) — decisão build-vs-buy pendente | Third-party | Usuário (decisão) |
| 0012 | INFO | Não | Higiene de repositório: ~37 MB de imagens não referenciadas na raiz, `Melius page.png`, nome de pacote legado, sem `robots`/`sitemap`/`favicon` | Config | Frontend Engineer |

**Contagem:** CRITICAL 0 · HIGH 0 · MEDIUM 3 · LOW 7 · INFO 2.
**Findings bloqueantes (CRITICAL + HIGH):** **nenhum**. O backlog de tech-debt antes da próxima feature fica, portanto, a critério do usuário; a recomendação é executar 0001, 0003, 0006 e 0010 (baixo esforço, alto valor) e decidir 0002/0004/0005 (ver § Decisões pendentes).

---

## Verificações sem finding (o que está OK)

Registrado brevemente, conforme exigido pelas conventions.

- **Claim do README ("no backend calls") — verificado.** Zero ocorrências de `fetch(`, `axios`, `XMLHttpRequest`, `WebSocket`, `EventSource` em `app/` e `components/`; `.next/app-path-routes-manifest.json` contém apenas `/` e `/_not-found`; o HTML servido não referencia nenhuma origem externa (`grep https?://` → vazio).
- **Sessão / auth (WSTG-ATHN, WSTG-SESS, ASVS V2/V3):** ausentes. Nenhum cookie é emitido (sem `Set-Cookie`), nenhum uso de `localStorage`/`sessionStorage`/`document.cookie`. Os links "Log in"/"Sign up" (`components/navbar.tsx:305-310, 445-458`) são âncoras `#login`/`#signup` sem fluxo real. N/A.
- **Server Actions / Route Handlers / Middleware (WSTG-ATHZ, WSTG-APIT):** ausentes. Nenhum `"use server"`, nenhum `app/api/**`, nenhum `middleware.ts`/`proxy.ts`. N/A. O advisory de middleware bypass (GHSA-6gpp-xcg3-4w24, classe CVE-2025-29927) não tem superfície aqui.
- **Environment (WSTG-CONF, § Secrets & Environment):** nenhum `process.env` nem `NEXT_PUBLIC_` no código; nenhum arquivo `.env*` presente no diretório (verificado com `ls -la .env*`); bundle grep limpo. Sem `lib/env.ts` porque não há variáveis — aceitável.
- **Third-party scripts (WSTG-CLNT, Cheat Sheet Third-Party JS):** nenhum `<script src>` externo, nenhum `next/script`, nenhum analytics, nenhum iframe. A única fonte externa é `Courier_Prime` via `next/font/google` (`app/layout.tsx:2-12`), que baixa a fonte **em build time** e serve de `/_next/static/media/*.woff2` (confirmado pelo header `link: … rel=preload; as="font"`): nenhuma chamada a Google em runtime, compatível com `font-src 'self'` e sem transferência de IP do visitante. Dependência de rede em build (fonts.googleapis.com) é o único ponto a anotar.
- **Links externos / `rel="noopener"` (WSTG-CLNT-04):** todos os `href` são `/`, âncoras `#…` literais ou constantes estáticas (`components/navbar.tsx:109-132`, `components/services.tsx:19,37,55`); nenhum `target="_blank"`; nenhum `href`/`src` derivado de input do usuário. N/A.
- **`dangerouslySetInnerHTML` (WSTG-INPV, XSS Cheat Sheet):** uma única ocorrência, literal estática sem interpolação (`app/layout.tsx:29-34`) — ver Finding 0008 (processo/CSP, não XSS). Nenhum `innerHTML`, `eval`, `new Function`, `postMessage`. `scroll-effects.tsx` usa apenas `textContent` (`components/scroll-effects.tsx:82,90,93`) para os contadores — sink seguro.
- **Imagens (WSTG-CONF, § Input & Output Handling):** todos os `src` são caminhos locais em `public/`; `images.remotePatterns: []` e `dangerouslyAllowSVG: false` (confirmado em `.next/required-server-files.json`); o otimizador rejeita URL remota (`/_next/image?url=https://example.com/…` → 400) e serve local (→ 200). `components/hero-ring.tsx:154-164` usa `<picture>/<img>` cru com caminhos estáticos — sem risco. Advisory AVIF (GHSA-2xp9) já corrigido na versão instalada.
- **Supply chain (§ Supply Chain):** `package-lock.json` v3 presente e consistente com `package.json`; **0 pacotes com `hasInstallScript`** no lockfile; sem `postinstall` no projeto; `gsap@3.15.0` é a última versão e os plugins `SplitText`/`CustomEase`/`ScrollTrigger` vêm do próprio pacote (não há `eval`; compatível com CSP estrita). Lacunas de processo em 0003.
- **Source maps / console (WSTG-INFO):** `productionBrowserSourceMaps: false`; 0 `.map` em `.next/static`; nenhum `console.*` no código de produção.
- **Error handling (WSTG-ERRH):** não há `error.tsx` custom; 404 padrão do Next sem vazamento (`Cache-Control: no-store`). Aceitável para página estática.
- **Rate limiting / bot protection:** sem endpoints mutáveis hoje → N/A. Passa a ser obrigatório quando os formulários forem ligados (Finding 0009).

---

# Finding 0001: Nenhum security header configurado

- **Severity:** MEDIUM
- **OWASP Top 10:2025:** A02 — Security Misconfiguration
- **Framework citation(s):** WSTG-CONF-12 (Test for Content Security Policy) / WSTG-CLNT-09 (Clickjacking), ASVS V14.4.1, V14.4.3, V14.4.4, V14.4.5, V14.4.6; Cheat Sheet HTTP Headers, Clickjacking Defense
- **Surface:** Config
- **Affected component:** `next.config.ts:3` (`const nextConfig: NextConfig = {};`) — sem `headers()`; sem `vercel.json`/config de hosting no repo
- **Status:** Open
- **Posture:** Production
- **Blocking at this posture:** No

## Description
O `next.config.ts` está vazio e não há configuração de hosting no repositório. A resposta de `/` (verificada com `curl -I` sobre o build existente) não traz nenhum dos headers exigidos em § Default Headers: `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`/CSP `frame-ancestors`, `Cross-Origin-Opener-Policy`.

## Evidence
```
$ curl -sI http://127.0.0.1:3123/
HTTP/1.1 200 OK
Vary: rsc, next-router-state-tree, ...
X-Powered-By: Next.js
Cache-Control: s-maxage=31536000
Content-Type: text/html; charset=utf-8
(nenhum header de segurança)
```
`.next/required-server-files.json` → `config.headers: null`.

## Impact
Sem `frame-ancestors`/XFO a página pode ser embutida em iframe por qualquer origem (clickjacking / UI redress usando a marca "Vamos a NY", por exemplo para phishing de newsletter). Sem HSTS, o primeiro acesso via `http://` fica sujeito a downgrade se o hosting não injetar HSTS (Vercel injeta; outros hosts não necessariamente — hosting não identificado no repo). Sem `Referrer-Policy`, o referrer completo vaza para qualquer destino futuro. Impacto contido porque hoje não há sessão, ação autenticada nem input processado — é defesa em profundidade, mas é o baseline mínimo em Production.

## Likelihood
Easy (embutir a página em iframe é trivial); impacto atual baixo.

## Remediation
Adicionar `headers()` em `next.config.ts` para `source: "/(.*)"` com exatamente o conjunto de § Default Headers:
`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`, `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy: same-origin`. Verificar com `curl -I` na preview URL antes do deploy. CSP fica em 0002 (decisão separada). Se o hosting já injeta HSTS, manter o header no Next mesmo assim (portabilidade).

## Remediation Route
- **Owner role:** Frontend DevOps Engineer
- **Reason routed there:** deploy config / headers

---

# Finding 0002: Ausência de Content-Security-Policy

- **Severity:** MEDIUM
- **OWASP Top 10:2025:** A02 — Security Misconfiguration
- **Framework citation(s):** WSTG-CONF-12, WSTG-CLNT-01/09, ASVS V14.4.3; Cheat Sheet Content Security Policy; Next.js guidance "Content Security Policy" (nonces)
- **Surface:** Config (com efeito em `app/layout.tsx`)
- **Affected component:** `next.config.ts:3`; `app/layout.tsx:29-34` (inline script que precisará de nonce/hash)
- **Status:** Open
- **Posture:** Production
- **Blocking at this posture:** No

## Description
Não há CSP. Em Production as conventions exigem CSP estrita baseada em nonce (§ Content Security Policy). A página é 100% estática/prerenderizada (`x-nextjs-prerender: 1`, `Cache-Control: s-maxage=31536000`) e o HTML contém 51 `<script>` inline do runtime RSC (`self.__next_f.push`) além do inline script do layout — o que condiciona a estratégia de CSP.

## Evidence
`curl -s http://127.0.0.1:3123/ | grep -oE '<script[^>]*>' | sort | uniq -c` → `51 <script>` (inline, sem nonce) + 8 chunks `self`. Nenhuma origem externa referenciada; nenhum `next/script`.

## Impact
Sem CSP, qualquer futura injeção (dependency compromise, XSS introduzido em feature futura, extensão maliciosa injetando em página sem `frame-ancestors`) executa sem segunda barreira. Hoje não existe vetor de injeção no código (sem input, sem HTML cru dinâmico, sem terceiros), então o impacto imediato é baixo; o risco cresce a cada feature (newsletter, login, analytics).

## Likelihood
Hard hoje (não há sink explorável); Moderate após ligar formulários/analytics.

## Remediation
Decisão arquitetural (ver § Decisões pendentes, item 1), duas opções:
1. **Estrita (padrão das conventions):** `middleware.ts` gerando nonce por request (`x-nonce`), `script-src 'self' 'nonce-…' 'strict-dynamic'`, `style-src 'self' 'unsafe-inline'` (Tailwind/GSAP), `img-src 'self' data: blob:`, `font-src 'self'`, `connect-src 'self'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, `object-src 'none'`, `upgrade-insecure-requests`. O Next aplica o nonce automaticamente aos scripts RSC; o inline script de `app/layout.tsx:29-34` deve migrar para `next/script` `strategy="beforeInteractive"` (recebe o nonce) — **custo:** a página deixa de ser estática (dynamic rendering por request), perdendo o cache `s-maxage=31536000`.
2. **Estática com desvio documentado:** CSP em `next.config.ts` mantendo prerender: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests`. `'unsafe-inline'` em `script-src` é uma relaxação (finding em Production por § CSP "cada relaxação é finding a menos que documentada") — exige Acceptance Note com revisit trigger "primeira feature com input do usuário ou terceiro".
Em ambas: `report-to` para o vendor de monitoring quando 0011 for decidido; testar com `Content-Security-Policy-Report-Only` primeiro.

## Remediation Route
- **Owner role:** Frontend Architect (escolha estático vs. nonce) → Frontend DevOps Engineer (header) / Frontend Engineer (migração do inline script)
- **Reason routed there:** architecture (rendering mode) + deploy config

---

# Finding 0003: Sem CI, sem gate de auditoria de dependências, sem pinagem de package manager

- **Severity:** MEDIUM
- **OWASP Top 10:2025:** A03 — Software Supply Chain Failures
- **Framework citation(s):** WSTG-CONF-01, ASVS V14.2.1, V14.2.4, V14.2.5; § Supply Chain
- **Surface:** Dependency
- **Affected component:** `package.json:1-25` (sem `packageManager`, sem `engines`); ausência de `.github/`, `.npmrc`, `.nvmrc`; ausência de config Dependabot/Renovate
- **Status:** Open
- **Posture:** Production
- **Blocking at this posture:** No

## Description
O projeto não tem pipeline de CI, portanto nenhum `npm audit --audit-level=high` bloqueante, nenhum `npm ci` (frozen lockfile), nenhum bundle grep automatizado, e nenhuma automação de updates. `package.json` não pina `packageManager` nem `engines` (Node local: v24.16.0). Isso explica como um advisory HIGH (0004) e um patch de segurança (0005) passaram despercebidos — é a causa-raiz de processo.

## Evidence
`ls -la .github .npmrc .nvmrc .node-version` → todos ausentes. `node -e 'require("./package.json").packageManager'` → `undefined`. `npm audit --omit=dev` → 1 moderate + 1 high (não gateado).

## Impact
Dependências vulneráveis ou comprometidas entram em produção sem detecção; builds não reproduzíveis entre máquinas (versão de npm/Node livre); patches de segurança do Next (política: ≤ 1 semana) dependem de memória humana.

## Likelihood
Moderate (o npm ecosystem tem incidentes recorrentes; sem gate, a exposição é contínua).

## Remediation
Por § Supply Chain: (a) `"packageManager": "npm@11.13.0"` e `"engines": { "node": ">=24" }` em `package.json`; (b) workflow de CI com `npm ci`, `npm run build`, `npm audit --audit-level=high --omit=dev` (bloqueante) e grep de `.next/static` por prefixos de segredo; (c) Dependabot/Renovate agrupado semanal com CI obrigatório; (d) GitHub Actions pinadas por SHA. Nota: o checkout revisado não é um repositório git — confirmar que o lockfile está commitado no repositório real.

## Remediation Route
- **Owner role:** Frontend DevOps Engineer
- **Reason routed there:** CI / deploy config

---

# Finding 0004: `postcss@8.4.31` pinado dentro de `next` com advisories abertos

- **Severity:** LOW (severidade do advisory / `npm audit`: HIGH — ver justificativa em Impact; não é downgrade silencioso)
- **OWASP Top 10:2025:** A03 — Software Supply Chain Failures
- **Framework citation(s):** WSTG-CONF-01, ASVS V14.2.1; § Supply Chain
- **Surface:** Dependency
- **Affected component:** `package-lock.json` → `node_modules/next/node_modules/postcss@8.4.31` (dependência pinada exata de `next@15.5.25`; a cópia top-level `node_modules/postcss@8.5.28` está limpa)
- **Status:** Open
- **Posture:** Production
- **Blocking at this posture:** No

## Description
`npm audit --omit=dev` reporta 2 vulnerabilidades (1 high, 1 moderate), ambas originadas na cópia de `postcss` que o Next pina em `8.4.31`:
- GHSA-6g55-p6wh-862q (HIGH, CWE-22/200) — leitura arbitrária de arquivo via `sourceMappingURL` controlado pelo atacante em comentários CSS (≤ 8.5.11)
- GHSA-r28c-9q8g-f849 (HIGH, CWE-22) — path traversal no auto-load de source map anterior (≤ 8.5.17)
- GHSA-fxqj-rqcc-2cmp (moderate) — fix incompleto do anterior (≤ 8.5.22)
- GHSA-qx2v-qp2m-jg93 (moderate, CWE-79) — XSS via `</style>` não escapado no stringify (< 8.5.10)
`fixAvailable` do npm: `next@16.3.6` (semver major).

## Evidence
```
$ npm audit --omit=dev
postcss  <=8.5.22  high  nodes: node_modules/next/node_modules/postcss
next     9.3.4-canary.0 - 16.3.0-preview.10  moderate  via: postcss  fixAvailable: next@16.3.6 (major)
```

## Impact
Todos os quatro advisories exigem que o PostCSS processe **CSS controlado pelo atacante** — isso só acontece em build time e o único CSS do projeto é `app/globals.css` (first-party) + Tailwind. Não há processamento de CSS em runtime nem CSS de terceiros/usuário. Pior caso credível: um contributor/dependência maliciosa injetando `sourceMappingURL` no CSS do build lê um arquivo da máquina de build — cenário que já pressupõe comprometimento da supply chain. Por impacto + probabilidade neste contexto: LOW. Continua sendo um item de higiene que bloqueará o gate de CI de 0003 quando ele existir.

## Likelihood
Hard.

## Remediation
Escolher uma (decisão do usuário, § Decisões pendentes item 2): (a) `"overrides": { "postcss": "^8.5.28" }` em `package.json` para forçar a cópia aninhada (8.x é API-compatível; validar com `npm run build`); (b) aceitar risco com Acceptance Note até a migração para Next 16 (0005), que resolve nativamente. Em qualquer caso, registrar em CI (0003) para não voltar.

## Remediation Route
- **Owner role:** Frontend Engineer
- **Reason routed there:** implementation (dependency override / upgrade)

---

# Finding 0005: Next.js um patch de segurança atrás e uma major atrás

- **Severity:** LOW
- **OWASP Top 10:2025:** A03 — Software Supply Chain Failures
- **Framework citation(s):** ASVS V14.2.1; § Supply Chain "Minimum-version policy" (patches de segurança em ≤ 1 semana; major via ADR)
- **Surface:** Dependency
- **Affected component:** `package.json:13` (`"next": "^15.5.4"`), `package-lock.json` (`next@15.5.25`)
- **Status:** Open
- **Posture:** Production
- **Blocking at this posture:** No

## Description
Instalado `next@15.5.25` (2026-08-31). `next@15.5.26` foi publicado em 2026-09-22 com "additional security hardening for `next/og`" (relacionado a GHSA-vcvr-r3jv-pc5j / CVE-2026-94545, RCE em `ImageResponse`, cujo range afetado é 16.2.0–16.3.5). O projeto não usa `next/og`, `ImageResponse` nem rotas `opengraph-image`/`twitter-image` (verificado por grep) — logo não está exposto, mas a política é aplicar o patch dentro de uma semana. A linha 15.5 está na tag `backport` (ainda mantida); `latest` é 16.3.6. Os advisories de 2026-07-21 (middleware bypass, SSRF em rewrites/Server Actions, cache confusion, DoS) e de 2026-08-25 (AVIF RCE, Windows RCE) já estão cobertos em 15.5.25 (`npm audit` não reporta advisory direto para `next`).

## Evidence
`npm view next dist-tags` → `backport: 15.5.26`, `latest: 16.3.6`. `grep -rnE "next/og|ImageResponse|opengraph-image" app components` → nenhum resultado.

## Impact
Nenhum vetor explorável hoje. Risco é de janela: ficar na 15.5 depende da tag `backport`, cujo fim de suporte não é garantido; cada advisory futuro corrigido só em 16.x vira um bloqueio de upgrade sob pressão.

## Likelihood
Hard (hoje).

## Remediation
(a) Imediato: `next@15.5.26` (patch, sem breaking). (b) Planejar migração para Next 16 via ADR (§ Supply Chain: "next major upgrades via ADR") — o projeto é pequeno (2 rotas, sem middleware/actions), o custo é baixo; a migração também resolve 0004. Manter React 19.3.0 e GSAP 3.15.0 (já são as últimas).

## Remediation Route
- **Owner role:** Frontend Engineer (patch) / Frontend Architect (ADR de major)
- **Reason routed there:** implementation / architecture

---

# Finding 0006: `X-Powered-By: Next.js` exposto

- **Severity:** LOW
- **OWASP Top 10:2025:** A02 — Security Misconfiguration
- **Framework citation(s):** WSTG-INFO-02 (Fingerprint Web Server), WSTG-INFO-08 (Fingerprint Web Application Framework), ASVS V14.3.3
- **Surface:** Config
- **Affected component:** `next.config.ts:3` (`poweredByHeader` no default `true`)
- **Status:** Open
- **Posture:** Production
- **Blocking at this posture:** No

## Description
Toda resposta (200 e 404) traz `X-Powered-By: Next.js`, facilitando fingerprint do framework para scanners que cruzam versão/advisories.

## Evidence
`curl -sI http://127.0.0.1:3123/ | grep X-Powered-By` → `X-Powered-By: Next.js`; `.next/required-server-files.json` → `poweredByHeader: true`.

## Impact
Redução marginal do esforço de reconhecimento. Os chunks `/_next/static/…` já denunciam Next, portanto o ganho é apenas de não anunciar ativamente.

## Likelihood
Trivial (mas impacto mínimo).

## Remediation
`poweredByHeader: false` em `next.config.ts`. Um item de uma linha para incluir no mesmo PR de 0001.

## Remediation Route
- **Owner role:** Frontend Engineer
- **Reason routed there:** implementation

---

# Finding 0007: `metadataBase` com domínio placeholder em produção

- **Severity:** LOW
- **OWASP Top 10:2025:** A02 — Security Misconfiguration
- **Framework citation(s):** WSTG-CONF-01, WSTG-INFO-05; ASVS V14.1
- **Surface:** Server Component
- **Affected component:** `app/layout.tsx:15` — `metadataBase: new URL("https://vamosany.example.com")`
- **Status:** Open
- **Posture:** Production
- **Blocking at this posture:** No

## Description
`metadataBase` define a base absoluta para `canonical`, `og:url`, `og:image` etc. Em um site já em produção, qualquer metadata absoluta gerada aponta para `vamosany.example.com` (domínio reservado, não controlado pelo projeto).

## Evidence
`app/layout.tsx:15`. Hoje o objeto `metadata` só declara `title`/`description`, então o efeito é latente; o primeiro `openGraph`/`alternates.canonical` adicionado herda a base errada.

## Impact
Integridade de metadata: canonical/OG apontando para domínio de terceiros (`example.com` é reservado pela IANA, então não há takeover, mas SEO e previews de link quebram e o site "endossa" uma URL que não é sua).

## Likelihood
Trivial de ocorrer ao adicionar OG tags; impacto de segurança baixo.

## Remediation
Ler o domínio real de uma variável de build não secreta (`NEXT_PUBLIC_SITE_URL` via `lib/env.ts` `public` schema, § Secrets & Environment) ou fixar o domínio de produção; adicionar `.env.example` documentando-a como `public`.

## Remediation Route
- **Owner role:** Frontend Engineer
- **Reason routed there:** implementation

---

# Finding 0008: Inline script via `dangerouslySetInnerHTML` no root layout sem ADR e sem plano de nonce/hash

- **Severity:** LOW
- **OWASP Top 10:2025:** A05 — Injection (controle preventivo; não há injeção hoje)
- **Framework citation(s):** WSTG-INPV-01/02, WSTG-CLNT-01, ASVS V5.3.3; Cheat Sheet XSS Prevention; § Input & Output Handling ("`dangerouslySetInnerHTML` forbidden without sanitization + ADR"); § Third-Party Scripts ("raw `<script>` tags are a finding")
- **Surface:** Server Component
- **Affected component:** `app/layout.tsx:29-34`
- **Status:** Open
- **Posture:** Production
- **Blocking at this posture:** No

## Description
O layout injeta um `<script>` cru com `dangerouslySetInnerHTML` para adicionar a classe `gsap` ao `<html>` antes do first paint (evita flash de conteúdo escondido). O conteúdo é um literal de compile-time sem interpolação, portanto **não há XSS** — a revisão confirma que "React escapes output" nem sequer é invocado como justificativa: não existe dado dinâmico. O finding é de conformidade: (a) a convention exige ADR nomeando a fonte do conteúdo; (b) o script precisa de nonce ou hash SHA-256 quando a CSP (0002) existir; (c) tags `<script>` cruas são finding pela § Third-Party Scripts, embora este seja first-party.

## Evidence
```tsx
// app/layout.tsx:29-34
<script dangerouslySetInnerHTML={{ __html:
  "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('gsap')}}catch(e){}" }} />
```

## Impact
Nenhum hoje. Risco futuro: alguém "estender" o literal com dados dinâmicos sem sanitização, ou a CSP estrita quebrar a animação (script bloqueado → classe `gsap` nunca adicionada → página renderiza estática, degradação graciosa mas silenciosa).

## Likelihood
Hard.

## Remediation
Registrar um ADR curto (`docs/adr/`) "inline bootstrap script for motion opt-in" com a regra "literal only, never interpolate". Ao implementar 0002: migrar para `<Script id="gsap-optin" strategy="beforeInteractive">{…}</Script>` de `next/script` (recebe o nonce automaticamente) ou, na opção estática, incluir o hash `'sha256-…'` em `script-src`.

## Remediation Route
- **Owner role:** Frontend Engineer
- **Reason routed there:** implementation (documentação + migração junto com CSP)

---

# Finding 0009: Formulários de newsletter enviam o e-mail do visitante para `/` sem consumidor, sem política de privacidade e sem bot protection

- **Severity:** LOW
- **OWASP Top 10:2025:** A06 — Insecure Design
- **Framework citation(s):** WSTG-BUSL-01, WSTG-INPV-01, ASVS V1.5, V5.1; § Rate Limiting; § Error Responses; Revisit Trigger "EU / LGPD scope confirmed" (`frontend-security-build-vs-buy.md`)
- **Surface:** Client Component / Server (design)
- **Affected component:** `components/cta.tsx:44-62` e `components/footer.tsx:146-178` (`<form action="#" method="post">` com `<input type="email" required>`); links `Privacy Policy`, `Cookie Settings`, `Terms` em `components/footer.tsx:173, 202-208` (todos `href="#"`)
- **Status:** Open
- **Posture:** Production
- **Blocking at this posture:** No

## Description
Os dois formulários de newsletter são funcionais do ponto de vista do browser: `required` + `type="submit"` fazem um POST real de `email=<valor>` para a própria página. Verificado ao vivo: `POST /` → `200` com o mesmo HTML (Next renderiza a página; nada consome o body). O visitante acredita ter assinado ("No spam. Unsubscribe in one click.") e nada acontece. O texto de consentimento ("I confirm that I have read the Privacy Policy") aponta para `#` — não existe Privacy Policy. O footer declara "Made in Madrid", o que coloca o produto em escopo GDPR/UE quando coletar e-mails.

## Evidence
```
$ curl -s -o /dev/null -w '%{http_code}' -X POST -d 'email=test@example.com' http://127.0.0.1:3123/
200
```

## Impact
Hoje: dado pessoal (e-mail) trafega até o servidor/hosting sem propósito; pode terminar em logs de acesso/WAF do hosting dependendo da configuração (bodies normalmente não são logados, mas não há garantia). Expectativa de privacidade quebrada, sem base legal documentada. Quando alguém "ligar" o formulário sem passar por review, entram de uma vez: Server Action pública sem zod, sem rate limit, sem Turnstile, sem consentimento — todos MVP+ obrigatórios pelas conventions.

## Likelihood
Easy (qualquer visitante dispara o POST); impacto baixo enquanto ninguém consome o dado.

## Remediation
Decisão de escopo (§ Decisões pendentes, item 5): (a) enquanto não há backend, trocar os forms por CTA não-funcional (remover `action`/`method`, `onSubmit` com `preventDefault` + mensagem "em breve") ou remover; (b) ao implementar de verdade: Server Action com zod, result union `{ ok, errors }`, rate limit 10/IP/hora + Cloudflare Turnstile (§ Rate Limiting, lean BUY), Privacy Policy real e opt-in explícito (consent management: BUILD banner simples ou BUY conforme registry), threat model antes da implementação (Spec & Plan Review).

## Remediation Route
- **Owner role:** UX Strategist (escopo: forms mortos e páginas legais) → Frontend Architect (plano da feature) → Frontend Engineer
- **Reason routed there:** scope / architecture

---

# Finding 0010: `.gitignore` não cobre `.env` / `.env.production`

- **Severity:** LOW
- **OWASP Top 10:2025:** A02 — Security Misconfiguration
- **Framework citation(s):** WSTG-CONF-04 (Review Old Backup and Unreferenced Files for Sensitive Information), ASVS V14.1.1; § Secrets & Environment ("`.env.local` gitignored"; `.env.example` commitado)
- **Surface:** Env
- **Affected component:** `.gitignore:7` (`.env*.local`)
- **Status:** Open
- **Posture:** Production
- **Blocking at this posture:** No

## Description
Só `.env*.local` está ignorado. Um `.env` ou `.env.production` criado no futuro (por exemplo para uma API key de newsletter) seria commitado. Hoje **não existe nenhum arquivo `.env*`** no diretório e o código não lê `process.env`, portanto não há vazamento atual — é uma armadilha latente. Também não existe `.env.example` (aceitável enquanto não há variáveis).

## Evidence
`ls -la .env*` → "no .env files". `cat .gitignore` → `.env*.local` apenas. `grep -rn "process.env" app components` → vazio.

## Impact
Segredo commitado no histórico → rotação obrigatória + reescrita de histórico. Latente.

## Likelihood
Moderate (padrão comum de erro ao adicionar a primeira variável).

## Remediation
Trocar por `.env*` + `!.env.example`; criar `.env.example` quando a primeira variável surgir (0007 já sugere `NEXT_PUBLIC_SITE_URL`), com a coluna `public | secret` no README. Adicionar o bundle grep no CI (0003).

## Remediation Route
- **Owner role:** Frontend Engineer
- **Reason routed there:** implementation

---

# Finding 0011: Sem error monitoring nem CSP reporting (decisão build-vs-buy pendente)

- **Severity:** INFO
- **OWASP Top 10:2025:** A09 — Security Logging and Alerting Failures
- **Framework citation(s):** ASVS V7.1, V7.2; § Logging & Monitoring; § Content Security Policy ("`report-to` at Production+"); registry lean "Error monitoring — Production: BUY (Sentry)"
- **Surface:** Third-party
- **Affected component:** projeto inteiro (nenhum SDK presente)
- **Status:** Open
- **Posture:** Production
- **Blocking at this posture:** No

## Description
Não há SDK de monitoring nem endpoint de CSP report. Para um site estático sem backend o valor é limitado (erros de runtime JS do GSAP; violações de CSP quando 0002 existir), mas o lean de registry em Production é BUY e a decisão precisa ser tomada explicitamente — inclusive para "skip com Acceptance Note".

## Evidence
Sem `@sentry/*`, sem `report-to`/`report-uri`, sem `instrumentation.ts`.

## Impact
Cegueira operacional: quebra de animação/JS em produção ou CSP bloqueando algo passam despercebidos.

## Likelihood
N/A (finding de decisão).

## Remediation
Aplicar o Decision Template (`frontend-security-build-vs-buy.md`) para "Error monitoring + CSP reporting": Buy Sentry free tier (com PII scrubbing default, source maps privados) vs. skip documentado até a primeira feature dinâmica. Após a decisão do usuário, registrar uma linha no Decisions Log. Se BUY: o SDK entra via `next/script`/`@sentry/nextjs` com nonce e `connect-src` ajustado na CSP.

## Remediation Route
- **Owner role:** Usuário (decisão) → Frontend DevOps Engineer (integração)
- **Reason routed there:** build-vs-buy

---

# Finding 0012: Higiene de repositório (arquivos não referenciados, nome legado, metadados ausentes)

- **Severity:** INFO
- **OWASP Top 10:2025:** A02 — Security Misconfiguration
- **Framework citation(s):** WSTG-CONF-04, WSTG-INFO-01
- **Surface:** Config
- **Affected component:** raiz do projeto — `Melius page.png` (1,2 MB), `beautiful-view-new-york-city.jpg` (9,3 MB), `manhattan.jpg` (9,7 MB), `new-york-city.jpg` (8,8 MB), `new-york-city-manhattan-skyline-aerial-view.jpg` (8,1 MB), `vamosany2-6.jpg`, `vamosnay1.jpg`, `logos-01.png`, `logo-pretzel*.png` (duplicados de `public/`) — ~37 MB fora de `public/`; `package.json:2` (`"name": "deel-landing"`); ausência de `robots.txt`/`sitemap`/`favicon`
- **Status:** Open
- **Posture:** Production
- **Blocking at this posture:** No

## Description
Arquivos fora de `public/` **não são servidos** pelo Next (verificado: só `public/` e `.next/static` são expostos), então não há vazamento. São originais de foto não otimizados, duplicatas e um screenshot `Melius page.png` que parece ser referência de design de terceiro (verificar direito de uso/atribuição, como já feito corretamente para as fotos Wikimedia em `public/img/CREDITS.json` e no footer). `"name": "deel-landing"` é resquício de outro projeto. Não há `app/robots.ts`, `app/sitemap.ts` nem `favicon`/`icon` — irrelevante para segurança, mas esperado em produção.

## Evidence
`ls -la *.png *.jpg` na raiz; `du -ch` → 37M. `app-path-routes-manifest.json` → apenas `/` e `/_not-found`.

## Impact
Nenhum de segurança. Repositório pesado, risco de licença do screenshot, sinal de "projeto não finalizado" para quem audita.

## Likelihood
N/A.

## Remediation
Mover originais para fora do repo (ou LFS), remover duplicatas e `Melius page.png` (ou documentar a licença), renomear o pacote, adicionar `app/robots.ts`, `app/sitemap.ts` e `app/icon.png`. Opcional; sem prazo.

## Remediation Route
- **Owner role:** Frontend Engineer
- **Reason routed there:** implementation

---

## Decisões pendentes (do usuário)

1. **Estratégia de CSP (0002):** nonce por request (estrita, torna a página dinâmica) **ou** CSP estática com `'unsafe-inline'` em `script-src` documentada como desvio aceito até a primeira feature com input/terceiro. Recomendação do reviewer: opção estática agora (mantém performance e cache, ganha `frame-ancestors`/`base-uri`/`form-action`/`object-src` imediatamente), com Acceptance Note e revisit trigger; migrar para nonce quando a newsletter for implementada.
2. **postcss (0004):** `overrides` agora ou aceitar até Next 16. Recomendação: `overrides` (custo ~15 min, elimina o HIGH do `npm audit` e desbloqueia o gate de CI).
3. **Next 16 (0005):** aprovar ADR de migração e prazo. Recomendação: patch 15.5.26 imediato; ADR de Next 16 no próximo ciclo.
4. **Error monitoring (0011):** BUY Sentry vs. skip documentado. Recomendação: skip com Acceptance Note até a primeira feature dinâmica, revisit trigger "newsletter/login entra em escopo".
5. **Formulários (0009):** desativar/remover até existir backend, ou priorizar a feature "newsletter" com threat model. Recomendação: desativar agora.
6. **Registrar a postura:** criar `docs/security-posture.md` com "Production" para que as próximas revisões não dependam do enunciado.

Nenhuma decisão acima é bloqueante por threshold; o reviewer não assina nem recusa deploy com base neste relatório — não há findings CRITICAL/HIGH abertos.

---

## Acceptance Notes

Nenhuma até o momento. Ao aceitar as decisões 1, 2 ou 4 como "skip/aceitar", o reviewer redige a Acceptance Note correspondente (severidade, razão, revisit trigger) e a anexa aqui.

---

## Convention Drift Detection

Padrões que o projeto expôs e que ainda não têm § nas conventions:

1. **CSP em páginas totalmente estáticas/prerenderizadas** — a § Content Security Policy assume nonce via middleware (dynamic rendering). Falta orientação para o trade-off "static + hash/`'unsafe-inline'` documentado vs. nonce + dynamic" e para o uso de `Content-Security-Policy-Report-Only` como fase de rollout.
2. **UI placeholder em produção** (forms `action="#"`, links legais `#`) — falta uma regra explícita "nenhum form com `method="post"` sem consumidor em Production; placeholders legais são finding de BUSL".
3. **Build-time third parties** (`next/font/google` baixa em build) — a § Third-Party Scripts cobre runtime; vale uma linha sobre dependências de rede em build e allowlist/caching no CI.

*Suggested convention update: add a § for "CSP on static/prerendered pages" and "placeholder UI in production". Want me to draft it?*

---

## Método e limitações

- Revisão estática do código-fonte + verificação dinâmica local (`next start` sobre o build existente, `curl`) — sem rebuild, sem `npm install`, sem alteração de código.
- `npm audit --omit=dev` e `npm audit` executados em 2026-09-23 UTC; advisories do Next consultados em github.com/vercel/next.js/security/advisories na mesma data.
- O checkout revisado não é um repositório git; afirmações sobre "o que está commitado" (lockfile, `.env`) devem ser confirmadas no repositório real.
- Não é um pentest (BUY em Production, fora de escopo deste papel).
