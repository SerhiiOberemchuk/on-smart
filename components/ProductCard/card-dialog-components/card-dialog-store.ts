import { create } from "zustand";
type CardDialogStore = {
  isOpenDialog: boolean;
  id: string;
  openDialog: (id: string) => void;
  closeDialog: () => void;
};

export const useCardDialogStore = create<CardDialogStore>((set) => ({
  isOpenDialog: false,
  id: "",
  openDialog: (id: string) => set({ isOpenDialog: true, id }),
  closeDialog: () => set({ isOpenDialog: false, id: "" }),
}));
