import type { Product, ProductVariant, ProductImage } from '@/features/product/types/product.types';

export type WishlistProduct = Omit<Product, 'variants' | 'images'> & {
  variants: ProductVariant[] | undefined;
  images: ProductImage[] | undefined;
};

export interface WishlistItem {
  id: number;
  wishlistId: number;
  productId: number;
  product: WishlistProduct;
  createdAt: string;
}

export interface Wishlist {
  id: number;
  userId: number;
  items: WishlistItem[];
  createdAt: string;
}

export interface AddWishlistItemDto {
  productId: number;
}
