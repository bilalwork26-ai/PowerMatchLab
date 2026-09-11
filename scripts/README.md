# Scripts

## `submit-indexnow.mjs` — notify search engines of changed URLs

Run this **after a production deploy**, not as part of the build (Hostinger
deploys automatically from `main`; this is a separate, manual step you run
once the new deploy is actually live):

```bash
# See what would be submitted, without actually submitting anything:
node scripts/submit-indexnow.mjs --dry-run

# Real submission, against the production site:
node scripts/submit-indexnow.mjs

# Point at a different host (e.g. to test against a staging deploy):
node scripts/submit-indexnow.mjs --site-url https://staging.example.com --dry-run
```

What it does:

1. Fetches the live `/sitemap.xml`.
2. Compares every URL's `lastmod` against `indexnow-manifest.json` (committed
   at the repo root — the record of what was submitted last time).
3. Submits **only** URLs that are new, changed, or no longer in the sitemap
   (removed URLs are submitted too, so search engines know to drop them) —
   never the whole sitemap on every run.
4. Appends one line per submitted URL to `indexnow-log.ndjson`: date, URL,
   HTTP status.
5. Updates `indexnow-manifest.json` — but only after a successful (2xx)
   submission, so a failed run gets retried next time instead of silently
   marking URLs as "already submitted."

**An HTTP 200/202 from IndexNow means the request was accepted for
processing — it is not proof any search engine has crawled or indexed the
URL.** Check Bing Webmaster Tools (and Google Search Console, separately —
IndexNow itself doesn't cover Google) days later for actual status.

Requires outbound HTTPS access to `api.indexnow.org` and to the site's own
domain — it will not run inside a network-sandboxed environment with no
outbound access (it fails loudly with a clear message in that case, rather
than pretending to succeed).
