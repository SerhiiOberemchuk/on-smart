import { ProductType } from "@/db/schemas/product.schema";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type BasceketStoreStateType = {
  isPopupOpen: boolean;
  qntToShow: number;
  basket: { id: string; qnt: number }[];
  productsInBasket: ProductType[];
};

type BasketStateFunctions = {
  removeAllBasket: () => void;
  updateBasket: (newBasket: { id: string; qnt: number }[]) => void;
  removeFromBasketById: (id: string) => void;
  showPopup: (quantity: number) => void;
  hidePopup: () => void;
  setProductsInBasket: (products: ProductType[]) => void;
  removeProdutsFromBasket: () => void;
};

type BasketState = BasceketStoreStateType & BasketStateFunctions;
export const useBasketStore = create<BasketState, [["zustand/persist", BasketStateFunctions]]>(
  persist(
    (set) => ({
      basket: [],
      qntToShow: 0,
      isPopupOpen: false,
      productsInBasket: [],
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
      setProductsInBasket: (products) => set({ productsInBasket: products }),
      removeProdutsFromBasket: () => set({ productsInBasket: [] }),
    }),
    {
      name: "carello",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
