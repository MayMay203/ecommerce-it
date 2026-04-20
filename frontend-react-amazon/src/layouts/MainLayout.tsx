import { Link, Outlet } from 'react-router';
import { useCartStore } from '@/features/cart/stores/cart.store';
import { useAuthStore } from '@/features/auth/stores/auth.store';

function CartIcon({ count }: { count: number }) {
  return (
    <Link to="/cart" className="relative flex items-center gap-1 text-gray-700 hover:text-blue-600">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}

export function MainLayout() {
  const cartCount = useCartStore((s) => s.cartCount);
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="text-xl font-bold text-gray-900 hover:text-blue-600">
            Ecommerce
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/products" className="text-gray-600 hover:text-gray-900">Products</Link>
          </nav>

          <div className="flex items-center gap-4">
            <CartIcon count={cartCount} />
            {isAuthenticated ? (
              <Link to="/profile" className="text-sm text-gray-600 hover:text-gray-900">
                {user?.firstName ?? 'Account'}
              </Link>
            ) : (
              <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Ecommerce
      </footer>
    </div>
  );
}
