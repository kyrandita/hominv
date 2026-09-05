import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('http://placebeard.it/**')]
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  // Forces the builder to physically pull the missing SWC ESM modules 
  // until Vercel rolls out an official patch.
  // attempt removal at next@16.3.2 or greater
  outputFileTracingIncludes: {
    '/*': ['./node_modules/@swc/helpers/**/*'],
  },
};

export default nextConfig;
