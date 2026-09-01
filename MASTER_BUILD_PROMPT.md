# POWERMATCHLAB — MASTER BUILD PROMPT V1

## Mission
Build the first production-ready version of PowerMatchLab, an independent decision-support and comparison website for portable power stations and home/outdoor backup power.

Primary market: United States
Language: American English
Primary monetization: Amazon Associates (later, once the public site is registered)
Possible future monetization: Google AdSense

PowerMatchLab must help a visitor determine what power station they actually need instead of merely showing a catalog.

Core journey:
Google/Search or Guide → Power Calculator → Compatible Products → Compare → Product Page → Check Price on Amazon → Amazon USA

Do not redesign the business concept.

## Source of truth
Use `products.json` as the centralized product-data source.
Use the images in `/references` as the approved visual direction.
Unknown fields in `products.json` are intentionally `null`. Never guess them.

## Absolute data-integrity rules
Never invent:
- prices or discounts
- availability/stock
- Amazon star ratings or review counts
- user reviews/opinions
- specifications
- real-world runtime results
- tests supposedly performed by PowerMatchLab
- affiliate links
- warranty/charging/noise/efficiency data that is not supplied

If data is missing, keep it null internally and show "Not verified" only where the UI needs a visible value.

Always distinguish:
- Manufacturer claim
- PowerMatchLab calculation
- Editorial assessment

`amazon_product_url` is a normal direct Amazon product URL.
`amazon_affiliate_url` is the future personal Amazon Associates URL.
Never manufacture an affiliate URL.
Until affiliate URLs exist, a valid "Check Price on Amazon" CTA may fall back to `amazon_product_url`.

## Approved visual direction
Follow the five supplied references:
1. `references/01_home.png`
2. `references/02_compare.png`
3. `references/03_power_calculator.png`
4. `references/04_product_page.png`
5. `references/05_mobile.png`

Preserve:
- dark navy / PowerMatchLab blue identity
- white/light data surfaces
- green positive status
- yellow/orange Amazon CTA
- strong whitespace
- technical but consumer-friendly data visualization
- mobile-first behavior
- professional independent editorial appearance

Do not make it look like a dropshipping shop, generic affiliate blog, Amazon clone, or manufacturer website.

## Primary navigation
Home
Products
Compare
Power Calculator
Guides
Deals

Supporting/footer:
Best for Camping
Best for RV
Best for Refrigerator Backup
Best for Home Backup
About / Methodology
Affiliate Disclosure
Privacy Policy
Terms

## Home
Hero: "Find the Right Power Station for Your Needs."
Primary CTAs:
- Use Power Calculator
- Compare Products

Sections:
- Hero
- trust/value indicators
- Powerful Tools to Help You Decide
- Power Calculator
- Compare Side by Side
- Find Best for You
- Top Power Stations
- use-case cards: Camping / RV / Refrigerator Backup / Home Backup
- methodology/trust
- final calculator CTA

## Products
Searchable/filterable catalog driven from `products.json`.
Filters only when data exists: brand, capacity, output, chemistry, weight, solar, expansion, 240V, TT-30, UPS, use case.

## Compare
Allow multiple products side-by-side.
Desktop: comparison table + justified visual scoring.
Mobile: horizontal/swipe comparison.
Never manufacture a score to fill a chart.

## Power Calculator
This is a core product feature.

Step 1: Add Your Devices
Fields: device name, running watts, quantity, hours/day, days, optional surge/startup watts.
Provide editable example appliances, never universal wattage claims.

Step 2: Set Usage & Runtime

Step 3: Your Power Needs
Calculate transparently:
- daily energy demand
- required usable capacity
- recommended minimum capacity
- required continuous output
- required surge capability

Recommendations must come from `products.json` and explain why each qualifies.
Never recommend a product that fails required continuous output/capacity unless clearly labeled insufficient.

## Recommendation engine
Deterministic and explainable.
Consider:
- required capacity
- continuous load
- surge load
- ports
- 120/240V
- RV requirements
- expansion preference
- portability preference

Possible statuses:
Best Match
Good Match
Possible Match
Not Suitable

Expose reasons and limitations.

## Product pages
Each product page should support:
- breadcrumbs
- brand/model
- product imagery placeholder/assets
- concise description
- key spec cards
- Check Price on Amazon
- Add to Compare
- PowerMatch Score (only justified)
- Best For
- Key Specs
- Overview / Specifications / Scores / Compare / Reviews / Q&A structure
- score details
- radar chart only if underlying scores are justified
- estimated runtime examples
- Pros & Cons
- Quick Comparison
- methodology explanation
- affiliate disclosure near commercial CTA where appropriate

## Runtime estimator
Runtime is a calculation, never a testing claim.
Example:
estimated_runtime_hours = usable_energy_wh / device_power_w
usable_energy_wh = capacity_wh × configurable_assumed_efficiency

