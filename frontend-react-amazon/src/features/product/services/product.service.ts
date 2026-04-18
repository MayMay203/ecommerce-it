import { api } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { Product, ProductVariant } from '../types/product.types';

export const productService = {
  getAll: (): Promise<ApiResponse<Product[]>> =>
    api.get<ApiResponse<Product[]>>('/products').then((res) => res.data),

  getBySlug: (slug: string): Promise<ApiResponse<Product>> =>
    api.get<ApiResponse<Product>>(`/products/${slug}`).then((res) => res.data),

  getVariants: (productId: number): Promise<ApiResponse<ProductVariant[]>> =>
    api
      .get<ApiResponse<ProductVariant[]>>(`/products/${productId}/variants`)
      .then((res) => res.data),

  getVariantById: (variantId: number): Promise<ApiResponse<ProductVariant>> =>
    api
      .get<ApiResponse<ProductVariant>>(`/variants/${variantId}`)
      .then((res) => res.data),
};
