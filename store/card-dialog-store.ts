import { ProductType } from "@/db/schemas/product.schema";
import { create } from "zustand";
type CardDialogStore = {
  isOpenDialog: boolean;

  product: ProductType | null;
  openDialog: (product: ProductType) => void;
  closeDialog: () => void;
};

export const useCardDialogStore = create<CardDialogStore>((set) => ({
  isOpenDialog: false,
  product: null,
  openDialog: (product: ProductType) => set({ isOpenDialog: true, product }),
  closeDialog: () => set({ isOpenDialog: false, product: null }),
}));
