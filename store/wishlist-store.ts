import { getWishlistState } from "@/app/actions/account/wishlist/get-wishlist-state";
import { toggleWishlist } from "@/app/actions/account/wishlist/toggle-wishlist";
import { create } from "zustand";

type WishlistState = {
  ids: string[];
  isAuthenticated: boolean;
  status: "idle" | "loading" | "ready";
  loginPromptOpen: boolean;
  loginRedirect: string;
  hydrate: () => Promise<void>;
  toggle: (productId: string) => Promise<void>;
  closeLoginPrompt: () => void;
  reset: () => void;
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: [],
  isAuthenticated: false,
  status: "idle",
  loginPromptOpen: false,
  loginRedirect: "/",

  hydrate: async () => {
    if (get().status !== "idle") return;
    set({ status: "loading" });
    try {
      const state = await getWishlistState();
      set({ ids: state.ids, isAuthenticated: state.isAuthenticated, status: "ready" });
    } catch {
      set({ status: "ready" });
    }
  },

  toggle: async (productId) => {
    const { isAuthenticated, ids } = get();

    if (!isAuthenticated) {
      const loginRedirect =
        typeof window === "undefined"
          ? "/"
          : window.location.pathname + window.location.search;
      set({ loginPromptOpen: true, loginRedirect });
      return;
    }

    const wasInList = ids.includes(productId);
    set({ ids: wasInList ? ids.filter((id) => id !== productId) : [...ids, productId] });

    try {
      await toggleWishlist(productId);
    } catch {
      const current = get().ids;
      set({
        ids: wasInList ? [...current, productId] : current.filter((id) => id !== productId),
      });
    }
  },

  closeLoginPrompt: () => set({ loginPromptOpen: false }),

  // The store is a client-side singleton that survives client navigations, so
  // it must be reset when the account identity changes (sign-in / sign-out) —
  // otherwise stale hearts persist until a full reload. Back to "idle" so the
  // next WishlistHeart mount re-hydrates against the current session.
  reset: () =>
    set({ ids: [], isAuthenticated: false, status: "idle", loginPromptOpen: false, loginRedirect: "/" }),
}));
