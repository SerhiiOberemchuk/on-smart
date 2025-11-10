import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
type BearStoreState = {
  basket: { id: string; qnt: number }[];
};
type BasketStateFunctions = {
  removeAllBasket: () => void;
  updateBasket: (newBasket: { id: string; qnt: number }[]) => void;
  removeFromBasketById: (id: string) => void;
};
type BasketState = BearStoreState & BasketStateFunctions;
export const useBasketState = create<BasketState, [["zustand/persist", BasketStateFunctions]]>(
  persist(
    (set) => ({
      basket: [],

      removeAllBasket: () => set({ basket: [] }),
      removeFromBasketById: (id) =>
        set((state) => ({
          basket: state.basket.filter((item) => item.id !== id),
        })),
      updateBasket: (newBasket) => set((state) => ({ basket: [...state.basket, ...newBasket] })),
    }),
    {
      name: "carello",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
