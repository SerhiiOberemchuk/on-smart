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
    // The Aruba app-server node is memory-capped (cloudlet scaling limit), and
    // sharp decodes images into raw bitmaps *outside* the V8 heap — a 50MB
    // source (Next's default ceiling) can expand to hundreds of MB of native
    // memory and kill the container before V8 ever reports pressure. No
    // legitimate product photo is anywhere near 10MB.
    maximumResponseBody: 10 * 1024 * 1024,
    // Uploaded files get a fresh ULID key on every upload (app/actions/files/
    // uploadFile.ts), so an image URL is immutable — re-running sharp every 4h
    // (the default minimumCacheTTL) only burns CPU and RAM on a 400MHz cloudlet.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // The optimized-image disk cache is unbounded by default; cap it so it
    // cannot creep toward the node's disk limit.
    maximumDiskCacheSize: 2 * 1024 * 1024 * 1024,
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
