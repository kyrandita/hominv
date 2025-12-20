import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('http://placebeard.it/**')]
  },
  /* config options here */
  output: 'standalone',
};

export default nextConfig;
