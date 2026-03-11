"use client";

import { updateBundle } from "@/app/actions/bundles/update-bundle";
import { deleteBundleReview } from "@/app/actions/bundles/delete-bundle-review";
import { deleteFileFromS3, uploadFile } from "@/app/actions/files/uploadFile";
import ButtonYellow from "@/components/BattonYellow";
import {
  type BundleMetaDocument,
  type BundleMetaIncludedProduct,
  type BundleMetaReview,
  type BundleMetaType,
} from "@/db/schemas/bundle-meta.schema";
import type { ProductInsertType, ProductType } from "@/db/schemas/product.schema";
import type { BrandTypes } from "@/types/brands.types";
import { CategoryTypes } from "@/types/category.types";
import slugify from "@sindresorhus/slugify";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
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

function parseArrayFromUnknown(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeDocuments(value: unknown): BundleMetaDocument[] {
  return parseArrayFromUnknown(value)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Record<string, unknown>;
      return {
        title: String(raw.title ?? ""),
        link: String(raw.link ?? ""),
      };
    })
    .filter(Boolean) as BundleMetaDocument[];
}

function normalizeReviews(value: unknown): BundleMetaReview[] {
  return parseArrayFromUnknown(value)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Record<string, unknown>;
      return {
        id: String(raw.id ?? ""),
        client_name: String(raw.client_name ?? ""),
        email: String(raw.email ?? ""),
        rating: Number(raw.rating ?? 5),
        comment: String(raw.comment ?? ""),
        created_at: String(raw.created_at ?? ""),
      };
    })
    .filter((item): item is BundleMetaReview => Boolean(item && item.id.trim().length > 0));
}

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
  const [documents, setDocuments] = useState<BundleMetaDocument[]>(() =>
    normalizeDocuments(bundleMeta?.documents),
  );
  const [reviews, setReviews] = useState<BundleMetaReview[]>(() =>
    normalizeReviews(bundleMeta?.reviews),
  );
  const [uploadingDocumentCount, setUploadingDocumentCount] = useState(0);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>(initialImages);
  const [newFiles, setNewFiles] = useState<SelectedFile[]>([]);
  const initialDocumentLinksRef = useRef<Set<string>>(
    new Set(normalizeDocuments(bundleMeta?.documents).map((item) => item.link.trim()).filter(Boolean)),
  );
  const uploadedDocumentLinksRef = useRef<Set<string>>(new Set());

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

  const handleAddDocument = () => {
    setDocuments((prev) => [...prev, { title: "", link: "" }]);
  };

  const handleChangeDocument = (
    index: number,
    field: keyof BundleMetaDocument,
    value: string,
  ) => {
    setDocuments((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleRemoveDocument = async (index: number) => {
    const targetLink = documents[index]?.link?.trim() ?? "";
    setDocuments((prev) => prev.filter((_, itemIndex) => itemIndex !== index));

    if (targetLink && uploadedDocumentLinksRef.current.has(targetLink)) {
      await deleteFileFromS3(targetLink);
      uploadedDocumentLinksRef.current.delete(targetLink);
    }
  };

  const handleUploadDocumentFile = async (index: number, file?: File) => {
    if (!file) return;
    const previousLink = documents[index]?.link?.trim() ?? "";
    setUploadingDocumentCount((prev) => prev + 1);
    try {
      const response = await uploadFile({ file, sub_bucket: "files" });
      if (!response.fileUrl) {
        toast.error("Не вдалося завантажити документ");
        return;
      }

      if (previousLink && previousLink !== response.fileUrl && uploadedDocumentLinksRef.current.has(previousLink)) {
        await deleteFileFromS3(previousLink);
        uploadedDocumentLinksRef.current.delete(previousLink);
      }

      uploadedDocumentLinksRef.current.add(response.fileUrl);

      setDocuments((prev) =>
        prev.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                title: item.title.trim() || file.name.replace(/\.[^/.]+$/, ""),
                link: response.fileUrl,
              }
            : item,
        ),
      );
      toast.success("Документ завантажено");
    } catch (error) {
      console.error(error);
      toast.error("Не вдалося завантажити документ");
    } finally {
      setUploadingDocumentCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!reviewId) return;
    setDeletingReviewId(reviewId);
    try {
      const response = await deleteBundleReview({ bundleId: bundle.id, reviewId });
      if (!response.success) {
        toast.error(response.error || "Не вдалося видалити відгук");
        return;
      }

      setReviews((prev) => prev.filter((item) => item.id !== reviewId));
      toast.success("Відгук видалено");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Не вдалося видалити відгук");
    } finally {
      setDeletingReviewId(null);
    }
  };

  const cleanupUnsavedDocumentUploads = async () => {
    const uploadedLinks = Array.from(uploadedDocumentLinksRef.current);
    if (uploadedLinks.length === 0) return;

    await Promise.allSettled(uploadedLinks.map((url) => deleteFileFromS3(url)));
    uploadedDocumentLinksRef.current.clear();
  };

  const handleCancel = async () => {
    await cleanupUnsavedDocumentUploads();

    for (const item of newFiles) {
      URL.revokeObjectURL(item.preview);
    }

    router.push("/admin/dashboard/bundles");
    router.refresh();
  };

  const onSubmit: SubmitHandler<BundleFormValues> = (data) => {
    if (uploadingDocumentCount > 0) {
      toast.warning("Дочекайтеся завершення завантаження документів");
      return;
    }

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
        const normalizedDocuments = documents
          .map((item) => ({
            title: item.title.trim(),
            link: item.link.trim(),
          }))
          .filter((item) => item.title.length > 0 && item.link.length > 0);
        const hasIncompleteDocuments = documents.some((item) => {
          const hasTitle = item.title.trim().length > 0;
          const hasLink = item.link.trim().length > 0;
          return (hasTitle || hasLink) && !(hasTitle && hasLink);
        });
        if (hasIncompleteDocuments) {
          toast.warning("Для кожного документа заповніть і назву, і посилання");
          return;
        }
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
            documents: normalizedDocuments,
            reviews,
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

        const currentDocumentLinks = new Set(normalizedDocuments.map((item) => item.link.trim()).filter(Boolean));
        const removedPersistedDocumentLinks = Array.from(initialDocumentLinksRef.current).filter(
          (link) => !currentDocumentLinks.has(link),
        );
        if (removedPersistedDocumentLinks.length > 0) {
          await Promise.allSettled(removedPersistedDocumentLinks.map((link) => deleteFileFromS3(link)));
        }

        uploadedDocumentLinksRef.current.clear();

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

        <Link
          href="/admin/dashboard/bundles"
          className="admin-btn-secondary px-4! py-2! text-sm!"
          onClick={(event) => {
            event.preventDefault();
            void handleCancel();
          }}
        >
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

            <div className="mt-4 rounded-lg border border-slate-600/55 bg-slate-950/35 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-100">Документи комплекту</p>
                <ButtonYellow
                  type="button"
                  className="admin-btn-secondary px-3! py-1.5! text-xs!"
                  onClick={handleAddDocument}
                >
                  Додати документ
                </ButtonYellow>
              </div>

              {documents.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {documents.map((document, index) => (
                    <div
                      key={`bundle-document-${index}`}
                      className="rounded border border-slate-600/55 p-3"
                    >
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                        <InputAdminStyle
                          input_title="Назва документа"
                          value={document.title}
                          onChange={(event) => handleChangeDocument(index, "title", event.target.value)}
                        />
                        <InputAdminStyle
                          input_title="Посилання на документ"
                          value={document.link}
                          onChange={(event) => handleChangeDocument(index, "link", event.target.value)}
                          placeholder="https://..."
                        />
                        <InputAdminStyle
                          input_title="Файл"
                          type="file"
                          onChange={(event) =>
                            handleUploadDocumentFile(index, event.target.files?.[0])
                          }
                        />
                      </div>
                      <div className="mt-2 flex justify-between gap-2">
                        <p className="text-xs text-slate-400">
                          {uploadingDocumentCount > 0 ? "Завантаження..." : " "}
                        </p>
                        <ButtonYellow
                          type="button"
                          className="admin-btn-secondary px-3! py-1.5! text-xs!"
                          onClick={() => void handleRemoveDocument(index)}
                        >
                          Видалити
                        </ButtonYellow>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-400">Документи ще не додані.</p>
              )}
            </div>

            <div className="mt-4 rounded-lg border border-slate-600/55 bg-slate-950/35 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-100">Список відгуків комплекту</p>
              </div>

              {reviews.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {reviews.map((review, index) => (
                    <div key={review.id || `bundle-review-${index}`} className="rounded border border-slate-600/55 p-3">
                      <div className="grid grid-cols-1 gap-2 text-sm text-slate-300 md:grid-cols-2">
                        <p>
                          <span className="text-slate-400">Ім'я:</span> {review.client_name}
                        </p>
                        <p>
                          <span className="text-slate-400">Email:</span> {review.email}
                        </p>
                        <p>
                          <span className="text-slate-400">Оцінка:</span> {review.rating}/5
                        </p>
                        <p>
                          <span className="text-slate-400">Дата:</span>{" "}
                          {new Date(review.created_at).toLocaleDateString("uk-UA")}
                        </p>
                      </div>
                      <p className="mt-3 text-sm text-slate-100">{review.comment}</p>
                      <div className="mt-2 flex justify-end">
                        <ButtonYellow
                          type="button"
                          className="admin-btn-secondary px-3! py-1.5! text-xs!"
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={deletingReviewId === review.id}
                        >
                          {deletingReviewId === review.id ? "Видалення..." : "Видалити"}
                        </ButtonYellow>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-400">Відгуки ще не додані.</p>
              )}
            </div>
          </div>
        </div>

        <div className="admin-actions justify-end border-t border-slate-600/45 pt-3">
          <Link
            href="/admin/dashboard/bundles"
            className="admin-btn-secondary px-4! py-2! text-sm!"
            onClick={(event) => {
              event.preventDefault();
              void handleCancel();
            }}
          >
            Скасувати
          </Link>

          <ButtonYellow
            type="submit"
            className="admin-btn-primary px-4! py-2! text-sm!"
            disabled={isPending || uploadingDocumentCount > 0}
          >
            {isPending ? "Оновлення..." : "Зберегти зміни"}
          </ButtonYellow>
        </div>
      </form>
    </section>
  );
}
