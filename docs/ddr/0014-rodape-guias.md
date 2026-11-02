# DDR-0014: Coluna "Guías" do rodapé acompanha o menu (texto e links)

- **Status:** Accepted (2026-11-02)
- **Date:** 2026-11-02
- **Deciders:** Matheus Melo (único aprovador). Decidiu em sessão, em 2026-11-02, trocar "Taxi, Uber o subte" por "Caminar por New York" no rodapé e ligar os itens da coluna "Guías" às páginas das guias.
- **Constitution / spec reference:** `docs/specs/guias/spec.md` AC 5 ("Taxi, Uber o subte" não aparece em nenhum lugar do site) e § Change Log; constitution v1 § Non-Goals 1 (mudança visual no que está no ar exige DDR); ADR-0006 (o rodapé faz parte da landing congelada). Complementa o DDR-0012 (§ 4 "O rodapé não muda", que não se edita por ser imutável) e o DDR-0013 (§ Neutral: o título da coluna continua sendo texto).

## Context
O DDR-0012 trocou "Taxi, Uber o subte" por "Caminar por New York" no menu e disse que o rodapé não mudava. Mas o rodapé repete os mesmos oito títulos de guia na coluna "Guías", como texto sem destino, e a AC 5 da spec exige que o texto antigo não apareça em nenhum lugar do site. Manter o rodapé como estava deixaria o texto antigo no ar e oito links mortos ao lado de páginas que agora existem. A revisão (RV-0035) apontou que a mudança já está no código sem um registro durável.

## Decision
1. **Texto.** No rodapé, "Taxi, Uber o subte" passa a ser "Caminar por New York", igual ao menu.
2. **Links.** Os oito itens da coluna "Guías" do rodapé deixam de ser placeholders (`#`) e levam à página da guia correspondente (`/guias/<slug>`). O mapeamento título → slug vem de `GUIDE_META`, a mesma fonte do menu.
3. **O que não muda:** o título da coluna "Guías" (continua sendo texto, ver DDR-0013), as outras colunas e seus placeholders, a ordem dos itens, o estilo, o layout, os créditos de fotografia e os outros textos do rodapé.
4. **Baselines:** mudam só as capturas que incluem o rodapé (as `full-*` da landing e das páginas com rodapé). Regeneram-se pelo caminho aprovado (`test:e2e:update`), como no DDR-0011, 0012 e 0013.

## User Impact
- **Visitor (ganha):** os itens do rodapé levam às guias; o texto é o mesmo do menu.
- **Visitor (perde):** nada.
- **Teclado e leitores de tela:** os oito itens passam a ser links reais, com destino e nome claros.

## Consequences
- **Positive:** a AC 5 vale em todo o site; menu e rodapé dizem o mesmo; nenhum link morto onde há página.
- **Negative:** o rodapé congelado muda (um texto e oito destinos) e os baselines que o incluem mudam.
- **Neutral:** os links das outras colunas continuam como placeholders (ADR-0006 X-4).

## Alternatives Considered
- **Deixar o rodapé como estava:** rejeitada; contradiz a AC 5 e deixa links mortos.
- **Trocar só o texto e manter os links como `#`:** rejeitada; os destinos existem.
- **Transformar o título da coluna em link para `/guias`:** fora do escopo (DDR-0013 § Neutral).

## References
- `docs/specs/guias/spec.md` AC 5, § Change Log; `docs/reviews/2026-11-02_guias_v1.md` RV-0035
- DDR-0012, DDR-0013, ADR-0006
- Código: `components/layout/footer.tsx`
