# DDR-0013: Link "Todas las guías →" no rodapé do menu Guías (desktop e drawer)

- **Status:** Accepted (2026-11-02)
- **Date:** 2026-11-02
- **Deciders:** Matheus Melo (único aprovador). Aprovou em sessão, em 2026-11-02, a recomendação do plano (`docs/specs/guias/plan.md` § 16, item 1), resolvendo a suposição A-1 da spec.
- **Constitution / spec reference:** `docs/specs/guias/spec.md` A-1 (sem entrada para `/guias` no navbar nesta entrega); DDR-0012 § Consequences › Neutral e § Alternatives Considered ("Link para `/guias` dentro do navbar: adiada"); constitution v1 § Non-Goals 1 (mudança visual no que está no ar exige DDR); ADR-0006 § 6 (o navbar e o estado dos menus abertos fazem parte do baseline congelado).

## Context
O DDR-0012 deu 12 links reais ao menu "Guías", mas deixou `/guias` sem porta de entrada: só se chega à home das guias por breadcrumb, pager ou URL. O plano (§ 16) recomendou uma linha extra no pé do menu, e o usuário aceitou. O navbar é uma superfície congelada, então a adição precisa de DDR.

## Decision
1. **Uma linha extra "Todas las guías →"**, não numerada, no pé do menu Guías, que leva a `/guias`:
   - **Desktop (≥1024):** no pé do painel do mega-menu, abaixo das três colunas, separada por um fio `hairline`, alinhada ao texto da primeira coluna.
   - **Drawer (<1024):** última linha do corpo do grupo "Guías", com o mesmo estilo das linhas existentes (alvo de 44 px, quebra de linha a 200% de texto, foco com o anel de tinta do drawer).
2. **O que não muda:** a estrutura de três colunas × quatro itens, a ordem dos grupos, o trigger "Guías" (continua sendo um botão de menu, não um link), o abrir/fechar, o marcador móvel (a linha **não** é um `[data-nav-item]`: o marcador não a segue), o comportamento de página atual do DDR-0003 para os 12 itens.
3. **Página atual:** em `/guias` a linha leva `aria-current="page"`; no drawer isso também abre o grupo "Guías" por si só e mostra o ponto estático na linha e no cabeçalho, como acontece com qualquer item do menu. No desktop não há marcador sobre ela.
4. **Texto:** "Todas las guías" com a seta "→" decorativa (`aria-hidden`), o mesmo texto do pager ("Todas las guías").
5. **Um só lugar:** `GUIAS_NAV` continua montado em um só arquivo; o modelo ganha um campo opcional `footerLink` que os dois menus leem.
6. **Baselines:** mudam `navbar-panel-guides-*` (pé do painel) e, se a captura incluir o grupo aberto, as do drawer. Regeneram-se só pelo caminho aprovado (`update-snapshots`), como no DDR-0011/0012.

## User Impact
- **Visitor (ganha):** uma porta de entrada para as 12 guias a partir de qualquer página, sem depender de já estar dentro de uma guia.
- **Visitor (perde):** nada; o painel ganha uma linha de ~48 px de altura.
- **Teclado e leitores de tela:** a linha é o último link do painel (ordem do DOM = ordem do Tab) e tem nome claro; a seta é decorativa.

## Consequences
- **Positive:** `/guias` deixa de ser órfã; o código já estava preparado (plano § 16): a mudança é pequena e localizada.
- **Negative:** o menu congelado muda de novo (altura do painel Guías) e os baselines do painel/drawer mudam.
- **Neutral:**
  - O trigger "Guías" não vira link (quebraria a semântica de teclado e toque de um botão de menu).
  - O título de coluna do rodapé do site ("Guías") continua sendo texto; um link ali precisaria de outra decisão.
  - `sitemap.xml` continua fora do escopo (spec A-10).

## Alternatives Considered
- **Transformar o trigger "Guías" em link para `/guias`:** rejeitada; é um botão de menu no desktop e um disclosure no drawer.
- **Link no título de coluna do rodapé:** adiada; o rodapé é congelado e pediria o mesmo DDR sem resolver o menu.
- **Deixar `/guias` sem entrada (A-1 como estava):** rejeitada pelo usuário.

## References
- `docs/specs/guias/spec.md` A-1; `docs/specs/guias/plan.md` § 16
- DDR-0012, DDR-0003, DDR-0002, DDR-0011, ADR-0006
