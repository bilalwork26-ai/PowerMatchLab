// One-off generation tool for the tools_launch_2026 Pinterest batch.
// Not part of the Next.js app (not imported by src/**, excluded from tsc's
// include globs by extension) — run manually with:
//   node marketing/scripts/generate-pins.mjs
// Renders each pin in pins-data.mjs to a real 1000x1500 PNG using the
// Chromium already installed in this environment for Playwright, reusing
// the same navy/cyan palette as src/lib/og-template.tsx so pins look like
// they came from the site.
import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PINS } from "./pins-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "pins");

const NAVY_950 = "#0b1220";
const NAVY_900 = "#0b1f3a";
const CYAN_300 = "#67e8f9";
const BRAND_300 = "#93c5fd";

function pinHtml(pin) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1000px; height: 1500px; }
  body {
    font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: linear-gradient(160deg, ${NAVY_950} 0%, ${NAVY_900} 60%, #10305c 100%);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 64px 56px;
    color: #fff;
  }
  .logo-row { display: flex; align-items: center; gap: 14px; }
  .logo-badge {
    width: 48px; height: 48px; border-radius: 14px; background: #1657ac;
    display: flex; align-items: center; justify-content: center;
  }
  .logo-text { font-size: 28px; font-weight: 700; }
  .logo-text .brand { color: ${BRAND_300}; }
  .eyebrow {
    font-size: 24px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
    color: ${CYAN_300}; margin-bottom: 22px;
  }
  .headline {
    font-size: 58px; font-weight: 800; line-height: 1.14; color: #fff;
    margin-bottom: 30px;
  }
  .subhead {
    font-size: 30px; line-height: 1.45; color: #cfe0f5; font-weight: 500;
  }
  .card {
    margin-top: 40px; background: rgba(255,255,255,0.06); border: 1px solid rgba(103,232,249,0.35);
    border-radius: 18px; padding: 26px 28px; font-size: 26px; color: #a9c4e8; line-height: 1.4;
  }
  .footer { display: flex; flex-direction: column; gap: 10px; }
  .cta {
    display: inline-block; align-self: flex-start; background: ${CYAN_300}; color: #06202f;
    font-weight: 700; font-size: 26px; padding: 16px 28px; border-radius: 999px;
  }
  .url { font-size: 22px; color: #86a0c4; }
  .disclosure { font-size: 18px; color: #6b84ab; }
</style>
</head>
<body>
  <div class="logo-row">
    <div class="logo-badge">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" fill="#ffffff"/></svg>
    </div>
    <div class="logo-text">Power<span class="brand">Match</span>Lab</div>
  </div>

  <div>
    <div class="eyebrow">${escapeHtml(pin.eyebrow)}</div>
    <div class="headline">${escapeHtml(pin.headline)}</div>
    <div class="subhead">${escapeHtml(pin.subhead)}</div>
    <div class="card">${escapeHtml(pin.title)}</div>
  </div>

  <div class="footer">
    <span class="cta">Free calculator &middot; no signup</span>
    <span class="url">www.powermatchlab.com</span>
    ${pin.disclosure ? '<span class="disclosure">Reader-supported &middot; may earn a commission from qualifying purchases</span>' : ""}
  </div>
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  });
  const page = await browser.newPage({ viewport: { width: 1000, height: 1500 } });

  for (const pin of PINS) {
    await page.setContent(pinHtml(pin), { waitUntil: "networkidle" });
    const outPath = join(OUT_DIR, `${pin.id}.png`);
    await page.screenshot({ path: outPath, type: "png" });
    console.log(`wrote ${outPath}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
