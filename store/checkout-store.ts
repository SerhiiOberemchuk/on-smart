import { InputsCheckoutStep1 } from "@/types/checkout-steps.types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
type CheckoutStoreState = {
  totalPrice?: number;
  basket?: { id: string; qnt: number }[];
  step: 0 | 1 | 2 | 3;
  dataFirstStep?: Partial<InputsCheckoutStep1>;
  setStep: (step: 0 | 1 | 2 | 3) => void;
  setCheckoutData: (data: { totalPrice: number; basket: { id: string; qnt: number }[] }) => void;
  setDataFirstStepCheckout: (data: Partial<InputsCheckoutStep1>) => void;
  clearAllCheckoutData: () => void;
  clearFirstStepData: () => void;
};
export const useCheckoutStore = create<CheckoutStoreState>()(
  persist(
    (set) => ({
      totalPrice: 0,
      basket: [],
      step: 0,
      dataFirstStep: undefined,
      setCheckoutData: (data) => set(data),
      setStep: (step) => set({ step }),
      clearAllCheckoutData: () =>
        set({ totalPrice: 0, basket: [], dataFirstStep: undefined, step: 0 }),
      setDataFirstStepCheckout: (data) => set({ dataFirstStep: data }),
      clearFirstStepData: () => set({ dataFirstStep: undefined }),
    }),
    { name: "checkout-storage", storage: createJSONStorage(() => sessionStorage) },
  ),
);
