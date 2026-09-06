/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Licensed product photography is not available in V1 (see
    // /affiliate-disclosure). Every product instead uses an original,
    // locally-authored illustration from public/illustrations/ — no remote
    // image host is ever needed.
    remotePatterns: [],
  },
  async redirects() {
    return [
      // Canonical host redirect: the apex domain (powermatchlab.com) and the
      // www subdomain are both currently reachable, which was causing
      // Search Console to index both as separate URLs. www is the chosen
      // canonical (matches the sitemap and every <link rel="canonical">).
      //
      // `has: [{ type: "host", value: "powermatchlab.com" }]` matches ONLY
      // when the request's Host header is exactly "powermatchlab.com" — not
      // "www.powermatchlab.com" (a different string, so it never matches
      // here) and not any other subdomain. Because the destination host
      // literally can never re-satisfy that same condition, this rule
      // cannot loop against itself.
      //
      // This must run before the redirect below: without a `has` condition,
      // .../ecoflow-delta-3 would otherwise match first and reissue a
      // host-relative redirect that stays on the apex domain instead of
      // reaching www. Placing the host redirect first sends every apex
      // request to www first; anything still needing the delta-3 rewrite
      // then gets it as a second hop, always landing on the canonical host.
      //
      // `/:path*` (zero-or-more catch-all) preserves the full path,
      // including the bare root, and Next.js automatically forwards the
      // original request's query string to the destination since none is
      // set explicitly here.
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "powermatchlab.com",
          },
        ],
        destination: "https://www.powermatchlab.com/:path*",
        permanent: true,
      },
      // The DELTA 3 was intentionally replaced by the DELTA 3 Classic.
      {
        source: "/products/ecoflow-delta-3",
        destination: "/products/ecoflow-delta-3-classic",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
