import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product.service';

export function useDeleteProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: number) => productService.deleteImage(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
