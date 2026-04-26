import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '@/features/cart/hooks/useCart';
import { useCartStore } from '@/features/cart/stores/cart.store';
import { useCheckout } from '@/features/order/hooks/useCheckout';
import { CouponInput } from '@/features/coupon/components/CouponInput';
import type { AppliedCoupon } from '@/features/coupon/types/coupon.types';
import { ROUTES } from '@/routes/routes';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCart();
  const { selectedItems, clearSelection } = useCartStore();
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const checkoutMutation = useCheckout();

  const allItems = cart?.items ?? [];
  const items = allItems.filter((item) => selectedItems.has(item.id));

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.variant.price) * item.quantity,
    0,
  );
  const discount = appliedCoupon?.discount ?? 0;
  const shippingFee = subtotal > 0 ? 10 : 0;
  const total = subtotal - discount + shippingFee;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    setIsPlacingOrder(true);
    try {
      await checkoutMutation.mutateAsync({
        paymentMethod,
        shippingAddressId: undefined,
        selectedItemIds: Array.from(selectedItems),
      });
      clearSelection();
      navigate(ROUTES.ORDERS);
    } catch (error) {
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-slate-500">
        <p className="text-lg">No items selected for checkout.</p>
        <button
          onClick={() => navigate(ROUTES.CART)}
          className="rounded-lg bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-500"
        >
          Back to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-slate-900">Checkout</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: order details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Method */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Payment Method</h2>
            <div className="space-y-3">
              {[
                { id: 'credit_card', label: 'Credit Card' },
                { id: 'debit_card', label: 'Debit Card' },
                { id: 'bank_transfer', label: 'Bank Transfer' },
                { id: 'cash_on_delivery', label: 'Cash on Delivery' },
              ].map((method) => (
                <label key={method.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-slate-700">{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Order Items</h2>
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 py-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-slate-50">
                    {item.variant.product.thumbnailUrl ? (
                      <img
                        src={item.variant.product.thumbnailUrl}
                        alt={item.variant.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {item.variant.product.name}
                      </p>
                      {item.variant.sku && (
                        <p className="text-xs text-slate-500">SKU: {item.variant.sku}</p>
                      )}
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-slate-900">
                      {(Number(item.variant.price) * item.quantity).toLocaleString()}₫
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: order summary */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString()}₫</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-{discount.toLocaleString()}₫</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>{shippingFee.toLocaleString()}₫</span>
              </div>

              <div className="border-t pt-2 flex justify-between font-semibold text-slate-900">
                <span>Total</span>
                <span>{total.toLocaleString()}₫</span>
              </div>
            </div>
          </div>

          {/* Coupon section */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Coupon Code</h2>
            <CouponInput
              subtotal={subtotal}
              appliedCoupon={appliedCoupon}
              onCouponApplied={setAppliedCoupon}
              onCouponRemoved={() => setAppliedCoupon(null)}
            />
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || checkoutMutation.isPending}
            className="w-full rounded-lg bg-amber-400 py-3 text-sm font-semibold text-slate-900 hover:bg-amber-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {isPlacingOrder || checkoutMutation.isPending ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
