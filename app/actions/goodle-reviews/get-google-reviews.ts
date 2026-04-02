"use server";

import { cacheLife } from "next/cache";

import { GoogleReview } from "@/types/google-reviews.types";
import { isBuildPhase } from "@/utils/guard-build";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_TASK_ID = process.env.APIFY_TASK_ID;
const APIFY_BASE_URL = "https://api.apify.com/v2";
const DEFAULT_GOOGLE_REVIEW_URL = "https://g.page/r/CRhuErfSy0siEAE/review";
const MAX_REVIEWS = 20;
const BUILD_PHASE_SKIP_ERROR = "skipped: build phase";

type GoogleReviewsActionResult =
  | {
      success: true;
      reviews: GoogleReview[];
      errorCode: null;
      errorMessage: null;
    }
  | {
      success: false;
      reviews: [];
      errorCode: "BUILD_PHASE" | "MISSING_CONFIG" | "EXTERNAL_ERROR";
      errorMessage: string;
    };

type ApifyReviewItem = {
  name?: string;
  reviewId?: string;
  reviewUrl?: string;
  stars?: number | string;
  text?: string;
  publishedAtDate?: string;
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

async function getGoogleReviewsCachedCore(taskId: string): Promise<GoogleReview[]> {
  "use cache";
  cacheLife("hours");

  const url = new URL(`${APIFY_BASE_URL}/actor-tasks/${taskId}/run-sync-get-dataset-items`);
  url.searchParams.set("token", APIFY_TOKEN!);
  url.searchParams.set("clean", "true");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(MAX_REVIEWS));
  url.searchParams.set("fields", "name,reviewId,reviewUrl,stars,text,publishedAtDate");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Apify request failed with status ${response.status}`);
  }

  const items = (await response.json()) as ApifyReviewItem[];

  return items
    .map((item, index) => normalizeReview(item, index))
    .filter((item): item is GoogleReview => Boolean(item));
}

export async function getGoogleReviewsAction(): Promise<GoogleReviewsActionResult> {
  if (isBuildPhase()) {
    return {
      success: false,
      errorCode: "BUILD_PHASE",
      errorMessage: BUILD_PHASE_SKIP_ERROR,
      reviews: [],
    };
  }

  if (!APIFY_TOKEN || !APIFY_TASK_ID) {
    return {
      success: false,
      errorCode: "MISSING_CONFIG",
      errorMessage: "APIFY_TOKEN or APIFY_TASK_ID is not defined",
      reviews: [],
    };
  }

  try {
    const reviews = await getGoogleReviewsCachedCore(APIFY_TASK_ID);
    return {
      success: true,
      reviews,
      errorCode: null,
      errorMessage: null,
    };
  } catch (error) {
    console.error("[getGoogleReviewsAction]", error);
    return {
      success: false,
      errorCode: "EXTERNAL_ERROR",
      errorMessage: "Failed to load Google reviews",
      reviews: [],
    };
  }
}
