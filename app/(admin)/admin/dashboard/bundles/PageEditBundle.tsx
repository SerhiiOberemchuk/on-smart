"use client";

import { updateBundle } from "@/app/actions/bundles/update-bundle";
import { deleteFileFromS3, uploadFile } from "@/app/actions/files/uploadFile";
import ButtonYellow from "@/components/BattonYellow";
import {
  type BundleMetaIncludedProduct,
  type BundleMetaType,
} from "@/db/schemas/bundle-meta.schema";
import type { ProductInsertType, ProductType } from "@/db/schemas/product.schema";
import type { BrandTypes } from "@/types/brands.types";
import { CategoryTypes } from "@/types/category.types";
import slugify from "@sindresorhus/slugify";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { type SubmitErrorHandler, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FILE_MAX_SIZE } from "../categories/ModalCategoryForm";
import InputAdminStyle from "../InputComponent";
import SelectComponentAdmin from "../SelectComponent";
import TextAreaAdminComponent from "../TextAreaAdminComponent";

type SelectedFile = {
  file: File;
  preview: string;
};

type BundleFormValues = Pick<
  ProductInsertType,
  | "category_id"
  | "name"
  | "nameFull"
  | "slug"
  | "ean"
  | "lengthCm"
  | "widthCm"
  | "heightCm"
  | "weightKg"
  | "price"
  | "oldPrice"
  | "inStock"
  | "isOnOrder"
> & {
  brand_id: string;
  productSearch: string;
};

type IncludedProductMetaDraft = {
  quantity: number;
  shortDescription: string;
};

function buildIncludedMetaById(
  productIds: string[],
  includedProducts?: BundleMetaIncludedProduct[],
) {
  const includedById = new Map((includedProducts ?? []).map((item) => [item.productId, item]));
  return productIds.reduce<Record<string, IncludedProductMetaDraft>>((acc, productId) => {
    const includedMeta = includedById.get(productId);
    const quantity = Number(includedMeta?.quantity ?? 1);
    acc[productId] = {
      quantity: Number.isFinite(quantity) && quantity > 0 ? Math.trunc(quantity) : 1,
      shortDescription: includedMeta?.shortDescription ?? "",
    };
    return acc;
  }, {});
}

