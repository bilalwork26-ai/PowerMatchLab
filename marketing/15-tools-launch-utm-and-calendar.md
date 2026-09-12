# UTM Convention & 30-Day Distribution Calendar — tools_launch_2026

## UTM convention

Every campaign link in this round (`marketing/09` through `marketing/13`) already uses
this convention. Documenting it here as the single source of truth for anyone extending
the campaign:

| Parameter | Value(s) used | Notes |
|---|---|---|
| `utm_campaign` | `tools_launch_2026` | Fixed for this entire campaign — do not vary per channel |
| `utm_source` | `pinterest`, `facebook`, `linkedin`, `video` | `video` is a cross-platform placeholder for short-video scripts; swap for `youtube`/`tiktok`/`instagram` if a specific script is published to only one platform, so the weekly table (below) can break out performance per platform |
| `utm_medium` | `social` (Pinterest/Facebook/LinkedIn), `short_video` (video scripts) | Two mediums only — kept simple deliberately |
| `utm_content` | `pin_<topic>_<n>`, `post_<topic>_<n>`, `video_<topic>_<n>` | `<topic>` is `fridge`, `cpap`, or `starlink`; `<n>` is the two-digit item number from that asset's file |

No personal data and no free-text sensitive content appears in any UTM value — every value
is a short, fixed slug from a closed vocabulary matching this table, consistent with the
site's existing analytics-event approach (`tests/analytics-events.test.ts` already enforces
a closed vocabulary for on-site events; this UTM convention follows the same principle for
inbound traffic).

## What "not accessible" means for measurement right now

No Search Console, Cloudflare Web Analytics, or Amazon Associates Reports API/dashboard
access exists in this session. The weekly table below is a **template to fill in**, not
filled-in numbers — every cell should say `not accessible` (never `0`) until whoever holds
those dashboards fills it in by hand, except for rows the campaign itself can state for a
fact (e.g. "0 posts published" is a fact about this session's own actions, not an unknown
external metric).

### Weekly measurement table (template — fill in from real dashboards)

| Week | Channel | Publication/URL | Impressions | Clicks | Real sessions | Country | Tool used | Calculations completed | Products opened | Added to comparator | Affiliate clicks | Amazon-confirmed purchases | Confirmed revenue | Observations |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Pinterest | (fill in once pinned) | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | Exclude Spain (owner) and Algeria (family) traffic from this row — see baseline doc |
| 1 | Facebook | | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | |
| 1 | LinkedIn | | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | |
| 1 | Video | | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | |
| 1 | Community/forum | | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | |
| 1 | Editorial/backlink | | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | not accessible | |
| 2-4 | (repeat the same 6 rows per week) | | | | | | | | | | | | | |

Rule for whoever fills this in: a purchase only counts in the "Amazon-confirmed purchases"
/ "Confirmed revenue" columns once it actually appears in Amazon Associates reporting —
never estimate or infer a sale from clicks. Never overwrite an "not accessible" cell with
`0` — only overwrite it with a real number once the relevant dashboard is actually checked.

## 30-day executable calendar

Distributed to avoid publishing everything at once. "Owner/required connection" names the
concrete blocker for the tasks this session could not itself execute (no channel access).
"Metric to review" and "review date" tell the owner what to check and when, so the weekly
table above actually gets filled in on schedule rather than forgotten.

