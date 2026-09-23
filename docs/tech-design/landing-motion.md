# Tech Design: motion da landing (T-18b)

- **Status:** Accepted (2026-09-23, Matheus Melo) — descreve o que existe; qualquer mudanca de comportamento exige DDR (ADR-0006)
- **ADRs:** 0002 (gate `.gsap`), 0003 (controladores headless), 0006 (design e motion congelados)
- **Codigo:** `lib/gsap.ts`, `lib/gsap-text.ts`, `lib/motion.ts`, `features/landing/motion/*`, `features/landing/components/hero-ring.tsx`

## Arquitetura

```
app/layout.tsx        inline script: html.gsap  <=  JS disponivel && !prefers-reduced-motion
app/globals.css       .gsap [data-reveal] { opacity: 0 }  (estado inicial so quando vai animar)
(marketing)/page.tsx  <MotionControllers/>  -> next/dynamic ssr:false -> ScrollEffects + Overscroll
sections (RSC)        so escrevem atributos do contrato (features/landing/motion/attributes.ts)
HeroRing (client)     unico componente com motion propria (anel 3D)
```

- **Gate** (`motionEnabled()`): sem `.gsap` nenhum controlador faz nada e os alvos ficam visiveis. E o branch de reduced-motion obrigatorio das conventions, resolvido antes do primeiro paint.
- **Contrato de atributos**: `MOTION_ATTR` e o unico acoplamento entre secoes e controladores. Secao nova opta por um efeito colocando o atributo; controlador nunca conhece a secao.
- **Valores**: todos em `lib/motion.ts` (`MOTION`, `EASE`). Nenhum numero de duracao/stagger/distancia vive nos modulos.
- **Registro**: `lib/gsap.ts` (core, ScrollTrigger, useGSAP) e `lib/gsap-text.ts` (SplitText, CustomEase). O segundo so entra no chunk dinamico do ScrollEffects.

## Timelines e triggers

| # | Efeito | Alvo | Trigger | Valores (`MOTION.*`) |
|---|---|---|---|---|
| 1 | Reveal fade + rise, once | `[data-reveal]` | top 88% | `reveal` |
| 2 | Stagger dos filhos, once | `[data-reveal-group]` | top 85% | `revealGroup` |
| 4 | Contador numerico, once | `[data-count]` | top 88% | `count` |
| 5 | Marquee com boost pela velocidade de scroll | `[data-marquee]` | enquanto visivel | `marquee` |
| 6 | Navbar ganha superficie | `[data-nav]` | top -80 | `nav` |
| 7 | Marker sweep (`--train`) fora de hero/heading | `[data-sweep]` | top 85% | `sweep` |
| 9 | Faixa da ponte pan horizontal, scrub | `[data-pan-band]` | secao inteira | `panBand` |
| 10 | Hero: linhas sobem (SplitText mask), sweep, quote, actions | `[data-hero-copy]` | load | `hero` |
| 11 | Headings: eyebrow, linhas, sweep, lede, actions | `[data-heading-block]` | top 85% | `heading` |
| — | Overscroll: pin + hold + scale/fade, scrub | `main > section` (exceto a ultima) | bottom bottom | `overscroll` |
| — | Anel: spin infinito, hover, pausa fora da tela, nudge por velocidade | `[data-ring]` | sempre | `ring` |

Numeracao segue os comentarios originais do modulo (3 e 8 foram removidos antes desta auditoria).

## Reduced motion

- `.gsap` ausente: ScrollEffects e Overscroll retornam antes de criar qualquer tween; `[data-reveal]` fica em `opacity: 1` (CSS so esconde sob `.gsap`).
- HeroRing: sem tween e sem handlers; o hemisferio traseiro e ocultado uma vez via `--vis`.
- Teste: `tests/e2e/landing.spec.ts` › "reduced motion" (html sem `.gsap`, zero alvos ocultos, baseline full page).

## Riscos e oraculo

- **CLS**: reveals movem `y` apenas em elementos ja com opacidade 0; overscroll usa `pinSpacing: false` com `marginBottom` compensando o overflow. Medir em T-19b/Lighthouse.
- **Fontes**: `ScrollTrigger.refresh()` em `fonts.ready`; overscroll so faz setup depois de `fonts.ready` + um frame.
- **Chunk dinamico**: os alvos ja estao escondidos pelo gate, entao o atraso do chunk so posterga o inicio das timelines. Se ficar perceptivel, voltar ao import estatico e registrar a excecao de budget.
- **Oraculo**: baseline de screenshots no CI (idle, 25/50/75/100% de scroll, full page reduced-motion) e o teste local com `PW_LOCAL_BASELINE=1`. Loops (anel, marquee) sao mascarados.

## Decisoes desta fase

- **D-26, anel em `<picture>`**: mantido. `next/image` reamostraria as fotos pelo otimizador (quality 75) e mudaria pixels do design congelado; o ganho seria srcset automatico para 24 cards que ja sao lazy. Revisitar quando houver DDR de fotos.
- **T-16b / T-17b (spikes CSS)**: nao executados nesta fase. `@media (scripting)` teria de replicar o gate antes do primeiro paint em todos os browsers alvo; scroll-driven animations nao reproduzem o `arrive` ease nem o SplitText. Ficam como backlog opcional.
