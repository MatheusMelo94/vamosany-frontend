# DDR-0011: Aplicar o "Design system · Vamos a New York" sem tocar estrutura nem efeitos

- **Status:** Proposed (2026-11-01). Aguarda aprovação do usuário no preview da Vercel antes do PR.
- **Date:** 2026-11-01
- **Deciders:** Matheus Melo (único aprovador). Pedido em sessão: "I want to apply this design system but without touching my effects, scroll effect… do not touch my carousel in the hero section… send me a tmp link to check before opening a pull request". Base: `Design system · Vamos a New York.md` (Belén, 2026-10-31) e o protótipo aprovado "Home con el nuevo sistema" (https://claude.ai/artifact/RgDFqDK3DAxSkA6isDiUx9, versão 3).
- **Supersedes (parcialmente):** a direção visual de `docs/design/vamosany-design-system.md` (cores, tipografia, raios). Os nomes de tokens e utilities continuam.
- **Constitution / spec reference:** constitution v1 § Non-Goals 1; ADR-0006 § 6.

## Context
Belén escreveu um sistema visual novo para a marca: um documento de viagem datilografado. Franjas preto, branco e creme; títulos em Courier Prime; o amarelo #FFDD12 como único acento forte; botões em pílula. O usuário quer aplicá-lo à landing sem mudar o menu, a estrutura das seções, o conteúdo, as fotos ou os efeitos: o carrossel 3D do hero, os reveals, o empilhamento do overscroll, o marcador amarelo dos títulos, o marquee de bairros e o pan da banda final.

## Decision
**Só os valores mudam; os nomes dos tokens e o markup ficam.**

1. **Cores** (`app/globals.css` `@theme`):
   - ink `#010000`
   - brand `#FFDD12`
   - superfícies creme `#F4F2EA`
   - linha `#E3E0D3`
   - texto secundário gris cálido `#5D5B52`
   - `--color-ink-tertiary` passa a `#6E6B61` (4,8:1, fecha QA-0011)
   - novos tokens de apoio sobre preto: `ink-soft`, `ink-panel`, `ink-line`, `on-ink-2`, `on-ink-3`.
2. **Escopo escuro `.theme-ink`:** redefine os mesmos tokens com os valores "apoyo sobre negro". Usado na faixa de números, no cartão destacado de Servicios e na janela do painel de conta (maqueta escura). Texto sobre amarelo continua preto.
3. **Tipografia:**
   - títulos `display-*`, `headline` e `card-title` em Courier Prime 700 sem caixa alta (H1 2,4–4,6 rem, H2 1,9–3 rem, H3 1,2–1,5 rem);
   - `label-button` em Montserrat 700, 0,95 rem;
   - `eyebrow` em Courier minúsculo, 0,85 rem, 0,14 em, com a rayita amarela de 22×2 px;
   - títulos do blog em Montserrat 700.
4. **Raios:**
   - `--radius-md` vira pílula (só o `Button` usa);
   - cartões 20 px (`--radius-lg`);
   - mídia 16 px;
   - tags 6–8 px.
5. **Componentes:**
   - `Button` em pílula com borda de 2 px, que sobe 2 px em 0,15 s;
   - foco do teclado com contorno amarelo de 3 px a 3 px, mais halo preto;
   - Servicios: os três cartões com borda preta de 2 px; o destacado é preto, com o selo "El más completo" sobre a borda, e as listas usam cuadraditos amarelos;
   - pestañas de Recomendados em pílulas com borda, a ativa preenchida de preto;
   - setas redondas nas reseñas;
   - imagens do blog com borda preta de 2 px;
   - campo de email em pílula.
6. **Franjas:**
   - hero branco (o marcador amarelo dos títulos exige fundo claro);
   - bairros com fundo amarelo e corações;
   - painel creme, Servicios branco, Recomendados creme;
   - números pretos, reseñas brancas, blog creme;
   - banda final com a foto, footer preto.

**Efeitos intocados:** carrossel do hero (CSS e componente), reveals, contadores, SplitText, marcador amarelo, marquee e pan da banda. O empilhamento do overscroll ganhou uma única mudança: só pinta de `canvas` as seções sem fundo próprio. Assim cada franja mantém a sua cor; o comportamento do pin não muda.

## User Impact
A landing passa a ter a identidade que Belén definiu, com a mesma estrutura, o mesmo conteúdo e os mesmos efeitos. Os rótulos pequenos (eyebrows) ficam legíveis: 4,8:1, contra 2,3:1 antes.

## Consequences
- **Positive:** a identidade fica alinhada à marca, e os componentes não precisam de classes novas. QA-0011 é resolvido pela mudança do token.
- **Negative:** o hero não fica preto como na portada do sistema, porque o marcador amarelo exige fundo claro. As páginas Sobre mí herdam as novas cores e fontes sem revisão própria (`display-pull` segue em caixa alta). Todos os baselines de screenshots mudam.
- **Neutral:**
  - o menu flutuante não muda de estrutura;
  - conflitos de conteúdo com as regras do sistema ("Vamos a NY", "viajes a NYC", "Taxi, Uber o subte") ficam para Belén decidir;
  - os baselines são regenerados no CI (label `update-snapshots`).

## Alternatives Considered
- **Hero preto com "New York" em amarelo** (como no protótipo v1): rejeitada porque remove o marcador dos títulos, que é um efeito.
- **Cabeçalho preto de largura total** (como na portada do sistema): rejeitada pelo usuário ("you changed the menu").
- **Reescrever as classes em cada componente:** rejeitada; trocar os valores dos tokens dá o mesmo resultado com menos risco.

## References
- `Design system · Vamos a New York.md`; protótipo https://claude.ai/artifact/RgDFqDK3DAxSkA6isDiUx9
- ADR-0004 (vocabulário de tokens), ADR-0006, DDR-0001, DDR-0008, DDR-0010
