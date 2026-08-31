import { describe, expect, it } from "vitest";

import { isValidOpsToken } from "./ops-token";

const TOKEN = "s3cret-ops-token";

describe("ops break-glass token", () => {
  it("accepts the exact token", () => {
    expect(isValidOpsToken(TOKEN, TOKEN)).toBe(true);
  });

  it("rejects a wrong token of the same length", () => {
    expect(isValidOpsToken("s3cret-ops-tokeX", TOKEN)).toBe(false);
  });

  it("rejects a wrong token of a different length", () => {
    expect(isValidOpsToken("short", TOKEN)).toBe(false);
    expect(isValidOpsToken(`${TOKEN}-extra`, TOKEN)).toBe(false);
  });

  it("rejects when no header was sent", () => {
    expect(isValidOpsToken(null, TOKEN)).toBe(false);
    expect(isValidOpsToken("", TOKEN)).toBe(false);
  });

  it("stays closed when the token is not configured", () => {
    // The dangerous case: an unset secret must never make an empty or any
    // header pass, otherwise the endpoint is open exactly like it was on prod.
    expect(isValidOpsToken("", undefined)).toBe(false);
    expect(isValidOpsToken("anything", undefined)).toBe(false);
    expect(isValidOpsToken("anything", "")).toBe(false);
    expect(isValidOpsToken(null, undefined)).toBe(false);
  });
});
