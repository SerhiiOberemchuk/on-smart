import { create } from "zustand";
type CheckoutStoreState = {
  totalPrice?: number;
  basket?: { id: string; qnt: number }[];
  step: 0 | 1 | 2 | 3;
  setStep: (step: 0 | 1 | 2 | 3) => void;
  setCheckoutData: (data: { totalPrice: number; basket: { id: string; qnt: number }[] }) => void;
  clearCheckoutData?: () => void;
};
export const useCheckoutStore = create<CheckoutStoreState>((set) => ({
  totalPrice: 0,
  basket: [],
  step: 0,
  setCheckoutData: (data) => set(data),
  setStep: (step) => set({ step }),
  clearCheckoutData: () => set({ totalPrice: 0, basket: [] }),
}));