export default function PageEditBundle({
  bundle,
  bundleMeta,
  products,
  categories,
  brands,
  galleryImages,
}: {
  bundle: ProductType;
  bundleMeta: BundleMetaType | null;
  products: ProductType[];
  categories: CategoryTypes[];
  brands: BrandTypes[];
  galleryImages: string[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const initialProductIds = Array.from(
    new Set((bundleMeta?.includedProducts ?? []).map((item) => item.productId)),
  );
  const initialImages = Array.from(new Set([bundle.imgSrc, ...galleryImages].filter(Boolean)));
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(initialProductIds);
  const [includedMetaByProductId, setIncludedMetaByProductId] = useState<
    Record<string, IncludedProductMetaDraft>
  >(() => buildIncludedMetaById(initialProductIds, bundleMeta?.includedProducts));
  const [advantagesText, setAdvantagesText] = useState(() =>
    (bundleMeta?.advantages ?? []).join("\n"),
  );
  const [descriptionText, setDescriptionText] = useState(() => bundleMeta?.description ?? "");
  const [existingImages, setExistingImages] = useState<string[]>(initialImages);
  const [newFiles, setNewFiles] = useState<SelectedFile[]>([]);

  const { register, handleSubmit, setValue, watch } = useForm<BundleFormValues>({
    defaultValues: {
      category_id: bundle.category_id,
      brand_id:
        brands.find((brand) => brand.brand_slug === bundle.brand_slug && brand.id)?.id ?? "",
      name: bundle.name,
      nameFull: bundle.nameFull,
      slug: bundle.slug,
      ean: bundle.ean,
      lengthCm: String(bundle.lengthCm),
      widthCm: String(bundle.widthCm),
      heightCm: String(bundle.heightCm),
      weightKg: String(bundle.weightKg),
      price: String(bundle.price),
      oldPrice: bundle.oldPrice ? String(bundle.oldPrice) : "",
      inStock: Number(bundle.inStock) || 0,
      isOnOrder: Boolean(bundle.isOnOrder),
      productSearch: "",
    },
  });

  const productSearch = watch("productSearch");

  const availableProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return [];

    return products
      .filter((product) => product.productType !== "bundle")
      .filter((product) => !selectedProductIds.includes(product.id))
      .filter((product) => {
        const searchable =
          `${product.name} ${product.nameFull} ${product.slug} ${product.id} ${product.ean ?? ""}`.toLowerCase();
        return searchable.includes(query);
      })
      .slice(0, 20);
  }, [productSearch, products, selectedProductIds]);

  const selectedProducts = useMemo(
    () =>
      selectedProductIds
        .map((id) => products.find((product) => product.id === id))
        .filter(Boolean) as ProductType[],
    [products, selectedProductIds],
  );

  const handleAddProduct = (productId: string) => {
    setSelectedProductIds((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
    setIncludedMetaByProductId((prev) => {
      if (prev[productId]) return prev;
      return {
        ...prev,
        [productId]: {
          quantity: 1,
          shortDescription: "",
        },
      };
    });
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
    setIncludedMetaByProductId((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const handleChangeIncludedProductQuantity = (productId: string, value: string) => {
    const quantity = Number(value);
    setIncludedMetaByProductId((prev) => ({
      ...prev,
      [productId]: {
        quantity: Number.isFinite(quantity) && quantity > 0 ? Math.trunc(quantity) : 1,
        shortDescription: prev[productId]?.shortDescription ?? "",
      },
    }));
  };

  const handleChangeIncludedProductDescription = (productId: string, value: string) => {
    setIncludedMetaByProductId((prev) => ({
      ...prev,
      [productId]: {
        quantity: prev[productId]?.quantity ?? 1,
        shortDescription: value,
      },
    }));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleNewFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []).flatMap((file) => {
      if (file.size > FILE_MAX_SIZE) {
        toast.error(`Файл ${file.name} перевищує 2 МБ`);
        return [];
      }
      return [{ file, preview: URL.createObjectURL(file) }];
    });

    if (nextFiles.length > 0) {
      setNewFiles((prev) => [...prev, ...nextFiles]);
    }
    event.currentTarget.value = "";
  };

  const handleRemoveNewFile = (index: number) => {
    setNewFiles((prev) => {
      const target = prev[index];
      if (target) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const onSubmit: SubmitHandler<BundleFormValues> = (data) => {
    if (selectedProductIds.length === 0) {
      toast.warning("Оберіть хоча б один товар для комплекту");
      return;
    }

    if (existingImages.length + newFiles.length === 0) {
      toast.warning("Залиште або завантажте хоча б одне фото");
      return;
    }

    startTransition(async () => {
      let uploadedImages: string[] = [];
      try {
        const uploadResponses = await Promise.all(
          newFiles.map((item) => uploadFile({ file: item.file, sub_bucket: "products" })),
        );
        uploadedImages = uploadResponses.map((item) => item.fileUrl).filter(Boolean);
        if (uploadedImages.length !== newFiles.length) {
          toast.error("Не вдалося завантажити всі нові фото");
          return;
        }

        const finalImages = [...existingImages, ...uploadedImages];
        const { productSearch: _productSearch, ...bundleData } = data;
        const normalizedIncludedProducts = selectedProductIds.map((productId) => {
          const includedMeta = includedMetaByProductId[productId];
          const quantity = Number(includedMeta?.quantity ?? 1);
          return {
            productId,
            quantity: Number.isFinite(quantity) && quantity > 0 ? Math.trunc(quantity) : 1,
            shortDescription: includedMeta?.shortDescription?.trim() ?? "",
          };
        });
        const advantages = advantagesText
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);

        const response = await updateBundle({
          id: bundle.id,
          ...bundleData,
          productIds: selectedProductIds,
          imgSrc: finalImages,
          oldPrice: bundleData.oldPrice || null,
          bundleMeta: {
            includedProducts: normalizedIncludedProducts,
            advantages,
            description: descriptionText.trim(),
          },
        });

        if (!response.success) {
          if (uploadedImages.length > 0) {
            await Promise.allSettled(uploadedImages.map((imageUrl) => deleteFileFromS3(imageUrl)));
          }
          toast.error(response.error || "Не вдалося оновити комплект");
          return;
        }

        const removedImages = initialImages.filter(
          (imageUrl) => !existingImages.includes(imageUrl),
        );
        if (removedImages.length > 0) {
          await Promise.allSettled(removedImages.map((imageUrl) => deleteFileFromS3(imageUrl)));
        }

        for (const item of newFiles) {
          URL.revokeObjectURL(item.preview);
        }

        toast.success("Комплект оновлено");
        router.push("/admin/dashboard/bundles");
        router.refresh();
      } catch (error) {
        if (uploadedImages.length > 0) {
          await Promise.allSettled(uploadedImages.map((imageUrl) => deleteFileFromS3(imageUrl)));
        }
        console.error(error);
        toast.error("Не вдалося оновити комплект");
      }
    });
  };

  const onInvalid: SubmitErrorHandler<BundleFormValues> = () => {
    toast.warning("Заповніть обов'язкові поля");
  };

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Редагування комплекту</h1>
          <p className="admin-subtitle">{bundle.nameFull}</p>
        </div>

        <Link href="/admin/dashboard/bundles" className="admin-btn-secondary px-4! py-2! text-sm!">
          До списку комплектів
        </Link>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="admin-card admin-card-content space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="admin-grid-2">
              <InputAdminStyle
                input_title="Назва комплекту"
                required
                {...register("name", {
                  required: true,
                  onChange: (event) => {
                    const nextName = event.target.value;
                    const currentNameFull = watch("nameFull");
                    if (!currentNameFull.trim()) {
                      setValue("nameFull", nextName, { shouldDirty: true, shouldValidate: true });
                      setValue("slug", slugify(nextName), {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  },
                })}
              />

              <InputAdminStyle
                input_title="Повна назва комплекту"
                required
                {...register("nameFull", {
                  required: true,
                  onChange: (event) => {
                    setValue("slug", slugify(event.target.value), {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  },
                })}
              />
            </div>

            <div className="admin-grid-3">
              <SelectComponentAdmin
                selectTitle="Категорія"
                optionsTitle="-- Виберіть категорію --"
                options={categories.map((category) => ({
                  value: category.id,
                  name: category.name,
                }))}
                required
                {...register("category_id", { required: true })}
              />

              <SelectComponentAdmin
                selectTitle="Бренд"
                optionsTitle="-- Виберіть бренд --"
                options={brands
                  .filter((brand): brand is BrandTypes & { id: string } => Boolean(brand.id))
                  .map((brand) => ({ value: brand.id, name: brand.name }))}
                required
                {...register("brand_id", { required: true })}
              />

              <InputAdminStyle
                input_title="Слаг"
                required
                {...register("slug", {
                  required: true,
                  onChange: (event) => {
                    setValue("slug", slugify(event.target.value), {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  },
                })}
              />

              <InputAdminStyle
                input_title="EAN"
                required
                type="text"
                maxLength={14}
                placeholder="Обов'язково. Наприклад: 4820000000000"
                {...register("ean", { required: true, pattern: /^\d{8,14}$/ })}
              />
            </div>

            <div className="admin-grid-3">
              <InputAdminStyle
                input_title="Довжина, см"
                type="number"
                min={0}
                step={0.01}
                required
                {...register("lengthCm", { required: true })}
              />

              <InputAdminStyle
                input_title="Ширина, см"
                type="number"
                min={0}
                step={0.01}
                required
                {...register("widthCm", { required: true })}
              />

              <InputAdminStyle
                input_title="Висота, см"
                type="number"
                min={0}
                step={0.01}
                required
                {...register("heightCm", { required: true })}
              />
            </div>

            <div className="admin-grid-3">
              <InputAdminStyle
                input_title="Вага, кг"
                type="number"
                min={0}
                step={0.001}
                required
                {...register("weightKg", { required: true })}
              />

              <InputAdminStyle
                input_title="Поточна ціна"
                type="number"
                min={0}
                step={0.01}
                required
                {...register("price", { required: true })}
              />

              <InputAdminStyle
                input_title="Стара ціна"
                type="number"
                min={0}
                step={0.01}
                {...register("oldPrice")}
              />
            </div>

            <div className="admin-grid-2">
              <InputAdminStyle
                input_title="Доступна кількість"
                type="number"
                min={0}
                required
                {...register("inStock", {
                  required: true,
                  valueAsNumber: true,
                  min: 0,
                })}
              />

              <InputAdminStyle
                input_title="Під замовлення"
                type="checkbox"
                {...register("isOnOrder")}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-600/55 bg-slate-900/35 p-3">
              <p className="mb-2 text-sm font-semibold text-slate-100">Поточні фото</p>

              {existingImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {existingImages.map((imageUrl, index) => (
                    <div key={`${imageUrl}-${index}`} className="relative">
                      <button
                        type="button"
                        className="absolute top-1 right-1 z-10 rounded bg-slate-900/80 px-1.5 py-0.5 text-xs text-slate-100"
                        onClick={() => handleRemoveExistingImage(index)}
                      >
                        x
                      </button>
                      <Image
                        src={imageUrl}
                        alt={`Фото ${index + 1}`}
                        width={220}
                        height={220}
                        className="aspect-square w-full rounded border border-slate-600/60 object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Поточних фото немає.</p>
              )}
            </div>

            <div className="rounded-lg border border-slate-600/55 bg-slate-900/35 p-3">
              <p className="mb-2 text-sm font-semibold text-slate-100">Додати нові фото</p>

              <InputAdminStyle
                type="file"
                input_title="Завантажити фото"
                accept="image/*"
                multiple
                onChange={handleNewFileUpload}
              />

              {newFiles.length > 0 ? (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {newFiles.map((item, index) => (
                    <div key={`${item.file.name}-${index}`} className="relative">
                      <button
                        type="button"
                        className="absolute top-1 right-1 z-10 rounded bg-slate-900/80 px-1.5 py-0.5 text-xs text-slate-100"
                        onClick={() => handleRemoveNewFile(index)}
                      >
                        x
                      </button>
                      <Image
                        src={item.preview}
                        alt={item.file.name}
                        width={220}
                        height={220}
                        unoptimized
                        className="aspect-square w-full rounded border border-slate-600/60 object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-400">Нові фото не додані.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-600/55 bg-slate-900/35 p-3 xl:col-span-2">
            <p className="text-sm font-semibold text-slate-100">Товари в комплекті</p>
            <p className="mt-1 text-xs text-slate-400">
              Знайдіть товари за назвою, слагом, ID або EAN та додайте їх.
            </p>

            <div className="mt-3">
              <InputAdminStyle
                input_title="Пошук товарів"
                placeholder="Введіть запит для фільтрації..."
                {...register("productSearch")}
              />
            </div>

            <div className="mt-2 max-h-60 overflow-auto rounded-lg border border-slate-600/55">
              {productSearch.trim().length === 0 ? (
                <p className="px-3 py-2 text-xs text-slate-400">Введіть запит, щоб знайти товар.</p>
              ) : availableProducts.length > 0 ? (
                availableProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className="block w-full border-b border-slate-600/45 px-3 py-2 text-left text-sm text-slate-100 last:border-b-0 hover:bg-slate-800/60"
                    onClick={() => handleAddProduct(product.id)}
                  >
                    <span className="font-medium">{product.nameFull}</span>
                    <span className="ml-2 text-xs text-slate-400">{product.slug}</span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-xs text-slate-400">Товари не знайдено.</p>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {selectedProducts.length > 0 ? (
                selectedProducts.map((product) => (
                  <span key={product.id} className="admin-chip gap-2!">
                    <span>{product.nameFull}</span>
                    <button
                      type="button"
                      className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] hover:bg-slate-600"
                      onClick={() => handleRemoveProduct(product.id)}
                    >
                      Remove
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-400">No products selected yet.</p>
              )}
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm font-semibold text-slate-100">Складові комплекту</p>
              {selectedProducts.length > 0 ? (
                selectedProducts.map((product) => {
                  const includedMeta = includedMetaByProductId[product.id] ?? {
                    quantity: 1,
                    shortDescription: "",
                  };
                  return (
                    <div
                      key={`bundle-meta-${product.id}`}
                      className="rounded-lg border border-slate-600/55 bg-slate-950/35 p-3"
                    >
                      <p className="text-sm font-medium text-slate-100">{product.nameFull}</p>
                      <div className="mt-2 grid grid-cols-1 gap-3">
                        <InputAdminStyle
                          input_title="Кількість у комплекті"
                          type="number"
                          min={1}
                          step={1}
                          value={includedMeta.quantity}
                          onChange={(event) =>
                            handleChangeIncludedProductQuantity(product.id, event.target.value)
                          }
                        />
                        <TextAreaAdminComponent
                          label_title="Короткий опис товару в комплекті"
                          rows={3}
                          value={includedMeta.shortDescription}
                          onChange={(event) =>
                            handleChangeIncludedProductDescription(product.id, event.target.value)
                          }
                          placeholder="Наприклад: 2 камери для зовнішнього використання з нічним баченням та підтримкою Wi-Fi, ідеально підходять для моніторингу вашого будинку або бізнесу."
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400">
                  Складові комплекту не налаштовані. Додайте товари та вкажіть їх кількість і
                  короткий опис.
                </p>
              )}
            </div>

            <div className="mt-4">
              <TextAreaAdminComponent
                label_title="Переваги комплекту (по одному в ряд)"
                rows={5}
                value={advantagesText}
                onChange={(event) => setAdvantagesText(event.target.value)}
                placeholder={
                  "Наприклад:\n- Економія до 20% порівняно з покупкою окремих товарів\n- Ідеально підібрані товари, які доповнюють один одного\n- Зручність покупки всього необхідного в одному комплекті\n- Підтримка та гарантія від одного продавця"
                }
              />
            </div>

            <div className="mt-4">
              <TextAreaAdminComponent
                label_title="Опис комплекту (для сторінки та SEO)"
                rows={6}
                value={descriptionText}
                onChange={(event) => setDescriptionText(event.target.value)}
                placeholder="Детально опишіть призначення комплекту, ключові переваги та сценарії використання."
              />
            </div>
          </div>
        </div>

        <div className="admin-actions justify-end border-t border-slate-600/45 pt-3">
          <Link
            href="/admin/dashboard/bundles"
            className="admin-btn-secondary px-4! py-2! text-sm!"
          >
            Скасувати
          </Link>

          <ButtonYellow
            type="submit"
            className="admin-btn-primary px-4! py-2! text-sm!"
            disabled={isPending}
          >
            {isPending ? "Оновлення..." : "Зберегти зміни"}
          </ButtonYellow>
        </div>
      </form>
    </section>
  );
}
