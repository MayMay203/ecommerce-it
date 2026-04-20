import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateCartItemDto } from '../types/cart.types';
import { cartService } from '../services/cart.service';

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateCartItemDto }) =>
      cartService.updateItem(id, dto),
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart'], cart);
    },
  });
}
