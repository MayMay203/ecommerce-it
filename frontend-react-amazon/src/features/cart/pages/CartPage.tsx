import { Link } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useCart } from '../hooks/useCart';
import { useRemoveCartItem } from '../hooks/useRemoveCartItem';
import { useUpdateCartItem } from '../hooks/useUpdateCartItem';

export default function CartPage() {
  const { data: cart, isLoading } = useCart();
  const items = cart?.items ?? [];
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.variant.price) * item.quantity,
    0,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 py-16 text-center">
          <svg className="h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-lg text-gray-500">Your cart is empty</p>
          <Link
            to={ROUTES.PRODUCTS}
            className="mt-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="divide-y">
                {items.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>

          <div className="h-fit rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h2>
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <Link
              to={ROUTES.CHECKOUT}
              className="block w-full rounded-lg bg-blue-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700"
            >
              Proceed to Checkout
            </Link>
            <Link
              to={ROUTES.PRODUCTS}
              className="mt-2 block text-center text-sm text-gray-600 hover:text-gray-900"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

interface CartItemRowProps {
  item: any;
}

function CartItemRow({ item }: CartItemRowProps) {
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem();
  const isPending = isRemoving || isUpdating;

  const { variant } = item;
  const { product } = variant;
  const itemTotal = Number(variant.price) * item.quantity;

  return (
    <div className="flex gap-4 p-4">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-gray-50">
        {product.thumbnailUrl ? (
          <img src={product.thumbnailUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <h3 className="font-medium text-gray-900">{product.name}</h3>
        {variant.sku && <p className="text-xs text-gray-500">SKU: {variant.sku}</p>}
        <p className="text-sm font-semibold text-blue-600">${Number(variant.price).toFixed(2)}</p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => item.quantity > 1 && updateItem({ id: item.id, dto: { quantity: item.quantity - 1 } })}
              disabled={isPending || item.quantity <= 1}
              className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <button
              onClick={() => updateItem({ id: item.id, dto: { quantity: item.quantity + 1 } })}
              disabled={isPending}
              className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            >
              +
            </button>
          </div>
          <span className="font-semibold text-gray-900">${itemTotal.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={() => removeItem(item.id)}
        disabled={isPending}
        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
      >
        Remove
      </button>
    </div>
  );
}
