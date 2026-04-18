import { Pagination } from '@/shared/components/ui/Pagination';
import type { Product } from '../types/product.types';
import { ProductCard } from './ProductCard';

interface Props {
  products: Product[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
        <div className="h-5 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export function ProductGrid({ products, isLoading, page, pageSize, onPageChange }: Props) {
  const paged = products.slice((page - 1) * pageSize, page * pageSize);

  if (isLoading) {
    return (
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        No products found.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {paged.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Pagination
        page={page}
        pageSize={pageSize}
        total={products.length}
        onPageChange={onPageChange}
      />
    </div>
  );
}
