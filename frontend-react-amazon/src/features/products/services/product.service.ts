import { api } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type {
  CreateProductImageRequest,
  CreateProductRequest,
  CreateProductVariantRequest,
  Product,
  ProductImage,
  ProductVariant,
  UpdateProductRequest,
  UpdateProductVariantRequest,
} from '../types/product.types';

export const productService = {
  getAll: (): Promise<ApiResponse<Product[]>> =>
    api.get<ApiResponse<Product[]>>('/products').then((res) => res.data),

  getBySlug: (slug: string): Promise<ApiResponse<Product>> =>
    api.get<ApiResponse<Product>>(`/products/${slug}`).then((res) => res.data),

  create: (data: CreateProductRequest): Promise<ApiResponse<Product>> =>
    api.post<ApiResponse<Product>>('/products', data).then((res) => res.data),

  update: (id: number, data: UpdateProductRequest): Promise<ApiResponse<Product>> =>
    api.patch<ApiResponse<Product>>(`/products/${id}`, data).then((res) => res.data),

  delete: (id: number): Promise<void> =>
    api.delete(`/products/${id}`).then(() => undefined),

  getVariants: (productId: number): Promise<ApiResponse<ProductVariant[]>> =>
    api
      .get<ApiResponse<ProductVariant[]>>(`/products/${productId}/variants`)
      .then((res) => res.data),

  createVariant: (
    productId: number,
    data: CreateProductVariantRequest,
  ): Promise<ApiResponse<ProductVariant>> =>
    api
      .post<ApiResponse<ProductVariant>>(`/products/${productId}/variants`, data)
      .then((res) => res.data),

  updateVariant: (
    variantId: number,
    data: UpdateProductVariantRequest,
  ): Promise<ApiResponse<ProductVariant>> =>
    api
      .patch<ApiResponse<ProductVariant>>(`/variants/${variantId}`, data)
      .then((res) => res.data),

  deleteVariant: (variantId: number): Promise<void> =>
    api.delete(`/variants/${variantId}`).then(() => undefined),

  createImage: (
    productId: number,
    data: CreateProductImageRequest,
  ): Promise<ApiResponse<ProductImage>> =>
    api
      .post<ApiResponse<ProductImage>>(`/products/${productId}/images`, data)
      .then((res) => res.data),

  deleteImage: (imageId: number): Promise<void> =>
    api.delete(`/images/${imageId}`).then(() => undefined),
};
