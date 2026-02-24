import { ProductType } from "@/db/schemas/product.schema";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { BasketTypeUseCheckoutStore } from "./checkout-store";

export type BasceketStoreStateType = {
  isPopupOpen: boolean;
  qntToShow: number;
  basket: BasketTypeUseCheckoutStore;
  productsInBasket: ProductType[];
};

type BasketStateFunctions = {
  removeAllBasket: () => void;
  updateBasket: (newBasket: BasketTypeUseCheckoutStore) => void;
  removeFromBasketById: (id: string) => void;
  showPopup: (quantity: number) => void;
  hidePopup: () => void;
  setProductsInBasket: (products: ProductType[]) => void;
  removeProdutsFromBasket: () => void;
  clearBasketStore: () => void;
};

type BasketState = BasceketStoreStateType & BasketStateFunctions;
export const useBasketStore = create<BasketState, [["zustand/persist", BasketStateFunctions]]>(
  persist(
    (set) => ({
      basket: [],
      qntToShow: 0,
      isPopupOpen: false,
      productsInBasket: [],
      clearBasketStore: () =>
        set({ basket: [], productsInBasket: [], qntToShow: 0, isPopupOpen: false }),
      removeAllBasket: () => set({ basket: [] }),
      removeFromBasketById: (id) =>
        set((state) => ({
          basket: state.basket.filter((item) => item.productId !== id),
        })),
      updateBasket: (newBasket) =>
        set((state) => ({
          basket: Object.values(
            Object.fromEntries([...state.basket, ...newBasket].map((obj) => [obj.productId, obj])),
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
