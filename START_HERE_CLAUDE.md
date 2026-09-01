# START HERE — CLAUDE CODE

Upload/open this package in the PowerMatchLab project and use `MASTER_BUILD_PROMPT.md` as the governing build specification.

Read, in this order:
1. MASTER_BUILD_PROMPT.md
2. products.json
3. all five images in references/

Then inspect the existing repository before editing anything.

Build the complete V1 described in the master prompt. Treat `products.json` as the single source of truth for product data. Do not invent missing values. The visual references are approved and should guide the implementation closely.

Important Amazon rule:
- `amazon_product_url` = direct normal Amazon product page.
- `amazon_affiliate_url` = future Amazon Associates link and is currently null.
- Until a genuine affiliate URL exists, use the verified `amazon_product_url` for "Check Price on Amazon".
- Never fabricate tracking IDs or affiliate URLs.

Run build, lint and tests, fix errors, and finish with a concise report of what was implemented and what remains genuinely blocked.
