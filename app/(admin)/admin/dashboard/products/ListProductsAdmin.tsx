"use client";

import { deleteProductById } from "@/app/actions/product/delete-product";
import { deleteProductVariant } from "@/app/actions/product/delete-product-variant";
import LinkYellow from "@/components/YellowLink";
import { ProductType } from "@/db/schemas/product.schema";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import ButtonXDellete from "../ButtonXDellete";
import ModalAddVariant from "./ModalCreateVariant";

function PriceBlock({
  price,
  oldPrice,
}: {
  price: ProductType["price"];
  oldPrice: ProductType["oldPrice"];
}) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span className="text-[1.1rem] leading-none font-semibold text-emerald-500">{price}</span>
      {oldPrice ? <span className="text-[1.1rem] leading-none text-red-500 line-through">{oldPrice}</span> : null}
    </div>
  );
}

type SortType =
  | "default"
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc"
  | "stock_asc"
  | "stock_desc"
  | "variants_desc";

export default function ListProductsAdmin({ products }: { products: ProductType[] }) {
  const [openedProductIds, setOpenedProductIds] = useState<Set<string>>(new Set());
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [parentProduct, setParentProduct] = useState<ProductType | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [sortType, setSortType] = useState<SortType>("default");

  const parentProducts = useMemo(
    () => products.filter((product) => !product.parent_product_id),
    [products],
  );

  const variantsByParentId = useMemo(() => {
    const map = new Map<string, ProductType[]>();

    for (const product of products) {
      if (!product.parent_product_id) continue;
      const list = map.get(product.parent_product_id) ?? [];
      list.push(product);
      map.set(product.parent_product_id, list);
    }

    return map;
  }, [products]);

  const availableBrands = useMemo(
    () => Array.from(new Set(parentProducts.map((product) => product.brand_slug))).sort((a, b) => a.localeCompare(b)),
    [parentProducts],
  );

  const availableCategories = useMemo(
    () => Array.from(new Set(parentProducts.map((product) => product.category_slug))).sort((a, b) => a.localeCompare(b)),
    [parentProducts],
  );

  const filteredParentProducts = useMemo(
    () =>
      parentProducts.filter((product) => {
        const byBrand = selectedBrand === "ALL" || product.brand_slug === selectedBrand;
        const byCategory = selectedCategory === "ALL" || product.category_slug === selectedCategory;
        return byBrand && byCategory;
      }),
    [parentProducts, selectedBrand, selectedCategory],
  );

  const sortedParentProducts = useMemo(() => {
    const list = [...filteredParentProducts];

    switch (sortType) {
      case "name_asc":
        return list.sort((a, b) => a.nameFull.localeCompare(b.nameFull));
      case "name_desc":
        return list.sort((a, b) => b.nameFull.localeCompare(a.nameFull));
      case "price_asc":
        return list.sort((a, b) => Number(a.price) - Number(b.price));
      case "price_desc":
        return list.sort((a, b) => Number(b.price) - Number(a.price));
      case "stock_asc":
        return list.sort((a, b) => Number(a.inStock) - Number(b.inStock));
      case "stock_desc":
        return list.sort((a, b) => Number(b.inStock) - Number(a.inStock));
      case "variants_desc":
        return list.sort(
          (a, b) =>
            (variantsByParentId.get(b.id)?.length ?? 0) - (variantsByParentId.get(a.id)?.length ?? 0),
        );
      case "default":
      default:
        return list;
    }
  }, [filteredParentProducts, sortType, variantsByParentId]);

  const visibleParentIdsSet = useMemo(
    () => new Set(sortedParentProducts.map((product) => product.id)),
    [sortedParentProducts],
  );

  // Keep expanded state stable, but render only expanded items that are visible after filtering/sorting.
  const visibleOpenedProductIds = useMemo(() => {
    const next = new Set<string>();
    for (const openedId of openedProductIds) {
      if (visibleParentIdsSet.has(openedId)) next.add(openedId);
    }
    return next;
  }, [openedProductIds, visibleParentIdsSet]);

  const visibleProductsWithVariants = useMemo(
    () =>
      sortedParentProducts
        .filter((product) => (variantsByParentId.get(product.id)?.length ?? 0) > 0 || product.hasVariants)
        .map((product) => product.id),
    [sortedParentProducts, variantsByParentId],
  );

  const areAllVisibleVariantsExpanded = useMemo(
    () =>
      visibleProductsWithVariants.length > 0 &&
      visibleProductsWithVariants.every((productId) => visibleOpenedProductIds.has(productId)),
    [visibleProductsWithVariants, visibleOpenedProductIds],
  );

  const resetFilters = () => {
    setSelectedBrand("ALL");
    setSelectedCategory("ALL");
    setSortType("default");
  };

  const openVariantModal = (product: ProductType) => {
    setParentProduct(product);
    setVariantModalOpen(true);
  };

  const closeVariantModal = () => {
    setVariantModalOpen(false);
    setParentProduct(null);
  };

  const toggleVariants = (productId: string, hasVariants: boolean) => {
    if (!hasVariants) return;
    setOpenedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const toggleAllVisibleVariants = () => {
    if (visibleProductsWithVariants.length === 0) return;

    setOpenedProductIds((prev) => {
      const next = new Set(prev);
      const allOpened = visibleProductsWithVariants.every((productId) => next.has(productId));

      if (allOpened) {
        for (const productId of visibleProductsWithVariants) {
          next.delete(productId);
        }
      } else {
        for (const productId of visibleProductsWithVariants) {
          next.add(productId);
        }
      }

      return next;
    });
  };

  const handleDeleteProduct = async (id: string) => {
    const res = await deleteProductById(id);
    if (res.error) {
      console.error(res.error);
      toast.error("Не вдалося видалити товар");
      return;
    }

    toast.success("Товар видалено");
  };

  const handleDeleteVariant = async (productVariantId: string) => {
    const res = await deleteProductVariant({ product_variant_id: productVariantId });
    if (res.error) {
      console.error(res.error);
      toast.error("Не вдалося видалити варіант");
      return;
    }

    toast.success("Варіант видалено");
  };

  return (
    <>
      <div className="admin-card admin-card-content mb-2">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,220px)_minmax(0,220px)_minmax(0,280px)_auto_auto]">
          <label className="admin-field">
            <span className="admin-field-label">Фільтр за брендом</span>
            <select
              className="admin-select"
              value={selectedBrand}
              onChange={(event) => setSelectedBrand(event.target.value)}
            >
              <option value="ALL">Усі бренди</option>
              {availableBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span className="admin-field-label">Фільтр за категорією</span>
            <select
              className="admin-select"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option value="ALL">Усі категорії</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span className="admin-field-label">Сортування</span>
            <select
              className="admin-select"
              value={sortType}
              onChange={(event) => setSortType(event.target.value as SortType)}
            >
              <option value="default">За замовчуванням</option>
              <option value="name_asc">Назва: А-Я</option>
              <option value="name_desc">Назва: Я-А</option>
              <option value="price_asc">Ціна: від меншої</option>
              <option value="price_desc">Ціна: від більшої</option>
              <option value="stock_desc">Залишок: більше спочатку</option>
              <option value="stock_asc">Залишок: менше спочатку</option>
              <option value="variants_desc">Варіанти: більше спочатку</option>
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              className="admin-btn-secondary w-full text-sm! md:w-auto"
              onClick={resetFilters}
              disabled={selectedBrand === "ALL" && selectedCategory === "ALL" && sortType === "default"}
            >
              Скинути фільтри
            </button>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              className="admin-btn-secondary w-full text-sm! md:w-auto"
              onClick={toggleAllVisibleVariants}
              disabled={visibleProductsWithVariants.length === 0}
            >
              {areAllVisibleVariantsExpanded ? "Сховати всі варіанти" : "Показати всі варіанти"}
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Показано товарів: {sortedParentProducts.length} із {parentProducts.length}
        </p>
      </div>

      {sortedParentProducts.length === 0 ? (
        <div className="admin-empty">За поточними фільтрами товари не знайдено.</div>
      ) : null}

      <ul className="flex flex-col gap-2">
        {sortedParentProducts.map((item) => {
          const variants = variantsByParentId.get(item.id) ?? [];
          const hasVariants = variants.length > 0 || item.hasVariants;
          const isOpened = visibleOpenedProductIds.has(item.id);

          return (
            <li key={item.id} className="admin-card admin-card-content admin-card-hover p-3! sm:p-4!">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    <Link href={item.imgSrc} target="_blank" className="shrink-0">
                      <Image
                        src={item.imgSrc}
                        alt={item.name}
                        width={58}
                        height={58}
                        className="h-[58px] w-[58px] rounded-md border border-slate-600/70 object-cover"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="line-clamp-2 text-[1.05rem] leading-tight font-semibold text-slate-100">
                          {item.nameFull}
                        </h2>

                        {hasVariants ? (
                          <button
                            type="button"
                            onClick={() => toggleVariants(item.id, hasVariants)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-yellow-500/70 bg-yellow-500/10 px-2 py-1 text-[11px] font-semibold text-yellow-300 transition hover:bg-yellow-500/20 hover:text-yellow-200"
                            aria-label={isOpened ? "Сховати варіанти товару" : "Показати варіанти товару"}
                            title={isOpened ? "Сховати варіанти товару" : "Показати варіанти товару"}
                            aria-expanded={isOpened}
                            aria-controls={`variants-${item.id}`}
                          >
                            <span aria-hidden>{isOpened ? "▾" : "▸"}</span>
                            <span>{isOpened ? "Сховати варіанти" : "Показати варіанти"}</span>
                            <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-[10px] leading-none">
                              {variants.length}
                            </span>
                          </button>
                        ) : null}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="admin-chip capitalize">{item.category_slug}</span>
                        <span className="admin-chip capitalize">{item.brand_slug}</span>
                        <span className="admin-chip">Залишок: {item.inStock}</span>
                        <span className="admin-chip">Варіантів: {variants.length}</span>
                        {item.isOnOrder ? <span className="admin-chip">Під замовлення</span> : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:justify-self-end">
                  <PriceBlock price={item.price} oldPrice={item.oldPrice} />
                </div>

                <div className="admin-actions lg:justify-end">
                  <LinkYellow
                    className="admin-btn-primary text-sm!"
                    href={`/admin/dashboard/products/${item.id}`}
                    title="Редагувати"
                  />

                  <button
                    type="button"
                    className="admin-btn-secondary text-sm!"
                    onClick={() => openVariantModal(item)}
                  >
                    Додати варіант
                  </button>

                  {hasVariants ? (
                    <span
                      className="admin-chip cursor-not-allowed opacity-70"
                      title="Неможливо видалити товар, поки існують варіанти"
                    >
                      Заблоковано
                    </span>
                  ) : (
                    <ButtonXDellete
                      type="button"
                      className="h-10 w-10"
                      onClick={() => {
                        if (confirm("Видалити цей товар?")) handleDeleteProduct(item.id);
                      }}
                    />
                  )}
                </div>
              </div>

              {isOpened && hasVariants ? (
                <div id={`variants-${item.id}`} className="mt-3 border-t border-slate-600/50 pt-3">
                  {variants.length === 0 ? (
                    <p className="text-xs text-slate-400">Варіанти не знайдено.</p>
                  ) : (
                    <ul className="space-y-2">
                      {variants.map((variant) => (
                        <li
                          key={variant.id}
                          className="rounded-lg border border-slate-600/60 bg-slate-900/30 px-2.5 py-2"
                        >
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
                            <div className="flex min-w-0 items-start gap-2.5">
                              <Image
                                src={variant.imgSrc}
                                width={44}
                                height={44}
                                alt={variant.name}
                                className="h-11 w-11 rounded border border-slate-600/60 object-cover"
                              />

                              <div className="min-w-0">
                                <p className="line-clamp-2 text-sm font-medium text-slate-100">{variant.nameFull}</p>
                                <div className="mt-1 flex flex-wrap gap-1.5">
                                  <span className="admin-chip capitalize">{variant.category_slug}</span>
                                  <span className="admin-chip capitalize">{variant.brand_slug}</span>
                                  <span className="admin-chip">Залишок: {variant.inStock}</span>
                                  {variant.isOnOrder ? <span className="admin-chip">Під замовлення</span> : null}
                                </div>
                              </div>
                            </div>

                            <div className="sm:justify-self-end">
                              <PriceBlock price={variant.price} oldPrice={variant.oldPrice} />
                            </div>

                            <div className="flex items-center justify-start gap-2 sm:justify-end">
                              <LinkYellow
                                href={`/admin/dashboard/products/${variant.id}`}
                                title="Редагувати"
                                className="admin-btn-primary px-3! py-2! text-xs!"
                              />

                              <ButtonXDellete
                                type="button"
                                className="h-10 w-10"
                                onClick={() => {
                                  if (confirm("Видалити цей варіант?")) handleDeleteVariant(variant.id);
                                }}
                              />
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {variantModalOpen && parentProduct ? (
        <ModalAddVariant parent={parentProduct} isOpen={variantModalOpen} onClose={closeVariantModal} />
      ) : null}
    </>
  );
}
