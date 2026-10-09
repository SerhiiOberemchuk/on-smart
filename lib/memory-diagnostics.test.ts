import { afterEach, describe, expect, it, vi } from "vitest";
import { registerMemoryDiagnostics } from "@/lib/memory-diagnostics";
import { countRequest, takeRequestCount } from "@/lib/request-counter";

vi.mock("@/lib/telegram-alert", () => ({ sendTelegramAlert: vi.fn() }));

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  takeRequestCount();
});

describe("Node memory diagnostics", () => {
  it("keeps per-window request and fetch counters after the runtime split", async () => {
    vi.useFakeTimers();
    const logger = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(process, "memoryUsage").mockReturnValue({
      rss: 100 * 1024 * 1024,
      heapUsed: 50 * 1024 * 1024,
      heapTotal: 60 * 1024 * 1024,
      external: 2 * 1024 * 1024,
      arrayBuffers: 1024,
    });
    const fetcher = vi.fn().mockResolvedValue(new Response("ok"));
    vi.stubGlobal("fetch", fetcher);
    takeRequestCount();
    registerMemoryDiagnostics();
    countRequest();
    await fetch("https://example.com/asset");
    vi.advanceTimersByTime(5 * 60 * 1000);
    expect(fetcher).toHaveBeenCalledWith("https://example.com/asset", undefined);
    expect(logger).toHaveBeenLastCalledWith(expect.stringContaining("req/5m=1"));
    expect(logger).toHaveBeenLastCalledWith(expect.stringContaining("fetch/5m: example.com=1"));
    vi.advanceTimersByTime(5 * 60 * 1000);
    expect(logger).toHaveBeenLastCalledWith(expect.stringContaining("req/5m=0"));
    expect(logger).toHaveBeenLastCalledWith(expect.stringContaining("fetch/5m: none"));
  });
});
