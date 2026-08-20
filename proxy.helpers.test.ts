import { describe, expect, it } from "vitest";

import {
  isLegacyAdminAuthPath,
  isMalformedServerAction,
  isPublicCheckoutResult,
  requiresSession,
} from "./proxy.helpers";

describe("malformed Server Action header", () => {
  it("passes a request with no Next-Action header", () => {
    expect(isMalformedServerAction(null)).toBe(false);
  });

  it("passes a real 42-character action id", () => {
    expect(isMalformedServerAction("007e43ebf07175bd4b52eb62f5c0ea6fcfdbfd5354")).toBe(false);
  });

  it("rejects the probe values seen in production", () => {
    for (const probe of ["x", '"x"', "nn", "zy", "08", "od", "fk", "exploit", "2h"]) {
      expect(isMalformedServerAction(probe)).toBe(true);
    }
  });

  it("rejects an empty header value", () => {
    expect(isMalformedServerAction("")).toBe(true);
  });

  it("rejects an over-long id", () => {
    expect(isMalformedServerAction("a".repeat(43))).toBe(true);
  });
});

describe("session-protected routes", () => {
  it("protects the account areas and their sub-paths", () => {
    for (const pathname of ["/admin", "/admin/dashboard", "/account", "/checkout"]) {
      expect(requiresSession(pathname)).toBe(true);
    }
  });

  it("leaves the public storefront alone", () => {
    for (const pathname of ["/", "/catalogo", "/chi-siamo", "/carrello", "/accedi"]) {
      expect(requiresSession(pathname)).toBe(false);
    }
  });

  it("does not treat /administrator as a protected route", () => {
    // Scanners probe this constantly; a naive startsWith would match it and
    // bounce the request into the login redirect instead of the 404 page.
    expect(requiresSession("/administrator")).toBe(false);
    expect(requiresSession("/accounts-payable")).toBe(false);
    expect(requiresSession("/checkout-info")).toBe(false);
  });

  it("keeps the order-completed pages public", () => {
    expect(requiresSession("/checkout/completato/ORD-1")).toBe(false);
    expect(requiresSession("/checkout/completato/ORD-1/sumup")).toBe(false);
    expect(isPublicCheckoutResult("/checkout/completato")).toBe(true);
  });
});

describe("legacy admin auth path", () => {
  it("matches the removed login route and its sub-paths", () => {
    expect(isLegacyAdminAuthPath("/admin/auth")).toBe(true);
    expect(isLegacyAdminAuthPath("/admin/auth/callback")).toBe(true);
  });

  it("does not match other admin routes", () => {
    expect(isLegacyAdminAuthPath("/admin/dashboard")).toBe(false);
    expect(isLegacyAdminAuthPath("/admin/authors")).toBe(false);
  });
});
