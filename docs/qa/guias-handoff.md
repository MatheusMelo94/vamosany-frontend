# QA handoff: Guías (home + 12 guides)

- **Branch:** `feat/guias` · **Spec:** `docs/specs/guias/spec.md` · **Plan/tasks:** `docs/specs/guias/{plan,tasks}.md` · **DDRs:** 0012, 0013
- **Commands:** `npm run build && npm run test:e2e -- --grep @feature-guias` (use `--workers=2` on a loaded machine; the known flakes are load-related). Unit: `npm test`.

## Scope
- **Routes (13 + 404):** `/guias`, the 12 `/guias/<slug>`, `/guias/<unknown>` (root 404, noindex).
- **Menu:** Guías mega-menu and drawer group (12 linked items, "Caminar por New York" swap, "Todas las guías →" row), footer Guías column.
- **States:** success; 404 + noindex; photo failure (3:2 box and credit stay); no JS; reduced motion; 200% text and 640px zoom; 320px; viewport height < 720 (aside not sticky); hash on load (valid and unknown).
- **Viewports:** 320 (extra), 360, 768, 1280.

## Spec AC coverage (what is automated, what stays manual)
| AC | Automated in | Manual |
|---|---|---|
| 1, 33 | routes.spec, not-found.spec, metadata.test | none |
| 2, 3 | meta/queries tests, routes.spec | none |
| 4-8 | nav tests, navbar.test, menu.spec | marker feel (DDR-0003) |
| 9-12 | guias-home-page.test, home.spec, responsive.spec | hover feel |
| 13-21 | guide-page/blocks/pager tests, routes.spec, toc.spec | read a long guide end to end |
| 22-26 | active-section, guide-toc tests, toc.spec | |
| 27, 28 | guides-fidelity (all 12) | Belén reads her text once |
| 29, 30 | photos.test (CREDITS.json + rendered footer) | visual fit of the weak photos (West Village, Visa, Broadway) |
| 31, 32 | guide-hero/card tests, build sizes | simulate a failing photo; Lighthouse CLS/LCP |
| 34, 35, 37 | motion.spec, sobre-mi/motion.spec | motion feel |
| 36 | routes.spec (raw HTML), responsive.spec (no JS) | |
| 38-43 | a11y.spec (axe, landmarks, tap targets), toc.spec keyboard | keyboard pass; contrast of the black band and the active index item; screen-reader read of the key-facts box and the two navs |

## Decisions and open items
- **Q1 footer:** answered (a): "Taxi, Uber o subte" -> "Caminar por New York" in the footer, and its Guías entries now link to the guides. AC 5 holds site-wide.
- **A-1:** resolved by DDR-0013 ("Todas las guías →" row).
- **Q2, Q3:** structural container widths accepted; slug `visa-a-estados-unidos` confirmed.
- **Segment 404:** Next 15.5 renders the root 404 for `dynamicParams = false` misses, so there is no "Ver todas las guías" button (the spec accepts this).
- **Known issues outside this feature (not fixed):** (1) with motion on, a direct load of `/#services` often ends short of the section (landing ScrollTrigger layout; client navigation from the guides is fine); (2) at 200% text-only on a 1280 window the desktop navbar row overflows horizontally on every page; (3) `check:first-load:selftest` expects a string that no longer exists in `nav-config.ts` (it was already stale on main; not in CI).
- **Interpretation:** at text-only 200% the plan's rem container widths collapse a 1280 window to one column (two columns persist from ~1922px).

## Performance expectations
First Load JS (gzip, guard method): `/` 178,738 B (+246 B vs baseline, allowance 1,000), `/guias` 128,221 B, `/guias/[slug]` 128,599 B; budget 180,000 B; GSAP is not in the Guías First Load. LCP on a guide is the hero photo (priority); photo boxes are reserved 3:2, so image CLS is 0.

## Baselines (CI only)
Do not regenerate locally. After pushing, add the `update-snapshots` label to the PR and review the committed images. Expected diff: new `guias-home-*` and `guia-subte-*`; `navbar-panel-guides-*` (item 3/4, the new row); drawer captures that include the Guías group; the landing's `full-reduced-motion-*` (footer text). Anything else is a bug.
