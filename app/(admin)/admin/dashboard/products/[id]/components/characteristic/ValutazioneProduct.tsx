"use client";

import { getProductReviewsAdmin } from "@/app/actions/product-reviews/get-product-reviews";
import ButtonYellow from "@/components/BattonYellow";
import { ProductReviewType } from "@/db/schemas/product-reviews.schema";
import { useEffect, useState } from "react";
import ButtonXDellete from "../../../../ButtonXDellete";
import { updateProductReviewById } from "@/app/actions/product-reviews/update-review";
import { deleteProductReviewById } from "@/app/actions/product-reviews/delete-review";
import { twMerge } from "tailwind-merge";

export default function ValutazioneProduct({ id }: { id: string }) {
  const [reviews, setReviews] = useState<ProductReviewType[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await getProductReviewsAdmin(id);
        if (res.reviews) {
          setReviews(res.reviews);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchReviews();
  }, [id]);
  const approveReview = async (reviewId: string) => {
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, is_approved: true } : r)));

    const res = await updateProductReviewById({
      id: reviewId,
      is_approved: true,
      product_id: id,
    });

    if (!res?.success) {
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, is_approved: false } : r)));
    }
  };

  const deleteReview = async (reviewId: string) => {
    const prev = reviews;
    setReviews((r) => r.filter((i) => i.id !== reviewId));

    const res = await deleteProductReviewById({
      id: reviewId,
      product_id: id,
    });

    if (!res?.success) {
      setReviews(prev);
    }
  };

  return (
    <div className="rounded-xl border border-gray-500 p-3">
      <h2>Відгуки на товар</h2>
      {reviews.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {reviews.map((i) => (
            <div
              key={i.id}
              className="flex items-center gap-4 rounded-xl border border-gray-500 p-2"
            >
              <div className="flex-1">
                <p className="font-medium">{i.client_name}</p>
                <p className="text-xs text-gray-400">{i.email}</p>
                <p title={i.comment} className="line-clamp-1 text-sm">
                  {i.comment}
                </p>
              </div>

              <span
                className={twMerge(
                  "rounded-full px-3 py-1 text-xs",
                  i.is_approved ? "bg-green-600 text-white" : "bg-yellow-500 text-black",
                )}
              >
                {i.is_approved ? "Погоджено" : "Очікує"}
              </span>

              {!i.is_approved && (
                <ButtonYellow
                  type="button"
                  className="text-[13px]"
                  onClick={() => approveReview(i.id)}
                >
                  Погодити
                </ButtonYellow>
              )}

              <ButtonXDellete onClick={() => deleteReview(i.id)} />
            </div>
          ))}
        </ul>
      ) : (
        <span>Відгуки відсутні</span>
      )}
    </div>
  );
}
