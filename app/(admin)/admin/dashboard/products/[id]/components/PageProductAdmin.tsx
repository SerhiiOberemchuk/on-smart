"use client";

import { use, useEffect, useState, useTransition } from "react";
import { Product } from "@/db/schemas/product-schema";
import { SubmitHandler, useForm } from "react-hook-form";
import InputAdminStyle from "../../../InputComponent";
import ButtonYellow from "@/components/BattonYellow";
import SelectComponentAdmin from "../../../SelectComponent";
import { CategoryTypes } from "@/types/category.types";
import { BrandTypes } from "@/types/brands.types";
import { getAllCategoryProducts } from "@/app/actions/category/category-actions";
import { toast } from "react-toastify";
import { getAllBrands } from "@/app/actions/brands/brand-actions";
import Image from "next/image";
import { FILE_MAX_SIZE } from "../../../categories/ModalCategoryForm";
import { deleteFileFromS3, uploadFile } from "@/app/actions/files/uploadFile";
import { updateProductById } from "@/app/actions/product/update-product";
import clsx from "clsx";
import { objectFromPickedKeys } from "../../helpers/objectFromPickedKeys";
import FotoGaleryProduct from "./FotoGaleryProduct";

export default function PageProductAdmin({ dataAction }: { dataAction: Promise<Product> }) {
  const product = use(dataAction);
  const mainPartDataProduct = objectFromPickedKeys(product, [
    "name",
    "nameFull",
    "brand_slug",
    "category_slug",
    "price",
    "oldPrice",
    "inStock",
    "toOrder",
  ]);
  const [isPendingUlpoadMainFoto, startTransitionUpload] = useTransition();
  const [fotoToUpload, setFotoToUpload] = useState<File | null>(null);
  const { register, handleSubmit } = useForm<typeof mainPartDataProduct>({
    defaultValues: mainPartDataProduct,
  });
  const [categories, setCategories] = useState<CategoryTypes[]>([]);
  const [bradns, setBrands] = useState<BrandTypes[]>([]);

  const [isPendengCategories, startTransitionCategory] = useTransition();

  const [isPendingUpdateProduct, startTransitionUpdateProduct] = useTransition();
  const [isPendengBrands, startTransitionBrands] = useTransition();

  const onSubmit: SubmitHandler<typeof mainPartDataProduct> = (data) => {
    if (!confirm("Ви впевнені що хочете оновити дані?")) {
      return;
    }
    const preparedData: typeof mainPartDataProduct = {
      ...data,
      oldPrice: Number(data.oldPrice) ? data.oldPrice : null,
    };
    startTransitionUpdateProduct(async () => {
      try {
        const updateResponse = await updateProductById({ id: product.id, data: preparedData });
        if (!updateResponse.success) {
          console.error(updateResponse.error);
          toast.warning("Помилка оновлення товару");
        }
        toast.success("Товар успішно оновлено");
      } catch (error) {
        console.error(error);
        toast.error("Помилка оновлення товару");
      }
    });
  };
  useEffect(() => {
    startTransitionCategory(async () => {
      const res = await getAllCategoryProducts();
      if (!res.success) {
        toast.error("Error fetch categories");
        return;
      }
      setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    startTransitionBrands(async () => {
      const res = await getAllBrands();
      if (!res.success) {
        toast.error("Error fetch brands");
        return;
      }
      setBrands(res.data);
    });
  }, []);
  const prepareFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    if (file.size > FILE_MAX_SIZE) {
      toast.error("Розмір файлу перевищує 2 МБ");
      return;
    }

    setFotoToUpload(file);
  };
  const handlUploadFoto = () =>
    startTransitionUpload(async () => {
      if (!fotoToUpload) {
        toast.warning("Не вибрано головне фото для оновлення");
        return;
      }
      try {
        const respDell = await deleteFileFromS3(product.imgSrc);
        if (!respDell.success) {
          toast.error("Помилка видалення старого фото");
          console.error(respDell.error);
          return;
        } else {
          toast.success("Старе фото видалено");
        }
      } catch (error) {
        console.error(error);
        toast.error("Помилка видалення сторго фото");
      }
      try {
        const response = await uploadFile({ file: fotoToUpload, sub_bucket: "products" });
        if (response.$metadata.httpStatusCode !== 200) {
          toast.error("Не вдалося зберегти нове фото");
        } else {
          toast.success("Нове фото успішно збережено");
        }
        const resupdate = await updateProductById({
          id: product.id,
          data: { imgSrc: response.fileUrl },
        });
        if (resupdate.success) {
          toast.success("Продукт оновлено");
          setFotoToUpload(null);
          // setImageMain(response.fileUrl);
        } else {
          toast.error("Помилка оновлення продукту");
        }
      } catch (error) {
        console.error(error);
        toast.error("Не вдалося зберегти нове фото");
      }
    });
  return (
    <div className="w-full p-3">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-4 gap-3 rounded-xl border border-gray-500 p-3"
      >
        <h2>Основні дані товару</h2>
        <div className="col-start-1 col-end-3">
          <InputAdminStyle input_title="Назва" {...register("name")} defaultValue={product.name} />
        </div>
        <div className="col-start-3 col-end-5 row-start-1 row-end-8 flex flex-col items-center justify-center rounded-xl bg-background">
          <Image
            src={product.imgSrc}
            width={326}
            height={326}
            alt="Main image"
            className="aspect-square h-auto w-[326px] object-cover object-center"
          />
          <InputAdminStyle
            input_title="Завантажити фото"
            type="file"
            accept="image/*"
            onChange={(e) => prepareFileUpload(e)}
          />
          <ButtonYellow
            disabled={fotoToUpload ? false : true}
            className={clsx(isPendingUlpoadMainFoto && "animate-pulse")}
            onClick={handlUploadFoto}
          >
            {isPendingUlpoadMainFoto ? "Збереження..." : "Зберегти нове фото"}
          </ButtonYellow>
        </div>
        <div className="col-start-1 col-end-3">
          <InputAdminStyle
            input_title="Повна назва"
            {...register("nameFull")}
            defaultValue={product.nameFull}
          />
        </div>

        <div>
          <InputAdminStyle
            input_title="Основна ціна"
            type="number"
            min={0}
            step={0.01}
            {...register("price")}
            defaultValue={product.price}
          />
        </div>
        <div>
          <InputAdminStyle
            input_title="Стара ціна"
            type="number"
            min={0}
            step={0.01}
            {...register("oldPrice")}
            defaultValue={product.oldPrice || ""}
          />
        </div>

        <div>
          <InputAdminStyle
            input_title="Доступно до замовлення"
            type="number"
            min={0}
            {...register("inStock")}
            defaultValue={product.inStock}
          />
        </div>
        <div className="flex items-center justify-center">
          <InputAdminStyle
            input_title="Товар під замовлення"
            type="checkbox"
            {...register("toOrder")}
            // checked={product.toOrder}
            defaultChecked={product.toOrder}
            className="mb-0 flex items-center gap-3"
          />
        </div>
        <div>
          {isPendengCategories ? (
            <p>Завантаження...</p>
          ) : (
            <SelectComponentAdmin
              selectTitle="Категорія товару"
              optionsTitle="-- Виберіть категорію --"
              options={categories.map((item) => ({
                value: item.category_slug as string,
                name: item.name,
              }))}
              required
              defaultValue={product.category_slug}
              {...register("category_slug", { required: true })}
            />
          )}{" "}
        </div>
        <div>
          {isPendengBrands ? (
            <p>Завантаження...</p>
          ) : (
            <SelectComponentAdmin
              selectTitle="Бренд товару"
              optionsTitle="--Виберіть бренд--"
              options={bradns.map((item) => ({
                value: item.brand_slug as string,
                name: item.name,
              }))}
              required
              defaultValue={product.brand_slug}
              {...register("brand_slug", { required: true })}
            />
          )}
        </div>

        <div className="text-[14px] font-light">
          <ButtonYellow type="submit" disabled={isPendingUpdateProduct}>
            {isPendingUpdateProduct ? "Оновлення..." : "Зберегти зміни"}
          </ButtonYellow>
        </div>
      </form>
      <FotoGaleryProduct id={product.id} />
    </div>
  );
}
