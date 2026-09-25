# DDR-0001: Copy do hero em espanhol, sem palavra sozinha na linha

- **Status:** Accepted
- **Date:** 2026-09-25
- **Deciders:** Matheus Melo
- **Constitution / spec reference:** ADR-0006 § 5 (copy/placeholders, X-4) e § 6 (supersessão para o escopo alterado)

## Context
O hero mantinha a copy placeholder do lançamento em inglês ("Seven days in New York,
planned to the block." / "If you can make it here…" / "Embark on this journey"). O público
é hispanofalante e o ADR-0006 deixou a copy como dívida a revisitar. A tipografia display
é caixa-alta e larga, então no celular o título quebra em várias linhas e uma palavra
sozinha numa linha quebra a leitura.

## Decision
O hero (e só o hero) sai do congelamento do ADR-0006, conforme § 6:
- **Título:** "Tu viaje a New York, resuelto antes de subirte al avión."
- **Subtítulo:** "Todo lo que aprendí en más de 20 visitas, para que la disfrutes a tu manera."
- **CTA:** "Armá tu viaje" (mesmo destino, `#services`)
- **Regra de quebra:** nenhuma linha do hero tem uma palavra sozinha, em nenhum viewport. O
  título é composto de frases `whitespace-nowrap` de duas ou mais palavras; o subtítulo usa
  `text-balance` e mantém "a tu manera." junto.

Tipografia, cores, marker sweep, motion e o ring continuam como estavam.

## User Impact
O visitante hispanofalante lê a promessa na própria língua, na primeira pessoa de quem já
fez a viagem. No celular o título passa de 4 para 5 linhas (duas ou três palavras cada);
no desktop, de 2 para 3.

## Consequences
- **Positive:** copy alinhada ao público; leitura no celular sem palavra órfã.
- **Negative:** o resto da página segue em inglês até o i18n (es/pt/en) chegar; o hero
  empurra a dobra ~70–90 px para baixo.
- **Neutral:** o baseline de screenshots é regenerado para o hero; o restante do ADR-0006
  continua valendo.

## Alternatives Considered
- `&nbsp;` entre as palavras → rejeitada: o SplitText (`reduceWhiteSpace`) converte em
  espaço comum e a regra deixa de funcionar.
- Juntar só as duas últimas palavras → rejeitada: em 320 px uma palavra do meio ainda
  ficava sozinha.
- Esperar o i18n completo → rejeitada: o hero é a copy mais lida e pode entrar já.

## References
- ADR-0006 — congelamento do design e motion da landing
- `features/landing/components/hero.tsx`
