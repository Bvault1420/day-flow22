/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "*.agent.cvm.dev",
    "*.cursor.com",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "coin-images.coingecko.com" },
      { protocol: "https", hostname: "assets.coingecko.com" },
    ],
  },
};

module.exports = nextConfig;
