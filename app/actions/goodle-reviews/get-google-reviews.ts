"use server";

import { ApifyClient } from "apify-client";
import { cacheLife } from "next/cache";

import { GoogleReview } from "@/types/google-reviews.types";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_TASK_ID = process.env.APIFY_TASK_ID;
const DEFAULT_GOOGLE_REVIEW_URL = "https://g.page/r/CRhuErfSy0siEAE/review";
const MAX_REVIEWS = 20;

const client = new ApifyClient({
  token: APIFY_TOKEN,
});

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

export async function getGoogleReviewsAction() {
  "use cache";
  cacheLife("hours");

  if (!APIFY_TOKEN || !APIFY_TASK_ID) {
    return { success: false, error: "APIFY_TOKEN or APIFY_TASK_ID is not defined", reviews: [] };
  }

  try {
    const run = await client.task(APIFY_TASK_ID).call();
    const { items } = await client.dataset(run.defaultDatasetId).listItems({
      limit: MAX_REVIEWS,
      fields: ["name", "reviewId", "reviewUrl", "stars", "text", "publishedAtDate"],
    });

    const reviews = (items as ApifyReviewItem[])
      .map((item, index) => normalizeReview(item, index))
      .filter((item): item is GoogleReview => Boolean(item));

    return {
      success: true,
      reviews,
    };
  } catch (error) {
    return { success: false, error, reviews: [] };
  }
}
