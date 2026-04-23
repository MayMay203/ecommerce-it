import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '../services/wishlist.service';

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => wishlistService.removeItem(productId),
    onSuccess: (wishlist) => {
      queryClient.setQueryData(['wishlist'], wishlist);
    },
  });
}
