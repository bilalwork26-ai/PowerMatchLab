#!/usr/bin/env node
/**
 * Submits only NEW, CHANGED, or REMOVED URLs to IndexNow (Bing, and any
 * other search engine that subscribes to the shared IndexNow feed) — never
 * the whole sitemap on every run, per the manifest-diff logic below.
 *
 * Run this manually after a production deploy:
 *
 *   node scripts/submit-indexnow.mjs                # real submission
 *   node scripts/submit-indexnow.mjs --dry-run       # print the diff, submit nothing
 *   node scripts/submit-indexnow.mjs --site-url https://www.powermatchlab.com
 *
 * What it does, in order:
 *   1. Fetches the live /sitemap.xml from SITE_URL (defaults to the
 *      production domain; override with --site-url or SITE_URL env var).
 *   2. Compares each <url> (loc + lastmod) against the last recorded state
 *      in indexnow-manifest.json (committed at the repo root).
 *   3. Submits only urls that are new, whose lastmod changed, or that
 *      existed in the manifest but are no longer in the sitemap (removed —
 *      IndexNow submission for a now-gone URL is how you tell a search
 *      engine to drop it, rather than waiting for it to notice a 404).
 *   4. Logs one line per submission attempt (date, url, response status) to
 *      indexnow-log.ndjson, appending — never overwriting history.
 *   5. Updates indexnow-manifest.json with the new state, but ONLY after a
 *      real (non-dry-run) submission that didn't error.
 *
 * IMPORTANT: an HTTP 200 from IndexNow's submission endpoint means the
 * request was accepted for processing — it is NOT confirmation that any
 * search engine has actually crawled or indexed the URL. This script never
 * claims otherwise; check Bing Webmaster Tools / Search Console for actual
 * indexing status days or weeks later.
 *
 * This key is not a secret — IndexNow keys are meant to be published
 * publicly (see public/<key>.txt) as the domain-ownership proof itself.
 * Keep this literal in sync with INDEXNOW_KEY in src/lib/indexnow.ts;
 * tests/indexnow.test.ts fails if they ever drift apart.
 */
import { readFileSync, writeFileSync, existsSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const MANIFEST_PATH = join(REPO_ROOT, "indexnow-manifest.json");
const LOG_PATH = join(REPO_ROOT, "indexnow-log.ndjson");

const INDEXNOW_KEY = "dcb5beb84967ddf9fbccc19821a7e2da";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const siteUrlArgIdx = args.indexOf("--site-url");
const SITE_URL =
  (siteUrlArgIdx !== -1 ? args[siteUrlArgIdx + 1] : undefined) ??
  process.env.SITE_URL ??
  "https://www.powermatchlab.com";

function parseSitemapXml(xml) {
  const entries = [];
  const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
  for (const block of urlBlocks) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? null;
    if (loc) entries.push({ loc, lastmod });
  }
  return entries;
}

function loadManifest() {
  if (!existsSync(MANIFEST_PATH)) return {};
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  } catch {
    console.warn(`Could not parse ${MANIFEST_PATH} — treating as empty (first run).`);
    return {};
  }
}

function diffAgainstManifest(current, manifest) {
  const currentByUrl = new Map(current.map((e) => [e.loc, e.lastmod]));
  const changed = [];
  for (const { loc, lastmod } of current) {
    const previous = manifest[loc];
    if (previous === undefined || previous !== lastmod) changed.push(loc);
  }
  const removed = Object.keys(manifest).filter((loc) => !currentByUrl.has(loc));
  return { changed, removed, currentByUrl };
}

async function submitToIndexNow(urlList) {
  const body = {
    host: new URL(SITE_URL).hostname,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList,
  };
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  return res.status;
}

function logLine(entry) {
  appendFileSync(LOG_PATH, JSON.stringify(entry) + "\n");
}

async function main() {
  console.log(`IndexNow submission — site: ${SITE_URL}${dryRun ? " (dry run)" : ""}`);

  let xml;
  try {
    const res = await fetch(`${SITE_URL}/sitemap.xml`);
    if (!res.ok) throw new Error(`sitemap.xml returned HTTP ${res.status}`);
    xml = await res.text();
  } catch (err) {
    console.error(`Could not fetch ${SITE_URL}/sitemap.xml: ${err.message}`);
    console.error(
      "This is expected in a network-restricted environment (e.g. a sandboxed CI runner) — run this from an environment with real outbound HTTPS access, after the site is actually deployed.",
    );
    process.exitCode = 1;
    return;
  }

  const current = parseSitemapXml(xml);
  if (current.length === 0) {
    console.error("Parsed zero <url> entries from sitemap.xml — aborting rather than submitting nothing useful.");
    process.exitCode = 1;
    return;
  }

  const manifest = loadManifest();
  const { changed, removed, currentByUrl } = diffAgainstManifest(current, manifest);
  const toSubmit = [...changed, ...removed];

  console.log(`Sitemap has ${current.length} URLs. New/changed: ${changed.length}. Removed: ${removed.length}.`);
  if (toSubmit.length === 0) {
    console.log("Nothing new, changed, or removed since the last recorded run — no submission needed.");
    return;
  }

  console.log("URLs to submit:");
  for (const u of toSubmit) console.log(`  - ${u}`);

  if (dryRun) {
    console.log("\n--dry-run: not submitting, not updating the manifest.");
    return;
  }

  let status;
  try {
    status = await submitToIndexNow(toSubmit);
  } catch (err) {
    console.error(`IndexNow submission request failed: ${err.message}`);
    for (const u of toSubmit) {
      logLine({ date: new Date().toISOString(), url: u, status: "ERROR", error: err.message });
    }
    process.exitCode = 1;
    return;
  }

  const date = new Date().toISOString();
  for (const u of toSubmit) logLine({ date, url: u, status });

  console.log(`\nIndexNow responded HTTP ${status} for ${toSubmit.length} URL(s).`);
  console.log(
    "HTTP 200/202 means the request was ACCEPTED for processing — it is not proof of crawling or indexing. Check Bing Webmaster Tools / Search Console later for actual status.",
  );

  if (status >= 200 && status < 300) {
    const newManifest = Object.fromEntries(currentByUrl);
    writeFileSync(MANIFEST_PATH, JSON.stringify(newManifest, null, 2) + "\n");
    console.log(`Updated ${MANIFEST_PATH} with the current sitemap state.`);
  } else {
    console.warn("Non-2xx response — manifest left unchanged so this batch will be retried next run.");
  }
}

main();
