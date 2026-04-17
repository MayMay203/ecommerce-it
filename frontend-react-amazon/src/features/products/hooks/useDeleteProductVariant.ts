import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product.service';

export function useDeleteProductVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variantId: number) => productService.deleteVariant(variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
