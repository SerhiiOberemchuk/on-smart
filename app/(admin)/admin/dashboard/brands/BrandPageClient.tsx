"use client";

import { removeBrandById } from "@/app/actions/admin/brands/mutations";
import type { CatalogCountRow } from "@/app/actions/admin/brands/queries";
import { deleteFileFromS3 } from "@/app/actions/admin/files/mutations";
import { AdminIconActionButton } from "@/app/(admin)/admin/dashboard/AdminIconAction";
import AdminPagination, { usePagination } from "@/app/(admin)/admin/dashboard/AdminPagination";
import AdminSearchInput from "@/app/(admin)/admin/dashboard/AdminSearchInput";
import AdminBadge from "@/app/(admin)/admin/dashboard/AdminBadge";
import ButtonXDellete from "@/app/(admin)/admin/dashboard/ButtonXDellete";
import { confirmActionToast } from "@/app/(admin)/admin/dashboard/confirm-action-toast";
import IconEdit from "@/assets/icons/edit.svg";
import { BrandTypes } from "@/types/brands.types";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import ModalBrandForm from "./ModalBrandForm";

function BrandRowActions({
  brand,
  onEdit,
  onDelete,
  isDeleting,
}: {
  brand: BrandTypes;
  onEdit: (value: BrandTypes) => void;
  onDelete: (value: Pick<BrandTypes, "id" | "image">) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="admin-actions">
      <AdminIconActionButton
        icon={IconEdit}
        alt="Редагувати"
        className="admin-icon-action-edit"
        iconClassName="admin-icon-action-icon"
        onClick={() => onEdit(brand)}
      />

      <ButtonXDellete
        type="button"
        onClick={() => onDelete({ id: brand.id, image: brand.image })}
        className="h-10 w-10"
        disabled={isDeleting}
      />
    </div>
  );
}

