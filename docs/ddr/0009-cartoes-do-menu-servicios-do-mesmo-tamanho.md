# DDR-0009: Cartões do menu Servicios do mesmo tamanho

- **Status:** Accepted (2026-10-31)
- **Date:** 2026-10-31
- **Deciders:** Matheus Melo (único aprovador). Pedido em sessão em 2026-10-31: "Every option has a different size. They all need to be on the same size."
- **Constitution / spec reference:** constitution v1 § Non-Goals 1 (mudança visual no que está no ar exige DDR); ADR-0006 § 6; DDR-0003 (marcador do mega-menu); DDR-0008 (menu Servicios com quatro itens).

## Context
Desde o DDR-0008, o painel Servicios do mega-menu (desktop, ≥ 1024 px) tem quatro cartões com preço. Cada cartão tinha a altura do próprio texto: o selo "El más completo", descrições de duas a quatro linhas e preços de uma ou duas linhas ("Reservá con USD 300") deixavam os cartões com alturas diferentes, e o "Ver detalles" mudava de lugar de um cartão para outro.

## Decision
Na linha do painel, os cartões com preço ocupam a altura toda da coluna: **todos têm a mesma altura e a mesma largura**. Preço e "Ver detalles" ficam na base do cartão (`mt-auto`); o preço numa linha própria e "Ver detalles" sempre abaixo, alinhado à direita, na mesma altura em todos os cartões. Grupos sem preço (Guías, Blog, Sobre mí) não mudam.

## User Impact
O painel Servicios lê como uma fileira de opções equivalentes, mais fácil de comparar. Os cartões ficam mais altos onde o texto é curto.

## Consequences
- **Positive:** cartões iguais em 1024, 1280 e 1440 px; o link "Ver detalles" fica num lugar previsível.
- **Negative:** espaço vazio no meio dos cartões com descrição curta.
- **Neutral:** os baselines `navbar-panel-services` (e `-hover`) são regenerados no CI; o marcador do DDR-0003 segue os cartões como antes.

## Alternatives Considered
- Encurtar os textos para caberem na mesma altura → rejeitada: muda o conteúdo do brief.
- Altura fixa em pixels → rejeitada: quebra com texto a 200% e entre larguras.

## References
- DDR-0003, DDR-0008
- `components/layout/navbar.tsx`, `tests/e2e/navbar.spec.ts`
