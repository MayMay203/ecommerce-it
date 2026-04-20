import type { ProductVariant } from '@/features/product/types/product.types';

export interface CartItem {
  id: number;
  cartId: number;
  productVariantId: number;
  quantity: number;
  variant: ProductVariant & {
    product: {
      id: number;
      name: string;
      slug: string;
      thumbnailUrl: string | null;
    };
  };
}

export interface Cart {
  id: number;
  userId: number | null;
  sessionId: string;
  items: CartItem[];
  createdAt: string;
}

export interface AddCartItemDto {
  productVariantId: number;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}
