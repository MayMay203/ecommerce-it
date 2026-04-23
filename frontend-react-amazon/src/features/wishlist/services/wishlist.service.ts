import { api } from '@/shared/lib/axios';
import type { Wishlist, AddWishlistItemDto } from '../types/wishlist.types';

export const wishlistService = {
  getWishlist: () =>
    api.get<{ data: Wishlist }>('/wishlist').then((r) => r.data.data),

  addItem: (dto: AddWishlistItemDto) =>
    api.post<{ data: Wishlist }>('/wishlist/items', dto).then((r) => r.data.data),

  removeItem: (productId: number) => {
    if (!Number.isInteger(productId) || productId <= 0) {
      return Promise.reject(new Error('Invalid productId'));
    }
    return api.delete<{ data: Wishlist }>(`/wishlist/items/${productId}`).then((r) => r.data.data);
  },

  clearWishlist: () =>
    api.delete<{ data: null }>('/wishlist').then(() => undefined),
};
