"use client";

import ButtonYellow from "@/components/BattonYellow";
import type { ProductType } from "@/db/schemas/product.schema";
import type { BrandTypes } from "@/types/brands.types";
import type { CategoryTypes } from "@/types/category.types";
import { use, useState } from "react";
import ListBundlesAdmin from "./ListBundlesAdmin";
import type { BundleListItem } from "./_bundle-list.types";
import ModalCreateBundle from "./ModalCreateBundle";

type BundleFetchResult = {
  success: boolean;
  data: BundleListItem[] | null;
  error: string | null;
};

type ProductFetchResult =
  | {
      success: true;
      data: ProductType[];
      errorCode: null;
      errorMessage: null;
    }
  | {
      success: false;
      data: null;
      errorCode: "DB_ERROR";
      errorMessage: string;
    };

type GetAllCategoriesResponse = Promise<
  | {
      success: true;
      data: CategoryTypes[];
      error: null;
    }
  | {
      success: false;
      error: unknown;
      data: [];
    }
>;

export default function ClientPageAllBundles({
  bundlesAction,
  productsAction,
  categoriesAction,
  brandsAction,
}: {
  bundlesAction: Promise<BundleFetchResult>;
  productsAction: Promise<ProductFetchResult>;
  categoriesAction: GetAllCategoriesResponse;
  brandsAction: Promise<{ success: boolean; data: BrandTypes[]; error?: unknown }>;
}) {
  const bundlesResponse = use(bundlesAction);
  const productsResponse = use(productsAction);
  const categoriesResponse = use(categoriesAction);
  const brandsResponse = use(brandsAction);
  const [isOpenCreateModal, setOpenCreateModal] = useState(false);

  const bundles = bundlesResponse.data ?? [];
  const products = (productsResponse.data ?? []).filter((item) => item.productType !== "bundle");
  const categories = categoriesResponse.success ? categoriesResponse.data : [];
  const brands = brandsResponse.success ? brandsResponse.data : [];

  return (
    <>
      <section className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-title">Комплекти</h1>
            <p className="admin-subtitle">Керування комплектами товарів</p>
          </div>

          <ButtonYellow
            className="admin-btn-primary px-4! py-2! text-sm!"
            onClick={() => setOpenCreateModal(true)}
          >
            Створити комплект
          </ButtonYellow>
        </div>

        {bundles.length > 0 ? (
          <ListBundlesAdmin
            bundles={bundles}
            products={products}
            categories={categories}
            brands={brands}
          />
        ) : (
          <div className="admin-empty">Комплектів ще немає.</div>
        )}
      </section>

      {isOpenCreateModal ? (
        <ModalCreateBundle
          products={products}
          categories={categories}
          brands={brands}
          onClose={() => setOpenCreateModal(false)}
        />
      ) : null}
    </>
  );
}
