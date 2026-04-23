import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Wishlist } from '../types/wishlist.types';
import { wishlistService } from '../services/wishlist.service';

export function useClearWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistService.clearWishlist,
    onSuccess: () => {
      queryClient.setQueryData(['wishlist'], (old: Wishlist | undefined) =>
        old ? { ...old, items: [] } : old,
      );
    },
  });
}
