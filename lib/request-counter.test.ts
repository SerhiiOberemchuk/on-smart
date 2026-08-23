import { beforeEach, describe, expect, it } from "vitest";

import { countRequest, takeRequestCount } from "./request-counter";

describe("request counter", () => {
  beforeEach(() => {
    takeRequestCount();
  });

  it("starts empty", () => {
    expect(takeRequestCount()).toBe(0);
  });

  it("counts each request", () => {
    countRequest();
    countRequest();
    countRequest();

    expect(takeRequestCount()).toBe(3);
  });

  it("resets after being read, so each sample reports its own window", () => {
    countRequest();
    takeRequestCount();

    expect(takeRequestCount()).toBe(0);
  });

  it("keeps state on globalThis so separate bundles share one counter", () => {
    countRequest();

    const shared = (globalThis as Record<symbol, { count: number } | undefined>)[
      Symbol.for("@on-smart/request-count")
    ];

    expect(shared?.count).toBe(1);
  });
});
