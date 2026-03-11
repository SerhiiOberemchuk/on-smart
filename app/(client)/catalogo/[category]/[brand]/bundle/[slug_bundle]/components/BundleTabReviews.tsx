import FormFeedback from "@/components/FormFeedback/FormFeedback";
import StarsRating from "@/components/StarsRating";
import type { BundleMetaReview } from "@/db/schemas/bundle-meta.schema";
import { twMerge } from "tailwind-merge";

function toNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export default function BundleTabReviews({
  className,
  bundleName,
  bundleRating,
  reviews,
  bundleId,
}: {
  className?: string;
  bundleName: string;
  bundleRating?: string | null;
  reviews: BundleMetaReview[];
  bundleId: string;
}) {
  const approvedReviews = reviews
    .map((item) => ({
      ...item,
      client_name: item.client_name?.trim() ?? "",
      comment: item.comment?.trim() ?? "",
      created_at: item.created_at?.trim() ?? "",
      rating: Math.min(5, Math.max(1, Math.round(toNumber(item.rating)))),
    }))
    .filter((item) => item.client_name.length > 0 && item.comment.length > 0);

  const averageFromReviews =
    approvedReviews.length > 0
      ? approvedReviews.reduce((acc, item) => acc + item.rating, 0) / approvedReviews.length
      : 0;
  const fallbackRating = toNumber(bundleRating);
  const rating = averageFromReviews > 0 ? averageFromReviews : fallbackRating;

  return (
    <div className={twMerge("flex flex-col gap-5 xl:flex-row", className)}>
      <div className="rounded-sm bg-background p-3 pb-0 xl:h-auto xl:flex-1 xl:pb-3">
        <h2 className="H4M mb-4">Recensioni del kit</h2>
        <div className="mb-4 flex items-center gap-2">
          <StarsRating rating={rating.toString()} />
          <span>{rating.toFixed(1)}</span>
          <span className="text-text-secondary ml-2 text-sm">({approvedReviews.length})</span>
        </div>
        {approvedReviews.length === 0 ? (
          <p className="text_R text-text-grey">
            Le recensioni per questo kit non sono ancora disponibili.
          </p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {approvedReviews.map((review) => (
              <article
                key={review.id}
                className="mb-2 flex w-full max-w-[312px] flex-col gap-3 rounded-sm border border-stroke-grey p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="input_R_18 line-clamp-1">{review.client_name}</h3>
                  <span className="helper_text shrink-0 text-text-grey">
                    {!Number.isNaN(Date.parse(review.created_at))
                      ? new Date(review.created_at).toLocaleDateString("it-IT")
                      : "-"}
                  </span>
                </div>
                <StarsRating rating={review.rating.toString()} />
                <p className="text_R">{review.comment}</p>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-sm bg-background p-3 xl:h-auto xl:flex-1">
        <h3 className="H4M">Valuta questo kit</h3>
        <p className="input_R_18 mt-4">{bundleName}</p>
        <FormFeedback type="bundle-review" bundleId={bundleId} className="@container" />
      </div>
    </div>
  );
}
