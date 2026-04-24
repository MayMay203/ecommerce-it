import { useState } from 'react';
import { couponService } from '../services/coupon.service';
import type { AppliedCoupon } from '../types/coupon.types';

interface Props {
  subtotal: number;
  onCouponApplied: (coupon: AppliedCoupon) => void;
  onCouponRemoved: () => void;
  appliedCoupon: AppliedCoupon | null;
}

export function CouponInput({ subtotal, onCouponApplied, onCouponRemoved, appliedCoupon }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    const code = inputValue.trim();
    if (!code) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await couponService.applyCoupon(code, subtotal);
      onCouponApplied({
        code: result.couponCode,
        discount: result.discount,
        type: result.type,
        value: result.value,
      });
      setInputValue('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply coupon');
    } finally {
      setIsLoading(false);
    }
  }

  function handleRemove() {
    onCouponRemoved();
    setError(null);
  }

  if (appliedCoupon) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="text-sm font-semibold text-green-800">{appliedCoupon.code}</span>
              <span className="ml-2 text-sm text-green-700">
                {appliedCoupon.type === 'percent'
                  ? `${appliedCoupon.value}% off`
                  : `-${appliedCoupon.discount.toLocaleString()}₫`}
              </span>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="rounded p-0.5 text-green-600 hover:bg-green-100 hover:text-green-800"
            aria-label="Remove coupon"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder="Enter coupon code"
          disabled={isLoading}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 disabled:bg-slate-50 disabled:text-slate-400"
        />
        <button
          onClick={handleApply}
          disabled={!inputValue.trim() || isLoading}
          className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading && (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          Apply
        </button>
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
