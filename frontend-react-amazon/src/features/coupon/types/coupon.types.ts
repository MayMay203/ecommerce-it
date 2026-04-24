export type CouponType = 'percent' | 'fixed';

export interface Coupon {
  id: number;
  code: string;
  type: CouponType;
  value: number;
  expiresAt: string | null;
}

export interface ApplyCouponResponse {
  couponCode: string;
  discount: number;
  finalAmount: number;
  type: CouponType;
  value: number;
}

export interface AppliedCoupon {
  code: string;
  discount: number;
  type: CouponType;
  value: number;
}
