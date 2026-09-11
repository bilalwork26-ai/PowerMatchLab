# Marketing — 30-Day Traffic Acquisition Package

Prepared as part of the traffic-acquisition round following PR #35 (measurement, internal linking, and existing-page SEO). This folder is planning/content material for the site owner to execute — it is not built into the Next.js app and never published as a public page.

## Files in this folder

| File | Block | Contents |
|---|---|---|
| `01-campaign-baseline.md` | 1 | Dated baseline from confirmed Search Console + Cloudflare data, explicit ES/DZ caveat, the weekly metrics table to fill in going forward |
| `02-link-opportunities.md` | 6 | Real, search-verified communities/blogs/directories, with an explicit note on what could and couldn't be verified (WebFetch to external domains is blocked in this environment) |
| `03-pinterest-posts.md` | 5 | 12 complete Pinterest pins (title, description, visible text, URL, visual proposal, alt text) |
| `04-facebook-linkedin-posts.md` | 5 | 8 complete Facebook/LinkedIn posts (full text, URL, CTA) |
| `05-video-scripts.md` | 5 | 4 short-form video scripts (hook, scenes, voiceover, on-screen text, CTA) for YouTube Shorts/TikTok/Reels |
| `06-community-contributions.md` | 5 | 4 full draft answers to realistic community questions, each with an explicit PowerMatchLab disclosure |
| `07-editorial-outreach-templates.md` | 5 | 8 outreach templates by recipient type, all with `[bracketed]` placeholders for real names/contacts — none invented |
| `08-30-day-calendar.md` | 5 | Day-by-day schedule sequencing everything above, with a status column meant to be filled in as you go |

## What was NOT done, and why

Per this round's explicit rules (no external accounts created, no posting without real authorized access, external actions that are blocked get prepared-not-faked):

- **Nothing was posted anywhere.** Every file above is a draft for a human with real account access to review and post.
- **No community's actual posting rules were verified** — this session's outbound web access is blocked for every external domain tested (forums, `api.indexnow.org`, etc.). `02-link-opportunities.md` states this explicitly per entry rather than presenting an unverified policy as confirmed.
- **No IndexNow submission was actually sent** — the same network restriction applies to `api.indexnow.org`. The submission script (`scripts/submit-indexnow.mjs`) is built, tested, and documented, ready to run from an environment with real outbound access after a deploy.
- **No contact names or email addresses were invented** — every outreach template uses `[Name]` / `[Site Name]` placeholders for the sender to fill in after finding the real contact.
- **No Amazon Associates data was reported** — `01-campaign-baseline.md` marks that row as unknown rather than guessing.

## Minimal instructions to connect external accounts (when you're ready)

- **Pinterest:** business account (free) → verify the site domain → create pins per `03-pinterest-posts.md`, using the proposed visuals as a design brief for whoever builds the actual pin images.
- **Facebook/LinkedIn:** post from PowerMatchLab's own page/account (not a personal profile pretending to be independent) using the text in `04-facebook-linkedin-posts.md` as-is or lightly adapted.
- **YouTube Shorts/TikTok/Reels:** the scripts in `05-video-scripts.md` assume simple motion-graphics/on-screen-text style video, not physical product footage (consistent with the site never claiming hands-on testing) — any basic video-editing tool (CapCut, Canva) can produce this from the script.
- **Communities (forums/Reddit):** create an account under a name that doesn't impersonate an independent third party, read that specific community's actual current rules (this session could not), then use the relevant draft from `06-community-contributions.md` as a starting point — answer the real question in the real thread it's replying to, don't post it as a standalone announcement.
- **IndexNow:** nothing to "connect" — it's already configured (`src/lib/indexnow.ts`, `public/dcb5beb84967ddf9fbccc19821a7e2da.txt`). Just run `node scripts/submit-indexnow.mjs` from a machine with real internet access after each deploy that changes content.

## Reminder

Success for this package is measured later, by real data in `01-campaign-baseline.md` — external referrers, new Search Console queries, affiliate clicks, actual orders — never by the existence of these files. Publishing this package is infrastructure, not a result.
