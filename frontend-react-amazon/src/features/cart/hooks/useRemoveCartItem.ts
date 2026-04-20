import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../services/cart.service';

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cartService.removeItem(id),
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart'], cart);
    },
  });
}
