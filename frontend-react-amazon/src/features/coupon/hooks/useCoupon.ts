import { useState } from 'react';
import { couponService } from '../services/coupon.service';
import type { AppliedCoupon } from '../types/coupon.types';

export function useCoupon() {
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function applyCoupon(code: string, subtotal: number) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await couponService.applyCoupon(code, subtotal);
      setAppliedCoupon({
        code: result.couponCode,
        discount: result.discount,
        type: result.type,
        value: result.value,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply coupon');
      setAppliedCoupon(null);
    } finally {
      setIsLoading(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setError(null);
  }

  return { appliedCoupon, isLoading, error, applyCoupon, removeCoupon };
}