Efficiency assumptions must be configurable, documented, and visible where relevant.
Label results "Estimated runtime", never guaranteed runtime.

## PowerMatch Score
Must be explainable and configurable.
Potential dimensions:
Capacity Value
Output Performance
Portability
Charging Speed
Expandability
Noise Level
Value for Money

Only calculate dimensions with sufficient underlying data.
If not justified, do not show a score.

## Best-for pages
Build:
- /best-for-camping
- /best-for-rv
- /best-for-refrigerator-backup
- /best-for-home-backup

Explain what matters, common mistakes, and compatibility logic before showing dataset-derived products.

## Guides / SEO
Create an editorial architecture, not thin mass-generated SEO.
Templates support title, slug, meta description, intro, TOC, educational sections, calculator CTA, recommendations, compare CTA, FAQ, sources, last updated, disclosure.

Content journey:
Search intent → Answer → Teach → Calculate → Compare → Product page → Amazon

## Deals
Build infrastructure but invent no deals.
No fake crossed-out prices, percentages, countdowns, urgency, or stock warnings.

## Responsive
Mobile is essential.
Use the approved mobile reference.
Support bottom navigation where useful, touch targets, compact cards, sticky contextual CTA, horizontal comparison, calculator step progress.
Desktop should exploit horizontal space for tables/charts/panels.

## Accessibility
Semantic HTML, keyboard navigation, visible focus, form labels, textual equivalents for charts, no color-only meaning, appropriate contrast.

## Performance
Optimize images, lazy-load below fold, minimize unnecessary JS, responsive images, strong Core Web Vitals, SSR/static content where appropriate.

## SEO / structured data
Canonical URLs, Open Graph, Twitter metadata, sitemap, robots, breadcrumbs.
Valid schema where supported: Organization, WebSite, BreadcrumbList, Product, Article, FAQPage.
Never fabricate ratings/prices in schema.

## Trust / legal
Build About/Methodology, Affiliate Disclosure, Privacy Policy, Terms.
Methodology explains calculations, manufacturer claims, editorial assessments, scoring, runtime limitations.
Never claim physical testing unless explicitly supplied.

## Data model
`products.json` contains:
id, brand, model, market, category, capacity_wh, rated_output_w, surge_output_w,
battery_chemistry, cycle_life, weight_kg, dimensions, solar_input_w, ac_charging_w,
charging_time, ac_outlets, usb_c, usb_a, dc_output, rv_tt30, voltage_240v, ups_ms,
expandable, max_expanded_capacity_wh, wifi, bluetooth, warranty, idle_consumption_w,
best_for, pros, cons, official_source, last_verified, amazon_asin,
amazon_product_url, amazon_affiliate_url.

Use TypeScript types/schema validation.
Do not substitute 0/false/"N/A" for genuinely unknown values.

## Initial catalog
The 10 records in `products.json` are the working V1 catalog.
Note: EcoFlow DELTA 3 was intentionally updated to EcoFlow DELTA 3 Classic. Do not reuse old DELTA 3 specs silently.

## Technical implementation
Prefer Next.js + TypeScript + React + Tailwind CSS unless the existing repository already has a suitable production stack.
Inspect the repository before changing architecture.
Use reusable components and separate:
- product data
- calculator logic
- score logic
- recommendation logic
- UI

Suggested organization:
components/
data/
lib/
types/
app/
content/

## Build priority
1. Inspect repository/assets
2. Foundation/design system
3. Central schema/data layer
4. Header/footer/navigation
5. Homepage
6. Product catalog
7. Product template
8. Compare
9. Power Calculator
10. Recommendation logic
11. Best-for pages
12. Guides architecture
13. Methodology/legal
14. Deals infrastructure
15. SEO/structured data
16. responsive polish
17. accessibility
18. QA

## QA
Before completion:
- run build/lint/tests
- fix errors
- test all routes
- test mobile/tablet/desktop
- compare 2/3/4 products
- calculator: one device, multiple devices, custom device, surge load, invalid input
- missing/null product fields
- no misleading UI from null values
- no invented Amazon destinations
- no fabricated affiliate URLs
- no fake prices/reviews/ratings
- unit-test calculations/recommendation thresholds
- keyboard accessibility
- metadata and broken links

## Definition of V1 success
A US visitor can:
understand PowerMatchLab → browse → calculate needs → receive explainable recommendations → compare → inspect product → understand fit → follow a verified direct Amazon product link.

The user should not need to understand battery engineering.

## Final execution instruction
First inspect the repository, `products.json`, and all `/references` images.
Then:
1. summarize your implementation plan
2. identify only genuinely missing data/assets
3. build as much of the complete V1 as possible without inventing missing information
4. use null / "Not verified" for unresolved data
5. run build/lint/tests
6. fix errors
7. provide a concise completion report

Do not stop merely because Amazon Associates affiliate URLs are currently null.
Do not ask for decisions already defined above.
Build a functional decision-support product, not a static mockup.
