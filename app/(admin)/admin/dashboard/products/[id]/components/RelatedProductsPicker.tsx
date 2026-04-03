"use client";

import { useMemo, useState } from "react";

import type { ProductType } from "@/db/schemas/product.schema";
import type { BrandTypes } from "@/types/brands.types";
import type { CategoryTypes } from "@/types/category.types";

import ButtonXDellete from "../../../ButtonXDellete";
import InputAdminStyle from "../../../InputComponent";
import SelectComponentAdmin from "../../../SelectComponent";

type RelatedProductsPickerProps = {
  allProducts: ProductType[];
  brands: BrandTypes[];
  categories: CategoryTypes[];
  currentProductId: string;
  selectedIds: string[];
  onChange: (nextIds: string[]) => void;
};

export default function RelatedProductsPicker({
  allProducts,
  brands,
  categories,
  currentProductId,
  selectedIds,
  onChange,
}: RelatedProductsPickerProps) {
  const [query, setQuery] = useState("");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("");
  const [selectedBrandSlug, setSelectedBrandSlug] = useState("");

  const selectedProductsMap = useMemo(
    () =>
      new Map(
        selectedIds
          .map((id) => allProducts.find((product) => product.id === id))
          .filter((product): product is ProductType => Boolean(product))
          .map((product) => [product.id, product]),
      ),
    [allProducts, selectedIds],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allProducts
      .filter((product) => product.id !== currentProductId)
      .filter((product) =>
        selectedCategorySlug ? product.category_slug === selectedCategorySlug : true,
      )
      .filter((product) => (selectedBrandSlug ? product.brand_slug === selectedBrandSlug : true))
      .filter((product) => {
        if (!normalizedQuery) return true;

        const searchableText = [
          product.name,
          product.nameFull,
          product.slug,
          product.id,
          product.ean ?? "",
          ...(product.searchKeywords ?? []),
          product.category_slug ?? "",
          product.brand_slug ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      })
      .slice(0, 80);
  }, [allProducts, currentProductId, query, selectedBrandSlug, selectedCategorySlug]);

  const toggleProduct = (productId: string) => {
    if (selectedIds.includes(productId)) {
      onChange(selectedIds.filter((id) => id !== productId));
      return;
    }

    onChange([...selectedIds, productId]);
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedBrandSlug("");
    setSelectedCategorySlug("");
  };

  return (
    <div className="admin-card admin-card-content">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-100">Супутні рекомендовані товари</p>
          <p className="text-xs text-slate-400">
            Виберіть товари з каталогу. Працює пошук, фільтр по категорії та бренду, мультивибір
            через чекбокси.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn-secondary px-3! py-1.5! text-xs!"
          onClick={clearFilters}
        >
          Скинути фільтри
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-3">
        <InputAdminStyle
          input_title="Пошук товару"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Назва, slug, ID, EAN..."
        />

        <SelectComponentAdmin
          selectTitle="Категорія"
          optionsTitle="Усі категорії"
          value={selectedCategorySlug}
          onChange={(event) => setSelectedCategorySlug(event.target.value)}
          options={categories.map((category) => ({
            value: category.category_slug ?? "",
            name: category.name,
          }))}
        />

        <SelectComponentAdmin
          selectTitle="Бренд"
          optionsTitle="Усі бренди"
          value={selectedBrandSlug}
          onChange={(event) => setSelectedBrandSlug(event.target.value)}
          options={brands.map((brand) => ({
            value: brand.brand_slug ?? "",
            name: brand.name,
          }))}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="rounded-lg border border-slate-600/55 bg-slate-900/35">
          <div className="flex items-center justify-between border-b border-slate-600/45 px-3 py-2">
            <p className="text-sm font-medium text-slate-100">Каталог товарів</p>
            <span className="text-xs text-slate-400">Показано: {filteredProducts.length}</span>
          </div>

          <div className="max-h-[28rem] overflow-auto">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const isSelected = selectedIds.includes(product.id);

                return (
                  <label
                    key={product.id}
                    className="flex cursor-pointer items-start gap-3 border-b border-slate-600/45 px-3 py-3 text-sm text-slate-100 last:border-b-0 hover:bg-slate-800/60"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-yellow-500"
                      checked={isSelected}
                      onChange={() => toggleProduct(product.id)}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{product.nameFull}</span>
                        {product.isHidden ? (
                          <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-200">
                            Приховано
                          </span>
                        ) : null}
                        {product.isOnOrder ? (
                          <span className="admin-chip text-[10px]!">Під замовлення</span>
                        ) : null}
                      </div>

                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-400">
                        <span>{product.slug}</span>
                        <span>ID: {product.id}</span>
                        {product.ean ? <span>EAN: {product.ean}</span> : null}
                        {product.category_slug ? (
                          <span>Категорія: {product.category_slug}</span>
                        ) : null}
                        {product.brand_slug ? <span>Бренд: {product.brand_slug}</span> : null}
                        <span>Залишок: {product.inStock}</span>
                      </div>
                    </div>
                  </label>
                );
              })
            ) : (
              <p className="px-3 py-3 text-xs text-slate-400">
                Нічого не знайдено за поточними фільтрами.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-600/55 bg-slate-900/35">
          <div className="flex items-center justify-between border-b border-slate-600/45 px-3 py-2">
            <p className="text-sm font-medium text-slate-100">Обрані товари</p>
            <span className="text-xs text-slate-400">{selectedIds.length} шт.</span>
          </div>

          <div className="max-h-[28rem] overflow-auto p-3">
            {selectedIds.length === 0 ? (
              <p className="text-xs text-slate-400">Супутні товари ще не обрані.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedIds.map((id) => {
                  const selectedProduct = selectedProductsMap.get(id);
                  const title = selectedProduct
                    ? `${selectedProduct.nameFull} (${selectedProduct.slug})`
                    : `ID: ${id}`;

                  return (
                    <span key={id} className="admin-chip gap-2!">
                      <span>{title}</span>
                      {selectedProduct?.isHidden ? (
                        <span className="rounded-xl border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-200">
                          Приховано
                        </span>
                      ) : null}
                      <ButtonXDellete
                        type="button"
                        className="h-6 w-6 rounded-md border-red-500/60 bg-red-500/10"
                        onClick={() => toggleProduct(id)}
                      />
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
