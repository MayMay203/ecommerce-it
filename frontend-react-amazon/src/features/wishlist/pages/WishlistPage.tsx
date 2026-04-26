import { Link, useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useAddToCart } from '@/features/cart';
import { formatPrice, getDisplayPrice } from '@/features/product';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useWishlist } from '../hooks/useWishlist';
import { useRemoveFromWishlist } from '../hooks/useRemoveFromWishlist';
import { useClearWishlist } from '../hooks/useClearWishlist';
import type { WishlistItem } from '../types/wishlist.types';

export default function WishlistPage() {
  const { data: wishlist, isLoading, isError } = useWishlist();
  const { mutate: clearWishlist, isPending: isClearing } = useClearWishlist();

  const items = wishlist?.items ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-16 text-center text-red-500">
        Failed to load wishlist. Please try again.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Your Wishlist ({items.length})
        </h1>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => clearWishlist()}
            disabled={isClearing}
            className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
          >
            {isClearing ? 'Clearing…' : 'Clear all'}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-gray-400">
          <svg className="h-20 w-20 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <p className="text-lg">Your wishlist is empty</p>
          <Link
            to={ROUTES.PRODUCTS}
            className="rounded-lg bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-500"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <WishlistItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

interface WishlistItemCardProps {
  item: WishlistItem;
}

function WishlistItemCard({ item }: WishlistItemCardProps) {
  const { mutate: removeFromWishlist, isPending: isRemoving } = useRemoveFromWishlist();
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { product } = item;
  const variants = product.variants ?? [];
  const { price, salePrice } = getDisplayPrice(variants);
  const inStock = variants.some((v) => v.stockQuantity > 0);

  function handleAddToCart() {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    const firstInStockVariant = variants.find((v) => v.stockQuantity > 0);
    if (!firstInStockVariant) return;
    addToCart({ productVariantId: firstInStockVariant.id, quantity: 1 });
  }

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <Link
        to={ROUTES.PRODUCT_DETAIL.replace(':slug', product.slug)}
        className="relative aspect-square bg-gray-50 overflow-hidden group"
      >
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-300 text-sm">
            No image
          </div>
        )}
        {!inStock && (
          <span className="absolute top-2 left-2 rounded bg-gray-700 px-2 py-0.5 text-xs text-white">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-col gap-2 p-3 flex-1">
        <Link
          to={ROUTES.PRODUCT_DETAIL.replace(':slug', product.slug)}
          className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-2">
          {salePrice ? (
            <>
              <span className="text-base font-semibold text-red-600">{formatPrice(salePrice)}</span>
              <span className="text-xs text-gray-400 line-through">{formatPrice(price)}</span>
            </>
          ) : (
            <span className="text-base font-semibold text-gray-900">
              {price > 0 ? formatPrice(price) : 'Contact for price'}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock || isAddingToCart}
            className={`w-full rounded py-1.5 text-xs font-semibold transition-colors ${
              inStock
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isAddingToCart ? 'Adding…' : inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>

          <button
            type="button"
            onClick={() => removeFromWishlist(item.productId)}
            disabled={isRemoving}
            className="w-full rounded border border-gray-200 py-1.5 text-xs text-gray-500 hover:border-red-300 hover:text-red-500 disabled:opacity-50 transition-colors"
          >
            {isRemoving ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}
