import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  reactCompiler: true,
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
  // async redirects() {
  //   return [
  //     {
  //       source: "/index.html",
  //       destination: "/",
  //       permanent: true,
  //     },
  //   ];
  // },
};

export default nextConfig;
