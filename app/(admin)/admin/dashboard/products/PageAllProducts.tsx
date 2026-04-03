"use client";

import ButtonYellow from "@/components/BattonYellow";
import type { ProductType } from "@/db/schemas/product.schema";
import { use } from "react";
import { useModalStore } from "../../store/modal-store";
import ListProductsAdmin from "./ListProductsAdmin";
import ModalAddNewPrduct from "./ModalAddNewPrduct";

type ProductListResponse =
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

export default function ClientPageAllProducts({
  productAction,
}: {
  productAction: Promise<ProductListResponse>;
}) {
  const products = use(productAction);
  const { setType, openModal, isOpen } = useModalStore();

  return (
    <>
      <section className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-title">Товари</h1>
            <p className="admin-subtitle">Керування товарами та варіантами</p>
          </div>

          <ButtonYellow
            className="admin-btn-primary px-4! py-2! text-sm!"
            onClick={() => {
              setType("product");
              openModal();
            }}
          >
            Додати товар
          </ButtonYellow>
        </div>

        {products.data?.length ? (
          <ListProductsAdmin products={products.data.filter((p) => p.productType === "product")} />
        ) : (
          <div className="admin-empty">Товари не знайдено.</div>
        )}
      </section>

      {isOpen && <ModalAddNewPrduct />}
    </>
  );
}
