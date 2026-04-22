import { useEffect } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useCartStore } from '../stores/cart.store';
import { useCart } from '../hooks/useCart';
import { useRemoveCartItem } from '../hooks/useRemoveCartItem';
import { useUpdateCartItem } from '../hooks/useUpdateCartItem';
import type { CartItem } from '../types/cart.types';

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isCartOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const { data: cart, isLoading } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, closeCart]);

  const items = cart?.items ?? [];
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.variant.price) * item.quantity,
    0,
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Shopping cart"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Shopping Cart ({items.length})
          </h2>
          <button
            onClick={closeCart}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close cart"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
              <svg className="h-16 w-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm">Your cart is empty</p>
              <button onClick={closeCart} className="text-sm text-amber-600 underline">
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t bg-white px-4 py-4">
            <div className="mb-3 flex justify-between text-sm font-medium text-slate-700">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <Link
              to={ROUTES.CHECKOUT}
              onClick={closeCart}
              className="block w-full rounded-lg bg-amber-400 py-2.5 text-center text-sm font-semibold text-slate-900 hover:bg-amber-500"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={closeCart}
              className="mt-2 w-full text-center text-sm text-slate-500 underline hover:text-slate-700"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}

interface CartItemRowProps {
  item: CartItem;
}

function CartItemRow({ item }: CartItemRowProps) {
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem();
  const isPending = isRemoving || isUpdating;

  const { variant } = item;
  const { product } = variant;

  return (
    <li className="flex gap-3 py-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-slate-50">
        {product.thumbnailUrl ? (
          <img src={product.thumbnailUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
        {variant.sku && (
          <p className="text-xs text-slate-500">SKU: {variant.sku}</p>
        )}
        <p className="text-sm font-semibold text-amber-600">${Number(variant.price).toFixed(2)}</p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => item.quantity > 1 && updateItem({ id: item.id, dto: { quantity: item.quantity - 1 } })}
              disabled={isPending || item.quantity <= 1}
              className="flex h-6 w-6 items-center justify-center rounded border text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              −
            </button>
            <span className="w-6 text-center text-sm">{item.quantity}</span>
            <button
              onClick={() => updateItem({ id: item.id, dto: { quantity: item.quantity + 1 } })}
              disabled={isPending}
              className="flex h-6 w-6 items-center justify-center rounded border text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              +
            </button>
          </div>

          <button
            onClick={() => removeItem(item.id)}
            disabled={isPending}
            className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
