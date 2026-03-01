"use client";

import { createBundle } from "@/app/actions/bundles/create-bundle";
import { uploadFile } from "@/app/actions/files/uploadFile";
import ButtonYellow from "@/components/BattonYellow";
import { type BundleMetaIncludedProduct } from "@/db/schemas/bundle-meta.schema";
import type { ProductInsertType, ProductType } from "@/db/schemas/product.schema";
import type { BrandTypes } from "@/types/brands.types";
import { CategoryTypes } from "@/types/category.types";
import slugify from "@sindresorhus/slugify";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { type SubmitErrorHandler, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import ButtonXDellete from "../ButtonXDellete";
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

export default function ModalCreateBundle({
  products,
  categories,
  brands,
  onClose,
}: {
  products: ProductType[];
  categories: CategoryTypes[];
  brands: BrandTypes[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [includedMetaByProductId, setIncludedMetaByProductId] = useState<
    Record<string, IncludedProductMetaDraft>
  >({});
  const [advantagesText, setAdvantagesText] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [files, setFiles] = useState<SelectedFile[]>([]);

  const { register, handleSubmit, setValue, watch, reset } = useForm<BundleFormValues>({
    defaultValues: {
      category_id: "",
      brand_id: "",
      name: "",
      nameFull: "",
      slug: "",
      ean: "",
      lengthCm: "",
      widthCm: "",
      heightCm: "",
      weightKg: "",
      price: "",
      oldPrice: "",
      inStock: 1,
      isOnOrder: false,
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

  const closeModal = () => {
    for (const item of files) {
      URL.revokeObjectURL(item.preview);
    }

    setFiles([]);
    setSelectedProductIds([]);
    setIncludedMetaByProductId({});
    setAdvantagesText("");
    setDescriptionText("");
    reset();
    onClose();
  };

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []).flatMap((file) => {
      if (file.size > FILE_MAX_SIZE) {
        toast.error(`Файл ${file.name} перевищує 2 МБ`);
        return [];
      }

      return [{ file, preview: URL.createObjectURL(file) }];
    });

    if (nextFiles.length > 0) {
      setFiles((prev) => [...prev, ...nextFiles]);
    }

    event.currentTarget.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => {
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

    if (files.length === 0) {
      toast.warning("Завантажте хоча б одне фото");
      return;
    }

    startTransition(async () => {
      try {
        const uploadResponses = await Promise.all(
          files.map((item) => uploadFile({ file: item.file, sub_bucket: "products" })),
        );

        const imgSrc = uploadResponses.map((item) => item.fileUrl).filter(Boolean);
        if (imgSrc.length !== files.length) {
          toast.error("Не вдалося завантажити всі фото");
          return;
        }

        const { productSearch: _productSearch, ...bundleData } = data;
        const normalizedIncludedProducts: BundleMetaIncludedProduct[] = selectedProductIds.map(
          (productId) => {
            const includedMeta = includedMetaByProductId[productId];
            const quantity = Number(includedMeta?.quantity ?? 1);
            return {
              productId,
              quantity: Number.isFinite(quantity) && quantity > 0 ? Math.trunc(quantity) : 1,
              shortDescription: includedMeta?.shortDescription?.trim() ?? "",
            };
          },
        );
        const advantages = advantagesText
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);

        const response = await createBundle({
          ...bundleData,
          productIds: selectedProductIds,
          imgSrc,
          oldPrice: bundleData.oldPrice || null,
          bundleMeta: {
            includedProducts: normalizedIncludedProducts,
            advantages,
            description: descriptionText.trim(),
          },
        });

        if (!response.success) {
          toast.error(response.error || "Не вдалося створити комплект");
          return;
        }

        toast.success("Комплект створено");
        closeModal();
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error("Не вдалося створити комплект");
      }
    });
  };

  const onInvalid: SubmitErrorHandler<BundleFormValues> = () => {
    toast.warning("Заповніть обов'язкові поля");
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal max-w-6xl">
        <div className="admin-modal-header">
          <h2 className="text-base font-semibold">Створити новий комплект</h2>
          <ButtonXDellete type="button" onClick={closeModal} className="h-8 w-8" />
        </div>

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="admin-modal-content">
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
                        setValue("nameFull", nextName, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });

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
                    .map((brand) => ({
                      value: brand.id,
                      name: brand.name,
                    }))}
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
                  {...register("ean", {
                    required: true,
                    pattern: /^\d{8,14}$/,
                  })}
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
                <p className="mb-2 text-sm font-semibold text-slate-100">Фото комплекту</p>

                <InputAdminStyle
                  type="file"
                  input_title="Завантажити фото"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                />

                {files.length > 0 ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {files.map((item, index) => (
                      <div key={`${item.file.name}-${index}`} className="relative">
                        <button
                          type="button"
                          className="absolute top-1 right-1 z-10 rounded bg-slate-900/80 px-1.5 py-0.5 text-xs text-slate-100"
                          onClick={() => handleRemoveFile(index)}
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
                  <p className="mt-2 text-xs text-slate-400">Додайте хоча б одне фото.</p>
                )}
              </div>

              <div className="rounded-lg border border-slate-600/55 bg-slate-900/35 p-3">
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
                    <p className="px-3 py-2 text-xs text-slate-400">
                      Введіть запит, щоб знайти товар.
                    </p>
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
                          Видалити
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">Товари ще не вибрані.</p>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  <p className="text-sm font-semibold text-slate-100">Деталі товарів у комплекті</p>
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
                              label_title="Короткий опис для цього товару"
                              rows={3}
                              value={includedMeta.shortDescription}
                              onChange={(event) =>
                                handleChangeIncludedProductDescription(product.id, event.target.value)
                              }
                              placeholder="Наприклад: Основна IP-камера для зовнішнього монтажу."
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400">
                      Додайте товари, щоб налаштувати кількість та короткий опис.
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <TextAreaAdminComponent
                    label_title="Переваги комплекту (кожна з нового рядка)"
                    rows={5}
                    value={advantagesText}
                    onChange={(event) => setAdvantagesText(event.target.value)}
                    placeholder={
                      "Risparmio del 15%\nProdotti gia compatibili\nInstallazione semplice\nConfigurazione pronta"
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
          </div>

          <div className="admin-actions justify-end border-t border-slate-600/45 pt-3">
            <ButtonYellow
              type="button"
              className="admin-btn-secondary px-4! py-2! text-sm!"
              onClick={closeModal}
            >
              Скасувати
            </ButtonYellow>

            <ButtonYellow
              type="submit"
              className="admin-btn-primary px-4! py-2! text-sm!"
              disabled={isPending}
            >
              {isPending ? "Створення..." : "Створити комплект"}
            </ButtonYellow>
          </div>
        </form>
      </div>
    </div>
  );
}
