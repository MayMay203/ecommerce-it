# Coupon Feature — CONTEXT.md

## Entities
- `coupons` — discount coupons with code, type, value, expiry, and active status

## Fields
| Field | Type | Description |
|-------|------|-------------|
| code | varchar unique | Coupon code (e.g. SAVE10) |
| type | enum(percent, fixed) | Discount type |
| value | decimal | Percent (0-100) or fixed amount |
| expires_at | datetime nullable | Expiry date (null = no expiry) |
| is_active | boolean | Whether coupon is enabled |

## API
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/coupons/validate` | No | Validate coupon code |
| POST | `/coupons/apply` | No | Apply coupon and calculate discount |

## Business Rules
- Validate: code must exist, not expired, is_active = true
- Discount calculation:
  - type=percent: discount = subtotal × value / 100
  - type=fixed: discount = min(value, subtotal)
- finalAmount = subtotal - discount

## Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| COUPON_001 | 404 | Coupon not found |
| COUPON_002 | 400 | Coupon has expired |
| COUPON_003 | 400 | Coupon is not active |

## Dependencies
- Standalone — no cross-feature dependencies
