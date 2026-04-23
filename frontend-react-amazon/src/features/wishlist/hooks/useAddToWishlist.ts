import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AddWishlistItemDto } from '../types/wishlist.types';
import { wishlistService } from '../services/wishlist.service';

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: AddWishlistItemDto) => wishlistService.addItem(dto),
    onSuccess: (wishlist) => {
      queryClient.setQueryData(['wishlist'], wishlist);
    },
  });
}
