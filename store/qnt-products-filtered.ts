import { create } from "zustand";

export const useQntProductsFilteredStore = create<{
  qnt: number;
setQnt: (qnt: number) => void;
}>((set) => ({
  qnt: 0,
  setQnt: (qnt) => set({ qnt }),
}));