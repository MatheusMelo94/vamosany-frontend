# DDR-0012: Páginas de Guías (home + 12 guias), troca no menu, fotos e motion

- **Status:** Accepted (2026-11-01)
- **Date:** 2026-11-01
- **Deciders:** Matheus Melo (único aprovador). Aprovou em sessão, em 2026-11-01: o escopo (12 guias da Belén, palavra por palavra), a direção visual (protótipo "Guías", https://claude.ai/artifact/UcHUFFiweoJnuvBWu9vfMA), o texto da home de Guías, a troca "Taxi, Uber o subte" → "Caminar por New York" e, depois do protótipo, o uso de fotos já existentes em `public/img` com créditos.
- **Constitution / spec reference:** `docs/specs/guias/spec.md`; constitution v1 § Non-Goals 1 (mudança visual no que está no ar exige DDR) e § Experience Principles (motion: uma cena expressiva por tela, salvo DDR); ADR-0006 § 6 (o navbar e o estado dos menus abertos fazem parte do baseline congelado).

## Context
O menu "Guías" do navbar tem 12 itens sem página (links mortos, ADR-0006 X-4). A Belén escreveu o conteúdo final dos 12 guias (`docs/content/guias.md`). O usuário aprovou um protótipo com dois templates (home `/guias` e página de guia `/guias/<slug>`) e, depois dele, pediu fotos nos guias, usando as imagens que o site já tem.

Quatro pontos tocam regras que exigem DDR:
1. O item "Taxi, Uber o subte" sai do menu (decisão do usuário) e um bloco do menu congelado muda de texto.
2. O menu é uma superfície congelada (ADR-0006): colocar `href` nos 12 itens e trocar um item altera o baseline de screenshots.
3. Fotos novas em páginas novas pedem crédito visível (CC BY / CC BY-SA), e o rodapé é congelado.
4. Páginas novas seguem `design-conventions.md § Motion Principles` (um momento expressivo por tela) salvo DDR; o usuário quer a mesma abertura de título do resto do site.

## Decision
1. **Duas rotas, um modelo de conteúdo.** `/guias` (home) e `/guias/<slug>` para os 12 guias, com slugs em espanhol sem acento (`el-subte-explicado`, `desde-el-aeropuerto`, `caminar-por-new-york`, `como-moverte-por-new-york`, `west-village`, `murray-hill`, `financial-district`, `williamsburg`, `visa-a-estados-unidos`, `cuanto-cuesta-un-dia-en-new-york`, `que-llevar-segun-la-temporada`, `entradas-para-broadway`). O conteúdo vive em dados tipados no repositório, **sem CMS e sem reescrever o texto**; só mudam a estrutura (spec § Content Fidelity, D1–D7). A ordem do menu manda no "próximo guia".
2. **Menu.** Os 12 itens ganham `href`. "Taxi, Uber o subte" é substituído por **"Caminar por New York"** ("Cómo entender la ciudad y recorrerla a pie."). O subtítulo de "Cómo moverte por New York" passa a ser a *bajada* do guia ("Subte, Uber, bus o a pie: cuándo conviene cada uno."), para que menu, cartões, "Más de" e dek sejam uma só string. Nada mais muda no navbar nem no drawer. Os baselines que incluem o menu Guías são regenerados pelo caminho aprovado (`update-snapshots`), como no DDR-0011.
3. **Visual.** O sistema do DDR-0011, sem tokens novos: faixas alternadas branco/creme, cartões de 2 px preto e 20 px de raio, marcador amarelo no título, caixas "Mi pique" em creme, quadradinhos amarelos nas listas, faixa preta de CTA com botão amarelo em pílula, índice "En esta guía" fixo com o item ativo em amarelo (no celular vira um `<details>` no topo do texto).
4. **Fotos.** Uma foto de capa por guia (3:2, abaixo do dek) e a mesma foto como miniatura em cada cartão da home, só com imagens que já estão no repositório e que têm crédito: `how-subway`, `quote-street`, `trip-high-line`, `post-dumbo`, `trip-soho`, `trip-grand-central`, `band-bridges` (dois guias, recortes diferentes), `trip-chinatown`, `trip-central-park` e duas fotos próprias do anel (`ring/vamosany3`, `ring/vamosany6`). As imagens `hero-*` ficam de fora (sem licença registrada). O mapa guia → foto, o alt em espanhol e os focos estão na spec § Photos. **Crédito visível** logo abaixo da foto de capa, com os mesmos textos do rodapé ("Foto: assunto — autor, licença"); nas miniaturas da home vale a lista "Créditos de fotografía" do rodapé, que já inclui todas as fotos da Wikimedia usadas. Um teste exige que toda foto da Wikimedia usada tenha entrada em `CREDITS.json` e no rodapé. O rodapé não muda. O usuário trocará as fotos depois: o registro de fotos é o único lugar a editar.
5. **Motion.** Funcional, mais **um** momento expressivo que já existe: a abertura de título **M1** do DDR-0004 (eyebrow, palavras do H1, marcador, dek), estendida às duas páginas por esta decisão. **Nada mais** do DDR-0004 é estendido: sem reveals de scroll, sem parallax na foto, sem barra de leitura. O resto é CSS (hover de 2 px, transições de estado, scroll suave). Reduced motion e sem JS: tudo estático e visível. Se reaproveitar o M1 exigir mexer no comportamento ou no bundle do Sobre mí, a Arquitetura entrega o marcador estático; isso cabe nesta decisão.
6. **CTA.** "Quiero mi itinerario" (e "Quiero gestionar mi visa" no guia da visa) levam a `/#services`.

## User Impact
- **Visitor (ganha):** 12 respostas reais onde havia links mortos; um índice que mostra onde está na leitura; uma foto e o crédito em cada guia; um caminho direto do guia ao itinerário. Quem chega por busca ou rede social cai direto no guia e tem o breadcrumb para voltar.
- **Visitor (perde):** a abertura do título leva cerca de 1,4 s para assentar (só com motion ligado). O item "Taxi, Uber o subte" desaparece do menu.
- **Belén:** o texto dela vai ao ar como escreveu; qualquer correção é feita primeiro em `docs/content/guias.md`.

## Consequences
- **Positive:** o menu deixa de ter links mortos nos 12 itens; todo o site "Guías" é estático e rápido; o conteúdo é uma fonte única (menu, cartões, "Más de", metadados e pager saem do mesmo registro); trocar uma foto é editar uma entrada.
- **Negative:** um desvio documentado de `design-conventions.md § Motion Principles` (M1 em mais duas páginas); o menu congelado muda de texto e os baselines que o mostram mudam; alguns encaixes de foto são fracos (West Village mostra SoHo; Visa e Broadway usam fotos da marca que só sugerem o tema) até o usuário trocá-las; os parágrafos "Tip:", "Ojo:", "Importante:" continuam como parágrafos comuns.
- **Neutral:**
  - `/guias` não ganha entrada no navbar nesta entrega (o navbar é congelado); chega-se a ela por breadcrumb, pager e URL. Fica como pendência explícita da spec (A-1).
  - Sem i18n (os guias existem só em espanhol), sem sitemap/robots/JSON-LD (nenhum existe hoje) e sem analytics (não há no repositório).
  - Duas fotos próprias da marca ficam sem entrada em `CREDITS.json` (crédito "Foto: Vamos a NY"); a frase do rodapé "Todas las fotos vienen de Wikimedia Commons" já era inexata por causa do anel do hero e não é tocada aqui.

## Alternatives Considered
- **Só a página de guia, sem home:** rejeitada; o usuário aprovou a home e ela dá destino ao breadcrumb e ao pager.
- **Manter "Taxi, Uber o subte" e criar um 13º guia:** rejeitada pelo usuário; o guia "Caminar por New York" substitui o item.
- **Reescrever ou encurtar os textos para a web:** rejeitada; o texto é da Belén palavra por palavra.
- **CMS ou arquivos Markdown carregados em runtime:** fora do escopo (não-objetivo); dados tipados bastam para 12 guias e permitem testar a fidelidade.
- **Reveals de scroll e parallax como nas páginas Sobre mí:** rejeitada; são páginas de consulta, o texto precisa estar visível assim que chega à tela.
- **Fotos `hero-*`:** rejeitada; não têm licença nem crédito registrados.
- **Foto de capa em 16:9 ou largura total:** rejeitada; as fontes têm 700–1100 px de largura e seriam ampliadas além do razoável.
- **Link para `/guias` dentro do navbar:** adiada por ser mudança no menu congelado além do que foi aprovado.

## References
- `docs/specs/guias/spec.md` (Ready for /plan) e `docs/content/guias.md`
- Protótipo: https://claude.ai/artifact/UcHUFFiweoJnuvBWu9vfMA
- DDR-0002 (menu com páginas reais), DDR-0003 (marcador do menu), DDR-0004 (motion; só M1 é estendido), DDR-0011 (sistema visual), ADR-0002, ADR-0003, ADR-0006
- `public/img/CREDITS.json`; créditos do rodapé em `components/layout/footer.tsx`
