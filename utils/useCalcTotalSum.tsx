import { useMemo } from "react";

type Item = {
  price: string;
  qnt: number;
};

export function useCalcTotalSum(items: Item[] = []) {
  const total = useMemo(() => {
    if (!items?.length) return 0;

    return items.reduce((acc, i) => acc + (Number(i.price) || 0) * (i.qnt || 1), 0);
  }, [items]);

  return total.toString();
}
