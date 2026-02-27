"use client";

import { deleteCharacteristic } from "@/app/actions/product-characteristic/create-product-characteristic";
import ButtonYellow from "@/components/BattonYellow";
import { use } from "react";
import ButtonXDellete from "../../ButtonXDellete";
import { useCharacteristicStore } from "../store/useCharacteristicStore";

type CharacteristicListItem = {
  id: string;
  name: string;
  category_id: string | null;
  category_name: string | null;
  in_filter: number;
  is_required: boolean;
  is_multiple: boolean;
  values: string[];
};

const DEFAULT_CATEGORY_NAME = "Універсальні характеристики";

function groupByCategory(data: CharacteristicListItem[]) {
  return data.reduce<Record<string, { categoryName: string; items: CharacteristicListItem[] }>>(
    (acc, item) => {
      const key = item.category_id || "no-category";

      if (!acc[key]) {
        acc[key] = {
          categoryName: item.category_name ?? DEFAULT_CATEGORY_NAME,
          items: [],
        };
      }

      acc[key].items.push(item);
      return acc;
    },
    {},
  );
}

function getFlags(item: CharacteristicListItem) {
  const flags: string[] = [];

  if (item.in_filter) flags.push("Фільтр");
  if (item.is_required) flags.push("Обов'язково");
  if (item.is_multiple) flags.push("Мультивибір");

  return flags;
}

export default function ListCharacteristics({
  action,
}: {
  action: Promise<
    | {
        success: boolean;
        data: {
          id: string;
          name: string;
          category_id: string | null;
          category_name: string | null;
          in_filter: number;
          is_required: boolean;
          is_multiple: boolean;
          values: string[];
        }[];
        error?: undefined;
      }
    | {
        success: boolean;
        error: unknown;
        data?: undefined;
      }
  >;
}) {
  const data = use(action);
  const { openEdit } = useCharacteristicStore();

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Видалити характеристику?");
    if (!confirmDelete) return;
    await deleteCharacteristic(id);
  };

  if (data.error || !data.data) {
    return <div className="admin-empty">Характеристики недоступні.</div>;
  }

  const grouped = groupByCategory(data.data);

  return (
    <div className="admin-characteristics-list">
      {Object.entries(grouped).map(([categoryId, group]) => (
        <details key={categoryId} className="admin-card admin-characteristics-group">
          <summary className="admin-characteristics-group-summary">
            <div className="admin-characteristics-group-heading">
              <span className="admin-characteristics-group-label">Група</span>
              <span className="admin-characteristics-group-title">{group.categoryName}</span>
            </div>
            <span className="admin-characteristics-group-count">{group.items.length}</span>
          </summary>

          <ul className="admin-characteristics-items">
            {group.items.map((item) => (
              <li key={item.id} className="admin-characteristic-item">
                <div className="admin-characteristic-content">
                  <div className="admin-characteristic-head">
                    <p className="admin-characteristic-name">{item.name}</p>
                    <div className="admin-characteristic-meta">
                      <span className="admin-chip admin-characteristic-count">{item.values.length} знач.</span>
                      {getFlags(item).map((flag) => (
                        <span key={flag} className="admin-chip admin-characteristic-flag-chip">
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="admin-characteristic-values-line">
                    <span className="admin-characteristic-values-label">Значення:</span>
                    <div className="admin-characteristic-values-list">
                      {item.values.length ? (
                        item.values.map((value) => (
                          <span key={value} className="admin-chip admin-characteristic-value-chip">
                            {value}
                          </span>
                        ))
                      ) : (
                        <span className="admin-muted text-xs">Немає значень</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="admin-actions admin-characteristic-actions">
                  <ButtonYellow
                    className="admin-btn-secondary admin-characteristic-edit-btn"
                    onClick={() => openEdit(item.id)}
                  >
                    Редагувати
                  </ButtonYellow>
                  <ButtonXDellete className="h-8 w-8" onClick={() => handleDelete(item.id)} />
                </div>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
