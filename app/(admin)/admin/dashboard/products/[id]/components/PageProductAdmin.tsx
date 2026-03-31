"use client";

import { deleteFileFromS3, uploadFile } from "@/app/actions/files/uploadFile";
import { updateProductById } from "@/app/actions/product/update-product";
import ButtonYellow from "@/components/BattonYellow";
import { ProductType } from "@/db/schemas/product.schema";
import { BrandTypes } from "@/types/brands.types";
import { CategoryTypes } from "@/types/category.types";
import Image from "next/image";
import { use, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FILE_MAX_SIZE } from "../../../categories/ModalCategoryForm";
import InputAdminStyle from "../../../InputComponent";
import SelectComponentAdmin from "../../../SelectComponent";
import { objectFromPickedKeys } from "../../helpers/objectFromPickedKeys";
import CharacteristicProductSection from "./characteristic/CharacteristicProductSection";
import FotoGaleryProduct from "./FotoGaleryProduct";
import {
  PRODUCT_SAVE_ALL_ACTIVITY_EVENT,
  PRODUCT_SAVE_ALL_RESULT_EVENT,
  reportProductSaveAllResult,
  runProductSaveAll,
} from "./save-all.helpers";

type PageProductAdminProps = {
  dataAction: Promise<ProductType>;
  categoriesAction: Promise<CategoryTypes[]>;
  brandsAction: Promise<BrandTypes[]>;
  allProductsAction: Promise<ProductType[]>;
};

