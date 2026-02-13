import { ReactPayPalScriptOptions } from "@paypal/react-paypal-js";

type Result<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: { message: string; status?: number; debugId?: string | null; raw?: string };
    };

export const getEnv = (): ReactPayPalScriptOptions["environment"] =>
  process.env.PAYPAL_ENV === "production" ? "production" : "sandbox";

const baseUrl = () =>
  getEnv() === "production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

const normalizePath = (p: string) => (p.startsWith("/") ? p : `/${p}`);

const safeJson = (text: string): Result<unknown> => {
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: false, error: { message: "PayPal returned non-JSON response", raw: text } };
  }
};

const isToken = (x: unknown): x is { access_token: string } =>
  typeof x === "object" &&
  x !== null &&
  typeof (x as Record<string, unknown>).access_token === "string";

export async function getAccessToken(): Promise<Result<string>> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) return { ok: false, error: { message: "PayPal credentials missing" } };

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  console.log(baseUrl());

  try {
    const res = await fetch(`${baseUrl()}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    });
    console.log("getAccessToken", res);

    const debugId = res.headers.get("paypal-debug-id");
    const text = await res.text();

    if (!res.ok)
      return {
        ok: false,
        error: { message: "PayPal token request failed", status: res.status, debugId, raw: text },
      };

    const parsed = safeJson(text);
    if (!parsed.ok || !isToken(parsed.data))
      return {
        ok: false,
        error: { message: "Unexpected token response", status: res.status, debugId, raw: text },
      };

    return { ok: true, data: parsed.data.access_token };
  } catch (e) {
    return {
      ok: false,
      error: {
        message: "Network error while requesting token",
        raw: e instanceof Error ? e.message : String(e),
      },
    };
  }
}

export async function paypalApi<T>(
  path: string,
  opts: { method: "GET" | "POST"; body?: unknown; requestId?: string },
): Promise<Result<T>> {
  const tokenRes = await getAccessToken();
  if (!tokenRes.ok) return tokenRes;

  try {
    const res = await fetch(`${baseUrl()}${normalizePath(path)}`, {
      method: opts.method,
      headers: {
        Authorization: `Bearer ${tokenRes.data}`,
        "Content-Type": "application/json",
        ...(opts.requestId ? { "PayPal-Request-Id": opts.requestId } : {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
    });
    console.log("paypalApi: ", res);

    const debugId = res.headers.get("paypal-debug-id");
    const text = await res.text();

    if (!res.ok) {
      console.error("PayPal status:", res.status);
      console.error("PayPal debug id:", debugId);
      console.error("PayPal response:", text);
      return {
        ok: false,
        error: { message: "PayPal API request failed", status: res.status, debugId, raw: text },
      };
    }

    if (!text) return { ok: true, data: undefined as unknown as T };

    const parsed = safeJson(text);
    return parsed.ok
      ? { ok: true, data: parsed.data as T }
      : { ok: false, error: { ...parsed.error, status: res.status, debugId } };
  } catch (e) {
    return {
      ok: false,
      error: {
        message: "Network error while calling PayPal API",
        raw: e instanceof Error ? e.message : String(e),
      },
    };
  }
}
