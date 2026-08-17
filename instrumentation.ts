// Diagnostics for the recurring `SyntaxError: Unexpected end of JSON input`
// (digest 3278538558) that fills Aruba's run.log. Next strips its own frames
// from that trace, so the log shows only `at JSON.parse (<anonymous>)` — no
// route, no method, no caller. `onRequestError` is the one place that still has
// the request attached to the error, so it can name the culprit.
//
// Errors are also pushed to Telegram so they surface without anyone watching
// Aruba's log viewer — see lib/telegram-alert.ts for the dedupe/rate limits that
// keep this from interfering with the order notifications.
//
// Next 16 does not re-export the instrumentation types from the package root,
// so the signature is declared locally rather than deep-importing from
// `next/dist/server/instrumentation/types`.
import { sendTelegramAlert } from "@/lib/telegram-alert";
import { baseUrl } from "@/types/baseUrl";

// Named in every alert so a staging deploy pointing at the same bot is
// immediately distinguishable from production.
const baseHost = new URL(baseUrl).hostname;

type RequestErrorContext = {
  routerKind: "Pages Router" | "App Router";
  routePath: string;
  routeType: "render" | "route" | "action" | "proxy";
  renderSource?: "react-server-components" | "react-server-components-payload" | "server-rendering";
  revalidateReason: "on-demand" | "stale" | undefined;
};

type ErrorRequest = Readonly<{
  path: string;
  method: string;
  headers: NodeJS.Dict<string | string[]>;
}>;

// Allow-listed on purpose: `cookie` and `authorization` carry session tokens and
// must never be written to run.log. `next-action` is the one that matters here —
// its presence proves the failing request is a Server Action, and its value is
// the ID that the earlier `Received "x"` errors were choking on.
const LOGGED_HEADERS = [
  "content-type",
  "content-length",
  "next-action",
  "next-router-state-tree",
  "user-agent",
  "referer",
  "x-forwarded-for",
] as const;

export async function onRequestError(
  error: unknown,
  request: ErrorRequest,
  context: Readonly<RequestErrorContext>,
): Promise<void> {
  const headers: Record<string, string> = {};

  for (const name of LOGGED_HEADERS) {
    const value = request.headers[name];
    if (value !== undefined) headers[name] = Array.isArray(value) ? value.join(", ") : value;
  }

  const digest = (error as { digest?: unknown })?.digest;
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(
    "[onRequestError]",
    JSON.stringify({
      method: request.method,
      path: request.path,
      routeType: context.routeType,
      routerKind: context.routerKind,
      routePath: context.routePath,
      renderSource: context.renderSource,
      revalidateReason: context.revalidateReason,
      digest,
      message,
      headers,
    }),
  );

  // Printed separately — a multi-line stack escaped into the JSON above would be
  // unreadable in the run.log viewer.
  if (stack) console.error(stack);

  // The digest is Next's own hash of the error, so identical failures collapse
  // into one alert. Errors without a digest fall back to message + route, which
  // groups the same way for practical purposes.
  await sendTelegramAlert({
    key: typeof digest === "string" ? digest : `${message}@${context.routePath}`,
    title: `${context.routeType} error on ${baseHost}`,
    details: {
      request: `${request.method} ${request.path}`,
      route: `${context.routePath} (${context.renderSource ?? context.routerKind})`,
      digest: typeof digest === "string" ? digest : undefined,
      error: message,
      // Only the head of the stack: the rest is noise in a chat message, and the
      // full trace is already in run.log above.
      stack: stack?.split("\n").slice(0, 4).join("\n"),
      referer: headers.referer,
      client: headers["user-agent"],
    },
  });
}
