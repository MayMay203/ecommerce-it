import { api } from '@/shared/lib/axios';
import type { Cart, AddCartItemDto, UpdateCartItemDto } from '../types/cart.types';

export const cartService = {
  getCart: () =>
    api.get<{ data: Cart }>('/cart').then((r) => r.data.data),

  addItem: (dto: AddCartItemDto) =>
    api.post<{ data: Cart }>('/cart/items', dto).then((r) => r.data.data),

  updateItem: (id: number, dto: UpdateCartItemDto) =>
    api.patch<{ data: Cart }>(`/cart/items/${id}`, dto).then((r) => r.data.data),

  removeItem: (id: number) =>
    api.delete<{ data: Cart }>(`/cart/items/${id}`).then((r) => r.data.data),

  clearCart: () =>
    api.delete<{ data: null }>('/cart').then(() => undefined),

  mergeCart: () =>
    api.post<{ data: null }>('/cart/merge').then(() => undefined),
};
