"use client";

import { getAllBrands } from "@/app/actions/brands/brand-actions";
import { getAllCategoryProducts } from "@/app/actions/category/category-actions";
import { deleteFileFromS3, uploadFile } from "@/app/actions/files/uploadFile";
import { getAllProducts } from "@/app/actions/product/get-all-products";
import { updateProductById } from "@/app/actions/product/update-product";
import ButtonYellow from "@/components/BattonYellow";
import { ProductType } from "@/db/schemas/product.schema";
import { BrandTypes } from "@/types/brands.types";
import { CategoryTypes } from "@/types/category.types";
import clsx from "clsx";
import Image from "next/image";
import { use, useEffect, useMemo, useState, useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FILE_MAX_SIZE } from "../../../categories/ModalCategoryForm";
import InputAdminStyle from "../../../InputComponent";
import SelectComponentAdmin from "../../../SelectComponent";
import { objectFromPickedKeys } from "../../helpers/objectFromPickedKeys";
import CharacteristicProductSection from "./characteristic/CharacteristicProductSection";
import FotoGaleryProduct from "./FotoGaleryProduct";

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
  const [allProducts, setAllProducts] = useState<ProductType[]>([]);

  const [isPendengCategories, startTransitionCategory] = useTransition();
  const [isPendingUpdateProduct, startTransitionUpdateProduct] = useTransition();
  const [isPendengBrands, startTransitionBrands] = useTransition();
  const [isPendengProducts, startTransitionProducts] = useTransition();

  const [relatedProductsQuery, setRelatedProductsQuery] = useState("");
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(product.relatedProductIds ?? []);

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
    () => relatedProductIds.map((id) => allProducts.find((item) => item.id === id)).filter(Boolean) as ProductType[],
    [allProducts, relatedProductIds],
  );

  const selectedRelatedProductsMap = useMemo(
    () => new Map(selectedRelatedProducts.map((item) => [item.id, item])),
    [selectedRelatedProducts],
  );

  const onSubmit: SubmitHandler<typeof mainPartDataProduct> = (data) => {
    if (!confirm("Оновити дані товару?")) return;

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
          toast.warning("Не вдалося оновити товар");
          return;
        }

        toast.success("Товар оновлено");
      } catch (error) {
        console.error(error);
        toast.error("Не вдалося оновити товар");
      }
    });
  };

  useEffect(() => {
    startTransitionCategory(async () => {
      const res = await getAllCategoryProducts();
      if (!res.success) {
        toast.error("Помилка завантаження категорій");
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
        toast.error("Помилка завантаження брендів");
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
        toast.error("Помилка завантаження товарів");
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
      toast.error("Файл перевищує 2 МБ");
      return;
    }

    setFotoToUpload(file);
  };

  const handlUploadFoto = () =>
    startTransitionUpload(async () => {
      if (!fotoToUpload) {
        toast.warning("Спочатку оберіть головне фото");
        return;
      }

      try {
        const respDell = await deleteFileFromS3(product.imgSrc);
        if (!respDell.success) {
          toast.error("Не вдалося видалити попереднє зображення");
          console.error(respDell.error);
          return;
        }
      } catch (error) {
        console.error(error);
        toast.error("Не вдалося видалити попереднє зображення");
      }

      try {
        const response = await uploadFile({ file: fotoToUpload, sub_bucket: "products" });
        if (response.$metadata.httpStatusCode !== 200) {
          toast.error("Не вдалося завантажити нове зображення");
          return;
        }

        const resupdate = await updateProductById({
          id: product.id,
          data: { imgSrc: response.fileUrl },
        });

        if (!resupdate.success) {
          toast.error("Не вдалося зберегти зображення товару");
          return;
        }

        toast.success("Головне фото оновлено");
        setFotoToUpload(null);
      } catch (error) {
        console.error(error);
        toast.error("Не вдалося завантажити нове зображення");
      }
    });

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Товар: {product.nameFull}</h1>
          <p className="admin-subtitle">Редагування даних, медіа та характеристик</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="admin-card admin-card-content space-y-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className="admin-grid-2">
              <InputAdminStyle input_title="Назва" {...register("name")} defaultValue={product.name} />
              <InputAdminStyle
                input_title="Повна назва"
                {...register("nameFull")}
                defaultValue={product.nameFull}
              />
            </div>

            <div className="admin-grid-3">
              <InputAdminStyle
                input_title="Ціна"
                type="number"
                min={0}
                step={0.01}
                {...register("price")}
                defaultValue={product.price}
              />
              <InputAdminStyle
                input_title="Стара ціна"
                type="number"
                min={0}
                step={0.01}
                {...register("oldPrice")}
                defaultValue={product.oldPrice || ""}
              />
              <InputAdminStyle
                input_title="Кількість в наявності"
                type="number"
                min={0}
                {...register("inStock")}
                defaultValue={product.inStock}
              />
            </div>

            <InputAdminStyle
              input_title="Товар під замовлення"
              type="checkbox"
              {...register("isOnOrder")}
              defaultChecked={product.isOnOrder}
            />

            {!product.parent_product_id ? (
              <div className="admin-grid-2">
                <div>
                  {isPendengCategories ? (
                    <p className="text-sm text-slate-400">Завантаження категорій...</p>
                  ) : (
                    <SelectComponentAdmin
                      selectTitle="Категорія"
                      optionsTitle="-- Виберіть категорію --"
                      options={categories.map((item) => ({
                        value: item.category_slug as string,
                        name: item.name,
                      }))}
                      required
                      defaultValue={product.category_slug}
                      {...register("category_slug", { required: true })}
                    />
                  )}
                </div>

                <div>
                  {isPendengBrands ? (
                    <p className="text-sm text-slate-400">Завантаження брендів...</p>
                  ) : (
                    <SelectComponentAdmin
                      selectTitle="Бренд"
                      optionsTitle="-- Виберіть бренд --"
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
              </div>
            ) : null}
          </div>

          <div className="admin-card admin-card-content space-y-3">
            <p className="text-sm font-semibold text-slate-100">Головне фото</p>
            <Image
              src={product.imgSrc}
              width={326}
              height={326}
              alt="Головне зображення"
              className="mx-auto aspect-square h-auto w-full max-w-[326px] rounded-lg border border-slate-600/55 object-cover object-center"
            />
            <InputAdminStyle
              input_title="Завантажити нове фото"
              type="file"
              accept="image/*"
              onChange={(e) => prepareFileUpload(e)}
            />
            <ButtonYellow
              type="button"
              disabled={!fotoToUpload}
              className={clsx("admin-btn-secondary w-full !text-sm", isPendingUlpoadMainFoto && "animate-pulse")}
              onClick={handlUploadFoto}
            >
              {isPendingUlpoadMainFoto ? "Збереження..." : "Зберегти головне фото"}
            </ButtonYellow>
          </div>
        </div>

        <div className="admin-card admin-card-content">
          <p className="mb-2 text-sm font-semibold text-slate-100">Супутні рекомендовані товари</p>
          <p className="mb-3 text-xs text-slate-400">
            Пошук за назвою, слагом або ID. Обрані товари показуються клієнту в блоці "Купують разом".
          </p>

          <InputAdminStyle
            input_title="Пошук товару"
            value={relatedProductsQuery}
            onChange={(e) => setRelatedProductsQuery(e.target.value)}
            placeholder="Введіть кілька символів..."
          />

          {isPendengProducts ? (
            <p className="mt-2 text-xs text-slate-400">Завантаження товарів...</p>
          ) : relatedProductsQuery.trim() ? (
            <div className="mt-2 max-h-64 overflow-auto rounded-lg border border-slate-600/55 bg-slate-900/35">
              {relatedProductCandidates.length ? (
                relatedProductCandidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    className="block w-full border-b border-slate-600/45 px-3 py-2 text-left text-sm text-slate-100 last:border-b-0 hover:bg-slate-800/60"
                    onClick={() => addRelatedProduct(candidate.id)}
                  >
                    <span className="font-medium">{candidate.name}</span>
                    <span className="ml-2 text-xs text-slate-400">{candidate.slug}</span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-xs text-slate-400">Товари не знайдено</p>
              )}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            {relatedProductIds.length === 0 ? (
              <p className="text-xs text-slate-400">Супутні товари ще не обрані.</p>
            ) : (
              relatedProductIds.map((id) => {
                const selectedProduct = selectedRelatedProductsMap.get(id);
                const title = selectedProduct ? `${selectedProduct.name} (${selectedProduct.slug})` : `ID: ${id}`;

                return (
                  <span key={id} className="admin-chip !gap-2">
                    <span>{title}</span>
                    <button
                      type="button"
                      className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] hover:bg-slate-600"
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

        <div className="admin-actions justify-end border-t border-slate-600/45 pt-3">
          <ButtonYellow type="submit" className="admin-btn-primary !px-4 !py-2 !text-sm" disabled={isPendingUpdateProduct}>
            {isPendingUpdateProduct ? "Оновлення..." : "Зберегти зміни"}
          </ButtonYellow>
        </div>
      </form>

      {!product.parent_product_id ? (
        <>
          <FotoGaleryProduct id={product.id} />
          <CharacteristicProductSection id={product.id} category_id={product.category_id} />
        </>
      ) : null}
    </section>
  );
}
