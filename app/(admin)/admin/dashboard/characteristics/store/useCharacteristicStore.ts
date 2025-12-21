import { create } from "zustand";

type CharacteristicModalState = {
  isModal: boolean;
  mode: "create" | "update" | null;
  editingId?: string | null;
};

type CharacteristicModalActions = {
  openCreate: () => void;
  openEdit: (id: string) => void;
  closeModal: () => void;
};

export const useCharacteristicStore = create<CharacteristicModalState & CharacteristicModalActions>(
  (set) => ({
    isModal: false,
    mode: null,
    editingId: null,

    openCreate() {
      set({
        isModal: true,
        mode: "create",
        editingId: null,
      });
    },

    openEdit(id) {
      set({
        isModal: true,
        mode: "update",
        editingId: id,
      });
    },

    closeModal() {
      set({
        isModal: false,
        mode: null,
        editingId: null,
      });
    },
  }),
);
