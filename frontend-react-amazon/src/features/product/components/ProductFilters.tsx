import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { Category } from '../types/product.types';

interface Props {
  categories: Category[];
}

export function ProductFilters({ categories }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get('category')
    ? Number(searchParams.get('category'))
    : undefined;
  const minPriceParam = searchParams.get('minPrice') ?? '';
  const maxPriceParam = searchParams.get('maxPrice') ?? '';

  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);

  useEffect(() => {
    setMinPrice(searchParams.get('minPrice') ?? '');
    setMaxPrice(searchParams.get('maxPrice') ?? '');
  }, [searchParams]);

  function setParam(key: string, value: string | undefined) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.delete('page');
      return next;
    });
  }

  function applyPrice() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      minPrice ? next.set('minPrice', minPrice) : next.delete('minPrice');
      maxPrice ? next.set('maxPrice', maxPrice) : next.delete('maxPrice');
      next.delete('page');
      return next;
    });
  }

  function clearAll() {
    setSearchParams({});
    setMinPrice('');
    setMaxPrice('');
  }

  const hasFilters =
    !!selectedCategory || !!minPriceParam || !!maxPriceParam;

  const roots = categories.filter((c) => c.parentId === null || c.parentId === undefined);
  const childrenOf = (id: number) => categories.filter((c) => Number(c.parentId) === Number(id));

  return (
    <aside className="flex flex-col gap-6 w-56 flex-shrink-0">
      {hasFilters && (
        <button
          onClick={clearAll}
          className="text-sm text-blue-600 hover:underline text-left"
        >
          Clear all filters
        </button>
      )}

      {/* Categories */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Category
        </h3>
        <ul className="space-y-1 text-sm">
          <li>
            <button
              onClick={() => setParam('category', undefined)}
              className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 transition-colors ${
                !selectedCategory ? 'font-medium text-blue-600' : 'text-gray-600'
              }`}
            >
              All categories
            </button>
          </li>
          {roots.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => setParam('category', String(Number(cat.id)))}
                className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 transition-colors ${
                  selectedCategory === Number(cat.id)
                    ? 'font-medium text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                {cat.name}
              </button>
              {childrenOf(cat.id).length > 0 && (
                <ul className="ml-3 mt-0.5 space-y-0.5">
                  {childrenOf(cat.id).map((child) => (
                    <li key={child.id}>
                      <button
                        onClick={() => setParam('category', String(Number(child.id)))}
                        className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 transition-colors text-xs ${
                          selectedCategory === Number(child.id)
                            ? 'font-medium text-blue-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {child.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Price (VND)
        </h3>
        <div className="flex flex-col gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <button
            onClick={applyPrice}
            className="rounded bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </aside>
  );
}
