# PowerMatchLab — Traffic Acquisition Campaign Baseline

**Dated:** 2026-09-11 (the day this campaign infrastructure was built and this document was written). This is a point-in-time snapshot, not a live dashboard — re-run the checks below weekly and log the real numbers into the table at the bottom.

## Confirmed baseline data (nothing below is estimated or invented)

### Search Console (first ~7 days live)
| Metric | Value |
|---|---|
| Impressions | ~165 |
| Clicks | ~5 |
| CTR | ~3% |
| Average position | 41.8 |

**Caveat, stated plainly:** a meaningful share of these 5 clicks were likely the site owner's own checks (visiting the live site to confirm it works, checking a specific page after a deploy). Five clicks is too small a sample to treat as validated external interest — treat this number as "the floor," not "the signal."

### Cloudflare Web Analytics (same period)
| Metric | Value |
|---|---|
| Visits | 139 |
| Page views | 260 |

**Caveat, stated explicitly per this round's instructions:** the geographic breakdown behind these totals shows Spain and Algeria as leading locations. Per the site owner's own confirmation, that traffic is substantially the owner and family, not acquired audience. **Do not report 139 visits / 260 page views as "external traffic" or "audience reached."** The honest reading is: the site is technically live, reachable, and instrumented — traffic volume from anyone outside that circle is not yet established.

The collection system itself should **not** be changed to exclude Spain/Algeria — a real future visitor from either country is entirely plausible and must still be counted. The exclusion happens only in how the *campaign* is analyzed each week (see the weekly table below), never in what Cloudflare or Search Console actually record.

### Amazon Associates
**Status: unknown.** No Amazon Associates report has been pulled or shared in this session. This document does not report a "0" here — that would be inventing a data point. The weekly table below has a row for it; leave it blank until someone with account access pulls the actual report, and fill in the real number then.

## The weekly campaign tracking table

Copy this table into a spreadsheet (or reuse this file) and fill in one row per week. Every column here maps to a metric named explicitly in this round's brief. Cells with no data source yet should stay blank — never a guessed or interpolated number.

| Week of | Organic impressions | Organic clicks | CTR | Avg. position | Pages with impressions | New queries seen | Visits (excl. ES/DZ) | Page views (excl. ES/DZ) | External referrers | Affiliate clicks (measured) | Amazon Associates clicks | Orders | Commission |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-09-05 (baseline) | ~165 | ~5 | ~3% | 41.8 | 4 confirmed (`/guides/how-long-to-charge-power-station-with-solar` ~12.6, `/compare` ~7, `/best-for-refrigerator-backup` ~38.5, `/guides/watts-vs-watt-hours` ~71) | — | not isolated yet | not isolated yet | — | not yet (GA4 not active) | unknown | unknown | unknown |

### Where each column comes from

- **Organic impressions / clicks / CTR / avg. position / pages with impressions / new queries** — Google Search Console → Performance report. Filter to "Web" search type. "Pages with impressions" = count of distinct URLs in the Pages tab with impressions > 0. "New queries seen" = queries in the Queries tab not present in the prior week's export (requires keeping the prior week's CSV export to diff against).
- **Visits / page views excluding ES/DZ** — Cloudflare Web Analytics → apply a country filter excluding Spain and Algeria in the dashboard view (a *view-time* filter, not a data-collection change), then read the totals for that filtered view. Cloudflare Web Analytics free tier's filtering options may be limited; if country-level filtering isn't available in the UI, note "not isolated yet" honestly rather than approximating.
- **External referrers** — Cloudflare Web Analytics → Referrers panel (or Search Console's "external links" report over time, once any exist). Until this campaign starts publishing content on communities/Pinterest/etc. per Block 5, expect this to be near-zero — that is the expected, honest state, not a failure.
- **Affiliate clicks (measured)** — once `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set, GA4 → Events → `affiliate_click`, broken out by the `placement` parameter this round's GA4 work added. Until then, this column has no data source and must stay blank.
- **Amazon Associates clicks / orders / commission** — Amazon Associates Central → Reports. This is the only source of truth for actual purchases; nothing on the site itself can report a real order or commission figure.

### Rules for filling this table in every week, going forward

1. Never carry a number forward from last week as if it were this week's — an unchanged real number (re-measured and still the same) is fine; a copy-pasted old number without re-checking is not.
2. A metric with no available data source this week gets left blank, not zero, not "N/A" implying it was checked.
3. When a number is a partial estimate (e.g., Search Console rounds small numbers), say so in a footnote rather than presenting it as exact.
4. This table exists to catch real movement, not to manufacture a success narrative — a flat or declining week is real data and should be recorded as such.
