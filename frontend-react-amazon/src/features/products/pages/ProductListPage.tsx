import { useCategories } from '@/features/categories/hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { ProductList } from '../components/ProductList';

export default function ProductListPage() {
  const { data: products, isLoading: productsLoading, isError: productsError } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const isLoading = productsLoading || categoriesLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600">
        Failed to load products. Please try again.
      </div>
    );
  }

  const flatCategories = (categories ?? []).flatMap((c) => [c, ...(c.children ?? [])]);

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage product catalog, variants, and images.
        </p>
      </div>
      <ProductList products={products ?? []} categories={flatCategories} />
    </div>
  );
}
