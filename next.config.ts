import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add image configuration to allow loading from the Roblox CDN
  images: {
    // This allows Next.js to directly use images from the Roblox CDN without proxying them.
    // The hostname is set to a pattern to match different subdomains (e.g., t1, t5, tr, etc.).
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.rbxcdn.com',
      },
    ],
  },
  /* other config options here */
};

export default nextConfig;
