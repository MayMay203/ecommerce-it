import { useNavigate } from 'react-router';
import { useCartStore } from '@/features/cart/stores/cart.store';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { ROUTES } from '@/routes/routes';

export function CartIcon() {
  const cartCount = useCartStore((s) => s.cartCount);
  const openCart = useCartStore((s) => s.openCart);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    openCart();
  };

  return (
    <button
      onClick={handleClick}
      className="group flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 hover:border-white/60"
      aria-label={`Cart with ${cartCount} items`}
    >
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span
          className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-xs font-bold text-slate-900"
          aria-hidden={cartCount === 0}
        >
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      </div>
      <span className="hidden text-sm font-semibold text-white md:inline">Cart</span>
    </button>
  );
}
