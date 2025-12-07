"use client";
import ButtonYellow from "@/components/BattonYellow";
import { useModalStore } from "../../store/modal-store";
import ModalAddNewPrduct from "./ModalAddNewPrduct";
import { useEffect, useState } from "react";
import { Product } from "@/db/schemas/product-schema";
import { getAllProducts } from "@/app/actions/product/get-all-products";
import ListProductsAdmin from "./ListProductsAdmin";

export default function ProductsPage() {
  const { setType, openModal, isOpen } = useModalStore();
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    const fetchProd = async () => {
      try {
        const res = await getAllProducts();
        if (!res.data) {
          return;
        }

        setProducts(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProd();
  }, []);
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
        {products && <ListProductsAdmin products={products} />}
      </div>
      {isOpen && <ModalAddNewPrduct />}
    </>
  );
}
