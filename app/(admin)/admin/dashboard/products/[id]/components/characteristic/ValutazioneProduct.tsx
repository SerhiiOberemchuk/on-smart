"use client";

import { deleteProductReviewById } from "@/app/actions/product-reviews/delete-review";
import { getProductReviewsAdmin } from "@/app/actions/product-reviews/get-product-reviews";
import { updateProductReviewById } from "@/app/actions/product-reviews/update-review";
import ButtonYellow from "@/components/BattonYellow";
import { ProductReviewType } from "@/db/schemas/product-reviews.schema";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import ButtonXDellete from "../../../../ButtonXDellete";

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
    <div className="admin-card admin-card-content">
      <h2 className="mb-3 text-base font-semibold">Відгуки про товар</h2>

      {reviews.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {reviews.map((i) => (
            <li
              key={i.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-600/55 bg-slate-900/35 p-3 md:flex-row md:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{i.client_name}</p>
                <p className="text-xs text-slate-400">{i.email}</p>
                <p title={i.comment} className="mt-1 line-clamp-2 text-sm text-slate-200">
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

              {!i.is_approved ? (
                <ButtonYellow
                  type="button"
                  className="admin-btn-secondary !px-3 !py-1.5 !text-xs"
                  onClick={() => approveReview(i.id)}
                >
                  Погодити
                </ButtonYellow>
              ) : null}

              <ButtonXDellete className="h-8 w-8" onClick={() => deleteReview(i.id)} />
            </li>
          ))}
        </ul>
      ) : (
        <span className="text-sm text-slate-400">Відгуків поки немає</span>
      )}
    </div>
  );
}
