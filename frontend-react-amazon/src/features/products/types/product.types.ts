import type { Category } from '@/features/categories/types/category.types';

export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  color: string | null;
  size: string | null;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
}

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  sortOrder: number;
}

export interface Product {
  id: number;
  categoryId: number | null;
  category: Category | null;
  name: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  isActive: boolean;
  variants: ProductVariant[];
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  categoryId?: number;
  name: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  isActive?: boolean;
}

export interface UpdateProductRequest {
  categoryId?: number;
  name?: string;
  slug?: string;
  description?: string;
  thumbnailUrl?: string;
  isActive?: boolean;
}

export interface CreateProductVariantRequest {
  sku: string;
  color?: string;
  size?: string;
  price: number;
  salePrice?: number;
  stockQuantity?: number;
}

export interface UpdateProductVariantRequest {
  sku?: string;
  color?: string;
  size?: string;
  price?: number;
  salePrice?: number;
  stockQuantity?: number;
}

export interface CreateProductImageRequest {
  imageUrl: string;
  sortOrder?: number;
}
