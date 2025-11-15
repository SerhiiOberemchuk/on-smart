import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
type BearStoreState = {
  isPopupOpen: boolean;
  qntToShow: number;
  basket: { id: string; qnt: number }[];
};
type BasketStateFunctions = {
  removeAllBasket: () => void;
  updateBasket: (newBasket: { id: string; qnt: number }[]) => void;
  removeFromBasketById: (id: string) => void;
  showPopup: (quantity: number) => void;
  hidePopup: () => void;
};
type BasketState = BearStoreState & BasketStateFunctions;
export const useBasketStore = create<BasketState, [["zustand/persist", BasketStateFunctions]]>(
  persist(
    (set) => ({
      basket: [],
      qntToShow: 0,
      isPopupOpen: false,
      removeAllBasket: () => set({ basket: [] }),
      removeFromBasketById: (id) =>
        set((state) => ({
          basket: state.basket.filter((item) => item.id !== id),
        })),
      updateBasket: (newBasket) =>
        set((state) => ({
          basket: Object.values(
            Object.fromEntries([...state.basket, ...newBasket].map((obj) => [obj.id, obj])),
          ),
        })),
      showPopup: (quantity: number) => set({ isPopupOpen: true, qntToShow: quantity }),
      hidePopup: () => set({ isPopupOpen: false, qntToShow: 0 }),
    }),
    {
      name: "carello",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
