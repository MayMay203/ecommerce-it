import type { Category } from '@/features/categories/types/category.types';

export type { Category };

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

export interface ProductFilters {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}
