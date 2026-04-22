import { Link } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useCategories } from '@/features/categories/hooks/useCategories';

export function CategoryNav() {
  const { data: categories = [] } = useCategories();
  const topLevel = categories.filter((c) => c.parentId === null).slice(0, 8);

  return (
    <nav className="bg-slate-700 text-white" aria-label="Categories">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 text-sm">
        <Link
          to={ROUTES.PRODUCTS}
          className="shrink-0 rounded border border-transparent px-3 py-1 font-semibold hover:border-white/60"
        >
          All Products
        </Link>
        {topLevel.map((c) => (
          <Link
            key={c.id}
            to={`${ROUTES.PRODUCTS}?category=${c.id}`}
            className="shrink-0 rounded border border-transparent px-3 py-1 hover:border-white/60"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
