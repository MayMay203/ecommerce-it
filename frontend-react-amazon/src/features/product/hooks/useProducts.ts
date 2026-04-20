import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import type { Product, ProductFilters } from '../types/product.types';
import { getEffectivePrice } from '../utils/product.utils';

function applyFilters(products: Product[], filters: ProductFilters): Product[] {
  return products.filter((p) => {
    if (!p.isActive) return false;

    if (filters.categoryId !== undefined && Number(p.categoryId) !== filters.categoryId) return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!p.name.toLowerCase().includes(q)) return false;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const prices = p.variants.map(getEffectivePrice);
      const minVariantPrice = prices.length > 0 ? Math.min(...prices) : 0;
      if (filters.minPrice !== undefined && minVariantPrice < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && minVariantPrice > filters.maxPrice) return false;
    }

    return true;
  });
}

export function useProducts(filters: ProductFilters = {}) {
  const query = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getAll().then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const data = useMemo(
    () => applyFilters(query.data ?? [], filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query.data, filters.categoryId, filters.search, filters.minPrice, filters.maxPrice],
  );

  return { ...query, data };
}
