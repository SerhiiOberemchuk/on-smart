import { InputsCheckoutStep1, InputsCheckoutStep2Consegna } from "@/types/checkout-steps.types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
type CheckoutStoreState = {
  totalPrice?: number;
  basket?: { id: string; qnt: number }[];
  step: 0 | 1 | 2 | 3;
  dataFirstStep: Partial<InputsCheckoutStep1>;
  dataCheckoutStepConsegna: Partial<InputsCheckoutStep2Consegna>;
  setStep: (step: 0 | 1 | 2 | 3) => void;
  setCheckoutData: (data: { totalPrice: number; basket: { id: string; qnt: number }[] }) => void;
  setDataFirstStepCheckout: (data: Partial<InputsCheckoutStep1>) => void;
  setDataCheckoutStepConsegna: (data: Partial<InputsCheckoutStep2Consegna>) => void;
  clearAllCheckoutData: () => void;
  clearFirstStepData: () => void;
  clearSecondStepDataConsegna: () => void;
  resetRequestCodiceFiscale: () => void;
};
export const useCheckoutStore = create<CheckoutStoreState>()(
  persist(
    (set) => ({
      totalPrice: 0,
      basket: [],
      step: 0,
      dataFirstStep: {},
      dataCheckoutStepConsegna: {},
      setCheckoutData: (data) => set(data),
      setStep: (step) => set({ step }),
      clearAllCheckoutData: () =>
        set({ totalPrice: 0, basket: [], dataFirstStep: undefined, step: 0 }),
      setDataFirstStepCheckout: (data) => set({ dataFirstStep: data }),
      setDataCheckoutStepConsegna: (data) => set({ dataCheckoutStepConsegna: data }),
      clearFirstStepData: () => set({ dataFirstStep: undefined }),
      clearSecondStepDataConsegna: () => set({ dataCheckoutStepConsegna: undefined }),
      resetRequestCodiceFiscale: () =>
        set((state) => ({
          dataFirstStep: {
            ...state.dataFirstStep,
            request_invoice: false,
            codice_fiscale: "",
          },
        })),
    }),
    { name: "checkout-storage", storage: createJSONStorage(() => sessionStorage) },
  ),
);
