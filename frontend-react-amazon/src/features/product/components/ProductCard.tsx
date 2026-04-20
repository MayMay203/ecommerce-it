import { Link } from 'react-router';
import type { Product } from '../types/product.types';
import { formatPrice, getDisplayPrice } from '../utils/product.utils';
import { useAddToCart } from '@/features/cart/hooks/useAddToCart';

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const { price, salePrice } = getDisplayPrice(product.variants);
  const inStock = product.variants.some((v) => v.stockQuantity > 0);
  const { mutate: addToCart, isPending } = useAddToCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    const firstInStockVariant = product.variants.find((v) => v.stockQuantity > 0);
    if (!firstInStockVariant) return;
    addToCart({ productVariantId: firstInStockVariant.id, quantity: 1 });
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
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
        {salePrice && (
          <span className="absolute top-2 right-2 rounded bg-red-500 px-2 py-0.5 text-xs text-white">
            Sale
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 p-3">
        {product.category && (
          <span className="text-xs text-gray-400">{product.category.name}</span>
        )}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          {salePrice ? (
            <>
              <span className="text-base font-semibold text-red-600">
                {formatPrice(salePrice)}
              </span>
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(price)}
              </span>
            </>
          ) : (
            <span className="text-base font-semibold text-gray-900">
              {price > 0 ? formatPrice(price) : 'Contact for price'}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!inStock || isPending}
          className={`mt-2 w-full rounded py-1.5 text-xs font-semibold transition-colors ${
            inStock
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isPending ? 'Adding…' : inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </Link>
  );
}
