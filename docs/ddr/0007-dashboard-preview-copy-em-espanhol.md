# DDR-0007: Copy do preview do dashboard em espanhol

- **Status:** Accepted (2026-10-11)
- **Date:** 2026-10-11
- **Deciders:** Matheus Melo (único aprovador). A decisão foi tomada em sessão em 2026-10-11: o usuário entregou o texto do painel em espanhol e escolheu, para os pontos em aberto, (1) manter `vamosany.com/cuenta` na barra do navegador, (2) manter a 4ª parada do plano do dia traduzida, para fechar com "4 paradas", e (3) traduzir e manter as partes do painel que não estavam no texto entregue. Em seguida pediu este DDR e a atualização do baseline.
- **Constitution / spec reference:** constitution v1 § Non-Goals 1 (mudança visual no que está no ar exige DDR), § Experience Principles (es > pt > en); ADR-0006 § 5 (copy/placeholders) e § 6 (supersessão para o escopo alterado); DDR-0001 (mesmo movimento, no hero).

## Context
A seção `#dashboard` da landing mostra um preview fictício do painel do viajante. O cabeçalho
da seção e todo o painel estavam com a copy placeholder do lançamento em inglês ("Plan it
once. Carry it everywhere.", "Good morning, Marta.", "Days to go", "Route map"…). O público
é hispanofalante e o ADR-0006 deixou a copy como dívida a revisitar. O hero já foi para o
espanhol pelo DDR-0001; o preview do dashboard é a próxima seção mais lida e ainda contradiz
o idioma do hero.

## Decision
A seção `#dashboard` (e só ela) sai do congelamento do ADR-0006 para a copy, conforme § 6.
Layout, tipografia, cores, ícones, `MapSketch`, motion (`data-reveal`) e tokens continuam
como estavam.

**Cabeçalho da seção**
- **Eyebrow:** "Tu viaje, en un solo lugar"
- **Título:** "Tu próximo viaje a New York empieza acá"
- **Descrição:** "Armá tu viaje conmigo o sumate a la newsletter para recibir piques, lugares que vale la pena conocer y ser la primera en enterarte de los próximos viajes acompañados y lanzamientos."
- **CTAs:** "Armá tu viaje" (`#services`) e "Ver viajes acompañados" (`#how`); destinos inalterados.

**Painel (texto entregue pelo usuário)**
- **Barra do navegador:** `vamosany.com/cuenta`
- **Menu lateral:** VIAJE: Resumen · Mis itinerarios · Plan por día · Mapa · Reservas (badge "2 pendientes") · Presupuesto; BELÉN: Preguntale a Belén; CUENTA: Configuración. Saem "Walk with Belén", "Receipts" e o badge "2" de Mis itinerarios.
- **Cabeçalho:** "Resumen" · "¡Buen día, Sofía!"; selo "Faltan 23 días para New York".
- **Tarjetas:** Días para el viaje 23 (Tu vuelo llega el 14 de octubre, 07:40.) · Días planificados 3 de 5 (Faltan el día 4 y el 5.) · Reservas confirmadas 4 de 6 (Te faltan 2.) · Presupuesto usado USD 1.240 (de USD 2.000 previstos.). A moeda passa de € para USD.
- **Plan del día:** Día 2 · Martes · "Brooklyn Bridge antes que la multitud" · 4 paradas · 6,1 km; 07:10 Cruce del puente, de Manhattan a Brooklyn (40 min); 08:15 Desayuno en Dumbo (45 min); 10:30 Brooklyn Heights Promenade (30 min); 13:00 Ferry de vuelta a Wall Street (25 min).
- **Mapa:** "Mapa del recorrido" · "Copia sin conexión guardada".

**Painel (traduzido por nós, fora do texto entregue)**
- A usuária fictícia passa de Marta para Sofía (avatar "S", `sofia@email.com`); cartão "Próximo viaje", "14 – 19 oct 2026".
- Nota do plano: "Mañana llueve: la versión bajo techo del día 3 ya está lista."
- "Mis itinerarios": "Íconos y barrios" (Descargado), "Comé de punta a punta" (Actualización disponible).
- "Reservar con tiempo" (Faltan 2): The Met — entrada con horario; Entradas rush de Broadway; Top of the Rock (se agota); Pase diario de NYC Ferry; estados "Reservado" / "Pendiente".
- `aria-label`s do painel, do menu e do mapa em espanhol.

Voseo rioplatense em todo o painel, como no hero ("Armá", "Preguntale", "Comé").

## User Impact
O visitante hispanofalante vê o painel na própria língua, coerente com o hero e com o
cabeçalho da seção. O menu lateral fica mais curto (8 itens em vez de 10). Leitores de tela
passam a anunciar os rótulos do painel em espanhol.

## Consequences
- **Positive:** a seção deixa de misturar inglês e espanhol; o preview passa a mostrar o produto que será vendido ao público de verdade.
- **Negative:** as strings continuam hardcoded no componente até o i18n (es/pt/en) chegar; as traduções que não vieram do usuário precisam de revisão dele.
- **Neutral:** o baseline de screenshots da landing é regenerado (`landing.spec.ts`: `full-reduced-motion` e os `scrolled-*` que enquadram a seção, nos três projetos); o restante do ADR-0006 continua valendo.

## Alternatives Considered
- Remover as partes do painel que não vieram no texto do usuário → rejeitada pelo usuário: o painel ficaria vazio na metade de baixo e mudaria o layout congelado.
- Deixar só as 3 paradas entregues com "4 paradas" → rejeitada: o contador não bateria com a lista.
- Esperar o i18n completo → rejeitada: mesma razão do DDR-0001, a seção pode entrar já.

## References
- ADR-0006 — congelamento do design e motion da landing
- DDR-0001 — copy do hero em espanhol
- `features/landing/components/dashboard-preview.tsx`
