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
