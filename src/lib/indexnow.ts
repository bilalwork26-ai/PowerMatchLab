import { SITE } from "@/lib/site";

/**
 * IndexNow key for this site. Unlike a GA4 Measurement ID or an Amazon
 * Associates tag, an IndexNow key is not an external account credential —
 * it's a bearer token PowerMatchLab mints itself, published at its own
 * `/{key}.txt` as domain-ownership proof (see public/{key}.txt below).
 * Generated once with `crypto.randomBytes(16).toString("hex")`; safe to
 * commit, since IndexNow keys are meant to be public.
 */
export const INDEXNOW_KEY = "dcb5beb84967ddf9fbccc19821a7e2da";

export function indexNowKeyLocation(): string {
  return `${SITE.url}/${INDEXNOW_KEY}.txt`;
}

/** IndexNow key format: 8-128 hex characters (the spec's required shape). */
export function isValidIndexNowKey(key: string): boolean {
  return /^[0-9a-f]{8,128}$/i.test(key);
}

/**
 * True only for an absolute https URL on this site's exact canonical host
 * (the `www` host `SITE.url` resolves to) — never the bare apex, never a
 * different domain, never a relative path. IndexNow submits real URLs from
 * a single host per request; submitting a foreign domain's URL would be
 * both rejected by the API and a meaningless/abusive request to send.
 */
export function isSubmittableUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  const canonicalHost = new URL(SITE.url).hostname;
  return parsed.protocol === "https:" && parsed.hostname === canonicalHost;
}

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

/**
 * Builds the exact JSON body IndexNow's bulk submission endpoint expects.
 * Throws rather than silently dropping bad input — a caller passing an
 * empty list or a non-submittable URL has a bug worth surfacing, not
 * papering over with a partial submission.
 */
export function buildIndexNowPayload(urls: string[]): IndexNowPayload {
  if (urls.length === 0) throw new Error("buildIndexNowPayload: urls must not be empty");
  const offenders = urls.filter((u) => !isSubmittableUrl(u));
  if (offenders.length > 0) {
    throw new Error(
      `buildIndexNowPayload: these URLs are not submittable (must be https on ${
        new URL(SITE.url).hostname
      }): ${offenders.join(", ")}`,
    );
  }
  return {
    host: new URL(SITE.url).hostname,
    key: INDEXNOW_KEY,
    keyLocation: indexNowKeyLocation(),
    urlList: urls,
  };
}

export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
