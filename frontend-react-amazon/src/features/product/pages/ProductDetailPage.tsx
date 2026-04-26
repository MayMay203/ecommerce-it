import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { useProductDetail } from '../hooks/useProductDetail';
import { ProductImageGallery } from '../components/ProductImageGallery';
import { VariantSelector } from '../components/VariantSelector';
import { formatPrice, getEffectivePrice } from '../utils/product.utils';
import type { ProductVariant } from '../types/product.types';
import { useAddToCart } from '@/features/cart/hooks/useAddToCart';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { ROUTES } from '@/routes/routes';

function ProductDetailSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-10 animate-pulse">
      <div className="w-full md:w-1/2 aspect-square rounded-lg bg-gray-200" />
      <div className="flex-1 space-y-4">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-3/4 bg-gray-200 rounded" />
        <div className="h-6 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } = useProductDetail(slug);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const { mutate: addToCart, isPending } = useAddToCart();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (isLoading) return <ProductDetailSkeleton />;

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-gray-500">Product not found.</p>
        <Link to="/products" className="text-sm text-blue-600 hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  const activeVariant = selectedVariant ?? product.variants[0] ?? null;
  const effectivePrice = activeVariant ? getEffectivePrice(activeVariant) : null;
  const inStock = activeVariant ? activeVariant.stockQuantity > 0 : false;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    if (!activeVariant || !inStock) return;
    addToCart({ productVariantId: activeVariant.id, quantity: 1 });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link to="/products" className="hover:text-gray-900">
          Products
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <span>{product.category.name}</span>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-10">
        {/* Gallery */}
        <div className="w-full md:w-1/2">
          <ProductImageGallery
            images={product.images}
            thumbnailUrl={product.thumbnailUrl}
            productName={product.name}
          />
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col gap-5">
          {product.category && (
            <span className="text-sm text-gray-400">{product.category.name}</span>
          )}

          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

          {/* Price */}
          {effectivePrice !== null && (
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-gray-900">
                {formatPrice(effectivePrice)}
              </span>
              {activeVariant?.salePrice && (
                <span className="text-base text-gray-400 line-through">
                  {formatPrice(activeVariant.price)}
                </span>
              )}
            </div>
          )}

          {/* Variants */}
          {product.variants.length > 0 && (
            <VariantSelector
              variants={product.variants}
              selectedId={activeVariant?.id ?? null}
              onSelect={(v) => setSelectedVariant(v)}
            />
          )}

          {/* Add to cart */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleAddToCart}
              disabled={!inStock || isPending}
              className={`rounded-lg px-6 py-3 text-sm font-semibold transition-colors ${
                inStock
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isPending ? 'Adding…' : inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            {activeVariant && (
              <p className="text-xs text-gray-500 text-center">
                SKU: {activeVariant.sku}
              </p>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="border-t border-gray-100 pt-5">
              <h2 className="mb-2 text-sm font-semibold text-gray-700">Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
