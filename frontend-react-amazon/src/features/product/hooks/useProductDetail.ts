import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';

export function useProductDetail(slug: string) {
  return useQuery({
    queryKey: ['products', slug],
    queryFn: () => productService.getBySlug(slug),
    select: (res) => res.data,
    enabled: !!slug,
  });
}
