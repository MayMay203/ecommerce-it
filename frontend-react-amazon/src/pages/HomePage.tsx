import { Link } from 'react-router';
import { useProducts } from '@/features/product/hooks/useProducts';
import { ProductCard } from '@/features/product/components/ProductCard';
import { useCart } from '@/features/cart/hooks/useCart';

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg border border-gray-200 overflow-hidden">
          <div className="aspect-square bg-gray-200" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-1/2 bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { data: products = [], isLoading } = useProducts({});
  // Initialize cart on page load so the badge count is populated
  useCart();

  const featured = products.slice(0, 8);

  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-400 px-8 py-14 text-white">
        <h1 className="text-3xl font-extrabold mb-3">Shop Everything You Need</h1>
        <p className="text-blue-100 mb-6 text-sm max-w-md">
          Discover thousands of products at great prices. Free shipping on orders over 500,000₫.
        </p>
        <Link
          to="/products"
          className="inline-block rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
        >
          Shop Now
        </Link>
      </section>

      {/* Featured products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        {isLoading ? (
          <ProductGridSkeleton />
        ) : featured.length === 0 ? (
          <p className="text-center py-12 text-gray-400 text-sm">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