| Date (Day) | Channel | Asset | Landing page | UTM content | Action | Status | Owner / required connection | Metric to review | Review date |
|---|---|---|---|---|---|---|---|---|---|
| Day 1 | Technical | OG image gap fix | `/tools`, all 3 priority pages | n/a | Merge PR, verify live og:image tags | **Done this session** (PR #40, SHA `5df454a3c13a3313823a1063c90be969323a3aa4`) | n/a — completed | Social preview renders correctly when a pin/post is shared | Day 2 |
| Day 1 | Technical | IndexNow submission attempt | Sitemap | n/a | Run `node scripts/submit-indexnow.mjs` | **Attempted, blocked** — see final report | Needs an environment with real outbound HTTPS (this sandbox blocks `api.indexnow.org`) | Bing Webmaster Tools indexing status | Day 14 |
| Day 2 | Pinterest | Pins fridge-01 through fridge-04 | `/tools/refrigerator-runtime-calculator` | `pin_fridge_01..04` | Create "Power Outage Prep" board if it doesn't exist, upload 4 pins | Prepared, not published | Pinterest account access | Impressions, saves, clicks | Day 9 |
| Day 4 | Facebook | FB Post 1 (refrigerator) | `/tools/refrigerator-runtime-calculator` | `post_fridge_01` | Publish to Page | Prepared, not published | Facebook Page access | Reach, clicks, comments | Day 11 |
| Day 5 | Video | Video 1-2 (fridge) | `/tools/refrigerator-runtime-calculator` | `video_fridge_01`, `video_fridge_02` | Film/edit from script, publish | Prepared, not published | Video platform account | Views, link clicks | Day 12 |
| Day 6 | Pinterest | Pins fridge-05 through fridge-10 | `/tools/refrigerator-runtime-calculator` | `pin_fridge_05..10` | Upload remaining 6 fridge pins | Prepared, not published | Pinterest account access | Impressions, saves, clicks | Day 13 |
| Day 7 | Community | Rokslide + Forest River Forums replies | `/tools/cpap-battery-calculator` | n/a (organic, no UTM on forum replies unless the forum allows a tracked link) | Read the actual thread, verify posting rules, post if appropriate | Prepared, not posted | Human forum account + rules check | Referral traffic in analytics (if link included) | Day 14 |
| Day 8 | LinkedIn | LI Post 1 (fridge, engineering framing) | `/tools/refrigerator-runtime-calculator` | `post_fridge_03` | Publish | Prepared, not published | LinkedIn account/Page access | Reach, clicks, reactions | Day 15 |
| Day 9 | Pinterest | Pins cpap-01 through cpap-05 | `/tools/cpap-battery-calculator` | `pin_cpap_01..05` | Create "CPAP Travel & Backup Power" board, upload 5 pins | Prepared, not published | Pinterest account access | Impressions, saves, clicks | Day 16 |
| Day 10 | Facebook | FB Post 2 (CPAP) | `/tools/cpap-battery-calculator` | `post_cpap_01` | Publish | Prepared, not published | Facebook Page access | Reach, clicks, comments | Day 17 |
| Day 11 | Video | Video 5-6 (CPAP) | `/tools/cpap-battery-calculator` | `video_cpap_01`, `video_cpap_02` | Film/edit, publish | Prepared, not published | Video platform account | Views, link clicks | Day 18 |
| Day 12 | Pinterest | Pins cpap-06 through cpap-10 | `/tools/cpap-battery-calculator` | `pin_cpap_06..10` | Upload remaining 5 CPAP pins | Prepared, not published | Pinterest account access | Impressions, saves, clicks | Day 19 |
| Day 13 | Community | SolarPanelTalk + Camp-Inn Forum replies | `/tools/cpap-battery-calculator` | n/a | Verify rules, post if appropriate | Prepared, not posted | Human forum account + rules check | Referral traffic | Day 20 |
| Day 14 | Technical | Re-check IndexNow / Search Console | n/a | n/a | Retry submission from an unblocked environment; check indexing status | Scheduled follow-up | Real outbound HTTPS access + Search Console | Pages indexed | Day 14 (this row is the check itself) |
| Day 15 | LinkedIn | LI Post 2 (CPAP, remote-work framing) | `/tools/cpap-battery-calculator` | `post_cpap_03` | Publish | Prepared, not published | LinkedIn account/Page access | Reach, clicks | Day 22 |
| Day 16 | Community | CPAPtalk.com reply | `/tools/cpap-battery-calculator` | n/a | Carefully verify this community's rules first (health-adjacent context) before posting | Prepared, not posted | Human forum account + careful rules check | Referral traffic | Day 23 |
| Day 17 | Pinterest | Pins starlink-01 through starlink-05 | `/tools/starlink-runtime-calculator` | `pin_starlink_01..05` | Create "Starlink & Off-Grid Connectivity" board, upload 5 pins | Prepared, not published | Pinterest account access | Impressions, saves, clicks | Day 24 |
| Day 18 | Facebook | FB Post 3 (Starlink) | `/tools/starlink-runtime-calculator` | `post_starlink_01` | Publish | Prepared, not published | Facebook Page access | Reach, clicks | Day 25 |
| Day 19 | Video | Video 9-10 (Starlink) | `/tools/starlink-runtime-calculator` | `video_starlink_01`, `video_starlink_02` | Film/edit, publish | Prepared, not published | Video platform account | Views, link clicks | Day 26 |
| Day 20 | Pinterest | Pins starlink-06 through starlink-10 | `/tools/starlink-runtime-calculator` | `pin_starlink_06..10` | Upload remaining 5 Starlink pins | Prepared, not published | Pinterest account access | Impressions, saves, clicks | Day 27 |
| Day 21 | Community | Escape RV Owners Forum + tractorbynet.com replies | `/tools/starlink-runtime-calculator` | n/a | Verify rules, post if appropriate | Prepared, not posted | Human forum account + rules check | Referral traffic | Day 28 |
| Day 22 | LinkedIn | LI Post 3 (Starlink, remote work) | `/tools/starlink-runtime-calculator` | `post_starlink_03` | Publish | Prepared, not published | LinkedIn account/Page access | Reach, clicks | Day 29 |
| Day 23 | Video | Video 3-4, 7-8 (remaining fridge/CPAP) | Respective calculator pages | `video_fridge_03..04`, `video_cpap_03..04` | Film/edit, publish | Prepared, not published | Video platform account | Views, link clicks | Day 30 |
| Day 24 | Facebook | FB Post 4-6 (remaining) | Respective calculator pages | `post_fridge_02`, `post_cpap_02`, `post_starlink_02` | Publish, spaced 2-3 days apart, not all at once | Prepared, not published | Facebook Page access | Reach, clicks | Day 30 |
| Day 26 | Editorial | Outreach emails to qualified list | Relevant calculator/guide/dataset per contact | n/a | Send personalized pitches (see editorial outreach doc) | Prepared, not sent | Human email account (never send from an unverified/invented address) | Replies, real backlinks placed | Day 33 (past this 30-day window — outreach replies take longer) |
| Day 27 | LinkedIn | LI Post 4-6 (remaining) | Respective calculator pages | `post_fridge_04`, `post_cpap_04`, `post_starlink_04` | Publish, spaced out | Prepared, not published | LinkedIn account/Page access | Reach, clicks | Day 33 |
| Day 29 | Video | Video 11-12 (remaining Starlink) | `/tools/starlink-runtime-calculator` | `video_starlink_03`, `video_starlink_04` | Film/edit, publish | Prepared, not published | Video platform account | Views, link clicks | Day 34 |
| Day 30 | Measurement | Fill in the weekly table for weeks 1-4 | n/a | n/a | Pull real numbers from Search Console/Cloudflare/Pinterest/Meta/Amazon Associates wherever access exists | Template ready, not filled in | Access to each platform's own dashboard | Full-funnel view | Day 30 (this is the review) |

Recommended follow-up reviews beyond day 30: a **7-day check** (by Day 7) on whether any
channel access has been granted and the first Pinterest/Facebook/LinkedIn posts actually
went live, and a **30-day check** (this calendar's Day 30 row) to fill in the measurement
table for real and decide whether to continue, adjust, or pause the campaign based on
actual first signals — not before real external data exists.
