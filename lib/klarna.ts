export function klarnaBaseUrl() {
  const base = process.env.KLARNA_API_BASE;
  if (!base) throw new Error("KLARNA_API_BASE is missing");
  return base;
}

export function klarnaAuthHeader() {
  const u = process.env.KLARNA_USERNAME;
  const p = process.env.KLARNA_PASSWORD;
  if (!u || !p) throw new Error("KLARNA_USERNAME or KLARNA_PASSWORD is missing");

  const token = Buffer.from(`${u}:${p}`).toString("base64");
  return `Basic ${token}`;
}
