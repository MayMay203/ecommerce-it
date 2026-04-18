import type { ProductVariant } from '../types/product.types';

export function getDisplayPrice(variants: ProductVariant[]): {
  price: number;
  salePrice: number | null;
} {
  if (variants.length === 0) return { price: 0, salePrice: null };
  const sorted = [...variants].sort((a, b) => {
    const aEff = a.salePrice ?? a.price;
    const bEff = b.salePrice ?? b.price;
    return aEff - bEff;
  });
  return { price: sorted[0].price, salePrice: sorted[0].salePrice };
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

export function getEffectivePrice(variant: ProductVariant): number {
  return variant.salePrice ?? variant.price;
}

export function buildSlugUrl(slug: string): string {
  return `/products/${slug}`;
}
