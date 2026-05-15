import type { NextConfig } from "next";
import { baseUrl } from "./types/baseUrl";

const canonicalHost = new URL(baseUrl).hostname;
const redirectHost = canonicalHost.replace(/^www\./, "");

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  reactCompiler: true,
  allowedDevOrigins: ["10.18.212.244"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "on-smart.r3-it.storage.cloud.it",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: redirectHost }],
        destination: `${baseUrl}/:path*`,
        permanent: true,
      },
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
