"use client";
import ButtonYellow from "@/components/BattonYellow";
import { useModalStore } from "../../store/modal-store";
import ModalAddNewPrduct from "./ModalAddNewPrduct";
import { use } from "react";
import ListProductsAdmin from "./ListProductsAdmin";
import { ProductFetchResult } from "./page";

export default function ClientPageAllProducts({
  productAction,
}: {
  productAction: Promise<ProductFetchResult>;
}) {
  const products = use(productAction);
  const { setType, openModal, isOpen } = useModalStore();

  return (
    <>
      <div className="flex w-full flex-col gap-3 p-4">
        <ButtonYellow
          className="fixed top-2 left-1/2 mx-auto flex -translate-x-1/2"
          onClick={() => {
            setType("product");
            openModal();
          }}
        >
          Добавити новий товар
        </ButtonYellow>
        {products.data && <ListProductsAdmin products={products.data} />}
      </div>
      {isOpen && <ModalAddNewPrduct />}
    </>
  );
}
