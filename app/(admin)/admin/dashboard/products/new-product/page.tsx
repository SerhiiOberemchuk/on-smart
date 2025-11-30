"use client";

import { addNewProduct } from "@/app/actions/product/add-new-product";
import { deleteFileFromS3, uploadFile } from "@/app/actions/files/uploadFile";
import ButtonYellow from "@/components/BattonYellow";
import { InputBlock } from "@/components/InputBloc";
import { useState } from "react";
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
  const [imageLink, setImageLink] = useState<string | null>(null);
  //   const [state, formAction, pending] = useActionState(addNewProduct, { ldfd: "dfd" });
  const handleUpload = async (formData: FormData) => {
    const result = await uploadFile({ file: formData.get("file") as File, sub_bucket: "products" });
    if (result.fileUrl) {
      setImageLink(result.fileUrl);
    }
    console.log(result);
  };
  return (
    <>
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
      <form action={handleUpload}>
        <legend>Завантаження картинки</legend>
        <input type="file" name="file" accept="image/*" />
        <button type="submit">Завантажити</button>
      </form>
      {imageLink && (
        <div className="mt-4 flex flex-col rounded-sm border border-white bg-background p-2">
          <p>Завантажено:</p>
          <a href={imageLink} target="_blank" rel="noopener noreferrer">
            {imageLink}
          </a>
          <button type="button" onClick={() => deleteFileFromS3(imageLink)}>
            Видалити картинки
          </button>
        </div>
      )}
    </>
  );
}
