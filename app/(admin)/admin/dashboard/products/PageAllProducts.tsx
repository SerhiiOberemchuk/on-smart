"use client";

import ButtonYellow from "@/components/BattonYellow";
import { ProductFetchResult } from "@/app/actions/product/get-all-products";
import { use } from "react";
import { useModalStore } from "../../store/modal-store";
import ListProductsAdmin from "./ListProductsAdmin";
import ModalAddNewPrduct from "./ModalAddNewPrduct";

export default function ClientPageAllProducts({
  productAction,
}: {
  productAction: Promise<ProductFetchResult>;
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
            className="admin-btn-primary !px-4 !py-2 !text-sm"
            onClick={() => {
              setType("product");
              openModal();
            }}
          >
            Додати товар
          </ButtonYellow>
        </div>

        {products.data?.length ? (
          <ListProductsAdmin products={products.data} />
        ) : (
          <div className="admin-empty">Товари не знайдено.</div>
        )}
      </section>

      {isOpen && <ModalAddNewPrduct />}
    </>
  );
}
