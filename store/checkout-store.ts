import { MetodsPayment } from "@/types/bonifico.data";
import { InputsCheckoutStep1, InputsCheckoutStep2Consegna } from "@/types/checkout-steps.types";
import { DELIVERY_DATA } from "@/types/delivery.data";
import { makeOrderNumber } from "@/utils/order-number";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type BasketProductStateItem = {
  id: string;
  qnt: number;
};

export type CheckoutStoreState = {
  totalPrice?: number;
  priseDelivery?: number;
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
  switchRequestInvoce: () => void;
  generateOrderNumber: () => string;
  ensureOrderNumber: () => string;
  clearOrderNumber: () => void;
  setDeliveryMethod: (metod: InputsCheckoutStep2Consegna["deliveryMethod"]) => void;
  setSameAsBilling: (value: boolean) => void;
};
export const useCheckoutStore = create<CheckoutStoreState>()(
  persist(
    (set, get) => ({
      totalPrice: 0,
      basket: [],
      orderNumber: "",
      step: 0,
      priseDelivery: DELIVERY_DATA.PRISE_DELIVERY,
      dataFirstStep: {},
      dataCheckoutStepConsegna: { deliveryMethod: "ritiro_negozio" },
      dataCheckoutStepPagamento: {},
      setCheckoutData: (data) =>
        set((state) => ({
          ...state,
          ...data,
          priseDelivery:
            data.totalPrice > DELIVERY_DATA.FREE_THRESHOLD_TOTAL_PRISE
              ? 0
              : DELIVERY_DATA.PRISE_DELIVERY,
        })),
      setStep: (step) => set({ step }),
      clearAllCheckoutData: () =>
        set({
          totalPrice: 0,
          basket: [],
          priseDelivery: DELIVERY_DATA.PRISE_DELIVERY,
          dataFirstStep: {},
          dataCheckoutStepConsegna: {},
          dataCheckoutStepPagamento: {},
          step: 0,
          orderNumber: "",
        }),
      setDataFirstStepCheckout: (data) => set(() => ({ dataFirstStep: { ...data } })),
      setDataCheckoutStepConsegna: (data) =>
        set((state) => ({
          dataCheckoutStepConsegna: { ...state.dataCheckoutStepConsegna, ...data },
        })),
      setDataCheckoutStepPagamento: (data) => set({ dataCheckoutStepPagamento: { ...data } }),
      clearFirstStepData: () => set({ dataFirstStep: {} }),
      clearSecondStepDataConsegna: () => set({ dataCheckoutStepConsegna: {} }),
      resetRequestCodiceFiscale: () =>
        set((state) => ({
          dataFirstStep: {
            ...state.dataFirstStep,
            request_invoice: false,
            codice_fiscale: "",
          },
        })),
      generateOrderNumber: () => {
        // const current = get().orderNumber;
        // if (current) return current;
        const created = makeOrderNumber("OS");
        set({ orderNumber: created });
        return created;
      },

      ensureOrderNumber: () => {
        const current = get().orderNumber;
        return current ?? get().generateOrderNumber();
      },
      switchRequestInvoce: () =>
        set((state) => ({
          dataFirstStep: {
            ...state.dataFirstStep,
            request_invoice: !state.dataFirstStep.request_invoice,
          },
        })),
      clearOrderNumber: () => set({ orderNumber: undefined }),

      setDeliveryMethod: (method) =>
        set((state) => ({
          dataCheckoutStepConsegna: {
            ...state.dataCheckoutStepConsegna,
            deliveryMethod: method,
            ...(method === "ritiro_negozio"
              ? {
                  sameAsBilling: true,
                  referente_contatto: "",
                  ragione_sociale: "",
                  partita_iva: "",
                  indirizzo: "",
                  città: "",
                  cap: "",
                  nazione: "",
                  provincia_regione: "",
                }
              : {}),
          },
        })),
      setSameAsBilling: (value: boolean) =>
        set((state) => ({
          dataCheckoutStepConsegna: {
            ...state.dataCheckoutStepConsegna,
            sameAsBilling: value,
          },
        })),
    }),
    { name: "checkout-storage", storage: createJSONStorage(() => sessionStorage) },
  ),
);
