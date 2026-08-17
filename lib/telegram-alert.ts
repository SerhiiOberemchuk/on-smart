import { baseUrl } from "@/types/baseUrl";

// System error alerts reuse the order bot's token, so they must be kept away
// from the order notifications in two separate ways:
//
//  1. A dedicated chat (`TG_CHAT_ID_ERRORS`) with NO fallback to `TG_CHAT_ID` —
//     if the var is unset, alerting stays off rather than burying "NUOVO ORDINE"
//     messages under error spam.
//  2. Hard rate limits. Telegram applies flood control per *bot*, not per chat,
//     so an error storm that trips a 429 would silence order messages too. The
//     caps below make it impossible for alerting to spend that budget.
const TELEGRAM_API = "https://api.telegram.org";

// One alert per distinct error, then silence. Repeats are counted and reported
// in the next message instead of being sent one by one.
const DEDUPE_WINDOW_MS = 15 * 60 * 1000;

// Ceiling on outgoing messages regardless of how many *distinct* errors fire.
const RATE_WINDOW_MS = 60 * 1000;
const MAX_MESSAGES_PER_WINDOW = 6;

// Bounded so a high-cardinality error storm cannot grow this map without limit.
// This process already died once from unbounded memory growth — the alerting for
// that failure must not be able to cause it.
const MAX_TRACKED_ERRORS = 200;

const REQUEST_TIMEOUT_MS = 5000;

// Telegram rejects messages longer than 4096 characters.
const MAX_TEXT_LENGTH = 3500;

const isLocalhost = !baseUrl || baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

type TrackedError = {
  suppressed: number;
  lastSentAt: number;
};

const trackedErrors = new Map<string, TrackedError>();

let rateWindowStartedAt = 0;
let messagesInWindow = 0;

/**
 * Decides whether this occurrence earns a message. Insertion order in the Map is
 * used as the eviction order, so entries are re-inserted on every hit to keep an
 * actively firing error from being evicted while it is still firing.
 */
function claimSendSlot(key: string, now: number): { send: boolean; suppressed: number } {
  const tracked = trackedErrors.get(key);

  if (tracked && now - tracked.lastSentAt < DEDUPE_WINDOW_MS) {
    tracked.suppressed += 1;
    trackedErrors.delete(key);
    trackedErrors.set(key, tracked);
    return { send: false, suppressed: tracked.suppressed };
  }

  if (now - rateWindowStartedAt >= RATE_WINDOW_MS) {
    rateWindowStartedAt = now;
    messagesInWindow = 0;
  }

  if (messagesInWindow >= MAX_MESSAGES_PER_WINDOW) {
    if (tracked) tracked.suppressed += 1;
    return { send: false, suppressed: tracked?.suppressed ?? 0 };
  }

  messagesInWindow += 1;

  const suppressed = tracked?.suppressed ?? 0;
  trackedErrors.delete(key);
  trackedErrors.set(key, { suppressed: 0, lastSentAt: now });

  while (trackedErrors.size > MAX_TRACKED_ERRORS) {
    const oldest = trackedErrors.keys().next();
    if (oldest.done) break;
    trackedErrors.delete(oldest.value);
  }

  return { send: true, suppressed };
}

/**
 * Fire-and-forget system alert. Never throws and never rejects: it reports on a
 * request that already failed, so it must not add a second failure on top.
 */
export async function sendTelegramAlert({
  key,
  title,
  details,
}: {
  /** Dedupe identity — same key within the window is counted, not re-sent. */
  key: string;
  title: string;
  details: Record<string, string | undefined>;
}): Promise<void> {
  try {
    if (isLocalhost) return;

    const token = process.env.TG_BOT_TOKEN;
    const chatId = process.env.TG_CHAT_ID_ERRORS;

    if (!token || !chatId) return;

    const { send, suppressed } = claimSendSlot(key, Date.now());

    if (!send) return;

    const lines = [
      `🚨 ${title}`,
      ...Object.entries(details)
        .filter(([, value]) => Boolean(value))
        .map(([label, value]) => `${label}: ${value}`),
    ];

    if (suppressed > 0) {
      lines.push(`(+${suppressed} identical since the last alert)`);
    }

    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        // Deliberately no parse_mode: error messages and stack traces contain
        // `<`, `_` and `*`, which Telegram would reject as malformed markup.
        text: lines.join("\n").slice(0, MAX_TEXT_LENGTH),
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error("[telegram-alert] send failed:", res.status, await res.text());
    }
  } catch (error) {
    console.error("[telegram-alert] unexpected failure:", error);
  }
}
