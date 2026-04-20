import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AddCartItemDto } from '../types/cart.types';
import { cartService } from '../services/cart.service';

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: AddCartItemDto) => cartService.addItem(dto),
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart'], cart);
    },
  });
}
