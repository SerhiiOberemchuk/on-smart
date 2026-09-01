import { requireAdminSession } from "@/app/actions/admin/_shared/require-admin-session";
import { isValidOpsToken } from "@/lib/ops-token";
import { accessSync, constants, mkdirSync } from "fs";
import os from "os";
import path from "path";
import { writeHeapSnapshot } from "v8";

// Writes a V8 heap snapshot to disk so the retainers of the growing
// `arrayBuffers` can be inspected in Chrome DevTools -> Memory. The counters in
// instrumentation.ts can only say HOW MUCH is held; only a snapshot says BY WHOM.
//
// There is a second, HTTP-free way to get the same file: set
// `NODE_OPTIONS=--heapsnapshot-signal=SIGUSR2` in the container environment and
// run `kill -USR2 1` in its console. That one also works when the HTTP server
// itself is wedged, which this route obviously cannot.
//
// MUST stay authenticated. A heap snapshot contains everything the process has
// in memory at that instant: session tokens, the DB password, payment API keys,
// customer names and addresses. Leaking one is far worse than leaking the
// migration endpoint.
const DEFAULT_RSS_ALERT_MB = 520;

const toMb = (bytes: number) => Math.round(bytes / 1024 / 1024);

/**
 * Picks a directory the runtime user can actually write to.
 *
 * The container runs as `node` while WORKDIR created /app as root, so writing
 * the snapshot next to server.js fails with EACCES. The Dockerfile now ships an
 * owned `diagnostics/` directory for exactly this; the tmpdir fallback keeps the
 * route working if the image predates that change, since a failed diagnostic is
 * useless precisely when it is needed most.
 */
function resolveSnapshotDir(): string {
  const candidates = [path.join(process.cwd(), "diagnostics"), os.tmpdir()];

  let lastError: unknown;

  for (const dir of candidates) {
    try {
      // mkdirSync succeeds silently on a directory that already exists but is
      // owned by root, which would reproduce the original EACCES at write time.
      // Only an explicit W_OK check actually proves the candidate is usable.
      mkdirSync(dir, { recursive: true });
      accessSync(dir, constants.W_OK);
      return dir;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("No writable snapshot directory");
}

// `writeHeapSnapshot` is synchronous and pauses the whole process, so a large
// heap can outlast the load balancer's read timeout. The caller then sees a
// gateway error even though the file is being written fine, and the natural
// reaction is to press Send again — which would queue a second multi-hundred-MB
// snapshot behind the first. This flag makes the retry a cheap 409 instead.
let snapshotInFlight = false;

export async function POST(request: Request) {
  const hasToken = isValidOpsToken(request.headers.get("x-ops-token"), process.env.OPS_TOKEN);

  if (!hasToken) {
    try {
      await requireAdminSession();
    } catch {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const usage = process.memoryUsage();
  const rssMb = toMb(usage.rss);
  const limitMb = Number(process.env.MEMORY_ALERT_RSS_MB) || DEFAULT_RSS_ALERT_MB;
  const force = new URL(request.url).searchParams.get("force") === "1";

  // Taking a snapshot pauses the process and needs headroom to serialise the
  // heap. Doing it while memory is already near the alert line is how you turn
  // a diagnostic into the outage you were diagnosing.
  if (rssMb >= limitMb && !force) {
    return Response.json(
      {
        error: `RSS is ${rssMb}MB, at or above the ${limitMb}MB alert line. Restart first and snapshot early, or repeat with ?force=1 if you accept the risk.`,
        rssMb,
        limitMb,
      },
      { status: 409 },
    );
  }

  if (snapshotInFlight) {
    return Response.json(
      { error: "A snapshot is already being written. Check run.log for [heap-snapshot]." },
      { status: 409 },
    );
  }

  snapshotInFlight = true;

  try {
    // Timestamped so a "before" and an "after" snapshot never collide — the
    // diff between two is what actually identifies a leak.
    const filename = `heap-${new Date().toISOString().replace(/[:.]/g, "-")}.heapsnapshot`;
    const filePath = path.join(resolveSnapshotDir(), filename);

    console.log(`[heap-snapshot] writing ${filePath} at rss=${rssMb}MB`);
    writeHeapSnapshot(filePath);
    console.log(`[heap-snapshot] wrote ${filePath}`);

    return Response.json({
      success: true,
      filePath,
      takenAtRssMb: rssMb,
      heapUsedMb: toMb(usage.heapUsed),
      externalMb: toMb(usage.external),
      arrayBuffersMb: toMb(usage.arrayBuffers),
    });
  } catch (error) {
    console.error("[heap-snapshot] FAILED:", error);
    // The caller is already authenticated and this is an ops endpoint, so the
    // errno and the target directory go back in the response: needing a second
    // trip to run.log to learn "EACCES" is what made the first failure slow to
    // diagnose. Still no stack — that can carry file contents.
    const code = (error as { code?: unknown })?.code;
    return Response.json(
      {
        success: false,
        error: "Snapshot failed. See server logs.",
        code: typeof code === "string" ? code : undefined,
        dir: path.join(process.cwd(), "diagnostics"),
      },
      { status: 500 },
    );
  } finally {
    snapshotInFlight = false;
  }
}