export default function BrandsPageClient({
  brandsData,
  productCounts,
}: {
  brandsData: BrandTypes[];
  productCounts: CatalogCountRow[];
}) {
  const [brands, setBrands] = useState<BrandTypes[]>(brandsData);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<BrandTypes | null>(null);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"NAME_ASC" | "NAME_DESC" | "COUNT_DESC" | "COUNT_ASC">(
    "NAME_ASC",
  );

  const countsBySlug = useMemo(
    () => new Map(productCounts.map((r) => [r.slug, r])),
    [productCounts],
  );

  const filteredSorted = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();

    const filtered = brands.filter((brand) =>
      searchLower === ""
        ? true
        : brand.name.toLowerCase().includes(searchLower) ||
            brand.brand_slug.toLowerCase().includes(searchLower) ||
            brand.title_full.toLowerCase().includes(searchLower),
    );

    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === "NAME_ASC") {
        return a.name.localeCompare(b.name);
      } else if (sortKey === "NAME_DESC") {
        return b.name.localeCompare(a.name);
      } else if (sortKey === "COUNT_DESC") {
        const countA = countsBySlug.get(a.brand_slug)?.total ?? 0;
        const countB = countsBySlug.get(b.brand_slug)?.total ?? 0;
        return countB - countA;
      } else if (sortKey === "COUNT_ASC") {
        const countA = countsBySlug.get(a.brand_slug)?.total ?? 0;
        const countB = countsBySlug.get(b.brand_slug)?.total ?? 0;
        return countA - countB;
      }
      return 0;
    });

    return sorted;
  }, [brands, searchQuery, sortKey, countsBySlug]);

  const { page, pageSize, totalPages, pageItems, setPage, setPageSize } = usePagination(
    filteredSorted,
    20,
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortKey, setPage]);

  const openModal = (data: BrandTypes | null = null) => {
    setEditData(data);
    setModalOpen(true);
  };

  const handleDelete = async ({ id, image }: Pick<BrandTypes, "id" | "image">) => {
    if (!(await confirmActionToast("Видалити цей бренд?"))) return;

    if (!id) {
      toast.error("Некоректний ID бренду");
      return;
    }

    setIdToDelete(id);
    startTransition(async () => {
      const res = await removeBrandById(id);

      if (!res.success) {
        toast.error("Помилка видалення");
        setIdToDelete(null);
        return;
      }

      await deleteFileFromS3(image);
      setBrands((prev) => prev.filter((b) => b.id !== id));
      setIdToDelete(null);
      toast.success("Бренд видалено");
    });
  };

  const addBrand = (newBrand: BrandTypes) => {
    setBrands((prev) => [...prev, newBrand]);
  };

  const updateBrand = (updated: BrandTypes) => {
    setBrands((prev) => prev.map((brand) => (brand.id === updated.id ? updated : brand)));
  };

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Бренди</h1>
          <p className="admin-subtitle">Керування брендами каталогу</p>
        </div>

        <button type="button" onClick={() => openModal(null)} className="admin-btn-primary">
          Додати бренд
        </button>
      </div>

      {brands.length ? (
        <>
          <div className="mb-4 flex flex-wrap gap-3">
            <AdminSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Пошук за назвою або слагом..."
              className="flex-1 min-w-64"
            />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
              className="admin-select"
            >
              <option value="NAME_ASC">Назва: А–Я</option>
              <option value="NAME_DESC">Назва: Я–А</option>
              <option value="COUNT_DESC">Товарів: більше</option>
              <option value="COUNT_ASC">Товарів: менше</option>
            </select>
          </div>

          {filteredSorted.length > 0 && (
            <p className="admin-muted mb-4 text-sm">
              Всього: {brands.length} • Показано: {filteredSorted.length}
            </p>
          )}

          <div className="admin-table-wrap hidden lg:block">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Зображення</th>
                  <th>Слаг</th>
                  <th>Назва</th>
                  <th>Заголовок</th>
                  <th>Опис</th>
                  <th>Товарів</th>
                  <th>Дії</th>
                </tr>
              </thead>

              <tbody>
                {pageItems.map((brand) => {
                  const count = countsBySlug.get(brand.brand_slug);
                  return (
                    <tr key={brand.id}>
                      <td className="max-w-[120px] truncate">{brand.id}</td>
                      <td>
                        <Link href={brand.image} target="_blank">
                          <Image
                            src={brand.image}
                            alt={brand.name}
                            width={66}
                            height={66}
                            className="h-16 w-16 rounded-md border border-slate-600/55 object-contain object-center p-1"
                          />
                        </Link>
                      </td>
                      <td>{brand.brand_slug}</td>
                      <td>{brand.name}</td>
                      <td className="max-w-[260px]">{brand.title_full}</td>
                      <td className="max-w-[420px]">
                        <span className="line-clamp-2 text-slate-300">{brand.description}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {count ? (
                            <span>{count.total}</span>
                          ) : (
                            <span className="admin-muted">0</span>
                          )}
                          {count && count.hidden > 0 && (
                            <AdminBadge tone="amber">{count.hidden} прих.</AdminBadge>
                          )}
                        </div>
                      </td>
                      <td>
                        <BrandRowActions
                          brand={brand}
                          onEdit={openModal}
                          onDelete={handleDelete}
                          isDeleting={isPending && idToDelete === brand.id}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="grid grid-cols-1 gap-3 lg:hidden">
            {pageItems.map((brand) => {
              const count = countsBySlug.get(brand.brand_slug);
              return (
                <li key={brand.id} className="admin-card admin-card-content">
                  <div className="flex gap-3">
                    <Link href={brand.image} target="_blank" className="shrink-0">
                      <Image
                        src={brand.image}
                        alt={brand.name}
                        width={72}
                        height={72}
                        className="h-[72px] w-[72px] rounded-md border border-slate-600/55 object-cover p-1"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{brand.name}</p>
                      <p className="text-xs text-slate-400">{brand.brand_slug}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-300">{brand.title_full}</p>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm text-slate-300">{brand.description}</p>

                  <div className="mt-3 border-t border-slate-600/45 pt-3">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-sm">Товарів:</span>
                      {count ? (
                        <span className="text-sm">{count.total}</span>
                      ) : (
                        <span className="admin-muted text-sm">0</span>
                      )}
                      {count && count.hidden > 0 && (
                        <AdminBadge tone="amber">{count.hidden} прих.</AdminBadge>
                      )}
                    </div>
                    <BrandRowActions
                      brand={brand}
                      onEdit={openModal}
                      onDelete={handleDelete}
                      isDeleting={isPending && idToDelete === brand.id}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          {totalPages > 1 && (
            <div className="mt-4">
              <AdminPagination
                page={page}
                totalPages={totalPages}
                totalItems={filteredSorted.length}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </>
      ) : (
        <div className="admin-empty">Брендів ще немає.</div>
      )}

      <ModalBrandForm
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editData}
        onCreate={addBrand}
        onUpdate={updateBrand}
      />
    </section>
  );
}
