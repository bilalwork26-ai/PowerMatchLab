# PowerMatchLab — V1

Independent decision-support and comparison site for portable power stations (US market).
Built with Next.js 15 (App Router) + TypeScript + Tailwind CSS. `products.json` at the
repo root is the single source of truth; unknown fields stay `null` and render as
"Not verified".

## Run it locally

Requires Node.js 18.18+ (Node 24 LTS used in development).

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

### Other scripts

| Command | What it does |
| --- | --- |
| `npm run build` | Production build (static export of all 33 routes) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (`next/core-web-vitals`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests (calculator, recommendation, score, runtime, data integrity) |

## Project layout

```
products.json              Canonical product data (source of truth)
src/
  types/                   Product type
  data/                    Zod schema + validated loader
  lib/                     calculator, score, recommend, runtime, assumptions,
                           amazon link resolver, seo helpers, compare rows
  content/                 Guides + Best-For editorial copy
  components/              UI, layout, product, compare, calculator, home
  context/                 Compare selection (localStorage-backed)
  app/                     Routes (home, products, compare, power-calculator,
                           best-for-*, guides, deals, legal, sitemap, robots)
tests/                     Vitest suites
```

## Data & integrity rules honored

- `amazon_affiliate_url` holds a real Amazon Associates link (tracking ID
  `powermatchlab-20`) for every product now that the site is public and
  registered with the Associates programme. The "Check Price on Amazon" CTA
  falls back to the verified `amazon_product_url` only if a product's
  affiliate link is ever missing. No fabricated affiliate URLs or tracking IDs.
- No invented prices, discounts, stock, star ratings, review counts or test results.
- Manufacturer claim vs. PowerMatchLab calculation vs. editorial assessment are
  labelled throughout. See `/about-methodology`.
- Scores omit any dimension without supporting data (Noise Level and Value for Money
  are never scored — no data exists). Radar charts render only when justified.

---

## Original delivery package notes

- MASTER_BUILD_PROMPT.md — full build specification
- products.json — 10-product structured dataset
- START_HERE_CLAUDE.md — original handoff instruction
- references/ — approved visual references

Amazon Associates affiliate URLs (tracking ID `powermatchlab-20`) were added once
PowerMatchLab had a public URL and the Associates registration was completed. Normal
Amazon product URLs remain as the fallback commercial destination, subject to
production revalidation.
