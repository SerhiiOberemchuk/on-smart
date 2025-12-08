import { create } from "zustand";

type ModalStore = {
  isOpen: boolean;
  type: "brand" | "category" | "product" | null;
  setType: (type: "brand" | "category" | "product" | null) => void;
  openModal: () => void;
  closeModal: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  type: null,
  setType: (type) => set({ type }),
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false, type: null }),
}));
