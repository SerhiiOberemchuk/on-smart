import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
type BearStoreState = {
  bears: number;
};
type BearStateFunctions = {
  increasePopulation: () => void;
  removeAllBears: () => void;
  updateBears: (newBears: number) => void;
};
type BearState = BearStoreState & BearStateFunctions;
export const useBear = create<
  BearState,
  [["zustand/persist", BearStateFunctions]]
>(
  persist(
    (set) => ({
      bears: 0,
      increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
      removeAllBears: () => set({ bears: 0 }),
      updateBears: (newBears) => set({ bears: newBears }),
    }),
    {
      name: "carello",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
