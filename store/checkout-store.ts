import { OrderItemsTypes, OrderTypes } from "@/db/schemas/orders.schema";
import { MetodsPayment } from "@/types/bonifico.data";
import { DELIVERY_DATA } from "@/types/delivery.data";
import { DeliveryMethod } from "@/types/orders.types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type BasketTypeUseCheckoutStore = Pick<OrderItemsTypes, "productId" | "quantity">[];
export type TotalPriseTypeuseCheckoutStore = number;
export type CheckoutTypesDataFirstStep = Omit<
  OrderTypes,
  "id" | "createdAt" | "updatedAt" | "orderNumber" | "deliveryAdress" | "sameAsBilling"
>;
export type CheckoutTypesDataStepConsegna = Pick<OrderTypes, "deliveryAdress" | "sameAsBilling">;
export type CheckoutStoreState = {
  totalPrice: TotalPriseTypeuseCheckoutStore;

  basket: BasketTypeUseCheckoutStore;
  step: 0 | 1 | 2 | 3 | 4;
  dataFirstStep: CheckoutTypesDataFirstStep;
  dataCheckoutStepConsegna: CheckoutTypesDataStepConsegna;
  dataCheckoutStepPagamento: Partial<MetodsPayment>;
  setStep: (step: 0 | 1 | 2 | 3 | 4) => void;
  setCheckoutData: (data: {
    totalPrice: TotalPriseTypeuseCheckoutStore;
    basket: BasketTypeUseCheckoutStore;
  }) => void;
  setDelyveryPrice: ({
    deliveryPrice,
  }: {
    deliveryPrice: CheckoutTypesDataFirstStep["deliveryPrice"];
  }) => void;
  setDataFirstStepCheckout: (data: CheckoutTypesDataFirstStep) => void;
  setDataCheckoutStepConsegna: (data: CheckoutTypesDataStepConsegna) => void;
  clearAllCheckoutData: () => void;
  clearFirstStepData: () => void;
  clearSecondStepDataConsegna: () => void;
  resetRequestCodiceFiscale: () => void;
  setDataCheckoutStepPagamento: (data: MetodsPayment) => void;
  switchRequestInvoce: () => void;
  setDeliveryMethod: (metod: DeliveryMethod) => void;
  setSameAsBilling: (value: boolean) => void;
};

const dataCheckoutStepConsegnaDefault: CheckoutTypesDataStepConsegna = {
  deliveryAdress: null,
  sameAsBilling: true,
};

const dataFirstStepDefault: CheckoutTypesDataFirstStep = {
  email: "",
  numeroTelefono: "",
  clientType: "privato",
  requestInvoice: false,
  orderStatus: "PENDING_PAYMENT",
  deliveryMethod: "CONSEGNA_CORRIERE",
  deliveryPrice: DELIVERY_DATA.PRISE_DELIVERY,
  userId: null,
  nome: null,
  cognome: null,
  indirizzo: null,
  numeroCivico: null,
  citta: null,
  cap: null,
  nazione: null,
  provinciaRegione: null,
  codiceFiscale: null,
  referenteContatto: null,
  ragioneSociale: null,
  partitaIva: null,
  pecAzzienda: null,
  codiceUnico: null,
  paymentOrderID: null,
  trackingNumber: null,
  carrier: null,
  shippedAt: null,
  deliveredAt: null,
};
export const useCheckoutStore = create<CheckoutStoreState>()(
  persist(
    (set) => ({
      totalPrice: 0,
      basket: [],
      step: 0,
      dataFirstStep: dataFirstStepDefault,
      dataCheckoutStepConsegna: dataCheckoutStepConsegnaDefault,
      dataCheckoutStepPagamento: {},
      setCheckoutData: (data) =>
        set((state) => ({
          ...state,
          ...data,
        })),
      setDelyveryPrice: ({ deliveryPrice }) =>
        set((state) => ({ dataFirstStep: { ...state.dataFirstStep, deliveryPrice } })),
      setStep: (step) => set({ step }),
      clearAllCheckoutData: () =>
        set({
          totalPrice: 0,
          basket: [],
          dataFirstStep: dataFirstStepDefault,
          dataCheckoutStepConsegna: dataCheckoutStepConsegnaDefault,
          dataCheckoutStepPagamento: {},
          step: 0,
        }),
      setDataFirstStepCheckout: (data) =>
        set((state) => ({ dataFirstStep: { ...state.dataFirstStep, ...data } })),
      setDataCheckoutStepConsegna: (data) =>
        set((state) => ({
          dataCheckoutStepConsegna: { ...state.dataCheckoutStepConsegna, ...data },
        })),
      setDataCheckoutStepPagamento: (data) => set({ dataCheckoutStepPagamento: { ...data } }),
      clearFirstStepData: () => set({ dataFirstStep: dataFirstStepDefault }),
      clearSecondStepDataConsegna: () =>
        set({ dataCheckoutStepConsegna: dataCheckoutStepConsegnaDefault }),
      resetRequestCodiceFiscale: () =>
        set((state) => ({
          dataFirstStep: {
            ...state.dataFirstStep,
            request_invoice: false,
            codice_fiscale: "",
          },
        })),

      switchRequestInvoce: () =>
        set(({dataFirstStep}) => ({
          dataFirstStep: {
            ...dataFirstStep,
            requestInvoice: !dataFirstStep.requestInvoice,
          },
        })),

      setDeliveryMethod: (method) =>
        set((state) => {
          return {
            dataFirstStep: {
              ...state.dataFirstStep,
              deliveryMethod: method,
            },
          };
        }),
      setSameAsBilling: (sameAsBilling: boolean) =>
        set((state) => ({
          dataCheckoutStepConsegna: { ...state.dataCheckoutStepConsegna, sameAsBilling },
        })),
    }),
    { name: "checkout-storage", storage: createJSONStorage(() => sessionStorage) },
  ),
);
