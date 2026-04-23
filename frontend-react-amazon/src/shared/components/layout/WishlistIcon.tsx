import { Link } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useWishlistStore } from '@/features/wishlist';

export function WishlistIcon() {
  const wishlistCount = useWishlistStore((s) => s.wishlistCount);

  return (
    <Link
      to={ROUTES.WISHLIST}
      className="group flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 hover:border-white/60"
      aria-label={`Wishlist with ${wishlistCount} items`}
    >
      <div className="relative">
        <svg
          className="h-7 w-7 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        {wishlistCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-xs font-bold text-slate-900">
            {wishlistCount > 99 ? '99+' : wishlistCount}
          </span>
        )}
      </div>
      <span className="hidden text-sm font-semibold text-white md:inline">Wishlist</span>
    </Link>
  );
}
