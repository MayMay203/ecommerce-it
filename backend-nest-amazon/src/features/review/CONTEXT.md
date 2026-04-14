# Review Feature — CONTEXT.md

## Entities
- `reviews` — 3-way link: `user_id` + `product_id` + `order_id` (verified purchase only)

## Business Rules
- User can only review a product if their order contains that product variant
  - Verify via: `order_items` WHERE `order_id = dto.orderId` AND `product_variant.product_id = :productId`
- Only one review per (user, product, order) combination
- User can edit/delete only their own reviews
- Admin can delete any review

## Edge Cases
- Review without verified purchase → 403 REV_002
- Duplicate review → 400 REV_001
- Order not found → 404 ORD_001

## Dependencies
- `AuthModule` — user identity
- `ProductModule` — product existence check
- `OrderModule` — verified-purchase check via order_items
