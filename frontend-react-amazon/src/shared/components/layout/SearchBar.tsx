import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useCategories } from '@/features/categories/hooks/useCategories';

const ALL_CATEGORIES = 'all';

export function SearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: categories = [] } = useCategories();

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [categoryId, setCategoryId] = useState<string>(
    searchParams.get('category') ?? ALL_CATEGORIES,
  );

  /**
   * TODO (learning contribution):
   * Implement submit behavior. Build a URLSearchParams and navigate to
   * `${ROUTES.PRODUCTS}?<params>`.
   *
   * Decisions to make:
   *  1. If `query` is empty — should we still navigate? Include `q` or drop it?
   *  2. If `categoryId === ALL_CATEGORIES` — drop `category` from URL?
   *  3. When the user searches, should we reset pagination (`page`)?
   *
   * Hints:
   *  - `const params = new URLSearchParams();`
   *  - `params.set('q', query.trim());`
   *  - `navigate(`${ROUTES.PRODUCTS}?${params.toString()}`);`
   */
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Starter stub — navigates without params. Replace with your implementation.
    navigate(ROUTES.PRODUCTS);
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="flex h-10 flex-1 overflow-hidden rounded-md bg-white ring-2 ring-transparent focus-within:ring-amber-400"
    >
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        aria-label="Category"
        className="hidden h-full border-r border-gray-200 bg-gray-100 px-3 text-sm text-gray-700 hover:bg-gray-200 focus:outline-none sm:block"
      >
        <option value={ALL_CATEGORIES}>All</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        aria-label="Search products"
        className="h-full min-w-0 flex-1 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
      />

      <button
        type="submit"
        className="flex h-full items-center justify-center bg-amber-400 px-4 text-slate-900 hover:bg-amber-500"
        aria-label="Submit search"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z"
          />
        </svg>
      </button>
    </form>
  );
}
