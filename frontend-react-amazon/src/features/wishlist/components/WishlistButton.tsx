import { useNavigate, useLocation } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useAuthStore } from '@/features/auth';
import { useWishlist } from '../hooks/useWishlist';
import { useAddToWishlist } from '../hooks/useAddToWishlist';
import { useRemoveFromWishlist } from '../hooks/useRemoveFromWishlist';

interface Props {
  productId: number;
  className?: string;
}

export function WishlistButton({ productId, className = '' }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: wishlist } = useWishlist();
  const { mutate: addToWishlist, isPending: isAdding } = useAddToWishlist();
  const { mutate: removeFromWishlist, isPending: isRemoving } = useRemoveFromWishlist();

  const isPending = isAdding || isRemoving;
  const isInWishlist =
    wishlist?.items.some((item) => Number(item.productId) === Number(productId)) ?? false;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: location.pathname } });
      return;
    }
    if (isInWishlist) {
      removeFromWishlist(productId);
    } else {
      addToWishlist({ productId }, {
        onError: (err: unknown) => {
          const status = (err as { response?: { status?: number } })?.response?.status;
          if (status === 409) {
            removeFromWishlist(productId);
          }
        },
      });
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`flex items-center justify-center rounded-full p-1.5 transition-colors disabled:opacity-50 ${
        isInWishlist
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-400 hover:text-red-500'
      } ${className}`}
    >
      <svg
        className="h-5 w-5"
        fill={isInWishlist ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
