import { create } from 'zustand';

interface CartState {
  cartCount: number;
  setCartCount: (count: number) => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  selectedItems: Set<number>;
  toggleItemSelection: (itemId: number) => void;
  selectAllItems: (itemIds: number[]) => void;
  clearSelection: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cartCount: 0,
  setCartCount: (count) => set({ cartCount: count }),
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  selectedItems: new Set(),
  toggleItemSelection: (itemId) =>
    set((state) => {
      const newSelected = new Set(state.selectedItems);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }
      return { selectedItems: newSelected };
    }),
  selectAllItems: (itemIds) => set({ selectedItems: new Set(itemIds) }),
  clearSelection: () => set({ selectedItems: new Set() }),
}));
