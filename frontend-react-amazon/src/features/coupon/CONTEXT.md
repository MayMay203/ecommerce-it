# Coupon Feature

## Overview

Coupon feature manages validation and application of promotional codes during checkout. Users can apply discount coupons (percentage or fixed amount) to reduce their order total.

## Components

### CouponInput
- **Path:** `components/CouponInput.tsx`
- **Purpose:** Input field for coupon code with Apply button
- **Features:**
  - Accepts coupon code input (automatically uppercase)
  - Shows loading spinner while applying
  - Displays error messages for invalid/expired coupons
  - Shows applied coupon with remove button
  - Supports Enter key to apply coupon

**Props:**
- `subtotal: number` - Order subtotal to apply discount against
- `onCouponApplied: (coupon: AppliedCoupon) => void` - Callback when coupon successfully applied
- `onCouponRemoved: () => void` - Callback when coupon removed
- `appliedCoupon: AppliedCoupon | null` - Currently applied coupon data

## Hooks

### useCoupon
- **Path:** `hooks/useCoupon.ts`
- **Purpose:** State management hook for coupon application
- **Returns:**
  - `appliedCoupon: AppliedCoupon | null`
  - `isLoading: boolean`
  - `error: string | null`
  - `applyCoupon(code, subtotal): Promise<void>`
  - `removeCoupon(): void`

## Services

### couponService
- **Path:** `services/coupon.service.ts`
- **Methods:**
  - `validateCoupon(code)` → `POST /coupons/validate`
  - `applyCoupon(code, subtotal)` → `POST /coupons/apply`

## Testing Codes (backend seed data)

| Code | Type | Value | Notes |
|------|------|-------|-------|
| `SAVE10` | percent | 10% | Always active |
| `SAVE50K` | fixed | 50,000₫ | Always active |
| `EXPIRED` | percent | 20% | Expired (2020) |
| `INACTIVE` | fixed | 30,000₫ | Inactive |

## Integration

- Used in `CheckoutPage` (checkout feature)
- Order summary displays applied coupon discount line
- Only one coupon per order; fixed discount capped at subtotal
