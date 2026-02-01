import "dotenv/config";

type PayPalEnv = "sandbox" | "live";

function getEnv(): PayPalEnv {
  return (process.env.PAYPAL_ENV as PayPalEnv) ?? "sandbox";
}

function baseUrl() {
  return getEnv() === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

export async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;

  console.log(clientId, secret);

  if (!clientId || !secret) throw new Error("PayPal credentials missing");

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const res = await fetch(`${baseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) throw new Error(await res.text());
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

export async function paypalApi<T>(
  path: string,
  opts: { method: "GET" | "POST"; body?: unknown; requestId?: string },
) {
  const token = await getAccessToken();
  const res = await fetch(`${baseUrl()}${path}`, {
    method: opts.method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(opts.requestId ? { "PayPal-Request-Id": opts.requestId } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return JSON.parse(text) as T;
}
