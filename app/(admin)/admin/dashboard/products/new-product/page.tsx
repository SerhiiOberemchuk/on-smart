"use client";

import { addNewProduct } from "@/app/actions/product/add-new-product";
import ButtonYellow from "@/components/BattonYellow";
import { InputBlock } from "@/components/InputBloc";
// import { Product } from "@/types/product.types";
import { useFormStatus } from "react-dom";
// import { useActionState } from "react";

export default function NewProductPage() {
  //   const product: Omit<Product, "id"> = {
  //     brand: "string",
  //     name: "string",
  //     description: "string",
  //     imgSrc: "string",
  //     category: "string",
  //     quantity: 5,
  //     rating: 5,
  //     inStock: 5,
  //     price: 100,
  //     images: ["string"],
  //     logo: "string",
  //     variants: [
  //       {
  //         id: "string",
  //       },
  //     ],
  //   };
  const { pending } = useFormStatus();
  //   const [state, formAction, pending] = useActionState(addNewProduct, { ldfd: "dfd" });
  return (
    <form action={addNewProduct} className="flex flex-col gap-2 p-5">
      <InputBlock title="Назва" required name="name" />
      <InputBlock title="Бренд" required name="brand" />
      <InputBlock title="Категорія" required name="category" />
      <InputBlock title="Опис" required name="description" />
      <InputBlock title="Зображення" required name="imgSrc" />
      <InputBlock title="Ціна" required name="price" />
      <InputBlock title="Кількість на складі" required name="inStock" type="number" />
      <ButtonYellow type="submit" disabled={pending} className="mt-4">
        {pending ? "Створюється..." : "Створити"}
      </ButtonYellow>
    </form>
  );
}
