"use client";

import { use, useEffect, useMemo, useState, useTransition } from "react";
import { ProductType } from "@/db/schemas/product.schema";
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
import CharacteristicProductSection from "./characteristic/CharacteristicProductSection";
import { getAllProducts } from "@/app/actions/product/get-all-products";

export default function PageProductAdmin({ dataAction }: { dataAction: Promise<ProductType> }) {
  const product = use(dataAction);
  const mainPartDataProduct = objectFromPickedKeys(product, [
    "name",
    "nameFull",
    "brand_slug",
    "category_slug",
    "price",
    "oldPrice",
    "inStock",
    "isOnOrder",
    "category_id",
  ]);

  const [isPendingUlpoadMainFoto, startTransitionUpload] = useTransition();
  const [fotoToUpload, setFotoToUpload] = useState<File | null>(null);
  const { register, handleSubmit, watch } = useForm<typeof mainPartDataProduct>({
    defaultValues: mainPartDataProduct,
  });
  const [categories, setCategories] = useState<CategoryTypes[]>([]);
  const [bradns, setBrands] = useState<BrandTypes[]>([]);

  const [isPendengCategories, startTransitionCategory] = useTransition();

  const [isPendingUpdateProduct, startTransitionUpdateProduct] = useTransition();
  const [isPendengBrands, startTransitionBrands] = useTransition();
  const [isPendengProducts, startTransitionProducts] = useTransition();
  const [allProducts, setAllProducts] = useState<ProductType[]>([]);
  const [relatedProductsQuery, setRelatedProductsQuery] = useState("");
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(
    product.relatedProductIds ?? [],
  );

  const relatedProductCandidates = useMemo(() => {
    const normalizedQuery = relatedProductsQuery.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return allProducts
      .filter((item) => item.id !== product.id)
      .filter((item) => !relatedProductIds.includes(item.id))
      .filter((item) => {
        const searchableText = `${item.name} ${item.nameFull} ${item.slug} ${item.id}`.toLowerCase();
        return searchableText.includes(normalizedQuery);
      })
      .slice(0, 8);
  }, [allProducts, product.id, relatedProductIds, relatedProductsQuery]);

  const selectedRelatedProducts = useMemo(
    () =>
      relatedProductIds.map((id) => allProducts.find((item) => item.id === id)).filter(Boolean) as ProductType[],
    [allProducts, relatedProductIds],
  );

  const selectedRelatedProductsMap = useMemo(
    () => new Map(selectedRelatedProducts.map((item) => [item.id, item])),
    [selectedRelatedProducts],
  );

  const onSubmit: SubmitHandler<typeof mainPartDataProduct> = (data) => {
    if (!confirm("Ви впевнені що хочете оновити дані?")) {
      return;
    }
    const slug = watch("category_slug");
    const [category_id] = categories.filter((i) => i.category_slug === slug);

    const preparedData: Partial<Omit<ProductType, "id">> = {
      ...data,
      oldPrice: Number(data.oldPrice) ? data.oldPrice : null,
      category_id: category_id?.id ?? product.category_id,
      relatedProductIds,
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
        console.error(res.error);
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
        console.error(res.error);
        return;
      }
      setBrands(res.data);
    });
  }, []);
  useEffect(() => {
    startTransitionProducts(async () => {
      const res = await getAllProducts();
      if (!res.success || !res.data) {
        toast.error("Error fetch products");
        console.error(res.error);
        return;
      }
      setAllProducts(res.data);
    });
  }, []);

  const addRelatedProduct = (id: ProductType["id"]) => {
    setRelatedProductIds((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
    setRelatedProductsQuery("");
  };

  const removeRelatedProduct = (id: ProductType["id"]) => {
    setRelatedProductIds((prev) => prev.filter((itemId) => itemId !== id));
  };
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
            className={clsx("text-[14px] font-normal", isPendingUlpoadMainFoto && "animate-pulse")}
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
            {...register("isOnOrder")}
            // checked={product.toOrder}
            defaultChecked={product.isOnOrder}
            className="mb-0 flex items-center gap-3"
          />
        </div>
        {!product.parent_product_id &&<div>
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
        </div>}
        {!product.parent_product_id && (
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
        )}
        <div className="col-span-4 rounded-lg border border-neutral-700 bg-neutral-900 p-3">
          <p className="mb-2 text-sm font-medium text-white">Рекомендовані супутні товари</p>
          <p className="mb-3 text-xs text-neutral-400">
            Пошук по назві, slug або ID. Обрані товари будуть використовуватись як рекомендації
            “можливо клієнт забув купити”.
          </p>

          <InputAdminStyle
            input_title="Пошук товару"
            value={relatedProductsQuery}
            onChange={(e) => setRelatedProductsQuery(e.target.value)}
            placeholder="Введіть декілька букв назви..."
          />

          {isPendengProducts ? (
            <p className="mt-2 text-xs text-neutral-400">Завантаження товарів...</p>
          ) : relatedProductsQuery.trim() ? (
            <div className="mt-2 max-h-64 overflow-auto rounded border border-neutral-700">
              {relatedProductCandidates.length ? (
                relatedProductCandidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    className="block w-full border-b border-neutral-700 px-3 py-2 text-left text-sm text-white last:border-b-0 hover:bg-neutral-800"
                    onClick={() => addRelatedProduct(candidate.id)}
                  >
                    <span className="font-medium">{candidate.name}</span>
                    <span className="ml-2 text-xs text-neutral-400">{candidate.slug}</span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-xs text-neutral-400">Нічого не знайдено</p>
              )}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            {relatedProductIds.length === 0 ? (
              <p className="text-xs text-neutral-400">Супутні товари ще не додані</p>
            ) : (
              relatedProductIds.map((id) => {
                const selectedProduct = selectedRelatedProductsMap.get(id);
                const title = selectedProduct
                  ? `${selectedProduct.name} (${selectedProduct.slug})`
                  : `ID: ${id}`;

                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-600 bg-neutral-800 px-3 py-1 text-xs text-white"
                  >
                    {title}
                    <button
                      type="button"
                      className="rounded bg-neutral-700 px-1.5 py-0.5 text-[10px] hover:bg-neutral-600"
                      onClick={() => removeRelatedProduct(id)}
                    >
                      Видалити
                    </button>
                  </span>
                );
              })
            )}
          </div>
        </div>

        <div className="text-[14px] font-light">
          <ButtonYellow
            type="submit"
            className="text-[14px] font-normal"
            disabled={isPendingUpdateProduct}
          >
            {isPendingUpdateProduct ? "Оновлення..." : "Зберегти зміни"}
          </ButtonYellow>
        </div>
      </form>
      {!product.parent_product_id && (
        <>
          <FotoGaleryProduct id={product.id} />
          <CharacteristicProductSection id={product.id} category_id={product.category_id} />
        </>
      )}
    </div>
  );
}
