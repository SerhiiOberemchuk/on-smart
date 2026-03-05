"use server";

import { cacheLife } from "next/cache";
import pRetry, { type RetryContext } from "p-retry";

import { GoogleReview } from "@/types/google-reviews.types";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_TASK_ID = process.env.APIFY_TASK_ID;
const APIFY_API_BASE_URL = "https://api.apify.com/v2";
const DEFAULT_GOOGLE_REVIEW_URL = "https://g.page/r/CRhuErfSy0siEAE/review";
const MAX_REVIEWS = 20;
const APIFY_REVIEW_FIELDS = [
  "name",
  "reviewId",
  "reviewUrl",
  "stars",
  "text",
  "publishedAtDate",
] as const;
const GOOGLE_REVIEWS_RETRY_OPTIONS = {
  retries: 3,
  minTimeout: 800,
  factor: 1.5,
} as const;

type ApifyReviewItem = {
  name?: string;
  reviewId?: string;
  reviewUrl?: string;
  stars?: number | string;
  text?: string;
  publishedAtDate?: string;
};

type ApifyHttpError = Error & {
  statusCode?: number;
};

function normalizeRating(value: unknown): GoogleReview["rating"] {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) return "5";

  const clamped = Math.max(1, Math.min(5, Math.round(numeric)));
  return String(clamped) as GoogleReview["rating"];
}

function normalizeReview(item: ApifyReviewItem, index: number): GoogleReview | null {
  const clientName = String(item.name ?? "").trim();
  const reviewText = String(item.text ?? "").trim();
  const id = String(item.reviewId ?? "").trim() || `google-review-${index}`;
  const reviewUrl = String(item.reviewUrl ?? "").trim() || DEFAULT_GOOGLE_REVIEW_URL;
  const date = String(item.publishedAtDate ?? "").trim();

  if (!clientName || !reviewText) return null;

  return {
    id,
    clientName,
    reviewText,
    reviewUrl,
    date,
    rating: normalizeRating(item.stars),
  };
}

function getErrorCode(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as { code?: unknown }).code ?? "");
  }

  return "";
}

function getErrorStatus(error: unknown): number | null {
  if (typeof error === "object" && error !== null && "statusCode" in error) {
    const statusCode = Number((error as { statusCode?: unknown }).statusCode);
    return Number.isFinite(statusCode) ? statusCode : null;
  }

  return null;
}

function isRetryableGoogleReviewsError(error: unknown): boolean {
  const status = getErrorStatus(error);
  if (status !== null) {
    return status === 429 || status >= 500;
  }

  const code = getErrorCode(error);
  const message = error instanceof Error ? error.message : String(error);
  const transientCodes = ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "EAI_AGAIN"];

  return transientCodes.some(
    (transientCode) => code === transientCode || message.includes(transientCode),
  );
}

function buildApifyTaskUrl(taskId: string, token: string) {
  const params = new URLSearchParams({
    token,
    clean: "true",
    format: "json",
    limit: String(MAX_REVIEWS),
    fields: APIFY_REVIEW_FIELDS.join(","),
  });

  return `${APIFY_API_BASE_URL}/actor-tasks/${encodeURIComponent(taskId)}/run-sync-get-dataset-items?${params.toString()}`;
}

function toApifyHttpError(message: string, statusCode: number): ApifyHttpError {
  const error = new Error(message) as ApifyHttpError;
  error.statusCode = statusCode;
  return error;
}

async function fetchApifyReviews(taskId: string, token: string): Promise<ApifyReviewItem[]> {
  const response = await fetch(buildApifyTaskUrl(taskId, token), {
    method: "POST",
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw toApifyHttpError(
      `[google-reviews] Apify request failed (${response.status}). ${body.slice(0, 250)}`,
      response.status,
    );
  }

  const payload = (await response.json()) as unknown;

  if (!Array.isArray(payload)) {
    throw new Error("[google-reviews] Unexpected Apify response format");
  }

  return payload as ApifyReviewItem[];
}

async function fetchGoogleReviewsWithRetry(taskId: string) {
  return pRetry(
    () => fetchApifyReviews(taskId, APIFY_TOKEN as string),
    {
      ...GOOGLE_REVIEWS_RETRY_OPTIONS,
      onFailedAttempt: ({ error, attemptNumber, retriesLeft }: RetryContext) => {
        console.warn(
          `[google-reviews] Retry ${attemptNumber} failed. Retries left: ${retriesLeft}. ${error.message}`,
        );
      },
      shouldRetry: ({ error }: RetryContext) => isRetryableGoogleReviewsError(error),
    },
  );
}

async function getGoogleReviewsCachedCore(): Promise<GoogleReview[]> {
  "use cache";
  cacheLife("hours");
  const items = await fetchGoogleReviewsWithRetry(APIFY_TASK_ID as string);

  return items
    .map((item, index) => normalizeReview(item, index))
    .filter((item): item is GoogleReview => Boolean(item));
}

export async function getGoogleReviewsAction() {
  if (!APIFY_TOKEN || !APIFY_TASK_ID) {
    return { success: false, error: "APIFY_TOKEN or APIFY_TASK_ID is not defined", reviews: [] };
  }

  try {
    const reviews = await getGoogleReviewsCachedCore();
    return {
      success: true,
      reviews,
    };
  } catch (error) {
    return { success: false, error, reviews: [] };
  }
}
