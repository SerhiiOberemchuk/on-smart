"use client";

import { ProductType } from "@/db/schemas/product.schema";
import type { BrandTypes } from "@/types/brands.types";
import { CategoryTypes } from "@/types/category.types";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

export default function ListBundlesAdmin({
  bundles,
  products,
  categories,
  brands,
}: {
  bundles: ProductType[];
  products: ProductType[];
  categories: CategoryTypes[];
  brands: BrandTypes[];
}) {
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

  return (
    <ul className="flex flex-col gap-2">
      {bundles.map((bundle) => {
        const productIds = products
          .filter((product) => (product.bundleIds ?? []).includes(bundle.id))
          .map((product) => product.id);
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
                </div>

                {items.length > 0 ? (
                  <p className="mt-2 text-xs text-slate-400">Містить: {items.map((item) => item.nameFull).join(", ")}</p>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">Список товарів недоступний.</p>
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
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
