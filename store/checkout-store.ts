import { MetodsPayment } from "@/types/bonifico.data";
import { InputsCheckoutStep1, InputsCheckoutStep2Consegna } from "@/types/checkout-steps.types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
type CheckoutStoreState = {
  totalPrice?: number;
  basket?: { id: string; qnt: number }[];
  step: 0 | 1 | 2 | 3 | 4;
  dataFirstStep: Partial<InputsCheckoutStep1>;
  dataCheckoutStepConsegna: Partial<InputsCheckoutStep2Consegna>;
  dataCheckoutStepPagamento: Partial<MetodsPayment>;
  setStep: (step: 0 | 1 | 2 | 3 | 4) => void;
  setCheckoutData: (data: { totalPrice: number; basket: { id: string; qnt: number }[] }) => void;
  setDataFirstStepCheckout: (data: Partial<InputsCheckoutStep1>) => void;
  setDataCheckoutStepConsegna: (data: Partial<InputsCheckoutStep2Consegna>) => void;
  clearAllCheckoutData: () => void;
  clearFirstStepData: () => void;
  clearSecondStepDataConsegna: () => void;
  resetRequestCodiceFiscale: () => void;
  setDataCheckoutStepPagamento: (data: MetodsPayment) => void;
};
export const useCheckoutStore = create<CheckoutStoreState>()(
  persist(
    (set) => ({
      totalPrice: 0,
      basket: [],
      step: 0,
      dataFirstStep: {},
      dataCheckoutStepConsegna: {},
      dataCheckoutStepPagamento: {},
      setCheckoutData: (data) => set(data),
      setStep: (step) => set({ step }),
      clearAllCheckoutData: () =>
        set({
          totalPrice: 0,
          basket: [],
          dataFirstStep: undefined,
          dataCheckoutStepConsegna: undefined,
          dataCheckoutStepPagamento: undefined,
          step: 0,
        }),
      setDataFirstStepCheckout: (data) => set({ dataFirstStep: data }),
      setDataCheckoutStepConsegna: (data) => set({ dataCheckoutStepConsegna: data }),
      setDataCheckoutStepPagamento: (data) => set({ dataCheckoutStepPagamento: data }),
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
