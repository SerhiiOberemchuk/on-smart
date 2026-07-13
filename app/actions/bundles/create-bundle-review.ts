"use server";

import { db } from "@/db/db";
import { bundleMetaSchema } from "@/db/schemas/bundle-meta.schema";
import { productsSchema } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { ulid } from "ulid";

type BundleReviewActionState = {
  success: boolean;
  message?: string;
  error?: unknown;
};

const MIN_RATING = 1;
const MAX_RATING = 5;
const MAX_NAME_LENGTH = 120;
const MAX_COMMENT_LENGTH = 2000;

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseRating(rawRating: string) {
  const rating = Number(rawRating);
  if (!Number.isInteger(rating)) return null;
  if (rating < MIN_RATING || rating > MAX_RATING) return null;
  return rating;
}

export async function createBundleReview(
  _prevState: BundleReviewActionState,
  data: FormData,
): Promise<BundleReviewActionState> {
  // Honeypot: real users never see this field; drop bot submissions silently.
  if (getFormValue(data, "company")) {
    return { success: true };
  }

  const bundleId = getFormValue(data, "bundleId");
  const clientName = getFormValue(data, "nome");
  const email = getFormValue(data, "email");
  const rating = parseRating(getFormValue(data, "rating"));
  const comment = getFormValue(data, "messaggio");

  if (!bundleId || !clientName || !email || !comment || rating === null) {
    return { success: false, message: "Compila tutti i campi richiesti." };
  }

  if (!isValidEmail(email)) {
    return { success: false, message: "Inserisci un indirizzo email valido." };
  }

  if (clientName.length > MAX_NAME_LENGTH || comment.length > MAX_COMMENT_LENGTH) {
    return { success: false, message: "Il testo inserito è troppo lungo." };
  }

  try {
    const [bundle] = await db
      .select({
        id: productsSchema.id,
        slug: productsSchema.slug,
      })
      .from(productsSchema)
      .where(and(eq(productsSchema.id, bundleId), eq(productsSchema.productType, "bundle")))
      .limit(1);

    if (!bundle) {
      return { success: false, message: "Bundle non trovato." };
    }

    const [bundleMeta] = await db
      .select({
        reviews: bundleMetaSchema.reviews,
      })
      .from(bundleMetaSchema)
      .where(eq(bundleMetaSchema.bundle_id, bundleId))
      .limit(1);

    const nextReview = {
      id: ulid(),
      client_name: clientName,
      email,
      rating,
      comment,
      created_at: new Date().toISOString(),
    };

    const currentReviews = bundleMeta?.reviews ?? [];

    // Throttle spam: one review per email per bundle (bundle reviews are shown
    // immediately, so this matters more than for moderated product reviews).
    if (currentReviews.some((review) => review.email === email)) {
      return {
        success: false,
        message: "Hai già inviato una recensione per questo bundle.",
      };
    }

    const nextReviews = [nextReview, ...currentReviews];

    await db
      .insert(bundleMetaSchema)
      .values({
        bundle_id: bundleId,
        reviews: nextReviews,
      })
      .onDuplicateKeyUpdate({
        set: {
          reviews: nextReviews,
        },
      });

    updateTag(CACHE_TAGS.bundle.byId(bundleId));
    updateTag(CACHE_TAGS.bundle.bySlug(bundle.slug));
    updateTag(CACHE_TAGS.bundleMeta.byBundleId(bundleId));

    return { success: true };
  } catch (error) {
    console.error("[createBundleReview] failed:", error);
    return {
      success: false,
      message: "Errore durante l'invio della recensione.",
      error,
    };
  }
}
