import { useCategories } from '../hooks/useCategories';
import { CategoryList } from '../components/CategoryList';

export default function CategoryListPage() {
  const { data: categories, isLoading, isError } = useCategories();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600">
        Failed to load categories. Please try again.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage product categories and sub-categories.
        </p>
      </div>
      <CategoryList categories={categories ?? []} />
    </div>
  );
}
