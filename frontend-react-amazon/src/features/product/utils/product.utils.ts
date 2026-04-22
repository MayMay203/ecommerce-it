import type { Category, ProductVariant } from '../types/product.types';

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

export function getCategoryAndDescendantIds(
  rootId: number,
  categories: Category[],
): Set<number> {
  const childrenByParent = new Map<number, number[]>();
  for (const c of categories) {
    const parentId = c.parentId === null ? null : Number(c.parentId);
    if (parentId === null) continue;
    const list = childrenByParent.get(parentId) ?? [];
    list.push(Number(c.id));
    childrenByParent.set(parentId, list);
  }

  const result = new Set<number>([rootId]);
  const queue = [rootId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const childId of childrenByParent.get(current) ?? []) {
      if (!result.has(childId)) {
        result.add(childId);
        queue.push(childId);
      }
    }
  }
  return result;
}
