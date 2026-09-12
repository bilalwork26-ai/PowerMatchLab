# Amazon pricing: technical readiness plan (not yet activated)

**Status: no price, availability, rating, or review data is displayed anywhere
on PowerMatchLab today, and none is stored in `products.json`.** This document
specifies exactly how that will be added once Amazon grants access to the
Product Advertising API (PA API) via the Creators API path, and exists so that
work can begin immediately when access is granted, without re-deriving the
design under time pressure.

## Why nothing is implemented yet

Amazon requires an approved Associates account and, for PA API access through
the Creators API, at least 10 qualified sales in the trailing 30 days.
PowerMatchLab does not currently meet that bar. Until it does:

- **No manual price entry.** A human-typed price goes stale immediately and
  cannot be verified — this is explicitly forbidden project-wide.
- **No scraping.** Scraping Amazon product pages violates Amazon's Conditions
  of Use, risks the Associates account entirely (the asset this whole site
  depends on), and produces data with no freshness or accuracy guarantee.
- **No mock/placeholder prices**, even behind a feature flag. A flag that is
  merely "off" is one bad deploy away from leaking a fabricated price into
  production, and it adds real complexity (a whole pricing UI, formatting,
  copy) for a feature that cannot be turned on yet. This document is the
  deliberate substitute for that inactive code.

## What activates it

Two independent gates must both be true before any price renders:

1. **Eligibility**: the Associates account meets Amazon's PA API access
   requirements (10+ qualified sales in the trailing 30 days) and the
   application for Creators API / PA API access is approved.
2. **Credentials configured**: `PA_API_ACCESS_KEY`, `PA_API_SECRET_KEY`, and
   `PA_API_PARTNER_TAG` are present as server-only environment variables in
   the production deployment (see "Secrets" below).

Until both are true, the code path described below simply does not run, and
the UI keeps showing the existing "Check price on Amazon" CTA with no
in-page price. No other functionality on the site depends on this.

## Architecture when activated

### 1. Server-side retrieval only

All PA API calls happen in a server context (a Next.js Route Handler or
Server Component data-fetch) — never from the browser. The PA API request
signing process (AWS Signature Version 4) requires the secret key, which
must never reach client-side JavaScript. A client component receives only
the already-resolved price data (or nothing, on failure) as props.

### 2. Association by ASIN, verified

Every price lookup is keyed by `amazon_asin` from `products.json`, and only
for products where `amazon_verification_status === "confirmed"` — the same
field that already gates whether a product is treated as a real, matched
catalog entry. A `pending` or unverified ASIN never triggers a price
request; there is nothing to associate a price to yet. The PA API response's
own returned ASIN and title are compared against the stored `amazon_asin`
and `model` before rendering anything, as a sanity check against a
transposed or stale ASIN in the catalog — a mismatch is logged and treated
as "no price available," never silently shown.

### 3. Caching strategy

- PA API's own terms cap how long returned data may be cached (historically
  24 hours for price/availability data — the exact current limit must be
  re-confirmed against the live PA API license terms at implementation
  time, since Amazon has changed this before).
- Implementation: a server-side cache (e.g. Next.js `fetch` cache with
  `revalidate`, or a small KV/Redis layer if request volume warrants it)
  keyed by ASIN, with a TTL at or below the permitted maximum — never
  longer, even under load.
- On a cache miss, fetch fresh; on a cache hit within TTL, serve cached;
  never serve data past the permitted TTL even if the live API call fails
  (see Failure handling below — an expired cache entry is treated as no
  data, not stale data).

### 4. Automatic refresh, no manual step

Cache expiry alone drives refresh — there is no "someone updates prices"
manual workflow, which is exactly the kind of manual/stale process this
project avoids elsewhere (see the `last_verified` spec-refresh discipline
already used for `products.json`). A scheduled revalidation (e.g. a low-
frequency cron hitting a revalidation endpoint) is optional as a warm-cache
optimization, but correctness never depends on it — cold-cache requests
always re-fetch within the TTL window.

### 5. Required disclosures alongside any displayed price

Per Amazon's Associates Program display requirements:

- **Timestamp**: the exact time the price was last fetched, shown next to
  the price ("as of [date/time]"), sourced from the cache entry's fetch
  time — never the page-render time, which is not when the price was
  actually retrieved.
- **Variability notice**: a standing, visible note that price and
  availability are subject to change, adjacent to any price shown — a
  strengthened version of the affiliate-disclosure language already on
  every page carrying an Amazon link.
- **No price claims elsewhere**: no guide, comparison, or calculator result
  may state or imply a price outside this one gated display path — this is
  the same discipline that already keeps price entirely out of
  `products.json` and every ranking/scoring function (`recommend.ts`,
  `score.ts`, `size-fit.ts`).

### 6. Failure and expiry behavior

If the PA API call fails, times out, returns an error, returns a mismatched
ASIN, or the cached entry has expired with no successful refresh:

- **The price disappears automatically.** No fallback to a stale number,
  ever — the UI reverts to exactly today's state: a plain
  "Check current price on Amazon" link using the existing
  `resolveAmazonLink()` / `amazon_affiliate_url` logic, unchanged.
- This is a hard invariant, not a best-effort: the price-rendering
  component should be structured so "no verified fresh price" is the
  default state and a successful, non-expired fetch is what unlocks
  showing a number — not the other way around.

### 7. Secrets

- `PA_API_ACCESS_KEY`, `PA_API_SECRET_KEY`, `PA_API_PARTNER_TAG` (and any
  region/marketplace identifier PA API requires) are set only as
  server-side environment variables in the hosting platform's secret
  store — never committed to the repository, never placed in a `.env` file
  that gets bundled, and never referenced by any `"use client"` component
  or any code path that ships to the browser.
- No credential of any kind is added to this codebase as part of this
  readiness work. There is nothing to rotate or revoke because nothing
  exists yet.

### 8. What does NOT change

- `products.json` gains no price, availability, rating, or review field.
  Those remain entirely absent from the catalog's data model.
- `recommend.ts`, `score.ts`, and `size-fit.ts` never take price,
  popularity, rating, or availability as an input — the recommendation and
  sizing-fit engine's independence from anything-but-verified-specs is a
  standing project invariant, documented in those files, and pricing
  activation must not touch it.
- `amazon_product_url` remains forbidden as a CTA source; only
  `amazon_affiliate_url` may ever be a purchase link, and that rule is
  unaffected by whether a price is shown alongside it.

## Rough activation checklist (when eligibility is met)

1. Confirm current PA API terms (cache TTL limits, required disclosure
   wording, rate limits) directly against Amazon's live documentation —
   do not assume the figures cited above are still current; they were
   accurate at the time this document was written but Amazon has changed
   PA API terms before.
2. Provision `PA_API_ACCESS_KEY` / `PA_API_SECRET_KEY` / `PA_API_PARTNER_TAG`
   in the hosting platform's secret store.
3. Build the server-side fetch + cache layer described above, scoped to
   confirmed-status products only.
4. Build the price-display component with the mandatory timestamp and
   variability notice, defaulting to "no price" until a fresh, verified
   result is available.
5. Add tests mirroring the existing catalog-integrity discipline: no price
   ever renders without a fresh cache entry, no client bundle ever contains
   the secret keys, cache-expiry always falls back to the plain Amazon
   link, and ASIN mismatches never render a price.
6. Ship behind the two gates above (eligibility + credentials configured) —
   no separate feature flag is needed beyond credentials being unset acting
   as the off-switch.
