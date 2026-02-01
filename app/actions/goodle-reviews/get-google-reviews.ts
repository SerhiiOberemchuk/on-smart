"use server";
import { GoogleReview } from "@/types/google-reviews.types";
import { ApifyClient } from "apify-client";
import { cacheLife } from "next/cache";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_TASK_ID = process.env.APIFY_TASK_ID;
const client = new ApifyClient({
  token: APIFY_TOKEN,
});

export async function getGoogleReviewsAction() {
  "use cache";

  cacheLife("weeks");

  if (!APIFY_TOKEN || !APIFY_TASK_ID) {
    return { success: false, error: "APIFY_TOKEN o APIFY_TASK_ID non definiti" };
  }

  try {
    const run = await client.task(APIFY_TASK_ID).call();
    const { items } = await client.dataset(run.defaultDatasetId).listItems({
      limit: 20,
      fields: ["name", "reviewId", "reviewUrl", "stars", "text", "publishedAtDate"],
    });
    const typedItems = items;

    return {
      success: true,
      reviews: typedItems.map((item) => {
        return {
          clientName: item.name,
          id: item.reviewId,
          reviewUrl: item.reviewUrl,
          rating: item.stars,
          reviewText: item.text,
          date: item.publishedAtDate,
        } as GoogleReview;
      }),
    };
  } catch (error) {
    return { success: false, error, reviews: [] };
  }
}
