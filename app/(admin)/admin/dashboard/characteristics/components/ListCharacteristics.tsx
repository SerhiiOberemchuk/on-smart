"use client";

import { use } from "react";
import { deleteCharacteristic } from "@/app/actions/product-characteristic/create-product-characteristic";
import ButtonYellow from "@/components/BattonYellow";
import ButtonXDellete from "../../ButtonXDellete";
import { useCharacteristicStore } from "../store/useCharacteristicStore";

type CharacteristicListItem = {
  id: string;
  name: string;
  category_id: string;
  category_name: string | null;
  in_filter: boolean;
  is_required: boolean;
  is_multiple: boolean;
  values: string[];
};

function groupByCategory(data: CharacteristicListItem[]) {
  return data.reduce<Record<string, { categoryName: string; items: CharacteristicListItem[] }>>(
    (acc, item) => {
      const key = item.category_id || "no-category";

      if (!acc[key]) {
        acc[key] = {
          categoryName: item.category_name ?? "Без категорії",
          items: [],
        };
      }

      acc[key].items.push(item);
      return acc;
    },
    {},
  );
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
          category_id: string;
          category_name: string | null;
          in_filter: boolean;
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
  console.log("Char list data: ", data);

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Видалити характеристику?");
    if (!confirm) return;

    await deleteCharacteristic(id);
  };

  if (data.error || !data.data) {
    return <p className="text-gray-400">Характеристики відсутні</p>;
  }

  const grouped = groupByCategory(data.data);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([categoryId, group]) => (
        <details key={categoryId} className="rounded-xl border border-gray-600">
          <summary className="rounded-xl rounded-t-xl bg-gray-800 px-4 py-2 text-lg font-semibold">
            {group.categoryName}
          </summary>

          <ul className="divide-y divide-gray-700">
            {group.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl px-4 py-1 font-normal hover:bg-gray-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px]">{item.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.values.map((v) => (
                      <span
                        key={v}
                        className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] text-gray-300"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                  <div className="mt-1 flex gap-2 text-xs">
                    {item.in_filter && (
                      <span className="rounded bg-blue-600/20 px-2 py-0.5 text-blue-400">
                        Фільтр
                      </span>
                    )}
                    {item.is_required && (
                      <span className="rounded bg-red-600/20 px-2 py-0.5 text-red-400">
                        Обовʼязкова
                      </span>
                    )}
                    {item.is_multiple && (
                      <span className="rounded bg-green-600/20 px-2 py-0.5 text-green-400">
                        Мульти
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ButtonYellow
                    className="text-[10px] font-normal"
                    onClick={() => openEdit(item.id)}
                  >
                    ✏️ Редагувати
                  </ButtonYellow>

                  <ButtonXDellete className="h-7 w-7" onClick={() => handleDelete(item.id)} />
                </div>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