export default function PageProductAdmin({
  dataAction,
  categoriesAction,
  brandsAction,
  allProductsAction,
}: PageProductAdminProps) {
  const product = use(dataAction);
  const categories = use(categoriesAction);
  const brands = use(brandsAction);
  const allProducts = use(allProductsAction);
  const mainPartDataProduct = objectFromPickedKeys(product, [
    "name",
    "nameFull",
    "slug",
    "brand_slug",
    "category_slug",
    "price",
    "oldPrice",
    "ean",
    "lengthCm",
    "widthCm",
    "heightCm",
    "weightKg",
    "inStock",
    "isOnOrder",
    "isHidden",
    "category_id",
  ]);

  const [fotoToUpload, setFotoToUpload] = useState<File | null>(null);
  const { register, handleSubmit, watch } = useForm<typeof mainPartDataProduct>({
    defaultValues: mainPartDataProduct,
  });

  const [isPendingUpdateProduct, startTransitionUpdateProduct] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);

  const [relatedProductsQuery, setRelatedProductsQuery] = useState("");
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(
    product.relatedProductIds ?? [],
  );
  const isSaveConfirmedRef = useRef(false);
  const [isSaveAllRequested, setIsSaveAllRequested] = useState(false);
  const [pendingChildSaves, setPendingChildSaves] = useState(0);
  const [saveAllErrors, setSaveAllErrors] = useState<string[]>([]);

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
      relatedProductIds
        .map((id) => allProducts.find((item) => item.id === id))
        .filter(Boolean) as ProductType[],
    [allProducts, relatedProductIds],
  );

  const selectedRelatedProductsMap = useMemo(
    () => new Map(selectedRelatedProducts.map((item) => [item.id, item])),
    [selectedRelatedProducts],
  );

  const onSubmit: SubmitHandler<typeof mainPartDataProduct> = (data) => {
    if (!isSaveConfirmedRef.current) {
      toast.warning('Підтвердіть дію через кнопку "Зберегти все"');
      return;
    }
    isSaveConfirmedRef.current = false;

    const hasValue = (value: unknown) => value !== null && value !== undefined && `${value}`.trim() !== "";
    if (
      !hasValue(data.ean) ||
      !hasValue(data.lengthCm) ||
      !hasValue(data.widthCm) ||
      !hasValue(data.heightCm) ||
      !hasValue(data.weightKg)
    ) {
      reportProductSaveAllResult({
        emit: (eventName, detail) => document.dispatchEvent(new CustomEvent(eventName, { detail })),
        status: "error",
        message: "Заповніть EAN, габарити та вагу товару",
      });
      return;
    }

    const slug = watch("category_slug");
    const [category] = categories.filter((i) => i.category_slug === slug);
    const normalizedEan = data.ean.trim();

    const preparedData: Partial<Omit<ProductType, "id">> = {
      ...data,
      oldPrice: Number(data.oldPrice) ? data.oldPrice : null,
      ean: normalizedEan,
      category_id: category?.id ?? product.category_id,
      relatedProductIds,
    };

    startTransitionUpdateProduct(async () => {
      try {
        if (fotoToUpload) {
          const removeResponse = await deleteFileFromS3(product.imgSrc);
          if (!removeResponse.success) {
            reportProductSaveAllResult({
              emit: (eventName, detail) => document.dispatchEvent(new CustomEvent(eventName, { detail })),
              status: "error",
              message: "Не вдалося видалити попереднє зображення",
            });
            return;
          }

          const uploadResponse = await uploadFile({ file: fotoToUpload, sub_bucket: "products" });
          if (uploadResponse.$metadata.httpStatusCode !== 200 || !uploadResponse.fileUrl) {
            reportProductSaveAllResult({
              emit: (eventName, detail) => document.dispatchEvent(new CustomEvent(eventName, { detail })),
              status: "error",
              message: "Не вдалося завантажити нове зображення",
            });
            return;
          }

          preparedData.imgSrc = uploadResponse.fileUrl;
        }

        const updateResponse = await updateProductById({ id: product.id, data: preparedData });
        if (!updateResponse.success) {
          console.error(updateResponse.error);
          reportProductSaveAllResult({
            emit: (eventName, detail) => document.dispatchEvent(new CustomEvent(eventName, { detail })),
            status: "error",
            message: "Не вдалося оновити основні дані товару",
          });
          return;
        }
        reportProductSaveAllResult({
          emit: (eventName, detail) => document.dispatchEvent(new CustomEvent(eventName, { detail })),
          status: "success",
        });
        setFotoToUpload(null);
      } catch (error) {
        console.error(error);
        reportProductSaveAllResult({
          emit: (eventName, detail) => document.dispatchEvent(new CustomEvent(eventName, { detail })),
          status: "error",
          message: "Помилка під час оновлення товару",
        });
      }
    });
  };

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

  const handleSaveAll = () => {
    const toastId = "confirm-save-all-product";
    toast.dismiss(toastId);
    toast.info(
      <div className="flex flex-col gap-3">
        <p className="text-sm">Підтвердити збереження всіх змін товару?</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="admin-btn-primary px-3! py-1.5! text-xs!"
            onClick={() => {
              toast.dismiss(toastId);
              isSaveConfirmedRef.current = true;
              setIsSaveAllRequested(true);
              setPendingChildSaves(0);
              setSaveAllErrors([]);
              runProductSaveAll({
                emit: (eventName) => document.dispatchEvent(new Event(eventName)),
                submit: () => formRef.current?.requestSubmit(),
              });
            }}
          >
            Підтвердити
          </button>
          <button
            type="button"
            className="admin-btn-secondary px-3! py-1.5! text-xs!"
            onClick={() => toast.dismiss(toastId)}
          >
            Скасувати
          </button>
        </div>
      </div>,
      {
        toastId,
        autoClose: false,
        closeOnClick: false,
      },
    );
  };

  useEffect(() => {
    const listener = (event: Event) => {
      const delta = (event as CustomEvent<{ delta?: number }>).detail?.delta;
      if (typeof delta !== "number") return;
      setPendingChildSaves((prev) => Math.max(0, prev + delta));
    };

    document.addEventListener(PRODUCT_SAVE_ALL_ACTIVITY_EVENT, listener as EventListener);
    return () =>
      document.removeEventListener(PRODUCT_SAVE_ALL_ACTIVITY_EVENT, listener as EventListener);
  }, []);

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ status?: "success" | "error"; message?: string }>).detail;
      if (detail?.status === "error") {
        setSaveAllErrors((prev) => (detail.message ? [...prev, detail.message] : prev));
      }
    };

    document.addEventListener(PRODUCT_SAVE_ALL_RESULT_EVENT, listener as EventListener);
    return () =>
      document.removeEventListener(PRODUCT_SAVE_ALL_RESULT_EVENT, listener as EventListener);
  }, []);

  useEffect(() => {
    if (isSaveAllRequested && !isPendingUpdateProduct && pendingChildSaves === 0) {
      if (saveAllErrors.length > 0) {
        const uniq = Array.from(new Set(saveAllErrors));
        toast.error(`Не вдалося зберегти:\n${uniq.map((m) => `• ${m}`).join("\n")}`, {
          autoClose: 8000,
        });
      } else {
        toast.success("Усі зміни успішно збережено");
      }
      setIsSaveAllRequested(false);
    }
  }, [isPendingUpdateProduct, isSaveAllRequested, pendingChildSaves, saveAllErrors]);

  const isSavingAll = isPendingUpdateProduct || (isSaveAllRequested && pendingChildSaves > 0);

  return (
    <section className="admin-page relative">
      {isSavingAll ? (
        <div className="absolute inset-0 z-40 rounded-xl bg-slate-950/55 backdrop-blur-[1px]">
          <div className="flex h-full items-start justify-center pt-24">
            <p className="rounded-md border border-slate-600/70 bg-slate-900/90 px-4 py-2 text-sm text-slate-100">
              Збереження... Зачекайте, будь ласка
            </p>
          </div>
        </div>
      ) : null}

      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Товар: {product.nameFull}</h1>
          <p className="admin-subtitle">Редагування даних, медіа та характеристик</p>
        </div>
      </div>

      <form id="product-edit-form" ref={formRef} onSubmit={handleSubmit(onSubmit)} className="admin-card admin-card-content space-y-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className="admin-grid-2">
              <InputAdminStyle input_title="Назва" {...register("name")} defaultValue={product.name} />
              <InputAdminStyle input_title="Повна назва" {...register("nameFull")} defaultValue={product.nameFull} />
            </div>

            <InputAdminStyle input_title="Слаг" {...register("slug", { required: true })} defaultValue={product.slug} />

            <div className="admin-grid-3">
              <InputAdminStyle input_title="Ціна" type="number" min={0} step={0.01} {...register("price")} defaultValue={product.price} />
              <InputAdminStyle input_title="Стара ціна" type="number" min={0} step={0.01} {...register("oldPrice")} defaultValue={product.oldPrice || ""} />
              <InputAdminStyle input_title="Кількість в наявності" type="number" min={0} {...register("inStock")} defaultValue={product.inStock} />
            </div>

            <InputAdminStyle input_title="Товар під замовлення" type="checkbox" {...register("isOnOrder")} defaultChecked={product.isOnOrder} />
            <InputAdminStyle input_title="Приховати товар на сайті" type="checkbox" {...register("isHidden")} defaultChecked={product.isHidden} />

            {!product.parent_product_id ? (
              <div className="admin-grid-2">
                <div>
                  <SelectComponentAdmin
                    selectTitle="Категорія"
                    optionsTitle="-- Виберіть категорію --"
                    options={categories.map((item) => ({ value: item.category_slug as string, name: item.name }))}
                    required
                    defaultValue={product.category_slug}
                    {...register("category_slug", { required: true })}
                  />
                </div>

                <div>
                  <SelectComponentAdmin
                    selectTitle="Бренд"
                    optionsTitle="-- Виберіть бренд --"
                    options={brands.map((item) => ({ value: item.brand_slug as string, name: item.name }))}
                    required
                    defaultValue={product.brand_slug}
                    {...register("brand_slug", { required: true })}
                  />
                </div>
              </div>
            ) : null}

            <div className="admin-grid-2">
              <InputAdminStyle
                input_title="EAN (штрихкод)"
                type="text"
                required
                maxLength={14}
                placeholder="Напр. 4820000000000"
                {...register("ean", { required: true })}
                defaultValue={product.ean ?? ""}
              />
            </div>

            <div className="admin-grid-3">
              <InputAdminStyle input_title="Довжина, см" type="number" min={0} step={0.01} required {...register("lengthCm", { required: true })} defaultValue={product.lengthCm ?? ""} />
              <InputAdminStyle input_title="Ширина, см" type="number" min={0} step={0.01} required {...register("widthCm", { required: true })} defaultValue={product.widthCm ?? ""} />
              <InputAdminStyle input_title="Висота, см" type="number" min={0} step={0.01} required {...register("heightCm", { required: true })} defaultValue={product.heightCm ?? ""} />
            </div>

            <div className="admin-grid-3">
              <InputAdminStyle input_title="Вага, кг" type="number" min={0} step={0.001} required {...register("weightKg", { required: true })} defaultValue={product.weightKg ?? ""} />
            </div>
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
            <InputAdminStyle input_title="Завантажити нове фото" type="file" accept="image/*" onChange={(e) => prepareFileUpload(e)} />
            {fotoToUpload ? <p className="text-xs text-amber-300">Нове головне фото буде збережено кнопкою "Зберегти все".</p> : null}
          </div>
        </div>

        <div className="admin-card admin-card-content">
          <p className="mb-2 text-sm font-semibold text-slate-100">Супутні рекомендовані товари</p>
          <p className="mb-3 text-xs text-slate-400">Пошук за назвою, слагом або ID. Обрані товари показуються клієнту в блоці "Купують разом".</p>

          <InputAdminStyle input_title="Пошук товару" value={relatedProductsQuery} onChange={(e) => setRelatedProductsQuery(e.target.value)} placeholder="Введіть кілька символів..." />

          {relatedProductsQuery.trim() ? (
            <div className="mt-2 max-h-64 overflow-auto rounded-lg border border-slate-600/55 bg-slate-900/35">
              {relatedProductCandidates.length ? (
                relatedProductCandidates.map((candidate) => (
                  <button key={candidate.id} type="button" className="block w-full border-b border-slate-600/45 px-3 py-2 text-left text-sm text-slate-100 last:border-b-0 hover:bg-slate-800/60" onClick={() => addRelatedProduct(candidate.id)}>
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
                  <span key={id} className="admin-chip gap-2!">
                    <span>{title}</span>
                    <button type="button" className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] hover:bg-slate-600" onClick={() => removeRelatedProduct(id)}>
                      Видалити
                    </button>
                  </span>
                );
              })
            )}
          </div>
        </div>
      </form>

      <div className="fixed right-4 bottom-4 z-50">
        <ButtonYellow type="button" className="admin-btn-primary px-4! py-2! text-sm! shadow-lg" disabled={isSavingAll} onClick={handleSaveAll}>
          {isSavingAll ? "Оновлення..." : "Зберегти все"}
        </ButtonYellow>
      </div>

      {!product.parent_product_id ? (
        <>
          <FotoGaleryProduct id={product.id} />
          <CharacteristicProductSection id={product.id} category_id={product.category_id} />
        </>
      ) : null}
    </section>
  );
}
