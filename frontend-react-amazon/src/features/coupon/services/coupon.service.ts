import { api } from '@/shared/lib/axios';
import type { ApplyCouponResponse, Coupon } from '../types/coupon.types';

interface ValidateCouponResponse {
  data: Coupon;
  message: string;
}

interface ApplyCouponApiResponse {
  data: ApplyCouponResponse;
  message: string;
}

export const couponService = {
  validateCoupon: (code: string) =>
    api.post<ValidateCouponResponse>('/coupons/validate', { code }).then((r) => r.data.data),

  applyCoupon: (code: string, subtotal: number) =>
    api.post<ApplyCouponApiResponse>('/coupons/apply', { code, subtotal }).then((r) => r.data.data),
};
