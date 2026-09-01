/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Product imagery is not bundled in V1 (no verified image assets shipped).
    // Placeholders are rendered as inline SVG, so remote/optimized images are unused.
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
