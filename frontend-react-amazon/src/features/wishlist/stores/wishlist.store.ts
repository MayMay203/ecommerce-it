import { create } from 'zustand';

interface WishlistState {
  wishlistCount: number;
  setWishlistCount: (count: number) => void;
}

export const useWishlistStore = create<WishlistState>((set) => ({
  wishlistCount: 0,
  setWishlistCount: (count) => set({ wishlistCount: count }),
}));
