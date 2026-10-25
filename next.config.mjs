/** @type {import('next').NextConfig} */
// Analytics is proxied same-origin so the Umami dashboard itself never has to be public:
// only the tracker script and its collect endpoint are reachable, under /stats.
const UMAMI_INTERNAL_URL = process.env.UMAMI_INTERNAL_URL || "http://umami:3000";

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    if (!process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID) return [];
    return [
      { source: "/stats/script.js", destination: `${UMAMI_INTERNAL_URL}/script.js` },
      { source: "/stats/api/send", destination: `${UMAMI_INTERNAL_URL}/api/send` },
    ];
  },
  experimental: {
    serverComponentsExternalPackages: ["node:sqlite"],
  },
};

export default nextConfig;
