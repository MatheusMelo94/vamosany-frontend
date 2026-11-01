# DDR-0010: Menu Servicios sem preços, com quatro caixas idênticas

- **Status:** Accepted (2026-11-01)
- **Date:** 2026-11-01
- **Deciders:** Matheus Melo (único aprovador). Decidido em sessão em 2026-11-01, a partir de um protótipo aprovado ("Menú Servicios", artifact claude.ai, versão 3): "it is still awful… remove the price as well… the four boxes in the menu need to be the same size and style… Ver detalles aligned on the left… ok, go for it!". O usuário confirmou que o hover (ponto amarelo e destaque cinza, DDR-0003) continua.
- **Supersedes:** DDR-0009 (preço e "Ver detalles" na base do cartão). Altera o DDR-0006 (selo em uma linha do drawer) e o DDR-0008 § Decision 8 (preços e selo do menu Servicios).
- **Constitution / spec reference:** constitution v1 § Non-Goals 1; ADR-0006 § 6.

## Context
Mesmo com altura igual (DDR-0009), o painel Servicios continuava desigual: títulos de uma ou duas linhas, descrições de duas a quatro linhas, preços com prefixos diferentes ("Desde", "Reservá con") e um selo amarelo em só um cartão deixavam espaços vazios diferentes em cada caixa.

## Decision
O menu Servicios (desktop e drawer) mostra, em cada item, as mesmas peças e na mesma ordem:

| Rótulo | Título | Linha |
|---|---|---|
| Asesoramiento | Consultoría | 1 hora por videollamada. |
| A medida | Itinerario | Tu viaje, día a día. |
| En grupo | Viaje grupal | New York conmigo. |
| Trámites | Visa EE. UU. | El trámite, paso a paso. |

- **Sem preços e sem selo** no menu. Preços e "El más completo" ficam só nos cartões da landing (`#services`).
- **Desktop:** o grupo tem `cards: true` em `nav-config.ts`. Cada item é uma caixa com borda, do mesmo tamanho (preenche a coluna), com "Ver detalles" no canto inferior esquerdo, alinhado ao título. O hover do DDR-0003 (ponto amarelo e destaque cinza) não muda.
- **Drawer:** as linhas mostram só o título curto (o drawer nunca mostrou descrições).
- Os títulos curtos cabem numa linha em toda largura de desktop (1024 px em diante); "Visa EE. UU." usa espaço inseparável.

## User Impact
O painel lê como quatro opções equivalentes, sem buracos. Quem quer preço o encontra nos cartões da landing, um clique depois.

## Consequences
- **Positive:** quatro caixas idênticas (197×106 px a 1024, 253×106 px a 1280); menos texto no menu.
- **Negative:** o menu não mostra preços nem destaca o serviço mais completo; os títulos do menu diferem dos da landing (curtos vs completos).
- **Neutral:** o suporte a `price` e `tag` continua nos componentes (sem uso hoje). Baselines regenerados no CI: `navbar-panel-services` (e `-hover`), `drawer-*`.

## Alternatives Considered
- Títulos completos → rejeitada pelo usuário: quebram em duas linhas a 1024 px.
- Só "USD" e o número → primeira versão do protótipo, rejeitada pelo usuário: preferiu sem preço.
- "Ver detalles" à direita → rejeitada pelo usuário: alinhado à esquerda.

## References
- DDR-0003, DDR-0006, DDR-0008, DDR-0009
- `components/layout/nav-config.ts`, `components/layout/navbar.tsx`
