import { create } from 'zustand';

interface CartState {
  cartCount: number;
  setCartCount: (count: number) => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cartCount: 0,
  setCartCount: (count) => set({ cartCount: count }),
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
}));
