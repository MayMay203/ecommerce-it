import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import type { CreateProductImageRequest } from '../types/product.types';

export function useCreateProductImage(productId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductImageRequest) =>
      productService.createImage(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
