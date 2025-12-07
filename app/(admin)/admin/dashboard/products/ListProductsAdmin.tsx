"use client";

import ButtonYellow from "@/components/BattonYellow";
import { Product } from "@/db/schemas/product-schema";
import Image from "next/image";
import Link from "next/link";
import ButtonXDellete from "../ButtonXDellete";
import { useTransition } from "react";
import { deleteProductById } from "@/app/actions/product/delete-product";
import { toast } from "react-toastify";
import LinkYellow from "@/components/YellowLink";

export default function ListProductsAdmin({ products }: { products: Product[] }) {
  const [pending, startTransition] = useTransition();

  const handleDellProducts = async (id?: string) =>
    startTransition(async () => {
      const res = await deleteProductById(id);
      if (res.error) {
        console.error(res.error);
        toast.error("Помилка видалення товрау");
      }
    });

  return (
    <ul className="flex flex-col gap-3">
      {products.map((item) => (
        <li
          key={item.id}
          className="grid grid-cols-[50px_1fr_200px_200px_80px_180px] items-center justify-between gap-2 rounded-xl border border-gray-500 bg-background p-3"
        >
          <Link href={item.imgSrc} target="_blank">
            <Image
              src={item.imgSrc}
              alt={item.name}
              width={40}
              height={40}
              className="h-auto w-10"
            />
          </Link>
          <h2>{item.nameFull}</h2>
          {item.parent_product_id}
          <p className="capitalize">{item.category_slug}</p>
          <p className="capitalize">{item.brand_slug}</p>
          <span className="text-green">{item.price}</span>
          <div>
            <LinkYellow
              className="mr-3 text-[14px] font-light"
              href={`/admin/dashboard/products/${item.id}`}
              title="Редагувати"
            />
            <ButtonXDellete type="button" onClick={() => handleDellProducts(item.id)} />
          </div>
        </li>
      ))}
    </ul>
  );
}
