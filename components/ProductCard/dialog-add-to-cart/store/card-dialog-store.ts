import { Product } from "@/types/product.types";
import { create } from "zustand";
type CardDialogStore = {
  isOpenDialog: boolean;

  product: Product | null;
  openDialog: (product: Product) => void;
  closeDialog: () => void;
};

export const useCardDialogStore = create<CardDialogStore>((set) => ({
  isOpenDialog: false,

  product: null,
  openDialog: (product: Product) => set({ isOpenDialog: true, product }),
  closeDialog: () => set({ isOpenDialog: false, product: null }),
}));
