import { useSearchParams } from 'react-router';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { ProductFilters } from '../components/ProductFilters';
import { ProductGrid } from '../components/ProductGrid';

const PAGE_SIZE = 12;

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryId = searchParams.get('category')
    ? Number(searchParams.get('category'))
    : undefined;
  const minPrice = searchParams.get('minPrice')
    ? Number(searchParams.get('minPrice'))
    : undefined;
  const maxPrice = searchParams.get('maxPrice')
    ? Number(searchParams.get('maxPrice'))
    : undefined;
  const search = searchParams.get('q') ?? undefined;
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  const { data: products = [], isLoading: productsLoading } = useProducts({
    categoryId,
    minPrice,
    maxPrice,
    search,
  });
  const { data: categories = [] } = useCategories();

  function handlePageChange(p: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(p));
      return next;
    });
  }

  return (
    <div className="flex gap-8">
      <ProductFilters categories={categories} />

      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            {categoryId
              ? (categories.find((c) => c.id === categoryId)?.name ?? 'Products')
              : 'All Products'}
          </h1>
          <span className="text-sm text-gray-500">{products.length} results</span>
        </div>

        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            defaultValue={search}
            onChange={(e) => {
              const val = e.target.value;
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                val ? next.set('q', val) : next.delete('q');
                next.delete('page');
                return next;
              });
            }}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <ProductGrid
          products={products}
          isLoading={productsLoading}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
