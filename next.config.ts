import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,
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
