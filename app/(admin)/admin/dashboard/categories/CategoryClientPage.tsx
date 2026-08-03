"use client";

import type {
  GetAllCategoriesFailure,
  GetAllCategoriesSuccess,
} from "@/app/actions/admin/categories/mutations";
import type { CatalogCountRow } from "@/app/actions/admin/brands/queries";
import { removeCategoryProductsById } from "@/app/actions/admin/categories/mutations";
import { deleteFileFromS3 } from "@/app/actions/admin/files/mutations";
import { AdminIconActionButton } from "@/app/(admin)/admin/dashboard/AdminIconAction";
import AdminPagination, { usePagination } from "@/app/(admin)/admin/dashboard/AdminPagination";
import AdminSearchInput from "@/app/(admin)/admin/dashboard/AdminSearchInput";
import AdminBadge from "@/app/(admin)/admin/dashboard/AdminBadge";
import ButtonXDellete from "@/app/(admin)/admin/dashboard/ButtonXDellete";
import { confirmActionToast } from "@/app/(admin)/admin/dashboard/confirm-action-toast";
import IconEdit from "@/assets/icons/edit.svg";
import { CategoryTypes } from "@/types/category.types";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import ModalCategoryForm from "./ModalCategoryForm";

function CategoryRowActions({
  category,
  onEdit,
  onDelete,
  isDeleting,
}: {
  category: CategoryTypes;
  onEdit: (value: CategoryTypes) => void;
  onDelete: (value: Pick<CategoryTypes, "id" | "image">) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="admin-actions">
      <AdminIconActionButton
        icon={IconEdit}
        alt="Редагувати"
        className="admin-icon-action-edit"
        iconClassName="admin-icon-action-icon"
        onClick={() => onEdit(category)}
      />

      <ButtonXDellete
        type="button"
        onClick={() => onDelete({ id: category.id, image: category.image })}
        className="h-10 w-10"
        disabled={isDeleting}
      />
    </div>
  );
}

export default function CategoriesClientPage({
  initialData,
  productCounts,
}: {
  initialData: GetAllCategoriesSuccess | GetAllCategoriesFailure;
  productCounts: CatalogCountRow[];
}) {
  const [categories, setCategories] = useState<CategoryTypes[]>(initialData.data || []);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<CategoryTypes | null>(null);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [isPendingDell, startTransitionDell] = useTransition();
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

    const filtered = categories.filter((cat) =>
      searchLower === ""
        ? true
        : cat.name.toLowerCase().includes(searchLower) ||
            cat.category_slug.toLowerCase().includes(searchLower) ||
            cat.title_full.toLowerCase().includes(searchLower),
    );

    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === "NAME_ASC") {
        return a.name.localeCompare(b.name);
      } else if (sortKey === "NAME_DESC") {
        return b.name.localeCompare(a.name);
      } else if (sortKey === "COUNT_DESC") {
        const countA = countsBySlug.get(a.category_slug)?.total ?? 0;
        const countB = countsBySlug.get(b.category_slug)?.total ?? 0;
        return countB - countA;
      } else if (sortKey === "COUNT_ASC") {
        const countA = countsBySlug.get(a.category_slug)?.total ?? 0;
        const countB = countsBySlug.get(b.category_slug)?.total ?? 0;
        return countA - countB;
      }
      return 0;
    });

    return sorted;
  }, [categories, searchQuery, sortKey, countsBySlug]);

  const { page, pageSize, totalPages, pageItems, setPage, setPageSize } = usePagination(
    filteredSorted,
    20,
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortKey, setPage]);

  const openModal = (data: CategoryTypes | null = null) => {
    setEditData(data);
    setModalOpen(true);
  };

  const handleDelete = async ({ id, image }: Pick<CategoryTypes, "id" | "image">) => {
    if (!(await confirmActionToast("Видалити цю категорію?"))) return;

    if (!id) {
      toast.error("Некоректний ID категорії");
      return;
    }

    setIdToDelete(id);
    startTransitionDell(async () => {
      const res = await removeCategoryProductsById(id);

      if (!res.success) {
        toast.error("Помилка видалення");
        setIdToDelete(null);
        return;
      }

      await deleteFileFromS3(image);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setIdToDelete(null);
      toast.success("Категорію видалено");
    });
  };

  const addCategory = (newCat: CategoryTypes) => {
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (updated: CategoryTypes) => {
    setCategories((prev) => prev.map((cat) => (cat.id === updated.id ? updated : cat)));
  };

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Категорії</h1>
          <p className="admin-subtitle">Керування категоріями каталогу</p>
        </div>

        <button type="button" onClick={() => openModal(null)} className="admin-btn-primary">
          Додати категорію
        </button>
      </div>

      {categories.length ? (
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
              Всього: {categories.length} • Показано: {filteredSorted.length}
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
                {pageItems.map((cat) => {
                  const count = countsBySlug.get(cat.category_slug);
                  return (
                    <tr key={cat.id}>
                      <td className="max-w-[120px] truncate">{cat.id}</td>
                      <td>
                        <Link href={cat.image} target="_blank">
                          <Image
                            src={cat.image}
                            alt={cat.name}
                            width={66}
                            height={66}
                            loading="eager"
                            className="h-16 w-16 rounded-md border border-slate-600/55 object-cover"
                          />
                        </Link>
                      </td>
                      <td>{cat.category_slug}</td>
                      <td>{cat.name}</td>
                      <td className="max-w-[260px]">{cat.title_full}</td>
                      <td className="max-w-[420px]">
                        <span className="line-clamp-2 text-slate-300">{cat.description}</span>
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
                        <CategoryRowActions
                          category={cat}
                          onEdit={openModal}
                          onDelete={handleDelete}
                          isDeleting={isPendingDell && idToDelete === cat.id}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="grid grid-cols-1 gap-3 lg:hidden">
            {pageItems.map((cat) => {
              const count = countsBySlug.get(cat.category_slug);
              return (
                <li key={cat.id} className="admin-card admin-card-content">
                  <div className="flex gap-3">
                    <Link href={cat.image} target="_blank" className="shrink-0">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        width={72}
                        height={72}
                        loading="eager"
                        className="h-[72px] w-[72px] rounded-md border border-slate-600/55 object-cover"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{cat.name}</p>
                      <p className="text-xs text-slate-400">{cat.category_slug}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-300">{cat.title_full}</p>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm text-slate-300">{cat.description}</p>

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
                    <CategoryRowActions
                      category={cat}
                      onEdit={openModal}
                      onDelete={handleDelete}
                      isDeleting={isPendingDell && idToDelete === cat.id}
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
        <div className="admin-empty">Категорій ще немає.</div>
      )}

      <ModalCategoryForm
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editData}
        onCreate={addCategory}
        onUpdate={updateCategory}
      />
    </section>
  );
}
