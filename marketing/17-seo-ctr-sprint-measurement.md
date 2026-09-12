# SEO CTR Sprint — Measurement Baseline & 14-Day Review (September 2026)

## Real baseline (Google Search Console, first real week of traffic)

Source: Search Console data provided directly by the site owner, report window
set to 3 months but real activity starting ~2026-09-03. Recorded here verbatim
as the starting point — nothing below is estimated or extrapolated beyond what
was actually reported.

| Metric | Value |
|---|---|
| Total impressions | 204 |
| Total clicks | 5 |
| CTR | ~2.45% |
| Distinct queries | 58 |
| Pages with impressions | 35 |
| Mobile: impressions / clicks / CTR / avg. position | 32 / 5 / 15.6% / 18.5 |
| Desktop: impressions / clicks / CTR / avg. position | 172 / 0 / 0% / 47.6 |

Daily: Sep 2 (0 impr) → Sep 3 (9 impr, 1 click, pos 24.4) → Sep 4 (25 impr, 0
clicks, pos 40.6) → Sep 5 (42 impr, 1 click, pos 40.8) → Sep 6 (26 impr, 1
click, pos 41.0) → Sep 7 (37 impr, 0 clicks, pos 41.3) → Sep 8 (26 impr, 2
clicks, pos 51.8) → Sep 9 (39 impr, 0 clicks, pos 48.7).

**Every one of the 5 confirmed clicks came from mobile.** Desktop had 172
impressions and zero clicks — the sprint treated this as a real signal to
investigate (see the final report's device-comparison section) but did not
assume a desktop bug without evidence; average desktop position (47.6) alone
plausibly explains the 0% CTR without any defect.

Top queries and top pages at baseline are recorded in full in this sprint's
final report (`marketing/18-seo-ctr-sprint-final-report.md`) rather than
duplicated here.

## What changed this sprint (summary — see final report for the full audit)

- `/products`: title rewritten (generic → specific, real catalog count)
- `/products/[id]`: meta description shortened sitewide (was up to 227 chars
  for some names, now ≤155 for every product)
- `/about-methodology`: added a forward CTA to Power Calculator and Compare
  (previously a dead end past the legal/trust links)
- `/tools/[slug]` and `/guides/[slug]`: fixed a real mobile horizontal-overflow
  bug (missing `min-w-0` on a CSS Grid item let a 720px-wide device table push
  the whole calculator card past the viewport on narrow screens)
- `LoadListCalculator` (refrigerator/RV/home-backup tools): fixed the same
  class of overflow on its preset-select control row

No page was merged, deleted, or redirected. No title/meta was changed on a
page where the review found the existing copy already intent-matched and the
sample too small to justify a change (see final report for the explicit
per-page audit table).

## 14-day review — what to check on ~2026-09-26

**Do not fill any cell below with 0 until it is checked against a real
dashboard. Use "pending / not accessible" for anything not yet checked.**

| Metric | Baseline (Sep 3-9) | Day-14 value | Source to check |
|---|---|---|---|
| Total impressions | 204 | pending | Search Console |
| Total clicks | 5 | pending | Search Console |
| Overall CTR | ~2.45% | pending | Search Console |
| Avg. position (mobile) | 18.5 | pending | Search Console → Devices |
| Avg. position (desktop) | 47.6 | pending | Search Console → Devices |
| `/products` impressions/clicks/CTR | 10 / 0 / 0% | pending | Search Console → Pages |
| `/products/[id]` pages: any new clicks | 0 across sampled pages | pending | Search Console → Pages |
| `/about-methodology` clicks to Power Calculator / Compare | not tracked (no analytics event added) | pending | Would require GA4 event or manual check — see note below |
| `/tools/refrigerator-runtime-calculator` impressions/clicks | not in top-35 page report at baseline | pending | Search Console → Pages |
| Query-level movement for the refrigerator/generator/backup-power cluster | positions 49-94 (see final report) | pending | Search Console → Queries |
| Calculator starts (`calculator_start` event) | not accessible from this session | pending | GA4 (only fires once a visitor accepts analytics consent) |
| Products opened (`view_product` event) | not accessible | pending | GA4 |
| Products added to comparator (`compare_add_product` event) | not accessible | pending | GA4 |
| Affiliate clicks (`affiliate_click` event) | not accessible | pending | GA4 |
| Amazon-confirmed purchases | 0 confirmed to date | pending — **only count what Amazon Associates itself reports** | Amazon Associates dashboard |

Note on `/about-methodology`'s new CTA: it uses plain `<Link>` elements, not
`TrackedLink`, so there is no dedicated GA4 event for clicks on it specifically
(consistent with how most of the site's internal links already work — only a
few specific CTAs use event tracking). Its effect, if any, would show up
indirectly as `/power-calculator` and `/compare` referrer/session data if GA4
is active, or simply as this page's own bounce/exit behavior over time.

## Explicit exclusions from any acquisition read

Per standing project convention: exclude the site owner's own visits (Spain)
and known family visits (Algeria) from any interpretation of this data as
real acquisition, without deleting that historical data — same rule as the
tools_launch_2026 campaign's baseline document.
