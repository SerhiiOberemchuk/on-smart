"use client";

import Image from "next/image";
import Link from "next/link";
import ButtonXDellete from "../ButtonXDellete";
import { deleteProductById } from "@/app/actions/product/delete-product";
import { toast } from "react-toastify";
import LinkYellow from "@/components/YellowLink";
import { Product } from "@/db/schemas/product";
import { useState } from "react";
import ModalAddVariant from "./ModalCreateVariant";

export default function ListProductsAdmin({ products }: { products: Product[] }) {
  const [openedProductId, setOpenedProductId] = useState<string | null>(null);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [parentProduct, setParentProduct] = useState<{ id: string; slug: string } | null>(null);

  const openVariantModal = (product: Product) => {
    setParentProduct({ id: product.id, slug: product.slug });
    setVariantModalOpen(true);
  };

  const closeVariantModal = () => {
    setVariantModalOpen(false);
    setParentProduct(null);
  };

  const handleDellProducts = async (id: string) => {
    const res = await deleteProductById(id);
    if (res.error) {
      console.error(res.error);
      toast.error("Помилка видалення товару");
    } else {
      toast.success("Товар видалено");
    }
  };

  return (
    <>
      <ul className="flex flex-col gap-3">
        {products.map((item) => {
          const variants = products.filter((p) => p.parent_product_id === item.id);
          const hasVariants = variants.length > 0;

          return (
            <li key={item.id} className="rounded-xl border border-gray-500 bg-background">
              <div className="grid grid-cols-[50px_1fr_200px_200px_40px_120px_280px] items-center gap-2 p-3">
                <Link href={item.imgSrc} target="_blank">
                  <Image
                    src={item.imgSrc}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="h-auto w-10"
                  />
                </Link>

                <div className="flex items-center gap-2">
                  {hasVariants && (
                    <button
                      className="text-[20px] leading-none text-amber-400"
                      onClick={() =>
                        setOpenedProductId(openedProductId === item.id ? null : item.id)
                      }
                    >
                      {openedProductId === item.id ? "▾" : "▸"}
                    </button>
                  )}

                  <h2>{item.nameFull}</h2>
                </div>

                <p className="capitalize">{item.category_slug}</p>
                <p className="capitalize">{item.brand_slug}</p>
                <div>{item.isOnOrder && <div>⏳</div>}</div>
                <div className="flex justify-around">
                  <span className="text-green">{item.price}</span>
                  {item.oldPrice && <span className="text-red">{item.oldPrice}</span>}
                </div>

                <div className="flex items-center justify-between">
                  <LinkYellow
                    className="text-[14px] font-light"
                    href={`/admin/dashboard/products/${item.id}`}
                    title="Редагувати"
                  />

                  <button
                    onClick={() => openVariantModal(item)}
                    className="text-[14px] font-light text-amber-400 hover:underline"
                  >
                    Додати варіант
                  </button>

                  {hasVariants ? (
                    <div
                      className="cursor-not-allowed text-gray-500"
                      title="Неможливо видалити товар, він має варіанти"
                    >
                      🔒
                    </div>
                  ) : (
                    <ButtonXDellete
                      type="button"
                      className="shrink-0"
                      onClick={() => handleDellProducts(item.id)}
                    />
                  )}
                </div>
              </div>

              {openedProductId === item.id && hasVariants && (
                <ul className="mr-3 mb-3 ml-10 flex flex-col gap-2 border-l border-gray-600 pl-5">
                  {variants.map((v) => (
                    <li
                      key={v.id}
                      className="grid grid-cols-[40px_1fr_150px_150px_40px_120px_150px] items-center gap-2 rounded-lg border border-gray-600 p-2"
                    >
                      <Image
                        src={v.imgSrc}
                        width={35}
                        height={35}
                        alt={v.name}
                        className="rounded"
                      />

                      <p className="text-sm">{v.nameFull}</p>

                      <p className="text-xs capitalize">{v.category_slug}</p>
                      <p className="text-xs capitalize">{v.brand_slug}</p>
                      <div>{v.isOnOrder && <div>⏳</div>}</div>
                      <div className="flex justify-around">
                        <span className="text-green">{v.price}</span>
                        {v.oldPrice && <span className="text-red">{v.oldPrice}</span>}
                      </div>
                      <div className="flex justify-end gap-3">
                        <LinkYellow
                          href={`/admin/dashboard/products/${v.id}`}
                          title="Редагувати"
                          className="text-[12px] font-normal"
                        />

                        <ButtonXDellete type="button" onClick={() => handleDellProducts(v.id)} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      {variantModalOpen && parentProduct && (
        <ModalAddVariant
          parent={parentProduct}
          isOpen={variantModalOpen}
          onClose={closeVariantModal}
        />
      )}
    </>
  );
}
