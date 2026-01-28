import { MetodsPayment } from "@/types/bonifico.data";
import { InputsCheckoutStep1, InputsCheckoutStep2Consegna } from "@/types/checkout-steps.types";
import { makeOrderNumber } from "@/utils/order-number";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type BasketProductStateItem = {
  id: string;
  qnt: number;
};

type CheckoutStoreState = {
  totalPrice?: number;
  orderNumber?: string;
  basket?: BasketProductStateItem[];
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

  generateOrderNumber: () => string;
  ensureOrderNumber: () => string;
  clearOrderNumber: () => void;
};
export const useCheckoutStore = create<CheckoutStoreState>()(
  persist(
    (set, get) => ({
      totalPrice: 0,
      basket: [],
      orderNumber: undefined,
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
          orderNumber: undefined,
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
      generateOrderNumber: () => {
        const current = get().orderNumber;
        if (current) return current;
        const created = makeOrderNumber("OS");
        set({ orderNumber: created });
        return created;
      },

      ensureOrderNumber: () => {
        const current = get().orderNumber;
        return current ?? get().generateOrderNumber();
      },

      clearOrderNumber: () => set({ orderNumber: undefined }),
    }),
    { name: "checkout-storage", storage: createJSONStorage(() => sessionStorage) },
  ),
);
