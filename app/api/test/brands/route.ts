import {
  brands_cache_catchReturn,
  brands_cache_retryThrow,
  brands_cache_throw,
  brands_guardInsideCache,
  brands_guardOutsideCache,
  brands_guardOutsideCache_retryThrow,
  brands_noCache_retryThrow,
  brands_noCache_throw,
} from "@/app/actions/brands/test-actions-brands";

const map: Record<string, () => Promise<unknown>> = {
  noCache_throw: brands_noCache_throw,
  noCache_retryThrow: brands_noCache_retryThrow,
  cache_throw: brands_cache_throw,
  cache_retryThrow: brands_cache_retryThrow,
  guard_outside_cache: brands_guardOutsideCache,
  guard_outside_cache_retryThrow: brands_guardOutsideCache_retryThrow,
  guard_inside_cache: brands_guardInsideCache,
  cache_catchReturn: brands_cache_catchReturn,
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const strategy = url.searchParams.get("s") ?? "noCache_throw";
  const fn = map[strategy];

  if (!fn) {
    return Response.json(
      { ok: false, error: "Unknown strategy", available: Object.keys(map) },
      { status: 400 },
    );
  }

  const result = await fn();
  return Response.json(result);
}
