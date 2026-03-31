"use client";

import { copyBundleById } from "@/app/actions/bundles/copy-bundle";
import { deleteBundleById } from "@/app/actions/bundles/delete-bundle";
import type { BundleListItem } from "@/app/actions/bundles/get-all-bundles";
import { ProductType } from "@/db/schemas/product.schema";
import type { BrandTypes } from "@/types/brands.types";
import { CategoryTypes } from "@/types/category.types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "react-toastify";

export default function ListBundlesAdmin({
  bundles,
  products,
  categories,
  brands,
}: {
  bundles: BundleListItem[];
  products: ProductType[];
  categories: CategoryTypes[];
  brands: BrandTypes[];
}) {
  const router = useRouter();
  const [isCopyPending, startCopyTransition] = useTransition();
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const productById = useMemo(() => new Map(products.map((item) => [item.id, item])), [products]);
  const categoryById = useMemo(() => new Map(categories.map((item) => [item.id, item])), [categories]);
  const brandBySlug = useMemo(
    () =>
      new Map(
        brands
          .filter((item): item is BrandTypes & { brand_slug: string } => Boolean(item.brand_slug))
          .map((item) => [item.brand_slug, item]),
      ),
    [brands],
  );

  const handleCopyBundle = (id: string) => {
    setCopyingId(id);
    startCopyTransition(async () => {
      try {
        const response = await copyBundleById(id);
        if (!response.success || !response.id) {
          toast.error(response.error || "Не вдалося скопіювати комплект");
          return;
        }

        toast.success("Копію комплекту створено");
        router.push(`/admin/dashboard/bundles/${response.id}`);
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error("Не вдалося скопіювати комплект");
      } finally {
        setCopyingId(null);
      }
    });
  };

  const handleDeleteBundle = async (id: string) => {
    const confirmed = confirm("Видалити комплект?");
    if (!confirmed) return;

    try {
      const response = await deleteBundleById(id);
      if (!response.success) {
        toast.error(response.error || "Не вдалося видалити комплект");
        return;
      }

      toast.success("Комплект видалено");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Не вдалося видалити комплект");
    }
  };

  return (
    <ul className="flex flex-col gap-2">
      {bundles.map((bundle) => {
        const productIds = products
          .filter((product) => (product.bundleIds ?? []).includes(bundle.id))
          .map((product) => product.id);
        const reviews = bundle.bundleMeta?.reviews ?? [];
        const reviewCount = reviews.length;
        const reviewsPreview = reviews.slice(0, 3);
        const photos = bundle.imgSrc ? [bundle.imgSrc] : [];
        const category = categoryById.get(bundle.category_id);
        const brand = brandBySlug.get(bundle.brand_slug);
        const items = productIds
          .map((id) => productById.get(id))
          .filter(Boolean) as ProductType[];

        return (
          <li key={bundle.id} className="admin-card admin-card-content admin-card-hover p-3! sm:p-4!">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[72px_minmax(0,1fr)_auto] lg:items-center">
              <div className="shrink-0">
                {photos[0] ? (
                  <Image
                    src={photos[0]}
                    alt={bundle.nameFull}
                    width={72}
                    height={72}
                    className="h-[72px] w-[72px] rounded-md border border-slate-600/70 object-cover"
                  />
                ) : (
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-md border border-slate-600/70 text-xs text-slate-400">
                    Немає фото
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h2 className="line-clamp-2 text-[1.05rem] leading-tight font-semibold text-slate-100">
                  {bundle.nameFull}
                </h2>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="admin-chip">Слаг: {bundle.slug}</span>
                  <span className="admin-chip">Категорія: {category?.name ?? bundle.category_id}</span>
                  <span className="admin-chip">Бренд: {brand?.name ?? bundle.brand_slug}</span>
                  <span className="admin-chip">EAN: {bundle.ean}</span>
                  <span className="admin-chip">Залишок: {bundle.inStock}</span>
                  <span className="admin-chip">
                    Розміри, см: {bundle.lengthCm} x {bundle.widthCm} x {bundle.heightCm}
                  </span>
                  <span className="admin-chip">Вага, кг: {bundle.weightKg}</span>
                  <span className="admin-chip">Товарів у комплекті: {productIds.length}</span>
                  <span className="admin-chip">Відгуків: {reviewCount}</span>
                </div>

                {items.length > 0 ? (
                  <p className="mt-2 text-xs text-slate-400">Містить: {items.map((item) => item.nameFull).join(", ")}</p>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">Список товарів недоступний.</p>
                )}

                {reviewsPreview.length > 0 ? (
                  <ul className="mt-1 flex flex-col gap-1 text-xs text-slate-400">
                    {reviewsPreview.map((review) => (
                      <li key={review.id}>
                        {review.client_name}: {review.rating}/5
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">Відгуків поки немає.</p>
                )}
              </div>

              <div className="flex flex-col items-start gap-1 lg:items-end">
                <span className="text-[1.1rem] leading-none font-semibold text-emerald-500">{bundle.price}</span>
                {bundle.oldPrice ? (
                  <span className="text-sm leading-none text-red-500 line-through">{bundle.oldPrice}</span>
                ) : null}
                <Link
                  href={`/admin/dashboard/bundles/${bundle.id}`}
                  className="admin-btn-secondary mt-2 !px-3 !py-1.5 !text-xs"
                >
                  Редагувати
                </Link>
                <button
                  type="button"
                  className="admin-btn-secondary mt-1 !px-3 !py-1.5 !text-xs"
                  onClick={() => handleCopyBundle(bundle.id)}
                  disabled={isCopyPending && copyingId === bundle.id}
                >
                  {isCopyPending && copyingId === bundle.id ? "Копіювання..." : "Копіювати"}
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary mt-1 !px-3 !py-1.5 !text-xs"
                  onClick={() => handleDeleteBundle(bundle.id)}
                >
                  Видалити
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
