import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import type { CreateProductVariantRequest } from '../types/product.types';

export function useCreateProductVariant(productId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductVariantRequest) =>
      productService.createVariant(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
