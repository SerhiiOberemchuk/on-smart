import type { NextConfig } from "next";
import { baseUrl } from "./types/baseUrl";

const canonicalHost = new URL(baseUrl).hostname;
const redirectHost = canonicalHost.startsWith("www.")
  ? canonicalHost.replace(/^www\./, "")
  : `www.${canonicalHost}`;

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  reactCompiler: true,
  allowedDevOrigins: ["10.18.212.244"],
  // Load sharp from node_modules at runtime instead of tracing/bundling it, so
  // the native linux binaries copied into the standalone image (see Dockerfile)
  // are used rather than the broken wasm32 fallback.
  serverExternalPackages: ["sharp"],
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
      // Behind Aruba's reverse proxy + apex↔www redirects the forwarded
      // Origin/Host can differ from the server's own; without this Next may
      // reject Server Actions ("Failed to find Server Action").
      allowedOrigins: [canonicalHost, redirectHost],
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
      // Legacy guest checkout wizard removed — old step URLs go to the single-page checkout.
      {
        source: "/checkout/:step(informazioni|consegna|pagamento|riepilogo)",
        destination: "/checkout",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
