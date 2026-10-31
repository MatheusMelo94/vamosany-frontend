# DDR-0008: Nova estrutura da landing e site inteiro em espanhol

- **Status:** Accepted (2026-10-31)
- **Date:** 2026-10-31
- **Deciders:** Matheus Melo (único aprovador). Decisão tomada em sessão em 2026-10-31, a partir do brief de conteúdo "ESTRUCTURA NUEVA WEB VAMOS A NY (2).md" (não versionado; fica com o time de conteúdo). O usuário pediu "la página en español como venimos haciendo", tudo num só PR, e que os botões fiquem **sem link** e sem fotos novas por enquanto ("I will do this later").
- **Constitution / spec reference:** constitution v1 § Non-Goals 1 (mudança visual no que está no ar exige DDR), § Experience Principles (es > pt > en); ADR-0006 § 5 (copy) e § 6 (supersessão para o escopo alterado); DDR-0001 e DDR-0007 (mesmo movimento, no hero e no preview do dashboard); DDR-0006 (menu "Índice", cujo conteúdo é traduzido aqui).

## Context
A landing ainda tinha a copy placeholder do lançamento em inglês na maior parte das seções, ofertas que não existem mais (itinerários prontos a partir de €25, "Walk with Belén" a €290) e números inventados (24.000 itinerários, 4,9 de 1.200 reviews). O brief de conteúdo define a nova oferta real (consultoria, itinerário personalizado, viagens em grupo), as resenhas reais de viajantes e quais seções saem. O público é hispanofalante.

O DDR-0007 colocou no cabeçalho do preview do dashboard o texto que o brief destina à seção final (CTA). Este DDR corrige isso.

## Decision
A landing sai do congelamento do ADR-0006 nas seções abaixo, conforme § 6. Tipografia, cores, tokens, componentes, motion e o layout de cada seção que fica continuam como estavam.

**Ordem nova:** Hero · Barrios (ticker) · Preview do dashboard · Servicios · Mis recomendados · Números · Reseñas · Blog · CTA.

1. **Preview do dashboard:** cabeçalho "Tu viaje en un solo lugar" / "Tu itinerario, siempre a mano." / "Cuando recibís tu itinerario, lo encontrás en tu cuenta…"; botões "Quiero mi itinerario" e "Ver cómo funciona". O painel não muda (DDR-0007).
2. **Servicios:** três cartões do brief: Consultoría de viaje (USD 150 por consultoría), Itinerario personalizado (Desde USD 160, selo "El más completo", destacado) e Viajes grupales (Reservá tu lugar con USD 300). Cabeçalho escrito por nós: "Servicios" / "Tres formas de viajar conmigo".
3. **Saem:** "This is what a day looks like" (`sample-day`), "Written on foot, twice a year" (`how-it-works`) e "Everything in the file" (`included`).
4. **"Planning takes one evening" é substituída por "Mis recomendados"** (`recommendations.tsx`): título com o destaque amarelo, abas Pases y atracciones · Broadway · Internet (WAI-ARIA: setas, Início/Fim, um só tab stop), cartões com código de desconto em quadro tracejado, nota de afiliados e o email de contato. Nomes, códigos e links ficam como placeholders entre colchetes até o time de conteúdo enviar.
5. **Números:** +200 viajeros ya confiaron en mí · +20 viajes a NYC · +1000 km caminados por la ciudad (três colunas; o contador formata em `es`).
6. **Reseñas:** as dez resenhas reais do brief (nome, serviço, mês e ano). Título "Lo que dicen mis viajeros".
7. **CTA:** "Tu próximo viaje a New York empieza acá", botões "Armá tu viaje" / "Ver viajes acompañados", formulário da newsletter ("tu@email.com", "Suscribirme", "Sin spam. Te das de baja cuando quieras."). O formulário continua sem serviço de envio.
8. **Resto do site em espanhol:** menu (desktop e drawer). O grupo **Itinerarios sai do menu** (produtos de exemplo que não existem; decisão do usuário). **Servicios** fica com quatro itens: os três cartões da home e **Visa de Estados Unidos** (Trámites, USD 70, serviço para uruguaios — página do brief, decisão do usuário), todos levando a `/#services` até as páginas de serviço existirem. Guías e Blog usam os textos do brief, rodapé, Blog, ticker, 404, página de erro, `lang="es"` no `<html>` e metadata.

**Botões sem destino:** os botões novos ou alterados renderizam como `<button type="button">`, sem `href`, por decisão do usuário; os links entram depois. Sem fotos novas.

**Risco aceito (RV-0025):** até os links chegarem, cerca de dez botões não fazem nada ao clicar ou ativar pelo teclado, e leitores de tela os anunciam como botões. Risco conhecido, levado ao usuário em 2026-10-31 junto com a alternativa de marcá-los "próximamente" (`aria-disabled`); os links são a próxima tarefa de conteúdo.

## User Impact
O visitante lê o site inteiro na sua língua e vê a oferta real, com preços em USD e resenhas de viajantes de verdade. A página fica mais curta (três seções a menos). Leitores de tela passam a anunciar a página como espanhol. Enquanto os links não chegam, os botões não levam a lugar nenhum, e "Mis recomendados" mostra textos provisórios.

## Consequences
- **Positive:** oferta, preços e prova social verdadeiros; um só idioma; abas de "Mis recomendados" acessíveis por teclado (as de `planning-timeline` não eram).
- **Negative:** botões sem destino e placeholders visíveis no ar até o conteúdo chegar; as resenhas mantêm as cinco estrelas do design, embora o brief não traga notas; strings seguem hardcoded até o i18n.
- **Neutral:** o baseline de screenshots da landing e do menu é regenerado (label `update-snapshots`); o restante do ADR-0006 continua valendo.

## Alternatives Considered
- Um PR por seção → rejeitada pelo usuário: quer revisar e mergear tudo junto.
- Apontar os botões para âncoras da página (`#services`) → rejeitada pelo usuário: os links são dele.
- Manter "Planning takes one evening" e adicionar "Mis recomendados" → rejeitada: o brief pede a troca.

## References
- ADR-0006, DDR-0001, DDR-0006, DDR-0007
- `app/(marketing)/page.tsx`, `features/landing/components/*`, `components/layout/*`
