// Safely read a JSON body from a fetch Response. A provider that answers 200
// with an empty (or non-JSON) body would otherwise make `res.json()` throw
// "Unexpected end of JSON input"; this returns null instead so callers can
// handle it as a normal failure.
export async function readJsonResponse<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
